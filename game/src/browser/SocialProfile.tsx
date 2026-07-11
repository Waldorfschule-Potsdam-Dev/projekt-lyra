import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, MoreHorizontal, BadgeCheck, Lock, Shield, Eye } from 'lucide-react';
import type { Profile, Post } from './SocialData';
import { rankOrder, posts, currentUser } from './SocialData';
import { socialTheme, hexToRgba, socialGlobalCss } from './SocialTheme';
import { PostCard } from './SocialFeed';

interface SocialProfileProps {
  profile: Profile;
  onBack: () => void;
  onOpenProfile: (id: string) => void;
  isFollowing: boolean;
  onToggleFollow: () => void;
  isOwn?: boolean;
  ownPosts?: Post[];
}

export function SocialProfile({ profile, onBack, onOpenProfile, isFollowing, onToggleFollow, isOwn = false, ownPosts = [] }: SocialProfileProps) {
  const [showPrivateHint, setShowPrivateHint] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts');
  const userRankLevel = rankOrder.indexOf(currentUser.rank);
  const profileRankLevel = profile.rankLevel;

  const userPosts = isOwn
    ? ownPosts
    : posts.filter(p => p.authorId === profile.id);
  const lockedPosts = userPosts.filter(p => {
    if (!p.locked || !p.requiredRank) return false;
    return userRankLevel < rankOrder.indexOf(p.requiredRank);
  });
  const visiblePosts = userPosts.filter(p => {
    if (!p.locked || !p.requiredRank) return true;
    return userRankLevel >= rankOrder.indexOf(p.requiredRank);
  });

  const isHighRank = profile.rankLevel >= 8;
  const rankColor = socialTheme.rankColor[profile.rank] || '#71767b';
  const loyaltyColor = socialTheme.loyaltyColor[profile.loyalty];
  const statusColor = socialTheme.statusColor[profile.status];

  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: socialTheme.bg.primary }} className="hide-scrollbar">
      <style>{socialGlobalCss}</style>

      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: socialTheme.bg.glass,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${socialTheme.border.subtle}`,
        padding: '4px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', padding: 6, cursor: 'pointer',
          borderRadius: '50%', display: 'flex', alignItems: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <ArrowLeft size={20} color={socialTheme.text.primary} />
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: socialTheme.text.primary, fontFamily: socialTheme.font.system, lineHeight: 1.2 }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 12, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system }}>
            {visiblePosts.length} Beiträge
          </div>
        </div>
      </div>

      {/* Banner */}
      <div style={{
        height: 200,
        position: 'relative',
        background: `linear-gradient(135deg, ${profile.accentColor} 0%, ${hexToRgba(profile.accentColor, 0.4)} 100%)`,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 5px)`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 80, fontWeight: 800,
          color: 'rgba(0,0,0,0.12)',
          fontFamily: socialTheme.font.system,
          letterSpacing: 8,
          pointerEvents: 'none',
        }}>
          {profile.initials}
        </div>
      </div>

      {/* Avatar + Actions */}
      <div style={{ padding: '0 16px', position: 'relative' }}>
        <div style={{
          width: 134, height: 134,
          borderRadius: '50%',
          background: isHighRank
            ? `linear-gradient(135deg, ${profile.accentColor}, ${hexToRgba(profile.accentColor, 0.6)})`
            : profile.accentColor,
          border: `4px solid ${socialTheme.bg.primary}`,
          marginTop: -67,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 44,
          fontFamily: socialTheme.font.system,
          position: 'relative',
        }}>
          {profile.initials}
          {isHighRank && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `3px solid ${profile.accentColor}`,
              animation: 'pulse-blue 3s infinite',
              pointerEvents: 'none',
            }} />
          )}
        </div>

        {/* Follow / Edit button */}
        <div style={{ position: 'absolute', top: 12, right: 16, display: 'flex', gap: 8 }}>
          {isOwn ? (
            <button
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                border: `1px solid ${socialTheme.border.default}`,
                background: 'transparent',
                color: socialTheme.text.primary,
                fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
                fontFamily: socialTheme.font.system,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Profil bearbeiten
            </button>
          ) : (
            <button
              onClick={onToggleFollow}
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                border: isFollowing ? `1px solid ${socialTheme.border.default}` : 'none',
                background: isFollowing ? 'transparent' : socialTheme.text.primary,
                color: isFollowing ? socialTheme.text.primary : socialTheme.bg.primary,
                fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
                fontFamily: socialTheme.font.system,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isFollowing ? socialTheme.accent.red : '#cccccc';
                e.currentTarget.style.borderColor = isFollowing ? socialTheme.accent.red : 'transparent';
                e.currentTarget.style.color = isFollowing ? 'white' : socialTheme.bg.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isFollowing ? 'transparent' : socialTheme.text.primary;
                e.currentTarget.style.borderColor = socialTheme.border.default;
                e.currentTarget.style.color = isFollowing ? socialTheme.text.primary : socialTheme.bg.primary;
              }}
            >
              {isFollowing ? 'Folgt' : 'Folgen'}
            </button>
          )}
          <button
            onClick={() => setShowMoreSheet(true)}
            style={{
              padding: '8px 12px',
              borderRadius: 9999,
              border: `1px solid ${socialTheme.border.default}`,
              background: 'transparent',
              color: socialTheme.text.primary,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: socialTheme.text.primary, fontFamily: socialTheme.font.system }}>
            {profile.name}
          </span>
          {isHighRank && <BadgeCheck size={20} color={socialTheme.accent.blue} fill={socialTheme.accent.blue} />}
          {profile.status === 'Verborgen' && (
            <span style={{
              fontSize: 11, color: socialTheme.accent.red,
              background: hexToRgba(socialTheme.accent.red, 0.15),
              padding: '2px 8px', fontWeight: 600,
              fontFamily: socialTheme.font.system,
            }}>
              <Lock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
              VERBORGEN
            </span>
          )}
          {profile.status === 'Abwesend' && (
            <span style={{
              fontSize: 11, color: socialTheme.text.secondary,
              background: socialTheme.bg.secondary,
              padding: '2px 8px', fontWeight: 600,
              fontFamily: socialTheme.font.system,
            }}>
              Abwesend
            </span>
          )}
          {profile.status === 'Gesperrt' && (
            <span style={{
              fontSize: 11, color: socialTheme.accent.red,
              background: hexToRgba(socialTheme.accent.red, 0.15),
              padding: '2px 8px', fontWeight: 600,
              fontFamily: socialTheme.font.system,
            }}>
              Gesperrt
            </span>
          )}
        </div>

        <div style={{ fontSize: 14, color: socialTheme.text.secondary, marginTop: 2, fontFamily: socialTheme.font.system }}>
          {profile.handle}
        </div>

        <div style={{ fontSize: 14, color: socialTheme.text.primary, marginTop: 12, lineHeight: 1.5, fontFamily: socialTheme.font.system }}>
          {profile.bio}
        </div>

        {/* Meta info */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12,
          fontSize: 13, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system,
        }}>
          {profile.position && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Shield size={14} color={rankColor} />
              {profile.position}
            </span>
          )}
          {profile.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={14} />
              {profile.location}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={14} />
            Seit {profile.joinedYear}
          </span>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 20, marginTop: 12,
          fontSize: 13, fontFamily: socialTheme.font.system,
        }}>
          <span>
            <strong style={{ color: socialTheme.text.primary, fontWeight: 700 }}>{formatNumber(profile.following)}</strong>
            <span style={{ color: socialTheme.text.secondary }}> Following</span>
          </span>
          <span>
            <strong style={{ color: socialTheme.text.primary, fontWeight: 700 }}>{formatNumber(profile.followers)}</strong>
            <span style={{ color: socialTheme.text.secondary }}> Follower</span>
          </span>
        </div>

        {/* Loyalty & Rank card */}
        <div style={{
          marginTop: 16,
          padding: 16,
          background: socialTheme.bg.secondary,
          borderRadius: 16,
          border: `1px solid ${socialTheme.border.subtle}`,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.system, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                Rang
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 24, fontWeight: 800, color: rankColor,
                  fontFamily: socialTheme.font.system,
                }}>
                  {profileRankLevel}
                </span>
                <span style={{ fontSize: 13, color: rankColor, fontWeight: 600, fontFamily: socialTheme.font.system }}>
                  {profile.rank}
                </span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.system, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                Loyalität
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px',
                background: hexToRgba(loyaltyColor, 0.15),
                border: `1px solid ${hexToRgba(loyaltyColor, 0.3)}`,
                borderRadius: 4,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: loyaltyColor }} />
                <span style={{ fontSize: 12, color: loyaltyColor, fontWeight: 600, fontFamily: socialTheme.font.system }}>
                  {profile.loyalty}
                </span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.system, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                Einfluss
              </div>
              <div style={{ fontSize: 13, color: socialTheme.text.primary, fontWeight: 600, fontFamily: socialTheme.font.system }}>
                {profile.influence}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.system, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
                <span style={{ fontSize: 13, color: statusColor, fontWeight: 600, fontFamily: socialTheme.font.system }}>
                  {profile.status}
                </span>
              </div>
            </div>
          </div>

          {/* Rank progress */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.system }}>
                Rang-Stufe
              </span>
              <span style={{ fontSize: 11, color: rankColor, fontWeight: 700, fontFamily: socialTheme.font.system }}>
                {profileRankLevel}/10
              </span>
            </div>
            <div style={{
              height: 4, background: socialTheme.bg.primary, borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                width: `${(profileRankLevel / 10) * 100}%`,
                height: '100%',
                background: rankColor,
                borderRadius: 2,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        </div>

        {/* Public Parole */}
        <div style={{
          marginTop: 16,
          padding: 16,
          background: socialTheme.bg.secondary,
          borderRadius: 16,
          border: `1px solid ${socialTheme.border.subtle}`,
        }}>
          <div style={{ fontSize: 11, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.system, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Öffentliche Parole
          </div>
          <div style={{ fontSize: 14, color: socialTheme.text.primary, fontStyle: 'italic', lineHeight: 1.5, fontFamily: socialTheme.font.system }}>
            „{profile.publicParole}"
          </div>
        </div>

        {/* Private Hint */}
        <div style={{
          marginTop: 16,
          padding: 16,
          background: socialTheme.bg.secondary,
          borderRadius: 16,
          border: `1px solid ${hexToRgba(socialTheme.accent.gold, 0.3)}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} color={socialTheme.accent.gold} />
              <span style={{ fontSize: 11, color: socialTheme.accent.gold, fontFamily: socialTheme.font.system, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Private Andeutung
              </span>
            </div>
            <button
              onClick={() => setShowPrivateHint(s => !s)}
              style={{
                padding: '4px 10px',
                borderRadius: 9999,
                border: `1px solid ${hexToRgba(socialTheme.accent.gold, 0.3)}`,
                background: showPrivateHint ? socialTheme.accent.gold : 'transparent',
                color: showPrivateHint ? socialTheme.bg.primary : socialTheme.accent.gold,
                fontSize: 11, fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: socialTheme.font.system,
                transition: 'all 0.15s',
              }}
            >
              <Eye size={12} /> {showPrivateHint ? 'Verbergen' : 'Aufdecken'}
            </button>
          </div>
          {showPrivateHint && (
            <div style={{
              padding: 12,
              background: hexToRgba(socialTheme.accent.gold, 0.06),
              borderRadius: 8,
              borderLeft: `3px solid ${socialTheme.accent.gold}`,
              fontSize: 13, color: socialTheme.text.primary, lineHeight: 1.5,
              fontStyle: 'italic', fontFamily: socialTheme.font.system,
            }}>
              {profile.privateHint}
            </div>
          )}
        </div>
      </div>

      {/* Locked posts */}
      {lockedPosts.length > 0 && (
        <div style={{
          margin: '0 16px 16px',
          padding: 16,
          background: socialTheme.bg.secondary,
          borderRadius: 16,
          border: `1px solid ${hexToRgba(socialTheme.accent.red, 0.3)}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Lock size={16} color={socialTheme.accent.red} />
            <span style={{ fontSize: 14, fontWeight: 700, color: socialTheme.accent.red, fontFamily: socialTheme.font.system }}>
              {lockedPosts.length} gesperrte Beiträge
            </span>
          </div>
          <div style={{ fontSize: 12, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system }}>
            Zugriff verweigert · Rang „{currentUser.rank}" (S{userRankLevel}/10) nicht ausreichend
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${socialTheme.border.subtle}`,
      }}>
        {(['posts', 'replies', 'media', 'likes'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '12px 0',
              background: 'none', border: 'none',
              color: activeTab === tab ? socialTheme.text.primary : socialTheme.text.secondary,
              fontSize: 14, fontWeight: activeTab === tab ? 700 : 400,
              cursor: 'pointer',
              fontFamily: socialTheme.font.system,
              borderBottom: activeTab === tab ? `2px solid ${socialTheme.accent.blue}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {tab === 'posts' ? 'Beiträge' : tab === 'replies' ? 'Antworten' : tab === 'media' ? 'Medien' : 'Gefällt mir'}
          </button>
        ))}
      </div>

      {/* Posts */}
      {activeTab === 'posts' && (
        <div>
          {visiblePosts.length === 0 && (
            <div style={{ padding: '48px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system }}>
                Keine sichtbaren Beiträge
              </div>
            </div>
          )}
          {visiblePosts.map(post => (
            <PostCard key={post.id} post={post} onOpenProfile={onOpenProfile} />
          ))}
        </div>
      )}

      {activeTab !== 'posts' && (
        <div style={{ padding: '48px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system }}>
            {activeTab === 'replies' ? 'Noch keine Antworten' : activeTab === 'media' ? 'Keine Medien vorhanden' : 'Noch keine „Gefällt mir"-Angaben'}
          </div>
        </div>
      )}

      {showMoreSheet && (
        <ProfileMoreSheet
          isOwn={isOwn}
          onClose={() => setShowMoreSheet(false)}
          profileHandle={profile.handle}
        />
      )}
    </div>
  );
}

function ProfileMoreSheet({ isOwn, onClose, profileHandle }: { isOwn: boolean; onClose: () => void; profileHandle: string }) {
  const [toast, setToast] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const actions = isOwn
    ? [
        { label: 'Link zum Profil kopieren', onClick: () => { navigator.clipboard?.writeText(`vox.allianz-intern.net/${profileHandle}`).catch(() => {}); showToast('Kopiert'); onClose(); } },
        { label: 'Profil teilen', onClick: () => { showToast('Teilen vorbereitet'); onClose(); } },
        { label: 'QR-Code anzeigen', onClick: () => { showToast('QR wird vorbereitet'); onClose(); } },
      ]
    : [
        { label: blocked ? 'Blockierung aufheben' : 'Profil blockieren', onClick: () => { setBlocked(b => !b); showToast(blocked ? 'Blockierung aufgehoben' : 'Profil blockiert'); onClose(); }, danger: !blocked },
        { label: 'Stumm schalten', onClick: () => { showToast('Stummgeschaltet'); onClose(); } },
        { label: 'Über Funktionär melden', onClick: () => { showToast('Meldung gesendet'); onClose(); }, danger: true },
        { label: 'Link zum Profil kopieren', onClick: () => { navigator.clipboard?.writeText(`vox.allianz-intern.net/${profileHandle}`).catch(() => {}); showToast('Kopiert'); onClose(); } },
      ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 300,
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: socialTheme.bg.secondary,
          width: '100%',
          padding: '8px 0 24px',
          borderTop: `1px solid ${socialTheme.border.subtle}`,
        }}
      >
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: socialTheme.text.tertiary,
          margin: '0 auto 12px',
        }} />
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'none',
              border: 'none',
              borderTop: i > 0 ? `1px solid ${socialTheme.border.subtle}` : 'none',
              color: a.danger ? socialTheme.accent.red : socialTheme.text.primary,
              fontSize: 15,
              fontFamily: socialTheme.font.system,
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {a.label}
          </button>
        ))}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: 'none',
            border: 'none',
            borderTop: `1px solid ${socialTheme.border.subtle}`,
            color: socialTheme.text.secondary,
            fontSize: 15,
            fontFamily: socialTheme.font.system,
            textAlign: 'left',
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          Abbrechen
        </button>
      </div>
      {toast && (
        <div style={{
          position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
          background: socialTheme.bg.tertiary,
          color: socialTheme.text.primary,
          padding: '10px 16px',
          borderRadius: 9999,
          fontSize: 13,
          fontFamily: socialTheme.font.system,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          zIndex: 400,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}