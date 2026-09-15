"use client";

import { useEffect, useState } from "react";

const START = new Date("2027-01-31T09:00:00+05:30").getTime();
const END = new Date("2027-01-31T19:30:00+05:30").getTime();

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export function Countdown() {
  const [label, setLabel] = useState("-");
  const [title, setTitle] = useState("Until 31 Jan 2027 · 09:00 IST");

  useEffect(() => {
    function tick() {
      const now = Date.now();
      if (now >= END) {
        setLabel("ENDED");
        setTitle("IITB INV.ENT day ended 31 Jan 2027 · 19:30 IST");
        return;
      }
      if (now >= START) {
        setLabel("LIVE");
        setTitle("Live until 19:30 IST");
        return;
      }
      const d = START - now;
      const days = Math.floor(d / 86400000);
      const hours = Math.floor((d % 86400000) / 3600000);
      const mins = Math.floor((d % 3600000) / 60000);
      const secs = Math.floor((d % 60000) / 1000);
      setLabel(
        days > 0
          ? `${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`
          : `${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`,
      );
      setTitle("Until 31 Jan 2027 · 09:00 IST");
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <b id="cd" className="font-sans text-[clamp(15px,2.2vw,20px)] font-medium tracking-wide text-spark tabular-nums whitespace-nowrap" title={title}>
      {label}
    </b>
  );
}
