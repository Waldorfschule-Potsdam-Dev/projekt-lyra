import { BRAND, BRAND_LIGHT } from './data';
import type { Theme, Tokens } from './types';

export function buildTokens(theme: Theme): Tokens {
  const dark = theme === 'dark';
  return {
    theme,
    bg: dark ? '#0B0B0E' : '#F4F5F7',
    bgGlow1: dark ? 'rgba(255,87,34,0.10)' : '#FFE9DF',
    bgGlow2: dark ? 'rgba(255,138,101,0.06)' : '#FFF1E6',
    card: dark ? '#17171C' : '#FFFFFF',
    cardBorder: dark ? 'rgba(255,255,255,0.06)' : 'transparent',
    iconBg: dark ? '#1F1F26' : '#FFFFFF',
    nav: dark ? 'rgba(23,23,28,0.75)' : 'rgba(255,255,255,0.85)',
    navBorder: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
    text: dark ? '#F4F5F7' : '#0F0F12',
    textSoft: dark ? '#8A8A95' : '#5A5A66',
    chevron: dark ? '#3F3F46' : '#BBBBBF',
    divider: dark ? 'rgba(255,255,255,0.06)' : '#F0F0F2',
    shadow: dark ? '0 6px 20px rgba(0,0,0,0.4)' : '0 6px 20px rgba(15,15,18,0.05)',
    shadowHero: dark ? '0 16px 40px rgba(255,87,34,0.35)' : '0 16px 40px rgba(255,87,34,0.25)',
    shadowNav: dark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(15,15,18,0.12)',
    chipBg: dark ? 'rgba(255,255,255,0.10)' : '#FFFFFF',
    sparkDot: dark ? '#0B0B0E' : '#FFFFFF',
  };
}

export { BRAND, BRAND_LIGHT };
