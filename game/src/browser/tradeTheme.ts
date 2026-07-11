export const darkTheme = {
  mode: 'dark' as const,
  bg: {
    page: '#000000',
    panel: '#18181b',
    elevated: '#09090b',
    input: '#18181b',
    hover: '#1f1f23',
  },
  border: {
    default: '#27272a',
    subtle: '#1f1f23',
    strong: '#3f3f46',
  },
  text: {
    primary: '#e4e4e7',
    secondary: '#a1a1aa',
    tertiary: '#71717a',
    muted: '#52525b',
    inverse: '#000000',
  },
  accent: '#1d9bf0',
  green: '#00ba7c',
  red: '#f4212e',
  gold: '#ffd400',
  purple: '#a855f7',
};

export const lightTheme = {
  mode: 'light' as const,
  bg: {
    page: '#ffffff',
    panel: '#f8fafc',
    elevated: '#f1f5f9',
    input: '#ffffff',
    hover: '#f1f5f9',
  },
  border: {
    default: '#e2e8f0',
    subtle: '#f1f5f9',
    strong: '#cbd5e1',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    muted: '#94a3b8',
    inverse: '#ffffff',
  },
  accent: '#1d9bf0',
  green: '#00ba7c',
  red: '#f4212e',
  gold: '#d97706',
  purple: '#a855f7',
};

export type Theme = typeof darkTheme;

export function getTheme(mode: 'dark' | 'light'): Theme {
  return mode === 'light' ? lightTheme : darkTheme;
}

export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
