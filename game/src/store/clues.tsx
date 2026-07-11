import { create } from 'zustand';
import toast from 'react-hot-toast';
import { Search, Gamepad2 } from 'lucide-react';

export type ClueCategory =
  | 'identity'
  | 'career'
  | 'private'
  | 'political'
  | 'financial'
  | 'contacts'
  | 'location'
  | 'medical'
  | 'evidence'
  | 'games';

export const CATEGORY_LABELS: Record<ClueCategory, string> = {
  identity: 'Identität',
  career: 'Werdegang',
  private: 'Privatleben',
  political: 'Politik',
  financial: 'Finanzen',
  contacts: 'Kontakte',
  location: 'Orte',
  medical: 'Gesundheit',
  evidence: 'Beweise',
  games: 'Minispiele',
};

export type Clue = {
  id: string;
  sourceApp: string;
  category: ClueCategory;
  title: string;
  content: string;
  discoveredAt: number;
};

// Define all possible clues for typing and validation
export const CLUE_REGISTRY: Record<string, Omit<Clue, 'discoveredAt' | 'id'>> = {
  'briefing': {
    sourceApp: 'report',
    category: 'evidence',
    title: 'Briefing',
    content: 'Auftrag erhalten. Beweise sammeln und Bericht übermitteln.',
  },
  'maps:pankow-wohnung': {
    sourceApp: 'maps',
    category: 'location',
    title: 'Wohnorte',
    content: 'Hauptwohnung in Berlin Pankow und ein Zweitwohnsitz.',
  },
  'wallet:ausweis': {
    sourceApp: 'wallet',
    category: 'identity',
    title: 'Personalausweis',
    content: 'Personalausweis von Daniel Maximilian Seidt.',
  },
  'lumigram:cats': {
    sourceApp: 'lumigram',
    category: 'private',
    title: 'Katzennamen',
    content: 'Hinweis auf Namen Aspirin & Linie 7',
  },
  'photos:skiurlaub': {
    sourceApp: 'photos',
    category: 'private',
    title: 'Skiurlaub',
    content: 'Fotos von einem Skiurlaub auf der Ehrwalder Alm.',
  },
  'mail:pes-liste': {
    sourceApp: 'mail',
    category: 'contacts',
    title: 'Personalliste PES',
    content: 'Geheime Mail mit einer Liste von PES-Personal.',
  },
  'notes:lyra': {
    sourceApp: 'notes',
    category: 'evidence',
    title: 'LYRA',
    content: 'Eine Notiz zu LYRA.',
  },
  'browser:casino-addiction': {
    sourceApp: 'browser',
    category: 'private',
    title: 'Spielsucht',
    content: 'Die Statistiken im Casino "Black Diamond" zeigen extrem lange und teure Sessions. Alles deutet auf eine Spielsucht von Daniel hin.',
  },
  'wazaaah:nordlicht': {
    sourceApp: 'wazaaah',
    category: 'political',
    title: 'Projekt NORDLICHT',
    content: 'Eine geheime Notiz zeigt: "NORDLICHT beginnt sich politisch zu verselbstständigen".',
  },
  'fitness:bloodtype': {
    sourceApp: 'fitness',
    category: 'medical',
    title: 'Blutgruppe',
    content: 'Blutgruppe A Rh negativ – Eine seltene Blutgruppe, die als wichtiges medizinisches Detail in der Akte verzeichnet ist.',
  },
  'news:dr-vollmer': {
    sourceApp: 'news',
    category: 'contacts',
    title: 'Dr. Anika Vollmer',
    content: 'Autorin des Artikels über HORIZONT 4.2. Könnte eine wichtige Kontaktperson im Ministerium sein.',
  },
  'files:victory': {
    sourceApp: 'files',
    category: 'evidence',
    title: 'Letzte Warnung',
    content: 'Eine versteckte Textdatei (Victory.txt) enthält Daniels Warnung vor NORDLICHT und den finalen Abschied.',
  },
    'games:musica': {
    sourceApp: 'musica',
    category: 'games',
    title: 'Tunnel Dash',
    content: 'Ein verstecktes Minispiel: Tunnel Dash.',
  },
  'games:squarejump': {
    sourceApp: 'calendar',
    category: 'games',
    title: 'Square Jump',
    content: 'Ein verstecktes Minispiel: Square Jump.',
  },
  'games:doodle': {
    sourceApp: 'calendar',
    category: 'games',
    title: 'Doodle Jump',
    content: 'Ein verstecktes Minispiel: Doodle Jump.',
  },
  'games:slots': {
    sourceApp: 'calendar',
    category: 'games',
    title: 'Slot Machine',
    content: 'Ein verstecktes Minispiel: Slot Machine.',
  },
  'games:geometry': {
    sourceApp: 'geometry',
    category: 'games',
    title: 'Square Jump',
    content: 'Ein verstecktes Minispiel: Square Jump.',
  },
  'games:plumber': {
    sourceApp: 'wazaaah',
    category: 'games',
    title: 'Plumber Boss',
    content: 'Ein verstecktes Minispiel: Plumber Boss.',
  },
};

export const COMPLETION_REQUIREMENTS = {
  minClues: 7,
  requiredClues: [
    'wallet:ausweis',
    'mail:pes-liste',
    'wazaaah:nordlicht',
  ],
};

export type ClueStore = {
  clues: Record<string, Clue>;
  discoverClue: (id: keyof typeof CLUE_REGISTRY, silent?: boolean) => void;
  hasClue: (id: string) => boolean;
  totalClues: () => number;
  resetClues: () => void;
};

const STORAGE_KEY = 'escape-clues';

function loadClues(): Record<string, Clue> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveClues(clues: Record<string, Clue>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clues));
  } catch {
    // quota/privacy
  }
}

export const useClueStore = create<ClueStore>((set, get) => ({
  clues: loadClues(),

  discoverClue: (id, silent = false) => {
    const { clues } = get();
    if (clues[id]) return; // Already discovered

    const template = CLUE_REGISTRY[id];
    if (!template) {
      console.warn(`Clue ID ${id} not found in registry.`);
      return;
    }

    const full: Clue = { ...template, id, discoveredAt: Date.now() };
    const next = { ...clues, [id]: full };
    
    saveClues(next);
    set({ clues: next });

    if (!silent) {
      // Gamification feedback: Android-style notification
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
        <div style={{ backgroundColor: template.category === 'games' ? '#9C27B0' : '#0B8043', padding: '8px', borderRadius: '50%', display: 'flex' }}>
          {template.category === 'games' ? <Gamepad2 size={16} color="white" /> : <Search size={16} color="white" />}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#e3e3e3', fontSize: '15px' }}>
            {template.category === 'games' ? 'Journal • Spiel gefunden' : 'Journal • Hinweis gesichert'}
          </div>
          <div style={{ fontSize: '14px', color: '#a0a0a0', marginTop: '4px' }}>{template.title}</div>
        </div>
      </div>
    ), { duration: 4000 });
    }
  },

  hasClue: (id) => !!get().clues[id],

  totalClues: () => Object.keys(get().clues).length,

  resetClues: () => {
    saveClues({});
    set({ clues: {} });
  },
}));
