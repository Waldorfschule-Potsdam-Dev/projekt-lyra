import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Info, Share2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Photo, PHOTO_META } from '../data';
import { InfoModal, ConfirmModal, ShareSheet } from './Modals';
import { CollectClueButton } from '../../components/CollectClueButton';

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  active,
  activeColor = '#EA4335',
}: {
  icon: typeof Share2;
  label: string;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 4px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: active ? activeColor : '#fff',
        fontFamily: 'inherit',
      }}
    >
      <Icon size={26} strokeWidth={1.6} fill={active ? activeColor : 'transparent'} />
      <span style={{ fontSize: 11 }}>{label}</span>
    </button>
  );
}

export function FotoNotFound({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#000', color: '#fff' }}>
      <header style={{ padding: '40px 8px 16px', display: 'flex', alignItems: 'center' }}>
        <ArrowLeft size={28} color="#fff" onClick={onBack} style={{ cursor: 'pointer', margin: '0 16px' }} />
      </header>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9aa0a6',
        }}
      >
        Foto nicht gefunden.
      </div>
    </div>
  );
}

export function PhotoDetail({
  photos,
  onDelete,
  onToggleFavorite,
}: {
  photos: Photo[];
  onDelete: (id: string) => Promise<void>;
  onToggleFavorite: (id: string) => void;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  const index = photos.findIndex((p) => p.id === id);
  const photo = index >= 0 ? photos[index] : null;

  if (!photo) return <FotoNotFound onBack={() => navigate('/photos')} />;

  const prevPhoto = index > 0 ? photos[index - 1] : null;
  const nextPhoto = index < photos.length - 1 ? photos[index + 1] : null;

  const goPrev = () => {
    if (prevPhoto) {
      setDirection(-1);
      navigate(`/photos/photo/${prevPhoto.id}`);
    }
  };
  const goNext = () => {
    if (nextPhoto) {
      setDirection(1);
      navigate(`/photos/photo/${nextPhoto.id}`);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showInfo || confirmDelete || shareSheetOpen) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevPhoto, nextPhoto, showInfo, confirmDelete, shareSheetOpen]);

  const handleShare = () => {
    setShareSheetOpen(true);
  };

  const meta = PHOTO_META[photo.id];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          padding: '40px 8px 12px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate('/photos')}
          aria-label="Zurück zur Übersicht"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            margin: '0 12px',
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            borderRadius: '50%',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={24} />
        </button>
      </header>

      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
        }}
      >
        <AnimatePresence custom={direction} initial={false} mode="popLayout">
          <motion.img
            key={photo.id}
            src={photo.url}
            alt=""
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? '60%' : '-60%',
                opacity: 0,
                scale: 0.92,
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
              },
              exit: (dir: number) => ({
                x: dir > 0 ? '-60%' : '60%',
                opacity: 0,
                scale: 0.92,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 280, damping: 32, mass: 0.8 },
              opacity: { duration: 0.22 },
              scale: { duration: 0.22 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 && nextPhoto) goNext();
              else if (info.offset.x > 60 && prevPhoto) goPrev();
            }}
            style={{
              position: 'absolute',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              touchAction: 'pan-y',
              cursor: 'grab',
              userSelect: 'none',
            }}
          />
        </AnimatePresence>

        {prevPhoto && (
          <button
            onClick={goPrev}
            aria-label="Vorheriges Foto"
            style={{
              position: 'absolute',
              left: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.35)',
              border: 'none',
              borderRadius: '50%',
              color: 'rgba(255,255,255,0.85)',
              cursor: 'pointer',
              zIndex: 5,
            }}
          >
            <ChevronLeft size={32} strokeWidth={2} />
          </button>
        )}
        {nextPhoto && (
          <button
            onClick={goNext}
            aria-label="Nächstes Foto"
            style={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.35)',
              border: 'none',
              borderRadius: '50%',
              color: 'rgba(255,255,255,0.85)',
              cursor: 'pointer',
              zIndex: 5,
            }}
          >
            <ChevronRight size={32} strokeWidth={2} />
          </button>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '16px 8px 24px',
          backgroundColor: '#000',
          flexShrink: 0,
        }}
      >
        <ActionButton icon={Share2} label="Teilen" onClick={handleShare} />
        <ActionButton
          icon={Heart}
          label="Favorit"
          onClick={() => onToggleFavorite(photo.id)}
          active={photo.favorite}
          activeColor="#EA4335"
        />
        <ActionButton icon={Info} label="Info" onClick={() => setShowInfo(true)} />
        <ActionButton
          icon={Trash2}
          label="Löschen"
          onClick={() => setConfirmDelete(true)}
        />
      </div>

      <AnimatePresence>
        {showInfo && (
          <InfoModal
            photo={photo}
            meta={meta}
            allPhotos={photos}
            onSelectPhoto={(id) => navigate(`/photos/photo/${id}`)}
            onClose={() => setShowInfo(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmModal
            title="Foto löschen?"
            message="Dieses Foto wird dauerhaft aus der App entfernt."
            onCancel={() => setConfirmDelete(false)}
            onConfirm={async () => {
              setConfirmDelete(false);
              await onDelete(photo.id);
              if (nextPhoto) navigate(`/photos/photo/${nextPhoto.id}`);
              else if (prevPhoto) navigate(`/photos/photo/${prevPhoto.id}`);
              else navigate('/photos');
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {shareSheetOpen && (
          <ShareSheet
            photoName={photo.name}
            onClose={() => setShareSheetOpen(false)}
            onSelect={(app) => {
              setShareSheetOpen(false);
              navigate(`/photos/share/${app}?photoId=${encodeURIComponent(photo.id)}`);
            }}
            onOpenHistory={() => {
              setShareSheetOpen(false);
              navigate('/photos/history');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
