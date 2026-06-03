const { onRequest } = require("firebase-functions/v2/https");
const https = require("https");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.claudeChat = onRequest({ region: "europe-west1", invoker: "public" }, (req, res) => {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) { res.status(500).json({ error: "CLAUDE_API_KEY not set" }); return; }

  const { message, image, imageType, subs, base, history, context } = req.body || {};
  if (!message && !image) { res.status(400).json({ error: "message or image required" }); return; }

  const subsStr = (subs || []).join(", ") || "Продукты, Кафе, Транспорт, Авто, Развлечения, Дом, Здоровье, Прочее";
  const baseCur = base || "RSD";

  const contextStr = context ? `\nТекущие данные месяца:\n${JSON.stringify(context, null, 1)}` : "";

  const system = `Ты — ассистент семейного бюджета. Пользователь общается по-русски.

У тебя два режима ответа:

**РЕЖИМ 1 — ДОБАВЛЕНИЕ** (пользователь описывает траты/доходы):
Верни ТОЛЬКО JSON-массив без пояснений:
[{"l":"название","a":число,"cur":"RSD"|"EUR"|"USD","cat":"income"|"fixed"|"variable","sub":"подкатегория"}]

**РЕЖИМ 2 — ВОПРОС / РЕДАКТИРОВАНИЕ** (вопрос, просьба исправить, объяснение):
Верни JSON-объект:
{"text":"ответ пользователю","edits":[{"l":"название позиции","sub":"новая подкатегория","cat":"новая категория"}]}
edits — опционально, только если нужно что-то изменить.

Правила категорий:
- income: зарплата, аванс, доход, фриланс
- fixed: аренда, кредит, подписка, коммуналка
- variable: всё остальное

Подкатегории для variable: ${subsStr}
Если не подходит ни одна — придумай короткое название (1-2 слова, с заглавной буквы).
Валюта: €/евро→EUR, $→USD, иначе→${baseCur}.
На чеке: каждую позицию отдельно, итог не включай.
${contextStr}`;

  // Build conversation history
  const messages = [];
  if (history && Array.isArray(history)) {
    history.forEach(function(m) { messages.push({ role: m.role, content: m.content }); });
  }

  // Current user message
  let userContent;
  if (image) {
    userContent = [
      { type: "image", source: { type: "base64", media_type: imageType || "image/jpeg", data: image } },
      { type: "text", text: message || "Это чек. Разбери все позиции и суммы." }
    ];
  } else {
    userContent = message;
  }
  messages.push({ role: "user", content: userContent });

  const body = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system,
    messages,
  });

  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = "";
    apiRes.on("data", (chunk) => (data += chunk));
    apiRes.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        const text = parsed.content?.[0]?.text || "";
        const clean = text.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
        const json = JSON.parse(clean);
        if (Array.isArray(json)) {
          res.json({ items: json, assistantText: clean });
        } else if (json.text !== undefined) {
          res.json({ reply: json.text, edits: json.edits || [] });
        } else {
          res.json({ items: [], reply: "Не понял запрос." });
        }
      } catch (e) {
        res.status(500).json({ error: "parse_error", raw: data });
      }
    });
  });

  apiReq.on("error", (e) => res.status(500).json({ error: e.message }));
  apiReq.write(body);
  apiReq.end();
});
