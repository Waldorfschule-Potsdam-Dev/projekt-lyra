import type { GalleryImage } from './types';

const DEMO_GALLERY: GalleryImage[] = [
  { id: 'demo-1', url: 'https://cdn.hackclub.com/019f52cf-60b1-7c5c-9f32-59dcb51e8a09/codebrecher-cc0a2394.webp', source: 'demo' },
  { id: 'demo-2', url: 'https://cdn.hackclub.com/019f52cf-5bae-7b6e-8487-1f42827c3131/codebrecher-322aa205.webp', source: 'demo' },
  { id: 'demo-3', url: 'https://cdn.hackclub.com/019f52cf-5f3a-7adf-ad1f-99b4d737b1f9/codebrecher-917e2c5e.webp', source: 'demo' },
  { id: 'demo-4', url: 'https://cdn.hackclub.com/019f52cf-5d6f-7b85-8bd1-d416b03dd961/codebrecher-66c77c95.webp', source: 'demo' },
  { id: 'demo-5', url: 'https://cdn.hackclub.com/019f52cf-62a4-7231-9957-0708c2526795/codebrecher-e0501b7b.webp', source: 'demo' },
  { id: 'demo-6', url: 'https://cdn.hackclub.com/019f52cf-56a1-785d-bed3-7ece540c0579/codebrecher-db8cd6cf.webp', source: 'demo' },
  { id: 'demo-7', url: 'https://cdn.hackclub.com/019f52cf-4f80-7e8f-9015-c11fc9037df1/codebrecher-c1e086df.webp', source: 'demo' },
  { id: 'demo-8', url: 'https://cdn.hackclub.com/019f52cf-4a25-7105-a18a-fe4b9202c083/codebrecher-ab2502c7.webp', source: 'demo' },
  { id: 'demo-9', url: 'https://cdn.hackclub.com/019f52cf-4835-7e52-a2ec-4f1cbc41f433/codebrecher-990bd737.webp', source: 'demo' },
];

const openPhotosDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open('fotos-app', 2);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });

const getAllFromStore = (db: IDBDatabase, store: string): Promise<unknown[]> =>
  new Promise((resolve) => {
    try {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve((req.result as unknown[]) ?? []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });

export const loadGallery = async (): Promise<GalleryImage[]> => {
  try {
    const db = await openPhotosDB();
    const stored = (await getAllFromStore(db, 'photos')) as Array<{ id: string; blob: Blob }>;
    if (stored.length > 0) {
      return stored.map((p, i) => ({
        id: `gallery-${p.id ?? i}`,
        url: URL.createObjectURL(p.blob),
        source: 'gallery' as const,
      }));
    }
  } catch {
    // fall through to demo
  }
  return DEMO_GALLERY;
};

export const DEMO_GALLERY_FALLBACK = DEMO_GALLERY;
