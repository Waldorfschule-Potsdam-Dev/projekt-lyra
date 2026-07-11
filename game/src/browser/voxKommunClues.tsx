import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { useClueStore, type Clue, type ClueCategory } from '../store/clues';

export interface VoxKommunClue {
  sourceApp: string;
  category: ClueCategory;
  title: string;
  content: string;
}

export const VOX_KOMMUN_CLUE_REGISTRY: Record<string, VoxKommunClue> = {
  'vox-kommun:klingspor-drohung': {
    sourceApp: 'browser',
    category: 'political',
    title: 'Klingspor-Drohung',
    content: '„Wer aus der Reihe tanzt" — Klingspor meint nicht die Allgemeinheit. Jemand Konkretes ist im Visier.',
  },
  'vox-kommun:seidt-bergstation': {
    sourceApp: 'browser',
    category: 'location',
    title: 'Bergstation Seidt',
    content: 'Privatresidenz Seidt, Sektor A7. Treffpunkt für ARGOS-4 und andere diskrete Übergaben.',
  },
};

const STORAGE_KEY = 'escape-clues';

function loadCluesFromStorage(): Record<string, Clue> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistClues(clues: Record<string, Clue>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clues));
  } catch {
    // ignore quota / private mode
  }
}

export function discoverVoxKommunClue(id: string): boolean {
  const template = VOX_KOMMUN_CLUE_REGISTRY[id];
  if (!template) {
    console.warn(`Vox Kommun Clue ID ${id} not found.`);
    return false;
  }

  const state = useClueStore.getState();
  if (state.clues[id]) return false;

  const full: Clue = { ...template, id, discoveredAt: Date.now() };
  const next = { ...loadCluesFromStorage(), ...state.clues, [id]: full };
  persistClues(next);

  useClueStore.setState({ clues: { ...state.clues, [id]: full } });

  toast.custom((t) => (
    <div
      style={{
        opacity: t.visible ? 1 : 0,
        transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: '#303030',
        borderRadius: '24px',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        pointerEvents: 'auto',
        width: 'calc(100% - 16px)',
        margin: '0 8px',
      }}
    >
      <div style={{ backgroundColor: '#0B8043', padding: '8px', borderRadius: '50%', display: 'flex' }}>
        <Search size={16} color="white" />
      </div>
      <div>
        <div style={{ fontWeight: 600, color: '#e3e3e3', fontSize: '15px' }}>Journal &bull; Hinweis gesichert</div>
        <div style={{ fontSize: '14px', color: '#a0a0a0', marginTop: '4px' }}>{template.title}</div>
      </div>
    </div>
  ), { duration: 4000 });

  return true;
}

export function hasVoxKommunClue(id: string): boolean {
  return useClueStore.getState().clues[id] !== undefined;
}
