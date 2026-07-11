import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { waColors } from './styles';
import {
  checkHiddenChatPassword,
  unlockHiddenChat,
  isHiddenChatUnlocked,
} from './store';

export default function HiddenChatLock() {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const alreadyUnlocked = chatId ? isHiddenChatUnlocked(chatId) : false;

  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  if (alreadyUnlocked && chatId) {
    navigate(`/wazaaah/chat/${chatId}`);
    return null;
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatId) return;
    if (checkHiddenChatPassword(value)) {
      unlockHiddenChat(chatId);
      navigate(`/wazaaah/chat/${chatId}`);
      return;
    }
    setShake(true);
    setError('Falsches Passwort');
    setTimeout(() => {
      setShake(false);
    }, 450);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: waColors.listBg }}>
      <header
        style={{
          backgroundColor: waColors.headerBg,
          color: waColors.textOnDark,
          display: 'flex',
          alignItems: 'center',
          padding: '8px 6px',
          height: 60,
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        <ArrowLeft
          size={24}
          color={waColors.textOnDark}
          onClick={() => navigate('/wazaaah/settings/hidden-chats')}
          style={{ cursor: 'pointer', padding: 4, marginRight: 4 }}
        />
        <span style={{ fontSize: 20, fontWeight: 500 }}>Unsichtbarer Chat</span>
      </header>

      <form
        onSubmit={handleSubmit}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '32px 24px 24px',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: waColors.searchBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
          }}
        >
          <Lock size={36} color={waColors.headerBg} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: waColors.textPrimary, textAlign: 'center' }}>
          Passwort eingeben
        </div>
        <div
          style={{
            fontSize: 14,
            color: waColors.textSecondary,
            marginTop: 8,
            textAlign: 'center',
            maxWidth: 320,
            lineHeight: 1.5,
          }}
        >
          Gib das festgelegte Passwort ein, um den Chat zu sehen.
        </div>

        <input
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          autoFocus
          placeholder="Passwort"
          style={{
            marginTop: 28,
            width: '100%',
            maxWidth: 320,
            padding: '14px 16px',
            fontSize: 16,
            border: `2px solid ${error ? '#E53935' : waColors.divider}`,
            borderRadius: 12,
            backgroundColor: '#fff',
            color: waColors.textPrimary,
            outline: 'none',
            boxSizing: 'border-box',
            transform: shake ? 'translateX(0)' : 'none',
            animation: shake ? 'wa-shake 0.45s' : 'none',
          }}
        />

        {error && (
          <div style={{ marginTop: 12, color: '#E53935', fontSize: 13, fontWeight: 500 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={!value}
          style={{
            marginTop: 24,
            width: '100%',
            maxWidth: 320,
            padding: '14px 16px',
            fontSize: 16,
            fontWeight: 600,
            color: waColors.textOnDark,
            backgroundColor: value ? waColors.headerBg : waColors.divider,
            border: 'none',
            borderRadius: 12,
            cursor: value ? 'pointer' : 'not-allowed',
          }}
        >
          Entsperren
        </button>
      </form>

      <style>{`
        @keyframes wa-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
