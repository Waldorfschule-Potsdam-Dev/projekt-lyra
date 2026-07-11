import { useState, useMemo } from 'react';
import type { PricePoint, AssetType } from './TradeData';
import type { Theme } from './tradeTheme';
import { withAlpha } from './tradeTheme';

interface TradeChartProps {
  data: PricePoint[];
  color: string;
  type: AssetType;
  height?: number;
  theme: Theme;
}

type Timeframe = '1T' | '1W' | '1M' | '3M' | '1J' | 'Alle';

export function TradeChart({ data, color, type, height = 280, theme }: TradeChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [hover, setHover] = useState<{ x: number; y: number; point: PricePoint } | null>(null);

  const filteredData = useMemo(() => {
    const map = { '1T': 2, '1W': 7, '1M': 30, '3M': 60, '1J': 180, 'Alle': data.length } as const;
    const len = map[timeframe] || data.length;
    return data.slice(-Math.min(len, data.length));
  }, [data, timeframe]);

  const W = 800;
  const H = height;
  const VBW = 1000;
  const VBH = 400;
  const PAD_L = 56;
  const PAD_R = 70;
  const PAD_T = 16;
  const PAD_B = 32;
  const chartW = VBW - PAD_L - PAD_R;
  const chartH = VBH - PAD_T - PAD_B;

  const min = Math.min(...filteredData.map(p => p.l));
  const max = Math.max(...filteredData.map(p => p.h));
  const range = max - min || 1;
  const pad = range * 0.05;
  const yMin = min - pad;
  const yMax = max + pad;
  const yRange = yMax - yMin;

  const stepX = chartW / Math.max(1, filteredData.length - 1);
  const candleW = Math.max(2, stepX * 0.7);

  const toX = (i: number) => PAD_L + i * stepX;
  const toY = (v: number) => PAD_T + (1 - (v - yMin) / yRange) * chartH;

  const linePath = filteredData.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.c)}`).join(' ');
  const areaPath = filteredData.length > 0
    ? `${linePath} L ${toX(filteredData.length - 1)} ${PAD_T + chartH} L ${toX(0)} ${PAD_T + chartH} Z`
    : '';

  const maxVol = Math.max(...filteredData.map(p => p.v));
  const volH = 32;
  const volTop = VBH - PAD_B + 6;

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (yRange * i) / yTicks);

  const xTickCount = Math.min(6, filteredData.length);
  const xTickStep = Math.max(1, Math.floor(filteredData.length / xTickCount));
  const xTicks = Array.from({ length: xTickCount }, (_, i) => i * xTickStep).filter(i => i < filteredData.length);

  const isUp = filteredData.length > 0 && filteredData[filteredData.length - 1].c >= filteredData[0].c;
  const chartColor = color || (isUp ? theme.green : theme.red);
  const gradientId = `grad-${Math.random().toString(36).slice(2, 8)}`;
  const accent15 = withAlpha(theme.accent, 0.15);
  const accentBlue = theme.accent;
  const accentPurple = theme.purple;
  const isCrypto = type === 'crypto';
  const isCommodity = type === 'commodity';
  const marketColor = isCrypto ? accentPurple : isCommodity ? theme.gold : accentBlue;
  const marketLabel = isCrypto ? 'CRYPTO' : isCommodity ? 'ROHSTOFF' : 'AKTIE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.elevated }}>
      {/* Top toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 8px',
        borderBottom: `1px solid ${theme.border.default}`,
        fontSize: 11,
        flexShrink: 0,
      }}>
        {/* Market indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '3px 7px',
          background: withAlpha(marketColor, 0.15),
          border: `1px solid ${withAlpha(marketColor, 0.4)}`,
          borderRadius: 4,
          color: marketColor,
          fontSize: 9, fontWeight: 800, letterSpacing: 1,
          fontFamily: 'monospace',
          marginRight: 6,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: marketColor,
            boxShadow: `0 0 6px ${marketColor}`,
          }} />
          {marketLabel}
        </div>

        {(['1T', '1W', '1M', '3M', '1J', 'Alle'] as Timeframe[]).map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            style={{
              padding: '4px 8px',
              background: timeframe === tf ? accent15 : 'transparent',
              border: 'none',
              color: timeframe === tf ? theme.accent : theme.text.secondary,
              fontSize: 11, fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 4,
            }}
          >
            {tf}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setChartType('line')}
          style={{
            padding: '4px 8px',
            background: chartType === 'line' ? accent15 : 'transparent',
            border: 'none',
            color: chartType === 'line' ? theme.accent : theme.text.secondary,
            fontSize: 11, fontWeight: 600,
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >Linie</button>
        <button
          onClick={() => setChartType('candle')}
          style={{
            padding: '4px 8px',
            background: chartType === 'candle' ? accent15 : 'transparent',
            border: 'none',
            color: chartType === 'candle' ? theme.accent : theme.text.secondary,
            fontSize: 11, fontWeight: 600,
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >Kerzen</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8, color: theme.text.tertiary, fontSize: 11 }}>
          <span style={{ color: chartColor }}>●</span> Live
        </div>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * VBW;
            const y = ((e.clientY - rect.top) / rect.height) * VBH;
            if (x >= PAD_L && x <= VBW - PAD_R) {
              const i = Math.round((x - PAD_L) / stepX);
              if (i >= 0 && i < filteredData.length) {
                setHover({ x, y, point: filteredData[i] });
              }
            }
          }}
          onMouseLeave={() => setHover(null)}
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect x="0" y="0" width={VBW} height={VBH} fill={theme.bg.elevated} />

          {/* Grid Y */}
          {yTickValues.map((v, i) => (
            <g key={i}>
              <line
                x1={PAD_L} x2={VBW - PAD_R}
                y1={toY(v)} y2={toY(v)}
                stroke={theme.border.default} strokeWidth="0.5" strokeDasharray="2 4"
              />
              <text
                x={PAD_L - 4}
                y={toY(v) + 3}
                fill={theme.text.tertiary}
                fontSize="11"
                fontFamily="monospace"
                textAnchor="end"
              >
                {formatAxis(v)}
              </text>
              <text
                x={VBW - PAD_R + 6}
                y={toY(v) + 3}
                fill={theme.text.tertiary}
                fontSize="11"
                fontFamily="monospace"
              >
                {formatAxis(v)}
              </text>
            </g>
          ))}

          {/* Grid X */}
          {xTicks.map((i) => (
            <g key={i}>
              <line
                x1={toX(i)} x2={toX(i)}
                y1={PAD_T} y2={PAD_T + chartH}
                stroke={theme.border.default} strokeWidth="0.5"
              />
              <text
                x={toX(i)}
                y={PAD_T + chartH + 16}
                fill={theme.text.tertiary}
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {formatDate(filteredData[i].t)}
              </text>
            </g>
          ))}

          {/* Area + line */}
          {chartType === 'line' && (
            <>
              <path d={areaPath} fill={`url(#${gradientId})`} />
              <path d={linePath} fill="none" stroke={chartColor} strokeWidth="2" />
            </>
          )}

          {/* Candles */}
          {chartType === 'candle' && filteredData.map((p, i) => {
            const up = p.c >= p.o;
            const c = up ? theme.green : theme.red;
            const x = toX(i) - candleW / 2;
            const yo = toY(p.o);
            const yc = toY(p.c);
            const yh = toY(p.h);
            const yl = toY(p.l);
            return (
              <g key={i}>
                <line x1={toX(i)} y1={yh} x2={toX(i)} y2={yl} stroke={c} strokeWidth="1" />
                <rect
                  x={x}
                  y={Math.min(yo, yc)}
                  width={candleW}
                  height={Math.max(1, Math.abs(yo - yc))}
                  fill={c}
                  opacity={up ? 0.9 : 0.9}
                />
              </g>
            );
          })}

          {/* Crosshair */}
          {hover && (
            <g>
              <line
                x1={hover.x} x2={hover.x}
                y1={PAD_T} y2={PAD_T + chartH}
                stroke={theme.text.muted} strokeWidth="0.5" strokeDasharray="2 2"
              />
              <line
                x1={PAD_L} x2={VBW - PAD_R}
                y1={hover.y} y2={hover.y}
                stroke={theme.text.muted} strokeWidth="0.5" strokeDasharray="2 2"
              />
              <circle cx={hover.x} cy={toY(hover.point.c)} r="4" fill={chartColor} />
              <rect
                x={VBW - PAD_R + 4}
                y={hover.y - 10}
                width="60"
                height="20"
                fill={theme.bg.panel}
                stroke={theme.border.strong}
                strokeWidth="0.5"
              />
              <text
                x={VBW - PAD_R + 8}
                y={hover.y + 4}
                fill={chartColor}
                fontSize="11"
                fontFamily="monospace"
                fontWeight="600"
              >
                {hover.point.c.toFixed(4)}
              </text>
            </g>
          )}

          {/* Volume bars */}
          {filteredData.map((p, i) => {
            const up = p.c >= p.o;
            const c = up ? theme.green : theme.red;
            const h = (p.v / maxVol) * volH;
            return (
              <rect
                key={i}
                x={toX(i) - candleW / 2}
                y={volTop + (volH - h)}
                width={candleW}
                height={h}
                fill={c}
                opacity="0.4"
              />
            );
          })}

          {/* Current price line */}
          {filteredData.length > 0 && (
            <g>
              <line
                x1={PAD_L} x2={VBW - PAD_R}
                y1={toY(filteredData[filteredData.length - 1].c)}
                y2={toY(filteredData[filteredData.length - 1].c)}
                stroke={chartColor}
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              {/* Pulsing live dot */}
              <circle
                cx={toX(filteredData.length - 1)}
                cy={toY(filteredData[filteredData.length - 1].c)}
                fill={chartColor}
              >
                <animate
                  attributeName="r"
                  values="3;12;3"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx={toX(filteredData.length - 1)}
                cy={toY(filteredData[filteredData.length - 1].c)}
                r="3"
                fill={chartColor}
              />
              <rect
                x={VBW - PAD_R + 4}
                y={toY(filteredData[filteredData.length - 1].c) - 9}
                width="62"
                height="18"
                fill={chartColor}
              />
              <text
                x={VBW - PAD_R + 8}
                y={toY(filteredData[filteredData.length - 1].c) + 4}
                fill={theme.text.inverse}
                fontSize="11"
                fontFamily="monospace"
                fontWeight="700"
              >
                {formatAxis(filteredData[filteredData.length - 1].c)}
              </text>
            </g>
          )}
        </svg>

        {/* Hover tooltip */}
        {hover && (
          <div style={{
            position: 'absolute',
            left: 12, top: 12,
            padding: '8px 10px',
            background: theme.mode === 'dark' ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.97)',
            border: `1px solid ${theme.border.strong}`,
            borderRadius: 4,
            fontSize: 11,
            color: theme.text.primary,
            fontFamily: 'monospace',
            pointerEvents: 'none',
            zIndex: 5,
            boxShadow: theme.mode === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <div style={{ color: theme.text.tertiary, marginBottom: 2 }}>{new Date(hover.point.t).toLocaleDateString('de-DE')}</div>
            <div>O <span style={{ color: theme.text.secondary }}>{hover.point.o.toFixed(4)}</span></div>
            <div>H <span style={{ color: theme.green }}>{hover.point.h.toFixed(4)}</span></div>
            <div>L <span style={{ color: theme.red }}>{hover.point.l.toFixed(4)}</span></div>
            <div>C <span style={{ color: chartColor, fontWeight: 700 }}>{hover.point.c.toFixed(4)}</span></div>
            <div style={{ color: theme.text.tertiary, marginTop: 2 }}>V {(hover.point.v / 1e6).toFixed(2)}M</div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatAxis(v: number): string {
  if (v >= 1000) return v.toFixed(0);
  if (v >= 100) return v.toFixed(1);
  if (v >= 1) return v.toFixed(3);
  return v.toFixed(5);
}

function formatDate(t: number): string {
  const d = new Date(t);
  return `${d.getDate()}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}
