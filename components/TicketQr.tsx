"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export function TicketQr({
  token,
  badgeUrl,
}: {
  token: string;
  /** Full public badge URL encoded in the QR (preferred). */
  badgeUrl?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const payload = badgeUrl?.trim() || token;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, payload, {
      width: 220,
      margin: 2,
      color: { dark: "#06262f", light: "#ffffff" },
    }).catch(() => setError("Could not render QR"));
  }, [payload]);

  if (error) return <p className="text-sm text-red-700">{error}</p>;

  return (
    <div className="inline-block rounded-xl border border-line bg-white p-3">
      <canvas ref={canvasRef} aria-label="Attendee badge QR code" />
      <p className="mt-2 max-w-[220px] text-center text-[10px] text-mute">
        Opens your Inv.ent badge · show at gate
      </p>
      {badgeUrl ? (
        <a
          href={badgeUrl}
          className="mt-1 block max-w-[220px] truncate text-center text-[10px] text-teal-deep underline-offset-2 hover:underline"
        >
          View badge
        </a>
      ) : null}
    </div>
  );
}
