import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Users, Cpu, HardDrive, Clock as ClockIcon, Calendar, AlertTriangle, Wrench, Megaphone, Shield, MapPin } from 'lucide-react';
import { serverInfo, players, news, events, skinEmoji, pixelCss } from './BlockcraftData';
import { socialTheme } from './SocialTheme';

const STATUS_COLOR: Record<string, string> = {
  online: '#5D7C15',
  afk: '#f59e0b',
  offline: '#6b7280',
};

const STATUS_LABEL: Record<string, string> = {
  online: 'ONLINE',
  afk: 'AFK',
  offline: 'OFFLINE',
};

const CATEGORY_COLOR: Record<string, string> = {
  patch: '#1d9bf0',
  event: '#a855f7',
  whitelist: '#FFD700',
  warn: '#b91c1c',
};

const CATEGORY_ICON: Record<string, typeof Wrench> = {
  patch: Wrench,
  event: Calendar,
  whitelist: Shield,
  warn: AlertTriangle,
};

export default function BlockcraftServerPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const onlinePlayers = useMemo(
    () => players.filter(p => p.status !== 'offline'),
    []
  );

  const onlineCount = onlinePlayers.length;

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(serverInfo.ip).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #0a0a14 0%, #14142b 50%, #0a0a14 100%)',
      color: '#e5e7eb',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{pixelCss}</style>

      {/* Hintergrund-Pixelgitter */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(93, 124, 21, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(93, 124, 21, 0.04) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        background: 'rgba(0,0,0,0.5)',
        borderBottom: '3px solid #000',
        boxShadow: '0 2px 0 #5D7C15',
        position: 'relative',
        zIndex: 2,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <button
            onClick={() => navigate('/browser')}
            style={{
              background: '#2a2a2a', border: '2px solid #000',
              padding: '6px 8px', cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.4), inset 2px 2px 0 rgba(255,255,255,0.1)',
            }}
          >
            <ArrowLeft size={14} />
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="mc-float" style={{
              width: 28, height: 28,
              background: '#5D7C15',
              border: '3px solid #000',
              boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.4), inset 3px 3px 0 rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>⛏</div>
            <div className="mc-mono" style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#FFD700',
              letterSpacing: 1.5,
              textShadow: '2px 2px 0 #000',
            }}>
              ALLIANZ-CRAFT
            </div>
          </div>
          <div className={`mc-status-led ${serverInfo.status === 'offline' ? 'offline' : serverInfo.status === 'maintenance' ? 'maintenance' : ''}`} />
        </div>
        <div className="mc-mono" style={{
          fontSize: 10, color: '#9ca3af', letterSpacing: 1,
          textAlign: 'center', textTransform: 'uppercase',
        }}>
          {serverInfo.motd}
        </div>
      </div>

      {/* Stats-Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 6,
        padding: '10px 12px',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '2px solid #1f2937',
        position: 'relative',
        zIndex: 2,
        flexShrink: 0,
      }}>
        <StatChip icon={Users} label="ONLINE" value={`${onlineCount}/${players.length}`} color="#5D7C15" />
        <StatChip icon={Cpu} label="TPS" value={serverInfo.tps.toFixed(1)} color="#1d9bf0" />
        <StatChip icon={HardDrive} label="RAM" value={`${serverInfo.ramUsage}%`} color="#a855f7" />
        <StatChip icon={ClockIcon} label="UPTIME" value={serverInfo.uptime.split(',')[0]} color="#FFD700" />
      </div>

      {/* Scrollable Body */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 2 }}>
        {/* IP-Block + Join */}
        <div style={{ padding: '12px' }}>
          <div className="mc-block" style={{
            background: '#1f2937',
            padding: 10,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mc-mono" style={{ fontSize: 9, color: '#9ca3af', letterSpacing: 1, marginBottom: 2 }}>
                SERVER-IP
              </div>
              <div className="mc-mono" style={{
                fontSize: 14, color: '#FFD700', fontWeight: 900,
                letterSpacing: 0.5, overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {serverInfo.ip}
              </div>
              <div className="mc-mono" style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>
                :{serverInfo.port} · v{serverInfo.version}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="mc-block"
              style={{
                background: copied ? '#5D7C15' : '#2a2a2a',
                border: '3px solid #000',
                padding: '8px 10px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: "'Courier New', monospace",
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: 1,
                boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.4), inset 3px 3px 0 rgba(255,255,255,0.1)',
                transition: 'background 0.15s',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'KOPIERT' : 'KOPIEREN'}
            </button>
          </div>
        </div>

        {/* Spieler-Grid */}
        <div style={{ padding: '4px 12px 14px' }}>
          <SectionHeader icon={Users} label="SPIELER ONLINE" count={`${onlineCount}`} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            marginTop: 8,
          }}>
            {players.map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>

        {/* News */}
        <div style={{ padding: '0 12px 14px' }}>
          <SectionHeader icon={Megaphone} label="SERVER-NACHRICHTEN" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {news.map(n => {
              const Icon = CATEGORY_ICON[n.category] || Megaphone;
              return (
                <div key={n.id} className="mc-block" style={{
                  background: '#1f2937',
                  padding: 10,
                  borderLeft: `4px solid ${CATEGORY_COLOR[n.category]}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Icon size={12} color={CATEGORY_COLOR[n.category]} />
                    <div className="mc-mono" style={{
                      fontSize: 9, color: CATEGORY_COLOR[n.category],
                      letterSpacing: 1.2, fontWeight: 900, textTransform: 'uppercase',
                    }}>
                      {n.category}
                    </div>
                    <div className="mc-mono" style={{ fontSize: 9, color: '#6b7280', marginLeft: 'auto' }}>
                      {n.date}
                    </div>
                  </div>
                  <div className="mc-mono" style={{
                    fontSize: 12, color: '#fff', fontWeight: 900,
                    letterSpacing: 0.5, marginBottom: 4,
                  }}>
                    {n.title}
                  </div>
                  <div style={{
                    fontSize: 11, color: '#9ca3af', lineHeight: 1.4,
                    fontFamily: 'system-ui, sans-serif',
                  }}>
                    {n.body}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events */}
        <div style={{ padding: '0 12px 14px' }}>
          <SectionHeader icon={Calendar} label="KOMMENDE EVENTS" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {events.map(e => (
              <div key={e.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#1f2937',
                padding: '8px 10px',
                border: '2px solid #000',
                boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.4), inset 2px 2px 0 rgba(255,255,255,0.05)',
              }}>
                <MapPin size={14} color="#FFD700" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mc-mono" style={{
                    fontSize: 11, color: '#fff', fontWeight: 900, letterSpacing: 0.5,
                  }}>
                    {e.title}
                  </div>
                  <div style={{
                    fontSize: 10, color: '#9ca3af', lineHeight: 1.3, marginTop: 2,
                    fontFamily: 'system-ui, sans-serif',
                  }}>
                    {e.body}
                  </div>
                </div>
                <div className="mc-mono" style={{
                  fontSize: 9, color: '#FFD700', fontWeight: 900,
                  letterSpacing: 1, textAlign: 'right', flexShrink: 0,
                }}>
                  {e.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gras-Block-Bar unten */}
      <div className="mc-grass-strip" style={{
        height: 14, position: 'relative', zIndex: 2, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="mc-dirt-strip" style={{
          position: 'absolute', bottom: -8, left: 0, right: 0, height: 4,
          opacity: 0.4,
        }} />
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string; color: string }) {
  return (
    <div className="mc-block" style={{
      background: '#1f2937',
      padding: '6px 4px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }}>
      <Icon size={11} color={color} />
      <div className="mc-mono" style={{
        fontSize: 11, color: '#fff', fontWeight: 900, letterSpacing: 0.5,
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div className="mc-mono" style={{
        fontSize: 7, color: '#6b7280', letterSpacing: 1,
        lineHeight: 1,
      }}>
        {label}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, label, count }: { icon: typeof Users; label: string; count?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={13} color="#5D7C15" />
      <div className="mc-mono" style={{
        fontSize: 11, color: '#FFD700', fontWeight: 900,
        letterSpacing: 1.5, textTransform: 'uppercase',
      }}>
        {label}
      </div>
      {count && (
        <div className="mc-mono" style={{
          fontSize: 10, color: '#9ca3af',
          background: '#1f2937', padding: '2px 6px',
          border: '2px solid #000',
          letterSpacing: 0.5,
        }}>
          {count}
        </div>
      )}
      <div style={{ flex: 1, height: 2, background: '#1f2937' }} />
    </div>
  );
}

function PlayerCard({ player }: { player: typeof players[number] }) {
  const skin = skinEmoji[player.skin] || '🧑';
  const statusColor = STATUS_COLOR[player.status];

  return (
    <div className="mc-block" style={{
      background: '#1f2937',
      padding: 8,
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 32, height: 32,
          background: '#0a0a14',
          border: '2px solid #000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
          boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.5), inset 2px 2px 0 rgba(255,255,255,0.05)',
        }}>
          {skin}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mc-mono" style={{
            fontSize: 10, color: '#fff', fontWeight: 900,
            letterSpacing: 0.3, overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {player.username}
          </div>
          <div className="mc-mono" style={{
            fontSize: 8, color: player.rankColor, fontWeight: 900,
            letterSpacing: 1, textTransform: 'uppercase', marginTop: 2,
          }}>
            {player.rank}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: statusColor,
            boxShadow: player.status === 'online' ? `0 0 4px ${statusColor}` : 'none',
          }} />
          <div className="mc-mono" style={{
            fontSize: 7, color: statusColor, fontWeight: 900, letterSpacing: 0.5,
          }}>
            {STATUS_LABEL[player.status]}
          </div>
        </div>
      </div>
      <div className="mc-mono" style={{
        fontSize: 9, color: '#9ca3af', fontStyle: 'italic', lineHeight: 1.2,
        borderLeft: '2px solid #5D7C15', paddingLeft: 5,
      }}>
        „{player.motto}"
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
        <Mini label="BLK" value={player.blocksPlaced.toLocaleString('de-DE')} color="#FFD700" />
        <Mini label="K/D" value={`${player.kills}/${player.deaths}`} color="#b91c1c" />
        <Mini label="TAGE" value={String(player.joinedDays)} color="#1d9bf0" />
      </div>
    </div>
  );
}

function Mini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      flex: 1, background: '#0a0a14',
      border: '1px solid #000', padding: '2px 3px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minWidth: 0,
    }}>
      <div className="mc-mono" style={{
        fontSize: 9, color, fontWeight: 900, letterSpacing: 0.3,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        maxWidth: '100%',
      }}>
        {value}
      </div>
      <div className="mc-mono" style={{
        fontSize: 6, color: '#6b7280', letterSpacing: 0.5,
        lineHeight: 1,
      }}>
        {label}
      </div>
    </div>
  );
}
