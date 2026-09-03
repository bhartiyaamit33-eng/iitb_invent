"use client";

import { useRef, useState, useTransition } from "react";
import { uploadSpeakerPhotoAction } from "@/app/(admin)/admin/actions";

export function SpeakerPhotoUpload({
  speakerId,
  photoUrl,
}: {
  speakerId: string;
  photoUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(photoUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("speakerId", speakerId);
    fd.set("file", file);
    startTransition(async () => {
      try {
        const res = await uploadSpeakerPhotoAction(fd);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setPreview(res.url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper text-sm text-mute">
          Photo
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
          {pending ? "Uploading…" : "Upload photo"}
        </button>
        {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
