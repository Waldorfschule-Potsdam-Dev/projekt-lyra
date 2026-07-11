import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { COLORS, STORIES, type StoryItem } from './data';
import { Avatar } from './Avatar';

function StoryRing({
  hasStory,
  isOwn,
  size = 64,
  innerSize,
  img,
  emoji,
}: {
  hasStory: boolean;
  isOwn?: boolean;
  size?: number;
  innerSize?: number;
  img?: string | null;
  emoji?: string;
}) {
  const ringSize = size;
  const inner = innerSize ?? size - 6;
  return (
    <div
      style={{
        width: ringSize,
        height: ringSize,
        borderRadius: '50%',
        background: hasStory ? COLORS.igGradient : '#dbdbdb',
        padding: 3,
        boxSizing: 'border-box',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: inner,
            height: inner,
            borderRadius: '50%',
            background: COLORS.igGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: inner - 3,
              height: inner - 3,
              borderRadius: '50%',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AvatarRingInner hasStory={hasStory} isOwn={isOwn} img={img} emoji={emoji} />
          </div>
        </div>
        {isOwn && (
          <div
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: '#3797f0',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={14} color="#fff" strokeWidth={2.5} />
          </div>
        )}
      </div>
    </div>
  );
}

function AvatarRingInner({ hasStory, isOwn, img, emoji }: { hasStory: boolean; isOwn?: boolean; img?: string | null; emoji?: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isOwn && !hasStory ? '#e0e0e0' : 'transparent',
        fontSize: 16,
        overflow: 'hidden',
      }}
    >
      {img ? (
        <img
          src={img}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <span style={{ fontSize: 20 }}>{isOwn && !hasStory ? '🐱' : emoji}</span>
      )}
    </div>
  );
}

export function StoryTray() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        padding: '12px 14px',
        borderBottom: `1px solid ${COLORS.border}`,
        overflowX: 'auto',
        backgroundColor: COLORS.bg,
        flexShrink: 0,
        scrollbarWidth: 'none',
      }}
    >
      {STORIES.map((s) => (
        <StoryTrayItem key={s.id} story={s} />
      ))}
    </div>
  );
}

function StoryTrayItem({ story }: { story: StoryItem }) {
  const navigate = useNavigate();
  const hasStory = !!story.img;
  const handleClick = () => {
    if (story.isOwn) {
      navigate('/lumigram/profile');
    } else {
      navigate(`/lumigram/user/${story.user}`);
    }
  };
  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
        opacity: 1,
        minWidth: 70,
      }}
    >
      <StoryRing hasStory={hasStory} isOwn={story.isOwn} img={story.avatarImg} emoji={story.avatar} />
      <span
        style={{
          fontSize: 11,
          color: COLORS.text,
          maxWidth: 70,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        {story.isOwn ? 'Deine Story' : story.user}
      </span>
    </div>
  );
}

export function StoryViewer() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const story = STORIES.find((s) => s.id === Number(storyId));
  const [progress, setProgress] = useState(0);
  const DURATION = 5000;

  useEffect(() => {
    if (!story?.img) return;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / DURATION) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(id);
        navigate('/lumigram');
      }
    }, 50);
    return () => clearInterval(id);
  }, [storyId, story?.img, navigate]);

  if (!story || !story.img) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <span>Story nicht gefunden</span>
        <button
          onClick={() => navigate('/lumigram')}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  const close = () => navigate('/lumigram');

  return (
    <div
      onClick={close}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#000',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: 'rgba(255,255,255,0.3)',
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#fff',
            transition: 'width 0.05s linear',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar emoji={story.avatar} img={story.avatarImg} size={32} />
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{story.user}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{story.time}</div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url("${story.img}")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: '#000',
        }}
      />
    </div>
  );
}
