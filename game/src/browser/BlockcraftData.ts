export type PlayerStatus = 'online' | 'afk' | 'offline';
export type ServerStatus = 'online' | 'maintenance' | 'offline';

export interface BlockcraftPlayer {
  id: string;
  username: string;
  rank: string;
  rankColor: string;
  status: PlayerStatus;
  joinedDays: number;
  blocksPlaced: number;
  kills: number;
  deaths: number;
  skin: string;
  motto: string;
}

export interface BlockcraftNews {
  id: string;
  date: string;
  category: 'patch' | 'event' | 'whitelist' | 'warn';
  title: string;
  body: string;
}

export interface BlockcraftEvent {
  id: string;
  date: string;
  title: string;
  body: string;
}

export const serverInfo = {
  name: 'ALLIANZ-CRAFT',
  ip: 'mc.allianz-intern.net',
  port: 25565,
  version: '1.21.4 · Paper',
  status: 'online' as ServerStatus,
  uptime: '14 Tage, 03:42 Std.',
  worldSize: '8000 × 8000 Blöcke',
  tps: 19.8,
  ramUsage: 62,
  motd: 'Willkommen auf dem offiziellen Server der Allianz. Whitelist aktiv. Propagandaplakate willkommen.',
};

export const players: BlockcraftPlayer[] = [
  {
    id: 'kanzler_brandt',
    username: 'VB_ErsterKanzler',
    rank: 'OBERSTER FÜHRER',
    rankColor: '#f4212e',
    status: 'online',
    joinedDays: 1247,
    blocksPlaced: 8421,
    kills: 0,
    deaths: 0,
    skin: 'enderman',
    motto: 'Die Zukunft gehört den Disziplinierten.',
  },
  {
    id: 'halstenbeck',
    username: 'KH_VizefArch',
    rank: 'Vizeführer',
    rankColor: '#ff4d5c',
    status: 'online',
    joinedDays: 1098,
    blocksPlaced: 12450,
    kills: 12,
    deaths: 4,
    skin: 'witch',
    motto: 'Architektin der Ordnung.',
  },
  {
    id: 'seidt',
    username: 'DS_Bergstation',
    rank: 'Minister',
    rankColor: '#1d9bf0',
    status: 'afk',
    joinedDays: 642,
    blocksPlaced: 3210,
    kills: 8,
    deaths: 15,
    skin: 'steve',
    motto: 'Innere Sicherheit ist die Grundlage jeder Freiheit.',
  },
  {
    id: 'bellmer',
    username: 'FB_SD_Direktor',
    rank: 'Minister',
    rankColor: '#1e3a5f',
    status: 'online',
    joinedDays: 1320,
    blocksPlaced: 4128,
    kills: 4,
    deaths: 2,
    skin: 'iron_golem',
    motto: 'Ordnung ist das höchste Gut.',
  },
  {
    id: 'klingspor',
    username: 'HK_Patriarch',
    rank: 'OBERSTER FÜHRER',
    rankColor: '#b91c1c',
    status: 'offline',
    joinedDays: 2102,
    blocksPlaced: 18820,
    kills: 0,
    deaths: 0,
    skin: 'wither_skeleton',
    motto: 'Ehre den Erbauer.',
  },
  {
    id: 'prack',
    username: 'LP_WIDI',
    rank: 'Direktor',
    rankColor: '#7e22ce',
    status: 'online',
    joinedDays: 845,
    blocksPlaced: 2980,
    kills: 0,
    deaths: 0,
    skin: 'villager',
    motto: 'Wirtschaftliche Sicherheit ist Sicherheit.',
  },
  {
    id: 'kaltenborn',
    username: 'TK_Parlament',
    rank: 'Vizeminister',
    rankColor: '#a16207',
    status: 'online',
    joinedDays: 712,
    blocksPlaced: 5610,
    kills: 2,
    deaths: 6,
    skin: 'creeper',
    motto: 'Klartext statt Sonntagsreden.',
  },
  {
    id: 'vehlow',
    username: 'BV_Apparat',
    rank: 'Direktor',
    rankColor: '#0f766e',
    status: 'online',
    joinedDays: 980,
    blocksPlaced: 1840,
    kills: 22,
    deaths: 18,
    skin: 'pillager',
    motto: 'Der Apparat läuft.',
  },
  {
    id: 'siemons',
    username: 'TS_Initiative',
    rank: 'Vizeminister',
    rankColor: '#9333ea',
    status: 'offline',
    joinedDays: 567,
    blocksPlaced: 910,
    kills: 1,
    deaths: 3,
    skin: 'wandering_trader',
    motto: 'Transparenz und Sauberkeit.',
  },
];

