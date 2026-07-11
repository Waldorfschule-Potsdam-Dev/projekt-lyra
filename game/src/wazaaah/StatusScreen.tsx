import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Camera, X, Trash2 } from 'lucide-react';
import { waColors } from './styles';
import { useStatuses, markStatusSeen, deleteStatus, ME_ID, ME_NAME, ME_COLOR } from './store';
import type { Status } from './types';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const formatStatusTime = (ts: number, now: number = Date.now()) => {
  const diff = now - ts;
  if (diff < HOUR) {
    const m = Math.max(1, Math.floor(diff / MIN));
    return `vor ${m} Min`;
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    return `vor ${h} Std`;
  }
  const d = Math.floor(diff / DAY);
  return `vor ${d} ${d === 1 ? 'Tag' : 'Tagen'}`;
};

const Avatar = ({ name, color, size = 50, src }: { name: string; color: string; size?: number; src?: string }) => {
  if (src) {
    return (
      <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.42,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
};

const StatusRing = ({ color, hasNew, size = 56, children }: { color: string; hasNew: boolean; size?: number; children: React.ReactNode }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      padding: 2,
      background: hasNew
        ? `linear-gradient(135deg, ${waColors.primaryGreen}, #34D399)`
        : `linear-gradient(135deg, #C7C7C7, #C7C7C7)`,
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: color,
        padding: 2,
      }}
    >
      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>{children}</div>
    </div>
  </div>
);

export default function StatusScreen() {
  const navigate = useNavigate();
  const statuses = useStatuses();
  const [viewerStatus, setViewerStatus] = useState<Status | null>(null);
  const [showMyMenu, setShowMyMenu] = useState(false);

  useEffect(() => {
    if (viewerStatus && !viewerStatus.seen && viewerStatus.authorId !== ME_ID) {
      const t = setTimeout(() => markStatusSeen(viewerStatus.id), 2500);
      return () => clearTimeout(t);
    }
  }, [viewerStatus]);

  const myStatuses = statuses.filter((s) => s.authorId === ME_ID);
  const otherStatuses = statuses.filter((s) => s.authorId !== ME_ID);
  const myLatest = myStatuses[0];

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
          onClick={() => navigate('/wazaaah')}
          style={{ cursor: 'pointer', padding: 4, marginRight: 4 }}
        />
        <span style={{ fontSize: 20, fontWeight: 500 }}>Status</span>
        <div style={{ flex: 1 }} />
        <Camera
          size={22}
          color={waColors.textOnDark}
          onClick={() => navigate('/wazaaah/status/new')}
          style={{ cursor: 'pointer', padding: 6 }}
        />
        <Plus
          size={22}
          color={waColors.textOnDark}
          onClick={() => navigate('/wazaaah/status/new')}
          style={{ cursor: 'pointer', padding: 6 }}
        />
      </header>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div
          onClick={() => {
            if (myStatuses.length > 0) setViewerStatus(myLatest!);
            else navigate('/wazaaah/status/new');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 16px',
            borderBottom: `1px solid ${waColors.divider}`,
            backgroundColor: '#fff',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <StatusRing color={myLatest ? ME_COLOR : '#bbb'} hasNew={myStatuses.length > 0} size={56}>
            <Avatar name={ME_NAME} color={myLatest ? ME_COLOR : '#bbb'} size={48} />
          </StatusRing>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: waColors.textPrimary }}>Mein Status</div>
            <div style={{ fontSize: 13, color: waColors.textSecondary, marginTop: 2 }}>
              {myLatest ? `${formatStatusTime(myLatest.timestamp)} · ${myStatuses.length} ${myStatuses.length === 1 ? 'Update' : 'Updates'}` : 'Tippen, um Status zu aktualisieren'}
            </div>
          </div>
          {myLatest && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMyMenu(true);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: waColors.textPrimary,
                fontSize: 22,
                cursor: 'pointer',
                padding: 4,
              }}
              aria-label="Mehr"
            >
              ⋯
            </button>
          )}
        </div>

        {otherStatuses.length > 0 && (
          <div style={{ padding: '14px 16px 4px', fontSize: 12, color: waColors.textSecondary, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Zuletzt aktualisiert
          </div>
        )}

        {otherStatuses.map((s) => {
          const hasNew = !s.seen;
          return (
            <button
              key={s.id}
              onClick={() => setViewerStatus(s)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${waColors.divider}`,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <StatusRing color={s.authorColor} hasNew={hasNew} size={50}>
                <Avatar name={s.authorName} color={s.authorColor} size={42} />
              </StatusRing>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: waColors.textPrimary }}>{s.authorName}</div>
                <div style={{ fontSize: 13, color: waColors.textSecondary, marginTop: 2 }}>{formatStatusTime(s.timestamp)}</div>
              </div>
            </button>
          );
        })}

        <div style={{ padding: 24, textAlign: 'center', color: waColors.textSecondary, fontSize: 13 }}>
          Status-Updates verschwinden nach 24 Stunden.
        </div>
      </div>

      <button
        onClick={() => navigate('/wazaaah/status/new')}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: waColors.fabBg,
          color: '#fff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 14px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          zIndex: 10,
        }}
        aria-label="Neuer Status"
      >
        <Camera size={24} color="#fff" />
      </button>

      {viewerStatus && (
        <div
          onClick={() => setViewerStatus(null)}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#000',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={viewerStatus.imageUrl}
              alt={viewerStatus.caption ?? 'Status'}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewerStatus(null);
              }}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Schließen"
            >
              <X size={20} color="#fff" />
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              <Avatar name={viewerStatus.authorName} color={viewerStatus.authorColor} size={36} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{viewerStatus.authorName}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{formatStatusTime(viewerStatus.timestamp)}</div>
              </div>
            </div>
            {viewerStatus.caption && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: 16,
                  right: 16,
                  padding: 12,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  borderRadius: 12,
                  fontSize: 15,
                  textAlign: 'center',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {viewerStatus.caption}
              </div>
            )}
          </div>
        </div>
      )}

      {showMyMenu && myLatest && (
        <div
          onClick={() => setShowMyMenu(false)}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 40,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              backgroundColor: '#fff',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              padding: 8,
              paddingBottom: 24,
            }}
          >
            <button
              onClick={() => {
                setViewerStatus(myLatest!);
                setShowMyMenu(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '14px 16px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontSize: 15,
                color: waColors.textPrimary,
                cursor: 'pointer',
              }}
            >
              Ansehen
            </button>
            <button
              onClick={() => {
                navigate('/wazaaah/status/new');
                setShowMyMenu(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '14px 16px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontSize: 15,
                color: waColors.textPrimary,
                cursor: 'pointer',
              }}
            >
              Neuen Status posten
            </button>
            <button
              onClick={() => {
                if (confirm('Status löschen?')) {
                  deleteStatus(myLatest!.id);
                  setShowMyMenu(false);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '14px 16px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontSize: 15,
                color: '#E53935',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={16} color="#E53935" />
              Status löschen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
