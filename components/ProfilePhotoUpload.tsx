"use client";

import { useRef, useState, useTransition } from "react";
import { uploadProfilePhotoAction } from "@/app/(dashboard)/dashboard/profile/actions";

export function ProfilePhotoUpload({
  imageUrl,
  name,
}: {
  imageUrl: string | null;
  name: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(imageUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadProfilePhotoAction(fd);
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
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-paper text-xl font-semibold text-teal-deep">
          {name.slice(0, 1).toUpperCase()}
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
          {pending ? "Uploading…" : preview ? "Change photo" : "Add photo"}
        </button>
        <p className="mt-1 text-xs text-mute">
          Shown on the attendee directory when you opt in.
        </p>
        {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
