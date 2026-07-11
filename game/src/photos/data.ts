import { MessageCircle, MessageSquare, Mail } from 'lucide-react';

// Foto-Dateien (nur hier ergänzen, nicht über UI)
export const PHOTO_SOURCES = [
  'https://cdn.hackclub.com/019f52cf-56a1-785d-bed3-7ece540c0579/codebrecher-db8cd6cf.webp',
  'https://cdn.hackclub.com/019f52cf-4a25-7105-a18a-fe4b9202c083/codebrecher-ab2502c7.webp',
  'https://cdn.hackclub.com/019f52cf-4835-7e52-a2ec-4f1cbc41f433/codebrecher-990bd737.webp',
  'https://cdn.hackclub.com/019f52cf-3fef-7edc-81b6-91f66d1b4cc4/codebrecher-648268a0.webp',
  'https://cdn.hackclub.com/019f52cf-4dc7-7e24-8d22-1fc08eb63f13/codebrecher-bffb3450.webp',
  'https://cdn.hackclub.com/019f52cf-45f0-7dda-b255-7e519794b7f8/codebrecher-8d7599e4.webp',
  'https://cdn.hackclub.com/019f52cf-517d-7771-8d03-8f5885f37fa7/codebrecher-c589e65c.webp',
  'https://cdn.hackclub.com/019f52cf-4be4-749a-9d38-8fbdf9e30c64/codebrecher-b0e7ce7f.webp',
  'https://cdn.hackclub.com/019f52cf-4f80-7e8f-9015-c11fc9037df1/codebrecher-c1e086df.webp',
  'https://cdn.hackclub.com/019f52cf-4369-7f8e-955e-e234833766c3/codebrecher-6ae23b6f.webp',
  'https://cdn.hackclub.com/019f52cf-3bb9-7bbc-9ff6-ed1ad0aca618/codebrecher-013b00e0.webp',
];

// Demo-Metadaten pro Foto (in echt käme das aus EXIF)
export const PHOTO_META: Record<string, { location: string; lat: number; lng: number }> = {
  'codebrecher-db8cd6cf.png': {
    location: 'Potsdam-Babelsberg, Karl-Marx-Straße 12a',
    lat: 52.3917,
    lng: 13.1167,
  },
  'codebrecher-ab2502c7.png': {
    location: 'Potsdamer Chaussee 28, 14476 Potsdam',
    lat: 52.3990,
    lng: 13.0950,
  },
  'codebrecher-990bd737.png': {
    location: '6465 Unterschächen, Schweiz',
    lat: 46.8500,
    lng: 8.7500,
  },
  'codebrecher-648268a0.png': {
    location: 'Berlin-Pankow, Schönhauser Allee 84',
    lat: 52.5410,
    lng: 13.4150,
  },
  'codebrecher-8d7599e4.png': {
    location: 'Neues Palais, Am Neuen Palais, 14469 Potsdam',
    lat: 52.4062,
    lng: 13.0253,
  },
  'codebrecher-bffb3450.png': {
    location: 'Skigebiet Ehrwalder Alm, Ehrwald, Österreich',
    lat: 47.4019,
    lng: 10.9317,
  },
  'codebrecher-c589e65c.png': {
    location: 'Pariser Platz, 10117 Berlin',
    lat: 52.5163,
    lng: 13.3777,
  },
  'codebrecher-b0e7ce7f.png': {
    location: 'Potsdamer Str. 50, 10785 Berlin',
    lat: 52.5006,
    lng: 13.3670,
  },
  'codebrecher-c1e086df.png': {
    location: 'Universitätsring 4, 1010 Wien, Österreich',
    lat: 48.2135,
    lng: 16.3585,
  },
  'codebrecher-6ae23b6f.png': {
    location: 'Babelsberg, 14482 Potsdam-Babelsberg',
    lat: 52.3900,
    lng: 13.0900,
  },
  'codebrecher-013b00e0.png': {
    location: 'Bundestag, Platz der Republik, 11011 Berlin',
    lat: 52.5186,
    lng: 13.3764,
  },
};

export type StoredPhoto = {
  id: string;
  blob: Blob;
  name: string;
  addedAt: number;
  favorite: boolean;
};

export type Photo = StoredPhoto & { url: string };

