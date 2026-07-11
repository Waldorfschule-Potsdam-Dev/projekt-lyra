import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Mail, Map, Globe, MessageCircle, Settings, 
  StickyNote, Calendar, Folder, MessageSquare,
  Phone, Image, Music, Clock as ClockIcon, ChevronDown, Camera,
  CloudSun, Mic, ScanLine, ChevronUp, Dumbbell, Gamepad2, Newspaper, Wallet, CheckCircle2, Info, Lock, Star, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClueStore, CATEGORY_LABELS, CLUE_REGISTRY, COMPLETION_REQUIREMENTS } from '../store/clues';
import { useClock } from '../store/clock';

type AppDef = {
  id: string;
  name: string;
  icon: React.ComponentType<{ color?: string; size?: number }>;
  color: string;
  route: string;
};

export const allApps: AppDef[] = [
  { id: 'calendar', name: 'Kalender', icon: Calendar, color: '#4285F4', route: '/calendar' },
  { id: 'browser', name: 'Browser', icon: Globe, color: '#FBBC05', route: '/browser' },
  { id: 'clock', name: 'Uhr', icon: ClockIcon, color: '#8AB4F8', route: '/clock' },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: '#FF5722', route: '/fitness' },
  { id: 'geometry', name: 'Square Jump', icon: Gamepad2, color: '#8E44AD', route: '/geometry' },
  { id: 'files', name: 'Dateien', icon: Folder, color: '#F29900', route: '/files' },
  { id: 'lumigram', name: 'Lumigram', icon: Camera, color: '#E1306C', route: '/lumigram' },
  { id: 'mail', name: 'YMail', icon: Mail, color: '#EA4335', route: '/mail' },
  { id: 'maps', name: 'Maps', icon: Map, color: '#34A853', route: '/maps' },
  { id: 'messages', name: 'Nachrichten', icon: MessageSquare, color: '#1A73E8', route: '/messages' },
  { id: 'news', name: 'Neuigkeiten', icon: Newspaper, color: '#FF6B35', route: '/news' },
  { id: 'notes', name: 'Notizen', icon: StickyNote, color: '#FDE293', route: '/notes' },
  { id: 'phone', name: 'Telefon', icon: Phone, color: '#34A853', route: '/phone' },
  { id: 'photos', name: 'Fotos', icon: Image, color: '#EA4335', route: '/photos' },
  { id: 'settings', name: 'Einstellungen', icon: Settings, color: '#80868B', route: '/settings' },
  { id: 'musica', name: 'Musica', icon: Music, color: '#1DB954', route: '/musica' },
  { id: 'wazaaah', name: 'Wazaaah', icon: MessageCircle, color: '#25D366', route: '/wazaaah' },
  { id: 'wallet', name: 'Wallet', icon: Wallet, color: '#0B8043', route: '/wallet' }
];

const appsById: Record<string, AppDef> = allApps.reduce((acc, app) => {
  acc[app.id] = app;
  return acc;
}, {} as Record<string, AppDef>);

export const dockApps = allApps.filter(app => ['phone', 'messages', 'browser', 'photos'].includes(app.id));

// Thematic layout pattern (NOT alphabetical):
//   - Row 1 on home is the "investigation" core of the escape game
//   - Row 2 is "communication" (hidden on compact screens)
//   - Page 2 holds "alltag" + "tools"
const HOME_ROW_INVESTIGATION = ['photos', 'files', 'notes', 'maps'];
const HOME_ROW_COMMUNICATION = ['mail', 'wazaaah', 'messages', 'phone'];
const PAGE2_ROW_DAILY = ['calendar', 'clock', 'news', 'fitness'];
const PAGE2_ROW_TOOLS = ['browser', 'wallet', 'musica', 'lumigram', 'geometry', 'settings'];

const APP_GROUPS: string[][] = [
  HOME_ROW_INVESTIGATION,
  HOME_ROW_COMMUNICATION,
  PAGE2_ROW_DAILY,
  PAGE2_ROW_TOOLS
];

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

