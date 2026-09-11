"use client";

import { useEffect } from "react";

/** Ivory page background on <html>/<body> so overscroll matches the CFP page. */
export function CfpTheme() {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-cfp", "");
    return () => html.removeAttribute("data-cfp");
  }, []);
  return null;
}
