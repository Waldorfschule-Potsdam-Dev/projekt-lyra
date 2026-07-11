import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Bell } from 'lucide-react';
import { getStartTime, markBriefingSeen, setStartTime } from './storage';
import { CollectClueButton } from '../components/CollectClueButton';

const STEPS = [
  { id: 'mission' },
  { id: 'ps' },
];

export default function BriefingSheet() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!getStartTime()) {
      setStartTime(Date.now());
    }
  }, []);

  const handleDismiss = () => {
    markBriefingSeen();
    navigate('/', { state: { openNotifications: true } });
  };

  const isLast = step === STEPS.length - 1;

  return (
    <motion.div
      key="briefing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 250, damping: 26 }}
        style={{
          backgroundColor: '#fff',
          borderRadius: 28,
          maxWidth: 420,
          width: '100%',
          maxHeight: '88dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header — always the same */}
        <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #ececec', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#5f6368', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 600, flexShrink: 0 }}>
            ?
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#202124' }}>Unbekannt</div>
            <div style={{ fontSize: 12, color: '#5f6368', marginTop: 2 }}>Empfangen vor 2 Std.</div>
          </div>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === step ? '#5f6368' : i < step ? '#bdbdbd' : '#e0e0e0', transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div style={{ padding: '20px 24px', fontSize: 15, color: '#3c4043', lineHeight: 1.65 }}>
                  <p style={{ margin: '0 0 14px' }}>
                    Hallo. Du hast dieses Diensthandy in der S-Bahn gefunden. Es gehört jemand Wichtigem — und wir glauben, dass darauf Hinweise auf etwas Großes sind. Etwas, das nicht ans Licht kommen soll.
                  </p>
                  <p style={{ margin: '0 0 14px' }}>
                    <strong style={{ color: '#202124' }}>Deine Aufgabe:</strong> Sieh dich um, finde heraus was diese Person verbirgt und sammle Beweise mit dem grünen Button, den du unten siehst. Wenn du genug gesammelt hast, kannst du einen Bericht erstellen und abschicken.
                  </p>
                  <i>
                    Wir lesen mit. Viel Erfolg.
                  </i>
                </div>
              )}

              {step === 1 && (
                <div style={{ padding: '20px 24px', fontSize: 15, color: '#3c4043', lineHeight: 1.65 }}>
                  <p style={{ margin: '0 0 14px', fontSize: 13, color: '#9aa0a6', fontStyle: 'italic' }}>
                    P.S.
                  </p>
                  <p style={{ margin: '0 0 14px' }}>
                    Falls dir die Wahrheit zu gefährlich wird... es gibt immer einen anderen Ausweg.
                  </p>
                  <p style={{ margin: 0, color: '#5f6368' }}>
                    Ein lukrativeres Angebot. <em>Achte auf die Spuren.</em>
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px 20px', borderTop: '1px solid #ececec', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} style={{ background: 'transparent', border: '1px solid #e0e0e0', borderRadius: 24, padding: '9px 18px', fontSize: 14, color: '#5f6368', cursor: 'pointer', fontFamily: 'inherit' }}>
              Zurück
            </button>
          ) : <div />}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!isLast && (
              <motion.button
                onClick={() => setStep(s => s + 1)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #0B8043, #16a085)', border: 'none', borderRadius: 24, padding: '11px 22px', fontSize: 15, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(11,128,67,0.3)' }}
              >
                Weiter <ChevronRight size={17} />
              </motion.button>
            )}
            {isLast && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#5f6368' }}>Verstanden</span>
                <CollectClueButton clueId="briefing" size={20} onClick={handleDismiss} silent={true} />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
