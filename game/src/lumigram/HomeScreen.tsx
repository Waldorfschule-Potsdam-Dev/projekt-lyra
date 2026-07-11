import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReward } from 'react-rewards';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { COLORS, POSTS } from './data';
import { Avatar } from './Avatar';
import { StoryTray } from './Story';

function PostCard({ post }: { post: (typeof POSTS)[number] }) {
  const [liked, setLiked] = useState(false);
  const clickTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const { reward: shootHearts, isAnimating: isHeartsAnimating } = useReward(`heart-${post.id}`, 'emoji', {
    emoji: ['❤️', '💖', '✨'],
    elementCount: 12,
    spread: 60,
    zIndex: 10,
  });

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      shootHearts();
    } else {
      setLiked(false);
    }
  };

  const handleImageClick = () => {
    if (clickTimerRef.current !== null) return;
    clickTimerRef.current = window.setTimeout(() => {
      clickTimerRef.current = null;
      navigate(`/lumigram/post/${post.id}`);
    }, 250);
  };

  const handleImageDoubleTap = () => {
    if (clickTimerRef.current !== null) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    setLiked(true);
    shootHearts();
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar emoji={post.avatar} img={post.avatarImg} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>{post.user}</span>
        <MoreHorizontal size={20} color={COLORS.text} style={{ marginLeft: 'auto' }} />
      </div>
      <div
        onClick={handleImageClick}
        onDoubleClick={handleImageDoubleTap}
        style={{
          width: '100%',
          aspectRatio: '1/1',
          backgroundColor: '#e0e0e0',
          backgroundImage: `url("${post.img}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          userSelect: 'none',
          cursor: 'pointer',
        }}
      >
        <span id={`heart-${post.id}`} style={{ position: 'absolute', top: '50%', left: '50%' }} />
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            color: 'rgba(255,255,255,0.9)',
            fontSize: 12,
            fontWeight: 500,
            background: 'rgba(0,0,0,0.5)',
            padding: '4px 10px',
            borderRadius: 12,
            backdropFilter: 'blur(4px)',
          }}
        >
          Doppeltippen zum Liken!
        </div>
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', gap: 16, alignItems: 'center' }}>
        <Heart
          onClick={handleLike}
          fill={liked ? COLORS.accent : 'transparent'}
          color={liked ? COLORS.accent : COLORS.text}
          size={24}
          style={{
            cursor: 'pointer',
            transform: isHeartsAnimating ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        />
        <MessageCircle color={COLORS.text} size={24} />
        <Send color={COLORS.text} size={24} />
        <Bookmark color={COLORS.text} size={24} style={{ marginLeft: 'auto' }} />
      </div>
      <div style={{ padding: '0 16px', fontSize: 14 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{liked ? post.likes + 1 : post.likes} Gefällt mir</div>
        <div>
          <span style={{ fontWeight: 600, marginRight: 8 }}>{post.user}</span>
          {post.caption}
        </div>
        <div style={{ color: COLORS.muted, marginTop: 4, fontSize: 12 }}>{post.time}</div>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: COLORS.bg, color: COLORS.text }}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: 20, fontFamily: 'serif' }}>Lumigram</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <Heart color={COLORS.text} size={24} />
          <MessageCircle color={COLORS.text} size={24} />
        </div>
      </div>
      <StoryTray />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {POSTS.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
