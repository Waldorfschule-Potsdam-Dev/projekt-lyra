import { useState, useEffect, useRef } from 'react';
import { Menu, ChevronDown, Play, Code } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function App() {
  const [showImprint, setShowImprint] = useState(false);
  const [showBottomCta, setShowBottomCta] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [trailerPlaying, setTrailerPlaying] = useState(false);
  const trailerRef = useRef<HTMLVideoElement>(null);

  const handlePlayTrailer = () => {
    setTrailerPlaying(true);
    if (trailerRef.current) {
      trailerRef.current.play();
    }
  };

  const galleryRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [xRange, setXRange] = useState(0);
  const [xStart, setXStart] = useState(0);
  const [xEnd, setXEnd] = useState(0);

  const { scrollYProgress } = useScroll({
    target: galleryRef,
  });

  useEffect(() => {
    const updateRange = () => {
      if (trackRef.current) {
        const scrollWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const isMobile = viewportWidth <= 768;
        
        const firstItem = trackRef.current.firstElementChild as HTMLElement;
        const lastItem = trackRef.current.lastElementChild as HTMLElement;
        const firstW = firstItem ? firstItem.offsetWidth : 300;
        const lastW = lastItem ? lastItem.offsetWidth : 300;

        const offsetDesktop = viewportWidth * 0.15; // Shift by 15vw on desktop

        const startPx = isMobile 
          ? (viewportWidth / 2) - (firstW / 2)
          : (viewportWidth / 2) - (firstW / 2) - offsetDesktop;

        const endPx = isMobile
          ? (viewportWidth / 2) - scrollWidth + (lastW / 2)
          : (viewportWidth / 2) - scrollWidth + (lastW / 2) + offsetDesktop;
        
        setXStart(startPx);
        setXEnd(endPx);
        setXRange(startPx - endPx);
      }
    };
    // Ensure fonts and images are loaded before calculating width
    updateRange();
    setTimeout(updateRange, 500); 
    
    window.addEventListener("resize", updateRange);
    return () => window.removeEventListener("resize", updateRange);
  }, []);

  const galleryX = useTransform(scrollYProgress, [0, 1], [`${xStart}px`, `${xEnd}px`]);

  useEffect(() => {
    const handleScroll = () => {
      const story = document.getElementById('story');
      if (!story) return;
      
      const rect = story.getBoundingClientRect();
      setShowBottomCta(rect.top < window.innerHeight / 2);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || showImprint ? 'hidden' : '';
    document.body.classList.toggle('menu-open', mobileMenuOpen);
    document.body.classList.toggle('modal-open', showImprint);
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
      document.body.classList.remove('modal-open');
    };
  }, [mobileMenuOpen, showImprint]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const touchPanRef = useRef<{ startX: number; startY: number; startScrollY: number } | null>(null);

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    touchPanRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      startScrollY: window.scrollY,
    };
  };

  const handleGalleryTouchMove = (e: React.TouchEvent) => {
    if (!touchPanRef.current) return;
    const dx = e.touches[0].clientX - touchPanRef.current.startX;
    const dy = e.touches[0].clientY - touchPanRef.current.startY;
    // Only hijack clearly horizontal swipes
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      e.preventDefault();
      // Map horizontal delta → vertical scroll (inverted: swipe left = scroll down)
      window.scrollTo({ top: touchPanRef.current.startScrollY - dx * 2.5 });
    }
  };

  const handleGalleryTouchEnd = () => {
    touchPanRef.current = null;
  };

  const scrollToStory = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const storyEl = document.getElementById('story');
    if (storyEl) {
      storyEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="site-header">
        <div className="header-inner">
          <h1 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ cursor: 'pointer' }}
          >
            Projekt Lyra
          </h1>
          <nav className="sidebar-nav">
            <a href="#story">Story</a>
            <a href="#features">Features</a>
            <a href="#about">Über uns</a>
            <a href="#trailer">Trailer</a>
            <a href="#sources">Quellen</a>
            <a href="https://github.com/waldorfschule-potsdam-dev/projekt-lyra" target="_blank" rel="noreferrer" title="Quellcode auf GitHub ansehen">
              <Code size={18} style={{ display: 'inline', verticalAlign: 'text-bottom' }} />
            </a>
          </nav>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menü öffnen"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={18} strokeWidth={2.25} />
          </button>
        </div>
      </header>

      <div className="landing-container">
        <main>
        {/* HERO SECTION - Wichtig für den ersten Eindruck und CTA */}
        <section id="hero">
          <h2>Kannst du das Geheimnis lüften?</h2>
          <p>
            Du hast ein Smartphone gefunden. Es gehört Daniel.
            Bist du schlau genug, sein Geheimnis zu lüften?
          </p>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <a 
              href="https://play.projekt-lyra.de/briefing" 
              className="cta-button"
              onClick={() => typeof window !== 'undefined' && (window as any).umami?.track('play_clicked', { location: 'hero' })}
            >
              Jetzt spielen
            </a>
          </div>
        </section>

        {/* STICKY HORIZONTAL SCROLL GALLERY */}
        <div ref={galleryRef} className="gallery-wrapper" style={{ height: `calc(100vh + ${xRange * 1.5}px)` }}>
          <div
            className="gallery-sticky-container"
            onTouchStart={handleGalleryTouchStart}
            onTouchMove={handleGalleryTouchMove}
            onTouchEnd={handleGalleryTouchEnd}
          >
            <motion.div className="gallery-track" ref={trackRef} style={{ x: galleryX }}>
              <div className="gallery-item">
                <img src="https://cdn.hackclub.com/019f52cc-96bb-74db-8500-238e112dc092/home.jpg" alt="Home Screen" loading="lazy" />
              </div>
              <div className="gallery-item">
                <img src="https://cdn.hackclub.com/019f52cc-9f76-7dc0-98f8-64251dcd094a/wazaaah.jpg" alt="Wazaaah Messenger" loading="lazy" />
              </div>
              <div className="gallery-item">
                <img src="https://cdn.hackclub.com/019f52cc-9a51-7174-8546-c868bdd1d963/messages.jpg" alt="Messages App" loading="lazy" />
              </div>
              <div className="gallery-item">
                <img src="https://cdn.hackclub.com/019f52cc-9d94-785c-a1f8-2c063a6523f1/photos.jpg" alt="Photo Gallery" loading="lazy" />
              </div>
              <div className="gallery-item">
                <img src="https://cdn.hackclub.com/019f52cc-950c-702d-964a-08c3a2df97a1/fitness.jpg" alt="Fitness App" loading="lazy" />
              </div>
              <div className="gallery-item">
                <img src="https://cdn.hackclub.com/019f52cc-98aa-7fc5-bbeb-944b51b922b6/maps.jpg" alt="Maps App" loading="lazy" />
              </div>
              <div className="gallery-item">
                <img src="https://cdn.hackclub.com/019f52cc-9bde-79e8-83a5-389b64bbffaf/news.jpg" alt="News App" loading="lazy" />
              </div>
              <div className="gallery-item">
                <img src="https://cdn.hackclub.com/019f52cc-938b-7c44-9239-427f5234551d/browser.jpg" alt="Browser" loading="lazy" />
              </div>
            </motion.div>
          </div>
        </div>

        <section id="story">
          <h2>Die Geschichte</h2>
          <p>
            Du findest ein fremdes Smartphone. Es gehört Daniel, einem Mann mit scheinbar tiefen Verbindungen in Regierungskreise. 
          </p>
          <p>
            Du erhältst Vollzugriff auf sein Betriebssystem. Durchsuche seine Mails, durchforste die Galerie und knacke Passwörter, um versteckte Hinweise zu finden. Jede App auf diesem Telefon könnte der Schlüssel zur Lösung sein. Kannst du das Geheimnis um das mysteriöse „Projekt Lyra“ lüften?
          </p>
          <div className="hide-on-mobile" style={{ marginTop: 'var(--space-6)' }}>
            <a 
              href="https://play.projekt-lyra.de/briefing" 
              className="cta-button"
              onClick={() => typeof window !== 'undefined' && (window as any).umami?.track('play_clicked', { location: 'story' })}
            >
              Jetzt spielen
            </a>
          </div>
        </section>

        {/* FEATURES SECTION - SEO Keywords */}
        <section id="features">
          <h2>Was dich erwartet</h2>
          <ul>
            <li>Ein vollständiges Smartphone</li>
            <li>Knifflige Rätsel und versteckte Hinweise</li>
            <li>Integrierte Minispiele und geheime Apps</li>
            <li>Eine packende Verschwörungs-Story</li>
          </ul>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="about-section">
          <h2>Über uns</h2>
          <p>
            Dieses Spiel entstand im Rahmen einer Projektwoche der             <a
              href="https://www.waldorfschule-potsdam.de"
              target="_blank"
              rel="noreferrer"
            >
              <strong>Waldorfschule Potsdam</strong>
            </a>
            {" "}zum Thema „Game erstellen mit KI“.
          </p>
          <p>
            Innerhalb von nur einer Woche haben 15 Schülerinnen und Schüler der Klassen 7 bis 12 dieses komplette Browser-Spiel von der ersten Idee bis zum finalen Code entwickelt. Komplett kostenlos, werbefrei und aus Leidenschaft an der Technik.
          </p>
          <p>
            Bei weiterem Interesse an dem Projekt, Fragen oder Anregungen schreibe uns gerne eine Mail an <a href="mailto:chatwithsteiner@mail.de">chatwithsteiner@mail.de</a>.
          </p>
        </section>

        {/* TRAILER SECTION */}
        <section id="trailer">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h2 style={{ marginBottom: 'var(--space-5)' }}>Trailer</h2>
          </div>

          <div style={{ 
            borderRadius: 'var(--radius-xl)', 
            padding: '2px',
            background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.4) 0%, rgba(107, 33, 168, 0.05) 100%)',
            boxShadow: '0 12px 40px rgba(168, 85, 247, 0.2)', 
            position: 'relative'
          }}>
            <div 
              style={{
                borderRadius: 'calc(var(--radius-xl) - 2px)',
                overflow: 'hidden',
                background: '#08080d',
                display: 'flex',
                position: 'relative',
                cursor: trailerPlaying ? 'default' : 'pointer'
              }}
              onClick={!trailerPlaying ? handlePlayTrailer : undefined}
            >
              {!trailerPlaying && (
                <div className="trailer-play-overlay">
                  <span style={{ 
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    display: 'inline-block',
                    background: 'rgba(168, 85, 247, 0.15)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    color: 'var(--accent-bright)',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    border: '1px solid var(--accent-dim)'
                  }}>
                    KI-generiert
                  </span>
                  <div className="play-button-glass">
                    <Play size={36} fill="var(--accent-bright)" color="var(--accent-bright)" style={{ marginLeft: '4px' }} />
                  </div>
                </div>
              )}
              <video 
                ref={trailerRef}
                poster="https://cdn.hackclub.com/019f52de-5fa4-7fa7-8bb6-734a8eaf3c67/poster.jpg"
                controls={false}
                controlsList="nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
                onPause={() => setTrailerPlaying(false)}
                onPlay={() => setTrailerPlaying(true)}
                style={{ 
                  width: '100%', 
                  display: 'block',
                  opacity: trailerPlaying ? 1 : 0.65,
                  filter: trailerPlaying ? 'none' : 'grayscale(30%)',
                  transition: 'opacity 0.4s ease, filter 0.4s ease'
                }}
                preload="metadata"
                playsInline
                onClick={() => {
                  if (!trailerPlaying) handlePlayTrailer();
                  else {
                    if (trailerRef.current) {
                      trailerRef.current.pause();
                      setTrailerPlaying(false);
                    }
                  }
                }}
              >
                <source src="https://cdn.hackclub.com/019f52bd-5ad4-70c6-8178-66c40dd110cf/Projekt-Lyra_Trailer.mp4" type="video/mp4" />
                Dein Browser unterstützt dieses Video nicht.
              </video>
            </div>
          </div>
        </section>

        {/* SOURCES SECTION - Daten- und Asset-Quellen */}
        <section id="sources">
          <h2>Quellen &amp; Daten</h2>
          <p className="sources-intro">
            Für die Kartenmaterial- und Geodaten-Funktion der Maps-App sowie für Bilder,
            Musik und Icons im Spiel nutzen wir ausschließlich frei lizenzierte oder
            offene Quellen:
          </p>
          <ul className="sources-list">
            <li>
              <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer">OpenStreetMap</a>
              {' '} / {' '}
              <a href="https://nominatim.openstreetmap.org" target="_blank" rel="noreferrer">Nominatim</a>
              {' '}für Karten und Adress-Suche
            </li>
            <li>
              <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a>
              {' '}für das Satelliten-Kartenmaterial
            </li>
            <li>
              <a href="https://picsum.photos" target="_blank" rel="noreferrer">Lorem Picsum</a>
              {' '}für generische UI-Platzhalterbilder
            </li>
            <li>
              <a href="https://archive.org" target="_blank" rel="noreferrer">Internet Archive</a>
              {' '}für die „Synthwave Dreams" und „ChillPills" Musiksammlungen (CC-BY)
            </li>
            <li>
              <a href="https://lucide.dev" target="_blank" rel="noreferrer">Lucide Icons</a>
              {' ('}
              <a href="https://github.com/lucide-icons/lucide/blob/main/LICENSE" target="_blank" rel="noreferrer">MIT-Lizenz</a>
              {') & '}
              <a href="https://fonts.google.com" target="_blank" rel="noreferrer">Google Fonts</a>
            </li>
          </ul>
        </section>

        {/* FOOTER & IMPRESSUM */}
        <footer>
          <button onClick={() => setShowImprint(true)}>
            Impressum & Rechtliches
          </button>
        </footer>
      </main>
      </div>

      {/* MOBILE BOTTOM BAR — only visible on mobile, follows while scrolling */}
      <div className="mobile-bottom-bar">
        {showBottomCta ? (
          <a
            href="https://play.projekt-lyra.de/briefing"
            className="cta-button bottom-bar-cta"
            onClick={() => typeof window !== 'undefined' && (window as any).umami?.track('play_clicked', { location: 'bottom_bar' })}
          >
            Jetzt spielen
          </a>
        ) : (
          <a
            href="#story"
            className="bottom-bar-learn-more"
            onClick={scrollToStory}
          >
            Mehr erfahren
            <ChevronDown size={16} strokeWidth={2.5} />
          </a>
        )}
        <button
          type="button"
          className="bottom-bar-menu"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Menü öffnen"
        >
          <Menu size={20} strokeWidth={2.25} />
        </button>
      </div>

      {/* MOBILE DRAWER */}
      <div
        className={`mobile-drawer${mobileMenuOpen ? ' is-open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className="drawer-nav">
          <a href="#story" onClick={closeMobileMenu}>Die Story</a>
          <a href="#features" onClick={closeMobileMenu}>Features</a>
          <a href="#about" onClick={closeMobileMenu}>Über uns</a>
          <a href="#trailer" onClick={closeMobileMenu}>Trailer</a>
          <a href="#sources" onClick={closeMobileMenu}>Quellen</a>
          <a href="https://github.com/waldorfschule-potsdam-dev/projekt-lyra" target="_blank" rel="noreferrer" onClick={closeMobileMenu}>
            <Code size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }} />
            Quellcode
          </a>
        </nav>
        <div className="drawer-footer">
          <a
            href="https://play.projekt-lyra.de/briefing"
            className="cta-button drawer-cta"
            onClick={() => {
              closeMobileMenu();
              if (typeof window !== 'undefined' && (window as any).umami) {
                (window as any).umami.track('play_clicked', { location: 'drawer' });
              }
            }}
          >
            Jetzt spielen
          </a>
          <button
            type="button"
            className="drawer-close"
            onClick={closeMobileMenu}
            aria-label="Menü schließen"
          >
            Schließen
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div
          className="drawer-backdrop"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {showImprint && (
        <div
          className="modal-overlay"
          onClick={() => setShowImprint(false)}
        >
          <div
            className="modal-content modal-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Impressum</h3>
            <p>
              Freie Waldorfschule Potsdam <br />
              Verantwortlich: Johan M. Grimsehl <br />
              <a href="https://www.waldorfschule-potsdam.de" target="_blank" rel="noreferrer">waldorfschule-potsdam.de</a> <br/>
              Erich-Weinert-Straße 5 <br />
              14478 Potsdam, DE <br />
              Kontakt: <a href="mailto:chatwithsteiner@mail.de">chatwithsteiner@mail.de</a>
            </p>
            <h3>Datenschutzerklärung</h3>
            <p>
              <strong>Hosting (Firebase):</strong> Diese Website und das Spiel werden über Firebase (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland) gehostet. Beim Aufruf der Seite werden technisch bedingt Verbindungsdaten inklusive Ihrer IP-Adresse an die Server des Hosters übertragen und dort kurzzeitig verarbeitet, um die Auslieferung und Sicherheit der Website zu gewährleisten.
            </p>
            <p>
              <strong>Analyse (Umami Cloud EU):</strong> Wir nutzen Umami Cloud EU (Umami Software, Inc.) zur datenschutzfreundlichen, anonymisierten Auswertung der Website-Aufrufe und des Spielfortschritts (z. B. gelöste Rätsel). Es werden keine Cookies gesetzt und keine personenbezogenen Daten (wie vollständige IP-Adressen) dauerhaft gespeichert oder zur Profilbildung genutzt.
            </p>
            <p>
              <strong>Content Delivery Network (Hack Club CDN):</strong> Zur schnellen und sicheren Auslieferung von Medieninhalten (wie Bildern und Videos) nutzen wir das Hack Club CDN. Dabei werden beim Abruf dieser Inhalte technische Verbindungsdaten inklusive Ihrer IP-Adresse an die Server des CDN-Anbieters übertragen.
            </p>
            <p>
              <strong>Lokaler Speicher (Local Storage):</strong> Das Escape-Game nutzt den lokalen Speicher (Local Storage) Ihres Browsers, um Ihren Spielstand (z. B. gelöste Rätsel, gefundene Hinweise) lokal auf Ihrem Gerät zu speichern. Diese Daten sind für die Funktion des Spiels zwingend erforderlich. Es werden hierbei keine Daten an unsere Server oder Dritte übertragen.
            </p>
            <button onClick={() => setShowImprint(false)}>Schließen</button>
          </div>
        </div>
      )}
    </>
  );
}
