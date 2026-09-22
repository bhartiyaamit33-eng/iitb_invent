import type { ReactNode } from "react";

/** Standard editorial masthead for every inner page. */
export function PageHero({
  kicker,
  title,
  lede,
  meta,
  children,
}: {
  kicker?: string;
  title: string;
  lede?: ReactNode;
  meta?: string[];
  children?: ReactNode;
}) {
  return (
    <section className="page-hero" data-testid="page-hero">
      <div className="site-shell">
        {kicker ? <p className="site-kicker is-blue">{kicker}</p> : null}
        <h1>{title}</h1>
        {lede ? <p className="page-hero-lede">{lede}</p> : null}
        {meta && meta.length > 0 ? (
          <ul className="page-hero-meta">
            {meta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {children}
      </div>
    </section>
  );
}
