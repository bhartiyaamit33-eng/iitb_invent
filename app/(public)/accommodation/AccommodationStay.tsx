"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ANANTHA,
  ANANTHA_RATES,
  GUEST_HOUSE,
  inr,
} from "@/lib/accommodation";

type StayTab = "campus" | "hotel";

export function AccommodationStay() {
  const [tab, setTab] = useState<StayTab>("campus");

  return (
    <div data-testid="accommodation-page">
      <div
        className="flex justify-center"
        role="tablist"
        aria-label="Stay options"
      >
        <div className="flex w-full max-w-md rounded-xl bg-white p-1 shadow-[0_0_0_1px_var(--line)]">
          <StayTabButton
            id="tab-campus"
            selected={tab === "campus"}
            controls="stay-campus"
            testId="accommodation-tab-campus"
            onSelect={() => setTab("campus")}
          >
            Inside IIT Bombay
          </StayTabButton>
          <StayTabButton
            id="tab-hotel"
            selected={tab === "hotel"}
            controls="stay-hotel"
            testId="accommodation-tab-hotel"
            onSelect={() => setTab("hotel")}
          >
            Nearby hotel
          </StayTabButton>
        </div>
      </div>

      {tab === "campus" ? (
        <section
          id="stay-campus"
          role="tabpanel"
          aria-labelledby="tab-campus"
          className="mx-auto mt-10 max-w-2xl rounded-2xl border border-line bg-white p-6 sm:p-8"
          data-testid="accommodation-campus-panel"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
            On campus
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-wide text-teal-deep">
            {GUEST_HOUSE.title}
          </h2>
          <p className="mt-3 text-[17px] leading-7 text-ink-soft">
            {GUEST_HOUSE.summary}
          </p>
          <ul className="mt-8 space-y-4">
            {GUEST_HOUSE.points.map((point) => (
              <li
                key={point.title}
                className="rounded-xl bg-paper px-4 py-4"
              >
                <h3 className="font-semibold text-ink">{point.title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  {point.body}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section
          id="stay-hotel"
          role="tabpanel"
          aria-labelledby="tab-hotel"
          className="mt-10 space-y-8"
          data-testid="accommodation-hotel-panel"
        >
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="relative aspect-[1024/682] bg-paper">
              <Image
                src={ANANTHA.photo.src}
                alt={ANANTHA.photo.alt}
                width={ANANTHA.photo.width}
                height={ANANTHA.photo.height}
                className="h-full w-full object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
                Discounted tariff
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-wide text-teal-deep">
                {ANANTHA.name}
              </h2>
              <p className="mt-1 text-[17px] leading-7 text-ink-soft">
                {ANANTHA.brand}, Bhandup West — a short hop from Powai. Rates
                below are as quoted for IITB INV.ENT guests.
              </p>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-2xl border border-line bg-white"
            data-testid="anantha-rate-card"
          >
            <div className="border-b border-line px-6 py-4">
              <h3 className="font-semibold text-ink">Tariff and your rate</h3>
              <p className="mt-1 text-sm text-mute">
                Single / double occupancy. Amounts in Indian rupees, before GST.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper text-xs font-semibold uppercase tracking-wider text-mute">
                    <th className="px-6 py-3 font-semibold">Rooms</th>
                    <th className="px-4 py-3 font-semibold">Tariff</th>
                    <th className="px-4 py-3 font-semibold">Your rate · SGL</th>
                    <th className="px-6 py-3 font-semibold">Your rate · DBL</th>
                  </tr>
                </thead>
                <tbody>
                  {ANANTHA_RATES.map((row) => (
                    <tr key={row.room} className="border-b border-line last:border-0">
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-ink"
                      >
                        {row.room}
                      </th>
                      <td className="px-4 py-4 text-mute">{inr(row.tariff)}</td>
                      <td className="bg-[rgba(10,127,140,0.06)] px-4 py-4 font-semibold text-teal-deep">
                        {inr(row.single)}
                      </td>
                      <td className="bg-[rgba(10,127,140,0.06)] px-6 py-4 font-semibold text-teal-deep">
                        {inr(row.double)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-6 py-4 text-sm leading-6 text-ink-soft">
              {ANANTHA.gstNote}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <h3 className="font-semibold text-ink">Contact and location</h3>
            <p className="mt-1 text-sm text-mute">{ANANTHA.bookingNote}</p>
            <dl className="mt-6 space-y-4 text-[15px] leading-6 text-ink-soft">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-mute">
                  Bookings
                </dt>
                <dd className="mt-1 font-medium text-ink">{ANANTHA.contactName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-mute">
                  Address
                </dt>
                <dd className="mt-1">
                  {ANANTHA.name}
                  <br />
                  {ANANTHA.addressLines.map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-mute">
                  Phone
                </dt>
                <dd className="mt-1">
                  {ANANTHA.phones.map((phone, i) => (
                    <span key={phone.href}>
                      {i > 0 ? " / " : null}
                      <a href={phone.href}>{phone.display}</a>
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-mute">
                  Email
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${ANANTHA.email}?subject=${encodeURIComponent("IITB INV.ENT 2027 booking")}`}
                  >
                    {ANANTHA.email}
                  </a>
                </dd>
              </div>
            </dl>
            <a
              href={ANANTHA.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-teal-deep px-4 py-3 text-sm font-semibold text-white hover:bg-teal"
              data-testid="anantha-maps"
            >
              View on Google Maps
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

function StayTabButton({
  id,
  selected,
  controls,
  testId,
  onSelect,
  children,
}: {
  id: string;
  selected: boolean;
  controls: string;
  testId: string;
  onSelect: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={controls}
      data-testid={testId}
      onClick={onSelect}
      className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
        selected
          ? "bg-teal-deep text-white"
          : "text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
