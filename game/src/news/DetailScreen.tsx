import { ArrowLeft, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import type { Article } from './data';
import { parseSegments, isLetterFormat, splitSalutation } from './utils';
import { CollectClueButton } from '../components/CollectClueButton';
export default function DetailScreen({
  article,
  onBack,
  bookmarked,
  onToggleBookmark,
}: {
  article: Article;
  onBack: () => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}) {
  const TopicIcon = article.Icon;
  const letter = isLetterFormat(article);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0F0F10',
        color: '#fff',
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            position: 'relative',
            height: 260,
            background: article.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TopicIcon size={120} strokeWidth={1.1} color="rgba(255,255,255,0.85)" />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              onClick={onBack}
              aria-label="Zurück"
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ArrowLeft size={20} strokeWidth={2} color="#fff" />
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onToggleBookmark}
                aria-label="Lesezeichen"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: bookmarked ? '#FF6B35' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <Bookmark size={18} strokeWidth={2} color={bookmarked ? '#FF6B35' : '#fff'} fill={bookmarked ? '#FF6B35' : 'none'} />
              </button>
              <button
                aria-label="Teilen"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <Share2 size={18} strokeWidth={2} color="#fff" />
              </button>
              <button
                aria-label="Mehr"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <MoreHorizontal size={18} strokeWidth={2} color="#fff" />
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 20px 12px' }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#E53935',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            {article.topic}
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#ffffff',
              margin: '8px 0 16px',
              lineHeight: 1.2,
              letterSpacing: -0.3,
            }}
          >
            {article.title}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              paddingBottom: 16,
              borderBottom: '1px solid #232327',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#000',
                border: '1px solid #333',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.4,
                flexShrink: 0,
              }}
            >
              {article.authorInitials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
                {article.author}
                {article.id === 1 && <CollectClueButton clueId="news:dr-vollmer" size={14} />}
              </div>
              <div style={{ fontSize: 12, color: '#8A8A92', marginTop: 2 }}>{article.time} · 4 Min Lesezeit</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px 8px' }}>
          {article.body.map((p, i) => {
            if (letter && i === 0) {
              const split = splitSalutation(p);
              if (split) {
                return (
                  <div key={i}>
                    <div
                      style={{
                        fontSize: 20,
                        fontStyle: 'italic',
                        color: '#FF6B35',
                        fontWeight: 600,
                        margin: '0 0 16px',
                        fontFamily: 'Georgia, "Times New Roman", "DejaVu Serif", serif',
                        lineHeight: 1.4,
                      }}
                    >
                      {split.salutation}
                    </div>
                    <BodyParagraph text={split.rest} />
                  </div>
                );
              }
            }
            return <BodyParagraph key={i} text={p} />;
          })}
        </div>

        <div style={{ padding: '8px 20px 32px' }}>
          <div style={{ fontSize: 12, color: '#8A8A92', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
            Themen
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {article.tags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 12,
                  color: '#D8D8DE',
                  backgroundColor: '#1A1A1C',
                  border: '1px solid #2A2A2E',
                  padding: '6px 12px',
                  borderRadius: 999,
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

function BodyParagraph({ text }: { text: string }) {
  const segments = parseSegments(text);
  return (
    <>
      {segments.map((s, i) =>
        s.type === 'speech' ? (
          <blockquote
            key={i}
            style={{
              fontSize: 19,
              fontStyle: 'italic',
              color: '#ffffff',
              borderLeft: '3px solid #FF6B35',
              backgroundColor: 'rgba(255, 107, 53, 0.08)',
              padding: '14px 18px',
              borderRadius: '0 10px 10px 0',
              margin: '14px 0',
              lineHeight: 1.55,
            }}
          >
            {s.content}
          </blockquote>
        ) : s.content.trim() ? (
          <p
            key={i}
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: '#EDEDF2',
              margin: '0 0 20px',
            }}
          >
            {s.content}
          </p>
        ) : null
      )}
    </>
  );
}
