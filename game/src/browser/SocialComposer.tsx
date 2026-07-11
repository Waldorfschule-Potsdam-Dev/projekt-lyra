import { useState, useMemo } from 'react';
import { X, AlertTriangle, Shield, Image, Smile, MapPin, BarChart3 } from 'lucide-react';
import { socialTheme, hexToRgba, socialGlobalCss } from './SocialTheme';

interface SocialComposerProps {
  onClose: () => void;
  onSubmit: (text: string, suspicionDelta: number) => void;
}

const dangerWords: Array<{ pattern: RegExp; trigger: string; delta: number; label: string }> = [
  { pattern: /\b(kritik|kritisiere|kritisch|infrag(e|e stellen)|missbill(ig)?e|verurteile|zerstör(e|en))\b/i, trigger: 'kritik', delta: 35, label: 'Öffentliche Kritik an der Linie' },
  { pattern: /\b(warum|weshalb|wieso|wozu)\s+(sperrt|geheim|versteckt|zensiert|zur(ü|ue)ckhält)/i, trigger: 'neugier', delta: 20, label: 'Fragen nach gesperrten Inhalten' },
  { pattern: /\b(zweifel|skepsis|ungerecht|korrupt|verlogen|moralisch|ethisch|schlecht|falsch|lüge|lügen)\b/i, trigger: 'zweifel', delta: 28, label: 'Zweifel an der Moral der Führung' },
  { pattern: /\b(offizielle? zahlen? stimmen (nicht|kaum)|glaube? (der führung|den berichten)|vertrau(e?n)? (nicht|kaum))/i, trigger: 'skepsis', delta: 15, label: 'Skepsis gegenüber offiziellen Daten' },
  { pattern: /\b(überwachung|abhören|spion|spitzel|zensur|kontrolle (durch|von)|prometheus|nordlicht)\b/i, trigger: 'warnung', delta: 30, label: 'Verweis auf PROMETHEUS / Überwachung' },
];

const positiveWords: Array<{ pattern: RegExp; trigger: string; delta: number; label: string }> = [
  { pattern: /\b(stolz|treue|loyalität|verbunden|gemeinsam|stehen\s+zusammen|mitstreiter|kamerad(en)?|genoss(en|in)?)\b/i, trigger: 'solidarität', delta: -10, label: 'Solidarität mit Genossen' },
  { pattern: /\b(verdient|ehren|dank(e|bar)|opfer|märtyrer|gefallene(n)?|still(e)? held(en)?)\b/i, trigger: 'opfer', delta: -15, label: 'Ehrung von gefallenen Mitgliedern' },
  { pattern: /(:\)|haha|lol|witzig|scherz|spass|😀|😄|😂|😉|👍)/i, trigger: 'spass', delta: -8, label: 'Humor im Rahmen' },
];

