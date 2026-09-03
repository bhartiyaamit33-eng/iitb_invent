"use client";

import { useState, useTransition } from "react";
import { sendConnectionRequestAction } from "@/app/(public)/[year]/attendees/actions";

export function RequestConnectForm({
  toUserId,
  toName,
  year,
}: {
  toUserId: string;
  toName: string;
  year: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    `Hi ${toName.split(" ")[0] || toName}, I'd like to connect at INVENT — happy to share more about what I'm working on.`,
  );
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setStatus(null);
    const fd = new FormData();
    fd.set("toUserId", toUserId);
    fd.set("message", message);
    fd.set("year", year);
    startTransition(async () => {
      const res = await sendConnectionRequestAction(fd);
      if (!res.ok) {
        setStatus(res.error);
        return;
      }
      setStatus(
        res.emailed
          ? "Sent — they'll get an email from INVENT with your details (you are not CC'd)."
          : "Saved. Email could not be delivered yet (SES sandbox) — we'll retry when outbound mail is fully open.",
      );
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-semibold uppercase tracking-[0.1em] text-teal-deep underline-offset-2 hover:underline"
        >
          Request intro by email
        </button>
        {status ? <p className="mt-1 text-xs text-mute">{status}</p> : null}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-md border border-line bg-paper p-3">
      <p className="text-xs text-ink-soft">
        We email them from conference@iitbinvent.com with your name, email,
        phone (if set), LinkedIn, and this note. You are not CC&apos;d.
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        maxLength={800}
        className="w-full rounded-md border border-line px-2 py-1.5 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending || message.trim().length < 10}
          onClick={submit}
          className="rounded-md bg-teal-deep px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send request"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-mute underline-offset-2 hover:underline"
        >
          Cancel
        </button>
      </div>
      {status ? <p className="text-xs text-mute">{status}</p> : null}
    </div>
  );
}
