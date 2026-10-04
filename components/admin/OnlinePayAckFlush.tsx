"use client";

import { useEffect, useState } from "react";

type PendingAck = {
  name: string;
  transId: string;
  requestType: string;
  ackUrl: string;
};

/**
 * Online Pay's ACK host is on the IITB private network. When an admin opens
 * the desk on campus or VPN, this browser delivers any notices the server
 * could not acknowledge.
 */
const TYPE_LABEL: Record<string, string> = {
  I: "payment",
  R: "settlement",
  D: "refund",
};

export function OnlinePayAckFlush() {
  const [pending, setPending] = useState<PendingAck[] | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function flush() {
      const res = await fetch("/api/admin/onlinepay/acks", {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { items?: PendingAck[] };
      const items = data.items ?? [];
      if (items.length === 0 || cancelled) return;
      setPending(items);
      setNote(
        "Online Pay acknowledgements remain unconfirmed. Open the acknowledgement on campus / VPN, then retry server confirmation. Opening a link alone does not confirm delivery.",
      );
    }
    void flush().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function markSent(item: PendingAck) {
    const result = await fetch("/api/admin/onlinepay/acks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        transId: item.transId,
        requestType: item.requestType,
      }),
    });
    const body = await result.json();
    if (!result.ok || !body.ok) {
      setNote(
        "The server could not confirm acknowledgement delivery. It remains pending; ask ASC to confirm receipt.",
      );
      return;
    }
    setPending((current) =>
      (current ?? []).filter(
        (row) =>
          !(
            row.transId === item.transId && row.requestType === item.requestType
          ),
      ),
    );
  }

  if (!note && !pending?.length) return null;
  return (
    <div className="border-b border-line bg-paper px-6 py-3 text-sm text-ink">
      {note ? <p>{note}</p> : null}
      {pending && pending.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {pending.map((item) => (
            <li key={`${item.transId}-${item.requestType}`}>
              <a
                href={item.ackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-teal-deep underline-offset-2 hover:underline"
              >
                Acknowledge {TYPE_LABEL[item.requestType] ?? item.requestType}{" "}
                for {item.name}
              </a>{" "}
              <button
                type="button"
                className="ml-3 underline"
                onClick={() => void markSent(item)}
              >
                Retry server confirmation
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
