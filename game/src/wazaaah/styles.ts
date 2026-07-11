import type { CSSProperties } from 'react';

export const waColors = {
  // Header / brand
  headerBg: '#008069',
  headerBgDark: '#017561',
  primaryGreen: '#00A884',
  accentTeal: '#128C7E',
  fabBg: '#00A884',

  // Backgrounds
  listBg: '#FFFFFF',
  chatBg: '#EFEAE2',
  chatBgPattern:
    // Very subtle Wazaaah-style doodle pattern using inline SVG
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='%23DAD3CB' fill-opacity='0.35'><circle cx='10' cy='10' r='1.2'/><circle cx='40' cy='30' r='1.2'/><circle cx='25' cy='48' r='1.2'/><path d='M5 35 Q12 32 15 38' stroke='%23DAD3CB' stroke-opacity='0.3' stroke-width='1' fill='none'/><path d='M45 8 Q50 14 47 20' stroke='%23DAD3CB' stroke-opacity='0.3' stroke-width='1' fill='none'/></g></svg>\")",

  // Bubbles
  bubbleIncoming: '#000000',
  bubbleOutgoing: '#D9FDD3',
  bubbleTailIncoming: '#000000',
  bubbleTailOutgoing: '#D9FDD3',

  // Text
  textPrimary: '#111B21',
  textSecondary: '#667781',
  textOnDark: '#000000',
  textOnDarkMuted: 'rgba(0,0,0,0.7)',
  linkBlue: '#53BDEB',
  readTick: '#53BDEB',
  unreadBadge: '#25D366',
  onIncomingDark: '#FFFFFF',
  onIncomingDarkMuted: 'rgba(255,255,255,0.7)',

  // Misc
  border: '#E9EDEF',
  searchBg: '#F0F2F5',
  inputBg: '#FFFFFF',
  composeBg: '#F0F2F5',
  divider: '#F0F2F5',
};

export const chatHeaderStyle: CSSProperties = {
  backgroundColor: waColors.headerBg,
  color: waColors.textOnDark,
  display: 'flex',
  alignItems: 'center',
  padding: '8px 8px',
  height: '60px',
  flexShrink: 0,
  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
};

export const chatBodyStyle: CSSProperties = {
  flex: 1,
  backgroundColor: waColors.chatBg,
  backgroundImage: waColors.chatBgPattern,
  overflowY: 'auto',
  padding: '8px 6px',
  display: 'flex',
  flexDirection: 'column',
};

export const composeBarStyle: CSSProperties = {
  backgroundColor: waColors.composeBg,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 10px',
  flexShrink: 0,
};

export const fabStyle: CSSProperties = {
  position: 'absolute',
  right: '20px',
  bottom: '20px',
  width: '56px',
  height: '56px',
  borderRadius: '18px',
  backgroundColor: waColors.fabBg,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 6px 14px rgba(0,0,0,0.25)',
  cursor: 'pointer',
  zIndex: 10,
};