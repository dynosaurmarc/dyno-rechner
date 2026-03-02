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

const data = schema as InputSchema;

export default function HomePage() {
  return (
    <main>
      <h1>Excel Inputs Preview</h1>
      <p>
        Source: <strong>{data.sourceFile}</strong> • Extracted: <strong>{data.extractedAt}</strong>
      </p>
      <p>
        Highlight color filter: <code>{data.fillColor}</code>
      </p>

      <form>
        {data.inputs.map((input) => (
          <fieldset key={input.id}>
            <label htmlFor={input.id}>{input.id}</label>
            <input
              id={input.id}
              name={input.id}
              type="text"
              defaultValue={input.value}
              aria-describedby={`${input.id}-meta`}
            />
            <small id={`${input.id}-meta`}>
              Sheet: {input.sheet} • Cell: {input.cell}
            </small>
          </fieldset>
        ))}
      </form>
    </main>
  );
}
