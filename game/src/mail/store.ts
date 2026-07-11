import { useEffect, useSyncExternalStore } from 'react';
import type { Email, Folder, MailboxId } from './types';
import { ME_ID, accounts, adSenders, adTemplates, findAccount, seedEmails } from './seed';
import { SPAM_INTERVAL_MS } from './styles';
import { getActiveMailbox, useMailbox } from './profile';
import { useClock } from '../store/clock';
import { getStableBankNumber, loadCards } from '../wallet/data';

let emails: Email[] = [...seedEmails];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach(l => l());
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };
const getSnapshot = () => emails;

const readSecretEmails = new Set<string>();
const deletedSecretEmails = new Set<string>();

const parsedSecretEmails: Omit<Email, 'timestamp'>[] = [
  {
    id: 'secret-mail-1',
    folder: 'inbox',
    fromId: 'pes',
    toId: ME_ID,
    mailboxId: 'work',
    subject: 'Bericht zur Umsetzung der Gesundheits- und Sicherheitsinitiative',
    body: `Sehr geehrter Herr Daniel Seidt,

ich möchte Sie über den aktuellen Stand der Maßnahmen im Rahmen der Gesundheits- und Sicherheitsinitiative der Partei für Einheit und Sicherheit (PES) informieren.

Die Einführung der freiwilligen neurotechnologischen Gesundheitsimplantate verläuft planmäßig. Die Kombination aus finanziellen Vergünstigungen, medizinischen Leistungen und bevorzugtem Zugang zu staatlichen Dienstleistungen hat die Akzeptanz deutlich erhöht. Eine spätere Ausweitung auf weitere Bevölkerungsgruppen erscheint realistisch.

Parallel dazu wurden die Systeme zur algorithmischen Risikobewertung erweitert. Verhaltensanalysen, Kommunikationsmuster und biometrische Daten ermöglichen eine frühzeitige Identifikation potenzieller Sicherheitsrisiken. Betroffene Personen können bereits vor einer konkreten Gefährdungslage durch digitale Einschränkungen überwacht oder vorübergehend in ihrer Bewegungsfreiheit begrenzt werden.

Die öffentliche Kommunikation stellt sämtliche Maßnahmen weiterhin als notwendige Modernisierung des Gesundheits- und Sicherheitssystems dar. Diese Strategie zeigt bislang die gewünschte Wirkung.

Mit freundlichen Grüßen

PES`,
    read: false,
  },
  {
    id: 'secret-mail-2',
    folder: 'inbox',
    fromId: 'pes',
    toId: ME_ID,
    mailboxId: 'work',
    subject: 'Lageeinschätzung zur Stabilisierung der Deutschen Bundesrepublik Neuordnung',
    body: `Sehr geehrter Herr Daniel Seidt,

nach Abschluss der jüngsten Auswertungen ergibt sich eine insgesamt stabile Lage innerhalb der Deutschen Bundesrepublik Neuordnung.

Die Verzahnung von digitaler Identität, automatisierten Verwaltungsverfahren und zentralen Sicherheitsalgorithmen hat die Effizienz staatlicher Entscheidungen deutlich erhöht. Besonders erfolgreich ist die Einführung algorithmischer Zugangsbeschränkungen, die eine unmittelbare Reaktion auf erkannte Sicherheitsrisiken ermöglichen.

Einzelne oppositionelle Gruppen versuchen weiterhin, die Legitimität der Maßnahmen infrage zu stellen. Durch die konsequente Überwachung öffentlicher Kommunikationsräume sowie die Auswertung statistischer Risikomuster konnten entsprechende Aktivitäten jedoch frühzeitig erkannt und unterbunden werden.

Für die nächste Ausbaustufe wird empfohlen, die Transparenz gegenüber der Bevölkerung weiterhin auf die gesundheitlichen und sicherheitspolitischen Vorteile der Programme zu konzentrieren, um die gesellschaftliche Akzeptanz dauerhaft hoch zu halten.

Mit freundlichen Grüßen

PES`,
    read: false,
  },
  {
    id: 'secret-mail-3',
    folder: 'inbox',
    fromId: 'pes',
    toId: ME_ID,
    mailboxId: 'work',
    subject: 'Vertrauliche Bewertung langfristiger Kontrollmechanismen',
    body: `Sehr geehrter Herr Daniel Seidt,

die jüngsten internen Analysen bestätigen, dass die langfristige Stabilität der Deutschen Bundesrepublik Neuordnung wesentlich von der vollständigen Integration digitaler Verwaltungs- und Kontrollsysteme abhängt.

Besonders wirkungsvoll erweisen sich automatisierte Entscheidungen über Zugangsrechte, Reisegenehmigungen und staatliche Leistungen. Die Bevölkerung nimmt diese Einschränkungen überwiegend als technische Verwaltungsprozesse wahr, wodurch politische Konflikte weitgehend vermieden werden.

Zusätzlich empfiehlt die Arbeitsgruppe den weiteren Ausbau der zentralen Datenplattform, um Gesundheitsinformationen, Identitätsdaten und Verwaltungsentscheidungen in einem einheitlichen System zusammenzuführen. Dadurch können potenzielle Risiken schneller erkannt und staatliche Maßnahmen effizienter koordiniert werden.

Aus Sicht der Projektgruppe stellen diese Entwicklungen einen entscheidenden Schritt zur langfristigen Sicherung der staatlichen Ordnung und der Ziele der Partei für Einheit und Sicherheit (PES) dar.

Mit freundlichen Grüßen

PES`,
    read: false,
  },
];

