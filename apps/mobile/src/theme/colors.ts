import { useCSSVariable } from "uniwind";

// Mirrors the @theme (light) tokens in src/global.css — kept in sync
// manually. Use Tailwind classes (bg-brand, text-muted, …) wherever
// className works; fall back to these raw values only where a prop needs a
// color string (tab bar tintColor, icon stroke, StatusBar) AND theme
// reactivity doesn't matter (e.g. code that runs outside a component).
//
// Inside a component, prefer useThemeColors() below instead — it reads the
// live CSS variables, so it follows the light/dark toggle (see
// src/store/useThemeStore.ts). This static object always reflects light
// mode only.
export const colors = {
  bg: "#faf8f4",
  surface: "#ffffff",
  border: "#e7e2d8",
  text: "#1c1c1a",
  textMuted: "#767267",
  brand: "#1f7a4d",
  brandHover: "#17603c",
  brandSoft: "#e6f2ea",
  accent: "#c65a2e",
} as const;

export type ThemeColors = { [K in keyof typeof colors]: string };

const CSS_VAR_NAMES = [
  "--color-bg",
  "--color-surface",
  "--color-border",
  "--color-text",
  "--color-text-muted",
  "--color-brand",
  "--color-brand-hover",
  "--color-brand-soft",
  "--color-accent",
] as const;

// Theme-reactive equivalent of `colors` — call from inside a component to
// get raw color strings that follow the active light/dark theme.
export function useThemeColors(): ThemeColors {
  const [bg, surface, border, text, textMuted, brand, brandHover, brandSoft, accent] =
    useCSSVariable(CSS_VAR_NAMES as unknown as string[]) as string[];
  return {
    bg: bg ?? colors.bg,
    surface: surface ?? colors.surface,
    border: border ?? colors.border,
    text: text ?? colors.text,
    textMuted: textMuted ?? colors.textMuted,
    brand: brand ?? colors.brand,
    brandHover: brandHover ?? colors.brandHover,
    brandSoft: brandSoft ?? colors.brandSoft,
    accent: accent ?? colors.accent,
  };
}
