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

