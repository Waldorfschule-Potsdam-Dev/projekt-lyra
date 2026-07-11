import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import { type Photo } from '../data';

export function FotosGrid({
  photos,
  loading,
}: {
  photos: Photo[];
  loading: boolean;
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          color: '#5f6368',
          fontSize: 14,
        }}
      >
        Lade Fotos …
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
      <header
        style={{
          padding: '40px 16px 12px',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #ececec',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, color: '#202124' }}>Fotos</h1>
        <span style={{ fontSize: 13, color: '#5f6368' }}>
          {photos.length} {photos.length === 1 ? 'Foto' : 'Fotos'}
        </span>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 4 }}>
        {photos.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5f6368',
              padding: 32,
              textAlign: 'center',
              gap: 12,
            }}
          >
            <ImageIcon size={56} strokeWidth={1.2} color="#dadce0" />
            <div style={{ fontSize: 16, fontWeight: 500, color: '#202124' }}>
              Keine Fotos vorhanden
            </div>
            <div style={{ fontSize: 13, color: '#5f6368' }}>
              Lege Bilder unter <code>public/uploads/</code> ab und trage sie in
              <br />
              <code>src/photos/index.tsx</code> in <code>PHOTO_SOURCES</code> ein.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
            }}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => navigate(`/photos/photo/${photo.id}`)}
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  backgroundColor: '#eee',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={photo.url}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
