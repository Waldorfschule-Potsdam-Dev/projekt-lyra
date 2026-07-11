export type AssetType = 'stock' | 'crypto' | 'commodity';

export interface PricePoint {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  price: number;
  change: number;
  changePct: number;
  high24: number;
  low24: number;
  volume24: number;
  marketCap?: string;
  history: PricePoint[];
}

type ChartPattern =
  | 'steady_up'
  | 'steady_down'
  | 'volatile_sideways'
  | 'pump_dump'
  | 'recovery'
  | 'consolidation'
  | 'breakout_up'
  | 'breakout_down'
  | 'exponential';

function genHistory(pattern: ChartPattern, currentPrice: number, days: number, volPct: number, seed: number): PricePoint[] {
  const points: PricePoint[] = [];
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const progress = (days - i) / days;
    const t = now - i * 86400000;

    let relativeChange = 0;
    switch (pattern) {
      case 'steady_up':
        relativeChange = -0.22 * (1 - progress);
        break;
      case 'steady_down':
        relativeChange = 0.16 * (1 - progress);
        break;
      case 'volatile_sideways':
        relativeChange = Math.sin(progress * Math.PI * 6 + seed * 0.1) * 0.18 * (1 - progress * 0.7);
        break;
      case 'pump_dump':
        if (progress < 0.6) {
          relativeChange = -0.28 + 0.75 * (progress / 0.6);
        } else {
          relativeChange = 0.47 - 0.47 * ((progress - 0.6) / 0.4);
        }
        break;
      case 'recovery':
        if (progress < 0.35) {
          relativeChange = 0.22 - 0.55 * (progress / 0.35);
        } else {
          relativeChange = -0.33 + 0.33 * ((progress - 0.35) / 0.65);
        }
        break;
      case 'consolidation':
        relativeChange = Math.sin(progress * Math.PI * 5 + seed * 0.1) * 0.11 * (1 - progress * 0.5);
        break;
      case 'breakout_up':
        if (progress < 0.7) {
          relativeChange = -0.22 + Math.sin(progress * Math.PI * 4 + seed * 0.1) * 0.07;
        } else {
          relativeChange = -0.22 + 0.22 * ((progress - 0.7) / 0.3);
        }
        break;
      case 'breakout_down':
        if (progress < 0.7) {
          relativeChange = 0.20 + Math.sin(progress * Math.PI * 4 + seed * 0.1) * 0.07;
        } else {
          relativeChange = 0.20 - 0.20 * ((progress - 0.7) / 0.3);
        }
        break;
      case 'exponential':
        relativeChange = -0.55 * Math.pow(1 - progress, 2);
        break;
    }

    const noise = (Math.sin(seed + i * 1.7) + Math.cos(seed * 2.3 + i * 0.9)) * 0.5 * volPct;
    const c = currentPrice * (1 + relativeChange + noise);

    const o = points.length > 0 ? points[points.length - 1].c : c;
    const h = Math.max(o, c) * (1 + Math.abs(Math.sin(seed * 3 + i)) * 0.012);
    const l = Math.min(o, c) * (1 - Math.abs(Math.cos(seed * 4 + i)) * 0.012);
    const v = Math.floor(Math.abs(Math.sin(seed * 5 + i * 0.5)) * 1000000) + 100000;

    points.push({ t, o, h, l, c, v });
  }
  return points;
}

