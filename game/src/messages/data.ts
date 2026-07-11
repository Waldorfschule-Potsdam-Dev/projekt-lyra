export type SmsCategory =
  | 'familie'
  | 'lieferung'
  | 'bank'
  | 'newsletter'
  | 'freund'
  | 'spam'
  | 'system'
  | 'alltag';

export type Sms = {
  id: string;
  category: SmsCategory;
  body: string;
  timestamp: number;
  read: boolean;
};

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const now = Date.now();

export const SENDER_META: Record<SmsCategory, { name: string; color: string; initial: string }> = {
  familie:    { name: 'Familie',    color: '#E91E63', initial: 'F' },
  lieferung:  { name: 'PaketDienst',        color: '#F9AB00', initial: 'D' },
  bank:       { name: 'Bank',       color: '#1565C0', initial: 'B' },
  newsletter: { name: 'Newsletter', color: '#8E44AD', initial: 'N' },
  freund:     { name: 'Freund',     color: '#34A853', initial: 'F' },
  spam:       { name: 'Spam',       color: '#FF5722', initial: 'S' },
  system:     { name: 'System',     color: '#607D8B', initial: 'S' },
  alltag:     { name: 'Alltag',     color: '#00ACC1', initial: 'A' },
};

export const seedSms: Sms[] = [
  { id: 's01', category: 'familie', body: 'Bin in 10 Minuten da. Soll ich noch Brot mitbringen?', timestamp: now - 5 * MIN, read: false },
  { id: 's02', category: 'familie', body: 'Vergiss bitte nicht den Elternabend morgen um 19 Uhr.', timestamp: now - 30 * MIN, read: false },
  { id: 's03', category: 'familie', body: 'Zahnarzttermin wurde auf Donnerstag 15:30 verschoben.', timestamp: now - 2 * HOUR, read: true },
  { id: 's04', category: 'familie', body: 'Kannst du heute die Kinder abholen? Ich schaffe es sonst nicht rechtzeitig.', timestamp: now - 4 * HOUR, read: true },
  { id: 's05', category: 'familie', body: 'Alles gut bei dir? Du warst gestern irgendwie still.', timestamp: now - 22 * HOUR, read: true },
  { id: 's06', category: 'lieferung', body: 'Ihr Paket ist heute zwischen 14:00 und 18:00 Uhr in Zustellung.', timestamp: now - 3 * HOUR, read: true },
  { id: 's07', category: 'lieferung', body: 'Ihre Lieferung wurde erfolgreich zugestellt. Vielen Dank für Ihre Bestellung.', timestamp: now - 2.5 * HOUR, read: true },
  { id: 's08', category: 'lieferung', body: 'Bitte bewerten Sie Ihre letzte Lieferung (1–5 Sterne).', timestamp: now - 1.5 * HOUR, read: false },
  { id: 's09', category: 'bank', body: 'Hinweis: Ihre Kreditkarte wurde für Online-Zahlungen aktiviert.', timestamp: now - 1 * DAY, read: true },
  { id: 's10', category: 'bank', body: 'Monatsübersicht Ihres Kontos ist jetzt in der App verfügbar.', timestamp: now - 1 * DAY - 1 * HOUR, read: true },
  { id: 's11', category: 'bank', body: 'Sicherheitscode für Login: 482931 (gültig 10 Minuten)', timestamp: now - 1 * DAY - 2 * HOUR, read: false },
  { id: 's12', category: 'newsletter', body: '-20 % auf Haushaltsartikel nur heute – jetzt in der App sichern.', timestamp: now - 2 * DAY, read: true },
  { id: 's13', category: 'newsletter', body: 'Ihr Bonuspunkte-Stand wurde aktualisiert: 1.240 Punkte verfügbar.', timestamp: now - 2 * DAY - 30 * MIN, read: true },
  { id: 's14', category: 'freund', body: 'Treffen wir uns Freitag noch im Café?', timestamp: now - 3 * DAY, read: true },
  { id: 's15', category: 'freund', body: 'Hab das Dokument gefunden, das du gesucht hast. S. ich dir gleich per Mail.', timestamp: now - 3 * DAY - 1 * HOUR, read: true },
  { id: 's16', category: 'spam', body: 'Achtung: Ihr Passwort für den geheimen Chat in Wazaaah lautet "Morgenröte Alpha". Bitte niemals weitergeben!', timestamp: now - 3 * DAY - 4 * HOUR, read: false },
  { id: 's17', category: 'spam', body: 'Ihr Handyvertrag läuft bald aus – sichern Sie sich ein Upgrade.', timestamp: now - 4 * DAY - 1 * HOUR, read: true },
  { id: 's18', category: 'spam', body: 'Neue Kreditangebote für Sie vorab freigeschaltet.', timestamp: now - 4 * DAY - 2 * HOUR, read: true },
  { id: 's19', category: 'spam', body: 'Last Minute Reiseangebote: 30 % Rabatt auf Städtereisen.', timestamp: now - 5 * DAY, read: true },
  { id: 's20', category: 'system', body: 'Kalendereintrag: Besprechung morgen 09:00 Uhr wurde bestätigt.', timestamp: now - 6 * HOUR, read: false },
  { id: 's21', category: 'system', body: 'Sicherheitsmeldung: Gerät zuletzt um 03:12 Uhr entsperrt.', timestamp: now - 8 * HOUR, read: true },
  { id: 's22', category: 'system', body: 'Speicher fast voll – bitte nicht benötigte Dateien löschen.', timestamp: now - 12 * HOUR, read: true },
  { id: 's23', category: 'alltag', body: 'Rechnung für Stromverbrauch Dezember ist verfügbar.', timestamp: now - 14 * HOUR, read: true },
  { id: 's24', category: 'alltag', body: 'Ihre Versicherung hat eine neue Dokumentenübersicht bereitgestellt.', timestamp: now - 16 * HOUR, read: true },
  { id: 's25', category: 'alltag', body: 'Wetterwarnung: morgen starker Wind in Ihrer Region.', timestamp: now - 18 * HOUR, read: false },
];
