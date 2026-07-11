import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type SentShare, type ShareAppId, SHARE_TARGETS, DEMO_CONTACTS, getPhotoBlobById, addSent
} from '../data';

export function ShareCompose() {
  const { app: appId } = useParams<{ app: string }>();
  const [searchParams] = useSearchParams();
  const photoId = searchParams.get('photoId');
  const navigate = useNavigate();

  const target =
    SHARE_TARGETS.find((t) => t.id === (appId as ShareAppId)) ?? SHARE_TARGETS[0];

  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [caption, setCaption] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const navTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!photoId) {
      setMissing(true);
      return;
    }
    let cancelled = false;
    let createdUrl: string | null = null;
    (async () => {
      const rec = await getPhotoBlobById(photoId);
      if (cancelled) return;
      if (!rec) {
        setMissing(true);
        return;
      }
      createdUrl = URL.createObjectURL(rec.blob);
      setPhotoBlob(rec.blob);
      setPhotoName(rec.name);
      setPhotoUrl(createdUrl);
    })();
    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [photoId]);

  useEffect(
    () => () => {
      if (navTimer.current) window.clearTimeout(navTimer.current);
    },
    [],
  );

  if (missing) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
        }}
      >
        <header
          style={{
            backgroundColor: target.color,
            padding: '40px 4px 12px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            aria-label="Zurück"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              margin: '0 12px',
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              borderRadius: '50%',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: 18, color: '#fff', fontWeight: 600 }}>{target.name}</span>
        </header>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5f6368',
            padding: 24,
            textAlign: 'center',
          }}
        >
          Foto nicht gefunden.
        </div>
      </div>
    );
  }

  const toggleContact = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const recipientNames = DEMO_CONTACTS.filter((c) => selected.has(c.id)).map(
    (c) => c.name,
  );
  const canSend = selected.size > 0 && !sending && !!photoBlob;

  const handleSend = async () => {
    if (!canSend || !photoBlob || !photoId) return;
    setSending(true);
    const record: SentShare = {
      id: `sent_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      photoId,
      photoName,
      photoBlob,
      app: target.id,
      recipientIds: Array.from(selected),
      recipientNames,
      caption: caption.trim(),
      sentAt: Date.now(),
    };
    await addSent(record);
    setSending(false);
    setToast(`An ${recipientNames.join(', ')} gesendet`);
    navTimer.current = window.setTimeout(() => {
      navigate(`/photos/photo/${photoId}`);
    }, 900);
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          backgroundColor: target.color,
          padding: '40px 4px 12px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            if (photoId) navigate(`/photos/photo/${photoId}`);
            else navigate('/photos');
          }}
          aria-label="Zurück"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            margin: '0 12px',
            background: 'rgba(255,255,255,0.18)',
            border: 'none',
            borderRadius: '50%',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <div style={{ flex: 1, color: '#fff', minWidth: 0 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {target.name}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            {selected.size === 0
              ? 'Empfänger auswählen'
              : `An ${selected.size} ${selected.size === 1 ? 'Kontakt' : 'Kontakte'}`}
          </div>
        </div>
        {photoUrl && (
          <img
            src={photoUrl}
            alt=""
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              objectFit: 'cover',
              marginRight: 12,
              border: '2px solid rgba(255,255,255,0.6)',
            }}
          />
        )}
      </header>

      <div
        style={{
          padding: '12px 16px 6px',
          fontSize: 11,
          fontWeight: 600,
          color: target.color,
          letterSpacing: 0.6,
        }}
      >
        EMPFÄNGER
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: 8,
        }}
      >
        {DEMO_CONTACTS.map((c) => {
          const isSelected = selected.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggleContact(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 15,
                color: '#202124',
                gap: 12,
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: c.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {c.initial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    color: '#202124',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {c.name}
                </div>
                <div style={{ fontSize: 12, color: '#5f6368' }}>{c.subtitle}</div>
              </div>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? target.color : '#c4c7c5'}`,
                  backgroundColor: isSelected ? target.color : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          borderTop: '1px solid #ececec',
          padding: '10px 12px',
          paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: '#fff',
          flexShrink: 0,
        }}
      >
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Bildunterschrift hinzufügen"
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: 24,
            border: 'none',
            backgroundColor: '#f1f3f4',
            fontSize: 15,
            outline: 'none',
            fontFamily: 'inherit',
            color: '#202124',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Senden"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: canSend ? target.color : '#c4c7c5',
            border: 'none',
            color: '#fff',
            cursor: canSend ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background-color 0.15s',
          }}
        >
          <Send size={20} color="#fff" />
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: 84,
              padding: '14px 18px',
              backgroundColor: 'rgba(28,27,31,0.96)',
              color: '#fff',
              borderRadius: 14,
              textAlign: 'center',
              fontSize: 14,
              boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
              zIndex: 50,
              pointerEvents: 'none',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
