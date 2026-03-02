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
  gain: number;
};

type ProjectionResult = {
  rows: ProjectionRow[];
  yearly: { year: number; capital: number; paidIn: number }[];
};

const data = schema as InputSchema;

const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

function cellColumnIndex(cell: string): number {
  const match = cell.match(/^([A-Z]+)/);
  if (!match) return 0;
  return match[1].split('').reduce((acc, c) => acc * 26 + (c.charCodeAt(0) - 64), 0);
}

function toNumber(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function project(monthlyContribution: number, annualReturnPct: number, annualFeePct: number, years: number): ProjectionResult {
  const monthlyReturn = annualReturnPct / 100 / 12;
  const monthlyFee = annualFeePct / 100 / 12;
  const rows: ProjectionRow[] = [];
  let capital = 0;
  let paidIn = 0;

  for (let month = 1; month <= years * 12; month += 1) {
    paidIn += monthlyContribution;
    const cost = capital * monthlyFee;
    capital = (capital - cost + monthlyContribution) * (1 + monthlyReturn);
    rows.push({
      month,
      year: Math.floor((month - 1) / 12),
      capital,
      paidIn,
      monthlyCost: cost,
      gain: capital - paidIn,
    });
  }

  const yearly = rows.filter((row) => row.month % 12 === 0).map((row) => ({ year: row.month / 12, capital: row.capital, paidIn: row.paidIn }));
  return { rows, yearly };
}

function LineChart({ seriesA, seriesB, paidIn }: { seriesA: number[]; seriesB: number[]; paidIn: number[] }) {
  const width = 680;
  const height = 300;
  const pad = 30;
  const max = Math.max(...seriesA, ...seriesB, ...paidIn, 1);

  const toPath = (values: number[]) => {
    return values
      .map((v, i) => {
        const x = pad + (i * (width - 2 * pad)) / Math.max(values.length - 1, 1);
        const y = height - pad - (v / max) * (height - 2 * pad);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart" role="img" aria-label="Guthabenvergleich">
      <path d={toPath(seriesA)} className="line lineA" />
      <path d={toPath(seriesB)} className="line lineB" />
      <path d={toPath(paidIn)} className="line lineC" />
    </svg>
  );
}

export default function HomePage() {
  const initial = useMemo(() => Object.fromEntries(data.inputs.map((input) => [input.id, input.value])), []);
  const [values, setValues] = useState<Record<string, string>>(initial);

  const grouped = useMemo(() => {
    const left: InputField[] = [];
    const right: InputField[] = [];
    for (const input of data.inputs) {
      if (cellColumnIndex(input.cell) <= 10) left.push(input);
      else right.push(input);
    }
    return { left, right };
  }, []);

  const leftMonthly = toNumber(values[grouped.left.find((f) => f.cell === 'E6')?.id ?? grouped.left[0]?.id ?? '']) || 338;
  const rightMonthly = toNumber(values[grouped.right.find((f) => f.cell === 'L6')?.id ?? grouped.right[0]?.id ?? '']) || 338;
  const years = 27;

  const leftProjection = project(leftMonthly, 7, 0.69, years);
  const rightProjection = project(rightMonthly, 6.2, 2.69, years);

  return (
    <main>
      <section className="hero">
        <h1>Altersvorsorgerechner</h1>
        <p>Alle lila markierten Felder aus der Excel stehen als Eingaben zur Verfügung.</p>
      </section>

      <section className="twoCol">
        <article className="panel">
          <h2>Vertrag 1</h2>
          {grouped.left.map((input) => (
            <label key={input.id} className="field">
              <span>{input.id}</span>
              <input
                value={values[input.id] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [input.id]: e.target.value }))}
              />
              <small>{input.sheet} · {input.cell}</small>
            </label>
          ))}
        </article>

        <article className="panel">
          <h2>Vertrag 2</h2>
          {grouped.right.map((input) => (
            <label key={input.id} className="field">
              <span>{input.id}</span>
              <input
                value={values[input.id] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [input.id]: e.target.value }))}
              />
              <small>{input.sheet} · {input.cell}</small>
            </label>
          ))}
        </article>
      </section>

      <section className="panel results">
        <h2>Kapital nach {years} Jahren</h2>
        <LineChart
          seriesA={leftProjection.yearly.map((y) => y.capital)}
          seriesB={rightProjection.yearly.map((y) => y.capital)}
          paidIn={leftProjection.yearly.map((y) => y.paidIn)}
        />
        <div className="legend">
          <span><i className="dot a" /> Guthaben mit DYNO</span>
          <span><i className="dot b" /> Guthaben mit Makler</span>
          <span><i className="dot c" /> Eingezahlt</span>
        </div>
      </section>

      <section className="twoCol">
        <article className="panel tableWrap">
          <h3>Modell 1 – Guthabenverlauf</h3>
          <table>
            <thead><tr><th>Jahr</th><th>Monat</th><th>Guthaben</th><th>Mtl. Kosten</th><th>Eingezahlt</th></tr></thead>
            <tbody>
              {leftProjection.rows.filter((r) => r.month <= 120).map((r) => (
                <tr key={`l-${r.month}`}>
                  <td>{r.year}</td><td>{r.month}</td><td>{eur.format(r.capital)}</td><td>{eur.format(r.monthlyCost)}</td><td>{eur.format(r.paidIn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="panel tableWrap">
          <h3>Modell 2 – Guthabenverlauf</h3>
          <table>
            <thead><tr><th>Jahr</th><th>Monat</th><th>Guthaben</th><th>Mtl. Kosten</th><th>Eingezahlt</th></tr></thead>
            <tbody>
              {rightProjection.rows.filter((r) => r.month <= 120).map((r) => (
                <tr key={`r-${r.month}`}>
                  <td>{r.year}</td><td>{r.month}</td><td>{eur.format(r.capital)}</td><td>{eur.format(r.monthlyCost)}</td><td>{eur.format(r.paidIn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>

      <footer>
        Quelle: {data.sourceFile} · Extrahiert: {data.extractedAt} · Farbfilter: {data.fillColor}
      </footer>
    </main>
  );
}
