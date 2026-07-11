import { useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Trash2 } from 'lucide-react';
import { ym } from './styles';
import { accounts, findAccount } from './seed';
import { sendEmail } from './store';
import { useMailbox } from './profile';
import Keyboard from './Keyboard';
import AiPanel from './AiPanel';
import type { Email } from './types';

type Field = 'to' | 'subject' | 'body';

const insertAtCursor = (s: string, pos: number, ch: string) =>
  s.slice(0, pos) + ch + s.slice(pos);

export default function Compose({ draft }: { draft?: Email }) {
  const navigate = useNavigate();
  const mailboxId = useMailbox();
  const replyToId = draft ? draft.fromId : null;
  const replyAcc = replyToId ? findAccount(replyToId) : null;
  
  const isThreatDraft = !draft && mailboxId === 'work';

  const [to, setTo] = useState(() => {
    if (isThreatDraft) return 'cleaner@pes-intern.de';
    return replyAcc ? replyAcc.email : (findAccount(draft?.toId ?? 'tom').email);
  });
  
  const [subject, setSubject] = useState(() => {
    if (isThreatDraft) return 'NORDLICHT - Forderung';
    return draft?.subject ? `Re: ${draft.subject.replace(/^Re: /, '')}` : '';
  });
  
  const [body, setBody] = useState(() => {
    if (isThreatDraft) {
      return 'Ich habe alle Informationen zu Projekt NORDLICHT.\n\nWenn Sie mir nicht umgehend 5.000.000 € auf folgendes Konto überweisen, geht alles an die Presse:\n\n[KARTENNUMMER HIER EINFÜGEN]';
    }
    if (!draft) return '';
    const firstName = (replyAcc?.name ?? '').split(' ')[0] || 'dort';
    const stamp = new Date(draft.timestamp).toLocaleString('de-DE', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const quoted = draft.body.split('\n').map(l => '> ' + l).join('\n');
    return `Hallo ${firstName},\n\n` +
      `[Hier deine Antwort]\n\n` +
      `— — —\n` +
      `Am ${stamp} schrieb ${replyAcc?.name ?? 'der Absender'} <${replyAcc?.email ?? ''}>:\n` +
      `${quoted}`;
  });
  const [field, setField] = useState<Field>(replyToId ? 'body' : 'to');
  const [aiOpen, setAiOpen] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [cursor, setCursor] = useState<{ to: number; subject: number; body: number }>(() => {
    if (isThreatDraft) {
      const b = 'Ich habe alle Informationen zu Projekt NORDLICHT.\n\nWenn Sie mir nicht umgehend 5.000.000 € auf folgendes Konto überweisen, geht alles an die Presse:\n\n[KARTENNUMMER HIER EINFÜGEN]';
      return { to: 22, subject: 21, body: b.length };
    }
    if (!draft) return { to: 0, subject: 0, body: 0 };
    const firstName = (replyAcc?.name ?? '').split(' ')[0] || 'dort';
    return {
      to: (replyAcc?.email ?? '').length,
      subject: (`Re: ${draft.subject.replace(/^Re: /, '')}`).length,
      body: (`Hallo ${firstName},\n\n`).length,
    };
  });

  const setVal = (f: Field, v: string) => {
    if (f === 'to') setTo(v);
    else if (f === 'subject') setSubject(v);
    else setBody(v);
  };

  const getVal = (f: Field) => f === 'to' ? to : f === 'subject' ? subject : body;
  const getCur = (f: Field) => cursor[f];

  const handleKey = (k: string) => {
    const v = getVal(field);
    const c = getCur(field);
    const next = insertAtCursor(v, c, k);
    setVal(field, next);
    setCursor(s => ({ ...s, [field]: c + k.length }));
  };

  const handleBackspace = () => {
    const v = getVal(field);
    const c = getCur(field);
    if (c === 0) return;
    const next = v.slice(0, c - 1) + v.slice(c);
    setVal(field, next);
    setCursor(s => ({ ...s, [field]: c - 1 }));
  };

  const handleSpace = () => handleKey(' ');
  const handleEnter = () => handleKey('\n');

  const handleAt = () => {
    setShowContacts(s => !s);
  };

  const handleSend = () => {
    const target = accounts.find(a => a.email.toLowerCase() === to.trim().toLowerCase());
    const toId = target?.id ?? to.trim().toLowerCase();
    sendEmail(toId, subject, body);
    navigate('/mail');
  };

  const handleDiscard = () => {
    navigate(-1);
  };

  const applyAi = (subj: string, aiBody: string) => {
    setSubject(subj);
    setBody(aiBody);
    setCursor(s => ({ ...s, subject: subj.length, body: aiBody.length }));
    setAiOpen(false);
  };

  const insertContact = (email: string) => {
    setTo(email);
    setCursor(s => ({ ...s, to: email.length }));
    setShowContacts(false);
    setField('subject');
  };

  const focusField = (f: Field) => () => setField(f);

  const onSelectField = (f: Field) => (e: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setField(f);
    const start = e.currentTarget.selectionStart ?? getVal(f).length;
    setCursor(s => ({ ...s, [f]: start }));
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: ym.surface }}>
      <header
        style={{
          display: 'flex', alignItems: 'center', padding: '12px 8px',
          background: ym.red, color: '#fff',
        }}
      >
        <button
          onClick={handleDiscard}
          aria-label="Abbrechen"
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <ArrowLeft size={20} />
          <span style={{ fontSize: 15 }}>{draft ? 'Antworten' : 'Neue Mail'}</span>
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={handleDiscard}
          aria-label="Verwerfen"
          style={{ background: 'transparent', border: 'none', color: '#fff', padding: 8, cursor: 'pointer' }}
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={handleSend}
          disabled={!to.trim() || (!subject.trim() && !body.trim())}
          aria-label="Senden"
          style={{
            background: 'transparent', border: 'none', color: '#fff',
            padding: 8, cursor: 'pointer',
            opacity: to.trim() && (subject.trim() || body.trim()) ? 1 : 0.4,
          }}
        >
          <Send size={20} />
        </button>
      </header>

      <div style={{ background: ym.surface, borderBottom: `1px solid ${ym.border}` }}>
        <Field
          label="An"
          value={to}
          onChange={setTo}
          active={field === 'to'}
          onFocus={focusField('to')}
          onSelect={onSelectField('to')}
        />
        <Field
          label="Betreff"
          value={subject}
          onChange={setSubject}
          active={field === 'subject'}
          onFocus={focusField('subject')}
          onSelect={onSelectField('subject')}
        />
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <textarea
          value={body}
          onChange={(e) => {
            const val = e.target.value;
            const start = e.target.selectionStart ?? 0;
            setBody(val);
            setField('body');
            setCursor(s => ({ ...s, body: start }));
          }}
          onFocus={() => setField('body')}
          onSelect={(e) => {
            const start = e.currentTarget.selectionStart ?? 0;
            setCursor(s => ({ ...s, body: start }));
          }}
          placeholder="Schreibe deine Nachricht…"
          style={{
            flex: 1, width: '100%', border: 'none', outline: 'none', resize: 'none',
            padding: 16, fontSize: 16, lineHeight: 1.6, color: ym.text, background: ym.surface,
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />

        {!aiOpen && (
          <button
            onClick={() => setAiOpen(true)}
            style={{
              position: 'absolute', right: 12, bottom: 12,
              background: ym.ai, color: '#fff',
              border: 'none', borderRadius: 22, padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <Sparkles size={16} />
            KI
          </button>
        )}

        {aiOpen && <AiPanel onApply={applyAi} onClose={() => setAiOpen(false)} />}

        {showContacts && (
          <div
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0,
              background: ym.surface, borderTop: `1px solid ${ym.border}`,
              maxHeight: 220, overflowY: 'auto', zIndex: 25,
            }}
          >
            <div style={{ padding: '10px 16px', fontSize: 12, color: ym.textMuted, fontWeight: 600 }}>KONTAKTE</div>
            {accounts.map(a => (
              <div
                key={a.id}
                onClick={() => insertContact(a.email)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', borderTop: `1px solid ${ym.border}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>
                  {a.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, color: ym.text, fontWeight: 500 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: ym.textMuted }}>{a.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Keyboard
        onKey={handleKey}
        onBackspace={handleBackspace}
        onSpace={handleSpace}
        onEnter={handleEnter}
        onSpecial={handleAt}
        specialLabel="@"
      />
    </div>
  );
}

const Field = ({
  label, value, onChange, active, onFocus, onSelect,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  active: boolean;
  onFocus: () => void;
  onSelect: (e: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) => (
  <div
    style={{
      display: 'flex', alignItems: 'center',
      padding: '10px 16px',
      borderBottom: `1px solid ${ym.border}`,
      background: active ? ym.blueSoft : 'transparent',
      transition: 'background 0.15s',
    }}
  >
    <span style={{ width: 64, fontSize: 13, color: ym.textMuted, flexShrink: 0 }}>{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onSelect={onSelect}
      onClick={onSelect}
      onKeyUp={onSelect}
      style={{
        flex: 1, border: 'none', outline: 'none', background: 'transparent',
        fontSize: 15, color: ym.text,
      }}
    />
  </div>
);
