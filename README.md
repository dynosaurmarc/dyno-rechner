# Dyno Rechner – Web Prototype / Web-Prototyp

Dieses Repository enthält einen Next.js/TypeScript-Prototyp für den Excel-basierten Altersvorsorgevergleich.

This repository contains a Next.js/TypeScript prototype for an Excel-based pension comparison.

## Features

- Reads the Excel model from `public/model.xlsx`
- Extracts all purple input cells with color `FF843DFF`
- Writes extracted inputs to `app/inputs.schema.json`
- Renders editable inputs in a two-column UI (Vertrag 1 / Vertrag 2)
- Shows comparison chart and detailed balance tables

## Struktur / Structure

- `public/model.xlsx` – Excel file
- `scripts/extract_inputs.py` – extraction script for purple input cells
- `app/inputs.schema.json` – generated input schema
- `app/page.tsx` – UI (form, chart, detail tables)

## Lokal starten / Run locally

```bash
npm install
npm run extract-inputs
npm run dev
```

Open: `http://localhost:3000`

## Inputs neu erzeugen / Regenerate inputs

```bash
npm run extract-inputs
```

This updates `app/inputs.schema.json`.

## Deployment auf Vercel / Deploy to Vercel

1. Push repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. **Add New... → Project**
4. Import repository
5. Keep defaults (Next.js auto-detected)
6. Deploy

## Wichtig / Important

Bei Änderungen an der Excel-Datei immer gemeinsam committen / Always commit together:

- `public/model.xlsx`
- `app/inputs.schema.json`

## Merge-Konflikte schnell prüfen

Vor einem Push kann folgender Check ausgeführt werden:

```bash
npm run check-conflicts
```

Damit werden Konfliktmarker (`<<<<<<<`, `=======`, `>>>>>>>`) in den relevanten Projektdateien gesucht.

