import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal, Film } from 'lucide-react';
import { COLORS, CHATS, STORIES, SUGGESTED_PEOPLE, POSTS, PROFILE_POSTS } from './data';
import { Avatar } from './Avatar';

type FoundUser = {
  name: string;
  avatar: string;
  avatarImg: string | null;
  isOwn: boolean;
  storyId: number | null;
  storyImg: string | null;
};

function findUser(name: string | undefined): FoundUser | null {
  if (!name) return null;
  const story = STORIES.find((s) => s.user === name);
  if (story) {
    return {
      name: story.user,
      avatar: story.avatar,
      avatarImg: story.avatarImg,
      isOwn: story.isOwn,
      storyId: story.id,
      storyImg: story.img,
    };
  }
  const chat = CHATS.find((c) => c.user === name);
  if (chat) {
    const s = STORIES.find((x) => x.user === name);
    return {
      name: chat.user,
      avatar: chat.avatar,
      avatarImg: chat.img,
      isOwn: false,
      storyId: s?.id ?? null,
      storyImg: s?.img ?? null,
    };
  }
  const suggested = SUGGESTED_PEOPLE.find((p) => p.name === name);
  if (suggested) {
    const s = STORIES.find((x) => x.user === name);
    return {
      name: suggested.name,
      avatar: suggested.avatar,
      avatarImg: suggested.img,
      isOwn: false,
      storyId: s?.id ?? null,
      storyImg: s?.img ?? null,
    };
  }
  return null;
}

function getStats(userName: string) {
  const ownPosts = POSTS.filter((p) => p.user === userName).length;
  if (ownPosts > 0) {
    return { posts: ownPosts, followers: '287', following: '412' };
  }
  return { posts: 0, followers: '0', following: '0' };
}

export default function UserProfileScreen() {
  const navigate = useNavigate();
  const { userName } = useParams<{ userName: string }>();
  const user = findUser(userName);
  const [tab, setTab] = useState<'posts' | 'reels'>('posts');

  if (!user) {
    return (
      <div
        style={{
          height: '100%',
          backgroundColor: COLORS.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
          color: COLORS.text,
        }}
      >
        <span>Profil nicht gefunden</span>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            padding: '6px 14px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Zurück
        </button>
      </div>
    );
  }

  const userPosts = POSTS.filter((p) => p.user === user.name);
  const fallbackPosts = userPosts.length > 0 ? userPosts : PROFILE_POSTS.slice(0, 6);
  const stats = getStats(user.name);
  const showFallback = userPosts.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: COLORS.bg }}>
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
        <ChevronLeft
          size={28}
          color={COLORS.text}
          onClick={() => navigate(-1)}
          style={{ cursor: 'pointer' }}
        />
        <span style={{ fontWeight: 'bold', fontSize: 18 }}>{user.name}</span>
        <MoreHorizontal size={24} color={COLORS.text} style={{ cursor: 'pointer' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {user.storyImg && (
          <div
            onClick={() => user.storyId !== null && navigate(`/lumigram/story/${user.storyId}`)}
            style={{
              margin: '12px 16px',
              padding: '10px 14px',
              backgroundColor: COLORS.border,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: COLORS.igGradient,
                padding: 2,
                boxSizing: 'border-box',
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
                  fontSize: 18,
                  overflow: 'hidden',
                }}
              >
                {user.avatarImg ? (
                  <img
                    src={user.avatarImg}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <span>{user.avatar}</span>
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>Story ansehen</div>
              <div style={{ fontSize: 11, color: COLORS.muted }}>Tippen zum Öffnen</div>
            </div>
          </div>
        )}

        <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Avatar emoji={user.avatar} img={user.avatarImg} size={80} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{stats.posts}</div>
              <div style={{ fontSize: 12 }}>Beiträge</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{stats.followers}</div>
              <div style={{ fontSize: 12 }}>Follower</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{stats.following}</div>
              <div style={{ fontSize: 12 }}>Gefolgt</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name.replace(/_/g, ' ')}</div>
          <div style={{ fontSize: 13, color: COLORS.text, marginTop: 2 }}>
            {showFallback
              ? 'Noch keine Beiträge — folge, um Updates zu sehen.'
              : 'Beiträge dieser Person im Feed.'}
          </div>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', gap: 8 }}>
          <button
            style={{
              flex: 1,
              backgroundColor: '#efefef',
              color: COLORS.text,
              border: 'none',
              borderRadius: 8,
              padding: 8,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Gefolgt
          </button>
          <button
            style={{
              flex: 1,
              backgroundColor: '#efefef',
              color: COLORS.text,
              border: 'none',
              borderRadius: 8,
              padding: 8,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Nachricht
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            borderTop: `1px solid ${COLORS.border}`,
            borderBottom: `1px solid ${COLORS.border}`,
            marginTop: 16,
          }}
        >
          <div
            onClick={() => setTab('posts')}
            style={{
              flex: 1,
              padding: 12,
              textAlign: 'center',
              cursor: 'pointer',
              borderTop: tab === 'posts' ? '2px solid #262626' : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: 18 }}>📷</span>
          </div>
          <div
            onClick={() => setTab('reels')}
            style={{
              flex: 1,
              padding: 12,
              textAlign: 'center',
              cursor: 'pointer',
              borderTop: tab === 'reels' ? '2px solid #262626' : '2px solid transparent',
              color: COLORS.text,
            }}
          >
            <Film size={20} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {fallbackPosts.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/lumigram/post/${item.id}`)}
              style={{
                aspectRatio: '1/1',
                background: (item as typeof PROFILE_POSTS[number]).bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 28,
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              {showFallback && (item as typeof PROFILE_POSTS[number]).img ? (
                <img
                  src={(item as typeof PROFILE_POSTS[number]).img}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : showFallback ? (
                (item as typeof PROFILE_POSTS[number]).icon
              ) : (
                <img
                  src={(item as typeof POSTS[number]).img}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
