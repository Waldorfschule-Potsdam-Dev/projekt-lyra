export const socialTheme = {
  bg: {
    primary: '#000000',
    secondary: '#16181c',
    tertiary: '#1f2328',
    hover: '#272c33',
    glass: 'rgba(22, 24, 28, 0.95)',
    glassLight: 'rgba(47, 51, 54, 0.5)',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.07)',
    default: 'rgba(255, 255, 255, 0.1)',
    accent: 'rgba(29, 155, 240, 0.3)',
    accentStrong: 'rgba(29, 155, 240, 0.5)',
  },
  accent: {
    blue: '#1d9bf0',
    blueHover: '#1a8cd8',
    blueLight: '#1d9bf033',
    green: '#00ba7c',
    red: '#f4212e',
    gold: '#ffd400',
    purple: '#7856ff',
  },
  text: {
    primary: '#e7e9ea',
    secondary: '#71767b',
    tertiary: '#535659',
    inverse: '#0f1419',
    muted: '#8899a6',
  },
  glow: {
    blue: '0 0 16px rgba(29, 155, 240, 0.4)',
    blueSoft: '0 0 8px rgba(29, 155, 240, 0.15)',
    red: '0 0 12px rgba(244, 33, 46, 0.4)',
    gold: '0 0 12px rgba(255, 212, 0, 0.4)',
  },
  font: {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    mono: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
  },
  rankColor: {
    'OBERSTER FÜHRER': '#f4212e',
    'Vizeführer': '#ff4d5c',
    'Minister': '#e02d3c',
    'Vizeminister': '#d63d8a',
    'Direktor': '#a855f7',
    'Funktionär': '#8b5cf6',
    'Offizier': '#1d9bf0',
    'Mitglied': '#00ba7c',
    'Genosse': '#1d9bf0',
    'Zivilist': '#71767b',
  },
  clearanceColor: {
    'STRENG GEHEIM': '#f4212e',
    'GEHEIM': '#e02d3c',
    'VERTRAULICH': '#a855f7',
    'INTERN': '#1d9bf0',
    'ÖFFENTLICH': '#71767b',
  },
  loyaltyColor: {
    'Bestätigt': '#00ba7c',
    'In Prüfung': '#ffd400',
    'Beobachtet': '#f4212e',
  },
  statusColor: {
    'Aktiv': '#00ba7c',
    'Abwesend': '#71767b',
    'Gesperrt': '#f4212e',
    'Verborgen': '#f4212e',
  },
};

export const socialGlobalCss = `
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  
  @keyframes pulse-blue {
    0%, 100% { box-shadow: 0 0 0 0 rgba(29, 155, 240, 0.5); }
    50% { box-shadow: 0 0 0 8px rgba(29, 155, 240, 0); }
  }
  @keyframes pulse-red {
    0%, 100% { box-shadow: 0 0 0 0 rgba(244, 33, 46, 0.5); }
    50% { box-shadow: 0 0 0 8px rgba(244, 33, 46, 0); }
  }
  @keyframes pulse-gold {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 212, 0, 0.5); }
    50% { box-shadow: 0 0 0 8px rgba(255, 212, 0, 0); }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes subtle-blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0.4; }
  }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes typewriter {
    from { width: 0; }
    to { width: 100%; }
  }

  .social-enter {
    animation: fade-in 0.3s ease-out forwards;
  }
  .social-enter-delay-1 { animation-delay: 0.05s; }
  .social-enter-delay-2 { animation-delay: 0.1s; }
  .social-enter-delay-3 { animation-delay: 0.15s; }
  .social-enter-delay-4 { animation-delay: 0.2s; }
  .social-enter-delay-5 { animation-delay: 0.25s; }

  .skeleton {
    background: linear-gradient(90deg, #1f2328 25%, #272c33 50%, #1f2328 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
  }

  .scanline-overlay::after {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(29, 155, 240, 0.008) 2px, rgba(29, 155, 240, 0.008) 3px);
    pointer-events: none;
    z-index: 9999;
    animation: scanline 8s linear infinite;
  }

  .glow-border-blue {
    box-shadow: 0 0 0 1px rgba(29, 155, 240, 0.3), 0 0 16px rgba(29, 155, 240, 0.1);
  }
  .glow-border-red {
    box-shadow: 0 0 0 1px rgba(244, 33, 46, 0.3), 0 0 12px rgba(244, 33, 46, 0.1);
  }
  .glow-border-gold {
    box-shadow: 0 0 0 1px rgba(255, 212, 0, 0.3), 0 0 12px rgba(255, 212, 0, 0.1);
  }

  .clip-corner {
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
  }
  .clip-corner-sm {
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%);
  }

  .text-gradient-blue {
    background: linear-gradient(135deg, #1d9bf0 0%, #7856ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .text-gradient-gold {
    background: linear-gradient(135deg, #ffd400 0%, #ff9f00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .text-gradient-red {
    background: linear-gradient(135deg, #f4212e 0%, #e02d3c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .pulse-ring::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid currentColor;
    animation: pulse-ring 2s ease-out infinite;
  }
  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.5); opacity: 0; }
  }

  .noise-overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.02;
    pointer-events: none;
  }

  input::placeholder { color: #535659; }
  input:focus { outline: none; }
  button:focus-visible { outline: 2px solid #1d9bf0; outline-offset: 2px; }

  ::selection { background: #1d9bf044; color: #e7e9ea; }
`;

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}