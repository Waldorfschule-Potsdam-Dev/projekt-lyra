import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Wifi, Smartphone, Bell, Key, ArrowLeft, Search, Image as ImageIcon, Users, Layout, Battery, Wrench, Lock, Shield, Check, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { isCompleted } from '../report/storage';
import { useClock } from '../store/clock';
import { useClueStore, CLUE_REGISTRY, COMPLETION_REQUIREMENTS } from '../store/clues';

// Common Switch Component for Material 3 Dark
const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <div 
    onClick={onChange}
    style={{
      width: '52px', height: '32px', borderRadius: '16px',
      backgroundColor: checked ? '#a8c7fa' : '#444746',
      position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s',
      display: 'flex', alignItems: 'center', padding: '0 4px'
    }}
  >
    <div style={{
      width: checked ? '24px' : '16px', height: checked ? '24px' : '16px', borderRadius: '50%',
      backgroundColor: checked ? '#062e6f' : '#e3e3e3',
      transform: checked ? 'translateX(20px)' : 'translateX(0)',
      transition: 'all 0.2s'
    }} />
  </div>
);

import { settingsGroups } from './data';

function SettingsHome() {
  const now = useClock((s) => s.now);
  const liveDateTime = new Date(now).toLocaleString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div style={{ flex: 1, backgroundColor: '#000000', color: '#ffffff', overflowY: 'auto' }}>
      <header style={{ padding: '48px 24px 24px', fontSize: '36px', fontWeight: '400', letterSpacing: '-0.5px' }}>
        Einstellungen
      </header>

      <div style={{ padding: '0 24px 24px' }}>
        {/* Search Bar */}
        <div style={{ 
          backgroundColor: '#303030', borderRadius: '28px', padding: '16px 20px', 
          display: 'flex', alignItems: 'center', marginBottom: '32px' 
        }}>
          <Search size={20} color="#e3e3e3" style={{ marginRight: '16px' }} />
          <span style={{ color: '#c4c7c5', fontSize: '18px' }}>Einstellungen durchsuchen</span>
        </div>

        {/* Groups */}
        {settingsGroups.map((group, gIdx) => (
          <div key={gIdx} style={{ backgroundColor: '#202124', borderRadius: '28px', overflow: 'hidden', marginBottom: '8px' }}>
            {group.items.map((item) => (
              <Link 
                key={item.id} 
                to={`/settings/${item.id}`}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '20px 24px', 
                  textDecoration: 'none', color: 'inherit'
                }}
              >
                <div style={{ marginRight: '24px', color: '#e3e3e3' }}>
                  <item.icon size={24} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '20px', fontWeight: 400, color: '#e3e3e3', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', color: '#a0a0a0' }}>
                    {item.id === 'datetime' ? liveDateTime : item.value}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// DiagnoseScreen removed - handled natively by /report route now

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

function toDateInputValue(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toTimeInputValue(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatOffset(ms: number) {
  if (ms === 0) return 'Echtzeit';
  const sign = ms > 0 ? '+' : '−';
  const abs = Math.abs(ms);
  const totalMin = Math.round(abs / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const minutes = totalMin % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}T`);
  if (hours) parts.push(`${hours} Std.`);
  if (minutes || parts.length === 0) parts.push(`${minutes} Min.`);
  return `${sign} ${parts.join(' ')}`;
}

function DateTimeSettings() {
  const now = useClock((s) => s.now);
  const offsetMs = useClock((s) => s.offsetMs);
  const setDeviceTime = useClock((s) => s.setDeviceTime);
  const resetToReal = useClock((s) => s.resetToReal);
  const navigate = useNavigate();

  const current = new Date(now);
  const [dateStr, setDateStr] = useState(toDateInputValue(current));
  const [timeStr, setTimeStr] = useState(toTimeInputValue(current));
  const [error, setError] = useState(false);

  const handleSave = () => {
    const parsed = new Date(`${dateStr}T${timeStr}:00`);
    if (Number.isNaN(parsed.getTime())) {
      setError(true);
      return;
    }
    setError(false);
    setDeviceTime(parsed);
    navigate(-1);
  };

  const handleReset = () => {
    resetToReal();
    navigate(-1);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ color: '#a8c7fa', fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
        Aktuelle Gerätezeit
      </div>
      <div
        style={{
          fontSize: '32px',
          fontWeight: 300,
          color: '#e3e3e3',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.2,
          marginBottom: '4px',
        }}
      >
        {current.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div style={{ fontSize: '16px', color: '#a0a0a0', marginBottom: '8px' }}>
        {current.toLocaleDateString('de-DE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </div>
      <div style={{ fontSize: '13px', color: offsetMs === 0 ? '#34A853' : '#f5b7b1', marginBottom: '32px' }}>
        Versatz zur echten Zeit: {formatOffset(offsetMs)}
      </div>

      <div style={{ color: '#a8c7fa', fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
        Neue Uhrzeit setzen
      </div>

      {/* Quick preset */}
      <button
        type="button"
        onClick={() => {
          const today = new Date(now);
          today.setHours(19, 0, 0, 0);
          setDeviceTime(today);
          navigate(-1);
        }}
        style={{
          width: '100%',
          marginBottom: 16,
          padding: '14px 18px',
          backgroundColor: 'rgba(168, 199, 250, 0.12)',
          color: '#a8c7fa',
          border: '1px solid rgba(168, 199, 250, 0.3)',
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>Geheime Mails anzeigen</span>
        <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 17 }}>19:00</span>
      </button>

      <label
        style={{
          display: 'block',
          padding: '14px 18px',
          backgroundColor: '#1c1d22',
          borderRadius: 14,
          border: error ? '1px solid #d93025' : '1px solid #444746',
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 12, color: '#9aa0a6', marginBottom: 6 }}>Datum</div>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => {
            setDateStr(e.target.value);
            if (error) setError(false);
          }}
          style={inputStyle}
        />
      </label>

      <label
        style={{
          display: 'block',
          padding: '14px 18px',
          backgroundColor: '#1c1d22',
          borderRadius: 14,
          border: error ? '1px solid #d93025' : '1px solid #444746',
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 12, color: '#9aa0a6', marginBottom: 6 }}>Uhrzeit</div>
        <input
          type="time"
          value={timeStr}
          onChange={(e) => {
            setTimeStr(e.target.value);
            if (error) setError(false);
          }}
          style={inputStyle}
        />
      </label>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(217, 48, 37, 0.12)',
            borderRadius: 10,
            color: '#f5b7b1',
            fontSize: 14,
            marginTop: 12,
            marginBottom: 4,
          }}
        >
          Ungültiges Datum oder Uhrzeit.
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        style={{
          width: '100%',
          marginTop: 20,
          padding: '14px 18px',
          backgroundColor: '#a8c7fa',
          color: '#062e6f',
          border: 'none',
          borderRadius: 24,
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Übernehmen
      </button>

      <button
        type="button"
        onClick={handleReset}
        disabled={offsetMs === 0}
        style={{
          width: '100%',
          marginTop: 8,
          padding: '14px 18px',
          backgroundColor: 'transparent',
          color: offsetMs === 0 ? '#5f6368' : '#f5b7b1',
          border: offsetMs === 0 ? '1px solid #2a2c2f' : '1px solid rgba(217, 48, 37, 0.4)',
          borderRadius: 24,
          fontSize: 15,
          fontWeight: 500,
          cursor: offsetMs === 0 ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Auf echte Zeit zurücksetzen
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#e3e3e3',
  fontSize: 18,
  fontFamily: 'inherit',
  fontVariantNumeric: 'tabular-nums',
  colorScheme: 'dark',
};

function SettingsDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const [adaptive, setAdaptive] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [wifiToggled, setWifiToggled] = useState(true);
  const [btToggled, setBtToggled] = useState(false);
  const [saver, setSaver] = useState(false);

  const getDetails = () => {
    switch(id) {
      case 'wifi':
        return { title: 'Netzwerk & Internet', content: (
          <div style={{ padding: '24px' }}>
            <div style={{ color: '#a8c7fa', fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>WLAN</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '20px', color: '#e3e3e3' }}>WLAN verwenden</span>
              <Switch checked={wifiToggled} onChange={() => setWifiToggled(!wifiToggled)} />
            </div>
            {wifiToggled && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '20px', color: '#e3e3e3', marginBottom: '4px' }}>WLAN-4F92xA</div>
                  <div style={{ fontSize: '14px', color: '#a8c7fa' }}>Verbunden</div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '20px', color: '#e3e3e3', marginBottom: '4px' }}>Gast-WLAN</div>
                  <div style={{ fontSize: '14px', color: '#a0a0a0' }}>Gespeichert</div>
                </div>
              </>
            )}
          </div>
        )};
      case 'bt':
        return { title: 'Verbundene Geräte', content: (
          <div style={{ padding: '24px' }}>
            <div style={{ color: '#a8c7fa', fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Bluetooth</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '20px', color: '#e3e3e3' }}>Bluetooth verwenden</span>
              <Switch checked={btToggled} onChange={() => setBtToggled(!btToggled)} />
            </div>
          </div>
        )};
      case 'display':
        return { title: 'Display', content: (
          <div style={{ padding: '24px' }}>
            <div style={{ color: '#a8c7fa', fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Helligkeit</div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '20px', color: '#e3e3e3', marginBottom: '4px' }}>Helligkeitsstufe</div>
              <div style={{ fontSize: '14px', color: '#a0a0a0' }}>100%</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '20px', color: '#e3e3e3' }}>Adaptive Helligkeit</span>
              <Switch checked={adaptive} onChange={() => setAdaptive(!adaptive)} />
            </div>

            <div style={{ color: '#a8c7fa', fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Sperrbildschirm</div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '20px', color: '#e3e3e3', marginBottom: '4px' }}>Benachrichtigungen</div>
              <div style={{ fontSize: '14px', color: '#a0a0a0' }}>Alle Benachrichtigungsinhalte anzeigen</div>
            </div>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '20px', color: '#e3e3e3', marginBottom: '4px' }}>Display-Timeout</div>
              <div style={{ fontSize: '14px', color: '#a0a0a0' }}>Nach 30 Minuten Inaktivität</div>
            </div>

            <div style={{ color: '#a8c7fa', fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Darstellung</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '20px', color: '#5f6368', marginBottom: '4px' }}>Dunkles Design</div>
                <div style={{ fontSize: '14px', color: '#5f6368', maxWidth: '250px' }}>Vorübergehend deaktiviert durch Energiesparmodus</div>
              </div>
              <Switch checked={darkTheme} onChange={() => setDarkTheme(!darkTheme)} />
            </div>
          </div>
        )};
      case 'battery':
        return { title: 'Akku', content: (
          <div style={{ padding: '24px' }}>
            <div style={{ fontSize: '64px', fontWeight: '300', textAlign: 'center', marginBottom: '8px', color: '#e3e3e3' }}>64%</div>
            <div style={{ fontSize: '16px', color: '#a0a0a0', textAlign: 'center', marginBottom: '48px' }}>Noch ca. 8 Std. Laufzeit</div>
            
            <div style={{ color: '#a8c7fa', fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Akkunutzung</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '20px', color: '#e3e3e3' }}>Energiesparmodus</span>
              <Switch checked={saver} onChange={() => setSaver(!saver)} />
            </div>
          </div>
        )};
      case 'sound':
        return { title: 'Töne & Vibration', content: (
          <div style={{ padding: '24px' }}>
            <div style={{ color: '#a8c7fa', fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Lautstärke</div>
            {['Medienlautstärke', 'Anruflautstärke', 'Klingel- & Benachrichtigungslautstärke', 'Weckerlautstärke'].map(lbl => (
              <div key={lbl} style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '18px', marginBottom: '12px', color: '#e3e3e3' }}>{lbl}</div>
                <div style={{ height: '8px', backgroundColor: '#444746', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '50%', backgroundColor: '#a8c7fa' }} />
                </div>
              </div>
            ))}
          </div>
        )};
      case 'security':
        return { title: 'Sicherheit', content: (
          <div style={{ padding: '24px' }}>
            <div style={{ color: '#a8c7fa', fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Gerätesicherheit</div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '20px', color: '#e3e3e3', marginBottom: '4px' }}>Displaysperre</div>
              <div style={{ fontSize: '14px', color: '#a0a0a0' }}>PIN</div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '20px', color: '#e3e3e3', marginBottom: '4px' }}>Fingerabdruck</div>
              <div style={{ fontSize: '14px', color: '#a0a0a0' }}>1 hinzugefügt</div>
            </div>
          </div>
        )};

      case 'datetime':
        return { title: 'Datum & Uhrzeit', content: <DateTimeSettings key={id} /> };
      case 'impressum':
        return { title: 'Rechtliches', content: (
          <div style={{ padding: '24px' }}>
            <div style={{ color: '#a8c7fa', fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Impressum</div>
            <p style={{ fontSize: '15px', color: '#e3e3e3', lineHeight: 1.5, marginBottom: '32px' }}>
              <strong>Projekt Lyra</strong> (<a href="https://projekt-lyra.de" target="_blank" rel="noreferrer" style={{ color: '#a8c7fa', textDecoration: 'none' }}>projekt-lyra.de</a>)<br />
              Freie Waldorfschule Potsdam <br />
              Verantwortlich: Johan M. Grimsehl <br />
              <a href="https://www.waldorfschule-potsdam.de" target="_blank" rel="noreferrer" style={{ color: '#a8c7fa', textDecoration: 'none' }}>waldorfschule-potsdam.de</a> <br/>
              Erich-Weinert-Straße 5 <br />
              14478 Potsdam, DE <br />
              Kontakt: <a href="mailto:chatwithsteiner@mail.de" style={{ color: '#a8c7fa', textDecoration: 'none' }}>chatwithsteiner@mail.de</a>
            </p>
            
            <div style={{ color: '#a8c7fa', fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Datenschutzerklärung</div>
            <p style={{ fontSize: '15px', color: '#e3e3e3', lineHeight: 1.5, marginBottom: '16px' }}>
              <strong>Hosting (Firebase):</strong> Diese App wird über Firebase gehostet. Beim Aufruf werden technisch bedingt Verbindungsdaten (z. B. IP-Adresse) kurzzeitig verarbeitet.
            </p>
            <p style={{ fontSize: '15px', color: '#e3e3e3', lineHeight: 1.5, marginBottom: '16px' }}>
              <strong>Content Delivery Network (Hack Club CDN):</strong> Medieninhalte (wie Bilder) werden über das Hack Club CDN ausgeliefert. Beim Abruf werden technisch bedingt Ihre IP-Adresse und Verbindungsdaten an das CDN übertragen.
            </p>
            <p style={{ fontSize: '15px', color: '#e3e3e3', lineHeight: 1.5, marginBottom: '16px' }}>
              <strong>Lokaler Speicher:</strong> Die App nutzt den lokalen Speicher (Local Storage) Ihres Browsers, um den Spielstand zu sichern. Diese Daten verbleiben auf Ihrem Gerät und werden nicht an unsere Server übertragen.
            </p>
            <p style={{ fontSize: '15px', color: '#e3e3e3', lineHeight: 1.5, marginBottom: '16px' }}>
              <strong>Analyse (Umami Cloud EU):</strong> Zur anonymisierten Auswertung der App-Nutzung und des Spielfortschritts (z. B. gelöste Rätsel) wird Umami verwendet. Es werden keine Cookies gesetzt und keine personenbezogenen Daten dauerhaft gespeichert.
            </p>
          </div>
        )};
      case 'about':
        return { title: 'Über das Gerät', content: (
          <div style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#303030', borderRadius: '20px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={40} color="#a8c7fa" />
              </div>
              <div style={{ fontSize: '24px', color: '#e3e3e3', marginBottom: '8px' }}>Lyra OS</div>
              <div style={{ fontSize: '16px', color: '#a0a0a0' }}>Version 1.0</div>
            </div>
            
            <div style={{ backgroundColor: '#202124', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: '#a0a0a0' }}>Gerätename</span>
                <span style={{ color: '#e3e3e3' }}>Projekt Lyra</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: '#a0a0a0' }}>Projekt-Website</span>
                <a href="https://projekt-lyra.de" target="_blank" rel="noreferrer" style={{ color: '#a8c7fa', textDecoration: 'none' }}>projekt-lyra.de</a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a0a0a0' }}>Status</span>
                <span style={{ color: '#34A853' }}>Online</span>
              </div>
            </div>
          </div>
        )};
      default:
        return { title: 'Einstellungen', content: (
          <div style={{ padding: '24px', color: '#a0a0a0' }}>
            Weitere Optionen können hier konfiguriert werden.
          </div>
        )};
    }
  };

  const { title, content } = getDetails();

  return (
    <div style={{ flex: 1, backgroundColor: '#000000', color: '#ffffff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{ padding: '16px 8px', display: 'flex', alignItems: 'center', paddingTop: '40px', flexShrink: 0 }}>
        <ArrowLeft size={28} color="#e3e3e3" onClick={() => navigate(-1)} style={{ cursor: 'pointer', margin: '0 16px' }} />
        <span style={{ fontSize: '22px', fontWeight: 400, color: '#e3e3e3' }}>{title}</span>
      </header>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '32px' }}>
        {content}
      </div>
    </div>
  );
}

export default function SettingsApp() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route path="/" element={<SettingsHome />} />
        <Route path="/:id" element={
          <SettingsDetailWrapper />
        } />
      </Routes>
    </div>
  );
}

function SettingsDetailWrapper() {
  const id = window.location.pathname.split('/').pop() || '';
  return <SettingsDetail id={id} />;
}
