import type { ReactNode } from "react";

function linkify(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text))) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const href = match[2];
    if (!href) continue;
    const external = href.startsWith("http");
    parts.push(
      <a
        key={key++}
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {match[1]}
      </a>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Prose({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\n+/);
  return (
    <div className="space-y-4 text-[17px] leading-7 text-ink-soft">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="pt-4 font-display text-2xl tracking-wide text-teal-deep"
            >
              {block.slice(3)}
            </h2>
          );
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {linkify(block)}
          </p>
        );
      })}
    </div>
  );
}