export const news: BlockcraftNews[] = [
  {
    id: 'n-patch',
    date: 'Heute',
    category: 'patch',
    title: 'Patch 1.21.4 aktiv',
    body: 'Neue Sicherheitszone um die Bergstation eingerichtet. PvP außerhalb der Arena dauerhaft deaktiviert. Propagandaplakate in Sektor A7 nun auch in Brusthöhe platzierbar.',
  },
  {
    id: 'n-whitelist',
    date: 'Gestern',
    category: 'whitelist',
    title: 'Whitelist-Reset Q3',
    body: 'Whitelist wird am 01.07. zurückgesetzt. Mitglieder der Allianz ab Rang „Offizier" werden automatisch übernommen. Anträge über den Parteikanal.',
  },
  {
    id: 'n-event',
    date: 'Vor 3 Tagen',
    category: 'event',
    title: 'Bauwettbewerb Sektor C3',
    body: 'Thema: „Verwaltung der Zukunft". Einsendungen bis 15.07. an die Parteileitung. Hauptpreis: 1000 Credits + Beförderung im Rang.',
  },
  {
    id: 'n-warn',
    date: 'Vor 5 Tagen',
    category: 'warn',
    title: 'Verstoß gegen Propagandakodex',
    body: 'Account @ext_rebell_07 wurde nach Platzierung nicht genehmigter Symbolik in Sektor A0 dauerhaft gesperrt. Wir dulden keine Abweichung.',
  },
];

export const events: BlockcraftEvent[] = [
  {
    id: 'e-1',
    date: 'MORGEN · 20:00',
    title: 'Server-Rundgang mit dem Ersten Kanzler',
    body: 'Geführte Tour durch Sektor A0. Treffpunkt Spawn.',
  },
  {
    id: 'e-2',
    date: 'FREITAG · 19:00',
    title: 'PvP-Turnier Sektor F2',
    body: '16 Spieler, K.o.-System, Hauptpreis 500 Credits.',
  },
  {
    id: 'e-3',
    date: 'NÄCHSTE WOCHE',
    title: 'Whitelist-Reset — Anmeldung offen',
    body: 'Anträge über VOX KOMMUN, Direktnachricht an @pes.official.',
  },
];

export const skinEmoji: Record<string, string> = {
  steve: '🧑',
  alex: '👩',
  enderman: '🟣',
  witch: '🧙‍♀️',
  iron_golem: '🤖',
  wither_skeleton: '💀',
  villager: '🧔',
  creeper: '🟢',
  pillager: '🏴',
  wandering_trader: '🧳',
};

export const pixelCss = `
@font-face {
  font-family: 'monospace';
  src: local('Courier New');
}
* {
  -webkit-font-smoothing: none;
  font-smooth: never;
}

@keyframes mc-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

@keyframes mc-scroll {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

@keyframes mc-block-place {
  0% { transform: scale(0) rotate(45deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(-5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

@keyframes mc-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.mc-mono {
  font-family: 'Courier New', 'Lucida Console', monospace;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-rendering: geometricPrecision;
  font-variant-ligatures: none;
}

.mc-status-led {
  width: 12px;
  height: 12px;
  background: #5D7C15;
  border: 2px solid #1a1a1a;
  box-shadow: 0 0 8px #5D7C15, inset 0 0 4px #94C11C;
  animation: mc-blink 2s infinite;
}

.mc-status-led.offline {
  background: #b91c1c;
  box-shadow: 0 0 8px #b91c1c, inset 0 0 4px #ef4444;
}

.mc-status-led.maintenance {
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b, inset 0 0 4px #fcd34d;
  animation: none;
}

.mc-block {
  border: 3px solid #000;
  box-shadow: inset -3px -3px 0 rgba(0,0,0,0.4), inset 3px 3px 0 rgba(255,255,255,0.15);
  image-rendering: pixelated;
}

.mc-grass-strip {
  background: repeating-linear-gradient(
    90deg,
    #5D7C15 0px,
    #6B8E23 12px,
    #4A6410 12px,
    #5D7C15 24px
  );
  border-top: 3px solid #000;
  border-bottom: 3px solid #000;
}

.mc-dirt-strip {
  background: repeating-linear-gradient(
    90deg,
    #6B4423 0px,
    #5A3819 12px,
    #6B4423 24px
  );
}

.mc-stone-strip {
  background: repeating-linear-gradient(
    90deg,
    #7F7F7F 0px,
    #6B6B6B 12px,
    #8A8A8A 12px,
    #7F7F7F 24px
  );
}

.mc-scroll-text {
  display: inline-block;
  white-space: nowrap;
  animation: mc-scroll 28s linear infinite;
}

.mc-float {
  animation: mc-float 3s ease-in-out infinite;
}
`;
