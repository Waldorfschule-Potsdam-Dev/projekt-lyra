import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Reply, Forward, Trash2, Star } from 'lucide-react';
import { ym } from './styles';
import { useEmails, markRead, deleteEmail, ME_ID } from './store';
import { useProfile } from './profile';
import { findAccount } from './seed';
import { MarkdownRenderer } from '../files/MarkdownRenderer';
import { CollectClueButton } from '../components/CollectClueButton';

const formatFull = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleString('de-DE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export default function EmailDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const all = useEmails();
  const profile = useProfile();
  const email = all.find(e => e.id === id);

  if (!id || !email) {
    setTimeout(() => navigate('/mail'), 0);
    return null;
  }

  if (!email.read) markRead(email.id);

  const isOutgoing = email.fromId === ME_ID;
  const counterId = isOutgoing ? email.toId : email.fromId;
  const counter = findAccount(counterId);

  const subject = email.subject;

  const handleReply = () => {
    navigate(`/mail/compose?reply=${email.id}`);
  };

  const handleDelete = () => {
    deleteEmail(email.id);
    navigate('/mail');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: ym.bg }}>
      <header
        style={{
          background: ym.red, color: '#fff',
          padding: '12px 8px',
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        <button
          onClick={() => navigate('/mail')}
          aria-label="Zurück"
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <ArrowLeft size={20} />
          <span style={{ fontSize: 15 }}>Posteingang</span>
        </button>
        <div style={{ flex: 1 }} />
        <button aria-label="Markieren" style={{ background: 'transparent', border: 'none', color: '#fff', padding: 8, cursor: 'pointer' }}>
          <Star size={20} />
        </button>
        <button onClick={handleDelete} aria-label="Löschen" style={{ background: 'transparent', border: 'none', color: '#fff', padding: 8, cursor: 'pointer' }}>
          <Trash2 size={20} />
        </button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: ym.surface }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0 0 12px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: ym.text, margin: 0 }}>{subject}</h1>
          {email.id === 'pes-overview' && <CollectClueButton clueId="mail:pes-liste" />}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 0', borderBottom: `1px solid ${ym.border}`, marginBottom: 16,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: isOutgoing ? profile.color : counter.color,
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 600,
          }}>
            {(isOutgoing ? profile.name : counter.name).charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: ym.text }}>
              {isOutgoing ? `An: ${counter.name} <${counter.email}>` : `${counter.name} <${counter.email}>`}
            </div>
            <div style={{ fontSize: 12, color: ym.textMuted }}>
              {isOutgoing ? `Von: ${profile.name} <${profile.email}>` : `An ${profile.name} <${profile.email}> · ${formatFull(email.timestamp)}`}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 15, color: ym.text, lineHeight: 1.7, wordBreak: 'break-word' }}>
          <MarkdownRenderer content={email.body} dark />
        </div>

        {email.isAd && (
          <div style={{ marginTop: 24, padding: 12, background: ym.redSoft, borderRadius: 8, color: '#7BA8FF', fontSize: 13, border: `1px solid ${ym.blue}` }}>
            ⚠️ Diese Nachricht wurde als Spam erkannt.
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', gap: 8, padding: 12,
        background: ym.surface, borderTop: `1px solid ${ym.border}`,
      }}>
        <button
          onClick={handleReply}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 16px', borderRadius: 22,
            background: ym.blue, color: ym.white, border: 'none',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Reply size={16} />
          Antworten
        </button>
        <button
          onClick={handleReply}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 16px', borderRadius: 22,
            background: ym.surfaceElevated, color: ym.text, border: `1px solid ${ym.border}`,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Forward size={16} />
          Weiterleiten
        </button>
      </div>
    </div>
  );
}
