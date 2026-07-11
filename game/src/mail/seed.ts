import type { Account, Email } from './types';

export const ME_ID = 'me';

export const accounts: Account[] = [
  { id: ME_ID, name: 'Daniel Seidt', email: 'daniel.s@pes.de', color: '#B91C1C' },
  { id: 'sarah-neumann', name: 'Sarah Neumann', email: 'sarah.neumann@pes.de', color: '#34A853' },
  { id: 'leon-falk', name: 'Leon Falk', email: 'leon.falk@pes.de', color: '#4285F4' },
  { id: 'patrick-engel', name: 'Patrick Engel', email: 'patrick.engel@pes.de', color: '#F29900' },
  { id: 'michael-vogt', name: 'Michael Vogt', email: 'michael.vogt@pes.de', color: '#8E44AD' },
  { id: 'peter-hahn', name: 'Peter Hahn', email: 'peter.hahn@pes.de', color: '#009688' },
  { id: 'andreas-vogel', name: 'Andreas Vogel', email: 'andreas.vogel@kanzlei-example.de', color: '#00B8D9' },
  { id: 'katharina', name: 'Katharina S.', email: 'katharina.s@private-mail.example', color: '#E91E63' },
  { id: 'maria-kuehn', name: 'Maria Kühn', email: 'maria.kuehn@pes.de', color: '#3F51B5' },
  { id: 'pes', name: 'PES', email: 'info@pes.de', color: '#374151' },
  { id: 'cleaner', name: 'Zentrale Abwicklung', email: 'cleaner@pes-intern.de', color: '#000000' },
];

export const findAccount = (id: string) => accounts.find(a => a.id === id) ?? accounts[0];

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const now = Date.now();

