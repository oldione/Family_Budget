const { onRequest } = require("firebase-functions/v2/https");
const https = require("https");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.claudeChat = onRequest({ region: "europe-west1", invoker: "public" }, (req, res) => {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.set(k, v));

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "CLAUDE_API_KEY not set" });
    return;
  }

  const { message, image, imageType, subs, base } = req.body || {};
  if (!message && !image) {
    res.status(400).json({ error: "message or image required" });
    return;
  }

  const subsStr = (subs || []).join(", ") || "Еда, Транспорт, Авто, Развлечения, Дом, Здоровье, Прочее";
  const baseCur = base || "RSD";

  const system = `Ты — ассистент семейного бюджета. Пользователь пишет по-русски о тратах или доходах, или прикрепляет фото чека.
Верни ТОЛЬКО валидный JSON-массив, без пояснений, без markdown:
[{"l":"название","a":число,"cur":"RSD"|"EUR"|"USD","cat":"income"|"fixed"|"variable","sub":"подкатегория"}]

Правила категорий:
- income: зарплата, аванс, премия, фриланс, доход, перевод, подработка
- fixed: аренда, ипотека, кредит, связь, интернет, подписка, страховка, коммуналка, абонемент
- variable: всё остальное (покупки, еда, транспорт, развлечения и т.д.)

Доступные подкатегории для variable: ${subsStr}
Если ни одна не подходит — используй "Прочее".

Валюта: если явно указаны евро/€ → EUR, доллар/$→ USD, иначе → ${baseCur}.
Если несколько позиций — верни несколько объектов. Числа без пробелов и символов валют. Название — с заглавной буквы.
На чеке: каждую позицию как отдельный объект, итоговую сумму не включай.`;

  // Build user content — text only or image + text
  let userContent;
  if (image) {
    userContent = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: imageType || "image/jpeg",
          data: image,
        },
      },
      {
        type: "text",
        text: message || "Это чек. Разбери все позиции и суммы, верни JSON.",
      },
    ];
  } else {
    userContent = message;
  }

  const body = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: userContent }],
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
        const items = JSON.parse(clean);
        if (!Array.isArray(items)) throw new Error("not array");
        res.json({ items });
      } catch (e) {
        res.status(500).json({ error: "parse_error", raw: data });
      }
    });
  });

  apiReq.on("error", (e) => res.status(500).json({ error: e.message }));
  apiReq.write(body);
  apiReq.end();
});
