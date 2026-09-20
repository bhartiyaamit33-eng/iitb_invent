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
        <line className="intersect-axis draw" x1="80" y1="560" x2="1120" y2="560" />
        <line className="intersect-axis draw delay-2" x1="600" y1="140" x2="600" y2="760" />
        <ellipse className="intersect-orbit orbit-a" cx="600" cy="480" rx="300" ry="180" />
        <ellipse className="intersect-orbit orbit-b" cx="600" cy="480" rx="440" ry="250" />
        <ellipse className="intersect-orbit orbit-c" cx="600" cy="480" rx="170" ry="170" />
        <circle className="intersect-dot" cx="300" cy="560" r="2.5" />
        <circle className="intersect-dot" cx="900" cy="560" r="2.5" />
        <circle className="intersect-dot" cx="600" cy="250" r="2" />
        <circle className="intersect-dot" cx="600" cy="710" r="2" />
        <circle className="intersect-core pulse" cx="600" cy="560" r="7" />
      </svg>
    </div>
  );
}
