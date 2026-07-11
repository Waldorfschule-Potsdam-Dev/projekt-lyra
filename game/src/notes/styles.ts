/**
 * Geteilte Layout-Werte für die Notizen-App.
 *
 * Diese Datei enthält bewusst NUR noch Spacing, Radien und
 * typografische Konstanten. **Farben** leben im Theme
 * (siehe `theme.ts`) und werden von den Komponenten über
 * den `useTheme()`-Hook konsumiert.
 *
 * So bleibt:
 *  - die App komplett in `src/notes/` gekapselt,
 *  - der Dark-Mode-Wechsel eine reine Token-Sache, ohne
 *    dass globale CSS-Variablen oder das Harness angefasst
 *    werden müssen.
 */

import type { CSSProperties } from "react";

/** Häufig wiederverwendete Radien (iOS-typisch). */
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
};

/** Konsistente Abstände – helfen, das Layout harmonisch zu halten. */
export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

/**
 * Root-Container-Style.
 *
 * Enthält KEINEN `backgroundColor` – der wird in `index.tsx`
 * aus dem aktuellen Theme gesetzt, damit der Wechsel zwischen
 * Light und Dark ohne Re-Mount funktioniert.
 */
export const rootStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  color: "#1C1C1E", // wird ebenfalls vom Theme überschrieben
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  WebkitFontSmoothing: "antialiased",
};