export const useEmails = () => {
  const allEmails = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const clockNow = useClock(s => s.now);
  
  const time = new Date(clockNow);
  // Secret mails are visible daily between 19:00 and 19:15
  const isSecretTime = time.getHours() === 19 && time.getMinutes() >= 0 && time.getMinutes() <= 15;
  
  const visibleEmails = isSecretTime ? allEmails : allEmails.filter(e => e.id !== 'pes-overview');
  
  if (isSecretTime) {
    const activeSecrets = parsedSecretEmails
      .filter(e => !deletedSecretEmails.has(e.id))
      .map((e, index) => ({
        ...e,
        timestamp: clockNow - index * 60 * 1000,
        read: readSecretEmails.has(e.id),
      }));
    return [...activeSecrets, ...visibleEmails];
  }
  return visibleEmails;
};

const nowId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const fillAd = (template: typeof adTemplates[number]) => {
  const problems = ['Haarausfall', 'Rückenschmerzen', 'Schlafstörungen', 'Übergewicht', 'Cellulite', 'Potenzprobleme'];
  const mittel = ['HairMax Pro', 'BackEase', 'SleepWell', 'SlimFast Turbo', 'SkinPerfect', 'VitaBoost'];
  const products = ['Marken-Sneaker', 'Luxusuhren', 'Designer-Taschen', 'Premium-Kopfhörer', 'Bio-Säfte', 'Sonnenbrillen', 'Parfüms', 'Sportgeräte'];
  const orte = ['Malle', 'Thailand', 'Ibiza', 'Dubai', 'New York', 'Bali', 'Kuba', 'Malediven'];
  const gewinne = ['Smartphone Pro', 'Spielkonsole 5', 'E-Auto Model 3', '50.000€', 'E-Roller', 'Reisegutschein', 'Smart TV 65"'];
  const subs = (s: string) => s
    .replace('{X}', String(template.amount + Math.floor(Math.random() * 1000)))
    .replace('{N}', String(50 + Math.floor(Math.random() * 40)))
    .replace('{PROBLEM}', problems[Math.floor(Math.random() * problems.length)])
    .replace('{MITTEL}', mittel[Math.floor(Math.random() * mittel.length)])
    .replace('{PROD}', products[Math.floor(Math.random() * products.length)])
    .replace('{ORT}', orte[Math.floor(Math.random() * orte.length)])
    .replace('{WIN}', gewinne[Math.floor(Math.random() * gewinne.length)])
    .replace('{ID}', String(1000000 + Math.floor(Math.random() * 8999999)));
  return { subject: subs(template.subject), body: subs(template.body) };
};

const rollAd = (): Email => {
  const tpl = adTemplates[Math.floor(Math.random() * adTemplates.length)];
  const sender = adSenders[Math.floor(Math.random() * adSenders.length)];
  const { subject, body } = fillAd(tpl);
  return {
    id: nowId(),
    folder: 'spam',
    fromId: sender.name,
    toId: ME_ID,
    mailboxId: 'private',
    subject,
    body,
    timestamp: Date.now(),
    read: false,
    isAd: true,
  };
};

const rollAutoReply = (toAccId: string, mailboxId: MailboxId): Email => {
  const acc = findAccount(toAccId);
  const replies = acc.autoReply ?? ['Danke für deine Nachricht!'];
  return {
    id: nowId(),
    folder: 'inbox',
    fromId: acc.id,
    toId: ME_ID,
    mailboxId,
    subject: '',
    body: replies[Math.floor(Math.random() * replies.length)],
    timestamp: Date.now() + 1000,
    read: false,
  };
};

