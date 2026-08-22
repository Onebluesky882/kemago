// Mirrors the @theme tokens in src/global.css — kept in sync manually.
// Use Tailwind classes (bg-brand, text-muted, …) wherever className works;
// fall back to these raw values only where a prop needs a color string
// (tab bar tintColor, icon stroke, StatusBar).
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
