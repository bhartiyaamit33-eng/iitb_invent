import Image from "next/image";
import { GALLERY_LANE_A, GALLERY_LANE_B } from "@/lib/landing";
import { cx } from "./cx";

type Shot = { src: string; alt: string };

function LaneSet({ shots, inert }: { shots: readonly Shot[]; inert?: boolean }) {
  return (
    <div className="event-lane-set" aria-hidden={inert || undefined}>
      {shots.map((shot) => (
        <figure key={`${inert ? "dup" : "src"}-${shot.src}`} className="event-lane-card">
          <Image
            src={shot.src}
            alt=""
            fill
            sizes="(max-width: 860px) 70vw, 280px"
            quality={72}
            className="object-cover"
          />
        </figure>
      ))}
    </div>
  );
}

function Lane({
  shots,
  reverse,
}: {
  shots: readonly Shot[];
  reverse?: boolean;
}) {
  return (
    <div className={cx("event-lane", reverse && "is-reverse")}>
      <div className="event-lane-track">
        <LaneSet shots={shots} />
        <LaneSet shots={shots} inert />
      </div>
    </div>
  );
}

export function EventLanes() {
  return (
    <section
      className="event-lanes"
      aria-label="Scenes from IITB INV.ENT at DSSE"
      data-testid="event-lanes"
    >
      <h2 className="sr-only">Events from campus</h2>
      <Lane shots={GALLERY_LANE_A} />
      <Lane shots={GALLERY_LANE_B} reverse />
    </section>
  );
}
