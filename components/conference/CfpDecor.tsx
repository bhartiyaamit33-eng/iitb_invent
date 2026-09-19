/** Background grid, orbits, and particles for the CFP page. Decorative only. */

type Particle = {
  t: string;
  l?: string;
  r?: string;
  s: number;
  o?: number;
};

/** Kept in the page gutters and hero negative space so they do not sit on copy. */
const PARTICLES: Particle[] = [
  { t: "3.2%", l: "4%", s: 6, o: 0.7 },
  { t: "5.8%", r: "6%", s: 8, o: 0.65 },
  { t: "8.4%", l: "11%", s: 4, o: 0.55 },
  { t: "11%", r: "12%", s: 5, o: 0.6 },
  { t: "14.5%", l: "3%", s: 7, o: 0.7 },
  { t: "18%", r: "4.5%", s: 4, o: 0.5 },
  { t: "24%", l: "5.5%", s: 5, o: 0.6 },
  { t: "31%", r: "5%", s: 6, o: 0.55 },
  { t: "38%", l: "3.5%", s: 4, o: 0.5 },
  { t: "45%", r: "7%", s: 8, o: 0.65 },
  { t: "53%", l: "6%", s: 5, o: 0.55 },
  { t: "61%", r: "4%", s: 4, o: 0.5 },
  { t: "69%", l: "4.5%", s: 6, o: 0.6 },
  { t: "77%", r: "6.5%", s: 5, o: 0.55 },
  { t: "85%", l: "7%", s: 4, o: 0.5 },
  { t: "92%", r: "8%", s: 7, o: 0.6 },
  { t: "7.2%", l: "22%", s: 4, o: 0.4 },
  { t: "9.6%", r: "24%", s: 4, o: 0.4 },
];

export function CfpDecor() {
  return (
    <div className="cfp-decor" aria-hidden="true">
      <div className="cfp-grid" />
      <div className="cfp-orbits">
        <span className="o1" />
        <span className="o2" />
        <span className="o3" />
        <span className="o4" />
        <span className="o5" />
        <span className="o6" />
      </div>
      <div className="cfp-particles">
        {PARTICLES.map((p, i) => (
          <i
            key={i}
            style={{
              top: p.t,
              left: p.l,
              right: p.r,
              width: p.s,
              height: p.s,
              opacity: p.o ?? 0.6,
            }}
          />
        ))}
      </div>
    </div>
  );
}
