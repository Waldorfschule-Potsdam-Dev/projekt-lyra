import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ChevronRight, HelpCircle, Bell, Shield } from 'lucide-react';
import { waColors } from './styles';

interface CategoryRow {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export default function Settings() {
  const navigate = useNavigate();

  const categories: CategoryRow[] = [
    {
      id: 'hidden-chats',
      label: 'Unsichtbare Chats',
      icon: <Lock size={20} color={waColors.textPrimary} />,
      onClick: () => navigate('/wazaaah/settings/hidden-chats'),
    },
    {
      id: 'notifications',
      label: 'Benachrichtigungen',
      icon: <Bell size={20} color={waColors.textPrimary} />,
      onClick: () => alert('Benachrichtigungen – noch nicht implementiert.'),
    },
    {
      id: 'privacy',
      label: 'Datenschutz',
      icon: <Shield size={20} color={waColors.textPrimary} />,
      onClick: () => alert('Datenschutz – noch nicht implementiert.'),
    },
    {
      id: 'help',
      label: 'Hilfe',
      icon: <HelpCircle size={20} color={waColors.textPrimary} />,
      onClick: () => alert('Hilfe – noch nicht implementiert.'),
    },
  ];

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
          onClick={() => navigate('/wazaaah')}
          style={{ cursor: 'pointer', padding: 4, marginRight: 4 }}
        />
        <span style={{ fontSize: 20, fontWeight: 500 }}>Einstellungen</span>
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
          Kategorien
        </div>

        <div style={{ backgroundColor: '#fff' }}>
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={cat.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                width: '100%',
                padding: '14px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: idx < categories.length - 1 ? `1px solid ${waColors.divider}` : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: waColors.textPrimary,
                fontSize: 15,
              }}
            >
              {cat.icon}
              <span style={{ flex: 1 }}>{cat.label}</span>
              <ChevronRight size={20} color={waColors.textSecondary} />
            </button>
          ))}
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
          Unsichtbare Chats werden in deiner normalen Chat-Liste ausgeblendet und sind nur per Passwort zugänglich.
        </div>
      </div>
    </div>
  );
}
