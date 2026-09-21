import { PIPELINE } from "@/lib/site";

export function Pipeline() {
  return (
    <ol className="pipeline" aria-label="From campus to company">
      {PIPELINE.map((step, i) => (
        <li key={step}>
          <span>{step}</span>
          {i < PIPELINE.length - 1 ? (
            <span className="pipeline-arrow" aria-hidden="true">
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
