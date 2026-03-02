'use client';

import { useMemo, useState } from 'react';
import schema from './inputs.schema.json';

type InputField = {
  id: string;
  sheet: string;
  cell: string;
  value: string;
};

type InputSchema = {
  sourceFile: string;
  extractedAt: string;
  fillColor: string;
  inputs: InputField[];
};

type ProjectionRow = {
  month: number;
  year: number;
  capital: number;
  paidIn: number;
  monthlyCost: number;
};

const data = schema as InputSchema;
const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

function colIndex(cell: string): number {
  const letters = (cell.match(/^([A-Z]+)/)?.[1] ?? 'A').split('');
  return letters.reduce((sum, c) => sum * 26 + c.charCodeAt(0) - 64, 0);
}

function parseNumber(input: string): number {
  const normalized = input.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function project(monthly: number, annualReturn: number, annualFee: number, years: number): ProjectionRow[] {
  const rows: ProjectionRow[] = [];
  const r = annualReturn / 100 / 12;
  const fee = annualFee / 100 / 12;
  let capital = 0;
  let paidIn = 0;

  for (let month = 1; month <= years * 12; month += 1) {
    paidIn += monthly;
    const monthlyCost = capital * fee;
    capital = (capital - monthlyCost + monthly) * (1 + r);
    rows.push({ month, year: Math.floor((month - 1) / 12), capital, paidIn, monthlyCost });
  }

  return rows;
}

function LineChart({ dyno, makler, paidIn }: { dyno: number[]; makler: number[]; paidIn: number[] }) {
  const width = 900;
  const height = 320;
  const pad = 30;
  const max = Math.max(...dyno, ...makler, ...paidIn, 1);

  const path = (series: number[]) =>
    series
      .map((v, i) => {
        const x = pad + (i * (width - 2 * pad)) / Math.max(series.length - 1, 1);
        const y = height - pad - (v / max) * (height - 2 * pad);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart" aria-label="Vergleichsgrafik">
      <path d={path(dyno)} className="line dyno" />
      <path d={path(makler)} className="line makler" />
      <path d={path(paidIn)} className="line paid" />
    </svg>
  );
}

export default function HomePage() {
  const defaults = useMemo(() => Object.fromEntries(data.inputs.map((i) => [i.id, i.value])), []);
  const [values, setValues] = useState<Record<string, string>>(defaults);

  const grouped = useMemo(() => {
    const left: InputField[] = [];
    const right: InputField[] = [];
    for (const input of data.inputs) {
      if (colIndex(input.cell) <= 11) left.push(input);
      else right.push(input);
    }
    return { left, right };
  }, []);

  const leftMonthly = parseNumber(values[grouped.left.find((x) => x.cell === 'E6')?.id ?? grouped.left[0]?.id ?? '']) || 338;
  const rightMonthly = parseNumber(values[grouped.right.find((x) => x.cell === 'L6')?.id ?? grouped.right[0]?.id ?? '']) || 338;
  const years = 27;

  const dynoRows = project(leftMonthly, 7, 0.69, years);
  const maklerRows = project(rightMonthly, 6.2, 2.69, years);
  const dynoYearly = dynoRows.filter((r) => r.month % 12 === 0);
  const maklerYearly = maklerRows.filter((r) => r.month % 12 === 0);

  return (
    <main>
      <header className="hero">
        <h1>Altersvorsorgerechner</h1>
        <p>Alle lila Felder aus Excel sind als Inputs verfügbar – links Vertrag 1, rechts Vertrag 2.</p>
      </header>

      <section className="grid2">
        <article className="card">
          <h2>Vertrag 1</h2>
          {grouped.left.map((input) => (
            <label key={input.id} className="field">
              <span>{input.id}</span>
              <input value={values[input.id] ?? ''} onChange={(e) => setValues((s) => ({ ...s, [input.id]: e.target.value }))} />
              <small>{input.sheet} · {input.cell}</small>
            </label>
          ))}
        </article>

        <article className="card">
          <h2>Vertrag 2</h2>
          {grouped.right.map((input) => (
            <label key={input.id} className="field">
              <span>{input.id}</span>
              <input value={values[input.id] ?? ''} onChange={(e) => setValues((s) => ({ ...s, [input.id]: e.target.value }))} />
              <small>{input.sheet} · {input.cell}</small>
            </label>
          ))}
        </article>
      </section>

      <section className="card">
        <h2>Kapital nach {years} Jahren</h2>
        <LineChart dyno={dynoYearly.map((r) => r.capital)} makler={maklerYearly.map((r) => r.capital)} paidIn={dynoYearly.map((r) => r.paidIn)} />
        <div className="legend">
          <span><i className="dot dyno" />Guthaben mit DYNO</span>
          <span><i className="dot makler" />Guthaben mit Makler</span>
          <span><i className="dot paid" />Eingezahlt</span>
        </div>
      </section>

      <section className="grid2">
        <article className="card tableWrap">
          <h3>Modell 1 – Guthabenverlauf</h3>
          <table>
            <thead><tr><th>Jahr</th><th>Monat</th><th>Guthaben</th><th>Mtl. Kosten</th><th>Eingezahlt</th></tr></thead>
            <tbody>
              {dynoRows.slice(0, 120).map((r) => (
                <tr key={`d-${r.month}`}><td>{r.year}</td><td>{r.month}</td><td>{eur.format(r.capital)}</td><td>{eur.format(r.monthlyCost)}</td><td>{eur.format(r.paidIn)}</td></tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card tableWrap">
          <h3>Modell 2 – Guthabenverlauf</h3>
          <table>
            <thead><tr><th>Jahr</th><th>Monat</th><th>Guthaben</th><th>Mtl. Kosten</th><th>Eingezahlt</th></tr></thead>
            <tbody>
              {maklerRows.slice(0, 120).map((r) => (
                <tr key={`m-${r.month}`}><td>{r.year}</td><td>{r.month}</td><td>{eur.format(r.capital)}</td><td>{eur.format(r.monthlyCost)}</td><td>{eur.format(r.paidIn)}</td></tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>

      <footer>Quelle: {data.sourceFile} · Extrahiert: {data.extractedAt} · Farbfilter: {data.fillColor}</footer>
    </main>
  );
}
