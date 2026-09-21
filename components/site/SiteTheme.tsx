"use client";

import { useEffect } from "react";

/** Paper background on <html>/<body> so overscroll matches the page. */
export function SiteTheme() {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-site", "");
    html.removeAttribute("data-landing");
    html.removeAttribute("data-cfp");
    return () => html.removeAttribute("data-site");
  }, []);
  return null;
}