export const assets: Asset[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    price: 98420.50,
    change: 21652.00,
    changePct: 28.20,
    high24: 99850.00,
    low24: 96800.00,
    volume24: 28400000000,
    marketCap: '1.94T $',
    history: genHistory('steady_up', 98420.50, 60, 0.015, 7),
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    price: 3842.20,
    change: 1540.00,
    changePct: 66.90,
    high24: 3920.00,
    low24: 3810.50,
    volume24: 14200000000,
    marketCap: '462B $',
    history: genHistory('recovery', 3842.20, 60, 0.020, 11),
  },
  {
    id: 'bcn',
    symbol: 'BCN',
    name: 'B-Coin',
    type: 'crypto',
    price: 622.40,
    change: 136.00,
    changePct: 27.95,
    high24: 628.90,
    low24: 612.10,
    volume24: 1850000000,
    marketCap: '91.2B $',
    history: genHistory('steady_up', 622.40, 60, 0.018, 43),
  },
  {
    id: 'sln',
    symbol: 'SLN',
    name: 'Solano',
    type: 'crypto',
    price: 184.20,
    change: 58.40,
    changePct: 46.40,
    high24: 188.50,
    low24: 182.00,
    volume24: 3200000000,
    marketCap: '88.4B $',
    history: genHistory('pump_dump', 184.20, 60, 0.025, 47),
  },
  {
    id: 'crd',
    symbol: 'CRD',
    name: 'Cardia',
    type: 'crypto',
    price: 0.52,
    change: 0.04,
    changePct: 8.30,
    high24: 0.534,
    low24: 0.504,
    volume24: 820000000,
    marketCap: '18.4B $',
    history: genHistory('consolidation', 0.52, 60, 0.022, 79),
  },
  {
    id: 'plk',
    symbol: 'PLK',
    name: 'PolyDot',
    type: 'crypto',
    price: 7.84,
    change: 0.42,
    changePct: 5.66,
    high24: 7.92,
    low24: 7.58,
    volume24: 285000000,
    marketCap: '11.2B $',
    history: genHistory('volatile_sideways', 7.84, 60, 0.025, 101),
  },
  {
    id: 'riv',
    symbol: 'RIV',
    name: 'River',
    type: 'crypto',
    price: 2.48,
    change: 0.18,
    changePct: 7.83,
    high24: 2.52,
    low24: 2.41,
    volume24: 4800000000,
    marketCap: '142B $',
    history: genHistory('steady_up', 2.48, 60, 0.020, 113),
  },
  {
    id: 'doge',
    symbol: 'DOGE',
    name: 'Dogecoin',
    type: 'crypto',
    price: 0.38,
    change: 0.04,
    changePct: 11.76,
    high24: 0.39,
    low24: 0.36,
    volume24: 3200000000,
    marketCap: '56B $',
    history: genHistory('volatile_sideways', 0.38, 60, 0.030, 127),
  },
  {
    id: 'jgl',
    symbol: 'JGL',
    name: 'Jungle Inc.',
    type: 'stock',
    price: 178.50,
    change: 3.20,
    changePct: 1.83,
    high24: 179.10,
    low24: 176.80,
    volume24: 42500000,
    marketCap: '1.86T $',
    history: genHistory('steady_up', 178.50, 60, 0.015, 87),
  },
  {
    id: 'emtr',
    symbol: 'EMTR',
    name: 'E-Motor Corp.',
    type: 'stock',
    price: 268.40,
    change: -8.20,
    changePct: -2.96,
    high24: 272.10,
    low24: 263.80,
    volume24: 92400000,
    marketCap: '852B $',
    history: genHistory('volatile_sideways', 268.40, 60, 0.020, 17),
  },
  {
    id: 'orbx',
    symbol: 'ORBX',
    name: 'OrbitX Corp',
    type: 'stock',
    price: 412.80,
    change: 74.80,
    changePct: 22.13,
    high24: 422.50,
    low24: 408.10,
    volume24: 12500000,
    marketCap: '128B $',
    history: genHistory('breakout_up', 412.80, 60, 0.022, 19),
  },
  {
    id: 'pear',
    symbol: 'PEAR',
    name: 'Pear Inc.',
    type: 'stock',
    price: 234.80,
    change: 42.10,
    changePct: 21.85,
    high24: 236.40,
    low24: 231.20,
    volume24: 52800000,
    marketCap: '3.58T $',
    history: genHistory('steady_up', 234.80, 60, 0.012, 53),
  },
  {
    id: 'vidn',
    symbol: 'VIDN',
    name: 'Videon Corp.',
    type: 'stock',
    price: 146.20,
    change: 80.60,
    changePct: 122.90,
    high24: 148.10,
    low24: 142.80,
    volume24: 248000000,
    marketCap: '3.52T $',
    history: genHistory('exponential', 146.20, 60, 0.022, 59),
  },
  {
    id: 'msof',
    symbol: 'MSOF',
    name: 'Macrosoft Corp.',
    type: 'stock',
    price: 482.60,
    change: 82.30,
    changePct: 20.55,
    high24: 485.10,
    low24: 478.20,
    volume24: 18400000,
    marketCap: '3.59T $',
    history: genHistory('steady_up', 482.60, 60, 0.010, 61),
  },
  {
    id: 'omni',
    symbol: 'OMNI',
    name: 'Omniverse Inc.',
    type: 'stock',
    price: 582.40,
    change: 12.60,
    changePct: 2.21,
    high24: 585.90,
    low24: 572.40,
    volume24: 12400000,
    marketCap: '1.47T $',
    history: genHistory('steady_up', 582.40, 60, 0.015, 73),
  },
  {
    id: 'omga',
    symbol: 'OMGA',
    name: 'OmegaTech Inc.',
    type: 'stock',
    price: 198.20,
    change: 3.40,
    changePct: 1.74,
    high24: 199.50,
    low24: 195.80,
    volume24: 22100000,
    marketCap: '2.44T $',
    history: genHistory('steady_up', 198.20, 60, 0.013, 81),
  },
  {
    id: 'choc',
    symbol: 'CHOC',
    name: 'The Choco-Cola Co.',
    type: 'stock',
    price: 64.20,
    change: 0.80,
    changePct: 1.26,
    high24: 64.50,
    low24: 63.80,
    volume24: 14200000,
    marketCap: '277B $',
    history: genHistory('steady_up', 64.20, 60, 0.008, 97),
  },
  {
    id: 'leaf',
    symbol: 'LEAF',
    name: 'Green Leaf Corp.',
    type: 'stock',
    price: 8.42,
    change: -1.58,
    changePct: -15.80,
    high24: 8.74,
    low24: 8.31,
    volume24: 4820000,
    marketCap: '3.1B $',
    history: genHistory('steady_down', 8.42, 60, 0.030, 67),
  },
  {
    id: 'xau',
    symbol: 'XAU',
    name: 'Gold (per oz)',
    type: 'commodity',
    price: 2650.80,
    change: 480.20,
    changePct: 22.13,
    high24: 2662.10,
    low24: 2638.50,
    volume24: 180000,
    marketCap: '—',
    history: genHistory('breakout_up', 2650.80, 60, 0.008, 83),
  },
  {
    id: 'xag',
    symbol: 'XAG',
    name: 'Silver (per oz)',
    type: 'commodity',
    price: 31.42,
    change: 1.84,
    changePct: 6.22,
    high24: 31.68,
    low24: 31.10,
    volume24: 240000,
    marketCap: '—',
    history: genHistory('breakout_up', 31.42, 60, 0.014, 89),
  },
  {
    id: 'wti',
    symbol: 'WTI',
    name: 'WTI Crude Oil (per bbl)',
    type: 'commodity',
    price: 74.52,
    change: -2.18,
    changePct: -2.84,
    high24: 76.40,
    low24: 73.91,
    volume24: 420000,
    marketCap: '—',
    history: genHistory('volatile_sideways', 74.52, 60, 0.018, 29),
  },
  {
    id: 'brent',
    symbol: 'BRENT',
    name: 'Brent Crude Oil (per bbl)',
    type: 'commodity',
    price: 78.24,
    change: 1.06,
    changePct: 1.37,
    high24: 79.10,
    low24: 77.40,
    volume24: 380000,
    marketCap: '—',
    history: genHistory('pump_dump', 78.24, 60, 0.016, 31),
  },
];

