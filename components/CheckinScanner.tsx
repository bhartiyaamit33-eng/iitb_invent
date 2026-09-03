"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ScanResult = {
  ok: boolean;
  message: string;
  name?: string;
  already?: boolean;
};

type Html5Scanner = {
  isScanning: boolean;
  start: (
    cameraIdOrConfig: string | MediaTrackConstraints,
    config: { fps?: number; qrbox?: number | { width: number; height: number } },
    onSuccess: (decoded: string) => void,
    onFailure?: (err: string) => void,
  ) => Promise<null>;
  stop: () => Promise<void>;
  clear: () => void;
};

const REGION_ID = "invent-checkin-qr-reader";

export function CheckinScanner({
  sessions,
}: {
  sessions: { id: string; title: string }[];
}) {
  const [mode, setMode] = useState<"gate" | "session">("gate");
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [manual, setManual] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const modeRef = useRef(mode);
  const sessionIdRef = useRef(sessionId);
  const scannerRef = useRef<Html5Scanner | null>(null);
  const lastScanRef = useRef<{ token: string; at: number }>({ token: "", at: 0 });

  modeRef.current = mode;
  sessionIdRef.current = sessionId;

  const submitToken = useCallback(async (token: string) => {
    const trimmed = token.trim();
    if (!trimmed) return;

    const now = Date.now();
    if (
      lastScanRef.current.token === trimmed &&
      now - lastScanRef.current.at < 2500
    ) {
      return;
    }
    lastScanRef.current = { token: trimmed, at: now };

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: trimmed,
          mode: modeRef.current,
          sessionId:
            modeRef.current === "session" ? sessionIdRef.current : undefined,
        }),
      });
      const data = (await res.json()) as ScanResult;
      setResult(data);
    } catch {
      setResult({
        ok: false,
        message: "Network error — try again or paste the token.",
      });
    }
  }, []);

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setCameraOn(false);
    setCameraBusy(false);
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      scanner.clear();
    } catch {
      /* ignore stop races */
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraBusy(true);

    if (typeof window === "undefined") {
      setCameraBusy(false);
      return;
    }

    // getUserMedia requires a secure context except on localhost
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocalhost) {
      setCameraError(
        "Camera needs HTTPS (or localhost). Use paste-token check-in on this preview, or open the page over HTTPS.",
      );
      setCameraBusy(false);
      return;
    }

    await stopCamera();

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const el = document.getElementById(REGION_ID);
      if (!el) {
        setCameraError("Scanner container missing — refresh the page.");
        setCameraBusy(false);
        return;
      }
      el.innerHTML = "";

      const html5 = new Html5Qrcode(REGION_ID) as unknown as Html5Scanner;
      scannerRef.current = html5;

      await html5.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          void submitToken(decoded);
        },
        () => undefined,
      );
      setCameraOn(true);
    } catch (err) {
      scannerRef.current = null;
      setCameraOn(false);
      const msg =
        err instanceof Error ? err.message : "Could not start the camera";
      setCameraError(
        /NotAllowedError|Permission/i.test(msg)
          ? "Camera permission denied — allow camera access or paste the token."
          : /secure|https|Only secure/i.test(msg)
            ? "Camera needs HTTPS on this host. Paste the QR token below instead."
            : `Camera unavailable (${msg}). Paste the QR token below.`,
      );
    } finally {
      setCameraBusy(false);
    }
  }, [stopCamera, submitToken]);

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, [stopCamera]);

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
        id={REGION_ID}
        className={`min-h-[12rem] overflow-hidden rounded-xl border border-line ${
          cameraOn ? "bg-black" : "bg-paper"
        }`}
      />

      <div className="flex flex-wrap gap-2">
        {!cameraOn ? (
          <button
            type="button"
            disabled={cameraBusy}
            onClick={() => void startCamera()}
            className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {cameraBusy ? "Starting camera…" : "Start camera"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void stopCamera()}
            className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink"
          >
            Stop camera
          </button>
        )}
      </div>

      {cameraError ? (
        <p className="text-sm text-amber-900" role="status">
          {cameraError}
        </p>
      ) : (
        <p className="text-sm text-mute">
          Or paste the ticket QR token below (works without a camera).
        </p>
      )}

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
          <p className="font-semibold">
            {result.name ?? (result.ok ? "OK" : "Failed")}
          </p>
          <p className="mt-1 text-sm">{result.message}</p>
        </div>
      ) : null}
    </div>
  );
}