export const seedEmails: Email[] = [
  {
    id: 'pes-overview', folder: 'inbox', fromId: 'pes', toId: ME_ID, mailboxId: 'work',
    subject: 'Übersicht Personalstruktur und Abteilungen',
    body: `Sehr geehrter Herr Seidt,

anbei erhalten Sie die aktuelle Übersicht der Personalstruktur sowie die dazugehörige Abteilungsstruktur der Partei.

Die erste Tabelle gibt Ihnen einen Überblick über alle Mitarbeitenden mit ihren jeweiligen Positionen und Kontaktdaten. Die zweite Tabelle ordnet die Abteilungen inklusive ihrer Kürzel und Aufgabenbereiche ein.

## Personalübersicht

| Personalnummer | Name | Position | Abteilung | Telefon | E-Mail |
|---|---|---|---|---|---|
| P-001 | Daniel S. | Abgeordneter | Fraktion | +49 30 5550 1001 | daniel.s@pes.de |
| P-002 | Anna Krüger | Generalsekretärin | Parteileitung | +49 30 5550 1002 | anna.krueger@pes.de |
| P-003 | Leon Falk | Pressesprecher | Presse | +49 30 5550 1003 | leon.falk@pes.de |
| P-004 | Sarah Neumann | Strategieberaterin | Strategie | +49 30 5550 1004 | sarah.neumann@pes.de |
| P-005 | Julia Brandt | Referentin | Büro | +49 30 5550 1005 | julia.brandt@pes.de |
| P-006 | Felix König | Sicherheitsberater | Analyse | +49 30 5550 1006 | felix.koenig@pes.de |
| P-007 | Peter Hahn | Schatzmeister | Finanzen | +49 30 5550 1007 | peter.hahn@pes.de |
| P-008 | Eva Lorenz | Regionalleiterin | Organisation | +49 30 5550 1008 | eva.lorenz@pes.de |
| P-009 | Michael Vogt | Datenanalyst | Analyse | +49 30 5550 1009 | michael.vogt@pes.de |
| P-010 | Sandra Meier | Büroleiterin | Büro | +49 30 5550 1010 | sandra.meier@pes.de |

## Abteilungen

| Kürzel | Abteilung | Beschreibung |
|---------|---------|---------|
| FRA | Fraktion | Parlamentarische Arbeit |
| PLS | Parteileitung | Strategische Führung |
| PRE | Presse | Öffentlichkeitsarbeit |
| STR | Strategie | Politische Planung |
| ANA | Analyse | Daten- und Lageauswertung |
| FIN | Finanzen | Budget und Verwaltung |
| ORG | Organisation | Veranstaltungen und Koordination |
| BUE | Büro | Assistenz und Verwaltung |
| ZAB | Abwicklung | Krisenintervention und Sicherheit (cleaner@pes-intern.de) |

Mit freundlichen Grüßen
PES`,
    timestamp: now - 30 * MIN, read: false,
  },
  {
    id: 'd1-sent', folder: 'sent', fromId: ME_ID, toId: 'sarah-neumann', mailboxId: 'work',
    subject: 'Vorbereitung Strategietreffen',
    body: `Sarah,

bitte bereite für die Sitzung am Donnerstag eine Übersicht der aktuellen Umfragewerte vor. Besonders interessieren mich die Entwicklungen in den Regionen Nord und Ost.

Außerdem benötige ich eine Einschätzung zu den Auswirkungen der geplanten Kommunikationskampagne.

Gruß
Daniel`,
    timestamp: now - 3 * HOUR, read: true,
  },
  {
    id: 'd1-in', folder: 'inbox', fromId: 'sarah-neumann', toId: ME_ID, mailboxId: 'work',
    subject: 'Re: Vorbereitung Strategietreffen',
    body: `Daniel,

die Auswertung ist nahezu abgeschlossen. Die Zahlen aus dem Norden sind stabil, im Osten gibt es leichte Zugewinne.

Ich lasse dir die vollständigen Unterlagen morgen zukommen.

Viele Grüße
Sarah`,
    timestamp: now - 1 * HOUR, read: false,
  },

  {
    id: 'd2-in', folder: 'inbox', fromId: 'leon-falk', toId: ME_ID, mailboxId: 'work',
    subject: 'Interviewanfrage',
    body: `Daniel,

eine überregionale Zeitung hat um ein Interview gebeten. Themen sollen Wirtschaft, Sicherheit und Infrastruktur sein.

Soll ich einen Termin für nächste Woche bestätigen?

Grüße
Leon`,
    timestamp: now - 6 * HOUR, read: false,
  },
  {
    id: 'd2-sent', folder: 'sent', fromId: ME_ID, toId: 'leon-falk', mailboxId: 'work',
    subject: 'Re: Interviewanfrage',
    body: `Leon,

bitte bestätigen. Ich möchte die Gesprächspunkte vorher gemeinsam abstimmen.

Daniel`,
    timestamp: now - 5 * HOUR, read: true,
  },

  {
    id: 'd3-in', folder: 'inbox', fromId: 'patrick-engel', toId: ME_ID, mailboxId: 'work',
    subject: 'Parteitag 2028',
    body: `Daniel,

die Halle ist reserviert. Aktuell rechnen wir mit etwa 1.500 Teilnehmern.

Benötigst du zusätzliche Programmpunkte für deine Rede?

Gruß
Patrick`,
    timestamp: now - 12 * HOUR, read: true,
  },
  {
    id: 'd3-sent', folder: 'sent', fromId: ME_ID, toId: 'patrick-engel', mailboxId: 'work',
    subject: 'Re: Parteitag 2028',
    body: `Patrick,

bitte plane eine Fragerunde mit den Regionalvertretern ein.

Daniel`,
    timestamp: now - 11 * HOUR, read: true,
  },

  {
    id: 'd4-in', folder: 'inbox', fromId: 'michael-vogt', toId: ME_ID, mailboxId: 'work',
    subject: 'Quartalsanalyse',
    body: `Daniel,

im Anhang findest du den aktuellen Bericht zur Mitgliederentwicklung.

Besonders positiv entwickeln sich die Bezirke West-1 und Süd-2.

Michael`,
    timestamp: now - 1 * DAY, read: true,
  },
  {
    id: 'd4-sent', folder: 'sent', fromId: ME_ID, toId: 'michael-vogt', mailboxId: 'work',
    subject: 'Re: Quartalsanalyse',
    body: `Danke.

Bitte bereite zusätzlich einen Vergleich mit dem Vorjahreszeitraum vor.

Daniel`,
    timestamp: now - 22 * HOUR, read: true,
  },

  {
    id: 'd5-in', folder: 'inbox', fromId: 'peter-hahn', toId: ME_ID, mailboxId: 'work',
    subject: 'Budgetentwurf',
    body: `Daniel,

der Entwurf für das kommende Geschäftsjahr liegt vor.

Die Ausgaben für Veranstaltungen steigen voraussichtlich um 12 Prozent.

Gruß
Peter`,
    timestamp: now - 1.5 * DAY, read: true,
  },
  {
    id: 'd5-sent', folder: 'sent', fromId: ME_ID, toId: 'peter-hahn', mailboxId: 'work',
    subject: 'Re: Budgetentwurf',
    body: `Peter,

bitte prüfe mögliche Einsparungen im Verwaltungsbereich.

Daniel`,
    timestamp: now - 1.5 * DAY + 1 * HOUR, read: true,
  },

  {
    id: 'd6-in', folder: 'inbox', fromId: 'andreas-vogel', toId: ME_ID, mailboxId: 'private',
    subject: 'Wochenende',
    body: `Hallo Daniel,

hast du am Samstag Zeit für ein gemeinsames Abendessen?

Es wäre schön, mal wieder außerhalb des politischen Alltags zusammenzukommen.

Viele Grüße
Andreas`,
    timestamp: now - 2 * DAY, read: true,
  },
  {
    id: 'd6-sent', folder: 'sent', fromId: ME_ID, toId: 'andreas-vogel', mailboxId: 'private',
    subject: 'Re: Wochenende',
    body: `Hallo Andreas,

Samstag passt gut. Ich freue mich darauf.

Bis dann
Daniel`,
    timestamp: now - 2 * DAY + 2 * HOUR, read: true,
  },

  {
    id: 'd7-in', folder: 'inbox', fromId: 'katharina', toId: ME_ID, mailboxId: 'private',
    subject: 'Familienfeier',
    body: `Daniel,

vergiss bitte nicht, dass wir am Sonntag bei deinen Eltern eingeladen sind.

Die Kinder freuen sich schon darauf.

Liebe Grüße
Katharina`,
    timestamp: now - 3 * DAY, read: true,
  },
  {
    id: 'd7-sent', folder: 'sent', fromId: ME_ID, toId: 'katharina', mailboxId: 'private',
    subject: 'Re: Familienfeier',
    body: `Danke für die Erinnerung.

Ich habe den Termin fest eingeplant.

Daniel`,
    timestamp: now - 3 * DAY + 30 * MIN, read: true,
  },

  {
    id: 'd8-in', folder: 'inbox', fromId: 'maria-kuehn', toId: ME_ID, mailboxId: 'work',
    subject: 'Besuch in Südregion',
    body: `Daniel,

die Vorbereitungen für deinen Besuch sind abgeschlossen.

Geplant sind Gespräche mit Kommunalvertretern und Mitgliedern.

Viele Grüße
Maria`,
    timestamp: now - 4 * DAY, read: true,
  },
  {
    id: 'd8-sent', folder: 'sent', fromId: ME_ID, toId: 'maria-kuehn', mailboxId: 'work',
    subject: 'Re: Besuch in Südregion',
    body: `Perfekt.

Bitte sende mir den Ablaufplan bis Freitag.

Daniel`,
    timestamp: now - 4 * DAY + 1 * HOUR, read: true,
  },

  {
    id: 'mk1', folder: 'spam', fromId: 'Global Leadership Forum', toId: ME_ID, mailboxId: 'work',
    subject: 'Exklusive Einladung: Executive Leadership Forum Berlin – begrenzte Plätze',
    body: `Sehr geehrter Herr Dr. Seidt,

wir freuen uns, Sie persönlich zum Executive Leadership Forum 2026 in Berlin einzuladen.

Themen in diesem Jahr:
- Strategische Entscheidungsfindung unter Unsicherheit
- Führung in hochdynamischen Organisationen
- „Trust & Governance" im öffentlichen Sektor

Als ausgewählter Teilnehmerkreis erwarten Sie:
- Geschlossene Workshops mit internationalen Referenten
- Hintergrundgespräche auf Ministerialebene
- Zugang zum „Policy Roundtable Dinner"

Ort: Hotel Adlon Kempinski Berlin
Datum: 18.–20. September 2026

Bitte bestätigen Sie Ihre Teilnahme bis zum 10. Juli.

Mit freundlichen Grüßen
Ihr Organisationsteam`,
    timestamp: now - 2 * HOUR, read: false, isAd: true,
  },
  {
    id: 'mk2', folder: 'spam', fromId: 'SkyPriority Services', toId: ME_ID, mailboxId: 'work',
    subject: 'Daniel Seidt – Ihr kostenloses Upgrade ist verfügbar (nur 48h)',
    body: `Sehr geehrter Herr Seidt,

als Vielreisender wurden Sie für ein limitiertes Upgrade-Angebot ausgewählt:

Business Class Upgrade auf ausgewählten Europastrecken
Zugang zu über 120 VIP-Lounges
Priorisierte Gepäckabfertigung
Flexible Umbuchungsoptionen ohne Zusatzkosten

Ihr persönlicher Vorteilscode: SEIDT-VIP-26

Hinweis: Dieses Angebot ist zeitlich begrenzt und exklusiv für ausgewählte Profile verfügbar.

Jetzt aktivieren.

Mit freundlichen Grüßen
SkyPriority Services`,
    timestamp: now - 5 * HOUR, read: false, isAd: true,
  },
  {
    id: 'mk3', folder: 'spam', fromId: 'DGS Summit', toId: ME_ID, mailboxId: 'work',
    subject: 'Einladung: Panel „Staatliche Resilienz & digitale Sicherheit"',
    body: `Sehr geehrter Herr Dr. Seidt,

wir würden uns freuen, Sie als Gast oder Panelteilnehmer beim diesjährigen Digital Governance & Security Summit begrüßen zu dürfen.

Diskussionsschwerpunkte:
- Resilienz kritischer Verwaltungsstrukturen
- Informationssicherheit im digitalen Staat
- Kooperation zwischen Behörden und Forschung

Besonderer Programmpunkt:
„Closed Door Session: Zukunft staatlicher Entscheidungsarchitekturen"

Brussels Convention Center
03.–04. Oktober 2026

Eine Teilnahmebestätigung ist bis Ende Juli erforderlich.

Mit freundlichen Grüßen
Programmkoordination DGS Summit`,
    timestamp: now - 12 * HOUR, read: false, isAd: true,
  },
  {
    id: 'mk4', folder: 'spam', fromId: 'CREDITUS Private Banking', toId: ME_ID, mailboxId: 'work',
    subject: 'Exklusiver Marktbericht für ausgewählte Kunden',
    body: `Sehr geehrter Herr Dr. Seidt,

anbei erhalten Sie Ihren persönlichen Private Banking Insight Report – Juni 2026.

In dieser Ausgabe:
- Entwicklung europäischer Infrastrukturinvestments
- Langfristige Stabilitätsprognosen für Staatsanleihen
- „Diskrete Kapitalflüsse im europäischen Marktumfeld"

Zusätzlich erhalten Sie Zugang zu:
Individuellen Portfolio-Simulationen
Szenarioanalysen für politische Risikofaktoren

Bitte beachten Sie: Dieser Bericht ist vertraulich und nur für ausgewählte Kunden bestimmt.

Mit freundlichen Grüßen
CREDITUS Private Banking Research`,
    timestamp: now - 1 * DAY, read: false, isAd: true,
  },
  {
    id: 'mk5', folder: 'spam', fromId: 'Perspektive 2030 e.V.', toId: ME_ID, mailboxId: 'work',
    subject: 'Einladung zur Philanthropie-Gala 2026 – Berlin',
    body: `Sehr geehrter Herr Dr. Seidt,

wir laden Sie herzlich zur diesjährigen Philanthropie-Gala „Perspektive 2030" ein.

Programm:
- Begrüßung durch den Vorstand
- Vorstellung neuer Förderprojekte
- Diskrete Einzelgespräche mit Förderpartnern
- Abendliches Benefizdinner

Ort: Palais am Pariser Platz
Datum: 12. November 2026

Bitte bestätigen Sie Ihre Teilnahme bis spätestens 15. August.

Mit freundlichen Grüßen
Organisationsteam Perspektive 2030 e.V.`,
    timestamp: now - 2 * DAY, read: false, isAd: true,
  },
  {
    id: 'mk6', folder: 'spam', fromId: 'IT-Sicherheitsdienst', toId: ME_ID, mailboxId: 'work',
    subject: 'Dringend: Sicherheitsupdate für Ihr Dienstpostfach verfügbar',
    body: `Sehr geehrter Nutzer,

für Ihr Konto wurden neue Sicherheitsmodule bereitgestellt:

Verbesserte Verschlüsselung
Erweiterte Anti-Phishing-Erkennung
Automatische Klassifizierungsfilter für dienstliche Kommunikation

Bitte installieren Sie das Update innerhalb der nächsten 72 Stunden.

Hinweis: Ohne Aktualisierung kann es zu Einschränkungen im Nachrichtenverkehr kommen.

Ihr IT-Sicherheitsdienst`,
    timestamp: now - 3 * DAY, read: false, isAd: true,
  },
  {
    id: 'mk7', folder: 'spam', fromId: 'HWR Berlin', toId: ME_ID, mailboxId: 'work',
    subject: 'Einladung zu Gastvortrag „Staat & Verantwortung"',
    body: `Sehr geehrter Herr Dr. Seidt,

die Hochschule lädt Sie ein, im Rahmen des Masterprogramms „Public Governance" einen Gastvortrag zu halten.

Themenvorschläge:
- Entscheidungsprozesse in Ministerialstrukturen
- Governance zwischen Recht und Realität
- Ethik öffentlicher Verwaltung

Zeitraum: flexibel im Wintersemester 2026/27

Die Studierenden würden sich sehr über Ihre Teilnahme freuen.

Mit freundlichen Grüßen
Lehrstuhl für Verwaltungswissenschaften`,
    timestamp: now - 4 * DAY, read: false, isAd: true,
  },
];

