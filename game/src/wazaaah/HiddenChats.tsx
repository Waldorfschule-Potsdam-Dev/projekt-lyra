import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { waColors } from './styles';
import { initialChats } from './data';
import {
  useHiddenChatPassword,
  useUnlockedHiddenChats,
  isHiddenChatUnlocked,
  lockHiddenChat,
} from './store';

const Avatar = ({ size = 49 }: { size?: number }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: '#5A5A5A',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <Lock size={size * 0.45} color="#fff" />
  </div>
);

export default function HiddenChats() {
  const navigate = useNavigate();
  const password = useHiddenChatPassword();
  const unlocked = useUnlockedHiddenChats();
  const hiddenChats = initialChats.filter((c) => c.isHidden);

  const handleToggleVisibility = (chatId: string) => {
    if (isHiddenChatUnlocked(chatId)) {
      lockHiddenChat(chatId);
    } else {
      navigate(`/wazaaah/settings/hidden-chats/unlock/${chatId}`);
    }
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
          onClick={() => navigate('/wazaaah/settings')}
          style={{ cursor: 'pointer', padding: 4, marginRight: 4 }}
        />
        <span style={{ fontSize: 20, fontWeight: 500 }}>Unsichtbare Chats</span>
      </header>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            padding: '12px 16px',
            fontSize: 12,
            color: waColors.textSecondary,
            backgroundColor: waColors.listBg,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Tippe auf einen Chat, um ihn mit dem Passwort zu entsperren
        </div>

        <div style={{ backgroundColor: '#fff' }}>
          {hiddenChats.map((chat, idx) => {
            const isUnlocked = unlocked.has(chat.id);
            return (
              <button
                key={chat.id}
                onClick={() => handleToggleVisibility(chat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 13,
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: idx < hiddenChats.length - 1 ? `1px solid ${waColors.divider}` : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: waColors.textPrimary,
                }}
              >
                <Avatar />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{chat.name}</div>
                  <div style={{ fontSize: 13, color: waColors.textSecondary, marginTop: 2 }}>
                    {isUnlocked ? 'Entsperrt · sichtbar in der Chat-Liste' : 'Mit Passwort geschützt'}
                  </div>
                </div>
                {isUnlocked ? (
                  <Eye size={20} color={waColors.primaryGreen} />
                ) : (
                  <EyeOff size={20} color={waColors.textSecondary} />
                )}
              </button>
            );
          })}
        </div>

        <div
          style={{
            padding: '20px 16px',
            fontSize: 12,
            color: waColors.textSecondary,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Entsperrte unsichtbare Chats erscheinen dauerhaft in deiner normalen Chat-Liste, bis du sie hier wieder sperrst.
        </div>
      </div>
    </div>
  );
}
