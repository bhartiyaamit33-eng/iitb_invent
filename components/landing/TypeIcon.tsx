type IconName = "paper" | "poster" | "startup" | "demo" | "case";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function TypeIcon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 text-cyan-glow" aria-hidden="true">
      {name === "paper" ? (
        <>
          <path {...stroke} d="M14 8h14l8 8v24H14z" />
          <path {...stroke} d="M28 8v8h8M18 24h12M18 30h12M18 36h8" />
        </>
      ) : null}
      {name === "poster" ? (
        <>
          <path {...stroke} d="M12 12h24v22H12z" />
          <path {...stroke} d="M18 12V8m12 4V8M16 18h16M16 24h10M24 34v6M18 40h12" />
        </>
      ) : null}
      {name === "startup" ? (
        <>
          <path {...stroke} d="M24 8l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" />
          <circle cx="24" cy="24" r="2.2" fill="currentColor" stroke="none" />
        </>
      ) : null}
      {name === "demo" ? (
        <>
          <rect {...stroke} x="8" y="12" width="32" height="20" rx="2" />
          <path {...stroke} d="M16 40h16M24 32v8M20 20l8 4-8 4z" />
        </>
      ) : null}
      {name === "case" ? (
        <>
          <path {...stroke} d="M12 14h24v22H12z" />
          <path {...stroke} d="M18 14V10h12v4M18 24h12M18 30h8" />
        </>
      ) : null}
    </svg>
  );
}
