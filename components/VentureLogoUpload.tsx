"use client";

import { useRef, useState, useTransition } from "react";
import { uploadVentureLogoAction } from "@/app/(dashboard)/dashboard/ventures/actions";
import { ventureInitials } from "@/lib/ventures";

export function VentureLogoUpload({
  ventureId,
  logoUrl,
  name,
}: {
  ventureId: string;
  logoUrl: string | null;
  name: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(logoUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const initials = ventureInitials(name);

  function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("id", ventureId);
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadVentureLogoAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPreview(res.url);
    });
  }

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="h-16 w-16 rounded-xl object-contain bg-paper border border-line"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-teal-deep/10 text-lg font-semibold text-teal-deep">
          {initials}
        </div>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-teal-deep hover:bg-paper disabled:opacity-50"
        >
          {pending ? "Uploading…" : preview ? "Change logo" : "Upload logo"}
        </button>
        <p className="mt-1 text-xs text-mute">
          Optional. Without a logo we show “{initials}”.
        </p>
        {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
