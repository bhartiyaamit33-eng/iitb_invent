import { motion } from "framer-motion";
import type { TimelineItem } from "@/lib/landing";
import { cx } from "./cx";

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="timeline" aria-label="Key dates">
      {items.map((item, i) => (
        <li
          key={item.id}
          className={cx(
            "timeline-item",
            item.state === "now" && "is-now",
            item.state === "past" && "is-past",
          )}
        >
          <span className="kicker">{item.kicker}</span>
          <motion.span
            className="node"
            aria-hidden="true"
            initial={{ scale: 0.6, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
          <span className="date">{item.date}</span>
        </li>
      ))}
    </ol>
  );
}
