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
    const landing = spark.closest(".landing");
    if (!(landing instanceof HTMLElement)) return;
    const ghosts = [g1Ref.current, g2Ref.current].filter(Boolean) as HTMLElement[];

    const NS = "http://www.w3.org/2000/svg";
    const READ = 0.38;
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
    let nodes: HTMLElement[] = [];
    let pts: { x: number; y: number }[] = [];
    let nodeLens: number[] = [];

    function pointOf(el: HTMLElement) {
      const root = landing.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const minX = 12;
      const maxX = Math.max(minX + 8, landing.clientWidth - 12);
      let x: number;
      let y: number;
      if (el.classList.contains("brand-dot")) {
        x = r.left - root.left + r.width / 2;
        y = r.top - root.top + r.height / 2;
      } else {
        x = r.left - root.left - 26;
        y = r.top - root.top + Math.min(r.height / 2, 34);
      }
      return {
        x: Math.min(maxX, Math.max(minX, x)),
        y,
      };
    }

    function collectNodes() {
      const found = Array.from(landing.querySelectorAll("[data-spark-node]")).filter(
        (el): el is HTMLElement => el instanceof HTMLElement,
      );
      const measured = found
        .map((el) => ({ el, pt: pointOf(el), r: el.getBoundingClientRect() }))
        .filter(({ r, pt }) => r.width > 2 && r.height > 2 && Number.isFinite(pt.x) && Number.isFinite(pt.y));
      measured.sort((a, b) => a.pt.y - b.pt.y || a.pt.x - b.pt.x);
      nodes = measured.map((m) => m.el);
      pts = measured.map((m) => m.pt);
    }

    function nodesShifted() {
      if (!nodes.length || nodes.length !== pts.length) return true;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const prev = pts[i];
        if (!node || !prev) return true;
        const next = pointOf(node);
        if (Math.abs(next.y - prev.y) > 6 || Math.abs(next.x - prev.x) > 6) return true;
      }
      return false;
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

    function alongForPageY(y: number, total: number) {
      const first = pts[0];
      const last = pts[pts.length - 1];
      if (!first || !last) return 0;
      if (y <= first.y) return 0;
      if (y >= last.y) return total;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        if (!a || !b) continue;
        if (y <= b.y) {
          const span = Math.max(1, b.y - a.y);
          const u = (y - a.y) / span;
          const la = nodeLens[i - 1] ?? 0;
          const lb = nodeLens[i] ?? total;
          return la + u * (lb - la);
        }
      }
      return total;
    }

    function pageYAtReadLine() {
      const root = landing.getBoundingClientRect();
      return window.innerHeight * READ - root.top + landing.scrollTop;
    }

    function buildStations() {
      if (!stationsG || !pathEl) return;
      while (stationsG.firstChild) stationsG.removeChild(stationsG.firstChild);
      stations = [];
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
          len: (nodeLens[i] ?? 0) - 3,
          circle: c,
          ring,
          lit: false,
          kicker: sec ? sec.querySelector(".landing-kicker, .section-kicker") : null,
        });
      }
    }

    function buildPath() {
      if (!svg) return;
      collectNodes();
      const origin = pts[0];
      if (!origin || pts.length < 2) return;
      let d = `M ${origin.x} ${origin.y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        if (!prev || !curr) continue;
        const dy = curr.y - prev.y;
        const c1y = prev.y + dy * 0.55;
        const c2y = curr.y - dy * 0.25;
        d += ` C ${prev.x} ${c1y}, ${curr.x} ${c2y}, ${curr.x} ${curr.y}`;
      }
      const w = landing.clientWidth;
      const h = Math.max(landing.scrollHeight, landing.offsetHeight);
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.setAttribute("width", String(w));
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
      maskEl?.setAttribute("width", String(w));
      maskEl?.setAttribute("height", String(h));
      const total = pathEl.getTotalLength();
      nodeLens = pts.map((p) => lengthAtY(p.y, total));
      buildStations();
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

    function put(el: HTMLElement, x: number, y: number) {
      el.style.transform = `translate(${x}px, ${y}px)`;
    }

    let lastAt = "";
    function announce(at: string, along: number, y: number) {
      spark.dataset.sparkAt = at;
      if (at === lastAt) return;
      lastAt = at;
      if (process.env.NODE_ENV !== "development") return;
      void import("@reticlehq/react").then(({ reticle }) => {
        reticle.signal("spark:at", { heading: at, along: Math.round(along), y: Math.round(y) });
      });
    }

    const introMs = 2600;
    const introAt = Date.now();

    function placeSpark() {
      if (!pathEl || !spark) return;
      const len = pathEl.getTotalLength();
      if (!len || pts.length < 2) return;
      const introDone = Date.now() - introAt >= introMs;
      const y = pageYAtReadLine();
      const along = alongForPageY(y, len);
      const firstY = pts[0]?.y ?? 0;
      if (!introDone && y < firstY - 24) {
        spark.classList.remove("is-live");
        spark.removeAttribute("data-spark-y");
        spark.removeAttribute("data-spark-at");
        ghosts.forEach((g) => g.classList.remove("is-live"));
        maskPath?.setAttribute("stroke-dasharray", "0 1000");
        updateStations(0);
        return;
      }
      spark.classList.add("is-live");
      spark.dataset.sparkY = String(Math.round(y));
      spark.dataset.sparkAlong = String(Math.round(along));
      let atIdx = 0;
      for (let i = 0; i < pts.length; i++) {
        if ((pts[i]?.y ?? 0) <= y + 12) atIdx = i;
      }
      const at = (nodes[atIdx]?.innerText || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);
      announce(at, along, y);
      maskPath?.setAttribute("stroke-dasharray", `${((along / len) * 1000).toFixed(1)} 1000`);
      const p = pathEl.getPointAtLength(along);
      put(spark, p.x, p.y);
      const trail = [24, 48];
      ghosts.forEach((g, i) => {
        const gap = trail[i] ?? 24;
        const gp = pathEl.getPointAtLength(Math.max(0, along - gap));
        put(g, gp.x, gp.y);
        g.classList.add("is-live");
      });
      updateStations(along);
    }

    let built = false;
    let raf = 0;
    function tick() {
      raf = 0;
      if (!built || nodesShifted()) {
        buildPath();
        built = true;
      }
      placeSpark();
    }
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    }
    const onResize = () => {
      buildPath();
      built = true;
      placeSpark();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    landing.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(landing);
    const boot = window.setTimeout(() => {
      buildPath();
      built = true;
      placeSpark();
    }, introMs);

    return () => {
      window.removeEventListener("scroll", onScroll);
      landing.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(boot);
    };
  }, []);

  return (
    <>
      <div className="spark" ref={sparkRef} aria-hidden="true" data-testid="spark-trail" />
      <div className="spark-ghost g1" ref={g1Ref} aria-hidden="true" />
      <div className="spark-ghost g2" ref={g2Ref} aria-hidden="true" />
      <svg className="spark-svg" ref={svgRef} aria-hidden="true" />
    </>
  );
}
