"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export function TicketQr({ token }: { token: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, token, {
      width: 220,
      margin: 2,
      color: { dark: "#06262f", light: "#ffffff" },
    }).catch(() => setError("Could not render QR"));
  }, [token]);

  if (error) return <p className="text-sm text-red-700">{error}</p>;

  return (
    <div className="inline-block rounded-xl border border-line bg-white p-3">
      <canvas ref={canvasRef} aria-label="Check-in QR code" />
      <p className="mt-2 max-w-[220px] break-all text-center text-[10px] text-mute">
        Offline-ready · show at gate
      </p>
    </div>
  );
}
