// Theme-aware chart tokens — reference CSS custom properties defined in app/globals.css
// so charts follow the light/dark toggle automatically. See dataviz skill palette.md
// for the source values these variables are derived from.

export const chrome = {
  surface: 'var(--surface)',
  page: 'var(--bg)',
  ink: 'var(--text)',
  inkSecondary: 'var(--text-secondary)',
  inkMuted: 'var(--text-muted)',
  gridline: 'var(--border)',
  baseline: 'var(--baseline)',
  border: 'var(--border-strong)',
  accent: 'var(--accent)',
}

export const status = {
  good: 'var(--status-good)',
  warning: 'var(--status-warning)',
  serious: 'var(--status-serious)',
  critical: 'var(--status-critical)',
}

// Sequential hue for single-series magnitude charts (cost/token trend).
export const sequential = {
  400: 'var(--chart-seq-base)',
  450: 'var(--chart-seq-hover)',
}

export const deltaGoodText = 'var(--delta-good-text)'
