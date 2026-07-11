import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, X, MoreHorizontal } from 'lucide-react';
import { COLORS, POSTS, PROFILE_POSTS, PROFILE } from './data';
import { Avatar } from './Avatar';

export default function PostDetail() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const id = Number(postId);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const profilePost = PROFILE_POSTS.find((p) => p.id === id);
  const feedPost = POSTS.find((p) => p.id === id);
  const post = profilePost ?? feedPost;

  if (!post) {
    return (
      <div
        style={{
          height: '100%',
          backgroundColor: '#000',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <span>Beitrag nicht gefunden</span>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Zurück
        </button>
      </div>
    );
  }

  const isProfileGridPost = !!profilePost && !feedPost;
  const user = (post as typeof feedPost)?.user ?? PROFILE.username;
  const avatar = (post as typeof feedPost)?.avatar ?? '🐱';
  const avatarImg = (post as typeof feedPost)?.avatarImg ?? PROFILE.avatarImg;
  const img = (post as typeof feedPost)?.img ?? profilePost?.img;
  const fallbackBg = profilePost?.bg;
  const caption = (post as typeof feedPost)?.caption;
  const likes = (post as typeof feedPost)?.likes;
  const time = (post as typeof feedPost)?.time;
  const likeCount = likes !== undefined ? (liked ? likes + 1 : likes) : undefined;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLORS.bg,
        color: COLORS.text,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: `1px solid ${COLORS.border}`,
          gap: 8,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Schließen"
          style={{
            background: 'none',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.text,
          }}
        >
          <X size={26} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, marginLeft: 4 }}>
          <Avatar emoji={avatar} img={avatarImg} size={32} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>{user}</span>
        </div>
        <MoreHorizontal size={22} color={COLORS.text} />
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          backgroundColor: '#000',
          backgroundImage: img ? `url("${img}")` : fallbackBg,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {!img && fallbackBg && (
          <span style={{ fontSize: 72, color: 'rgba(255,255,255,0.7)' }}>{profilePost?.icon}</span>
        )}
      </div>

      {!isProfileGridPost && (
        <>
          <div
            style={{
              padding: '10px 14px 6px',
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <Heart
              onClick={() => setLiked((v) => !v)}
              fill={liked ? COLORS.accent : 'transparent'}
              color={liked ? COLORS.accent : COLORS.text}
              size={26}
              style={{ cursor: 'pointer' }}
            />
            <MessageCircle color={COLORS.text} size={26} style={{ cursor: 'pointer' }} />
            <Send color={COLORS.text} size={26} style={{ cursor: 'pointer' }} />
            <Bookmark
              onClick={() => setSaved((v) => !v)}
              fill={saved ? COLORS.text : 'transparent'}
              color={COLORS.text}
              size={26}
              style={{ cursor: 'pointer', marginLeft: 'auto' }}
            />
          </div>
          <div style={{ padding: '0 14px 14px', fontSize: 14, flexShrink: 0 }}>
            {likeCount !== undefined && (
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {likeCount.toLocaleString('de-DE')} Gefällt mir
              </div>
            )}
            {caption && (
              <div>
                <span style={{ fontWeight: 600, marginRight: 8 }}>{user}</span>
                {caption}
              </div>
            )}
            {time && (
              <div style={{ color: COLORS.muted, marginTop: 6, fontSize: 11, letterSpacing: 0.3 }}>
                {time}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
