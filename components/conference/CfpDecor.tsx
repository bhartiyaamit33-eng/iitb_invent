/** Background grid, orbits, and particles for the CFP page. Decorative only. */

const PARTICLES = [
  { t: "8%", l: "6%", s: 5 },
  { t: "14%", l: "92%", s: 7 },
  { t: "22%", l: "18%", s: 4 },
  { t: "28%", l: "78%", s: 6 },
  { t: "36%", l: "4%", s: 4 },
  { t: "44%", l: "96%", s: 5 },
  { t: "52%", l: "12%", s: 6 },
  { t: "58%", l: "88%", s: 4 },
  { t: "66%", l: "8%", s: 8 },
  { t: "72%", l: "94%", s: 5 },
  { t: "80%", l: "16%", s: 4 },
  { t: "86%", l: "84%", s: 6 },
  { t: "18%", l: "48%", s: 4 },
  { t: "62%", l: "52%", s: 5 },
  { t: "91%", l: "42%", s: 4 },
] as const;

export function CfpDecor() {
  return (
    <div className="cfp-decor" aria-hidden="true">
      <div className="cfp-grid" />
      <div className="cfp-orbits">
        <span className="o1" />
        <span className="o2" />
        <span className="o3" />
        <span className="o4" />
      </div>
      <div className="cfp-particles">
        {PARTICLES.map((p, i) => (
          <i
            key={i}
            style={{
              top: p.t,
              left: p.l,
              width: p.s,
              height: p.s,
            }}
          />
        ))}
      </div>
    </div>
  );
}
