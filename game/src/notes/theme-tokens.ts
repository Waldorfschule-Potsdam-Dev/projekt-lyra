/**
 * Theme-Token-Definitionen.
 *
 * Reine Daten – KEIN React. Diese Datei existiert getrennt von
 * `theme.tsx`, weil der React-Refresh-Linter es nicht erlaubt,
 * in einer Datei, die React-Komponenten exportiert, gleichzeitig
 * reine Konstanten zu exportieren.
 *
 * Hier leben die Farbpaletten für Light- und Dark-Mode.
 */

export interface ThemeTokens {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentStrong: string;
  shadow: string;
}

/** Heller Modus – identisch zum bisherigen Look. */
export const lightTheme: ThemeTokens = {
  background: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceElevated: "#EFEFF1",
  text: "#1C1C1E",
  textMuted: "#8E8E93",
  border: "#E5E5EA",
  accent: "#FDE293",
  accentStrong: "#F5C518",
  shadow: "rgba(0, 0, 0, 0.06)",
};

/**
 * Dunkler Modus – "Warm Dark".
 *
 * Bewusst leicht warmer Grauton (statt Pure-Black), damit die
 * Markenfarbe (warmes Gelb) farblich harmoniert.
 */
export const darkTheme: ThemeTokens = {
  background: "#1C1C1E",
  surface: "#2C2C2E",
  surfaceElevated: "#3A3A3C",
  text: "#F2F2F7",
  textMuted: "#98989D",
  border: "#38383A",
  accent: "#FDE293",       // bleibt – Markenfarbe, gut lesbar auf dunkel
  accentStrong: "#F5C518", // bleibt
  shadow: "rgba(0, 0, 0, 0.30)",
};
