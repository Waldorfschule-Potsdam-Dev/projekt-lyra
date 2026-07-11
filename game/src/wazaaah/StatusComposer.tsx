import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Image as ImageIcon } from 'lucide-react';
import { waColors } from './styles';
import { loadGallery } from './gallery';
import { postStatus } from './store';
import type { GalleryImage } from './types';

export default function StatusComposer() {
  const navigate = useNavigate();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(true);
  const captionRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGallery().then((g) => {
      if (cancelled) return;
      setImages(g);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePost = () => {
    if (!selected) return;
    postStatus(selected.url, caption);
    navigate('/wazaaah/status');
  };

  if (selected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#000' }}>
        <header
          style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 6px',
            height: 60,
            flexShrink: 0,
          }}
        >
          <ArrowLeft
            size={24}
            color="#fff"
            onClick={() => setSelected(null)}
            style={{ cursor: 'pointer', padding: 4, marginRight: 4 }}
          />
          <span style={{ fontSize: 18, fontWeight: 500 }}>Vorschau</span>
          <div style={{ flex: 1 }} />
          <button
            onClick={handlePost}
            style={{
              backgroundColor: waColors.primaryGreen,
              color: '#fff',
              border: 'none',
              borderRadius: 18,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Send size={14} color="#fff" />
            Posten
          </button>
        </header>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <img
            src={selected.url}
            alt="Vorschau"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.85)', padding: 12, flexShrink: 0 }}>
          <textarea
            ref={captionRef}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Bildunterschrift hinzufügen…"
            maxLength={140}
            style={{
              width: '100%',
              minHeight: 60,
              maxHeight: 100,
              resize: 'none',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: 15,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{caption.length}/140</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              {selected.source === 'gallery' ? '📷 Aus Galerie' : '🎨 Demo-Bild'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: waColors.listBg }}>
      <header
        style={{
          backgroundColor: waColors.headerBg,
          color: waColors.textOnDark,
          display: 'flex',
          alignItems: 'center',
          padding: '8px 6px',
          height: 60,
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        <ArrowLeft
          size={24}
          color={waColors.textOnDark}
          onClick={() => navigate('/wazaaah/status')}
          style={{ cursor: 'pointer', padding: 4, marginRight: 8 }}
        />
        <span style={{ fontSize: 20, fontWeight: 500 }}>Galerie</span>
      </header>

      <div style={{ padding: '10px 16px', backgroundColor: waColors.searchBg, fontSize: 13, color: waColors.textSecondary, display: 'flex', alignItems: 'center', gap: 8 }}>
        <ImageIcon size={14} />
        <span>Wähle ein Bild aus deiner Galerie für deinen Status</span>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: waColors.textSecondary }}>
          Lade Galerie…
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            padding: 2,
            backgroundColor: '#000',
          }}
        >
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelected(img)}
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                border: 'none',
                padding: 0,
                background: 'transparent',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              <img
                src={img.url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
