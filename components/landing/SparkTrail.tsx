"use client";

import { useEffect, useRef } from "react";

export function SparkTrail() {
  const sparkRef = useRef<HTMLDivElement>(null);
  const g1Ref = useRef<HTMLDivElement>(null);
  const g2Ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduce || !fine) return;

    const spark = sparkRef.current;
    const svg = svgRef.current;
    if (!spark || !svg) return;
    const ghosts = [g1Ref.current, g2Ref.current].filter(Boolean) as HTMLElement[];

    const NS = "http://www.w3.org/2000/svg";
    let pathEl: SVGPathElement | null = null;
    let trackEl: SVGPathElement | null = null;
    let litEl: SVGPathElement | null = null;
    let maskPath: SVGPathElement | null = null;
    let stationsG: SVGGElement | null = null;
    let stations: {
      len: number;
      circle: SVGCircleElement;
      ring: SVGCircleElement;
      lit: boolean;
      kicker: Element | null;
    }[] = [];
    let nodes: Element[] = [];

    function pointOf(el: Element) {
      const r = el.getBoundingClientRect();
      if (el.classList.contains("brand-dot")) {
        return {
          x: r.left + r.width / 2 + window.scrollX,
          y: r.top + r.height / 2 + window.scrollY,
        };
      }
      return {
        x: r.left - 26 + window.scrollX,
        y: r.top + Math.min(r.height / 2, 34) + window.scrollY,
      };
    }

    function lengthAtY(y: number, total: number) {
      if (!pathEl) return 0;
      let lo = 0;
      let hi = total;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (pathEl.getPointAtLength(mid).y < y) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }

    function buildStations(pts: { x: number; y: number }[]) {
      if (!stationsG || !pathEl) return;
      while (stationsG.firstChild) stationsG.removeChild(stationsG.firstChild);
      stations = [];
      const total = pathEl.getTotalLength();
      for (let i = 1; i < pts.length; i++) {
        const pt = pts[i];
        const node = nodes[i];
        if (!pt || !node) continue;
        const ring = document.createElementNS(NS, "circle");
        ring.setAttribute("class", "ring");
        ring.setAttribute("cx", String(pt.x));
        ring.setAttribute("cy", String(pt.y));
        ring.setAttribute("r", "9");
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("class", "station");
        c.setAttribute("cx", String(pt.x));
        c.setAttribute("cy", String(pt.y));
        c.setAttribute("r", "3.5");
        stationsG.appendChild(ring);
        stationsG.appendChild(c);
        const sec = node.closest("section");
        stations.push({
          len: lengthAtY(pt.y, total) - 3,
          circle: c,
          ring,
          lit: false,
          kicker: sec ? sec.querySelector(".landing-kicker, .section-kicker") : null,
        });
      }
    }

    function buildPath() {
      if (!svg) return;
      nodes = Array.from(document.querySelectorAll("[data-spark-node]"));
      if (nodes.length < 2) return;
      const pts = nodes.map(pointOf);
      const origin = pts[0];
      if (!origin) return;
      let d = `M ${origin.x} ${origin.y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        if (!prev || !curr) continue;
        const midY = (prev.y + curr.y) / 2;
        d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
      }
      const h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${h}`);
      svg.setAttribute("width", String(window.innerWidth));
      svg.setAttribute("height", String(h));
      svg.style.height = `${h}px`;
      if (!pathEl) {
        const defs = document.createElementNS(NS, "defs");
        const mask = document.createElementNS(NS, "mask");
        mask.setAttribute("id", "spark-mask");
        mask.setAttribute("maskUnits", "userSpaceOnUse");
        maskPath = document.createElementNS(NS, "path");
        maskPath.setAttribute("fill", "none");
        maskPath.setAttribute("stroke", "#fff");
        maskPath.setAttribute("stroke-width", "8");
        maskPath.setAttribute("pathLength", "1000");
        maskPath.setAttribute("stroke-dasharray", "0 1000");
        mask.appendChild(maskPath);
        defs.appendChild(mask);
        svg.appendChild(defs);

        pathEl = document.createElementNS(NS, "path");
        pathEl.setAttribute("fill", "none");
        pathEl.setAttribute("stroke", "none");
        svg.appendChild(pathEl);

        trackEl = document.createElementNS(NS, "path");
        trackEl.setAttribute("class", "track");
        svg.appendChild(trackEl);

        litEl = document.createElementNS(NS, "path");
        litEl.setAttribute("class", "lit");
        litEl.setAttribute("mask", "url(#spark-mask)");
        svg.appendChild(litEl);

        stationsG = document.createElementNS(NS, "g");
        svg.appendChild(stationsG);
      }
      pathEl.setAttribute("d", d);
      trackEl?.setAttribute("d", d);
      litEl?.setAttribute("d", d);
      maskPath?.setAttribute("d", d);
      const maskEl = maskPath?.parentNode as SVGMaskElement | null;
      maskEl?.setAttribute("x", "0");
      maskEl?.setAttribute("y", "0");
      maskEl?.setAttribute("width", String(window.innerWidth));
      maskEl?.setAttribute("height", String(h));
      buildStations(pts);
    }

    function updateStations(along: number) {
      for (const st of stations) {
        const reached = along >= st.len;
        if (reached === st.lit) continue;
        st.lit = reached;
        st.circle.classList.toggle("lit", reached);
        st.ring.classList.toggle("pop", reached);
        st.kicker?.classList.toggle("is-lit", reached);
      }
    }

    const introMs = 2600;
    const introAt = Date.now();
    let lastY = window.scrollY;
    let lastT = performance.now();
    let settle = 0;

    function placeSpark() {
      if (!pathEl || !spark) return;
      const len = pathEl.getTotalLength();
      if (!len) return;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const t = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      const intro = Math.min(1, (Date.now() - introAt) / introMs);
      if (t < 0.02 || intro < 1) {
        spark.classList.remove("is-live");
        ghosts.forEach((g) => g.classList.remove("is-live"));
        maskPath?.setAttribute("stroke-dasharray", "0 1000");
        updateStations(0);
        return;
      }
      spark.classList.add("is-live");
      maskPath?.setAttribute("stroke-dasharray", `${(t * 1000).toFixed(1)} 1000`);
      const along = t * len;
      const p = pathEl.getPointAtLength(along);
      const tr = `translate(${p.x - window.scrollX}px,${p.y - window.scrollY}px)`;
      spark.style.transform = tr;
      ghosts.forEach((g) => {
        g.style.transform = tr;
        g.classList.add("is-live");
      });
      updateStations(along);

      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastY);
      const dt = Math.max(8, now - lastT);
      lastY = window.scrollY;
      lastT = now;
      const s = 1 + Math.min(0.9, (dy / dt) * 0.28);
      spark.style.setProperty("--s", s.toFixed(2));
      clearTimeout(settle);
      settle = window.setTimeout(() => spark.style.setProperty("--s", "1"), 140);
    }

    let built = false;
    const onScroll = () => {
      if (!built) {
        buildPath();
        built = true;
      }
      placeSpark();
    };
    const onResize = () => {
      buildPath();
      placeSpark();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const boot = window.setTimeout(() => {
      buildPath();
      built = true;
      placeSpark();
    }, introMs);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearTimeout(boot);
      clearTimeout(settle);
    };
  }, []);

  return (
    <>
      <div className="spark" ref={sparkRef} aria-hidden="true" />
      <div className="spark-ghost g1" ref={g1Ref} aria-hidden="true" />
      <div className="spark-ghost g2" ref={g2Ref} aria-hidden="true" />
      <svg className="spark-svg" ref={svgRef} aria-hidden="true" />
    </>
  );
}
