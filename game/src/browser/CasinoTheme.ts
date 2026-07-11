export const casinoTheme = {
  bg: {
    page: '#0a0e1a',
    panel: '#131829',
    panelHi: '#1c2238',
    rail: '#1a1f33',
    table: '#0d4628',
    tableHi: '#105c34',
    hover: '#252b45',
    glass: 'rgba(19, 24, 41, 0.92)',
    glassLight: 'rgba(28, 34, 56, 0.5)',
  },
  text: {
    primary: '#f5f5f7',
    secondary: '#9aa3b8',
    tertiary: '#5b6480',
    inverse: '#0a0e1a',
  },
  accent: {
    gold: '#d4af37',
    goldHi: '#f0c850',
    goldSoft: 'rgba(212, 175, 55, 0.15)',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#3b82f6',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.12)',
    gold: 'rgba(212, 175, 55, 0.4)',
  },
  shadow: {
    gold: '0 0 24px rgba(212, 175, 55, 0.35)',
    soft: '0 4px 16px rgba(0, 0, 0, 0.4)',
    lift: '0 12px 32px rgba(0, 0, 0, 0.55)',
  },
  font: {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    mono: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
    display: 'Georgia, "Times New Roman", serif',
  },
};

export const casinoGlobalCss = `
  .casino-scroll::-webkit-scrollbar { display: none; }
  .casino-scroll { -ms-overflow-style: none; scrollbar-width: none; }

  @keyframes gold-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.5); }
    50% { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
  }

  @keyframes win-flash {
    0% { background-color: rgba(34, 197, 94, 0); }
    30% { background-color: rgba(34, 197, 94, 0.4); }
    100% { background-color: rgba(34, 197, 94, 0); }
  }

  @keyframes lose-flash {
    0% { background-color: rgba(239, 68, 68, 0); }
    30% { background-color: rgba(239, 68, 68, 0.4); }
    100% { background-color: rgba(239, 68, 68, 0); }
  }

  @keyframes reel-spin {
    0% { transform: translateY(0); }
    100% { transform: translateY(-50%); }
  }

  @keyframes glow-text {
    0%, 100% { text-shadow: 0 0 8px rgba(212, 175, 55, 0.4); }
    50% { text-shadow: 0 0 20px rgba(212, 175, 55, 0.8); }
  }

  @keyframes bounce-in {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes sparkle {
    0% { transform: translate(0,0) scale(0); opacity: 0; }
    20% { opacity: 1; }
    100% { transform: translate(var(--sx, 30px), var(--sy, -30px)) scale(1.2); opacity: 0; }
  }

  @keyframes coin-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  @keyframes ball-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  @keyframes jackpot-rain {
    0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }

  @keyframes reel-stop {
    0% { transform: translateY(-100%); }
    60% { transform: translateY(10%); }
    100% { transform: translateY(0); }
  }

  @keyframes win-zoom {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
  }

  @keyframes count-up {
    from { transform: translateY(8px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes confetti-fall {
    0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 1; }
    100% { transform: translate3d(var(--cx, 20px), 110vh, 0) rotate(var(--cr, 360deg)); opacity: 0.2; }
  }

  @keyframes gold-rain {
    0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }

  @keyframes bigwin-zoom {
    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
    50% { transform: scale(1.3) rotate(0deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  @keyframes neon-pulse {
    0%, 100% { box-shadow: 0 0 8px currentColor, 0 0 16px currentColor; }
    50% { box-shadow: 0 0 16px currentColor, 0 0 32px currentColor, 0 0 48px currentColor; }
  }

  @keyframes fire-glow {
    0% { text-shadow: 0 0 4px #ff6b00, 0 0 8px #ff6b00; }
    50% { text-shadow: 0 0 8px #ff6b00, 0 0 16px #ffaa00, 0 0 24px #ff6b00; }
    100% { text-shadow: 0 0 4px #ff6b00, 0 0 8px #ff6b00; }
  }

  @keyframes screen-shake {
    0%, 100% { transform: translate(0, 0); }
    10% { transform: translate(-2px, -1px); }
    20% { transform: translate(2px, 1px); }
    30% { transform: translate(-2px, 1px); }
    40% { transform: translate(2px, -1px); }
    50% { transform: translate(-1px, 2px); }
    60% { transform: translate(1px, -2px); }
    70% { transform: translate(-1px, 1px); }
    80% { transform: translate(1px, -1px); }
  }

  @keyframes burst-ring {
    0% { transform: scale(0.5); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }

  @keyframes float-up {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-80px) scale(1.5); opacity: 0; }
  }

  @keyframes heat-flicker {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  @keyframes jackpot-text {
    0% { transform: scale(0) rotate(-10deg); }
    40% { transform: scale(1.4) rotate(5deg); }
    60% { transform: scale(0.95) rotate(-2deg); }
    100% { transform: scale(1) rotate(0); }
  }

  @keyframes ball-trail {
    0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.8); }
    100% { box-shadow: 0 0 0 12px rgba(255,255,255,0); }
  }

  @keyframes rainbow {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  @keyframes card-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes mega-pulse {
    0%, 100% {
      box-shadow: 0 0 20px rgba(255,107,0,0.4), 0 0 40px rgba(255,170,0,0.3);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 40px rgba(255,107,0,0.7), 0 0 80px rgba(255,170,0,0.5);
      transform: scale(1.02);
    }
  }

  @keyframes lightning {
    0%, 100% { opacity: 0; }
    45% { opacity: 0; }
    50% { opacity: 0.6; }
    55% { opacity: 0; }
    60% { opacity: 0.8; }
    65% { opacity: 0; }
  }

  @keyframes streak-glow {
    0%, 100% {
      box-shadow: 0 0 6px currentColor, 0 0 12px currentColor;
    }
    50% {
      box-shadow: 0 0 14px currentColor, 0 0 28px currentColor, 0 0 42px currentColor;
    }
  }

  @keyframes crash-rise {
    0% { transform: translateY(100%) scale(1); }
    100% { transform: translateY(-20%) scale(1.15); }
  }

  @keyframes dice-bounce {
    0%, 100% { transform: rotate(0deg) translateY(0); }
    25% { transform: rotate(90deg) translateY(-12px); }
    50% { transform: rotate(180deg) translateY(0); }
    75% { transform: rotate(270deg) translateY(-12px); }
  }

  @keyframes near-miss-flash {
    0% { background-color: rgba(255, 107, 0, 0); }
    20% { background-color: rgba(255, 107, 0, 0.4); }
    100% { background-color: rgba(255, 107, 0, 0); }
  }

  @keyframes mega-streak-bg {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;
