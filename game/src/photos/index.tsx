import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FotosGrid, SentChatDetail, SentHistory, ShareCompose, PhotoDetail } from './components';
import {
  type Photo,
  getAllStored, putStored, deleteStored, updateStored, PHOTO_SOURCES
} from './data';

export default function FotosApp() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await getAllStored();
        const storedIds = new Set(stored.map((p) => p.id));

        for (const src of PHOTO_SOURCES) {
          const id = src.split('/').pop() || src;
          if (storedIds.has(id)) continue;
          await putStored({
            id,
            photoUrl: src,
            name: id,
            addedAt: Date.now(),
            favorite: false,
          });
        }

        const all = await getAllStored();
        const normalized = all
          .map((p) => ({ ...p, favorite: p.favorite ?? false }))
          .map((p) => ({ ...p, url: p.photoUrl || (p.blob ? URL.createObjectURL(p.blob) : '') }))
          .sort((a, b) => b.addedAt - a.addedAt);

        if (!cancelled) {
          setPhotos(normalized);
          setLoading(false);
        }
      } catch (e) {
        console.error('Fehler beim Laden der Fotos:', e);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);



  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.url);
    await deleteStored(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleFavorite = async (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;
    const nextFavorite = !photo.favorite;
    await updateStored(id, { favorite: nextFavorite });
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: nextFavorite } : p)));
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route
          path="/"
          element={<FotosGrid photos={photos} loading={loading} />}
        />
        <Route
          path="/photo/:id"
          element={
            <PhotoDetail
              photos={photos}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />
        <Route path="/share/:app" element={<ShareCompose />} />
        <Route path="/history" element={<SentHistory />} />
        <Route path="/history/:chatKey" element={<SentChatDetail />} />
      </Routes>
    </div>
  );
}