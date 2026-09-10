"use client";

import { useEffect } from "react";

export function LandingTheme() {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-landing", "");
    return () => html.removeAttribute("data-landing");
  }, []);
  return null;
}
