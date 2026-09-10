import { cx } from "./cx";

export function Wordmark({
  className,
  as = "h1",
}: {
  className?: string;
  as?: "h1" | "p";
}) {
  const Tag = as;
  return (
    <div className={cx("brand-lockup", className)}>
      <span className="fullform sr-only">Innovation Entrepreneurship</span>
      <Tag
        className="brand-word"
        aria-label="INV.ENT: Innovation and Entrepreneurship"
        data-testid={as === "h1" ? "brand-mark" : undefined}
      >
        <span className="brand-half inv-col">
          <span className="word">INV</span>
          <span className="meaning">Innovation</span>
        </span>
        <span className="brand-dot" data-spark-node aria-hidden="true">
          <i />
        </span>
        <span className="brand-half ent-col">
          <span className="word">ENT</span>
          <span className="meaning">Entrepreneurship</span>
        </span>
      </Tag>
    </div>
  );
}

export function BrandInline() {
  return (
    <span className="brand-inline">
      <span className="inv">INV</span>
      <span className="dot">.</span>
      <span className="ent">ENT</span>
    </span>
  );
}
