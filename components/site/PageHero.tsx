import type { ReactNode } from "react";

export function PageHero({
  kicker,
  title,
  lede,
  children,
  testId,
}: {
  kicker?: string;
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
  testId?: string;
}) {
  return (
    <header className="page-hero">
      <div className="site-shell page-hero-inner">
        {kicker ? <p className="site-kicker">{kicker}</p> : null}
        <h1 data-testid={testId}>{title}</h1>
        {lede ? <p className="page-hero-lede">{lede}</p> : null}
        {children}
      </div>
    </header>
  );
}
