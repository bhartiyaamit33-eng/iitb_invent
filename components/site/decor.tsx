/**
 * Line-drawing backdrops. Two orbits that overlap — research and practice —
 * with the intersection on the centre line. Decorative only.
 */

export function IntersectField() {
  return (
    <div className="intersect-field" aria-hidden="true">
      <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect className="intersect-grid" width="1440" height="800" fill="url(#hero-grid)" />
        <g className="intersect-marks" stroke="currentColor" strokeWidth="0.7" fill="none">
          <path d="M 72 56 H 112 M 72 56 V 96" />
          <path d="M 1368 56 H 1328 M 1368 56 V 96" />
          <path d="M 72 744 H 112 M 72 744 V 704" />
          <path d="M 1368 744 H 1328 M 1368 744 V 704" />
        </g>
        <line className="intersect-axis draw" x1="40" y1="400" x2="1400" y2="400" />
        <circle className="intersect-orbit is-practice" cx="560" cy="400" r="300" />
        <circle className="intersect-orbit is-research" cx="880" cy="400" r="300" />
        <circle className="intersect-orbit is-inner" cx="720" cy="400" r="188" />
        <circle className="intersect-dot is-green" cx="430" cy="400" r="5" />
        <circle className="intersect-dot is-blue" cx="1010" cy="400" r="5" />
        <circle className="intersect-dot is-green" cx="1085" cy="175" r="3.5" />
        <circle className="intersect-dot is-blue" cx="355" cy="625" r="3.5" />
      </svg>
    </div>
  );
}

export function NavyGeometry() {
  return (
    <div className="navy-geometry" aria-hidden="true">
      <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
        <line x1="0" y1="300" x2="1200" y2="300" stroke="#145BEF" strokeWidth="0.6" opacity="0.5" />
        <circle cx="200" cy="140" r="90" fill="none" stroke="#69B33F" strokeWidth="0.6" opacity="0.45" />
        <circle cx="980" cy="420" r="140" fill="none" stroke="#145BEF" strokeWidth="0.6" opacity="0.35" />
        <line x1="600" y1="0" x2="600" y2="600" stroke="#69B33F" strokeWidth="0.5" opacity="0.35" />
      </svg>
    </div>
  );
}

export function CtaOrbits() {
  return (
    <div className="cta-orbits" aria-hidden="true">
      <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice">
        <ellipse cx="980" cy="80" rx="260" ry="160" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <ellipse cx="980" cy="80" rx="180" ry="110" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="980" cy="80" r="6" fill="#69B33F" />
        <line x1="0" y1="250" x2="1200" y2="250" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
      </svg>
    </div>
  );
}

const ICON_PATHS = {
  paper: "M8 20 V8 h8 l6 6 v12 H8z M16 8 v6 h6 M11 16 h8 M11 20 h6",
  person: "M16 8 a4 4 0 1 0 0.01 0z M8 26 v-2 c0-4 4-6 8-6 s8 2 8 6 v2",
  chart: "M6 22 L16 10 L22 16 L28 8 M6 26 h22",
  building: "M8 24 V12 l8-4 8 4 v12 M16 8 v16 M10 24 h12",
  cube: "M6 14 l10-6 10 6-10 6z M10 16 v6 l6 3 6-3 v-6",
  // A pinned research poster, not a picture frame: the frame-plus-landscape
  // reading of a generic image icon looks like a broken image at 28px.
  poster:
    "M16 4 a1.5 1.5 0 1 0 0.01 0z M16 7 v2 M8 9 h16 v18 H8z M12 14 h8 M12 18 h8 M12 22 h5",
  award:
    "M16 6 a6 6 0 1 0 0.01 0z M16 10 l1.6 3.2 3.4 0.5-2.5 2.4 0.6 3.4-3.1-1.7-3.1 1.7 0.6-3.4-2.5-2.4 3.4-0.5z M12 22 l-2 6 6-3 6 3-2-6",
  journal:
    "M8 7 h11 a3 3 0 0 1 3 3 v15 H11 a3 3 0 0 0-3 3z M8 7 v21 M12 12 h7 M12 16 h7",
  network:
    "M16 7 a3 3 0 1 0 0.01 0z M8 20 a3 3 0 1 0 0.01 0z M24 20 a3 3 0 1 0 0.01 0z M16 10 L9.5 17.5 M16 10 l6.5 7.5 M10.5 22 h11",
  // A board on legs with a working sketch on it: a session you do, not watch.
  workshop:
    "M16 3 v3 M4 6 h24 v14 H4z M9 16 l4-5 3 3 3-4 4 6 M13 20 l-3 8 M19 20 l3 8",
} as const;

export type LineIconName = keyof typeof ICON_PATHS;

export function LineIcon({ name }: { name: LineIconName }) {
  return (
    <svg viewBox="0 0 32 32" className="line-icon" aria-hidden="true">
      <path
        d={ICON_PATHS[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
