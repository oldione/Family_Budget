# Семейный бюджет

Совместный учёт на двоих: доходы, обязательные и переменные расходы (с подкатегориями), цели накопления кольцами, разбивка расходов пирогом, тренд по месяцам, мультивалютность (RSD/EUR/USD) с авто-курсом, точки авторства и фильтр сводки по человеку.

## Файлы
```
index.html          — разметка
styles.css          — стили
app.js              — логика
firebase-config.js  — конфиг Firebase (для шага синхронизации)
firestore.rules     — правила доступа
```

## Запуск локально
ES-функции и шрифты требуют http (не открывай через file://):
```bash
python3 -m http.server 8000
# открой http://localhost:8000
```

## Шаг 1 — выложить на GitHub Pages
```bash
git init
git add .
git commit -m "family budget"
git branch -M main
git remote add origin https://github.com/ТВОЙ-ЛОГИН/family-budget.git
git push -u origin main
```
Затем: репозиторий → **Settings → Pages → Source: main / root → Save**.
Через минуту сайт будет на `https://ТВОЙ-ЛОГИН.github.io/family-budget/`.

> На этом этапе приложение уже работает, но данные живут только в браузере
> и не сохраняются между сессиями и устройствами. Синхронизация — шаг 2.

## Шаг 2 — Firebase (сохранение и синхронизация на двоих)
Это «гугл»-часть: общая база, вход через Google, живое обновление у обоих.

1. **Создать проект:** https://console.firebase.google.com → Add project.
2. **Вход:** Build → Authentication → Get started → Sign-in method → **Google** → Enable.
3. **База:** Build → Firestore Database → Create database → Production mode, регион `europe-west`.
4. **Конфиг:** Project settings → Your apps → Web (`</>`) → скопировать `firebaseConfig`
   в `firebase-config.js`; там же задать общий `HOUSEHOLD_ID` (одинаковый у обоих).
5. **Домены:** Authentication → Settings → Authorized domains → добавить
   `ТВОЙ-ЛОГИН.github.io` и `localhost`.
6. **Правила:** войдёте оба, скопируете свои UID (приложение их покажет),
   вставите в `firestore.rules`, затем Firestore → Rules → вставить → Publish.

После создания проекта останется подключить приложение к Firestore
(замена локальных данных на общую базу с живой синхронизацией) — это
делается в `app.js` и я помогу на этом шаге, когда проект будет готов.

## На будущее
- Распознавание чеков через Claude (серверная функция Firebase прячет ключ).
- Авто-курс уже работает на клиенте; при желании тоже можно увести в функцию.
