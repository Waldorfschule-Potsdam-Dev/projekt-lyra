import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Users, Cloud, Trophy, Telescope, TrendingUp, Coins, Globe, Pickaxe, type LucideIcon } from 'lucide-react';
import { socialTheme, hexToRgba, socialGlobalCss } from './SocialTheme';

interface WebsiteEntry {
  id: string;
  name: string;
  domain: string;
  accent: string;
  letters: string;
  route: string;
  notifications: number;
  shortcut: string;
  description: string;
  restricted?: boolean;
  clearance: string;
  icon: LucideIcon;
}

const websites: WebsiteEntry[] = [
  {
    id: 'vox-kommun',
    name: 'VOX KOMMUN',
    domain: 'vox.allianz-intern.net',
    accent: '#1d9bf0',
    letters: 'VK',
    route: 'vox-kommun',
    notifications: 3,
    shortcut: 'V',
    description: 'Internes soziales Netzwerk der Allianz. Profile, Beiträge, private Andeutungen. Alle Aktivitäten werden protokolliert.',
    restricted: true,
    clearance: 'INTERN',
    icon: Users,
  },
  {
    id: 'wetter-360',
    name: 'WETTER 360',
    domain: 'wetter.allianz-intern.net',
    accent: '#00ba7c',
    letters: 'W3',
    route: 'wetter-360',
    notifications: 0,
    shortcut: 'W',
    description: 'Wetterbericht für alle Sektoren. Temperaturen, Niederschlag, UV-Index. Öffentlich zugänglich.',
    clearance: 'ÖFFENTLICH',
    icon: Cloud,
  },
  {
    id: 'torjaeger-live',
    name: 'TORJÄGER LIVE',
    domain: 'sport.allianz-intern.net',
    accent: '#f4212e',
    letters: 'TL',
    route: 'torjaeger-live',
    notifications: 1,
    shortcut: 'T',
    description: 'Sportnachrichten und Fußballergebnisse. Parteiinterne Meinungsfreiheit garantiert.',
    clearance: 'ÖFFENTLICH',
    icon: Trophy,
  },
  {
    id: 'sternenwelt',
    name: 'STERNENWELT',
    domain: 'himmel.allianz-intern.net',
    accent: '#7856ff',
    letters: 'SW',
    route: 'sternenwelt',
    notifications: 0,
    shortcut: 'S',
    description: 'Sternenhimmel-Beobachtung und Astronomie. Für alle Mitglieder zugänglich.',
    clearance: 'ÖFFENTLICH',
    icon: Telescope,
  },
  {
    id: 'boersen-terminal',
    name: 'BÖRSEN-TERMINAL',
    domain: 'boerse.allianz-intern.net',
    accent: '#00ba7c',
    letters: 'BT',
    route: 'boersen-terminal',
    notifications: 0,
    shortcut: 'B',
    description: 'Aktien und Kryptowährungen in Echtzeit. Charts, Marktanalysen, historische Verläufe. Zugang nur für interne Mitarbeiter.',
    restricted: true,
    clearance: 'INTERN',
    icon: TrendingUp,
  },
  {
    id: 'casino',
    name: 'BLACK DIAMOND',
    domain: 'casino.allianz-intern.net',
    accent: '#d4af37',
    letters: 'BD',
    route: 'casino',
    notifications: 0,
    shortcut: 'C',
    description: 'Casino Royale. Slots, Roulette, Higher-or-Lower und Coin Flip. 1000 Credits Startguthaben. Glücksspiel kann süchtig machen.',
    clearance: 'ÖFFENTLICH',
    icon: Coins,
  },
  // {
  //   id: 'blockcraft',
  //   name: 'ALLIANZ-CRAFT',
  //   domain: 'mc.allianz-intern.net',
  //   accent: '#5D7C15',
  //   letters: 'AC',
  //   route: 'blockcraft',
  //   notifications: 2,
  //   shortcut: 'M',
  //   description: 'Interner Blockcraft-Server der Allianz. Whitelist aktiv, PvP deaktiviert, Propagandaplakate willkommen. Whitelist-Reset am 01.07.',
  //   clearance: 'ÖFFENTLICH',
  //   icon: Pickaxe,
  // },
];

