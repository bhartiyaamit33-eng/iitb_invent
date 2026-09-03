"use client";

import { useCallback, useEffect, useId, useState } from "react";

type ScanResult = {
  ok: boolean;
  message: string;
  name?: string;
  already?: boolean;
};

export function CheckinScanner({
  sessions,
}: {
  sessions: { id: string; title: string }[];
}) {
  const regionId = useId().replace(/:/g, "");
  const [mode, setMode] = useState<"gate" | "session">("gate");
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [manual, setManual] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);

  const submitToken = useCallback(
    async (token: string) => {
      const trimmed = token.trim();
      if (!trimmed) return;
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: trimmed,
          mode,
          sessionId: mode === "session" ? sessionId : undefined,
        }),
      });
      const data = (await res.json()) as ScanResult;
      setResult(data);
    },
    [mode, sessionId],
  );

  useEffect(() => {
    let scanner: { stop: () => Promise<void>; clear: () => void } | null = null;
    let cancelled = false;

    async function start() {
      if (typeof window === "undefined") return;
      setScanning(true);
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const html5 = new Html5Qrcode(regionId);
        scanner = html5;
        await html5.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            void submitToken(decoded);
          },
          () => undefined,
        );
      } catch {
        setScanning(false);
      }
    }

    void start();

    return () => {
      cancelled = true;
      if (scanner) {
        void scanner.stop().then(() => scanner?.clear()).catch(() => undefined);
      }
    };
  }, [regionId, submitToken]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("gate")}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${
            mode === "gate"
              ? "bg-teal-deep text-white"
              : "border border-line bg-white text-mute"
          }`}
        >
          Gate check-in
        </button>
        <button
          type="button"
          onClick={() => setMode("session")}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${
            mode === "session"
              ? "bg-teal-deep text-white"
              : "border border-line bg-white text-mute"
          }`}
        >
          Session attendance
        </button>
      </div>

      {mode === "session" ? (
        <label className="block text-sm">
          <span className="font-medium">Session</span>
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div
        id={regionId}
        className="overflow-hidden rounded-xl border border-line bg-black"
      />
      {!scanning ? (
        <p className="text-sm text-mute">
          Camera unavailable — paste the QR token below.
        </p>
      ) : null}

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void submitToken(manual);
        }}
      >
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="Paste qrToken"
          className="min-w-[16rem] flex-1 rounded-md border border-line px-3 py-2 font-mono text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
        >
          Check in
        </button>
      </form>

      {result ? (
        <div
          className={`rounded-xl border px-4 py-3 ${
            result.ok
              ? "border-ent/40 bg-white text-ink"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
          role="status"
        >
          <p className="font-semibold">{result.name ?? (result.ok ? "OK" : "Failed")}</p>
          <p className="mt-1 text-sm">{result.message}</p>
        </div>
      ) : null}
    </div>
  );
}
