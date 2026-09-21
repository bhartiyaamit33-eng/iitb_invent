export function IntersectionField() {
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
