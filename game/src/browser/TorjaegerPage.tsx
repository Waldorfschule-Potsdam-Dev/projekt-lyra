import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { socialGlobalCss } from './SocialTheme';

export function TorjaegerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  const p1 = pathParts[2];
  const p2 = pathParts[3];

  const parsedNewsIdx = p1 === 'news' && p2 !== undefined ? Number(p2) : null;
  const parsedMatchIdx = p1 === 'match' && p2 !== undefined ? Number(p2) : null;

  const red = '#E2001A';
  const redDark = '#B30015';
  const bg = '#ffffff';
  const text = '#1a1a1a';
  const subtext = '#666';
  const border = '#e5e5e5';
  const subtleBg = '#f7f7f7';

  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  const news = [
    {
      tag: 'PROFILIGA', tagIcon: '⚽',
      title: 'Ruhrpott Gelb: Trainer T. vor Abschied — Gespräche mit Verein laufen',
      time: 'vor 12 Min',
      author: 'Stefan Bier',
      body: 'Die Gespräche zwischen Trainer T. und der Ruhrpott Gelb-Geschäftsführung sollen in den kommenden Tagen stattfinden. Nach Informationen unserer Redaktion ist eine Trennung am Ende der Saison sehr wahrscheinlich. Trainer T. war erst im Sommer 2022 zum Cheftrainer befördert worden, nachdem Trainer R. entlassen worden war.\n\nUnter Trainer T. erreichte der Ruhrpott Gelb 2023/24 das Finale der Champions League, unterlag dort allerdings Madrid Royal. In der laufenden Saison läuft es sportlich durchwachsen: Die Mannschaft steht aktuell auf Platz fünf, die erhoffte direkte Qualifikation für die Königsklasse ist in Gefahr.\n\nAls mögliche Nachfolger werden unter anderem Niko Kovač und Roger Schmidt gehandelt. Der Verein wollte sich zu den Spekulationen nicht äußern und verwies auf die laufende Saison.',
      comments: [
        { author: 'Werner K.', time: 'vor 8 Min', text: 'Wäre schade, Trainer T. hat hier gute Arbeit geleistet. Das CL-Finale war herausragend.' },
        { author: 'Anna M.', time: 'vor 5 Min', text: 'Zeit für einen Neuanfang. Die Mannschaft braucht frischen Wind.' },
        { author: 'Tobias S.', time: 'vor 2 Min', text: 'Ich traue Kovač den Job zu. Hat bei Mainhattan bewiesen, dass er eine Mannschaft strukturieren kann.' },
      ],
    },
    {
      tag: 'FC BAYERN', tagIcon: '🔴',
      title: 'München Rot verlängert mit Janis M. bis 2030',
      time: 'vor 38 Min',
      author: 'Anna Kraft',
      body: 'Der München Rot bindet Janis M. langfristig. Der 21-Jährige verlängerte seinen Vertrag am Dienstag vorzeitig bis zum 30. Juni 2030. Das gab der deutsche Rekordmeister am Mittag bekannt. Über die genauen Bezüge des neuen Kontrakts wurde Stillschweigen vereinbart.\n\nMünchen-Präsident Herbert Hainer sprach von einem "wichtigen Signal für die Zukunft des Vereins". Janis M. war bereits 2019 von der Sinsheim 1899 zu den München gewechselt und hat sich seither zum Leistungsträger und Publikumsliebling entwickelt. In der laufenden Saison kommt er auf 14 Tore und 9 Vorlagen in der Profiliga.\n\nMehrere europäische Spitzenklubs, darunter Manchester Blue und Madrid Royal, sollen in den vergangenen Monaten Interesse an einer Verpflichtung gezeigt haben.',
      comments: [
        { author: 'Markus L.', time: 'vor 25 Min', text: 'Top-Vertragsdauer. Genau die richtige Entscheidung.' },
        { author: 'Sabine H.', time: 'vor 18 Min', text: 'Egal was er kostet — diesen Spieler kann man nicht gehen lassen.' },
        { author: 'Jonas R.', time: 'vor 10 Min', text: 'Real und City werden sich ärgern. Sehr starker Move von Kahn und Co.' },
        { author: 'Petra W.', time: 'vor 3 Min', text: 'Auf so einen Spieler muss man einfach alles setzen.' },
      ],
    },
    {
      tag: 'LEVERKUSEN', tagIcon: '💊',
      title: 'Blau fällt 6 Wochen aus — Sehnenreizung im Oberschenkel',
      time: 'vor 1 Std',
      author: 'Markus Hoffmann',
      body: 'Rheinlands Stürmer Vincent Blau hat sich eine Sehnenreizung im linken Oberschenkel zugezogen und fällt rund sechs Wochen aus. Das gab Rheinland 04 am Dienstag bekannt. Der Nigerianer hatte bereits in der Hinrunde mit ähnlichen Problemen zu kämpfen gehabt.\n\nTrainer Xaver A. muss damit in den entscheidenden Wochen der Saison auf seinen Top-Stürmer verzichten. Blau steht in dieser Spielzeit bei 16 Pflichtspieltreffern und ist hinter Fabian W. der wichtigste Offensivakteur der Rheinlander.\n\nAls Ersatz rückt voraussichtlich Paul S. in die Startelf. Der Tscheche war zuletzt selbst angeschlagen, soll aber rechtzeitig zum Spitzenspiel gegen den Ruhrpott Gelb wieder fit sein.',
      comments: [
        { author: 'Christian B.', time: 'vor 50 Min', text: 'Schade, wichtige Phase der Saison. Gute Besserung!' },
        { author: 'Lena F.', time: 'vor 35 Min', text: 'S. muss jetzt liefern. Hat er das Zeug dazu?' },
      ],
    },
    {
      tag: 'LIGA-POKAL', tagIcon: '🏆',
      title: 'Halbfinale ausgelost: München empfängt Mainhattan',
      time: 'vor 2 Std',
      author: 'Lisa Wendt',
      body: 'Das Halbfinale im Liga-Pokal ist ausgelost. Titelverteidiger München Rot empfängt am 23. April Mainhattan FC. Im zweiten Halbfinale trifft Rheinland 04 auf den Schwaben Schwaben. Das ergab die Auslosung am Sonntagabend im deutschen Fußballmuseum in Dortmund.\n\nMünchen und Mainhattan standen sich zuletzt im Pokal-Endspiel 2018 gegenüber, das die München mit 5:0 deutlich für sich entschieden. Rheinland und Schwaben treffen zum dritten Mal in dieser Saison aufeinander — beide Duelle in der Liga endeten unentschieden.\n\nDas Endspiel steigt traditionell am 25. Mai im Berliner Olympiastadion.',
      comments: [
        { author: 'Daniel K.', time: 'vor 1 Std 50 Min', text: 'Starkes Los! Mainhattan wird alles reinwerfen.' },
        { author: 'Marie S.', time: 'vor 1 Std 30 Min', text: 'München vs. Mainhattan klingt nach einem klaren Ding.' },
        { author: 'Felix O.', time: 'vor 1 Std', text: 'Rheinland-Schwaben wird das spannendere Halbfinale, oder?' },
      ],
    },
  ];

  const matches = [
    {
      home: 'München Rot', away: 'Ruhrpott Gelb', score: '3:1', status: 'Endstand', time: "90'", live: false,
      homeShort: 'FCB', awayShort: 'Ruhrpott Gelb',
      homeColor: '#dc052d', awayColor: '#fde100',
      halftime: '1:0', attendance: '75.000', stadium: 'Süd-Arena',
      goals: [
        { minute: 12, scorer: 'Henry K.', team: 'home', scoreAfter: '1:0' },
        { minute: 28, scorer: 'Janis M.', team: 'home', scoreAfter: '2:0' },
        { minute: 45, scorer: 'Kevin A.', team: 'away', scoreAfter: '2:1' },
        { minute: 67, scorer: 'Leon S.', team: 'home', scoreAfter: '3:1' },
      ],
      cards: [
        { minute: 35, player: 'Elias C.', team: 'away', type: 'yellow' },
        { minute: 78, player: 'Denis U.', team: 'home', type: 'yellow' },
      ],
    },
    {
      home: 'Sachsen Leipzig', away: 'Autostadt FC', score: '2:0', status: 'Endstand', time: "90'", live: false,
      homeShort: 'RBL', awayShort: 'WOB',
      homeColor: '#dd0741', awayColor: '#65b032',
      halftime: '1:0', attendance: '47.500', stadium: 'Ost-Arena',
      goals: [
        { minute: 23, scorer: 'Lukas O.', team: 'home', scoreAfter: '1:0' },
        { minute: 81, scorer: 'Xaver S.', team: 'home', scoreAfter: '2:0' },
      ],
      cards: [
        { minute: 54, player: 'Max A.', team: 'away', type: 'yellow' },
      ],
    },
    {
      home: 'Eisern Berlin', away: 'Breisgau SC', score: '1:1', status: 'Endstand', time: "90'", live: false,
      homeShort: 'UNB', awayShort: 'SCF',
      homeColor: '#d4011d', awayColor: '#000000',
      halftime: '0:1', attendance: '22.012', stadium: 'Waldstadion',
      goals: [
        { minute: 18, scorer: 'Vincent G.', team: 'away', scoreAfter: '0:1' },
        { minute: 73, scorer: 'Robert G.', team: 'home', scoreAfter: '1:1' },
      ],
      cards: [
        { minute: 41, player: 'Ralf K.', team: 'home', type: 'yellow' },
        { minute: 88, player: 'Mats G.', team: 'away', type: 'yellow' },
      ],
    },
    {
      home: 'Rheinland', away: 'Schwaben', score: '4:2', status: 'Endstand', time: "90'", live: false,
      homeShort: 'B04', awayShort: 'VFB',
      homeColor: '#e32221', awayColor: '#ffffff',
      halftime: '2:1', attendance: '30.210', stadium: 'Rheinland-Arena',
      goals: [
        { minute: 7, scorer: 'Fabian W.', team: 'home', scoreAfter: '1:0' },
        { minute: 22, scorer: 'Sergej G.', team: 'away', scoreAfter: '1:1' },
        { minute: 38, scorer: 'Vincent Blau', team: 'home', scoreAfter: '2:1' },
        { minute: 58, scorer: 'Christian F.', team: 'away', scoreAfter: '2:2' },
        { minute: 71, scorer: 'Gregor Z.', team: 'home', scoreAfter: '3:2' },
        { minute: 89, scorer: 'Johann H.', team: 'home', scoreAfter: '4:2' },
      ],
      cards: [
        { minute: 63, player: 'Julian F.', team: 'home', type: 'yellow' },
      ],
    },
    {
      home: 'Mainhattan', away: 'Rheinhessen', score: '0:0', status: '2. Halbzeit', time: "72'", live: true,
      homeShort: 'SGE', awayShort: 'M05',
      homeColor: '#e1000f', awayColor: '#c2112c',
      halftime: '0:0', attendance: '51.500', stadium: 'Main-Arena',
      goals: [],
      cards: [
        { minute: 28, player: 'Leon B.', team: 'away', type: 'yellow' },
        { minute: 64, player: 'Robert K.', team: 'home', type: 'yellow' },
      ],
    },
  ];

  const openIndex = parsedNewsIdx !== null && Number.isFinite(parsedNewsIdx) && parsedNewsIdx >= 0 && parsedNewsIdx < news.length ? parsedNewsIdx : null;
  const openMatch = parsedMatchIdx !== null && Number.isFinite(parsedMatchIdx) && parsedMatchIdx >= 0 && parsedMatchIdx < matches.length ? parsedMatchIdx : null;
  const opened = openIndex !== null ? news[openIndex] : null;
  const openedMatch = openMatch !== null ? matches[openMatch] : null;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: bg, color: text, position: 'relative', overflow: 'hidden',
    }}>
      <style>{socialGlobalCss}</style>
      {/* Top red bar */}
      <div style={{
        background: red,
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 900, letterSpacing: 2,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontStyle: 'italic',
          }}>
            FUSSBALL
          </span>
          <span style={{ fontSize: 10, opacity: 0.7 }}>|</span>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>
            SPIELTAG 28
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#fff',
            animation: 'pulse 1.4s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, fontFamily: 'monospace' }}>
            LIVE
          </span>
        </div>
      </div>
      {/* Sub-header */}
      <div style={{
        background: subtleBg,
        borderBottom: `1px solid ${border}`,
        padding: '8px 16px',
        fontSize: 11, color: subtext, fontFamily: 'monospace',
      }}>
        sport.allianz-intern.net · Profiliga · 1. Profiliga
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 0 }} className="hide-scrollbar">
        {/* Matches */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            borderLeft: `3px solid ${red}`, paddingLeft: 8,
          }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: text, letterSpacing: 1 }}>
              SPIELE
            </div>
            <div style={{ fontSize: 10, color: subtext, fontFamily: 'monospace' }}>
              SA 06.04. · 15:30
            </div>
          </div>
          {matches.map((m, i) => (
            <div
              key={i}
              onClick={() => navigate(`/browser/torjaeger-live/match/${i}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 0',
                borderBottom: i < 4 ? `1px solid ${border}` : 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: text,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}>
                  {m.home}
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: text,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}>
                  {m.away}
                </div>
              </div>
              <div style={{
                fontSize: 18, fontWeight: 900, color: '#fff',
                background: m.live ? red : text,
                fontFamily: 'monospace', padding: '6px 10px',
                minWidth: 56, textAlign: 'center',
                letterSpacing: 1,
              }}>
                {m.score}
              </div>
              <div style={{
                fontSize: 10, color: m.live ? red : subtext,
                fontWeight: 700, fontFamily: 'monospace',
                minWidth: 40, textAlign: 'right',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                {m.live ? '● ' + m.time : m.status}
              </div>
            </div>
          ))}
        </div>

        {/* News section */}
        <div style={{ padding: '18px 16px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
            overflow: 'hidden',
            minHeight: 36,
            paddingTop: 6, paddingBottom: 6,
            background: text,
            borderRadius: 3,
            padding: '8px 12px',
          }}>
            <div style={{
              fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: 1.5,
              flexShrink: 0,
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}>
              NEWS
            </div>
            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', position: 'relative', height: 22, maskImage: 'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 24px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 24px), transparent 100%)' }}>
              <div style={{
                display: 'inline-block',
                whiteSpace: 'nowrap',
                fontSize: 12, color: '#fff', fontFamily: 'monospace',
                lineHeight: '22px', fontWeight: 600,
                animation: 'ticker 28s linear infinite',
                willChange: 'transform',
              }}>
                {news.concat(news).map((n, i) => (
                  <span key={i} style={{ marginRight: 32 }}>
                    <span style={{ color: '#ff5566', fontWeight: 800, marginRight: 6 }}>●</span>
                    {n.title}
                  </span>
                ))}
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              flexShrink: 0,
              padding: '2px 7px',
              background: text,
              color: '#fff',
              borderRadius: 2,
              fontFamily: 'monospace',
              fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: red,
                animation: 'pulse 1.4s ease-in-out infinite',
              }} />
              {hh}:{mm}:{ss}
            </div>
            <style>{`
              @keyframes ticker {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
            `}</style>
          </div>
          <div style={{
            borderTop: `2px solid ${red}`,
            background: bg,
          }}>
            {news.map((n, i) => (
              <div
                key={i}
                onClick={() => navigate(`/browser/torjaeger-live/news/${i}`)}
                style={{
                  padding: '12px 0',
                  borderBottom: `1px solid ${border}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 9, fontWeight: 800, color: '#fff',
                  background: red, padding: '2px 6px',
                  letterSpacing: 1, fontFamily: 'monospace',
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 10 }}>{n.tagIcon}</span>
                  {n.tag}
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: text,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  lineHeight: 1.3,
                }}>
                  {n.title}
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 10, color: subtext, fontFamily: 'monospace',
                  marginTop: 6,
                }}>
                  <span>{n.time}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/browser/torjaeger-live/news/${i}`); }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = red; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = red; }}
                    style={{
                      background: 'transparent',
                      color: red,
                      border: `1px solid ${red}`,
                      borderRadius: 3,
                      padding: '3px 10px',
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 1.5,
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    LESEN ›
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabelle */}
        <div style={{ padding: '20px 16px 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0,
            borderLeft: `3px solid ${red}`, paddingLeft: 8,
          }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: text, letterSpacing: 1 }}>
              TABELLE
            </div>
            <div style={{ fontSize: 10, color: subtext, fontFamily: 'monospace' }}>
              1. Profiliga
            </div>
          </div>
          <div style={{
            borderTop: `2px solid ${red}`,
            borderBottom: `1px solid ${border}`,
            background: bg,
          }}>
            {/* Header row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px',
              background: redDark,
              color: '#fff',
              fontSize: 10, fontWeight: 800, letterSpacing: 1,
              fontFamily: 'monospace',
            }}>
              <span style={{ width: 18, textAlign: 'right' }}>#</span>
              <span style={{ flex: 1 }}>VEREIN</span>
              <span style={{ width: 24, textAlign: 'center' }}>SP</span>
              <span style={{ width: 24, textAlign: 'center' }}>TD</span>
              <span style={{ width: 28, textAlign: 'right' }}>PKT</span>
            </div>
            {[
              { pos: 1, team: 'München Rot', sp: 28, td: '+42', pts: 68, qualified: 'champion' },
              { pos: 2, team: 'Rheinland', sp: 28, td: '+35', pts: 62, qualified: 'cl' },
              { pos: 3, team: 'Sachsen Leipzig', sp: 28, td: '+18', pts: 55, qualified: 'cl' },
              { pos: 4, team: 'Schwaben', sp: 28, td: '+12', pts: 51, qualified: 'cl' },
              { pos: 5, team: 'Mainhattan', sp: 28, td: '+5', pts: 48, qualified: null },
            ].map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px',
                borderBottom: i < 4 ? `1px solid ${border}` : 'none',
                background: t.qualified ? (t.qualified === 'champion' ? '#fff5e6' : '#f0f7ff') : bg,
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 800,
                  color: t.qualified === 'champion' ? red : text,
                  fontFamily: 'monospace', width: 18, textAlign: 'right',
                }}>
                  {t.pos}
                </span>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: text,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  flex: 1,
                }}>
                  {t.team}
                </span>
                <span style={{ fontSize: 12, color: subtext, fontFamily: 'monospace', width: 24, textAlign: 'center' }}>
                  {t.sp}
                </span>
                <span style={{ fontSize: 12, color: subtext, fontFamily: 'monospace', width: 24, textAlign: 'center' }}>
                  {t.td}
                </span>
                <span style={{
                  fontSize: 14, fontWeight: 800, color: text,
                  fontFamily: 'monospace', width: 28, textAlign: 'right',
                }}>
                  {t.pts}
                </span>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div style={{
            display: 'flex', gap: 12, marginTop: 8,
            fontSize: 10, color: subtext, fontFamily: 'monospace',
          }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#fff5e6', border: `1px solid ${border}`, verticalAlign: 'middle', marginRight: 4 }} />Meister</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#f0f7ff', border: `1px solid ${border}`, verticalAlign: 'middle', marginRight: 4 }} />Champions League</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {opened && (
          <motion.div
            key="article-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate('/browser/torjaeger-live')}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-end',
              zIndex: 5000,
            }}
          >
            <motion.div
              key="article-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: bg,
                borderTopLeftRadius: 16, borderTopRightRadius: 16,
                border: `1px solid ${border}`, borderBottom: 'none',
                maxHeight: '85%', minHeight: '50%',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px 10px',
                borderBottom: `1px solid ${border}`,
                background: red,
                color: '#fff',
                flexShrink: 0,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
                  fontFamily: 'monospace',
                }}>
                  <span style={{ fontSize: 12 }}>{opened.tagIcon}</span>
                  {opened.tag}
                </div>
                <button
                  onClick={() => navigate('/browser/torjaeger-live')}
                  aria-label="Schließen"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: 'none', borderRadius: 4, padding: 5,
                    cursor: 'pointer', display: 'flex', color: '#fff',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
                <div style={{ padding: '18px 18px 12px' }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: 22, fontWeight: 900, color: text,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    lineHeight: 1.25,
                    letterSpacing: -0.3,
                  }}>
                    {opened.title}
                  </h2>
                  <div style={{
                    display: 'flex', gap: 12, alignItems: 'center',
                    marginTop: 12, paddingBottom: 14,
                    borderBottom: `2px solid ${red}`,
                    fontSize: 11, color: subtext, fontFamily: 'monospace',
                  }}>
                    <span style={{ fontWeight: 700, color: text }}>{opened.author}</span>
                    <span>·</span>
                    <span>{opened.time}</span>
                  </div>
                </div>
                <div style={{
                  padding: '0 18px 24px',
                  fontSize: 17, lineHeight: 1.7, color: text,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  whiteSpace: 'pre-wrap',
                }}>
                  {opened.body}
                </div>

                {/* Comments section */}
                <div style={{
                  borderTop: `2px solid ${red}`,
                  padding: '16px 18px 24px',
                  background: subtleBg,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                    borderLeft: `3px solid ${red}`, paddingLeft: 8,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: text, letterSpacing: 1 }}>
                      KOMMENTARE
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 800, color: '#fff',
                      background: red, padding: '1px 6px', borderRadius: 2,
                      fontFamily: 'monospace', letterSpacing: 0.5,
                    }}>
                      {opened.comments.length}
                    </div>
                  </div>

                  {/* Comment input */}
                  <div style={{
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                    marginBottom: 16,
                    padding: 10,
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 4,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: red, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800,
                      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                      flexShrink: 0,
                    }}>
                      DU
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input
                        type="text"
                        placeholder="Schreibe einen Kommentar..."
                        style={{
                          width: '100%', padding: '6px 8px',
                          border: 'none', outline: 'none',
                          background: 'transparent',
                          fontSize: 13, color: text,
                          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: subtext, fontFamily: 'monospace' }}>
                          Als Allianz-Mitarbeiter posten
                        </span>
                        <button
                          style={{
                            background: red, color: '#fff',
                            border: 'none', borderRadius: 3,
                            padding: '4px 12px',
                            fontSize: 10, fontWeight: 800, letterSpacing: 1,
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                          }}
                        >
                          SENDEN
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments list */}
                  {opened.comments.map((c, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '12px 0',
                      borderBottom: i < opened.comments.length - 1 ? `1px solid ${border}` : 'none',
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: text, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800,
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        flexShrink: 0,
                      }}>
                        {c.author.split(' ').map(p => p[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex', alignItems: 'baseline', gap: 8,
                          marginBottom: 4,
                        }}>
                          <span style={{
                            fontSize: 12, fontWeight: 800, color: text,
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                          }}>
                            {c.author}
                          </span>
                          <span style={{
                            fontSize: 10, color: subtext, fontFamily: 'monospace',
                          }}>
                            {c.time}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 14, color: text, lineHeight: 1.45,
                          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        }}>
                          {c.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openedMatch && (
          <motion.div
            key="match-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate('/browser/torjaeger-live')}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-end',
              zIndex: 5001,
            }}
          >
            <motion.div
              key="match-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: bg,
                borderTopLeftRadius: 16, borderTopRightRadius: 16,
                border: `1px solid ${border}`, borderBottom: 'none',
                maxHeight: '88%', minHeight: '55%',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px',
                background: red,
                color: '#fff',
                flexShrink: 0,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
                  fontFamily: 'monospace',
                }}>
                  {openedMatch.live && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 6px',
                      background: '#fff', color: red,
                      borderRadius: 2,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: red,
                        animation: 'pulse 1.4s ease-in-out infinite',
                      }} />
                      LIVE
                    </span>
                  )}
                  <span>PROFILIGA · SPIELTAG 28</span>
                </div>
                <button
                  onClick={() => navigate('/browser/torjaeger-live')}
                  aria-label="Schließen"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: 'none', borderRadius: 4, padding: 5,
                    cursor: 'pointer', display: 'flex', color: '#fff',
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
                {/* Score header */}
                <div style={{
                  padding: '20px 16px',
                  background: subtleBg,
                  borderBottom: `2px solid ${red}`,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 16,
                  }}>
                    <div style={{
                      fontSize: 10, color: subtext, fontFamily: 'monospace', letterSpacing: 0.5,
                    }}>
                      {openedMatch.stadium}
                    </div>
                    <div style={{
                      fontSize: 10, color: subtext, fontFamily: 'monospace',
                    }}>
                      Zuschauer: {openedMatch.attendance}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12,
                  }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: openedMatch.homeColor,
                        color: '#fff', margin: '0 auto 8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 900, letterSpacing: 0.5,
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        border: openedMatch.homeColor === '#ffffff' ? `1px solid ${border}` : 'none',
                      }}>
                        {openedMatch.homeShort}
                      </div>
                      <div style={{
                        fontSize: 14, fontWeight: 800, color: text,
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                      }}>
                        {openedMatch.home}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      minWidth: 84,
                    }}>
                      <div style={{
                        fontSize: 36, fontWeight: 900, color: text,
                        fontFamily: 'monospace', letterSpacing: 2,
                        lineHeight: 1,
                      }}>
                        {openedMatch.score}
                      </div>
                      <div style={{
                        fontSize: 10, color: openedMatch.live ? red : subtext,
                        fontWeight: 700, fontFamily: 'monospace',
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {openedMatch.live ? '● ' + openedMatch.time : openedMatch.status}
                      </div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: openedMatch.awayColor,
                        color: openedMatch.awayColor === '#ffffff' ? text : '#fff',
                        margin: '0 auto 8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 900, letterSpacing: 0.5,
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        border: openedMatch.awayColor === '#ffffff' ? `1px solid ${border}` : 'none',
                      }}>
                        {openedMatch.awayShort}
                      </div>
                      <div style={{
                        fontSize: 14, fontWeight: 800, color: text,
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                      }}>
                        {openedMatch.away}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    marginTop: 14,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                    fontSize: 10, color: subtext, fontFamily: 'monospace',
                  }}>
                    <span>Halbzeit</span>
                    <span style={{ fontWeight: 800, color: text }}>{openedMatch.halftime}</span>
                  </div>
                </div>

                {/* Tore */}
                <div style={{ padding: '16px 16px 0' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                    borderLeft: `3px solid ${red}`, paddingLeft: 8,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: text, letterSpacing: 1 }}>
                      TORE
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 800, color: '#fff',
                      background: red, padding: '1px 6px', borderRadius: 2,
                      fontFamily: 'monospace', letterSpacing: 0.5,
                    }}>
                      {openedMatch.goals.length}
                    </div>
                  </div>
                  {openedMatch.goals.length === 0 ? (
                    <div style={{
                      padding: '20px 0', textAlign: 'center',
                      fontSize: 12, color: subtext, fontFamily: 'monospace',
                    }}>
                      Noch keine Tore
                    </div>
                  ) : (
                    <div style={{
                      borderTop: `2px solid ${red}`,
                      background: bg,
                    }}>
                      {openedMatch.goals.map((g, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 0',
                          borderBottom: i < openedMatch.goals.length - 1 ? `1px solid ${border}` : 'none',
                        }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            minWidth: 56,
                            fontSize: 12, fontWeight: 800, color: text,
                            fontFamily: 'monospace',
                          }}>
                            <span style={{
                              width: 18, height: 18, borderRadius: '50%',
                              background: g.team === 'home' ? openedMatch.homeColor : openedMatch.awayColor,
                              border: (g.team === 'home' ? openedMatch.homeColor : openedMatch.awayColor) === '#ffffff' ? `1px solid ${border}` : 'none',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              color: g.team === 'home'
                                ? (openedMatch.homeColor === '#ffffff' ? text : '#fff')
                                : (openedMatch.awayColor === '#ffffff' ? text : '#fff'),
                              fontSize: 9, fontWeight: 800,
                            }}>⚽</span>
                            <span style={{ fontWeight: 800 }}>{g.minute}.</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 14, fontWeight: 700, color: text,
                              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            }}>
                              {g.scorer}
                            </div>
                            <div style={{
                              fontSize: 10, color: subtext, fontFamily: 'monospace', marginTop: 2,
                            }}>
                              {g.team === 'home' ? openedMatch.home : openedMatch.away}
                            </div>
                          </div>
                          <div style={{
                            fontSize: 14, fontWeight: 900, color: text,
                            fontFamily: 'monospace', letterSpacing: 1,
                          }}>
                            {g.scoreAfter}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Karten */}
                {openedMatch.cards.length > 0 && (
                  <div style={{ padding: '18px 16px 24px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                      borderLeft: `3px solid ${red}`, paddingLeft: 8,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: text, letterSpacing: 1 }}>
                        KARTEN
                      </div>
                      <div style={{
                        fontSize: 10, fontWeight: 800, color: '#fff',
                        background: red, padding: '1px 6px', borderRadius: 2,
                        fontFamily: 'monospace', letterSpacing: 0.5,
                      }}>
                        {openedMatch.cards.length}
                      </div>
                    </div>
                    <div style={{
                      borderTop: `2px solid ${red}`,
                      background: bg,
                    }}>
                      {openedMatch.cards.map((c, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 0',
                          borderBottom: i < openedMatch.cards.length - 1 ? `1px solid ${border}` : 'none',
                        }}>
                          <div style={{
                            minWidth: 56,
                            fontSize: 12, fontWeight: 800, color: text,
                            fontFamily: 'monospace',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            <span style={{
                              display: 'inline-block',
                              width: 10, height: 14,
                              background: c.type === 'yellow' ? '#ffd400' : red,
                              border: c.type === 'yellow' ? '1px solid #c9a500' : 'none',
                            }} />
                            <span>{c.minute}.</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 13, fontWeight: 700, color: text,
                              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            }}>
                              {c.player}
                            </div>
                            <div style={{
                              fontSize: 10, color: subtext, fontFamily: 'monospace', marginTop: 2,
                            }}>
                              {c.type === 'yellow' ? 'Gelbe Karte' : 'Rote Karte'} · {c.team === 'home' ? openedMatch.home : openedMatch.away}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

