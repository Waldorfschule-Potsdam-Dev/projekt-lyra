import { useState } from 'react';
import { LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLibrary, PROFILE_AVATAR } from '../context/LibraryContext';

type Tab = 'profil' | 'allgemein' | 'datenschutz' | 'notifs' | 'speicher';

export default function Settings() {
  const { profile, updateProfile, prefs, updatePrefs, resetLibrary, playlists, likedSongs } = useLibrary();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profil');
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profil', label: 'Profil' },
    { id: 'allgemein', label: 'Wiedergabe' },
    { id: 'datenschutz', label: 'Datenschutz' },
    { id: 'notifs', label: 'Benachrichtigungen' },
    { id: 'speicher', label: 'Speicher' },
  ];

  const userPlaylists = playlists.filter((p) => p.owner === 'user').length;

  return (
    <div style={{ position: 'relative' }}>
      {toast && <div className="sp-toast">✓ {toast}</div>}

      <div className="sp-section-title"><span>Einstellungen</span></div>

      <div className="sp-settings-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`sp-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profil' && (
        <div className="sp-settings-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={PROFILE_AVATAR}
                alt=""
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{profile.name}</div>
              <div style={{ fontSize: 11, color: '#b3b3b3' }}>{profile.email}</div>
              <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 8px', background: '#1DB954', color: '#000', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>
                {profile.plan}
              </span>
            </div>
          </div>

          <div className="sp-field">
            <label>Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
            />
          </div>
          <div className="sp-field">
            <label>E-Mail</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile({ email: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="sp-field">
              <label>Land</label>
              <select value={profile.country} onChange={(e) => updateProfile({ country: e.target.value })}>
                <option>Deutschland</option>
                <option>Österreich</option>
                <option>Schweiz</option>
                <option>USA</option>
                <option>Frankreich</option>
              </select>
            </div>
            <div className="sp-field">
              <label>Plan</label>
              <select value={profile.plan} onChange={(e) => updateProfile({ plan: e.target.value })}>
                <option>Free</option>
                <option>Premium</option>
                <option>Family</option>
                <option>Student</option>
              </select>
            </div>
          </div>
          <button className="sp-btn-green" style={{ width: '100%', marginTop: 8 }} onClick={() => flash('Profil gespeichert')}>
            Speichern
          </button>
        </div>
      )}

      {tab === 'allgemein' && (
        <div className="sp-settings-card">
          <div className="sp-field">
            <label>Sprache</label>
            <select
              value={prefs.language}
              onChange={(e) => {
                updatePrefs({ language: e.target.value });
                flash('Sprache geändert');
                setTimeout(() => navigate('/musica/runner'), 400);
              }}
            >
              <option>Deutsch</option>
              <option>English</option>
              <option>Français</option>
              <option>Español</option>
            </select>
            <button
              className="sp-btn-ghost"
              style={{ marginTop: 8, width: '100%' }}
              onClick={() => navigate('/musica/runner')}
            >
              🎮 Mini-Game starten
            </button>
          </div>
          <div className="sp-field">
            <label>Audioqualität</label>
            <select value={prefs.quality} onChange={(e) => updatePrefs({ quality: e.target.value })}>
              <option>Automatisch</option>
              <option>Niedrige Qualität</option>
              <option>Normale Qualität</option>
              <option>Hohe Qualität</option>
              <option>Verlustfrei</option>
            </select>
          </div>
          <div className="sp-field">
            <label>Überblendung: {prefs.crossfade}s</label>
            <input
              type="range"
              min={0}
              max={12}
              value={prefs.crossfade}
              onChange={(e) => updatePrefs({ crossfade: Number(e.target.value) })}
              style={{ padding: 0, height: 32, background: 'transparent' }}
            />
          </div>
          <ToggleRow
            title="Autoplay"
            sub="Ähnliche Musik, wenn die Wiedergabe endet"
            value={prefs.autoplay}
            onChange={(v) => updatePrefs({ autoplay: v })}
          />
          <ToggleRow
            title="Dunkles Design"
            sub="Augenfreundliche Darstellung"
            value={prefs.theme === 'Dunkel'}
            onChange={(v) => updatePrefs({ theme: v ? 'Dunkel' : 'Hell' })}
          />
        </div>
      )}

      {tab === 'datenschutz' && (
        <div className="sp-settings-card">
          <ToggleRow
            title="Explizite Inhalte erlauben"
            sub="Songs mit anstößigem Inhalt abspielen"
            value={!prefs.explicitContent}
            onChange={(v) => updatePrefs({ explicitContent: !v })}
          />
          <ToggleRow
            title="Hörverlauf speichern"
            sub="Speichere alle gehörten Songs"
            value={prefs.autoplay}
            onChange={(v) => updatePrefs({ autoplay: v })}
          />
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 8, paddingTop: 12 }}>
            <button
              className="sp-btn-ghost"
              style={{ width: '100%', marginBottom: 8 }}
              onClick={() => flash('Download gestartet (Demo)')}
            >
              Hörverlauf herunterladen
            </button>
            <button
              className="sp-btn-ghost"
              style={{ width: '100%' }}
              onClick={() => flash('Export gestartet (Demo)')}
            >
              Konto-Daten exportieren
            </button>
          </div>
        </div>
      )}

      {tab === 'notifs' && (
        <div className="sp-settings-card">
          <ToggleRow
            title="Push-Benachrichtigungen"
            sub="Auf diesem Gerät"
            value={prefs.notifications}
            onChange={(v) => { updatePrefs({ notifications: v }); flash(v ? 'Aktiviert' : 'Deaktiviert'); }}
          />
          <ToggleRow title="E-Mail" sub="Wöchentlicher Mix und Empfehlungen" value={false} onChange={() => {}} />
          <ToggleRow title="News & Angebote" sub="Informationen zu neuen Funktionen" value={false} onChange={() => {}} />
        </div>
      )}

      {tab === 'speicher' && (
        <div className="sp-settings-card">
          <Stat label="Eigene Playlists" value={userPlaylists} />
          <Stat label={'Songs mit „Gefällt mir"'} value={likedSongs.length} />
          <Stat label="Gesamt-Playlists" value={playlists.length} />
          <Stat label="Gespeicherte Songs (ca.)" value={`${(likedSongs.length * 3.5).toFixed(1)} MB`} />
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => {
                if (window.confirm('Bibliothek wirklich zurücksetzen?')) {
                  resetLibrary();
                  flash('Zurückgesetzt');
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px', borderRadius: 999, background: 'rgba(239,68,68,0.15)',
                color: '#f87171', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer',
              }}
            >
              <Trash2 size={14} /> Bibliothek zurücksetzen
            </button>
            <button
              onClick={() => flash('Abgemeldet (Demo)')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px', borderRadius: 999, background: '#282828',
                color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer',
              }}
            >
              <LogOut size={14} /> Abmelden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  title, sub, value, onChange,
}: { title: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="sp-toggle-row">
      <div className="sp-toggle-info">
        <div className="sp-toggle-title">{title}</div>
        <div className="sp-toggle-sub">{sub}</div>
      </div>
      <button className={`sp-toggle${value ? ' on' : ''}`} onClick={() => onChange(!value)} aria-label={title}>
        <span className="sp-toggle-knob" />
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '10px 12px', background: '#282828', borderRadius: 4, marginBottom: 6,
    }}>
      <span style={{ color: '#b3b3b3', fontSize: 12 }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: 13 }}>{value}</span>
    </div>
  );
}