import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Star, TrendingUp, TrendingDown } from 'lucide-react';
import type { Asset } from './TradeData';
import { formatPct } from './TradeData';
import type { Theme } from './tradeTheme';
import { withAlpha } from './tradeTheme';

interface TradeWatchlistProps {
  assets: Asset[];
  selectedId: string;
  onSelect: (id: string) => void;
  onBack?: () => void;
  theme: Theme;
}

type Filter = 'Alle' | 'Aktien' | 'Crypto' | 'Rohstoffe' | 'Favoriten';

const FAV_STORAGE_KEY = 'escape-boersen-terminal-favorites';
const DEFAULT_FAVS = ['wcm', 'alpha', 'fuehrer'];

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_STORAGE_KEY);
    if (!raw) return new Set(DEFAULT_FAVS);
    const parsed = JSON.parse(raw) as string[];
    if (Array.isArray(parsed)) return new Set(parsed);
  } catch { /* ignore */ }
  return new Set(DEFAULT_FAVS);
}

export function TradeWatchlist({ assets, selectedId, onSelect, onBack, theme }: TradeWatchlistProps) {
  const [filter, setFilter] = useState<Filter>('Alle');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites());
  const initialMount = useRef(true);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    try {
      localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(Array.from(favorites)));
    } catch { /* ignore */ }
  }, [favorites]);

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = assets.filter(a => {
    if (filter === 'Aktien' && a.type !== 'stock') return false;
    if (filter === 'Crypto' && a.type !== 'crypto') return false;
    if (filter === 'Rohstoffe' && a.type !== 'commodity') return false;
    if (filter === 'Favoriten' && !favorites.has(a.id)) return false;
    if (search && !a.symbol.toLowerCase().includes(search.toLowerCase()) && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    Alle: assets.length,
    Aktien: assets.filter(a => a.type === 'stock').length,
    Crypto: assets.filter(a => a.type === 'crypto').length,
    Rohstoffe: assets.filter(a => a.type === 'commodity').length,
    Favoriten: favorites.size,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.page }}>
      {/* Section header */}
      <div style={{
        padding: '6px 10px 4px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `1px solid ${theme.border.subtle}`,
        flexShrink: 0,
      }}>
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Zurück"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              marginRight: 2,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.text.secondary,
            }}
          >
            <ArrowLeft size={14} />
          </button>
        )}
        <div style={{
          fontSize: 10, fontWeight: 800, color: theme.accent,
          letterSpacing: 1.5, textTransform: 'uppercase',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Beobachtungsliste
        </div>
        <div style={{ flex: 1, height: 1, background: withAlpha(theme.accent, 0.3) }} />
        <div style={{
          fontSize: 10, fontWeight: 700, color: theme.text.tertiary,
          fontFamily: 'monospace', letterSpacing: 0.5,
        }}>
          [{filtered.length}/{counts[filter]}]
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '6px 8px 4px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: theme.bg.input,
          border: `1px solid ${theme.border.default}`,
          borderRadius: 6,
          padding: '5px 8px',
        }}>
          <Search size={12} color={theme.text.tertiary} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Symbol oder Name suchen..."
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 11, color: theme.text.primary,
            }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border.default}`, flexShrink: 0 }}>
        {(['Alle', 'Aktien', 'Crypto', 'Rohstoffe', 'Favoriten'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1, padding: '7px 0',
              background: 'none', border: 'none',
              color: filter === f ? theme.text.primary : theme.text.tertiary,
              fontSize: 10, fontWeight: 700,
              cursor: 'pointer',
              borderBottom: filter === f ? `2px solid ${theme.accent}` : '2px solid transparent',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Asset list */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: theme.text.muted, fontSize: 11 }}>
            Keine Treffer
          </div>
        )}
        {filtered.map(a => {
          const isUp = a.change >= 0;
          const isSelected = a.id === selectedId;
          return (
            <div
              key={a.id}
              onClick={() => onSelect(a.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px',
                cursor: 'pointer',
                background: isSelected ? withAlpha(theme.accent, 0.12) : 'transparent',
                borderLeft: isSelected ? `2px solid ${theme.accent}` : '2px solid transparent',
                borderBottom: `1px solid ${theme.border.subtle}`,
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = theme.bg.hover;
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'transparent';
              }}
            >
              <button
                onClick={(e) => toggleFav(a.id, e)}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  cursor: 'pointer', display: 'flex',
                }}
              >
                <Star
                  size={12}
                  fill={favorites.has(a.id) ? theme.gold : 'transparent'}
                  color={favorites.has(a.id) ? theme.gold : theme.text.muted}
                />
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: theme.text.primary }}>{a.symbol}</span>
                  {a.type === 'crypto' && (
                    <span style={{
                      fontSize: 9, color: theme.purple, background: withAlpha(theme.purple, 0.15),
                      padding: '1px 4px', borderRadius: 3, fontWeight: 700, letterSpacing: 0.5,
                    }}>
                      CRYPTO
                    </span>
                  )}
                  {a.type === 'stock' && (
                    <span style={{
                      fontSize: 9, color: theme.accent, background: withAlpha(theme.accent, 0.15),
                      padding: '1px 4px', borderRadius: 3, fontWeight: 700, letterSpacing: 0.5,
                    }}>
                      AKTIE
                    </span>
                  )}
                  {a.type === 'commodity' && (
                    <span style={{
                      fontSize: 9, color: theme.gold, background: withAlpha(theme.gold, 0.15),
                      padding: '1px 4px', borderRadius: 3, fontWeight: 700, letterSpacing: 0.5,
                    }}>
                      ROHSTOFF
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 10, color: theme.text.tertiary,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {a.name}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.text.primary, fontFamily: 'monospace' }}>
                  {a.price >= 1 ? a.price.toFixed(2) : a.price.toFixed(4)}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 600,
                  color: isUp ? theme.green : theme.red,
                  display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end',
                  fontFamily: 'monospace',
                }}>
                  {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {formatPct(a.changePct)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
