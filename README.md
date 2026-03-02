# Dyno Rechner – Web-Prototyp

Dieses Projekt ist ein Next.js/TypeScript-Prototyp für den Excel-basierten Altersvorsorgevergleich.

## Was enthalten ist

- **Automatische Input-Erkennung aus Excel**: alle lila Zellen (`FF843DFF`) aus `public/model.xlsx`
- **Zweispaltige UI**: links **Vertrag 1**, rechts **Vertrag 2**
- **Diagramm-Ansicht**: Guthabenverlauf beider Verträge + eingezahlte Beiträge
- **Detailtabellen** je Vertrag (monatlicher Verlauf)
- **Design** mit dunklem Look & **Poppins**-Schrift

## Struktur

- `public/model.xlsx` – Excel-Datei
- `scripts/extract_inputs.py` – extrahiert lila Input-Zellen in JSON
- `app/inputs.schema.json` – generierte Input-Struktur
- `app/page.tsx` – Formular, Diagramm, Detailtabellen

## Lokaler Start

```bash
npm install
npm run extract-inputs
npm run dev
```

Dann öffnen: `http://localhost:3000`

## Inputs neu erzeugen (nach Excel-Änderung)

```bash
npm run extract-inputs
```

## Deployment auf Vercel

1. Repository nach GitHub pushen
2. Auf vercel.com neues Projekt importieren
3. Framework wird als Next.js erkannt
4. Deploy auslösen

Wichtig bei Excel-Updates:

1. `public/model.xlsx` aktualisieren
2. `npm run extract-inputs` ausführen
3. `app/inputs.schema.json` mit committen
