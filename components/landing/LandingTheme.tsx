"use client";

import { useEffect } from "react";

export function LandingTheme({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-landing", variant === "light" ? "light" : "");
    return () => html.removeAttribute("data-landing");
  }, [variant]);
  return null;
}
