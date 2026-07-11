import { useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Palette, User, Mail, Phone, RotateCcw, Globe, Briefcase, User2 } from 'lucide-react';
import { ym } from './styles';
import {
  useProfile, updateProfile, resetProfile, isValidEmail, pickRandomColor,
  ADMIN_PROFILE, isLocalOverride, useMailbox, setMailbox, getActiveMailbox, MAILBOXES,
} from './profile';
import Keyboard from './Keyboard';

const COLORS = ['#1A73E8', '#4285F4', '#34A853', '#FBBC05', '#8E44AD', '#F29900', '#00B8D9', '#E91E63'];

type Field = 'name' | 'email' | 'phone';
const insertAtCursor = (s: string, pos: number, ch: string) => s.slice(0, pos) + ch + s.slice(pos);

export default function Profile() {
  const navigate = useNavigate();
  const profile = useProfile();
  const mailboxId = useMailbox();
  const activeMailbox = getActiveMailbox();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [color, setColor] = useState(profile.color);
  const [field, setField] = useState<Field>('name');
  const [cursor, setCursor] = useState({ name: name.length, email: email.length, phone: phone.length });
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const emailValid = isValidEmail(email);
  const dirty = name !== profile.name || email !== profile.email || phone !== profile.phone || color !== profile.color;
  const canSave = name.trim().length > 0 && emailValid && dirty;

  const equalsAdmin = name === ADMIN_PROFILE.name && email === ADMIN_PROFILE.email && phone === ADMIN_PROFILE.phone && color === ADMIN_PROFILE.color;
  const isOverride = !equalsAdmin || isLocalOverride();

  const getVal = (f: Field) => (f === 'name' ? name : f === 'email' ? email : phone);
  const setVal = (f: Field, v: string) => {
    if (f === 'name') setName(v);
    else if (f === 'email') setEmail(v);
    else setPhone(v);
  };
  const getCur = (f: Field) => cursor[f];

  const handleKey = (k: string) => {
    const v = getVal(field);
    const c = getCur(field);
    const next = insertAtCursor(v, c, k);
    setVal(field, next);
    setCursor(s => ({ ...s, [field]: c + k.length }));
    setSaved(false);
  };
  const handleBackspace = () => {
    const v = getVal(field);
    const c = getCur(field);
    if (c === 0) return;
    setVal(field, v.slice(0, c - 1) + v.slice(c));
    setCursor(s => ({ ...s, [field]: c - 1 }));
    setSaved(false);
  };
  const handleSpace = () => handleKey(' ');
  const handleEnter = () => handleKey('\n');
  const handleAt = () => handleKey('@');
  const handleHash = () => handleKey('#');

  const onSelectField = (f: Field) => (e: SyntheticEvent<HTMLInputElement>) => {
    setField(f);
    const t = e.currentTarget;
    setCursor(s => ({ ...s, [f]: t.selectionStart ?? getVal(f).length }));
  };

  const save = () => {
    if (!canSave) return;
    updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim(), color });
    setSaved(true);
    setTimeout(() => navigate('/mail'), 600);
  };

  const handleBack = () => navigate('/mail');

  const initial = (name.trim() || '?').charAt(0).toUpperCase();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: ym.bg }}>
      <header
        style={{
          display: 'flex', alignItems: 'center',
          padding: '12px 8px',
          background: ym.red, color: ym.white,
        }}
      >
        <button
          onClick={handleBack}
          aria-label="Zurück"
          style={{ background: 'transparent', border: 'none', color: ym.white, cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <ArrowLeft size={20} color={ym.white} />
          <span style={{ fontSize: 15, color: ym.white }}>Posteingang</span>
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={save}
          disabled={!canSave}
          aria-label="Speichern"
          style={{
            background: 'transparent', border: 'none', color: ym.white,
            padding: 8, cursor: canSave ? 'pointer' : 'not-allowed',
            opacity: canSave ? 1 : 0.4,
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 15, fontWeight: 600,
          }}
        >
          <Check size={20} color={ym.white} />
          <span style={{ color: ym.white }}>Speichern</span>
        </button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', background: ym.bg, paddingBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 8px' }}>
          <div
            style={{
              width: 96, height: 96, borderRadius: '50%',
              backgroundColor: ym.surface, color: ym.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 42, fontWeight: 600,
              marginBottom: 12,
              boxShadow: `0 0 0 4px ${color}, 0 4px 16px rgba(26,115,232,0.3)`,
            }}
          >
            {initial}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: ym.text }}>{name.trim() || 'Dein Name'}</div>
          <div style={{ fontSize: 13, color: ym.textMuted }}>{email.trim() || 'deine@email.de'}</div>
        </div>

        <div style={{ padding: '0 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: 12, marginBottom: 16,
            background: ym.surfaceElevated,
            border: `1px solid ${isOverride ? '#FBBC05' : ym.blue}`,
            borderRadius: 10,
          }}>
            <Globe size={18} color={isOverride ? '#FBBC05' : ym.blue} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1, fontSize: 12, color: ym.text, lineHeight: 1.45 }}>
              {isOverride ? (
                <>
                  <strong style={{ color: '#FBBC05' }}>Lokale Anpassung aktiv.</strong> Dein Profil weicht vom Admin-Standard ab und ist nur auf diesem Gerät gespeichert. Tippe „Auf Standard zurücksetzen", um den Admin-Wert zu übernehmen.
                </>
              ) : (
                <>
                  <strong style={{ color: ym.blue }}>Admin-Standard aktiv.</strong> Name, E-Mail und Telefonnummer kommen aus dem Spielprofil. Änderungen sind nur lokal — über „Auf Standard zurücksetzen" holst du dir den aktuellen Admin-Wert.
                </>
              )}
            </div>
          </div>

          <SectionLabel>Aktives Postfach</SectionLabel>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {MAILBOXES.map(mb => {
              const active = mb.id === mailboxId;
              return (
                <button
                  key={mb.id}
                  onClick={() => setMailbox(mb.id)}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px',
                    background: active ? ym.surfaceElevated : ym.surface,
                    border: `2px solid ${active ? mb.color : ym.border}`,
                    borderRadius: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: mb.color, color: ym.white,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {mb.id === 'work' ? <Briefcase size={18} color={ym.white} /> : <User2 size={18} color={ym.white} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: ym.text }}>{mb.label}</div>
                    <div style={{
                      fontSize: 11, color: ym.textMuted,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{mb.email}</div>
                  </div>
                  {active && (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: mb.color, color: ym.white,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Check size={12} color={ym.white} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', background: ym.surfaceElevated, borderRadius: 10,
            marginBottom: 16, fontSize: 12, color: ym.textMuted,
          }}>
            <Mail size={14} color={activeMailbox.color} />
            <span>Du schreibst aktuell als <strong style={{ color: ym.text }}>{activeMailbox.email}</strong></span>
          </div>

          {isOverride && (
            <button
              onClick={() => setShowResetConfirm(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '12px 16px',
                background: ym.surfaceElevated, color: '#FBBC05',
                border: '1px solid #FBBC05', borderRadius: 10,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                marginBottom: 16,
              }}
            >
              <RotateCcw size={16} color="#FBBC05" />
              Auf Admin-Standard zurücksetzen
            </button>
          )}

          <SectionLabel>Avatar-Farbe</SectionLabel>
          <div style={{ display: 'flex', gap: 12, padding: '10px 14px', background: ym.surface, borderRadius: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <Palette size={16} color={ym.textMuted} />
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setSaved(false); }}
                aria-label={`Farbe ${c}`}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: c, border: 'none', cursor: 'pointer',
                  outline: color === c ? `3px solid ${ym.white}` : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
            <button
              onClick={() => { setColor(pickRandomColor()); setSaved(false); }}
              aria-label="Zufällige Farbe"
              style={{
                padding: '6px 10px', fontSize: 12, fontWeight: 600,
                background: ym.surfaceElevated, color: ym.text,
                border: `1px solid ${ym.border}`, borderRadius: 8, cursor: 'pointer',
              }}
            >
              🎲
            </button>
          </div>

          <SectionLabel>Name</SectionLabel>
          <FieldRow
            icon={<User size={16} color={ym.textMuted} />}
            value={name}
            onChange={setName}
            active={field === 'name'}
            onFocus={() => setField('name')}
            onSelect={onSelectField('name')}
            placeholder="Dein Name"
          />

          <SectionLabel>E-Mail-Adresse</SectionLabel>
          <FieldRow
            icon={<Mail size={16} color={ym.textMuted} />}
            value={email}
            onChange={setEmail}
            active={field === 'email'}
            onFocus={() => setField('email')}
            onSelect={onSelectField('email')}
            placeholder="deine@email.de"
            keyboardHint="@"
          />
          {!emailValid && (
            <Hint>Bitte gib eine gültige E-Mail-Adresse ein.</Hint>
          )}

          <SectionLabel>Telefonnummer</SectionLabel>
          <FieldRow
            icon={<Phone size={16} color={ym.textMuted} />}
            value={phone}
            onChange={setPhone}
            active={field === 'phone'}
            onFocus={() => setField('phone')}
            onSelect={onSelectField('phone')}
            placeholder="+49 170 1234567"
            keyboardHint="+#"
            inputMode="tel"
          />

          {saved && (
            <div style={{
              margin: '16px 14px 0',
              padding: 12,
              background: 'rgba(26,115,232,0.15)', color: ym.blue,
              border: `1px solid ${ym.blue}`,
              borderRadius: 10, fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Check size={16} color={ym.blue} />
              <span>Gespeichert — du wirst gleich zurückgeleitet.</span>
            </div>
          )}
        </div>
      </div>

      <Keyboard
        onKey={handleKey}
        onBackspace={handleBackspace}
        onSpace={handleSpace}
        onEnter={handleEnter}
        onSpecial={field === 'email' ? handleAt : field === 'phone' ? handleHash : undefined}
        specialLabel={field === 'email' ? '@' : field === 'phone' ? '#' : '?123'}
      />

      {showResetConfirm && (
        <div
          onClick={() => setShowResetConfirm(false)}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: ym.surfaceElevated,
              border: `1px solid ${ym.border}`,
              borderRadius: 16, padding: 20,
              maxWidth: 320, width: '100%',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ background: '#FBBC05', padding: 6, borderRadius: 8, display: 'flex' }}>
                <RotateCcw size={18} color={ym.black} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: ym.text }}>Auf Standard zurücksetzen?</div>
            </div>
            <div style={{ fontSize: 14, color: ym.textMuted, lineHeight: 1.5, marginBottom: 16 }}>
              Deine lokalen Änderungen werden verworfen. Profil wird auf den Admin-Standard gesetzt:
            </div>
            <div style={{
              background: ym.surface, border: `1px solid ${ym.border}`,
              borderRadius: 10, padding: 12, marginBottom: 16,
              fontSize: 13, color: ym.text, lineHeight: 1.6,
            }}>
              <div><strong style={{ color: ym.textMuted }}>Name:</strong> {ADMIN_PROFILE.name}</div>
              <div><strong style={{ color: ym.textMuted }}>E-Mail:</strong> {ADMIN_PROFILE.email}</div>
              <div><strong style={{ color: ym.textMuted }}>Telefon:</strong> {ADMIN_PROFILE.phone || '—'}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8,
                  background: ym.surface, color: ym.text,
                  border: `1px solid ${ym.border}`, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  resetProfile();
                  setName(ADMIN_PROFILE.name);
                  setEmail(ADMIN_PROFILE.email);
                  setPhone(ADMIN_PROFILE.phone);
                  setColor(ADMIN_PROFILE.color);
                  setSaved(true);
                  setShowResetConfirm(false);
                  setTimeout(() => navigate('/mail'), 800);
                }}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8,
                  background: '#FBBC05', color: ym.black, border: 'none',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontSize: 12, fontWeight: 600, color: ym.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
    padding: '8px 4px 6px',
  }}>
    {children}
  </div>
);

