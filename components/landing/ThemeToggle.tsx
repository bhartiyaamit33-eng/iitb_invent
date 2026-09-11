"use client";

import type { LandingThemeName } from "@/lib/landing";

export const LANDING_THEME_KEY = "invent-landing-theme";

export function readStoredLandingTheme(): LandingThemeName | null {
  try {
    const stored = window.localStorage.getItem(LANDING_THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* private mode / blocked storage */
  }
  return null;
}

export function writeStoredLandingTheme(theme: LandingThemeName) {
  try {
    window.localStorage.setItem(LANDING_THEME_KEY, theme);
  } catch {
    /* private mode / blocked storage */
  }
}

export function ThemeToggle({
  theme,
  onThemeChange,
  testid,
}: {
  theme: LandingThemeName;
  onThemeChange: (theme: LandingThemeName) => void;
  testid?: boolean;
}) {
  const next: LandingThemeName = theme === "light" ? "dark" : "light";
  return (
    <button
      type="button"
      className="theme-toggle"
      data-testid={testid ? (next === "light" ? "theme-light" : "theme-dark") : undefined}
      aria-label={next === "light" ? "Switch to light appearance" : "Switch to dark appearance"}
      onClick={() => onThemeChange(next)}
    >
      {next === "light" ? "Light" : "Dark"}
    </button>
  );
}
