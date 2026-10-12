"use client";

import { useRef, useState, useTransition } from "react";
import { uploadSpeakerPhotoAction } from "@/app/(admin)/admin/actions";

export function SpeakerPhotoUpload({ speakerId, photoUrl }: { speakerId: string; photoUrl: string | null }) {
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
        setError(e instanceof Error ? e.message : "The photo did not upload. Try again.");
      }
    });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />
      ) : (
        <span
          aria-hidden="true"
          style={{
            display: "grid",
            placeItems: "center",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--adm-neutral-tint)",
            color: "var(--adm-mute)",
            fontSize: 12,
          }}
        >
          No photo
        </span>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => onPick(e.target.files?.[0])}
        />
        <button type="button" disabled={pending} onClick={() => inputRef.current?.click()} className="adm-btn is-small">
          {pending ? "Uploading…" : preview ? "Replace photo" : "Upload photo"}
        </button>
        {error ? (
          <p className="adm-hint" style={{ color: "var(--adm-bad)", margin: "4px 0 0" }}>
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
