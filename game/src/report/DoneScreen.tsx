import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Newspaper, Clock, Home, FileText, AlertTriangle, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatPlaytime, getStartTime, getCompletionTime } from './storage';
import { ShareCard } from '../components/ShareCard';

export default function DoneScreen() {
  const navigate = useNavigate();
  const [playtime, setPlaytime] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const start = getStartTime();
    const end = getCompletionTime() ?? Date.now();
    if (start) {
      setPlaytime(formatPlaytime(end - start));
    }

    const duration = 1500;
    const end_ts = Date.now() + duration;
    const colors = ['#0B8043', '#34A853', '#FBBC05', '#EA4335'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end_ts) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const handleShare = async () => {
    if (!shareRef.current || isSharing) return;
    
    try {
      setIsSharing(true);
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: '#050505',
        scale: 1, 
        logging: false,
        useCORS: true,
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }
        
        const file = new File([blob], 'projekt-lyra-result.png', { type: 'image/png' });
        
        const shareData = {
          title: 'Projekt Lyra gelöst!',
          text: `Ich habe den Whistleblower-Fall in Projekt Lyra in ${playtime || 'Rekordzeit'} gelöst! Schaffst du es auch? 🕵️‍♂️`,
          url: 'https://projekt-lyra.de',
          files: [file],
        };
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share(shareData);
          } catch (e) {
            console.error('Sharing cancelled or failed', e);
          }
        } else if (navigator.share) {
          try {
            await navigator.share({ title: shareData.title, text: shareData.text, url: shareData.url });
          } catch (e) {
            console.error('Sharing cancelled or failed', e);
          }
        } else {
          try {
            await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\nhttps://projekt-lyra.de`);
            alert('Teilen-Funktion nicht verfügbar. Text und Link wurden kopiert!');
          } catch (e) {
            alert('Teilen auf diesem Gerät nicht möglich.');
          }
        }
        setIsSharing(false);
      }, 'image/png');
    } catch (err) {
      console.error('Share failed', err);
      setIsSharing(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#0e0f12',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          flex: 1,
          padding: '48px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            backgroundColor: 'rgba(11, 128, 67, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Check size={48} color="#34A853" strokeWidth={2.5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: 28,
            fontWeight: 500,
            margin: '0 0 12px',
            color: '#fff',
          }}
        >
          Bericht übermittelt.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: 16,
            color: '#c4c7c5',
            lineHeight: 1.5,
            margin: '0 0 32px',
            maxWidth: 340,
          }}
        >
          Das KONTEXT-Magazin hat deine Hinweise erhalten. Vielen Dank. 
          <p/>
          <i>Das Spiel ist hiermit beendet.</i>
        </motion.p>

        {playtime && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              backgroundColor: '#1c1d22',
              borderRadius: 16,
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 32,
            }}
          >
            <Clock size={22} color="#9aa0a6" />
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontSize: 12,
                  color: '#9aa0a6',
                  fontWeight: 500,
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                Deine Spielzeit
              </div>
              <div style={{ fontSize: 18, color: '#fff', fontWeight: 500 }}>{playtime}</div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{ width: '100%', maxWidth: 380, marginBottom: 32 }}
        >
          <button
            onClick={handleShare}
            disabled={isSharing}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: '#1c1d22',
              color: '#e3e3e3',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24,
              fontSize: 15,
              fontWeight: 500,
              cursor: isSharing ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: isSharing ? 0.7 : 1,
            }}
          >
            <Share2 size={18} />
            {isSharing ? 'Wird generiert...' : 'Ergebnis als Bild teilen'}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            backgroundColor: '#1c1d22',
            borderRadius: 20,
            padding: 16,
            maxWidth: 380,
            width: '100%',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#0B8043',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Newspaper size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#e3e3e3' }}>
                KONTEXT Magazin
              </div>
              <div style={{ fontSize: 12, color: '#9aa0a6' }}>vor 1 Min</div>
            </div>
          </div>
          <div
            style={{
              fontSize: 14,
              color: '#e3e3e3',
              lineHeight: 1.5,
              paddingLeft: 52,
            }}
          >
            Vielen Dank für Ihren Hinweis. Wir prüfen die Vorwürfe und melden uns bei Ihnen.
            <br />
            <span style={{ color: '#9aa0a6' }}>— Die Redaktion</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          style={{
            backgroundColor: '#1c1d22',
            borderRadius: 20,
            padding: 16,
            maxWidth: 380,
            width: '100%',
            textAlign: 'left',
            marginTop: 16,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 12,
          }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: 8,
              backgroundColor: 'rgba(234, 67, 53, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FileText size={16} color="#EA4335" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#c4c7c5', letterSpacing: 0.3 }}>
              Interne Redaktionsnotiz
            </div>
          </div>

          <div style={{ fontSize: 13, color: '#9aa0a6', lineHeight: 1.6, marginBottom: 12 }}>
            Hinweise geprüft. Wir arbeiten an der Verifizierung. Folgende Punkte sind für uns redaktionell relevant:
          </div>

          {([
            {
              icon: <AlertTriangle size={14} color="#FBBC05" />,
              text: 'Daniel M. Seidt ist Persönlicher Assistent der Ministerin für Innere Kohärenz (Sicherheitsfreigabe Stufe IV). Er hat Zugang zu eingestuften Dokumenten — darunter offenbar Akten zum Projekt NORDLICHT, dessen tatsächlicher Umfang im Widerspruch zur offiziellen Projektbeschreibung steht.',
              color: '#FBBC05',
            },
            {
              icon: <AlertTriangle size={14} color="#EA4335" />,
              text: 'Casino-Daten (Black Diamond) belegen: 14 Monate aktiv, Nettoverlust ~$12.400, Spielzeiten regelmäßig nach Mitternacht. Mögliche finanzielle Abhängigkeit — und damit potenzielle Erpressbarkeit einer Person mit Geheimdokumentenzugang.',
              color: '#EA4335',
            },
            {
              icon: <AlertTriangle size={14} color="#9aa0a6" />,
              text: 'Interne Notizen deuten auf Kenntnis parteiinterner Vorgänge hin, die über seine offizielle Funktion hinausgehen. Kontakt zu „Laura" (mutmaßlich Antonia Greuling) wird intern als Risiko eingestuft.',
              color: '#9aa0a6',
            },
            {
              icon: <AlertTriangle size={14} color="#9aa0a6" />,
              text: 'Wir prüfen, ob Geheimdokumente unbefugt weitergegeben wurden. Weitere Hinweise können an unsere verschlüsselte Redaktionsbox gesendet werden.',
              color: '#9aa0a6',
            },
          ] as Array<{ icon: React.ReactNode; text: string; color: string }>).map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10,
              padding: '8px 0',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              alignItems: 'flex-start',
            }}>
              <div style={{ marginTop: 2, flexShrink: 0 }}>{item.icon}</div>
              <div style={{ fontSize: 12, color: item.color, lineHeight: 1.55 }}>{item.text}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div
        style={{
          padding: '12px 20px 24px',
          borderTop: '1px solid #1c1d22',
          backgroundColor: '#0e0f12',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >

        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            padding: '14px 18px',
            backgroundColor: '#0B8043',
            color: '#fff',
            border: 'none',
            borderRadius: 24,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Home size={18} />
           Weiter entdecken
        </button>
      </div>
      <ShareCard ref={shareRef} type="success" playtime={playtime || undefined} />
    </div>
  );
}
