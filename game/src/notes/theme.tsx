/**
 * Theme-System für die Notizen-App.
 *
 * Stellt den React-Context und den `useTheme()`-Hook bereit.
 * Die reinen Farb-Tokens leben in `theme-tokens.ts`, damit der
 * React-Refresh-Linter sauber bleibt (Konstanten + Komponenten
 * dürfen nicht in derselben Datei exportiert werden).
 *
 * Bewusst KEIN `prefers-color-scheme`-Detect: das Produkt soll
 * rein manuell steuerbar sein (siehe Design-Spec).
 */

import { createContext, useContext, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import {
  getThemeSnapshot,
  setTheme as storeSetTheme,
  subscribeTheme,
} from "./store";
import { darkTheme, lightTheme } from "./theme-tokens";
import type { ThemeTokens } from "./theme-tokens";

/* ============================================================================
 * Context
 * ========================================================================== */

interface ThemeContextValue {
  theme: ThemeTokens;
  mode: "light" | "dark";
  /** Wechselt zwischen light und dark. */
  toggleTheme: () => void;
  /** Setzt einen expliziten Modus. */
  setMode: (mode: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Provider-Komponente.
 *
 * Erwartet `children` und liest den aktuellen Modus reaktiv
 * aus dem `themeStore`. Updates werden via `useSyncExternalStore`
 * synchron an alle Konsumenten weitergegeben.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeSnapshot);
  const theme = mode === "dark" ? darkTheme : lightTheme;

  const value: ThemeContextValue = {
    theme,
    mode,
    toggleTheme: () => storeSetTheme(mode === "dark" ? "light" : "dark"),
    setMode: storeSetTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook für Komponenten, die das aktuelle Theme brauchen.
 *
 * Wirft, wenn er außerhalb des `ThemeProvider` aufgerufen wird –
 * das stellt sicher, dass fehlende Provider-Setups früh auffallen.
 *
 * eslint-disable-next-line react-refresh/only-export-components:
 * Hooks neben Komponenten zu exportieren ist in dieser Datei gewollt
 * – ThemeContext, ThemeProvider und useTheme gehören konzeptionell
 * zusammen und teilen sich dasselbe `ThemeContextValue`-Typ-Objekt.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme() muss innerhalb von ThemeProvider verwendet werden.");
  }
  return ctx;
}
