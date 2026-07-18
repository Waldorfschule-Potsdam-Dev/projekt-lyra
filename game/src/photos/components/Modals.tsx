import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Calendar, Maximize2, HardDrive, MapPin, History, ChevronRight, X, type Share2
} from 'lucide-react';
import {
  type Photo, type ShareAppId, SHARE_TARGETS, PHOTO_META, formatDate, formatSize
} from '../data';
import { MiniMap, FullscreenMapView } from './MapView';
import { CollectClueButton } from '../../components/CollectClueButton';

export function InfoRow({ icon: Icon, label, value }: { icon: typeof Share2; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid #2a2a2a' }}>
      <Icon size={22} color="#a8c7fa" style={{ marginRight: 16, marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#a8c7fa', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 15, color: '#e3e3e3', whiteSpace: 'pre-line', wordBreak: 'break-all' }}>{value}</div>
      </div>
    </div>
  );
}

export function InfoModal({
  photo,
  meta,
  allPhotos,
  onSelectPhoto,
  onClose,
}: {
  photo: Photo;
  meta?: { location: string; lat: number; lng: number };
  allPhotos: Photo[];
  onSelectPhoto: (id: string) => void;
  onClose: () => void;
}) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [showFullscreenMap, setShowFullscreenMap] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = photo.url;
    return () => {
      img.onload = null;
    };
  }, [photo.id, photo.url]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 20,
        }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            backgroundColor: '#1c1b1f',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: '20px 24px 28px',
            maxHeight: '80%',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: '#fff' }}>Informationen</h2>
              {photo.id === 'codebrecher-bffb3450.png' && <CollectClueButton clueId="photos:skiurlaub" />}
            </div>
            <X size={24} color="#fff" onClick={onClose} style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ width: 36, height: 4, backgroundColor: '#444746', borderRadius: 2, margin: '0 auto 20px' }} />

          <InfoRow icon={FileText as any} label="Dateiname" value={photo.name} />
          <InfoRow icon={Calendar as any} label="Datum" value={formatDate(photo.addedAt)} />
          <InfoRow
            icon={Maximize2 as any}
            label="Auflösung"
            value={dims ? `${dims.w} × ${dims.h}` : 'wird geladen …'}
          />
          <InfoRow icon={HardDrive as any} label="Größe" value={formatSize(photo.blob?.size ?? 2450000)} />
          {meta ? (
            <div style={{ padding: '14px 0', borderBottom: '1px solid #2a2a2a' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <MapPin size={22} color="#a8c7fa" style={{ marginRight: 16, marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#a8c7fa', marginBottom: 4 }}>Standort</div>
                  <div style={{ fontSize: 15, color: '#e3e3e3', whiteSpace: 'pre-line' }}>
                    {meta.location}
                    {'\n'}
                    {meta.lat.toFixed(4)}° N, {meta.lng.toFixed(4)}° O
                  </div>
                </div>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullscreenMap(true);
                }}
                style={{ cursor: 'pointer', borderRadius: 12, overflow: 'hidden' }}
                title="Karte vergrößern"
              >
                <MiniMap lat={meta.lat} lng={meta.lng} label={meta.location} />
              </div>
            </div>
          ) : (
            <InfoRow icon={MapPin as any} label="Standort" value="Keine Standortinformationen" />
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showFullscreenMap && meta && (
          <FullscreenMapView
            currentPhoto={photo}
            currentMeta={meta}
            allPhotos={allPhotos}
            onClose={() => setShowFullscreenMap(false)}
            onSelectPhoto={onSelectPhoto}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Löschen',
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const btnStyle = (color: string): React.CSSProperties => ({
    padding: '10px 16px',
    background: 'transparent',
    color,
    border: 'none',
    borderRadius: 20,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'inherit',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#2b2a30',
          borderRadius: 28,
          padding: 24,
          width: 'calc(100% - 64px)',
          maxWidth: 320,
          color: '#fff',
        }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 500 }}>{title}</h3>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#c4c7c5', lineHeight: 1.4 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onCancel} style={btnStyle('#a8c7fa')}>Abbrechen</button>
          <button onClick={onConfirm} style={btnStyle('#f28b82')}>{confirmLabel}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ShareSheet({
  photoName,
  onClose,
  onSelect,
  onOpenHistory,
}: {
  photoName: string;
  onClose: () => void;
  onSelect: (app: ShareAppId) => void;
  onOpenHistory: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 25,
      }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          backgroundColor: '#1c1b1f',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: '12px 8px 24px',
          maxHeight: '70%',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            backgroundColor: '#444746',
            borderRadius: 2,
            margin: '0 auto 16px',
          }}
        />
        <div
          style={{
            padding: '4px 16px 4px',
            color: '#9aa0a6',
            fontSize: 13,
            letterSpacing: 0.4,
          }}
        >
          Teilen via
        </div>
        <div
          style={{
            fontSize: 17,
            color: '#fff',
            padding: '4px 16px 16px',
            fontWeight: 500,
            wordBreak: 'break-all',
          }}
        >
          „{photoName}"
        </div>
        <button
          onClick={onOpenHistory}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '12px 16px',
            marginBottom: 8,
            background: 'rgba(168,199,250,0.08)',
            border: 'none',
            borderRadius: 12,
            color: '#a8c7fa',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 14,
            gap: 12,
            textAlign: 'left',
          }}
        >
          <History size={20} color="#a8c7fa" />
          <div style={{ flex: 1 }}>Chat-Verlauf anzeigen</div>
          <ChevronRight size={18} color="#5f6368" />
        </button>
        {SHARE_TARGETS.map((target) => (
          <button
            key={target.id}
            onClick={() => onSelect(target.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '14px 16px',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 15,
              gap: 16,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: target.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <target.icon size={22} color="#fff" strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div>{target.name}</div>
              <div style={{ fontSize: 12, color: '#9aa0a6', marginTop: 2 }}>{target.hint}</div>
            </div>
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}