export const adSenders = [
  { name: 'DealMaster24', color: '#FF5722' },
  { name: 'SparHai', color: '#00B8D9' },
  { name: 'CryptoKing', color: '#F29900' },
  { name: 'Schnäppchen-Hotline', color: '#8E44AD' },
  { name: 'LottoDirekt', color: '#34A853' },
  { name: 'MegaShop', color: '#EA4335' },
  { name: 'DatingSecret', color: '#E91E63' },
  { name: 'WunderPillen', color: '#009688' },
  { name: 'ReichIn30Tagen', color: '#3F51B5' },
  { name: 'StreamingKing', color: '#673AB7' },
  { name: 'FitnessWunder', color: '#CDDC39' },
  { name: 'HandyGewinnspiel', color: '#795548' },
  { name: 'RoyalCasino', color: '#D4AF37' },
  { name: 'BeautyShark', color: '#FF80AB' },
  { name: 'PolizeiWarnung', color: '#1565C0' },
  { name: 'Steuer-Tipp', color: '#388E3C' },
  { name: 'VapeStore24', color: '#7E57C2' },
  { name: 'TattooMagic', color: '#5D4037' },
  { name: 'Gewinnzentrale', color: '#C2185B' },
  { name: 'BilligAir', color: '#0288D1' },
  { name: 'Pfusch24', color: '#616161' },
];