function ClockWidget() {
  const now = useClock((s) => s.now);
  const time = new Date(now);

  return (
    <Link to="/clock" className="clock-widget" style={{ textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '32px 32px 16px', marginBottom: '8px' }}>
      <div className="clock-time" style={{ fontSize: '72px', fontWeight: '300', lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.2)', letterSpacing: '-1px' }}>
        {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="clock-date" style={{ fontSize: '18px', fontWeight: '400', textShadow: '0 2px 8px rgba(0,0,0,0.2)', marginTop: '12px', marginLeft: '4px' }}>
        {time.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
      <div className="clock-weather" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '400', textShadow: '0 2px 8px rgba(0,0,0,0.2)', marginTop: '8px', marginLeft: '4px' }}>
        <CloudSun size={20} />
        <span>22°C Heiter</span>
      </div>
    </Link>
  );
}

function ClueProgressWidget({ onScrollToJournal }: { onScrollToJournal: () => void }) {
  const clues = useClueStore(s => s.clues);
  const validIds = Object.keys(CLUE_REGISTRY).filter(id => CLUE_REGISTRY[id].category !== 'games');
  const found = validIds.filter(id => clues[id]).length;
  const totalRequired = COMPLETION_REQUIREMENTS.minClues;
  const allPossible = validIds.length;
  const pct = Math.min(found / allPossible, 1);
  const requiredPct = totalRequired / allPossible;

  const essentialClues = COMPLETION_REQUIREMENTS.requiredClues;
  const missingEssential = essentialClues.filter(id => !clues[id]).length;
  const requirementsMet = found >= totalRequired && missingEssential === 0;

  return (
    <div
      onClick={onScrollToJournal}
      style={{
        marginBottom: '16px',
        backgroundColor: 'rgba(20,20,20,0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '20px 24px',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 500, letterSpacing: 0.8, textTransform: 'uppercase' }}>
          Gesammelte Hinweise
        </span>
        <span style={{ color: requirementsMet ? '#4ADE80' : 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 700 }}>
          {found} / {allPossible}
        </span>
      </div>
      <div style={{ position: 'relative', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, height: 6, marginBottom: missingEssential > 0 ? 12 : 0 }}>
        <div style={{ position: 'absolute', left: `${requiredPct * 100}%`, top: -2, bottom: -2, width: 2, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2, zIndex: 2 }} />
        <div
          style={{
            height: '100%',
            width: `${pct * 100}%`,
            backgroundColor: requirementsMet ? '#4ADE80' : '#FBBF24',
            borderRadius: 999,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
      {missingEssential > 0 && (
        <div style={{ color: '#FBBF24', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.9 }}>
          <Star size={14} fill="#FBBF24" />
          <span>Noch {missingEssential} essenzielle{missingEssential === 1 ? 'r' : ''} Hinweis{missingEssential !== 1 ? 'e' : ''} benötigt.</span>
        </div>
      )}
    </div>
  );
}

function SearchWidget() {
  return (
    <Link to="/browser" style={{ textDecoration: 'none' }}>
      <div className="search-widget" style={{
        margin: '0 24px 24px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '32px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
      }}>
        <Globe color="#5f6368" size={24} />
        <span style={{ flex: 1, color: '#5f6368', fontSize: '16px', fontWeight: '500' }}>Suche...</span>
        <Mic color="#5f6368" size={20} />
        <ScanLine color="#5f6368" size={20} />
      </div>
    </Link>
  );
}

function ClueJournalWidget() {
  const clues = useClueStore(s => s.clues);
  
  const allClues = Object.entries(CLUE_REGISTRY)
    .filter(([_, template]) => template.category !== 'games')
    .map(([id, template]) => ({
      id,
      template,
      isFound: !!clues[id],
      isRequired: COMPLETION_REQUIREMENTS.requiredClues.includes(id),
      data: clues[id]
    }))
    .sort((a, b) => {
      // 1. Essenzielle immer vor den anderen
      if (a.isRequired && !b.isRequired) return -1;
      if (!a.isRequired && b.isRequired) return 1;

      // 2. Gefundene vor noch fehlenden (innerhalb der gleichen Gruppe)
      if (a.isFound && !b.isFound) return -1;
      if (!a.isFound && b.isFound) return 1;

      // 3. Wenn beide gefunden wurden, sortiere nach Zeitstempel
      if (a.isFound && b.isFound) return b.data.discoveredAt - a.data.discoveredAt;

      return 0;
    });

  const foundCount = allClues.filter(c => c.isFound).length;

  return (
    <div 
      style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', minHeight: 0, touchAction: 'pan-x pan-y' }} 
      className="hide-scrollbar clue-journal-scroll-container"
    >
      <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{foundCount} von {allClues.length} gefunden</span>
        {foundCount === 0 && (
          <Link to="/briefing" style={{ color: '#4ADE80', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Info size={12} /> Briefing
          </Link>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {allClues.map((item, i) => {
            if (item.isFound) {
              const clue = item.data;
              return (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  alignItems: 'flex-start',
                  paddingBottom: i !== allClues.length - 1 ? '16px' : 0,
                  borderBottom: i !== allClues.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}>
                  <div style={{ color: item.isRequired ? '#FBBF24' : '#4ADE80', marginTop: '2px', flexShrink: 0 }}>
                    {item.isRequired ? <Star size={18} fill="#FBBF24" /> : <CheckCircle2 size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: item.isRequired ? '#FBBF24' : '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {CATEGORY_LABELS[clue.category]}
                      </span>
                      <span style={{ fontSize: '11px', opacity: 0.5 }}>
                        {new Date(clue.discoveredAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px', color: '#fff' }}>{clue.title}</div>
                    <div style={{ fontSize: '13px', opacity: 0.7, lineHeight: 1.4 }}>{clue.content}</div>
                  </div>
                </div>
              );
            } else {
              const appName = appsById[item.template.sourceApp]?.name || item.template.sourceApp;
              return (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  alignItems: 'center',
                  opacity: 0.6,
                  paddingBottom: i !== allClues.length - 1 ? '16px' : 0,
                  borderBottom: i !== allClues.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}>
                  <div style={{ color: '#9aa0a6', flexShrink: 0 }}>
                    <Lock size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {CATEGORY_LABELS[item.template.category as keyof typeof CATEGORY_LABELS]}
                      </span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#9aa0a6' }}>Verschlüsselte Daten</div>
                    <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Search size={10} /> Spur verborgen in: {appName}
                    </div>
                  </div>
                  {item.isRequired && (
                    <div style={{ fontSize: '10px', backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>WICHTIG</div>
                  )}
                </div>
              );
            }
          })}
      </div>
      
      {(() => {
        const gameClues = Object.entries(CLUE_REGISTRY).filter(([_, template]) => template.category === 'games');
        const foundGames = gameClues.filter(([id]) => clues[id]).length;
        return (
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.6 }}>
            <Gamepad2 size={16} />
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{foundGames} von {gameClues.length} Minispielen entdeckt</span>
          </div>
        );
      })()}
    </div>
  );
}

function AppIcon({ app, size }: { app: AppDef; size?: number }) {
  return (
    <Link to={app.route} className="app-icon-container">
      <motion.div 
        className="app-icon" 
        style={{ backgroundColor: app.color }} 
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
      >
        <app.icon color="white" size={size} />
      </motion.div>
      <div className="app-label">{app.name}</div>
    </Link>
  );
}

function AppRow({ ids }: { ids: string[] }) {
  return (
    <>
      {ids.map(id => appsById[id] && <AppIcon key={id} app={appsById[id]} />)}
    </>
  );
}

export function Launcher() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageIndex, setPageIndex] = useState(1);

  const scrollToJournal = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, []);
  const [showArrow, setShowArrow] = useState(true);
  const scrollTimeout = useRef<any>(null);

  // Compact = small screen: only 1 row of apps on home, no second "Kommunikation" row
  const isCompact = useMediaQuery('(max-height: 720px), (max-width: 360px)');

  // Instantly scroll to the center page on mount
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = 'auto';
      scrollRef.current.scrollLeft = scrollRef.current.clientWidth;
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.style.scrollBehavior = 'smooth';
      }, 50);
    }
  }, []);

  const location = useLocation();
  const [canAnimate, setCanAnimate] = useState(() => !location.state?.openNotifications);

  useEffect(() => {
    if (canAnimate) return;
    const check = () => setCanAnimate(true);
    window.addEventListener('notifications-closed', check);
    return () => window.removeEventListener('notifications-closed', check);
  }, [canAnimate]);

  // One-time page hint: fully show journal page (page 0), then snap back to home
  useEffect(() => {
    if (!canAnimate) return;
    const KEY = 'escape_homescreen_animated';
    if (localStorage.getItem(KEY)) return;
    localStorage.setItem(KEY, '1');
    // Wait for layout + smooth behaviour to settle
    const t1 = setTimeout(() => {
      if (!scrollRef.current) return;
      // Scroll fully to page 0 (journal)
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      const t2 = setTimeout(() => {
        if (!scrollRef.current) return;
        // Scroll back to home (page 1)
        scrollRef.current.scrollTo({ left: scrollRef.current.clientWidth, behavior: 'smooth' });
      }, 1400);
      return () => clearTimeout(t2);
    }, 800);
    return () => clearTimeout(t1);
  }, [canAnimate]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollX = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const idx = Math.round(scrollX / width);
      setPageIndex(idx);

      setShowArrow(false);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setShowArrow(true);
      }, 1000);
    }
  };

  // Swipe Up detection using native touch events
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target && target.closest('.clue-journal-scroll-container')) {
      return;
    }
    const touchEndY = e.changedTouches[0].clientY;
    if (touchStartY.current - touchEndY > 50) { 
      setDrawerOpen(true);
    }
  };

  return (
    <motion.div 
      className="launcher-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', position: 'relative', height: '100%', overflow: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Paginated Native CSS Homescreens */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="hide-scrollbar launcher-pages"
          style={{ 
            display: 'flex', width: '100%', height: '100%', paddingTop: '64px',
            overflowX: 'auto', overflowY: 'hidden',
            scrollSnapType: 'x mandatory', touchAction: 'pan-x'
          }}
        >
          {/* Page 0: Journal + Progress */}
          <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', scrollSnapStop: 'always', padding: '0 24px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <ClueProgressWidget onScrollToJournal={() => {}} />
            <div style={{ backgroundColor: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '24px', color: 'white', flex: 1, marginBottom: '24px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)', minHeight: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontWeight: 500, margin: 0, fontSize: '20px' }}>Journal</h2>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.8)' }}>
                  Beweise
                </div>
              </div>
              
              <ClueJournalWidget />
            </div>
          </div>

          {/* Page 1: Main Home — thematic pattern */}
          <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', scrollSnapStop: 'always', display: 'flex', flexDirection: 'column' }}>
            <ClockWidget />
            <SearchWidget />
            <div className="app-grid" style={{ paddingTop: 0 }}>
              <AppRow ids={HOME_ROW_INVESTIGATION} />
              {!isCompact && <AppRow ids={HOME_ROW_COMMUNICATION} />}
            </div>
          </div>

          {/* Page 2: Daily + Tools */}
          <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', scrollSnapStop: 'always', display: 'flex', flexDirection: 'column' }}>
            <div className="app-grid" style={{ paddingTop: '24px' }}>
              <AppRow ids={PAGE2_ROW_DAILY} />
              <AppRow ids={PAGE2_ROW_TOOLS} />
            </div>
          </div>
        </div>
      </div>

      {/* Page Indicators / Drawer Arrow */}
      <div style={{ height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '8px' }}>
        <AnimatePresence mode="wait">
          {showArrow ? (
            <motion.div
              key="arrow"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <ChevronUp color="rgba(255,255,255,0.7)" size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="dots"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: '8px' }}
            >
              {[0, 1, 2].map(idx => (
                <div 
                  key={idx}
                  style={{ 
                    width: '6px', height: '6px', borderRadius: '50%', 
                    backgroundColor: pageIndex === idx ? 'white' : 'rgba(255,255,255,0.4)',
                    transition: 'background-color 0.3s'
                  }} 
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dock */}
      <div className="dock" style={{ padding: '0 16px 24px', display: 'flex', justifyContent: 'space-around', position: 'relative', zIndex: 10 }} onTouchStart={(e) => e.stopPropagation()}>
        {dockApps.map((app) => (
          <Link key={app.id} to={app.route} className="app-icon-container" style={{ margin: 0 }}>
            <motion.div 
              className="app-icon" 
              style={{ backgroundColor: app.color }} 
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
            >
              <app.icon color="white" size={28} />
            </motion.div>
          </Link>
        ))}
      </div>

      {/* App Drawer — grouped by theme */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 50 || info.velocity.y > 200) {
                setDrawerOpen(false);
              }
            }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
              zIndex: 50, display: 'flex', flexDirection: 'column', touchAction: 'none'
            }}
          >
            <div style={{ paddingTop: '40px', paddingBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <ChevronDown 
                color="white" 
                size={32} 
                onClick={() => setDrawerOpen(false)} 
                style={{ cursor: 'pointer' }}
              />
            </div>
            <div style={{ padding: '0 16px 16px', color: 'white', fontWeight: '500', fontSize: '18px', textAlign: 'center' }}>
              Alle Apps
            </div>
            <div 
              className="app-grid" 
              style={{ alignContent: 'start', overflowY: 'auto', paddingBottom: '100px', touchAction: 'pan-y' }}
            >
              {APP_GROUPS.map((ids, i) => (
                <AppRow key={i} ids={ids} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