export function getAsset(id: string): Asset | undefined {
  return assets.find(a => a.id === id);
}

export function formatPrice(p: number, type: AssetType): string {
  if (p >= 1000) return p.toFixed(2);
  if (p >= 100) return p.toFixed(2);
  if (p >= 1) return p.toFixed(4);
  if (p >= 0.01) return p.toFixed(4);
  return p.toFixed(6);
}

export function formatPct(p: number): string {
  const sign = p >= 0 ? '+' : '';
  return sign + p.toFixed(2) + '%';
}

export function tickAsset(asset: Asset): Asset {
  const vol = Math.max(asset.price * 0.0015, asset.price * 0.0005);
  const change = (Math.random() - 0.5) * vol;
  const newHistory = asset.history.slice();
  const last = newHistory[newHistory.length - 1];
  const newC = Math.max(0.000001, last.c + change);
  const newH = Math.max(last.h, newC);
  const newL = Math.min(last.l, newC);
  newHistory[newHistory.length - 1] = {
    ...last,
    c: newC,
    h: newH,
    l: newL,
    v: last.v + Math.floor(Math.random() * 50000),
  };
  const open = newHistory[0].c;
  const newPrice = newC;
  return {
    ...asset,
    price: newPrice,
    change: newPrice - open,
    changePct: ((newPrice - open) / open) * 100,
    high24: Math.max(asset.high24, newPrice),
    low24: Math.min(asset.low24, newPrice),
    history: newHistory,
  };
}
