import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Home, Bell, Search, PenSquare, Shield, Bookmark, Hash } from 'lucide-react';
import { SocialFeed } from './SocialFeed';
import { SocialProfile } from './SocialProfile';
import { SocialComposer } from './SocialComposer';
import { PostCard } from './SocialFeed';
import { profiles, currentUser, notifications, posts as basePosts } from './SocialData';
import type { Post, Profile } from './SocialData';
import { socialTheme, hexToRgba, socialGlobalCss } from './SocialTheme';

const STORAGE_KEY = 'vox-kommun-posts';
const FOLLOWING_KEY = 'vox-kommun-following';
const BOOKMARKS_KEY = 'vox-kommun-bookmarks';
const LIKES_KEY = 'vox-kommun-likes';
const REPOSTS_KEY = 'vox-kommun-reposts';
const COMMENTS_KEY = 'vox-kommun-comments';

interface SocialIndexProps {
  onExit: () => void;
}

export function SocialIndex({ onExit }: SocialIndexProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  const tab = pathParts[2] || 'feed';
  const profileIdPart = pathParts[3];

  const showOwnProfile = tab === 'profile' && profileIdPart === 'me';
  const activeProfileId = tab === 'profile' && profileIdPart !== 'me' ? profileIdPart : null;

  const [feedScope, setFeedScope] = useState<'foryou' | 'following'>('foryou');
  const [showComposer, setShowComposer] = useState(false);
  const [extraPosts, setExtraPosts] = useState<Post[]>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Post[]) : [];
    } catch {
      return [];
    }
  });
  const [suspicionTotal, setSuspicionTotal] = useState(currentUser.suspicion);
  const [showSuspicion, setShowSuspicion] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [followedIds, setFollowedIds] = useState<string[]>(() => {
    try {
      const stored = window.localStorage.getItem(FOLLOWING_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const stored = window.localStorage.getItem(BOOKMARKS_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const stored = window.localStorage.getItem(LIKES_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [repostedIds, setRepostedIds] = useState<string[]>(() => {
    try {
      const stored = window.localStorage.getItem(REPOSTS_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [extraComments, setExtraComments] = useState<Record<string, { id: string; postId: string; author: string; authorRank: string; text: string; createdAt: number }[]>>(() => {
    try {
      const stored = window.localStorage.getItem(COMMENTS_KEY);
      return stored ? (JSON.parse(stored) as Record<string, { id: string; postId: string; author: string; authorRank: string; text: string; createdAt: number }[]>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(extraPosts));
    } catch {
      // ignore quota / private mode errors
    }
  }, [extraPosts]);

  useEffect(() => {
    try {
      window.localStorage.setItem(FOLLOWING_KEY, JSON.stringify(followedIds));
    } catch {
      // ignore quota / private mode errors
    }
  }, [followedIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarkedIds));
    } catch {
      // ignore quota / private mode errors
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LIKES_KEY, JSON.stringify(likedIds));
    } catch {
      // ignore quota / private mode errors
    }
  }, [likedIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(REPOSTS_KEY, JSON.stringify(repostedIds));
    } catch {
      // ignore quota / private mode errors
    }
  }, [repostedIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(COMMENTS_KEY, JSON.stringify(extraComments));
    } catch {
      // ignore quota / private mode errors
    }
  }, [extraComments]);

  const toggleFollow = (id: string) => {
    setFollowedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleLike = (id: string) => {
    setLikedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleRepost = (id: string) => {
    setRepostedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addComment = (postId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      postId,
      author: currentUser.displayName,
      authorRank: currentUser.rank,
      text: trimmed,
      createdAt: Date.now(),
    };
    setExtraComments(prev => ({
      ...prev,
      [postId]: [newComment, ...(prev[postId] || [])],
    }));
  };

  const activeProfile = activeProfileId ? profiles.find(p => p.id === activeProfileId) : null;

  const ownProfile: Profile = profiles.find(p => p.id === currentUser.id) || {
    id: currentUser.id,
    name: currentUser.displayName,
    handle: currentUser.handle,
    rank: currentUser.rank,
    rankLevel: currentUser.rankLevel,
    position: 'EINGESCHRÄNKTES MITGLIED',
    influence: 'Gering',
    loyalty: currentUser.loyalty,
    followers: 0,
    following: followedIds.length,
    bio: 'Aufgenommen in das System. Aktivitätsradius wird überwacht. Halte dich an die Linie.',
    publicParole: 'Für die Allianz. Für die Ordnung.',
    privateHint: 'Du bist neu im Netzwerk. Beobachte zuerst, bevor du selbst Beiträge verfasst.',
    joinedYear: 2026,
    accentColor: socialTheme.accent.blue,
    initials: 'UN',
    status: 'Aktiv',
    location: '—',
    sector: '—',
  };

  const displayedProfile = showOwnProfile ? ownProfile : activeProfile;

  const handleOpenProfile = (id: string) => {
    navigate(`/browser/vox-kommun/profile/${id}`);
  };
  const handleBackFromProfile = () => {
    navigate(-1);
  };
  const handleOpenOwnProfile = () => {
    navigate('/browser/vox-kommun/profile/me');
  };

  const handlePostSubmit = (text: string, suspicionDelta: number) => {
    const newPosts: Post[] = [];
    const ts = 'Jetzt';
    const now = Date.now();

    const ownPost: Post = {
      id: `own-${now}`,
      authorId: currentUser.id,
      timestamp: ts,
      text,
      likes: 0,
      retweets: 0,
      replies: 0,
      comments: [],
    };
    newPosts.push(ownPost);

    setExtraPosts(prev => [...newPosts, ...prev]);
    setSuspicionTotal(s => Math.max(0, Math.min(100, s + suspicionDelta)));
    setShowComposer(false);
    navigate('/browser/vox-kommun/feed');
  };

  if (displayedProfile) {
    const isOwn = displayedProfile.id === currentUser.id;
    return (
      <SocialProfile
        profile={displayedProfile}
        onBack={handleBackFromProfile}
        onOpenProfile={handleOpenProfile}
        isFollowing={followedIds.includes(displayedProfile.id)}
        onToggleFollow={() => toggleFollow(displayedProfile.id)}
        isOwn={isOwn}
        ownPosts={extraPosts}
      />
    );
  }

  const suspicionColor =
    suspicionTotal >= 80 ? socialTheme.accent.red :
    suspicionTotal >= 50 ? '#ff6b35' :
    suspicionTotal >= 25 ? socialTheme.accent.gold : socialTheme.accent.green;

  const filteredProfiles = searchQuery.trim()
    ? profiles.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.position.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div style={{
      height: '100%',
      display: 'flex', flexDirection: 'column',
      background: socialTheme.bg.primary,
      color: socialTheme.text.primary,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{socialGlobalCss}</style>

      {/* Top bar */}
      <div style={{
        background: socialTheme.bg.glass,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${socialTheme.border.subtle}`,
        padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative', zIndex: 10,
      }}>
        {/* Hamburger / back */}
        <button onClick={onExit} style={{
          background: 'none', border: 'none', padding: 6, cursor: 'pointer',
          borderRadius: '50%', display: 'flex', alignItems: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={socialTheme.text.primary} strokeWidth="2" strokeLinecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Hash size={22} color={socialTheme.text.primary} />
        </div>

        {/* Search */}
        <div style={{
          flex: 1, position: 'relative',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: socialTheme.bg.secondary,
            border: `1px solid ${socialTheme.border.subtle}`,
            borderRadius: 9999,
            padding: '6px 12px',
            gap: 8,
            transition: 'border-color 0.15s',
          }}>
            <Search size={14} color={socialTheme.text.tertiary} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Suche"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 13, color: socialTheme.text.primary,
                fontFamily: socialTheme.font.system,
              }}
            />
          </div>
          {/* Search results dropdown */}
          {searchQuery.trim() && filteredProfiles.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              marginTop: 4,
              background: socialTheme.bg.secondary,
              border: `1px solid ${socialTheme.border.subtle}`,
              borderRadius: 12,
              maxHeight: 300, overflowY: 'auto',
              zIndex: 50,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }} className="hide-scrollbar">
              {filteredProfiles.map(p => (
                <div
                  key={p.id}
                  onClick={() => { setSearchQuery(''); handleOpenProfile(p.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    borderBottom: `1px solid ${socialTheme.border.subtle}`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: socialTheme.rankColor[p.rank],
                    color: 'white', fontWeight: 700, fontSize: 11,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: socialTheme.font.system,
                  }}>
                    {p.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: socialTheme.text.primary, fontFamily: socialTheme.font.system, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.handle} · {p.rank}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suspicion indicator */}
        <button
          onClick={() => setShowSuspicion(true)}
          style={{
            background: 'none', border: 'none', padding: 6, cursor: 'pointer',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            position: 'relative',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <Shield size={20} color={suspicionColor} />
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 12, height: 12,
            background: suspicionColor,
            borderRadius: '50%',
            fontSize: 7, fontWeight: 800, color: socialTheme.bg.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: socialTheme.font.mono,
          }}>
            {suspicionTotal}
          </div>
        </button>
      </div>

      {/* X-style sticky tabs for the feed */}
      {tab === 'feed' && (
        <div style={{
          display: 'flex',
          background: socialTheme.bg.glass,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${socialTheme.border.subtle}`,
          position: 'relative', zIndex: 9,
        }}>
          <FeedTabButton label="Für dich" active={feedScope === 'foryou'} onClick={() => setFeedScope('foryou')} />
          <FeedTabButton label="Folgen ich" active={feedScope === 'following'} onClick={() => setFeedScope('following')} />
        </div>
      )}

      {/* Content */}
      <Routes>
        <Route path="/" element={<Navigate to="/browser/vox-kommun/feed" replace />} />
        <Route path="feed" element={
          <SocialFeed
            onOpenProfile={handleOpenProfile}
            extraPosts={extraPosts}
            suspicion={suspicionTotal}
            scope={feedScope}
            followedIds={followedIds}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            likedIds={likedIds}
            repostedIds={repostedIds}
            onToggleLike={toggleLike}
            onToggleRepost={toggleRepost}
            extraComments={extraComments}
            onAddComment={addComment}
          />
        } />
        <Route path="explore" element={
          <ExploreTab
            onOpenProfile={handleOpenProfile}
            followedIds={followedIds}
            onToggleFollow={toggleFollow}
          />
        } />
        <Route path="notifications" element={<NotificationsTab />} />
        <Route path="bookmarks" element={
          <BookmarksTab
            onOpenProfile={handleOpenProfile}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            extraPosts={extraPosts}
          />
        } />
      </Routes>

      {/* Suspicion modal */}
      {showSuspicion && (
        <SuspicionModal
          suspicion={suspicionTotal}
          postCount={extraPosts.filter(p => p.authorId === currentUser.id).length}
          onClose={() => setShowSuspicion(false)}
        />
      )}

      {/* Composer */}
      {showComposer && (
        <SocialComposer
          onClose={() => setShowComposer(false)}
          onSubmit={(text, delta) => handlePostSubmit(text, delta)}
        />
      )}

      {/* FAB Composer */}
      <button
        onClick={() => setShowComposer(true)}
        style={{
          position: 'absolute',
          bottom: 72,
          right: 20,
          width: 56, height: 56,
          background: socialTheme.accent.blue,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', border: 'none', cursor: 'pointer',
          boxShadow: socialTheme.glow.blue,
          zIndex: 9,
          transition: 'transform 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <PenSquare size={24} />
      </button>

      {/* Bottom nav */}
      <div style={{
        background: socialTheme.bg.glass,
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${socialTheme.border.subtle}`,
        display: 'flex',
        paddingBottom: 8,
        paddingTop: 4,
        position: 'relative', zIndex: 10,
      }}>
        <NavButton
          icon={<Home size={22} />}
          active={tab === 'feed'}
          onClick={() => navigate('/browser/vox-kommun/feed')}
        />
        <NavButton
          icon={<Hash size={22} />}
          active={tab === 'explore'}
          onClick={() => navigate('/browser/vox-kommun/explore')}
        />

        <NavButton
          icon={<Bell size={22} />}
          active={tab === 'notifications'}
          onClick={() => navigate('/browser/vox-kommun/notifications')}
          badge={notifications.length}
        />
        <NavButton
          icon={<Bookmark size={22} />}
          active={tab === 'bookmarks'}
          onClick={() => navigate('/browser/vox-kommun/bookmarks')}
        />
        <NavButton
          icon={
            <div style={{
              width: 22, height: 22,
              borderRadius: '50%',
              background: socialTheme.accent.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 10,
              fontFamily: socialTheme.font.system,
              border: showOwnProfile ? `2px solid ${socialTheme.text.primary}` : '2px solid transparent',
              boxSizing: 'border-box',
            }}>
              {ownProfile.initials}
            </div>
          }
          active={showOwnProfile}
          onClick={handleOpenOwnProfile}
        />
      </div>
    </div>
  );
}

function FeedTabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: 'none',
        border: 'none',
        padding: '14px 0',
        cursor: 'pointer',
        position: 'relative',
        color: active ? socialTheme.text.primary : socialTheme.text.secondary,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: socialTheme.font.system,
        transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span>{label}</span>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: active ? '50%' : '-50%',
        transform: 'translateX(-50%)',
        width: 56,
        height: 3,
        background: socialTheme.accent.blue,
        borderRadius: 9999,
        transition: 'left 0.25s ease',
      }} />
    </button>
  );
}

function NavButton({ icon, active, onClick, badge }: { icon: React.ReactNode; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, background: 'none', border: 'none',
        padding: '8px 0', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative',
        color: active ? socialTheme.text.primary : socialTheme.text.secondary,
        transition: 'color 0.15s',
      }}
    >
      <div style={{ position: 'relative' }}>
        {icon}
        {badge && badge > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -8,
            minWidth: 16, height: 16,
            background: socialTheme.accent.blue,
            borderRadius: 9999,
            fontSize: 10, fontWeight: 700, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
            fontFamily: socialTheme.font.system,
          }}>
            {badge}
          </div>
        )}
      </div>
    </button>
  );
}

function ExploreTab({ onOpenProfile, followedIds, onToggleFollow }: { onOpenProfile: (id: string) => void; followedIds: string[]; onToggleFollow: (id: string) => void }) {
  const trending = [
    { tag: '#Allianz47', posts: '4.7K' },
    { tag: '#InnereSicherheit', posts: '14.2K' },
    { tag: '#Initiative2030', posts: '1.9K' },
    { tag: '#PROMETHEUS', posts: '847' },
    { tag: '#Loyalität', posts: '3.1K' },
  ];

  const sorted = [...profiles].sort((a, b) => b.rankLevel - a.rankLevel);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: socialTheme.bg.primary }} className="hide-scrollbar">
      <style>{socialGlobalCss}</style>

      {/* Trending */}
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${socialTheme.border.subtle}`,
      }}>
        <div style={{
          fontSize: 18, fontWeight: 800, color: socialTheme.text.primary,
          fontFamily: socialTheme.font.system, marginBottom: 12,
        }}>
          Trends für dich
        </div>
        {trending.map((t, i) => (
          <div key={i} style={{
            padding: '10px 0',
            borderBottom: i < trending.length - 1 ? `1px solid ${socialTheme.border.subtle}` : 'none',
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: 12, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system }}>
              Trending in Politik
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: socialTheme.text.primary, fontFamily: socialTheme.font.system, marginTop: 2 }}>
              {t.tag}
            </div>
            <div style={{ fontSize: 12, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system, marginTop: 2 }}>
              {t.posts} Beiträge
            </div>
          </div>
        ))}
      </div>

      {/* Who to follow */}
      <div style={{ padding: '16px' }}>
        <div style={{
          fontSize: 18, fontWeight: 800, color: socialTheme.text.primary,
          fontFamily: socialTheme.font.system, marginBottom: 12,
        }}>
          Wen du kennen solltest
        </div>
        {sorted.slice(0, 8).map(p => (
          <div
            key={p.id}
            onClick={() => onOpenProfile(p.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 0',
              borderBottom: `1px solid ${socialTheme.border.subtle}`,
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: socialTheme.rankColor[p.rank],
              color: 'white', fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: socialTheme.font.system,
            }}>
              {p.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: socialTheme.text.primary, fontFamily: socialTheme.font.system }}>
                  {p.name}
                </span>
              </div>
              <div style={{ fontSize: 12, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.position}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFollow(p.id); }}
              style={{
                padding: '6px 16px',
                borderRadius: 9999,
                border: followedIds.includes(p.id)
                  ? `1px solid ${socialTheme.border.default}`
                  : 'none',
                background: followedIds.includes(p.id)
                  ? 'transparent'
                  : socialTheme.text.primary,
                color: followedIds.includes(p.id)
                  ? socialTheme.text.primary
                  : socialTheme.bg.primary,
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer',
                fontFamily: socialTheme.font.system,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = followedIds.includes(p.id)
                  ? socialTheme.accent.red
                  : '#cccccc';
                e.currentTarget.style.borderColor = followedIds.includes(p.id)
                  ? socialTheme.accent.red
                  : 'transparent';
                e.currentTarget.style.color = followedIds.includes(p.id) ? 'white' : socialTheme.bg.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = followedIds.includes(p.id)
                  ? 'transparent'
                  : socialTheme.text.primary;
                e.currentTarget.style.borderColor = socialTheme.border.default;
                e.currentTarget.style.color = followedIds.includes(p.id)
                  ? socialTheme.text.primary
                  : socialTheme.bg.primary;
              }}
            >
              {followedIds.includes(p.id) ? 'Folgt' : 'Folgen'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: socialTheme.bg.primary }} className="hide-scrollbar">
      <style>{socialGlobalCss}</style>
      <div style={{
        fontSize: 18, fontWeight: 800, color: socialTheme.text.primary,
        fontFamily: socialTheme.font.system, padding: '16px 16px 12px',
        borderBottom: `1px solid ${socialTheme.border.subtle}`,
      }}>
        Benachrichtigungen
      </div>
      {notifications.map(n => (
        <div key={n.id} style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${socialTheme.border.subtle}`,
          display: 'flex', gap: 10, alignItems: 'flex-start',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: n.type === 'system' ? socialTheme.accent.blue : socialTheme.bg.secondary,
            color: n.type === 'system' ? 'white' : socialTheme.accent.blue,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {n.type === 'like' && '♥'}
            {n.type === 'comment' && '💬'}
            {n.type === 'system' && '⚡'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: socialTheme.text.primary, fontFamily: socialTheme.font.system }}>
              {n.actor}
            </div>
            <div style={{ fontSize: 13, color: socialTheme.text.secondary, marginTop: 2, fontFamily: socialTheme.font.system }}>
              {n.target}
            </div>
            {n.text && (
              <div style={{
                marginTop: 6, padding: '8px 10px',
                background: socialTheme.bg.secondary,
                borderRadius: 8,
                fontSize: 13, color: socialTheme.text.primary,
                fontFamily: socialTheme.font.system,
              }}>
                „{n.text}"
              </div>
            )}
            <div style={{ fontSize: 11, color: socialTheme.text.tertiary, marginTop: 4, fontFamily: socialTheme.font.system }}>
              {n.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BookmarksTab({ onOpenProfile, bookmarkedIds, onToggleBookmark, extraPosts }: { onOpenProfile: (id: string) => void; bookmarkedIds: string[]; onToggleBookmark: (id: string) => void; extraPosts: Post[] }) {
  const allPosts: Post[] = [
    ...extraPosts,
    ...basePosts,
  ];
  const bookmarked = allPosts.filter(p => bookmarkedIds.includes(p.id));

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: socialTheme.bg.primary }} className="hide-scrollbar">
      <style>{socialGlobalCss}</style>
      <div style={{
        fontSize: 18, fontWeight: 800, color: socialTheme.text.primary,
        fontFamily: socialTheme.font.system, padding: '16px 16px 12px',
        borderBottom: `1px solid ${socialTheme.border.subtle}`,
      }}>
        Lesezeichen · {bookmarked.length}
      </div>
      {bookmarked.length === 0 ? (
        <div style={{ padding: '48px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system, lineHeight: 1.5 }}>
            Speichere Beiträge für später. Tippe auf das Lesezeichen-Symbol unter einem Beitrag.
          </div>
        </div>
      ) : (
        bookmarked.map(p => (
          <PostCard
            key={p.id}
            post={p}
            onOpenProfile={onOpenProfile}
            isOwn={p.authorId === currentUser.id}
            isBookmarked={true}
            onToggleBookmark={() => onToggleBookmark(p.id)}
          />
        ))
      )}
    </div>
  );
}

function SuspicionModal({ suspicion, postCount, onClose }: { suspicion: number; postCount: number; onClose: () => void }) {
  const stage =
    suspicion >= 80 ? { label: 'Kritisch', color: socialTheme.accent.red, desc: 'Du bist akut gefährdet. Dein Account kann jederzeit gelöscht werden.' } :
    suspicion >= 50 ? { label: 'Im Verdacht', color: '#ff6b35', desc: 'Du stehst unter konkreter Beobachtung. Sei vorsichtig.' } :
    suspicion >= 25 ? { label: 'Beobachtet', color: socialTheme.accent.gold, desc: 'Funktionäre prüfen deine Beiträge.' } :
    { label: 'Unauffällig', color: socialTheme.accent.green, desc: 'Deine Beiträge bewegen sich im Rahmen.' };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      zIndex: 200,
      display: 'flex', alignItems: 'flex-end',
    }}>
      <style>{socialGlobalCss}</style>
      <div style={{
        background: socialTheme.bg.secondary,
        width: '100%',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        padding: '20px 16px 32px',
        maxHeight: '80%',
        overflowY: 'auto',
      }} className="hide-scrollbar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} color={stage.color} />
            <span style={{ fontSize: 18, fontWeight: 800, color: socialTheme.text.primary, fontFamily: socialTheme.font.system }}>
              Misstrauen-Profil
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', padding: 4, cursor: 'pointer',
            color: socialTheme.text.secondary,
          }}>
            ✕
          </button>
        </div>

        {/* Big number */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
          <span style={{
            fontSize: 48, fontWeight: 200, color: stage.color, lineHeight: 1,
            fontFamily: socialTheme.font.system,
          }}>
            {suspicion.toString().padStart(2, '0')}
          </span>
          <span style={{ fontSize: 14, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system }}>
            / 100
          </span>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 10px',
          background: hexToRgba(stage.color, 0.15),
          border: `1px solid ${hexToRgba(stage.color, 0.3)}`,
          borderRadius: 4,
          marginBottom: 16,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: stage.color }} />
          <span style={{ fontSize: 12, color: stage.color, fontWeight: 700, fontFamily: socialTheme.font.system }}>
            {stage.label}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 8, background: socialTheme.bg.primary, borderRadius: 4, overflow: 'hidden', marginBottom: 8,
        }}>
          <div style={{
            width: `${Math.min(100, suspicion)}%`,
            height: '100%',
            background: stage.color,
            transition: 'width 0.3s',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: socialTheme.text.tertiary, marginBottom: 16, fontFamily: socialTheme.font.system }}>
          <span>0</span><span>25</span><span>50</span><span>80</span><span>100</span>
        </div>

        <div style={{
          padding: 12,
          background: socialTheme.bg.primary,
          borderRadius: 8,
          fontSize: 13, color: socialTheme.text.primary, lineHeight: 1.5,
          fontFamily: socialTheme.font.system,
          marginBottom: 16,
        }}>
          {stage.desc}
        </div>

        <div style={{ fontSize: 11, color: socialTheme.text.tertiary, textAlign: 'center', fontFamily: socialTheme.font.system }}>
          Basierend auf {postCount} eigenen Beiträgen · Stand Q2/2026
        </div>
      </div>
    </div>
  );
}