import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Repeat2, MessageCircle, Share, Bookmark, MapPin, Lock, Eye, AlertTriangle, BadgeCheck, Link as LinkIcon, Mail, X } from 'lucide-react';
import type { Post, Profile } from './SocialData';
import { rankOrder, profiles, posts, currentUser } from './SocialData';
import { socialTheme, hexToRgba, socialGlobalCss } from './SocialTheme';
import { useClueStore } from '../store/clues';
import { discoverVoxKommunClue, VOX_KOMMUN_CLUE_REGISTRY } from './voxKommunClues';

const ownProfile: Profile = {
  id: currentUser.id,
  name: currentUser.displayName,
  handle: currentUser.handle,
  rank: currentUser.rank,
  rankLevel: currentUser.rankLevel,
  position: 'EINGESCHRÄNKTES MITGLIED',
  influence: 'Gering',
  loyalty: currentUser.loyalty,
  followers: 0,
  following: 0,
  bio: '',
  publicParole: '',
  privateHint: '',
  joinedYear: 2026,
  accentColor: socialTheme.accent.blue,
  initials: 'UN',
  status: 'Aktiv',
  location: '—',
  sector: '—',
};

interface PostCardProps {
  post: Post;
  onOpenProfile: (id: string) => void;
  isOwn?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  isLiked?: boolean;
  isReposted?: boolean;
  onToggleLike?: () => void;
  onToggleRepost?: () => void;
  extraComments?: { id: string; postId: string; author: string; authorRank: string; text: string; createdAt: number }[];
  onAddComment?: (text: string) => void;
}