export const adTemplates = [
  { subject: '💰 Verdiene {X}€ pro Woche — von zuhause!', body: 'Lieber Nutzer, wir haben eine einmalige Chance für Sie! Verdienen Sie bis zu {X}€ pro Woche, bequem von zuhause aus. Klicken Sie JETZT hier!', amount: 5000 },
  { subject: '🔥 {N}% RABATT auf alle {PROD}!', body: 'Nur heute: Riesenauswahl an {PROD} zum Schnäppchenpreis! Begrenzte Stückzahl. Hier klicken >>', amount: 70 },
  { subject: '⚠️ Ihr Konto wird gesperrt!', body: 'Sehr geehrter Kunde, wir haben ungewöhnliche Aktivitäten festgestellt. Bitte verifizieren Sie sich umgehend unter folgendem Link, sonst wird Ihr Konto gesperrt!', amount: 0 },
  { subject: '📱 GRATIS {WIN} — nur heute!', body: 'Herzlichen Glückwunsch! Sie wurden als glücklicher Gewinner ausgewählt. Fordern Sie Ihr/e {WIN} noch heute an — völlig kostenlos!', amount: 0 },
  { subject: '🎁 Geschenkkarte im Wert von {X}€ wartet!', body: 'Hallo, Sie haben eine unbeanspruchte Geschenkkarte im Wert von {X}€! Holen Sie sich jetzt, bevor sie verfällt.', amount: 500 },
  { subject: '💊 Neues Wundermittel gegen {PROBLEM}!', body: 'Ärzte staunen! Das neue Wundermittel {MITTEL} wirkt sofort und ohne Nebenwirkungen. Bestellen Sie noch heute 3 Packungen zum Sonderpreis!', amount: 39 },
  { subject: '📈 Krypto-Hot-Tipp: Verdopple dein Geld in 7 Tagen', body: 'Spezial-Insider: Diese Kryptowährung wird in den nächsten 7 Tagen explodieren. Investiere JETZT, bevor es zu spät ist!', amount: 0 },
  { subject: '🎰 100 Freispiele + 1000€ Bonus!', body: 'Exklusiv für neue Spieler: 100 Freispiele und ein Willkommensbonus von 1000€! Melde dich jetzt an und sichere dir dein Glück!', amount: 1000 },
  { subject: '❗ Letzte Mahnung: Offene Forderung', body: 'Sehr geehrte/r Nutzer/in, Sie haben eine offene Forderung. Bitte begleichen Sie diese umgehend, sonst werden rechtliche Schritte eingeleitet.', amount: 0 },
  { subject: '✈️ Traumurlaub nach {ORT} für 99€ — nur diese Woche!', body: 'Träumen Sie von {ORT}, Thailand oder Ibiza? Für nur 99€ fliegen Sie in den Traumurlaub! Jetzt buchen!', amount: 99 },
  { subject: '❤️ Heiße Singles in deiner Nähe wollen dich kennenlernen!', body: '3.847 Frauen und Männer aus deiner Region suchen gerade jetzt die große Liebe. Keine Anmeldung, keine Kosten! Klicke hier.', amount: 0 },
  { subject: '🔐 Dein Passwort wurde geändert — warst du das?', body: 'Hallo, wir haben eine Änderung an deinem Passwort festgestellt. Wenn du das nicht warst, klicke hier um dein Konto zu sichern.', amount: 0 },
  { subject: '📦 Dein Paket konnte nicht zugestellt werden', body: 'Sehr geehrte/r Empfänger/in, Ihr Paket mit Sendungsnummer DE{ID} konnte nicht zugestellt werden. Bitte bestätigen Sie Ihre Adresse unter folgendem Link.', amount: 0 },
  { subject: '🎬 StreamingPremium — alle Serien für 4,99€/Monat', body: 'Schau ALLE Serien, Filme und Doku auf einem Account. Keine Werbung, keine Limits. Erste 7 Tage gratis testen!', amount: 4.99 },
  { subject: '💪 12 Kilo in 4 Wochen — ohne Sport!', body: 'Hollywoodstars schwören drauf. Mit dieser simplen Diät wirst du in 4 Wochen 12 Kilo verlieren. Kein Sport, keine Pillen!', amount: 0 },
  { subject: '🪙 Investiere {X}€ in Bitcoin und werde Millionär', body: 'Wusstest du, dass frühe Investoren aus 1000€ über 1 Million gemacht haben? Starte jetzt mit nur {X}€! Risikofrei.', amount: 250 },
  { subject: '🏆 Letzte Chance: {WIN} zu gewinnen!', body: 'Nur noch 2 Stunden: Verlosung von {WIN}! Trage jetzt deine E-Mail ein und sichere dir dein Glück — garantiert.', amount: 0 },
  { subject: '💳 Deine Kreditkarte wurde belastet mit {X}€', body: 'Eine Belastung von {X}€ wurde auf deiner Karte gebucht. Wenn du das nicht warst, rufe umgehend diese Nummer an.', amount: 749 },
  { subject: '🔞 Exklusive Inhalte nur für dich freigeschaltet', body: 'Hallo, du hast exklusiven Zugriff auf Premium-Inhalte erhalten. Schau jetzt rein — diskret und anonym.', amount: 0 },
  { subject: '👑 Werde Online-Händler mit unserem Geheimrezept!', body: 'Über 4.800 Verkäufer haben mit unserem System über 10.000€ im Monat verdient. Jetzt kostenlos anmelden!', amount: 0 },
  { subject: '💎 1.000 Follower für deinen Account — kostenlos!', body: 'Wir pushen deinen Account auf 1.000 echte Follower in 24 Stunden. Kein Passwort nötig, 100% sicher.', amount: 0 },
  { subject: '🏠 Mieter erhalten gerade 2000€ Entschädigung — prüfe deinen Anspruch!', body: 'Mieter in deiner Region erhalten gerade 2000€ Entschädigung von ihrem Vermieter. Prüfe deinen Anspruch kostenlos.', amount: 2000 },
  { subject: '📺 Du schuldest uns noch 89,99€ für StreamingPremium', body: 'Hallo, dein Premium-Abo wurde nicht verlängert. Um weiter alle Inhalte zu sehen, verlängere jetzt für 89,99€.', amount: 89.99 },
  { subject: '🎉 Herzlichen Glückwunsch! Du bist der 1.000.000ste Besucher!', body: 'Du hast gewonnen! Klicke JETZT um deinen Gewinn von 1000€ abzuholen. Nur heute, nur jetzt, nur für dich!', amount: 1000 },
  { subject: '🧬 Neue Studie: {MITTEL} heilt {PROBLEM} in 7 Tagen', body: 'Wissenschaftler der Harvard University haben herausgefunden: {MITTEL} wirkt Wunder gegen {PROBLEM}. Studienbericht anfordern!', amount: 0 },
  { subject: '🎓 Bachelor in 30 Tagen — ohne Prüfung!', body: 'Erhalte deinen anerkannten Bachelor-Abschluss in nur 30 Tagen — ohne Vorlesungen, ohne Prüfung. 100% legal.', amount: 0 },
  { subject: '🚗 Diesel-Fahrverbot in deiner Stadt — prüfe dein Auto!', body: 'Ab nächster Woche gilt in deiner Stadt ein Diesel-Fahrverbot. Melde dich jetzt an, um eine Entschädigung von bis zu 4500€ zu erhalten.', amount: 4500 },
  { subject: '💌 7 Frauen haben dir eine Nachricht geschickt', body: 'Du hast 7 ungelesene Nachrichten auf FlirtFinder. Schau jetzt rein — alle Fotos sind freigeschaltet!', amount: 0 },
  { subject: '🔍 Umfrage: Nimm teil und erhalte {X}€', body: 'Wir suchen Teilnehmer für eine kurze Umfrage (5 Min). Als Dankeschön erhältst du {X}€ per Überweisung.', amount: 250 },
  { subject: '📉 Dein Konto wurde eingefroren — verifiziere dich!', body: 'Aus Sicherheitsgründen wurde dein Konto eingefroren. Klicke hier und verifiziere dich innerhalb von 24 Stunden, sonst wird es gelöscht.', amount: 0 },
  { subject: '💄 Faltenfrei in 7 Tagen — {MITTEL} im Test', body: 'Beauty-Testerinnen sind begeistert: {MITTEL} reduziert Falten sichtbar in nur einer Woche. Jetzt Proben gratis anfordern!', amount: 0 },
  { subject: '🚨 WARNUNG: Polizei meldet Anrufe in deiner Region', body: 'In den letzten 24 Stunden gab es gehäuft verdächtige Anrufe in deiner Region. Klicke hier für eine Liste der gemeldeten Nummern.', amount: 0 },
  { subject: '💰 Steuerrückzahlung von {X}€ wartet auf dich!', body: 'Laut unserer Datenbank hast du Anspruch auf eine Steuerrückzahlung von {X}€. Fordere dein Geld jetzt mit einem Klick zurück.', amount: 870 },
  { subject: '🚬 E-Zigaretten-Pods im Ausverkauf — 80% sparen', body: 'Premium-E-Liquids und Pods zum halben Preis. Über 200 Sorten. Versandkostenfrei ab 30€! Heute nur.', amount: 0 },
  { subject: '🖋️ TattooStudio deiner Stadt — 50€ Rabatt auf erstes Tattoo', body: 'Buche jetzt einen Termin in deinem örtlichen Studio und erhalte 50€ Rabatt auf dein erstes Tattoo. Anzahl an Kunden begrenzt.', amount: 50 },
  { subject: '🎊 10.000€ Sofortgewinn — Antwort gewusst, Geld gewonnen', body: 'Du hast unsere geheime Frage richtig beantwortet! Fordere deine 10.000€ innerhalb der nächsten 24 Stunden an, sonst verfällt der Gewinn.', amount: 10000 },
  { subject: '✉️ Single aus {ORT} (28) hat dich auf PartnerBörse gemerkt', body: 'Sie findet dein Profil süß! Schau wer sie ist — Profil ist nur für dich heute freigeschaltet. Jetzt Nachricht schreiben!', amount: 0 },
  { subject: '💼 Nebenjob für Schüler — 20€/Stunde, 2h pro Tag', body: 'Hey Schüler! Verdiene dir 20€ pro Stunde dazu, bequem von zuhause. Keine Vorerfahrung nötig. Jetzt bewerben!', amount: 20 },
  { subject: '📞 Anruf in Abwesenheit (+49 30 {ID}) — bitte zurückrufen', body: 'Ein wichtiger Anruf in Abwesenheit. Die Nummer 030-{ID} hat versucht dich zu erreichen. Bitte umgehend zurückrufen — Gebühr 1,99€.', amount: 0 },
  { subject: '🍕 Deine Lieblingspizza für nur 1,99€ — heute nur', body: 'Bestelle jetzt eine Familienpizza deiner Wahl für nur 1,99€ statt 19,90€. Mindestbestellwert entfällt, kostenlose Lieferung inklusive!', amount: 1.99 },
  { subject: '🏠 Stromrechnung viel zu hoch? Wir sparen für dich {X}€!', body: 'Im Durchschnitt sparen unsere Kunden {X}€ pro Jahr bei ihrem Stromanbieter. Kostenloser Wechsel in unter 5 Minuten!', amount: 480 },
  { subject: '🎮 Free-to-Play MMO: 500€ Willkommensbonus', body: 'Melde dich heute an und erhalte 500€ Bonus-Geld + 100 Free Spins auf den ersten 3 Spielen! Exklusiv für neue Spieler aus deiner Region.', amount: 500 },
  { subject: '💎 Verdiene {X}€/Tag mit dem Handheld in deiner Tasche', body: 'Mit unserer neuen App verdienen Nutzer durchschnittlich {X}€ pro Tag. Keine Vorkenntnisse, keine Investition. Hol dir die App!', amount: 150 },
  { subject: '🎬 Erotik-Premium für 1 Monat GRATIS', body: 'Du hast einen Monat Premium-Zugang gewonnen! Schau dir jetzt tausende exklusive Inhalte an. Diskrete Abrechnung.', amount: 0 },
  { subject: '🚪 Pfusch am Bau? Wir holen dir dein Geld zurück!', body: 'Schlechte Handwerkerarbeit? Du hast Anspruch auf Schadensersatz. Wir prüfen deinen Fall kostenlos und holen bis zu 50.000€ für dich!', amount: 0 },
  { subject: '🛒 Großer Winterschlussverkauf — bis zu 90% reduziert', body: 'Über 50.000 Artikel stark reduziert. Mode, Elektronik, Spielzeug. Versandkostenfrei ab 40€. Nur solange Vorrat reicht!', amount: 0 },
  { subject: '🎓 Letzte Plätze: Online-Bootcamp Data Science (95% Rabatt)', body: 'Werde in 12 Wochen Data Scientist. Komplettes Bootcamp für nur 49€ statt 4.900€. Limited Seats — jetzt einschreiben.', amount: 49 },
  { subject: '📱 Smartphone Defekt? Reparatur für nur {X}€!', body: 'Display, Akku, Lautsprecher — wir reparieren dein Smartphone in unter 60 Minuten. Originalteile + 2 Jahre Garantie. Termin heute!', amount: 39 },
  { subject: '🌟 Du wurdest von {WIN} ausgewählt — bestätige jetzt', body: 'Hallo, du wurdest als einer von 100 Empfängern für {WIN} ausgewählt. Bestätige deine Adresse in den nächsten 12 Stunden.', amount: 0 },
  { subject: '💸 Schulden erlassen — Melde dich jetzt kostenlos', body: 'Neues Gesetz: Bis zu 15.000€ Schulden können erlassen werden. Prüfe kostenlos, ob du berechtigt bist. Keine Anwaltskosten!', amount: 15000 },
  { subject: '🎁 Mystery-Box von {WIN} — decklose das Geheimnis!', body: 'Du hast eine Mystery-Box gewonnen! Wert zwischen 5€ und 5.000€. Decke das Geheimnis jetzt auf — Versandkosten 2,99€.', amount: 0 },
];