const DB_NAME = 'fotos-app';
const STORE = 'photos';
const STORE_SENT = 'sent';

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SENT)) {
        db.createObjectStore(STORE_SENT, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllStored(): Promise<StoredPhoto[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as StoredPhoto[]);
    req.onerror = () => reject(req.error);
  });
}

export async function putStored(photo: StoredPhoto): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(photo);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteStored(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateStored(id: string, updates: Partial<StoredPhoto>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (existing) store.put({ ...existing, ...updates });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export type ShareAppId = 'wazaaah' | 'messages' | 'mail';

export type ShareTarget = {
  id: ShareAppId;
  name: string;
  color: string;
  icon: typeof MessageCircle;
  hint: string;
};

export const SHARE_TARGETS: ShareTarget[] = [
  { id: 'wazaaah', name: 'Wazaaah', color: '#25D366', icon: MessageCircle, hint: 'An einen Chat senden' },
  { id: 'messages', name: 'Nachrichten', color: '#1A73E8', icon: MessageSquare, hint: 'Als SMS senden' },
  { id: 'mail', name: 'Mail', color: '#EA4335', icon: Mail, hint: 'Als E-Mail senden' },
];

export type DemoContact = {
  id: string;
  name: string;
  subtitle: string;
  initial: string;
  color: string;
};

export const DEMO_CONTACTS: DemoContact[] = [
  { id: 'mama', name: 'Mama', subtitle: 'Familie', initial: 'M', color: '#FF6B9D' },
  { id: 'papa', name: 'Papa', subtitle: 'Familie', initial: 'P', color: '#5C6BC0' },
  { id: 'lena', name: 'Lena', subtitle: 'Beste Freundin', initial: 'L', color: '#26A69A' },
  { id: 'tom', name: 'Tom', subtitle: 'Schule', initial: 'T', color: '#FFA726' },
  { id: 'julia', name: 'Julia', subtitle: 'Sport', initial: 'J', color: '#AB47BC' },
  { id: 'paul', name: 'Paul', subtitle: 'Schule', initial: 'P', color: '#42A5F5' },
  { id: 'anna', name: 'Anna', subtitle: 'Familie', initial: 'A', color: '#66BB6A' },
  { id: 'max', name: 'Max', subtitle: 'Sport', initial: 'M', color: '#EF5350' },
];

export type SentShare = {
  id: string;
  photoId: string;
  photoName: string;
  photoBlob: Blob;
  app: ShareAppId;
  recipientIds: string[];
  recipientNames: string[];
  caption: string;
  sentAt: number;
};

export async function addSent(record: SentShare): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SENT, 'readwrite');
    tx.objectStore(STORE_SENT).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPhotoBlobById(id: string): Promise<StoredPhoto | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as StoredPhoto) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllSent(): Promise<SentShare[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SENT, 'readonly');
    const req = tx.objectStore(STORE_SENT).getAll();
    req.onsuccess = () => resolve((req.result as SentShare[]) || []);
    req.onerror = () => reject(req.error);
  });
}

export type ChatGroup = {
  key: string;
  app: ShareAppId;
  recipientId: string;
  recipientName: string;
  contact: DemoContact | undefined;
  messages: SentShare[];
  lastAt: number;
  lastCaption: string;
  lastMessageId: string;
};

export function getContact(id: string): DemoContact | undefined {
  return DEMO_CONTACTS.find((c) => c.id === id);
}

export function isSameDay(a: number, b: number): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function formatChatTime(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  if (isSameDay(ts, now.getTime())) {
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays < 7) {
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  }
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function groupChats(items: SentShare[]): ChatGroup[] {
  const map = new Map<string, ChatGroup>();
  for (const item of items) {
    item.recipientIds.forEach((rid, i) => {
      const rname = item.recipientNames[i] ?? rid;
      const key = `${item.app}--${rid}`;
      let g = map.get(key);
      if (!g) {
        g = {
          key,
          app: item.app,
          recipientId: rid,
          recipientName: rname,
          contact: getContact(rid),
          messages: [],
          lastAt: 0,
          lastCaption: '',
          lastMessageId: '',
        };
        map.set(key, g);
      }
      g.messages.push(item);
      if (item.sentAt >= g.lastAt) {
        g.lastAt = item.sentAt;
        g.lastCaption = item.caption || '📷 Foto';
        g.lastMessageId = item.id;
      }
    });
  }
  return Array.from(map.values()).sort((a, b) => b.lastAt - a.lastAt);
}

