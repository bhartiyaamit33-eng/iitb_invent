export function IntersectionField() {
  return (
    <div className="intersect-field" aria-hidden="true">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect className="intersect-grid" width="1200" height="800" fill="url(#hero-grid)" />
        <line className="intersect-axis draw" x1="80" y1="400" x2="1120" y2="400" />
        <line className="intersect-axis draw delay-2" x1="600" y1="80" x2="600" y2="720" />
        <ellipse className="intersect-orbit orbit-a" cx="600" cy="400" rx="280" ry="160" />
        <ellipse className="intersect-orbit orbit-b" cx="600" cy="400" rx="420" ry="240" />
        <ellipse className="intersect-orbit orbit-c" cx="600" cy="400" rx="160" ry="160" />
        <circle className="intersect-dot" cx="320" cy="400" r="2.5" />
        <circle className="intersect-dot" cx="880" cy="400" r="2.5" />
        <circle className="intersect-dot" cx="600" cy="180" r="2" />
        <circle className="intersect-dot" cx="600" cy="620" r="2" />
        <circle className="intersect-core pulse" cx="600" cy="400" r="7" />
      </svg>
    </div>
  );
}
