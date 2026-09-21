/**
 * The INV.ENT lockup. Navy INV is the research half, blue ENT the venture half,
 * and the green dot is the point where they meet — so it is a real element, not
 * a full stop. Scale it by passing a font size through `style`.
 */
export function InventMark({
  className,
  onDark,
  style,
}: {
  className?: string;
  onDark?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={[
        "invent-mark",
        onDark ? "on-dark" : null,
        className ?? null,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-label="INV.ENT"
    >
      <b>INV</b>
      <span className="invent-dot" aria-hidden="true" />
      <i>ENT</i>
    </span>
  );
}
