import Link from "next/link";
import type { LiveStripData } from "@/lib/landing";

/** Shown only while the current edition is LIVE. */
export function SiteLiveStrip({ live }: { live: LiveStripData }) {
  return (
    <div id="live-strip" data-testid="live-strip">
      <div
        className="site-shell"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          padding: "14px 0",
        }}
      >
        <div>
          <p className="site-kicker is-green" style={{ margin: "0 0 8px" }}>
            Happening now · {live.clock} IST
          </p>
          {live.happening.length === 0 ? (
            <p style={{ margin: 0, opacity: 0.85 }}>No session in progress.</p>
          ) : (
            live.happening.map((session) => (
              <p key={session.title} style={{ margin: "0 0 6px" }}>
                <strong style={{ fontWeight: 500 }}>{session.title}</strong>
                {session.room ? ` · ${session.room}` : ""}
              </p>
            ))
          )}
          {live.upNext.length > 0 ? (
            <>
              <p
                className="site-kicker"
                style={{ margin: "14px 0 6px", color: "rgba(247,247,242,0.7)" }}
              >
                Up next
              </p>
              {live.upNext.map((session) => (
                <p key={session.title} style={{ margin: "0 0 4px", fontSize: 14 }}>
                  {session.when} — {session.title}
                </p>
              ))}
            </>
          ) : null}
        </div>
        <p style={{ margin: 0, fontSize: 13 }}>
          <Link href="/now">Lobby screen</Link>
          {" · "}
          <Link href="/programme">Programme</Link>
        </p>
      </div>
    </div>
  );
}