export function PostCard({ post, onOpenProfile, isOwn = false, isBookmarked = false, onToggleBookmark, isLiked = false, isReposted = false, onToggleLike, onToggleRepost, extraComments = [], onAddComment }: PostCardProps) {
  const author = profiles.find(p => p.id === post.authorId) ||
    (post.authorId === currentUser.id ? ownProfile : null);
  const [showHint, setShowHint] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentText, setCommentText] = useState('');

  const userRankLevel = rankOrder.indexOf(currentUser.rank);
  const requiredLevel = post.requiredRank ? rankOrder.indexOf(post.requiredRank) : 0;
  const canAccess = !post.locked || userRankLevel >= requiredLevel;

  const hasClueId = !!post.clueId && post.clueId in VOX_KOMMUN_CLUE_REGISTRY;
  const isClueDiscovered = useClueStore(s => (hasClueId && post.clueId) ? !!s.clues[post.clueId] : false);

  if (!author) return null;

  const likeCount = post.likes + (isLiked ? 1 : 0);
  const retweetCount = (post.retweets || 0) + (isReposted ? 1 : 0);
  const allComments = [...extraComments, ...post.comments];

  const authorColor = author.accentColor;
  const rankColor = socialTheme.rankColor[author.rank] || '#71767b';
  const isHighRank = author.rankLevel >= 8;

  const handleSaveClue = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.clueId) discoverVoxKommunClue(post.clueId);
  };

  return (
    <div style={{
      background: socialTheme.bg.primary,
      borderBottom: `1px solid ${socialTheme.border.subtle}`,
      padding: '12px 16px',
      transition: 'background 0.15s',
      cursor: 'pointer',
    }}>
      {/* Pinned indicator */}
      {post.pinned && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 6,
          paddingLeft: 40,
          fontSize: 11,
          color: socialTheme.text.secondary,
          fontFamily: socialTheme.font.system,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L15 9H21L16 14L18 21L12 17L6 21L8 14L3 9H9L12 2Z" />
          </svg>
          Angehefteter Beitrag
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Avatar */}
        <div
          onClick={(e) => { e.stopPropagation(); onOpenProfile(author.id); }}
          style={{
            width: 40, height: 40,
            borderRadius: '50%',
            background: isHighRank
              ? `linear-gradient(135deg, ${authorColor}, ${hexToRgba(authorColor, 0.6)})`
              : authorColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 14,
            fontFamily: socialTheme.font.system,
            flexShrink: 0,
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          {author.initials}
          {isHighRank && (
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              border: `2px solid ${authorColor}`,
              animation: 'pulse-blue 3s infinite',
              pointerEvents: 'none',
            }} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <span
              onClick={(e) => { e.stopPropagation(); onOpenProfile(author.id); }}
              style={{
                fontSize: 14, fontWeight: 700, color: socialTheme.text.primary,
                fontFamily: socialTheme.font.system,
                cursor: 'pointer',
              }}
            >
              {author.name}
            </span>
            {isHighRank && (
              <BadgeCheck size={16} color={socialTheme.accent.blue} fill={socialTheme.accent.blue} />
            )}
            <span style={{ fontSize: 14, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system }}>
              {author.handle}
            </span>
            {author.status === 'Verborgen' && (
              <span style={{
                fontSize: 10, color: socialTheme.accent.red,
                background: hexToRgba(socialTheme.accent.red, 0.15),
                padding: '1px 6px', fontWeight: 600,
                fontFamily: socialTheme.font.system,
              }}>
                <Lock size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                VERBORGEN
              </span>
            )}
            <span style={{ fontSize: 13, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system }}>
              · {post.timestamp}
            </span>
            {isOwn && (
              <span style={{
                marginLeft: 'auto',
                fontSize: 9,
                color: socialTheme.accent.blue,
                background: hexToRgba(socialTheme.accent.blue, 0.12),
                border: `1px solid ${hexToRgba(socialTheme.accent.blue, 0.3)}`,
                padding: '1px 6px',
                fontWeight: 800,
                letterSpacing: 1,
                fontFamily: socialTheme.font.mono,
                borderRadius: 4,
              }}>
                DU
              </span>
            )}
          </div>

          {/* Position & Rank */}
          <div style={{ fontSize: 12, color: socialTheme.text.secondary, marginTop: 1, fontFamily: socialTheme.font.system }}>
            <span style={{ color: rankColor, fontWeight: 600 }}>{author.rank}</span>
            <span style={{ color: socialTheme.text.tertiary }}> · {author.position}</span>
          </div>

          {/* Clearance */}
          {post.clearance && post.clearance !== 'ÖFFENTLICH' && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 6,
              padding: '2px 8px',
              fontSize: 10,
              color: socialTheme.clearanceColor[post.clearance],
              background: hexToRgba(socialTheme.clearanceColor[post.clearance], 0.1),
              border: `1px solid ${hexToRgba(socialTheme.clearanceColor[post.clearance], 0.3)}`,
              fontFamily: socialTheme.font.mono,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: socialTheme.clearanceColor[post.clearance],
              }} />
              {post.clearance}
            </div>
          )}

          {/* Post text */}
          {!canAccess ? (
            <div style={{
              marginTop: 8,
              padding: '12px 14px',
              background: socialTheme.bg.secondary,
              border: `1px solid ${socialTheme.border.accent}`,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: hexToRgba(socialTheme.accent.red, 0.15),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Lock size={16} color={socialTheme.accent.red} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: socialTheme.accent.red, fontFamily: socialTheme.font.system }}>
                  Zugriff verweigert
                </div>
                <div style={{ fontSize: 11, color: socialTheme.text.secondary, marginTop: 2, fontFamily: socialTheme.font.system }}>
                  Rang „{post.requiredRank}" erforderlich · dein Rang: S{userRankLevel}/10
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 6, fontSize: 14, color: socialTheme.text.primary, lineHeight: 1.5, fontFamily: socialTheme.font.system, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {post.text}
            </div>
          )}

          {/* Image */}
          {post.imageCaption && canAccess && (
            <div style={{
              marginTop: 10,
              height: 160,
              background: post.imageColor,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'flex-end',
              padding: 12,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.6) 100%)',
              }} />
              <div style={{
                position: 'relative',
                fontSize: 11, color: 'white', fontWeight: 500,
                fontFamily: socialTheme.font.system,
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              }}>
                {post.imageCaption}
              </div>
            </div>
          )}

          {/* Location */}
          {post.location && canAccess && (
            <div style={{
              marginTop: 6,
              fontSize: 12, color: socialTheme.text.secondary,
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: socialTheme.font.system,
            }}>
              <MapPin size={12} color={socialTheme.accent.blue} />
              {post.location}
            </div>
          )}

          {/* Hint button */}
          {post.hint && (
            <div style={{ marginTop: 8 }}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowHint(s => !s); }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  border: `1px solid ${socialTheme.border.accent}`,
                  background: showHint ? socialTheme.accent.blue : 'transparent',
                  color: showHint ? 'white' : socialTheme.accent.blue,
                  fontSize: 11, fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontFamily: socialTheme.font.system,
                  transition: 'all 0.15s',
                }}
              >
                <Eye size={12} /> {showHint ? 'Spur verbergen' : 'Spur entdecken'}
              </button>
              {showHint && (
                <div style={{
                  marginTop: 6,
                  padding: '10px 12px',
                  background: hexToRgba(socialTheme.accent.gold, 0.08),
                  border: `1px solid ${hexToRgba(socialTheme.accent.gold, 0.3)}`,
                  borderRadius: 12,
                  fontSize: 12,
                  color: socialTheme.text.primary,
                  lineHeight: 1.5,
                  display: 'flex', gap: 8,
                  fontStyle: 'italic',
                }}>
                  <AlertTriangle size={14} color={socialTheme.accent.gold} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{post.hint}</span>
                </div>
              )}
            </div>
          )}

          {/* Action bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 10,
            justifyContent: 'space-between',
            maxWidth: 400,
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowComments(s => !s); }}
              style={{
                background: 'none', border: 'none', padding: '4px 8px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                color: socialTheme.text.secondary,
                fontSize: 12, fontFamily: socialTheme.font.system,
                borderRadius: 9999, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <MessageCircle size={16} />
              <span>{post.comments.length}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onToggleRepost?.(); }}
              style={{
                background: 'none', border: 'none', padding: '4px 8px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                color: isReposted ? socialTheme.accent.green : socialTheme.text.secondary,
                fontSize: 12, fontFamily: socialTheme.font.system,
                borderRadius: 9999, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <Repeat2 size={16} fill={isReposted ? socialTheme.accent.green : 'transparent'} />
              <span>{retweetCount}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onToggleLike?.(); }}
              style={{
                background: 'none', border: 'none', padding: '4px 8px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                color: isLiked ? socialTheme.accent.red : socialTheme.text.secondary,
                fontSize: 12, fontFamily: socialTheme.font.system,
                borderRadius: 9999, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <Heart size={16} fill={isLiked ? socialTheme.accent.red : 'transparent'} />
              <span>{likeCount}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark?.(); }}
              style={{
                background: 'none', border: 'none', padding: '4px 8px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                color: isBookmarked ? socialTheme.accent.blue : socialTheme.text.secondary,
                fontSize: 12, fontFamily: socialTheme.font.system,
                borderRadius: 9999, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <Bookmark size={16} fill={isBookmarked ? socialTheme.accent.blue : 'transparent'} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setShowShareSheet(true); }}
              style={{
                background: 'none', border: 'none', padding: '4px 8px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                color: socialTheme.text.secondary,
                borderRadius: 9999, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <Share size={16} />
            </button>
          </div>

          {/* Share sheet */}
          {showShareSheet && (
            <ShareSheet
              author={author}
              post={post}
              onClose={() => { setShowShareSheet(false); setCopied(false); }}
              copied={copied}
              onCopy={() => {
                const text = `${author.name} (${author.handle}): ${post.text}`;
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(text).catch(() => {});
                }
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            />
          )}

          {/* Comments */}
          {showComments && (
            <div style={{
              marginTop: 8,
              padding: '8px 0',
              borderTop: `1px solid ${socialTheme.border.subtle}`,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (commentText.trim() && onAddComment) {
                    onAddComment(commentText);
                    setCommentText('');
                  }
                }}
                style={{
                  display: 'flex', gap: 6, alignItems: 'center',
                  paddingBottom: 8,
                  borderBottom: `1px solid ${socialTheme.border.subtle}`,
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: socialTheme.accent.blue,
                  color: 'white', fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: socialTheme.font.system,
                }}>
                  DU
                </div>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Kommentar schreiben..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: socialTheme.text.primary,
                    fontSize: 13,
                    fontFamily: socialTheme.font.system,
                    padding: '6px 0',
                  }}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  style={{
                    border: 'none',
                    background: commentText.trim() ? socialTheme.accent.blue : socialTheme.bg.hover,
                    color: commentText.trim() ? 'white' : socialTheme.text.tertiary,
                    padding: '6px 12px',
                    borderRadius: 9999,
                    fontSize: 12, fontWeight: 700,
                    cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: socialTheme.font.system,
                  }}
                >
                  Posten
                </button>
              </form>

              {allComments.length === 0 && (
                <div style={{
                  fontSize: 12, color: socialTheme.text.tertiary,
                  fontFamily: socialTheme.font.system, fontStyle: 'italic',
                  padding: '8px 0',
                }}>
                  Keine Kommentare vorhanden
                </div>
              )}
              {allComments.map((c, i) => {
                const isOwnComment = c.author === currentUser.displayName;
                const rankKey = c.authorRank as keyof typeof socialTheme.rankColor;
                const rankColor = (socialTheme.rankColor[rankKey] || '#71767b');
                return (
                  <div key={i} style={{ display: 'flex', gap: 8 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: rankColor,
                      color: 'white', fontSize: 9, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: socialTheme.font.system,
                    }}>
                      {c.author.split(' ').map(p => p[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: socialTheme.text.primary, fontFamily: socialTheme.font.system }}>
                          {c.author}
                        </span>
                        <span style={{ fontSize: 10, color: rankColor, fontFamily: socialTheme.font.system }}>
                          · {c.authorRank}
                        </span>
                        {isOwnComment && (
                          <span style={{
                            fontSize: 9,
                            color: socialTheme.accent.blue,
                            background: hexToRgba(socialTheme.accent.blue, 0.12),
                            border: `1px solid ${hexToRgba(socialTheme.accent.blue, 0.3)}`,
                            padding: '0 4px',
                            fontWeight: 800,
                            letterSpacing: 0.5,
                            fontFamily: socialTheme.font.mono,
                            borderRadius: 3,
                          }}>
                            DU
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: socialTheme.text.primary, marginTop: 2, lineHeight: 1.4, fontFamily: socialTheme.font.system }}>
                        {c.text}
                      </div>
                      {'hint' in c && c.hint && (
                        <div style={{
                          marginTop: 4, padding: '4px 8px',
                          background: hexToRgba(socialTheme.accent.gold, 0.08),
                          border: `1px solid ${hexToRgba(socialTheme.accent.gold, 0.2)}`,
                          borderRadius: 6,
                          fontSize: 11, color: socialTheme.accent.gold,
                          fontStyle: 'italic', fontFamily: socialTheme.font.system,
                        }}>
                          {c.hint}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SocialFeedProps {
  onOpenProfile: (id: string) => void;
  extraPosts?: Post[];
  suspicion?: number;
  scope?: 'foryou' | 'following';
  followedIds?: string[];
  bookmarkedIds?: string[];
  onToggleBookmark?: (id: string) => void;
  likedIds?: string[];
  repostedIds?: string[];
  onToggleLike?: (id: string) => void;
  onToggleRepost?: (id: string) => void;
  extraComments?: Record<string, { id: string; postId: string; author: string; authorRank: string; text: string; createdAt: number }[]>;
  onAddComment?: (postId: string, text: string) => void;
}

export function SocialFeed({ onOpenProfile, extraPosts = [], suspicion = 0, scope = 'foryou', followedIds = [], bookmarkedIds = [], onToggleBookmark, likedIds = [], repostedIds = [], onToggleLike, onToggleRepost, extraComments = {}, onAddComment }: SocialFeedProps) {
  const basePosts = scope === 'foryou'
    ? posts
    : posts.filter(p => followedIds.includes(p.authorId));
  const ownIds = new Set(extraPosts.map(p => p.id));
  const merged: Post[] = [
    ...extraPosts,
    ...basePosts.filter(p => !ownIds.has(p.id)),
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: socialTheme.bg.primary }} className="hide-scrollbar">
      <style>{socialGlobalCss}</style>

      {suspicion >= 25 && (
        <div style={{
          padding: '10px 16px',
          background: hexToRgba(suspicion >= 50 ? socialTheme.accent.red : socialTheme.accent.gold, 0.08),
          borderBottom: `1px solid ${hexToRgba(suspicion >= 50 ? socialTheme.accent.red : socialTheme.accent.gold, 0.2)}`,
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: socialTheme.text.primary,
          fontFamily: socialTheme.font.system,
        }}>
          <AlertTriangle
            size={14}
            color={suspicion >= 50 ? socialTheme.accent.red : socialTheme.accent.gold}
          />
          <span style={{ fontWeight: 600 }}>
            {suspicion >= 50 ? 'Du stehst unter konkreter Beobachtung.' : 'Funktionäre prüfen deine Beiträge.'}
          </span>
        </div>
      )}

      {merged.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onOpenProfile={onOpenProfile}
          isOwn={post.authorId === currentUser.id}
          isBookmarked={bookmarkedIds.includes(post.id)}
          onToggleBookmark={() => onToggleBookmark?.(post.id)}
          isLiked={likedIds.includes(post.id)}
          isReposted={repostedIds.includes(post.id)}
          onToggleLike={() => onToggleLike?.(post.id)}
          onToggleRepost={() => onToggleRepost?.(post.id)}
          extraComments={extraComments[post.id] || []}
          onAddComment={(text) => onAddComment?.(post.id, text)}
        />
      ))}

      <div style={{
        padding: '32px 16px',
        textAlign: 'center',
        fontSize: 13,
        color: socialTheme.text.tertiary,
        fontFamily: socialTheme.font.system,
      }}>
        {scope === 'following' && merged.length === 0
          ? 'Du folgst noch niemandem · Tippe auf "Folgen" in Profilen'
          : merged.length === 0
            ? 'Noch nichts hier'
            : 'Das war\'s für jetzt · Sei wachsam'}
      </div>
    </div>
  );
}

function ShareSheet({ author, post, onClose, onCopy, copied }: { author: Profile; post: Post; onClose: () => void; onCopy: () => void; copied: boolean }) {
  const shareText = `${author.name} (${author.handle}): ${post.text}`;
  const navigate = useNavigate();

  const handleWazaaah = () => {
    try {
      window.localStorage.setItem('wazaaah-share-pending', JSON.stringify({
        author: author.name,
        handle: author.handle,
        text: post.text,
        timestamp: Date.now(),
      }));
    } catch {
      // ignore quota / private mode errors
    }
    navigate('/wazaaah');
  };

  const handleMessages = () => {
    try {
      window.localStorage.setItem('messages-share-pending', JSON.stringify({
        author: author.name,
        handle: author.handle,
        text: post.text,
        timestamp: Date.now(),
      }));
    } catch {
      // ignore quota / private mode errors
    }
    navigate('/messages');
  };

  const handleMail = () => {
    const subject = encodeURIComponent(`Beitrag von ${author.name}`);
    const body = encodeURIComponent(shareText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: socialTheme.bg.secondary,
          width: '100%',
          padding: '16px',
          borderTop: `1px solid ${socialTheme.border.subtle}`,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <span style={{
            fontSize: 16, fontWeight: 700, color: socialTheme.text.primary,
            fontFamily: socialTheme.font.system,
          }}>
            Beitrag teilen
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', padding: 4, cursor: 'pointer',
              color: socialTheme.text.secondary,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <button
            onClick={handleWazaaah}
            style={{
              padding: '14px 8px',
              border: 'none',
              borderRadius: 12,
              background: '#25D366',
              color: 'white',
              fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: socialTheme.font.system,
            }}
          >
            <MessageCircle size={20} />
            Wazaaah
          </button>
          <button
            onClick={handleMessages}
            style={{
              padding: '14px 8px',
              border: 'none',
              borderRadius: 12,
              background: '#1A73E8',
              color: 'white',
              fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: socialTheme.font.system,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            SMS
          </button>
          <button
            onClick={handleMail}
            style={{
              padding: '14px 8px',
              border: `1px solid ${socialTheme.border.default}`,
              borderRadius: 12,
              background: 'transparent',
              color: socialTheme.text.primary,
              fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: socialTheme.font.system,
            }}
          >
            <Mail size={20} />
            E-Mail
          </button>
        </div>

        <button
          onClick={onCopy}
          style={{
            marginTop: 8,
            width: '100%',
            padding: '14px 12px',
            border: `1px solid ${socialTheme.border.default}`,
            borderRadius: 12,
            background: copied ? hexToRgba(socialTheme.accent.green, 0.15) : 'transparent',
            color: copied ? socialTheme.accent.green : socialTheme.text.primary,
            fontSize: 13, fontWeight: 700,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: socialTheme.font.system,
            transition: 'all 0.15s',
          }}
        >
          <LinkIcon size={18} />
          {copied ? 'Kopiert!' : 'Text kopieren'}
        </button>
      </div>
    </div>
  );
}