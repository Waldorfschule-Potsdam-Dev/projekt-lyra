import { User, Zap, MessagesSquare } from 'lucide-react';
import type { Article } from './data';
export default function StartScreen({
  articles,
  onSelect,
  onOpenAccount,
  onOpenChats,
  bookmarkCount,
  breaking,
  chatCount,
}: {
  articles: Article[];
  onSelect: (a: Article) => void;
  onOpenAccount: () => void;
  bookmarkCount: number;
  breaking: { article: Article; time: string } | null;
}) {
  return (
    <div style={{ padding: '8px 16px 24px' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '16px 0 12px',
        }}
      >
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: '#FF6B35', fontWeight: 600 }}>
            Top-News
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginTop: 4 }}>Aktuell</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={onOpenAccount}
            aria-label="Mein Konto"
            style={{
              position: 'relative',
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#1A1A1C',
              border: '1px solid #232327',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <User size={20} strokeWidth={1.8} color="#fff" />
            {bookmarkCount > 0 && (
              <span
                aria-label={`${bookmarkCount} gemerkte Artikel`}
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: '#FF6B35',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 5px',
                  border: '2px solid #0F0F10',
                  lineHeight: 1,
                  pointerEvents: 'none',
                }}
              >
                {bookmarkCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {breaking && (
        <button
          onClick={() => onSelect(breaking.article)}
          role="button"
          aria-label={`Eilmeldung: ${breaking.article.title}`}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            background: 'linear-gradient(135deg, #B71C1C 0%, #E53935 100%)',
            border: '1px solid #C62828',
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 16,
            cursor: 'pointer',
            color: '#fff',
            font: 'inherit',
            boxShadow: '0 4px 12px rgba(183,28,28,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#fff',
                color: '#B71C1C',
                fontSize: 10,
                fontWeight: 800,
                padding: '3px 7px',
                borderRadius: 3,
                letterSpacing: 1.2,
              }}
            >
              <Zap size={10} strokeWidth={3} color="#B71C1C" fill="#B71C1C" />
              EILMELDUNG
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{breaking.time}</span>
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.3,
            }}
          >
            {breaking.article.title}
          </div>
        </button>
      )}

      {articles.length === 0 ? (
        <div
          style={{
            marginTop: 20,
            padding: '32px 16px',
            textAlign: 'center',
            color: '#8A8A92',
            fontSize: 13,
            lineHeight: 1.5,
            backgroundColor: '#141416',
            border: '1px dashed #2A2A2E',
            borderRadius: 12,
          }}
        >
          Du hast alle Themen deaktiviert.
          <br />
          Aktiviere welche in „Mein Konto".
        </div>
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {articles.map((a) => {
          const TopicIcon = a.Icon;
          return (
            <article
              key={a.id}
              onClick={() => onSelect(a)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelect(a);
              }}
              style={{
                backgroundColor: '#1A1A1C',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                border: '1px solid #232327',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                display: 'block',
                padding: 0,
                font: 'inherit',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: 170,
                  background: a.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TopicIcon size={72} strokeWidth={1.2} color="rgba(255,255,255,0.85)" />
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.9)',
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    padding: '4px 8px',
                    borderRadius: 999,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {a.time}
                </div>
              </div>

              <div style={{ padding: '14px 16px 16px' }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#E53935',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  {a.topic}
                </div>
                <h2
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: '6px 0 8px',
                    lineHeight: 1.25,
                  }}
                >
                  {a.title}
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: '#B8B8BD',
                    margin: 0,
                  }}
                >
                  {a.summary}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '1px solid #26262A',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: '#000',
                      border: '1px solid #333',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      flexShrink: 0,
                    }}
                  >
                    {a.authorInitials}
                  </div>
                  <div style={{ fontSize: 12, color: '#8A8A92' }}>
                    Ein Artikel von <span style={{ color: '#D8D8DE', fontWeight: 500 }}>{a.author}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      )}
    </div>
  );
}
