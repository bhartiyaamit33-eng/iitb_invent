import Link from "next/link";
import type { LiveStripData } from "@/lib/landing";

export function LiveStrip({ live }: { live: LiveStripData }) {
  return (
    <div
      id="live-strip"
      className="relative z-[70] border-b border-spark/20 bg-midnight px-[18px] py-3.5 font-sans text-frost"
    >
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold tracking-[0.18em] text-spark uppercase">
            Happening now · {live.clock} IST
          </p>
          {live.happening.length === 0 ? (
            <p className="m-0 opacity-90">No session in progress.</p>
          ) : (
            live.happening.map((s) => (
              <p key={s.title} className="mb-1.5">
                <strong>{s.title}</strong>
                {s.room ? ` · ${s.room}` : ""}
              </p>
            ))
          )}
          {live.upNext.length > 0 ? (
            <>
              <p className="mt-2.5 mb-1 text-[11px] tracking-[0.12em] uppercase opacity-75">
                Up next
              </p>
              {live.upNext.map((s) => (
                <p key={s.title} className="mb-1 text-sm">
                  {s.when} — {s.title}
                </p>
              ))}
            </>
          ) : null}
        </div>
        <p className="m-0">
          <Link href="/now" className="font-semibold text-spark">
            Lobby screen
          </Link>
          {" · "}
          <Link href="/programme" className="text-frost">
            Programme
          </Link>
        </p>
      </div>
    </div>
  );
}
