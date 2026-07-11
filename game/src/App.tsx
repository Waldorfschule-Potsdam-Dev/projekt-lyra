import React, { Suspense, useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Launcher } from './launcher/Launcher';
import { Wifi, Signal, BatteryFull, Mail,  Settings, Plane, Flashlight, Square, Circle, Triangle, Download, Share, Share2, Newspaper } from 'lucide-react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { useInstallPrompt } from './components/useInstallPrompt';
import { InstallPromptNotification } from './components/InstallPromptNotification';
import BriefingSheet from './report/BriefingSheet';
import { ShareCard } from './components/ShareCard';
import  { Toaster } from 'react-hot-toast';
import { useRecents } from './store/recents';
import { useClock } from './store/clock';
import { formatPlaytime, getStartTime, getCompletionTime } from './report/storage';
import { useClueStore, CLUE_REGISTRY, COMPLETION_REQUIREMENTS } from './store/clues';

// --- Universal Top Bar & Notifications ---
function UniversalOverlay({ 
  isLauncher, 
  showNotifications, 
  setShowNotifications 
}: { 
  isLauncher?: boolean;
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
}) {
  const now = useClock((s) => s.now);
  const time = new Date(now);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const touchStartY = useRef(0);
  const { canInstall, isIOSPrompt, install, dismissed, isInstalled } = useInstallPrompt();
  const showInstallCard = (canInstall || isIOSPrompt) && !dismissed && !isInstalled;

  const clues = useClueStore(s => s.clues);
  const validIds = Object.keys(CLUE_REGISTRY).filter(id => CLUE_REGISTRY[id].category !== 'games');
  const found = validIds.filter(id => clues[id]).length;
  const totalRequired = COMPLETION_REQUIREMENTS.minClues;
  const missingEssential = COMPLETION_REQUIREMENTS.requiredClues.filter(id => !clues[id]).length;
  const requirementsMet = found >= totalRequired && missingEssential === 0;

  const statusTitle = "Missionsstatus &bull; Diagnose";
  const statusText = requirementsMet 
    ? "Übermittlung bereit. Berichtsbereich freigeschaltet." 
    : `${found} / ${validIds.length} Beweise gesichert.${missingEssential > 0 ? ' Essenzielle Spuren fehlen.' : ''}`;

  return (
    <>
      <div
        style={{ position: 'absolute', top: 'env(safe-area-inset-top, 0px)', left: 0, right: 0, height: '40px', zIndex: 3500, touchAction: 'none' }}
        onClick={() => setShowNotifications(!showNotifications)}
        onTouchStart={(e) => touchStartY.current = e.touches[0].clientY}
        onTouchEnd={(e) => {
          if (e.changedTouches[0].clientY - touchStartY.current > 30) {
            setShowNotifications(true);
          }
        }}
      />
      <div 
        className="status-bar" 
        style={{ zIndex: 3000, backgroundColor: isLauncher ? 'transparent' : '#111', color: 'white' }}
      >
        <div className="time" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          <Download
            size={14}
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(true);
            }}
            style={{
              cursor: showInstallCard && !showNotifications ? 'pointer' : 'default',
              color: 'white',
              display: showInstallCard && !showNotifications ? 'block' : 'none',
              marginLeft: '6px'
            }}
            aria-label="App installieren"
          />
          <span
            aria-hidden="true"
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: 'white',
              display: showNotifications ? 'none' : 'block',
              marginLeft: '6px'
            }}
          />
        </div>
        <div className="status-icons">
          <Wifi size={14} />
          <Signal size={14} />
          <BatteryFull size={14} />
        </div>
      </div>

      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.preventDefault();
              setShowNotifications(false);
            }}
            onTouchStart={(e) => touchStartY.current = e.touches[0].clientY}
            onTouchEnd={(e) => {
              if (e.changedTouches[0].clientY - touchStartY.current < -30) {
                setShowNotifications(false);
              }
            }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1500,
              touchAction: 'none'
            }}
          />
          <motion.div 
            initial={{ y: -800 }}
            animate={{ y: 0 }}
            exit={{ y: -800 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="notification-shade open"
            style={{ paddingTop: 'calc(40px + env(safe-area-inset-top, 0px))', touchAction: 'none', zIndex: 2000, display: 'flex', flexDirection: 'column' }}
            drag="y"
            dragConstraints={{ top: -1000, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, info) => {
              if (info.offset.y < -50 || info.velocity.y < -300) {
                setShowNotifications(false);
              }
            }}
          >
            {/* Quick Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px', padding: '0 8px' }}>
              <div onClick={()=> console.log("Wifi clicked") } style={{ backgroundColor: '#c7e7ff', color: '#000', padding: '16px 12px', borderRadius: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wifi size={20} />
                <span style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>WLAN-4F92xA</span>
              </div>
              <div onClick={()=> console.log("Signal clicked") } style={{ backgroundColor: '#c7e7ff', color: '#000', padding: '16px 12px', borderRadius: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Signal size={20} />
                <span style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Mobile Daten</span>
              </div>
              <div style={{ backgroundColor: '#303030', color: '#fff', padding: '16px 12px', borderRadius: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flashlight size={20} />
                <span style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Taschenlampe</span>
              </div>
              <div style={{ backgroundColor: '#303030', color: '#fff', padding: '16px 12px', borderRadius: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plane size={20} />
                <span style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Flugmodus</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
              <span style={{ fontWeight: 600, color: '#e3e3e3' }}>Benachrichtigungen</span>
              <Link to="/settings" onClick={() => setShowNotifications(false)} style={{ color: '#e3e3e3' }}>
                <Settings size={20} />
              </Link>
            </div>
            
            {/* Notifications */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 8px' }}>
              {showInstallCard && (
                <InstallPromptNotification
                  onInstall={async () => {
                    const result = await install();
                    if (result === 'ios-instructions') {
                      setShowNotifications(false);
                      setShowIOSModal(true);
                    } else if (result === 'accepted' || result === 'unavailable') {
                      setShowNotifications(false);
                    }
                  }}
                />
              )}
              {/* <Link to="/wazaaah" onClick={() => setShowNotifications(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ backgroundColor: '#303030', borderRadius: '24px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ backgroundColor: '#25D366', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                    <MessageCircle size={16} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#e3e3e3', fontSize: '15px' }}>Wazaaah &bull; Mama</div>
                    <div style={{ fontSize: '14px', color: '#a0a0a0', marginTop: '4px' }}>Wo bist du?? Melde dich sofort!</div>
                  </div>
                </div>
              </Link>
              
              <Link to="/mail" onClick={() => setShowNotifications(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ backgroundColor: '#303030', borderRadius: '24px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ backgroundColor: '#EA4335', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                    <Mail size={16} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#e3e3e3', fontSize: '15px' }}>YMail &bull; Unbekannter Absender</div>
                    <div style={{ fontSize: '14px', color: '#a0a0a0', marginTop: '4px' }}>Wichtige Dokumente im Anhang.</div>
                  </div>
                </div>
              </Link> */}

              {!clues['news:dr-vollmer'] && (
                <Link to="/news/artikel/1" onClick={() => setShowNotifications(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ backgroundColor: '#303030', borderRadius: '24px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ backgroundColor: '#FF6B35', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                      <Newspaper size={16} color="white" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#e3e3e3', fontSize: '15px' }}>Eilmeldung &bull; Neuigkeiten</div>
                      <div style={{ fontSize: '14px', color: '#a0a0a0', marginTop: '4px' }}>HORIZONT 4.2: Neue Prognoseplattform veröffentlicht</div>
                    </div>
                  </div>
                </Link>
              )}

              <Link to="/report" onClick={() => setShowNotifications(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ backgroundColor: '#303030', borderRadius: '24px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ backgroundColor: requirementsMet ? '#0B8043' : '#5f6368', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                    <Settings size={16} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: requirementsMet ? '#4ADE80' : '#e3e3e3', fontSize: '15px' }} dangerouslySetInnerHTML={{ __html: statusTitle }} />
                    <div style={{ fontSize: '14px', color: requirementsMet ? '#a8d5b8' : '#a0a0a0', marginTop: '4px' }}>{statusText}</div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Swipe handle replaced with click-to-close button */}
            <div onClick={() => setShowNotifications(false)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', marginTop: '16px', paddingBottom: '16px' }}>
              <div style={{ width: '40px', height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              touchAction: 'none'
            }}
            onClick={() => setShowIOSModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                backgroundColor: '#1c1c1e',
                borderRadius: '24px',
                padding: '32px 24px',
                maxWidth: '400px',
                width: '100%',
                color: 'white',
                textAlign: 'center',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                border: '1px solid #333'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ backgroundColor: '#7e14ff', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Download size={32} color="white" />
              </div>
              <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 600 }}>App installieren</h2>
              <p style={{ margin: '0 0 24px', fontSize: '15px', color: '#a0a0a0', lineHeight: 1.5 }}>
                Um Projekt Lyra als Vollbild-App zu nutzen, befolge diese zwei Schritte:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#2c2c2e', padding: '16px', borderRadius: '16px' }}>
                  <div style={{ backgroundColor: '#444', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold' }}>1</div>
                  <div style={{ fontSize: '15px' }}>Tippe in der Safari-Leiste auf das <b>Teilen-Symbol</b> <Share size={16} style={{ verticalAlign: 'middle', margin: '0 4px', display: 'inline-block' }} /></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#2c2c2e', padding: '16px', borderRadius: '16px' }}>
                  <div style={{ backgroundColor: '#444', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold' }}>2</div>
                  <div style={{ fontSize: '15px' }}>Wähle <b>"Zum Home-Bildschirm"</b> und bestätige.</div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                style={{
                  backgroundColor: '#7e14ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  width: '100%',
                  cursor: 'pointer'
                }}
              >
                Verstanden
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// App Wrapper
const AppWrapper = ({ children, appName, color }: { children: React.ReactNode, appName: string, color: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="app-container"
      style={{ backgroundColor: color }}
    >
      <div style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <ErrorBoundary appName={appName}>
          <Suspense fallback={<div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>Lade {appName}...</div>}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </div>
    </motion.div>
  );
};

// Lazy load all team apps
const MailApp = React.lazy(() => import('./mail'));
const MapsApp = React.lazy(() => import('./maps'));
const BrowserApp = React.lazy(() => import('./browser'));
const WazaaahApp = React.lazy(() => import('./wazaaah'));
const SettingsApp = React.lazy(() => import('./settings'));
const NotesApp = React.lazy(() => import('./notes'));
const ClockApp = React.lazy(() => import('./clock'));
const CalendarApp = React.lazy(() => import('./calendar'));
const FilesApp = React.lazy(() => import('./files'));
const MessagesApp = React.lazy(() => import('./messages'));
const PhoneApp = React.lazy(() => import('./phone'));
const PhotosApp = React.lazy(() => import('./photos'));
const MusicaApp = React.lazy(() => import('./musica'));
const LumigramApp = React.lazy(() => import('./lumigram'));
const FitnessApp = React.lazy(() => import('./fitness'));
const GeometryApp = React.lazy(() => import('./geometry'));
const NewsApp = React.lazy(() => import('./news'));
const WalletApp = React.lazy(() => import('./wallet'));
const ReportApp = React.lazy(() => import('./report'));

// We need to import the dock apps and all apps for the overview mode
import { dockApps, allApps } from './launcher/Launcher';
import { useLocation } from 'react-router-dom';

type AppDef = (typeof allApps)[number];

function AppContent() {
  const [overviewMode, setOverviewMode] = useState(false);
  const [closingApp, setClosingApp] = useState(false);
  const [altEndingTriggered, setAltEndingTriggered] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 375, height: 812 });
  const routesContainerRef = useRef<HTMLDivElement>(null);
  const [isSharingAlt, setIsSharingAlt] = useState(false);
  const altShareRef = useRef<HTMLDivElement>(null);
  const [playtime, setPlaytime] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    if (location.state?.openNotifications) {
      setShowNotifications(true);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  useEffect(() => {
    if (showNotifications) {
      document.body.classList.add('notifications-open');
    } else {
      document.body.classList.remove('notifications-open');
      window.dispatchEvent(new Event('notifications-closed'));
    }
  }, [showNotifications]);

  useEffect(() => {
    if (altEndingTriggered) {
      const start = getStartTime();
      const end = getCompletionTime() ?? Date.now();
      if (start) {
        setPlaytime(formatPlaytime(end - start));
      }
    }
  }, [altEndingTriggered]);

  useEffect(() => {
    if (!localStorage.getItem('escape_start_time')) {
      localStorage.setItem('escape_start_time', Date.now().toString());
    }

    const handler = () => {
      setAltEndingTriggered(true);
      if (typeof window !== 'undefined' && (window as any).umami) {
        const startTime = localStorage.getItem('escape_start_time') || Date.now().toString();
        const minutesPlayed = Math.floor((Date.now() - parseInt(startTime)) / 60000);
        (window as any).umami.track('ending_triggered', { type: 'sellout', minutesPlayed });
      }
    };
    window.addEventListener('trigger-alt-ending', handler);
    return () => window.removeEventListener('trigger-alt-ending', handler);
  }, []);
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();
  const recents = useRecents((s) => s.recents);
  const pushRecent = useRecents((s) => s.push);
  const removeRecent = useRecents((s) => s.removeById);

  const toggleOverview = () => {
    if (!overviewMode) {
      if (routesContainerRef.current) {
        setContainerSize({
          width: routesContainerRef.current.offsetWidth,
          height: routesContainerRef.current.offsetHeight,
        });
      }
      setOverviewMode(true);
    } else {
      setOverviewMode(false);
    }
  };

  const handleShareAlt = async () => {
    if (!altShareRef.current || isSharingAlt) return;
    
    try {
      setIsSharingAlt(true);
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(altShareRef.current, {
        backgroundColor: '#050505',
        scale: 1, 
        logging: false,
        useCORS: true,
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharingAlt(false);
          return;
        }
        
        const file = new File([blob], 'projekt-lyra-schweigegeld.png', { type: 'image/png' });
        
        const shareData = {
          title: 'Projekt Lyra',
          text: `Ich habe Projekt Lyra auf die "Geld-Weise" in ${playtime || 'kurzer Zeit'} beendet. 🤫`,
          url: 'https://projekt-lyra.de',
          files: [file],
        };
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share(shareData);
          } catch (e) {
            console.error('Sharing cancelled or failed', e);
          }
        } else if (navigator.share) {
          try {
            await navigator.share({ title: shareData.title, text: shareData.text, url: shareData.url });
          } catch (e) {
            console.error('Sharing cancelled or failed', e);
          }
        } else {
          try {
            await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\nhttps://projekt-lyra.de`);
            alert('Teilen-Funktion nicht verfügbar. Text und Link wurden kopiert!');
          } catch (e) {
            alert('Teilen auf diesem Gerät nicht möglich.');
          }
        }
        setIsSharingAlt(false);
      }, 'image/png');
    } catch (err) {
      console.error('Share failed', err);
      setIsSharingAlt(false);
    }
  };

  // Sync route with dashboard parent iframe
  useEffect(() => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'ESCAPE_PATH_CHANGE', path: location.pathname }, '*');
    }
  }, [location.pathname]);

  // Listen to navigation commands from dashboard parent iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ESCAPE_NAVIGATE') {
        navigate(event.data.path);
      } else if (event.data && event.data.type === 'ESCAPE_RELOAD') {
        window.location.reload();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  // Find the currently active app (if any)
  const currentApp = allApps.find(app => location.pathname.startsWith(app.route));
  const isLauncher = location.pathname === '/';

  // Track route changes into the recents list. Deduped by app id so each
  // app appears at most once; the most recent path wins and moves the
  // entry to the front of the list.
  useEffect(() => {
    if (currentApp) {
      pushRecent({ id: currentApp.id, path: location.pathname });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentApp?.id, location.pathname]);

  // Routes definition — used in both normal and overview (preview slide) modes
  const routesContent = (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Launcher />} />
        <Route path="/mail/*" element={<AppWrapper appName="YMail" color="#EA4335"><MailApp /></AppWrapper>} />
        <Route path="/maps/*" element={<AppWrapper appName="Maps" color="#34A853"><MapsApp /></AppWrapper>} />
        <Route path="/browser/*" element={<AppWrapper appName="Browser" color="#FBBC05"><BrowserApp /></AppWrapper>} />
        <Route path="/wazaaah/*" element={<AppWrapper appName="Wazaaah" color="#25D366"><WazaaahApp /></AppWrapper>} />
        <Route path="/settings/*" element={<AppWrapper appName="Einstellungen" color="#80868B"><SettingsApp /></AppWrapper>} />
        <Route path="/notes/*" element={<AppWrapper appName="Notizen" color="#FDE293"><NotesApp /></AppWrapper>} />
        <Route path="/clock/*" element={<AppWrapper appName="Uhr" color="#8AB4F8"><ClockApp /></AppWrapper>} />
        <Route path="/calendar/*" element={<AppWrapper appName="Kalender" color="#4285F4"><CalendarApp /></AppWrapper>} />
        <Route path="/files/*" element={<AppWrapper appName="Dateien" color="#F29900"><FilesApp /></AppWrapper>} />
        <Route path="/messages/*" element={<AppWrapper appName="Nachrichten" color="#1A73E8"><MessagesApp /></AppWrapper>} />
        <Route path="/phone/*" element={<AppWrapper appName="Telefon" color="#34A853"><PhoneApp /></AppWrapper>} />
        <Route path="/photos/*" element={<AppWrapper appName="Fotos" color="#EA4335"><PhotosApp /></AppWrapper>} />
        <Route path="/musica/*" element={<AppWrapper appName="Musica" color="#1DB954"><MusicaApp /></AppWrapper>} />
        <Route path="/lumigram/*" element={<AppWrapper appName="Lumigram" color="#E1306C"><LumigramApp /></AppWrapper>} />
        <Route path="/fitness/*" element={<AppWrapper appName="Fitness" color="#FF5722"><FitnessApp /></AppWrapper>} />
        <Route path="/geometry/*" element={<AppWrapper appName="Square Jump" color="#8E44AD"><GeometryApp /></AppWrapper>} />
        <Route path="/news/*" element={<AppWrapper appName="Neuigkeiten" color="#FF6B35"><NewsApp /></AppWrapper>} />
        <Route path="/wallet/*" element={<AppWrapper appName="Wallet" color="#0B8043"><WalletApp /></AppWrapper>} />
        <Route path="/report/*" element={<AppWrapper appName="Sichere Übermittlung" color="#0B8043"><ReportApp /></AppWrapper>} />
        <Route path="/briefing" element={<BriefingSheet />} />
      </Routes>
    </AnimatePresence>
  );

  // Swipe-up on the current card: animate out, then drop from recents
  const handleCloseCurrent = () => {
    if (!currentApp) return;
    const idToClose = currentApp.id;
    setClosingApp(true);
    setTimeout(() => {
      const remaining = recents.filter((r) => r.id !== idToClose);
      removeRecent(idToClose);
      setResetting(true);
      if (remaining.length > 0) {
        navigate(remaining[0].path);
      } else {
        navigate('/');
        setOverviewMode(false);
      }
      setClosingApp(false);
      setTimeout(() => setResetting(false), 50);
    }, 280);
  };

  // Tap any card: exit overview and navigate to that path
  const handleTapCard = (path: string) => {
    setOverviewMode(false);
    navigate(path);
  };

  // Swipe-up on a non-current card: just drop it from recents
  const handleRemoveCard = (id: string) => {
    const remaining = recents.filter((r) => r.id !== id);
    removeRecent(id);
    if (remaining.length === 0) {
      setOverviewMode(false);
    }
  };

  return (
    <div className="device-screen" style={{ backgroundColor: overviewMode ? '#111' : '#000' }}>
      <UniversalOverlay 
        isLauncher={isLauncher} 
        showNotifications={showNotifications} 
        setShowNotifications={setShowNotifications} 
      />

      {/* Main content area: slider in overview, full Routes otherwise */}
      <div ref={routesContainerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence>
          {!overviewMode && (
            <motion.div 
              key="fullscreen-app"
              layoutId="app-view-container" 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                backgroundColor: '#fff',
                zIndex: 20
              }}
            >
              {routesContent}
            </motion.div>
          )}
        </AnimatePresence>

        {overviewMode && (
          <OverviewSlider
            recents={recents}
            currentPath={location.pathname}
            closingApp={closingApp}
            resetting={resetting}
            onExitOverview={() => setOverviewMode(false)}
            onCloseCurrent={handleCloseCurrent}
            onTapCard={handleTapCard}
            onRemoveCard={handleRemoveCard}
            containerSize={containerSize}
          >
            {routesContent}
          </OverviewSlider>
        )}
      </div>

      {/* Overview Mode Dock */}
      {overviewMode && (
        <div style={{ padding: '0 16px 24px', display: 'flex', justifyContent: 'space-around', position: 'relative', zIndex: 10 }}>
          {dockApps.map((app) => (
            <Link key={app.id} to={app.route} className="app-icon-container" onClick={() => setOverviewMode(false)} style={{ margin: 0 }}>
              <div className="app-icon" style={{ backgroundColor: app.color }}>
                <app.icon color="white" size={28} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Global 3-Button Navigation */}
      <div 
        className="nav-bar"
        style={{ 
          height: '48px', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
          flexShrink: 0
        }}
      >
        <div className="nav-btn" onClick={toggleOverview}>
          <Square size={20} color="#ffffff" fill="transparent" strokeWidth={2.5} />
        </div>
        <Routes>
          <Route path="*" element={
            <Link to="/" onClick={() => setOverviewMode(false)} className="nav-btn" style={{ textDecoration: 'none' }}>
              <Circle size={20} color="#ffffff" fill="transparent" strokeWidth={2.5} />
            </Link>
          } />
        </Routes>
        <Routes>
          <Route path="*" element={
            <NavBackButton onBack={() => setOverviewMode(false)} />
          } />
        </Routes>
      </div>

      <AnimatePresence>
        {altEndingTriggered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: '#0a0a0a', zIndex: 99999, color: 'white',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '24px', textAlign: 'center', touchAction: 'none'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#0a0a0a', padding: '24px' }}>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, duration: 1 }}>
                <div style={{ color: '#4ADE80', fontSize: '24px', marginBottom: '40px', fontWeight: 600 }}>
                  + 5.000.000,00 € in Wallet eingegangen
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3, duration: 1.5 }}>
                <h1 style={{ color: '#F87171', fontSize: '32px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>
                  Ende 2: Das Schweigegeld
                </h1>
                <div style={{ width: '60px', height: '2px', backgroundColor: '#F87171', margin: '0 auto 24px' }} />
                <p style={{ fontSize: '16px', lineHeight: 1.6, maxWidth: '400px', color: '#a0a0a0', margin: '0 auto 32px', textAlign: 'center' }}>
                  Du hast dich für das Geld entschieden. Die gesammelten Beweise wurden von deinen Geräten entfernt.<br /><br />
                  Die Wahrheit über das Projekt NORDLICHT wird niemals ans Licht kommen.<br /><br />
                  <span style={{ color: '#fff', fontWeight: 500 }}>War es das wert?</span>
                </p>
              </motion.div>
            </div>
              
              <button
                onClick={handleShareAlt}
                disabled={isSharingAlt}
                style={{
                  width: '100%',
                  maxWidth: '280px',
                  margin: '0 auto',
                  padding: '14px 18px',
                  backgroundColor: '#1c1d22',
                  color: '#e3e3e3',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 24,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: isSharingAlt ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: isSharingAlt ? 0.7 : 1,
                }}
              >
                <Share2 size={18} />
                {isSharingAlt ? 'Wird generiert...' : 'Ergebnis teilen'}
              </button>
            <ShareCard ref={altShareRef} type="alt" playtime={playtime || undefined} />
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster 
        position="top-center"
        containerStyle={{
          position: 'absolute',
          top: 'calc(40px + env(safe-area-inset-top, 0px))',
          left: 0,
          right: 0,
          zIndex: 4000,
        }}
        toastOptions={{
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
            maxWidth: 'none',
          },
        }}
      />
    </div>
  );
}

// Horizontal overview: a carousel of contained cards, one per recent path.
// The rightmost card is the most recent (the currently-open app when in an
// app) and renders a live preview. Older recents to the left show the app
// icon. Tap a card to navigate, swipe it up to remove it.
interface OverviewSliderProps {
  recents: Recent[];
  currentPath: string;
  closingApp: boolean;
  resetting: boolean;
  onExitOverview: () => void;
  onCloseCurrent: () => void;
  onTapCard: (path: string) => void;
  onRemoveCard: (id: string) => void;
  containerSize: { width: number; height: number };
  children: React.ReactNode;
}

function OverviewSlider({
  recents,
  currentPath,
  closingApp,
  resetting,
  onExitOverview,
  onCloseCurrent,
  onTapCard,
  onRemoveCard,
  containerSize,
  children,
}: OverviewSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  // By using direction: 'rtl' on the container, the first element is rendered 
  // on the far right, and scrollLeft=0 means we are looking at the right edge.
  // The 'recents' array has the newest app first (index 0). 
  // So it naturally renders the newest app on the right, fully visible immediately.
  const displayRecents = recents;

  if (recents.length === 0) {
    return (
      <div
        onClick={onExitOverview}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Keine offenen Apps
      </div>
    );
  }

  return (
    <div
      ref={sliderRef}
      className="hide-scrollbar"
      style={{
        flex: 1,
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '16px',
        gap: '12px',
        alignItems: 'center',
        justifyContent: recents.length === 1 ? 'center' : 'flex-start',
        touchAction: 'pan-x',
        direction: 'rtl',
      }}
    >
      {displayRecents.map((recent) => {
        const appDef = allApps.find((a) => a.id === recent.id);
        if (!appDef) return null;
        return (
          <OverviewCard
            key={recent.id}
            recent={recent}
            appDef={appDef}
            isCurrent={recent.path === currentPath}
            closingApp={closingApp}
            resetting={resetting}
            onTap={() => onTapCard(recent.path)}
            onRemove={() => onRemoveCard(recent.id)}
            onCloseCurrent={onCloseCurrent}
            containerSize={containerSize}
          >
            {children}
          </OverviewCard>
        );
      })}
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface OverviewCardProps {
  recent: Recent;
  appDef: AppDef;
  isCurrent: boolean;
  closingApp: boolean;
  resetting: boolean;
  onTap: () => void;
  onRemove: () => void;
  onCloseCurrent: () => void;
  containerSize: { width: number; height: number };
  children: React.ReactNode;
}

function ScaledAppWrapper({ children, originalSize }: { children: React.ReactNode, originalSize: { width: number, height: number } }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setScale(entry.contentRect.width / originalSize.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [originalSize.width]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          width: `${originalSize.width}px`,
          height: `${originalSize.height}px`,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function OverviewCard({
  appDef,
  isCurrent,
  closingApp,
  resetting,
  onTap,
  onRemove,
  onCloseCurrent,
  containerSize,
  children,
}: OverviewCardProps) {
  const Icon = appDef.icon;
  const cardBg = hexToRgba(appDef.color, 0.14);
  const cardBorder = hexToRgba(appDef.color, 0.32);

  // framer-motion drag handles the visual follow. On release, a strong upward
  // gesture (offset < -100px or velocity < -500) triggers the close; weak
  // gestures let dragSnapToOrigin snap the card back to its rest position.
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -100 || info.velocity.y < -500) {
      if (isCurrent) onCloseCurrent();
      else onRemove();
    }
  };

  return (
    <motion.div
      drag={closingApp ? false : 'y'}
      dragConstraints={{ top: -1000, bottom: 0 }}
      dragElastic={0.15}
      dragSnapToOrigin={true}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
      onDragEnd={handleDragEnd}
      onClick={onTap}
      animate={
        isCurrent
          ? {
              y: closingApp ? -1000 : 0,
              scale: closingApp ? 0.5 : 1,
              opacity: closingApp ? 0 : 1,
            }
          : { opacity: 1 }
      }
      transition={
        resetting
          ? { duration: 0 }
          : closingApp
            ? { duration: 0.28, ease: [0.4, 0, 0.2, 1] }
            : { type: 'spring', stiffness: 300, damping: 30 }
      }
      style={{
        flex: '0 0 70%',
        height: '82%',
        alignSelf: 'center',
        minWidth: '240px',
        maxWidth: '360px',
        borderRadius: '32px',
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        direction: 'ltr',
      }}
    >
      {/* Card header: app color bar with name + icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          backgroundColor: appDef.color,
        }}
      >
        <Icon size={14} color="white" />
        <span
          style={{
            color: 'white',
            fontSize: '13px',
            fontWeight: 500,
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {appDef.name}
        </span>
      </div>

      {/* Card body: live preview for the current app, icon for the rest */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#fff',
        }}
      >
        {isCurrent ? (
          <motion.div
            layoutId="app-view-container"
            style={{
              pointerEvents: 'none',
              width: '100%',
              height: '100%',
              backgroundColor: '#fff',
              overflow: 'hidden'
            }}
          >
            <ScaledAppWrapper originalSize={containerSize}>
              {children}
            </ScaledAppWrapper>
          </motion.div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                backgroundColor: appDef.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <Icon size={40} color="white" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// Separate component to hook into useNavigate inside BrowserRouter
function NavBackButton({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="nav-btn" onClick={() => { onBack(); navigate(-1); }}>
      <Triangle size={20} color="#ffffff" fill="transparent" strokeWidth={2.5} style={{ transform: 'rotate(-90deg)' }} />
    </div>
  );
}