export default function BrowserHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return websites;
    return websites.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.domain.toLowerCase().includes(q) ||
      w.shortcut.toLowerCase() === q
    );
  }, [query]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return websites.find(w =>
      w.name.toLowerCase() === q ||
      w.domain.toLowerCase() === q ||
      w.shortcut.toLowerCase() === q
    );
  }, [query]);

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && exactMatch) {
      navigate(exactMatch.route);
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#000',
      color: socialTheme.text.primary,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{socialGlobalCss}</style>

      {/* Subtle vertical scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(29, 155, 240, 0.015) 2px, rgba(29, 155, 240, 0.015) 3px)`,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      <div style={{ height: 8 }} />

      {/* Browser Logo / Crome */}
      <div style={{ padding: '0 24px 4px 28px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Browser-style logo */}
          <div style={{
            position: 'relative',
            width: 56, height: 56,
          }}>
            <Globe color="#1d9bf0" size={56} strokeWidth={1.5} />
            <div style={{
              position: 'absolute', inset: 0,
              boxShadow: socialTheme.glow.blueSoft,
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{
              fontSize: 32,
              fontWeight: 800,
              color: socialTheme.text.primary,
              letterSpacing: 4,
              fontFamily: socialTheme.font.system,
              textTransform: 'uppercase',
            }}>
              CROME
            </span>
            <span style={{
              fontSize: 9,
              color: socialTheme.accent.blue,
              marginTop: 6,
              letterSpacing: 3,
              textTransform: 'uppercase',
              fontFamily: socialTheme.font.mono,
              fontWeight: 600,
            }}>
              SICHERHEITS-BROWSER · 14.27
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          marginTop: 12,
          fontSize: 11,
          color: socialTheme.text.tertiary,
          letterSpacing: 2,
          fontFamily: socialTheme.font.mono,
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          ALLE AKTIVITÄTEN WERDEN PROTOKOLLIERT
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '20px 16px 8px 16px', position: 'relative', zIndex: 2 }}>
        <div style={{
          background: socialTheme.bg.secondary,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          border: `1px solid ${socialTheme.border.subtle}`,
          borderRadius: 12,
        }}>
          <Search size={16} color={socialTheme.text.tertiary} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleEnter}
            placeholder="SUCHE · URL · BEFEHL"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, color: socialTheme.text.primary,
              letterSpacing: 1,
              fontFamily: socialTheme.font.mono,
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          />
          {query && (
            <X size={14} color={socialTheme.text.tertiary} style={{ cursor: 'pointer' }} onClick={() => setQuery('')} />
          )}
        </div>
        {query && exactMatch && (
          <div style={{
            marginTop: 8, paddingLeft: 4,
            fontSize: 11, color: socialTheme.accent.blue,
            letterSpacing: 1, fontFamily: socialTheme.font.mono,
            fontWeight: 600,
          }}>
            [ ENTER ] · ÖFFNE {exactMatch.name}
          </div>
        )}
        {query && !exactMatch && (
          <div style={{
            marginTop: 8, paddingLeft: 4,
            fontSize: 11, color: socialTheme.text.tertiary,
            letterSpacing: 1, fontFamily: socialTheme.font.mono,
            fontWeight: 600,
          }}>
            // KEIN ERGEBNIS
          </div>
        )}
      </div>

      {/* Website list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', position: 'relative', zIndex: 2 }} className="hide-scrollbar">
        <div style={{
          fontSize: 14,
          fontWeight: 800,
          color: socialTheme.accent.blue,
          padding: '0 0 12px',
          textTransform: 'uppercase',
          letterSpacing: 2,
          fontFamily: socialTheme.font.system,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 24, height: 2, background: socialTheme.accent.blue }} />
          VERFÜGBARE WEBSEITEN
          <div style={{ flex: 1, height: 1, background: socialTheme.accent.blue }} />
          <span style={{ color: socialTheme.text.tertiary, fontSize: 12, fontFamily: socialTheme.font.mono }}>[7]</span>
        </div>

        {filtered.length === 0 && (
          <div style={{
            padding: 32, textAlign: 'center',
            color: socialTheme.text.tertiary, fontSize: 12,
            fontFamily: socialTheme.font.mono, letterSpacing: 1,
          }}>
            // KEIN TREFFER
          </div>
        )}

        {filtered.map(site => (
          <Link
            key={site.id}
            to={site.route}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'stretch',
              background: socialTheme.bg.secondary,
              marginBottom: 12,
              cursor: 'pointer',
              position: 'relative',
              border: `1px solid ${socialTheme.border.subtle}`,
              borderRadius: 16,
              overflow: 'hidden',
              transition: 'border-color 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = hexToRgba(site.accent, 0.5);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = socialTheme.border.subtle;
            }}
            >
              {/* Logo */}
              <div style={{
                width: 64,
                background: site.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'white',
                fontWeight: 900,
                fontSize: 22,
                letterSpacing: 1,
                fontFamily: socialTheme.font.system,
                position: 'relative',
              }}>
                {site.letters}
                <div style={{
                  position: 'absolute', top: 4, left: 4, right: 4, bottom: 4,
                  border: '1px solid rgba(0,0,0,0.3)',
                  pointerEvents: 'none',
                  borderRadius: 8,
                }} />
              </div>

              <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
                <div style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: socialTheme.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: socialTheme.font.system,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}>
                  <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {site.name}
                  </span>
                  {site.restricted && (
                    <span style={{
                      fontSize: 9,
                      color: 'white',
                      background: site.accent,
                      padding: '2px 6px',
                      fontWeight: 900,
                      letterSpacing: 1.5,
                      fontFamily: socialTheme.font.mono,
                      borderRadius: 4,
                      flexShrink: 0,
                    }}>
                      {site.clearance}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 10,
                  color: socialTheme.text.secondary,
                  marginTop: 4,
                  fontFamily: socialTheme.font.mono,
                  letterSpacing: 1,
                  fontWeight: 600,
                }}>
                  {site.domain}
                </div>
                <div style={{
                  fontSize: 9,
                  color: socialTheme.text.tertiary,
                  marginTop: 6,
                  fontFamily: socialTheme.font.mono,
                  letterSpacing: 0.5,
                  lineHeight: 1.4,
                }}>
                  {site.description}
                </div>
              </div>

              <div style={{
                position: 'relative',
                flexShrink: 0,
                padding: 14,
                display: 'flex', alignItems: 'center',
              }}>
                {site.icon && (() => {
                  const Icon = site.icon;
                  return (
                    <Icon
                      size={20}
                      color={site.notifications > 0 ? site.accent : socialTheme.text.tertiary}
                    />
                  );
                })()}
                {site.notifications > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 6, right: 6,
                    minWidth: 20, height: 20,
                    padding: '0 5px',
                    background: site.accent,
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 12px ${site.accent}88`,
                    fontFamily: socialTheme.font.mono,
                    letterSpacing: 0.5,
                  }}>
                    {site.notifications}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}

        <div style={{
          marginTop: 24,
          padding: '16px 12px',
          fontSize: 10,
          color: socialTheme.text.tertiary,
          textAlign: 'left',
          lineHeight: 1.8,
          fontFamily: socialTheme.font.mono,
          letterSpacing: 1,
          borderTop: `1px solid ${socialTheme.border.subtle}`,
        }}>
          <div style={{ color: socialTheme.accent.blue, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            SITZUNGSPROTOKOLL
          </div>
          SESSION · guest@nexus<br />
          COOKIE · GESP. · AUTO-LOGIN<br />
          UPLINK · SD-VERSCHLÜSSELT<br />
          GERÄT-ID · 0xA7-F-2C4B-99<br />
          LETZTER ZUGRIFF · VOR 3 TAGEN
        </div>
      </div>
    </div>
  );
}