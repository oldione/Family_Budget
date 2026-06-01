# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running locally

ES modules and fonts require HTTP (not `file://`):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Architecture

This is a **zero-build, single-page vanilla JS app** — no npm, no bundler, no framework. This is intentional — do not migrate to React or add a build step without explicit request.

`app.js` is a plain script (not a module — no `type="module"`). All functions and variables are global.

| File | Role |
|---|---|
| `index.html` | All markup and DOM structure |
| `styles.css` | All styles |
| `app.js` | All application logic (data, rendering, interactions) |
| `firebase-config.js` | Firebase config template — not yet filled in |
| `firestore.rules` | Firestore security rules template — not yet filled in |

## Data model (app.js)

All data lives in JS globals (no persistence yet — Firebase sync is a planned future step).

**`MONTHS`** — keyed by `"YYYY-MM"`, each month has three arrays:
- `income`, `fixed`, `variable` — each entry: `{l, a, cur, by, sub?, note?}`
  - `l`: label, `a`: amount, `cur`: `"RSD"|"EUR"|"USD"`, `by`: `"me"|"her"`, `sub`: subcategory (variable only)

**`PEOPLE`** — two users: `"me"` (Oldione) and `"her"` (Вероника), each with a display name and color.

**`goals`** / **`archived`** — savings goals: `{n, t, s, c}` (name, target, saved, currency).

**`RATES`** — exchange rates fetched from `open.er-api.com` at startup (base: EUR). `base` holds the currently selected display currency (default `RSD`). `filterWho` holds the person filter (`"all"`, `"me"`, `"her"`).

## Subcategories

`SUBS` and `SUBCOL` are dynamic — users can add new subcategories at runtime via `addSubcategory()`. New entries get a color from `SUB_PAL` via `colorForSub()`. Always call `ensureSub(name)` before referencing a subcategory to ensure it exists in both arrays.

## Key rendering functions

- `renderAll()` — re-renders all three category lists + totals
- `renderCat(cat, flashId?)` — renders one category list (`"income"`, `"fixed"`, `"variable"`)
- `totals()` — recalculates summary bar and calls `renderPie()`
- `renderPie()` — donut chart (SVG), togglable by category or by person
- `renderLineChart()` — 6-month income vs expense trend (SVG)
- `renderGoals()` / `renderArchive()` — savings goals with dot-ring progress
- `renderMonthProgress()` — day-of-month progress bar

## Things that are easy to break

**Line chart SVG** — hand-written SVG, no library. The `<svg>` element must not have `preserveAspectRatio="none"` — that stretches the month labels horizontally. Use `viewBox` only and let the browser scale uniformly.

**Pie chart and the person filter** — `renderPie()` respects `filterWho`. `expenseSlices()` filters entries by `it.by` before summing, so the pie always reflects the currently active person filter. Don't bypass `expenseSlices()` when changing how slices are built.

## Currency conversion

`toBase(amount, currency)` converts any amount to the selected `base` currency using `RATES`. The display format is always `fmt(value)` which applies `Intl.NumberFormat` + currency symbol.

## Planned next steps (from README)

- **Step 2**: Connect Firebase Firestore for real-time sync between two users — fill in `firebase-config.js` with real values, set both UIDs in `firestore.rules`, then replace the in-memory `MONTHS`/`goals` globals with Firestore reads/writes in `app.js`.
- **Future**: Receipt scanning via Claude API — must go through a Firebase Cloud Function so the API key never reaches the client. Same applies to exchange rates if they're moved server-side.