export function SocialComposer({ onClose, onSubmit }: SocialComposerProps) {
  const [text, setText] = useState('');
  const [stage, setStage] = useState<'draft' | 'confirm' | 'warning' | 'sent'>('draft');
  const [suspicion, setSuspicion] = useState(0);
  const [submittedPost, setSubmittedPost] = useState('');

  const analysis = useMemo(() => {
    const triggers: Array<{ trigger: string; delta: number; label: string }> = [];
    let delta = 0;
    if (!text.trim()) return { triggers, delta: 0 };

    for (const rule of dangerWords) {
      if (rule.pattern.test(text)) {
        triggers.push({ trigger: rule.trigger, delta: rule.delta, label: rule.label });
        delta += rule.delta;
      }
    }
    for (const rule of positiveWords) {
      if (rule.pattern.test(text)) {
        triggers.push({ trigger: rule.trigger, delta: rule.delta, label: rule.label });
        delta += rule.delta;
      }
    }
    return { triggers, delta };
  }, [text]);

  const suspicionAfter = suspicion + analysis.delta;
  const riskLevel =
    suspicionAfter >= 80 ? 'kritisch' :
    suspicionAfter >= 50 ? 'hoch' :
    suspicionAfter >= 25 ? 'mittel' : 'niedrig';

  const riskColor =
    riskLevel === 'kritisch' ? socialTheme.accent.red :
    riskLevel === 'hoch' ? '#ff6b35' :
    riskLevel === 'mittel' ? socialTheme.accent.gold : socialTheme.accent.green;

  const handleSendClick = () => {
    if (!text.trim()) return;
    setStage('confirm');
    setSuspicion(s => s + analysis.delta);
  };

  const handleConfirm = () => {
    if (riskLevel === 'kritisch') {
      setStage('warning');
      return;
    }
    setSubmittedPost(text);
    setStage('sent');
    setTimeout(() => {
      onSubmit(text, suspicionAfter);
    }, 1200);
  };

  if (stage === 'confirm') {
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          background: socialTheme.bg.secondary,
          border: `1px solid ${hexToRgba(riskColor, 0.3)}`,
          borderRadius: 16,
          padding: 20, maxWidth: 320, width: '100%',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Shield size={20} color={riskColor} />
            <span style={{ fontSize: 16, fontWeight: 700, color: socialTheme.text.primary, fontFamily: socialTheme.font.system }}>
              Beitrag veröffentlichen?
            </span>
          </div>

          <div style={{
            padding: 12,
            background: socialTheme.bg.primary,
            border: `1px solid ${socialTheme.border.subtle}`,
            borderRadius: 12,
            fontSize: 13,
            color: socialTheme.text.primary,
            lineHeight: 1.5,
            fontFamily: socialTheme.font.system,
            marginBottom: 12,
            maxHeight: 120,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {text}
          </div>

          {analysis.triggers.length > 0 && (
            <div style={{
              fontSize: 11,
              color: socialTheme.text.secondary,
              fontFamily: socialTheme.font.system,
              marginBottom: 16,
            }}>
              Risiko: <span style={{ color: riskColor, fontWeight: 700 }}>{riskLevel.toUpperCase()}</span>
              {' · '}Misstrauen: {suspicionAfter >= 0 ? '+' : ''}{analysis.delta}
            </div>
          )}

          {analysis.triggers.length === 0 && (
            <div style={{
              fontSize: 11,
              color: socialTheme.text.tertiary,
              fontFamily: socialTheme.font.system,
              marginBottom: 16,
            }}>
              Keine Auffälligkeiten erkannt.
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setStage('draft')}
              style={{
                flex: 1, padding: '10px 12px',
                border: `1px solid ${socialTheme.border.default}`,
                background: 'transparent',
                color: socialTheme.text.primary,
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 9999,
                fontFamily: socialTheme.font.system,
              }}
            >
              Überarbeiten
            </button>
            <button
              onClick={handleConfirm}
              style={{
                flex: 1, padding: '10px 12px',
                border: 'none',
                background: socialTheme.accent.blue,
                color: 'white',
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 9999,
                fontFamily: socialTheme.font.system,
              }}
            >
              Senden
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'sent') {
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: socialTheme.bg.primary,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, zIndex: 100,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: hexToRgba(socialTheme.accent.green, 0.15),
          border: `2px solid ${socialTheme.accent.green}`,
          color: socialTheme.accent.green,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div style={{
          fontSize: 18, fontWeight: 700, color: socialTheme.text.primary,
          marginBottom: 6, fontFamily: socialTheme.font.system,
        }}>
          Beitrag gesendet
        </div>
        <div style={{
          fontSize: 13, color: socialTheme.text.secondary,
          textAlign: 'center', maxWidth: 280, lineHeight: 1.5,
          fontFamily: socialTheme.font.system,
        }}>
          {riskLevel !== 'niedrig' ? 'Achte auf Rückmeldungen im Feed' : 'Dein Beitrag ist jetzt sichtbar'}
        </div>
        {submittedPost && (
          <div style={{
            marginTop: 16, padding: 12,
            background: socialTheme.bg.secondary,
            border: `1px solid ${socialTheme.border.subtle}`,
            borderRadius: 12,
            maxWidth: 280, fontSize: 13, color: socialTheme.text.primary, lineHeight: 1.4,
            fontFamily: socialTheme.font.system,
          }}>
            „{submittedPost}"
          </div>
        )}
      </div>
    );
  }

  if (stage === 'warning') {
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          background: socialTheme.bg.secondary,
          border: `1px solid ${hexToRgba(socialTheme.accent.red, 0.3)}`,
          borderRadius: 16,
          padding: 20, maxWidth: 320, width: '100%',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={20} color={socialTheme.accent.red} />
            <span style={{ fontSize: 16, fontWeight: 700, color: socialTheme.accent.red, fontFamily: socialTheme.font.system }}>
              Kritische Wortwahl
            </span>
          </div>
          <div style={{
            fontSize: 13, color: socialTheme.text.primary, lineHeight: 1.5, marginBottom: 12,
            fontFamily: socialTheme.font.system,
          }}>
            Dein Beitrag enthält Formulierungen, die als illoyal ausgelegt werden können. Eine Veröffentlichung erhöht dein Misstrauen-Profil erheblich.
          </div>
          <div style={{
            background: hexToRgba(socialTheme.accent.red, 0.08),
            padding: 10, borderRadius: 8,
            fontSize: 12, color: socialTheme.text.primary, marginBottom: 16, lineHeight: 1.5,
            border: `1px solid ${hexToRgba(socialTheme.accent.red, 0.2)}`,
            fontFamily: socialTheme.font.system,
          }}>
            <strong style={{ color: socialTheme.accent.red }}>Empfehlung:</strong><br />
            Überarbeite den Text · Du kannst nichts zurücknehmen
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setStage('draft')}
              style={{
                flex: 1, padding: '10px 12px',
                border: `1px solid ${socialTheme.border.default}`,
                background: 'transparent',
                color: socialTheme.text.primary,
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 9999,
                fontFamily: socialTheme.font.system,
              }}
            >
              Überarbeiten
            </button>
            <button
              onClick={handleConfirm}
              style={{
                flex: 1, padding: '10px 12px',
                border: 'none',
                background: socialTheme.accent.red,
                color: 'white',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 9999,
                fontFamily: socialTheme.font.system,
              }}
            >
              Trotzdem senden
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: socialTheme.bg.primary,
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>
      <style>{socialGlobalCss}</style>

      {/* Header */}
      <div style={{
        background: socialTheme.bg.glass,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${socialTheme.border.subtle}`,
        padding: '4px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', padding: 6, cursor: 'pointer',
          borderRadius: '50%', display: 'flex', alignItems: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <X size={20} color={socialTheme.text.primary} />
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={handleSendClick}
          disabled={!text.trim()}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: 9999,
            background: text.trim() ? socialTheme.accent.blue : socialTheme.bg.hover,
            color: text.trim() ? 'white' : socialTheme.text.tertiary,
            fontSize: 14, fontWeight: 700,
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            fontFamily: socialTheme.font.system,
            transition: 'all 0.15s',
          }}
        >
          Senden
        </button>
      </div>

      {/* Risk analysis */}
      {analysis.triggers.length > 0 && (
        <div style={{
          background: socialTheme.bg.secondary,
          borderBottom: `1px solid ${socialTheme.border.subtle}`,
          padding: '12px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Shield size={14} color={riskColor} />
            <span style={{ fontSize: 12, fontWeight: 600, color: socialTheme.text.primary, fontFamily: socialTheme.font.system }}>
              Wortwahl-Analyse
            </span>
            <span style={{
              marginLeft: 'auto',
              fontSize: 11, fontWeight: 700,
              color: riskColor,
              background: hexToRgba(riskColor, 0.15),
              padding: '2px 8px',
              borderRadius: 4,
              fontFamily: socialTheme.font.system,
            }}>
              {riskLevel.toUpperCase()}
            </span>
          </div>
          <div style={{ height: 4, background: socialTheme.bg.primary, borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, suspicionAfter))}%`,
              height: '100%',
              background: riskColor,
              transition: 'width 0.3s',
            }} />
          </div>
          {analysis.triggers.map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: t.delta > 0 ? socialTheme.accent.red : socialTheme.accent.green,
              padding: '2px 0', fontFamily: socialTheme.font.system,
            }}>
              <span>{t.delta > 0 ? '⚠' : '✓'}</span>
              <span style={{ flex: 1 }}>{t.label}</span>
              <span style={{ fontWeight: 600 }}>
                {t.delta > 0 ? '+' : ''}{t.delta}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Text area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: socialTheme.accent.blue,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 14,
            fontFamily: socialTheme.font.system,
            flexShrink: 0,
          }}>
            UN
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Was passiert gerade?"
            style={{
              flex: 1,
              minHeight: 150,
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: 18,
              color: socialTheme.text.primary,
              lineHeight: 1.5,
              fontFamily: socialTheme.font.system,
              background: 'transparent',
            }}
            autoFocus
          />
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        padding: '8px 16px',
        borderTop: `1px solid ${socialTheme.border.subtle}`,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {[Image, Smile, BarChart3, MapPin].map((Icon, i) => (
          <button key={i} style={{
            background: 'none', border: 'none', padding: 8,
            cursor: 'pointer', borderRadius: '50%',
            color: socialTheme.accent.blue,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = socialTheme.bg.hover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* Warning footer */}
      <div style={{
        padding: '12px 16px',
        background: hexToRgba(socialTheme.accent.gold, 0.05),
        borderTop: `1px solid ${hexToRgba(socialTheme.accent.gold, 0.15)}`,
        fontSize: 12,
        color: socialTheme.text.secondary,
        display: 'flex', alignItems: 'flex-start', gap: 6,
        fontFamily: socialTheme.font.system,
      }}>
        <AlertTriangle size={14} color={socialTheme.accent.gold} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          <strong style={{ color: socialTheme.accent.gold }}>Hinweis:</strong> Öffentliche Beiträge sind für alle Mitglieder sichtbar. Formulierungen, die als illoyal ausgelegt werden, erhöhen dein Misstrauen-Profil.
        </span>
      </div>
    </div>
  );
}