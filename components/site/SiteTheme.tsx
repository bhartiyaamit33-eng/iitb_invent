"use client";

import { useEffect } from "react";

export function SiteTheme() {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-site", "");
    html.removeAttribute("data-landing");
    try {
      window.localStorage.removeItem("invent-landing-theme");
    } catch {
      /* private mode / blocked storage */
    }
    return () => html.removeAttribute("data-site");
  }, []);
  return null;
}