const FieldRow = ({
  icon, value, onChange, active, onFocus, onSelect, placeholder, keyboardHint, inputMode,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  active: boolean;
  onFocus: () => void;
  onSelect: (e: SyntheticEvent<HTMLInputElement>) => void;
  placeholder: string;
  keyboardHint?: string;
  inputMode?: 'text' | 'tel' | 'email';
}) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px',
      background: active ? ym.blueSoft : ym.surface,
      border: `1px solid ${active ? ym.blue : ym.border}`,
      borderRadius: 10,
      marginBottom: 8,
      transition: 'background 0.15s',
    }}
    onClick={onFocus}
  >
    {icon}
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onSelect={onSelect}
      onClick={onSelect}
      onKeyUp={onSelect}
      placeholder={placeholder}
      inputMode={inputMode}
      style={{
        flex: 1, border: 'none', outline: 'none', background: 'transparent',
        fontSize: 15, color: ym.text, minWidth: 0,
      }}
    />
    {keyboardHint && (
      <span style={{ fontSize: 11, color: ym.textMuted, background: ym.surfaceElevated, padding: '2px 6px', borderRadius: 4 }}>{keyboardHint}</span>
    )}
  </div>
);

const Hint = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 12, color: '#FF6B6B', padding: '0 4px 8px' }}>
    {children}
  </div>
);
