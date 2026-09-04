"use client";

import { useState, useTransition } from "react";
import type { VentureKind } from "@prisma/client";
import {
  fetchLinkPreviewAction,
  type LinkPreview,
} from "@/app/(dashboard)/dashboard/ventures/actions";
import { VENTURE_KIND_LABEL, ventureInitials } from "@/lib/ventures";

type VentureCardData = {
  id: string;
  name: string;
  slug: string;
  kind: VentureKind;
  tagline: string | null;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  ownerName: string;
};

export function VentureCard({ venture }: { venture: VentureCardData }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const initials = ventureInitials(venture.name);

  function loadPreview() {
    if (!venture.websiteUrl || preview) return;
    setPreviewError(null);
    startTransition(async () => {
      const res = await fetchLinkPreviewAction(venture.websiteUrl!);
      if (!res.ok) {
        setPreviewError(res.error);
        return;
      }
      setPreview(res.preview);
    });
  }

  return (
    <article className="rounded-xl border border-line bg-white p-5">
      <div className="flex items-start gap-3">
        {venture.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venture.logoUrl}
            alt=""
            className="h-14 w-14 rounded-xl border border-line object-contain bg-paper"
          />
        ) : (
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-deep/10 text-base font-semibold text-teal-deep"
            aria-hidden
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mute">
            {VENTURE_KIND_LABEL[venture.kind]}
          </p>
          <h2 className="font-semibold text-ink">{venture.name}</h2>
          {venture.tagline ? (
            <p className="mt-1 text-sm text-ink-soft">{venture.tagline}</p>
          ) : null}
          <p className="mt-1 text-xs text-mute">by {venture.ownerName}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) loadPreview();
          }}
          className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-teal-deep hover:bg-paper"
          aria-expanded={open}
        >
          {open ? "Hide details" : "Read about it"}
        </button>
        {venture.websiteUrl ? (
          <a
            href={venture.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-teal-deep px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
          >
            Open website
          </a>
        ) : null}
      </div>

      {open ? (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          {venture.description ? (
            <p className="text-sm leading-relaxed text-ink-soft whitespace-pre-wrap">
              {venture.description}
            </p>
          ) : (
            <p className="text-sm text-mute">No description yet.</p>
          )}

          {venture.websiteUrl ? (
            <div className="rounded-lg border border-line bg-paper p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mute">
                Link preview
              </p>
              {pending && !preview ? (
                <p className="mt-2 text-sm text-mute">Loading preview…</p>
              ) : null}
              {previewError ? (
                <p className="mt-2 text-sm text-mute">{previewError}</p>
              ) : null}
              {preview ? (
                <div className="mt-2 flex gap-3">
                  {preview.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview.image}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-md object-cover border border-line bg-white"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {preview.title || preview.siteName || "Website"}
                    </p>
                    {preview.description ? (
                      <p className="mt-1 line-clamp-3 text-xs text-ink-soft">
                        {preview.description}
                      </p>
                    ) : null}
                    <p className="mt-1 truncate text-xs text-mute">
                      {preview.siteName || preview.url}
                    </p>
                  </div>
                </div>
              ) : null}
              <p className="mt-2 text-xs text-mute">
                Stay on Inv.ent to read first — open the site only when you want
                to leave.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
