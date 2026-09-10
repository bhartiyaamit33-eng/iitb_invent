import { cx } from "./cx";

type Variant = "hero" | "section" | "corner";
type Node = { x: number; y: number };

const PATHS: Record<Variant, { d: string; alt?: boolean }[]> = {
  hero: [
    { d: "M -80 420 C 160 40, 480 80, 820 310 S 1280 640, 1400 500" },
    { d: "M 40 -40 C 280 220, 640 60, 1320 380", alt: true },
    { d: "M -20 640 C 300 480, 700 720, 1180 420" },
  ],
  section: [
    { d: "M -40 180 C 220 20, 520 220, 980 90" },
    { d: "M 80 280 C 360 140, 700 300, 1100 160", alt: true },
  ],
  corner: [
    { d: "M 40 260 C 180 40, 420 80, 620 220" },
    { d: "M -20 80 C 200 200, 380 40, 640 140", alt: true },
  ],
};

/** Sparse white dust — mostly over the building, clear of INV.ENT. */
const HERO_NODES: Node[] = [
  { x: 32, y: 78 },
  { x: 78, y: 240 },
  { x: 44, y: 560 },
  { x: 708, y: 72 },
  { x: 848, y: 128 },
  { x: 1008, y: 64 },
  { x: 1140, y: 168 },
  { x: 928, y: 268 },
  { x: 1088, y: 356 },
  { x: 792, y: 430 },
  { x: 980, y: 528 },
  { x: 1160, y: 580 },
  { x: 196, y: 668 },
];

const HERO_LINKS: [number, number][] = [
  [0, 1],
  [3, 4],
  [4, 5],
  [5, 6],
  [4, 7],
  [7, 8],
  [6, 8],
  [7, 9],
  [8, 10],
  [9, 10],
  [10, 11],
];

const SECTION_NODES: Node[] = [
  { x: 200, y: 96 },
  { x: 420, y: 148 },
  { x: 680, y: 88 },
  { x: 900, y: 140 },
];

const SECTION_LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
];

const CORNER_NODES: Node[] = [
  { x: 140, y: 90 },
  { x: 320, y: 150 },
  { x: 480, y: 100 },
];

const CORNER_LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
];

const GRAPH: Record<Variant, { nodes: Node[]; links: [number, number][] }> = {
  hero: { nodes: HERO_NODES, links: HERO_LINKS },
  section: { nodes: SECTION_NODES, links: SECTION_LINKS },
  corner: { nodes: CORNER_NODES, links: CORNER_LINKS },
};

export function OrbitBackdrop({
  variant = "section",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const view =
    variant === "hero" ? "0 0 1200 720" : variant === "corner" ? "0 0 640 320" : "0 0 1100 320";
  const { nodes, links } = GRAPH[variant];
  const r = variant === "hero" ? 1.7 : 1.4;

  return (
    <div className={cx("orbit-field", className)} aria-hidden="true">
      <div className="grid" />
      <svg
        viewBox={view}
        preserveAspectRatio="xMidYMid slice"
        data-testid={variant === "hero" ? "network-nodes" : undefined}
      >
        {PATHS[variant].map((p) => (
          <path key={p.d} className={p.alt ? "alt" : undefined} d={p.d} />
        ))}
        {links.map(([a, b]) => {
          const from = nodes[a];
          const to = nodes[b];
          if (!from || !to) return null;
          return (
            <line
              key={`${a}-${b}`}
              className="net-link"
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
            />
          );
        })}
        {nodes.map((n, i) => (
          <circle
            key={`${n.x}-${n.y}`}
            className="node"
            cx={n.x}
            cy={n.y}
            r={r}
            style={{ animationDelay: `${(i % 6) * 0.4}s` }}
          />
        ))}
      </svg>
    </div>
  );
}
