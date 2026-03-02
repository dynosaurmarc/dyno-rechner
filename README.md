# Dyno Rechner – Web-Prototyp

Dieses Repository enthält einen Next.js/TypeScript-Prototyp für den Excel-basierten Altersvorsorgevergleich.

## Was der Prototyp aktuell macht

- Liest das Excel-Modell aus `public/model.xlsx`
- Extrahiert alle lila Zellen mit Farbcode `FF843DFF`
- Schreibt die Input-Definitionen nach `app/inputs.schema.json`
- Rendert alle gefundenen Inputs in der UI (links Vertrag 1, rechts Vertrag 2)
- Zeigt Vergleichsgrafik und Detailtabellen zum Guthabenverlauf

## Projektstruktur

- `public/model.xlsx` – Excel-Datei
- `scripts/extract_inputs.py` – extrahiert lila Input-Zellen
- `app/inputs.schema.json` – generierte Input-Struktur
- `app/page.tsx` – UI mit Formular, Chart und Tabellen

## Lokal starten

```bash
npm install
npm run extract-inputs
npm run dev
```

Danach im Browser öffnen: `http://localhost:3000`

## Inputs nach Excel-Änderungen neu erzeugen

Immer wenn `public/model.xlsx` geändert wurde:

```bash
npm run extract-inputs
```

Dadurch wird `app/inputs.schema.json` aktualisiert.

## Deployment auf Vercel

1. Repository nach GitHub pushen
2. Auf [vercel.com](https://vercel.com) anmelden
3. **Add New... → Project** auswählen
4. Repository importieren
5. Standard-Einstellungen beibehalten (Next.js wird erkannt)
6. **Deploy** starten

## Wichtig für Updates

Bei Änderungen an der Excel-Datei immer gemeinsam committen:

- `public/model.xlsx`
- `app/inputs.schema.json`
