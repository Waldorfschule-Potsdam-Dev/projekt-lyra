import { Download } from 'lucide-react';

interface InstallPromptNotificationProps {
  onInstall: () => void;
}

export function InstallPromptNotification({ onInstall }: InstallPromptNotificationProps) {
  return (
    <div
      role="button"
      onClick={onInstall}
      style={{
        backgroundColor: '#303030',
        borderRadius: '24px',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        cursor: 'pointer'
      }}
    >
      <div
        style={{
          backgroundColor: '#7e14ff',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          flexShrink: 0
        }}
      >
        <Download size={16} color="white" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: '#e3e3e3', fontSize: '15px' }}>
          Projekt Lyra • Installation verfügbar
        </div>
        <div style={{ fontSize: '14px', color: '#a0a0a0', marginTop: '4px' }}>
          Installiere das Spiel auf deinem Gerät – mit eigenem Icon und mehr Immersion.
        </div>
      </div>
    </div>
  );
}