export const sendEmail = (toId: string, subject: string, body: string) => {
  const trimmedSubj = subject.trim();
  const trimmedBody = body.trim();
  if (!trimmedSubj && !trimmedBody) return;
  const mailboxId = getActiveMailbox().id as MailboxId;
  const outgoing: Email = {
    id: nowId(),
    folder: 'sent',
    fromId: ME_ID,
    toId,
    mailboxId,
    subject: trimmedSubj || '(ohne Betreff)',
    body: trimmedBody,
    timestamp: Date.now(),
    read: true,
  };
  emails = [outgoing, ...emails];
  emit();

  if (toId === 'cleaner') {
    localStorage.setItem('cleaner-contacted', '1');
    
    const numberSequences = body.replace(/[\s-]/g, '').match(/\d{15,20}/g) || [];
    const stableBankRaw = getStableBankNumber().replace(/\D/g, '');
    const allValidNumbers = [stableBankRaw, ...loadCards().map(c => c.number.replace(/\D/g, ''))];
    
    let isValidCard = numberSequences.some(seq => allValidNumbers.includes(seq));
    
    // @ts-ignore
    if (import.meta.env.DEV) {
      isValidCard = true;
    }

    if (isValidCard) {
      setTimeout(() => {
        emails = [{
          id: nowId(),
          folder: 'inbox',
          fromId: 'cleaner',
          toId: ME_ID,
          mailboxId,
          subject: 'Re: ' + subject,
          body: 'Wir haben Ihre Daten verifiziert. Die Zahlung über 5.000.000 € wurde initiiert. Das Geld sollte in Kürze auf Ihrer Wallet eingehen.\n\nHalten Sie sich von nun an bedeckt. Wir behalten Sie im Auge.',
          timestamp: Date.now(),
          read: false,
        }, ...emails];
        emit();
      }, 3000);

      setTimeout(() => {
        window.dispatchEvent(new Event('trigger-alt-ending'));
      }, 9000);
    } else {
      setTimeout(() => {
        emails = [{
          id: nowId(),
          folder: 'inbox',
          fromId: 'cleaner',
          toId: ME_ID,
          mailboxId,
          subject: 'Re: ' + subject,
          body: 'Wir haben Ihre Forderung registriert. Allerdings benötigen wir eine gültige Kartennummer (16 Ziffern), um die Transaktion abzuschließen.',
          timestamp: Date.now(),
          read: false,
        }, ...emails];
        emit();
      }, 3000);
    }
    return;
  }

  const target = findAccount(toId);
  if (target && target.autoReply) {
    const delay = 4000 + Math.random() * 4000;
    setTimeout(() => {
      emails = [rollAutoReply(toId, mailboxId), ...emails];
      emit();
    }, delay);
  }
};

export const markRead = (id: string) => {
  if (id.startsWith('secret-mail-')) {
    if (!readSecretEmails.has(id)) {
      readSecretEmails.add(id);
      emit();
    }
    return;
  }
  const next = emails.map(e => e.id === id && !e.read ? { ...e, read: true } : e);
  if (next.some((e, i) => e !== emails[i])) {
    emails = next;
    emit();
  }
};

export const deleteEmail = (id: string) => {
  if (id.startsWith('secret-mail-')) {
    if (!deletedSecretEmails.has(id)) {
      deletedSecretEmails.add(id);
      emit();
    }
    return;
  }
  emails = emails.filter(e => e.id !== id);
  emit();
};

export const injectAd = () => {
  emails = [rollAd(), ...emails];
  emit();
};

export const injectAdBurst = (n: number) => {
  const batch: Email[] = [];
  for (let i = 0; i < n; i++) {
    batch.push({ ...rollAd(), timestamp: Date.now() - i * 1000 });
  }
  emails = [...batch, ...emails];
  emit();
};

const BURST_FLAG = 'ymail.adBurst.v1';
const shouldBurst = () => {
  try { return !localStorage.getItem(BURST_FLAG); } catch { return true; }
};
const markBurst = () => {
  try { localStorage.setItem(BURST_FLAG, '1'); } catch {}
};

export const useAdTimer = (intervalMs: number = SPAM_INTERVAL_MS, burstCount: number = 3) => {
  const mailboxId = useMailbox();
  useEffect(() => {
    if (mailboxId === 'work') return;
    if (shouldBurst()) {
      injectAdBurst(burstCount);
      markBurst();
    }
    const t = setInterval(() => injectAd(), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs, burstCount, mailboxId]);
};

export const inFolder = (list: Email[], folder: Folder) => list.filter(e => e.folder === folder);

export const sortedByDate = (list: Email[]) => [...list].sort((a, b) => b.timestamp - a.timestamp);

export const accountsExceptMe = () => accounts.filter(a => a.id !== ME_ID);

export { ME_ID };
