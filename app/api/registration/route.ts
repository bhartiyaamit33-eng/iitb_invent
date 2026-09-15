import { NextResponse } from "next/server";

/**
 * Event tickets are issued only after organisers select an application
 * and the category fee is paid or waived. Login must not mint a ticket.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Tickets are issued after abstract approval and payment, not from this endpoint.",
    },
    { status: 410 },
  );
}
