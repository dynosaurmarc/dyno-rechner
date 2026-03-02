# Dyno Rechner – Input Extraction Prototype

This repository contains a minimal Next.js (TypeScript) app that displays all purple input cells from `model.xlsx` as a web form.

## What this prototype does

- Reads the Excel model from `public/model.xlsx`
- Extracts cells with fill color `FF843DFF` (purple)
- Writes extracted metadata to `app/inputs.schema.json`
- Renders all extracted inputs in a basic UI (sheet + cell + current value)

> No calculation logic is implemented yet. This prototype only validates extraction and rendering.

---

## Run locally

1. Install Node.js 18+ and Python 3.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Regenerate extracted inputs from Excel:
   ```bash
   npm run extract-inputs
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`.

---

## Regenerate inputs after Excel changes

Whenever `public/model.xlsx` changes, run:

```bash
npm run extract-inputs
```

This updates `app/inputs.schema.json`.

---

## Deploy on Vercel (non-developer friendly)

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and sign in.
3. Click **Add New... → Project**.
4. Import your GitHub repository.
5. Keep default settings (Next.js is auto-detected).
6. Click **Deploy**.

After deployment, Vercel gives you a public URL.

### Important for updates

- If `public/model.xlsx` changes, run `npm run extract-inputs` locally.
- Commit both updated files:
  - `public/model.xlsx`
  - `app/inputs.schema.json`
- Push to GitHub so Vercel redeploys with the new extracted inputs.

## Welche Logik wurde aus der Excel übernommen?

Aktuell ist **noch keine 1:1-Formel-Engine** der Excel eingebaut. Übernommen wurde:

1. **Input-Erkennung**: Alle lila Zellen (`FF843DFF`) werden aus `public/model.xlsx` extrahiert.
2. **Input-Werte als Startwerte**: Diese Werte werden direkt im UI vorbelegt.
3. **Zwei-Vertrag-Aufteilung**: Inputs werden über die Spaltenposition in links/rechts (Vertrag 1/2) gruppiert.
4. **Vergleichsprojektion**: Für die Visualisierung wird eine transparente, einfache Monatsprojektion genutzt (Beitrag, Rendite, Kosten).
5. **Diagramm + Detailtabellen**: Verlauf je Tarif wird als Liniengrafik und als Monatstabelle angezeigt.

> Hinweis: Die genaue Excel-Berechnungslogik (alle Original-Formeln, Sonderfälle, Rundungen, Blattverweise) ist als nächster Schritt einzuarbeiten.


## Why conflicts keep happening (and how to reduce them)

Conflicts happen because `main` and your feature branch both modify the **same files and same lines** (`README.md`, `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/inputs.schema.json`). Git can only auto-merge when line ranges do not overlap.

To reduce conflicts:

1. Click **Update branch** before continuing work.
2. Keep only one UI variant in the branch (not switching between minimal and styled versions).
3. Regenerate `app/inputs.schema.json` only when `public/model.xlsx` actually changed.
4. If conflicts appear, keep one side consistently for these files and remove all markers (`<<<<<<<`, `=======`, `>>>>>>>`).

The extractor now preserves `extractedAt` when inputs did not change, so schema churn is reduced.
