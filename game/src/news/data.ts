import {
  Newspaper, Building2, GraduationCap, Heart, Cpu, Sparkles, FileText, Mic, type LucideIcon
} from 'lucide-react';
export type Article = {
  id: number;
  topic: string;
  title: string;
  summary: string;
  body: string[];
  tags: string[];
  author: string;
  authorInitials: string;
  gradient: string;
  Icon: LucideIcon;
  time: string;
  hiddenFromFeed?: boolean;
};

export const articles: Article[] = [
  {
    id: 1,
    topic: 'Politik',
    title: 'HORIZONT 4.2: Neue Prognoseplattform veröffentlicht',
    summary:
      'Die zentrale Prognoseplattform HORIZONT wurde auf Version 4.2 aktualisiert. Das Update verbessert die Synchronisierung gesellschaftlicher Entwicklungsmodelle für den Zeitraum 2027–2032.',
    body: [
      'Die zentrale Prognoseplattform HORIZONT wurde am Montag auf Version 4.2 aktualisiert. Laut offizieller Mitteilung aus der Bundeskoordination Berlin verbessert das Update die „Synchronisierung gesellschaftlicher Entwicklungsmodelle" und liefert präzisere Vorhersagen für den Zeitraum 2027 bis 2032.',
      'Zu den zentralen Neuerungen gehört eine feinere regionale Risikoabschätzung, die auf Echtzeit-Datenströme aus dem ATLAS-Verbund zugreift. Ergänzt wurden Parameter für Bildungs- und Arbeitsmobilität sowie eine optimierte „Stabilitätsprojektion 2027–2032".',
      'In internen Verwaltungskreisen wird die Anpassung kontrovers diskutiert. Kritiker sprechen von einer weiteren Verschiebung hin zu automatisierter Entscheidungslogik und befürchten, dass politische Abwägungen zunehmend durch algorithmische Prognosen ersetzt werden.',
      'Die PES-geführte Regierung begrüßt das Update als Meilenstein für eine vorausschauende Gesellschaftspolitik. HORIZONT 4.2 wird ab sofort in allen Bundesbehörden ausgerollt.',
    ],
    tags: ['HORIZONT', 'Politik', 'Prognose', 'Staat'],
    author: 'Dr. Anika Vollmer',
    authorInitials: 'AV',
    gradient: 'linear-gradient(135deg, #1A237E 0%, #311B92 100%)',
    Icon: Newspaper,
    time: 'vor 12 Min',
  },
  {
    id: 2,
    topic: 'Gesellschaft',
    title: 'Wohnraumzuteilung folgt jetzt dem Mobilitätsindex',
    summary:
      'In mehreren deutschen Großstädten läuft eine neue Zuteilungsrunde für Wohnraum. Grundlage ist der Mobilitäts- und Stabilitätsindex (MSI).',
    body: [
      'In mehreren deutschen Großstädten läuft seit dem Wochenende eine neue Zuteilungsrunde für Wohnraum. Anders als bisher ist nicht mehr die Dauer der Wohnungssuche entscheidend, sondern der sogenannte Mobilitäts- und Stabilitätsindex (MSI).',
      'Der MSI kombiniert Daten zur beruflichen Flexibilität, regionalen Standortbindung und familiären Konstellation. Familien mit hoher beruflicher Flexibilität erhalten Priorität, während „statische Profile" stärker regional gebunden werden.',
      'Wohnungsbaugenossenschaften und Mieterverbände reagieren verhalten. Kritiker sehen in der neuen Logik eine Zementierung bestehender sozialer Ungleichheiten, Befürworter verweisen auf eine effizientere Ressourcenverteilung.',
      'Die zuständigen Verwaltungen betonen, dass Widerspruchsverfahren erhalten bleiben. Erste Erfahrungsberichte aus den Pilotstädten sollen im Herbst ausgewertet werden.',
    ],
    tags: ['MSI', 'Wohnen', 'Verwaltung', 'Soziales'],
    author: 'Tobias Reinert',
    authorInitials: 'TR',
    gradient: 'linear-gradient(135deg, #E65100 0%, #BF360C 100%)',
    Icon: Building2,
    time: 'vor 1 Std',
  },
  {
    id: 3,
    topic: 'Bildung',
    title: 'Einheitliche Lernmodule aus ATLAS Bildung bundesweit',
    summary:
      'Alle staatlichen Schulen nutzen ab diesem Schuljahr standardisierte Lernmodule aus dem Programm ATLAS Bildung. Lehrkräfte berichten von stärker zentralisierten Vorgaben.',
    body: [
      'Alle staatlichen Schulen in Deutschland nutzen ab diesem Schuljahr standardisierte Lernmodule aus dem Programm ATLAS Bildung. Damit endet eine jahrelange Übergangsphase, in der Lehrkräfte noch eigene Unterrichtsmaterialien einbringen konnten.',
      'Zu den neuen Inhalten gehören Module wie „Datenkompetenz und gesellschaftliche Systeme", „Struktur und Stabilität moderner Staaten" sowie „Ethik in algorithmischen Entscheidungen". Die Themen sind verbindlich im Lehrplan verankert.',
      'Lehrkräfte berichten von deutlich stärker zentralisierten Unterrichtsvorgaben. Während Befürworter die Vergleichbarkeit der Bildungsqualität loben, sehen Kritiker die pädagogische Freiheit und die Eigenständigkeit der Schulen in Gefahr.',
      'Das Bildungsministerium kündigte begleitende Fortbildungen an. Eine Evaluation der neuen Lernmodule ist für das Ende des Schuljahres geplant.',
    ],
    tags: ['ATLAS', 'Bildung', 'Schule', 'Lehrplan'],
    author: 'Lena Kühn',
    authorInitials: 'LK',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    Icon: GraduationCap,
    time: 'vor 3 Std',
  },
  {
    id: 4,
    topic: 'Gesundheit',
    title: 'Projekt SPRENGEL: Erweitertes Gesundheitsmonitoring',
    summary:
      'Das Programm SPRENGEL erfasst nun zusätzliche Alltagsparameter zur „präventiven Versorgung". Datenschützer zeigen sich zurückhaltend.',
    body: [
      'Das Gesundheitsprogramm SPRENGEL hat seine Erfassung deutlich erweitert. Neben klassischen medizinischen Daten fließen künftig zusätzliche Alltagsparameter in die präventive Versorgungsplanung ein.',
      'Ergänzt wurden unter anderem Belastungsindikatoren im Alltag, die regionale Versorgungsauslastung sowie anonymisierte Stresscluster aus den kommunalen Datenräumen. Ziel sei eine frühzeitige Erkennung gesundheitlicher Risiken, heißt es aus dem Gesundheitsministerium.',
      'Datenschutzbeauftragte zeigen sich zurückhaltend: Zwar würden alle Daten anonymisiert verarbeitet, doch die Verknüpfung verschiedener Quellen werfe grundsätzliche Fragen auf. Patientenorganisationen fordern mehr Transparenz über die Auswertungslogik.',
      'SPRENGEL wird in elf Modellregionen getestet. Bei positiver Evaluation soll das System bis Ende 2027 bundesweit ausgerollt werden.',
    ],
    tags: ['SPRENGEL', 'Gesundheit', 'Prävention', 'Verwaltung'],
    author: 'Dr. Markus Brandt',
    authorInitials: 'MB',
    gradient: 'linear-gradient(135deg, #C62828 0%, #8E0000 100%)',
    Icon: Heart,
    time: 'vor 5 Std',
  },
  {
    id: 5,
    topic: 'Technologie',
    title: 'ATLAS-Datenverbund erreicht Vollintegration',
    summary:
      'Der Datenverbund ATLAS ist nun vollständig in alle Bundes- und Landesdatenbanken integriert — erstmals eine einheitliche Datenstruktur für Verwaltung, Sicherheit, Bildung und Gesundheit.',
    body: [
      'Der zentrale Datenverbund ATLAS hat die vollständige Integration in alle Bundes- und Landesdatenbanken abgeschlossen. Damit existiert erstmals eine einheitliche Datenstruktur, die Verwaltung, Sicherheit, Bildung und Gesundheit miteinander verknüpft.',
      'ATLAS konsolidiert Datensätze aus mehr als 400 Behörden und öffentlichen Einrichtungen. Über standardisierte Schnittstellen können Anfragen ressortübergreifend in Echtzeit beantwortet werden — etwa bei der Bearbeitung von Anträgen oder der Koordination von Hilfsmaßnahmen.',
      'Die PES-Regierung spricht von einem historischen Schritt für die digitale Verwaltung. Verwaltungswissenschaftler sehen darin Chancen für schnellere Verfahren, warnen jedoch vor einer zu starken Zentralisierung sensibler Daten.',
      'Die nächste Ausbaustufe von ATLAS umfasst erweiterte Auswertungsfunktionen für Forschung und Statistik. Der operative Betrieb läuft zunächst im geschlossenen Verwaltungsnetz.',
    ],
    tags: ['ATLAS', 'Daten', 'Verwaltung', 'Infrastruktur'],
    author: 'Sarah Engel',
    authorInitials: 'SE',
    gradient: 'linear-gradient(135deg, #6A1B9A 0%, #311B92 100%)',
    Icon: Cpu,
    time: 'vor 7 Std',
  },
  {
    id: 6,
    topic: 'Kultur',
    title: 'HARMONIE 2.0: Staatliche Kulturprogramme gestartet',
    summary:
      'Das Programm HARMONIE wird erweitert und stärker regionalisiert. Förderung künftig stärker an gesellschaftliche Stabilitätsbeiträge geknüpft.',
    body: [
      'Das staatliche Kulturprogramm HARMONIE wird erweitert und stärker regionalisiert. In der neuen Version 2.0 werden Fördermittel künftig verstärkt an thematische Kulturcluster und gesellschaftliche Stabilitätsbeiträge geknüpft.',
      'Zu den Schwerpunkten zählen die Förderung gemeinschaftlicher Kulturformate, Projekte zur gesellschaftlichen Stabilität sowie die Integration von Datenkunst und Visualisierung. Klassische Genres verlieren dabei an Förderpriorität.',
      'Kunst- und Kulturverbände diskutieren die Neuausrichtung kontrovers. Befürworter sehen in der Regionalisierung eine Belebung lokaler Szenen, Kritiker sprechen von einer wachsenden inhaltlichen Steuerung durch die Verwaltung.',
      'Die ersten Förderaufrufe im Rahmen von HARMONIE 2.0 starten im kommenden Quartal. Anträge können ausschließlich über die zentrale Plattform eingereicht werden.',
    ],
    tags: ['HARMONIE', 'Kultur', 'Förderung', 'Staat'],
    author: 'Jonas Voss',
    authorInitials: 'JV',
    gradient: 'linear-gradient(135deg, #AD1457 0%, #6A1B9A 100%)',
    Icon: Sparkles,
    time: 'vor 10 Std',
  },
  {
    id: 7,
    topic: 'Meinung',
    title: 'Leserbrief: Warum ich die ATLAS-Lernmodule ablehne',
    summary:
      'Eine Lehrkraft bricht ihr Schweigen: Die neuen Pflichtmodule aus dem Programm ATLAS Bildung ersetzen keine Pädagogik — sie verhindern sie.',
    body: [
      'Liebe Redaktion, ich bin seit 14 Jahren Lehrerin an einer staatlichen Gesamtschule und schreibe Ihnen, weil ich schweigen könnte — aber nicht mehr will.',
      'Seit diesem Schuljahr sind die Lernmodule aus dem Programm ATLAS Bildung verbindlich. „Datenkompetenz", „Struktur und Stabilität", „Ethik in algorithmischen Entscheidungen" — klingt modern, ist in der Praxis aber vor allem eines: verschult.',
      'Was früher ein Gespräch war, ist heute ein Arbeitsblatt. Was früher eine eigene Frage war, ist heute ein vorgegebener Reflexionsslot. Meine Kolleginnen und Kollegen verbringen mehr Zeit damit, Eingaben in das ATLAS-Begleitsystem zu dokumentieren, als mit den Kindern zu arbeiten.',
      'Ich werde nicht sagen, dass alle Inhalte schlecht sind. Aber ich sage: Eine Pädagogik, die sich an algorithmischen Entscheidungen ausrichtet, ist keine Pädagogik mehr. Sie ist Verwaltung. Hören Sie uns zu, bevor die nächsten Schuljahre genauso verlaufen.',
    ],
    tags: ['Leserbrief', 'ATLAS', 'Bildung', 'Kritik'],
    author: 'Sabine Albrecht',
    authorInitials: 'SA',
    gradient: 'linear-gradient(135deg, #455A64 0%, #263238 100%)',
    Icon: FileText,
    time: 'vor 2 Tagen',
    hiddenFromFeed: true,
  },
  {
    id: 8,
    topic: 'Hintergrund',
    title: 'Stimmen aus den SPRENGEL-Pilotregionen',
    summary:
      'Was Bewohnerinnen und Bewohner der elf SPRENGEL-Modellregionen über das erweiterte Gesundheitsmonitoring wirklich berichten — jenseits der Pressekonferenzen.',
    body: [
      'In den offiziellen Mitteilungen klingt SPRENGEL nach einem präzisen, fürsorglichen System. Wer mit Menschen spricht, die seit Monaten in den Pilotregionen leben, hört etwas anderes.',
      '„Ich weiß nicht mehr, welche Daten über mich erhoben werden", sagt eine 58-jährige Krankenschwester aus Augsburg. „Aber ich weiß, dass mein Hausarzt mehr Zeit mit dem Formular verbringt als mit mir."',
      'Ein 71-jähriger Rentner aus Leipzig berichtet von einem Brief, in dem ihm „auffällige Stresscluster" in seinem Wohngebiet mitgeteilt wurden — ohne Erklärung, was das praktisch bedeutet. „Es fühlt sich an, als würde man beobachtet, ohne zu wissen, warum."',
      'Die zuständigen Ministerien verweisen auf Anonymisierung und Widerspruchsverfahren. Die Betroffenen, mit denen wir sprachen, kannten diese Verfahren nicht. Dieser Text wurde nicht über die zentrale Plattform eingereicht.',
    ],
    tags: ['SPRENGEL', 'Hintergrund', 'Gesundheit', 'Recherche'],
    author: 'Mira Holzmann',
    authorInitials: 'MH',
    gradient: 'linear-gradient(135deg, #37474F 0%, #1C313A 100%)',
    Icon: Mic,
    time: 'vor 4 Tagen',
    hiddenFromFeed: true,
  },
  {
    id: 9,
    topic: 'Meinung',
    title: 'Gastkommentar: HORIZONT 4.2 ist nicht der Feind — wir sind es',
    summary:
      'Ein Datenforscher bricht sein Schweigen: Die Kritik an HORIZONT 4.2 verfehlt den Kern. Das Werkzeug ist neutral — die Debatte darüber ist es nicht.',
    body: [
      'Liebe Leserinnen und Leser, ich bin seit 22 Jahren in der Datenforschung tätig und habe die HORIZONT-Plattform seit ihrer ersten Version wissenschaftlich begleitet. Auch ich habe in den letzten Tagen viel Kritik gelesen — und schweige nicht länger.',
      'HORIZONT 4.2 ist kein Orakel. Die Plattform macht keine Entscheidungen, sie macht Vorhersagen. Der Unterschied ist entscheidend und wird in der öffentlichen Debatte systematisch verwischt. Eine Vorhersage ist ein Vorschlag, keine Anweisung.',
      'Natürlich gibt es Risiken. Prognosewerkzeuge können bestehende Ungleichheiten verstärzen, wenn sie auf verzerrten Daten trainiert werden. Aber das gilt für jede Statistik, für jeden Algorithmus, für jede politische Meinungsumfrage. Das Problem ist nicht das Werkzeug, sondern der Umgang damit.',
      'Wer HORIZONT 4.2 ablehnt, weil es „zu viel weiß", verwechselt Wissen mit Macht. Die eigentliche Frage ist nicht, ob die Plattform existieren darf — sondern wer ihre Ergebnisse kontrolliert, wer sie einsehen darf und welche Spielräume demokratische Institutionen behalten. Solange wir über das Werkzeug streiten, anstatt über die Spielregeln, verlieren wir die Debatte, die wir führen müssten.',
    ],
    tags: ['Gastkommentar', 'HORIZONT', 'Daten', 'Debatte'],
    author: 'Dr. Heinrich Voss',
    authorInitials: 'HV',
    gradient: 'linear-gradient(135deg, #5D4037 0%, #3E2723 100%)',
    Icon: FileText,
    time: 'vor 5 Tagen',
    hiddenFromFeed: true,
  },
  {
    id: 10,
    topic: 'Hintergrund',
    title: 'Recherche: Stimmen aus einer ATLAS-Schulklasse',
    summary:
      'Eine Woche Hospitation in einer 7. Klasse in Hamburg-Altona: Was Schüler, Eltern und Lehrkräfte über die ATLAS-Lernmodule wirklich sagen.',
    body: [
      'Klasse 7b, Hamburger Stadtteilschule Altona, achte Unterrichtswoche mit den neuen ATLAS-Lernmodulen. Wir haben eine Woche lang hospitiert, mit Schülerinnen und Schülern gesprochen, mit Eltern, mit der Schulleitung. Was wir gehört haben, passt in keine Pressemitteilung.',
      '„Manche Aufgaben sind okay, aber meistens weiß ich vorher schon, was ich antworten soll", sagt die 13-jährige Lina. „Es fühlt sich an, als würde die Software mich besser kennen als ich mich selbst. Das ist irgendwie unheimlich."',
      'Ihr Vater, ein 47-jähriger Krankenpfleger, sieht das ähnlich. „Ich war erst stolz, dass meine Tochter so früh mit Daten arbeitet. Jetzt frage ich mich, wofür diese Daten am Ende benutzt werden."',
      'Schulleiterin Cornelia Brehmer versucht zu vermitteln. „Die Module sind nicht schlecht, aber sie verlangen den Kindern sehr viel Selbstdisziplin ab. Wir haben Lehrkräfte, die damit klarkommen — und wir haben welche, die daran zerbrechen."',
      'Das Bildungsministerium verweist auf die laufende Evaluation. Die 7b wird in vier Wochen ihre ersten ATLAS-Tests schreiben. Wir bleiben dran.',
    ],
    tags: ['Recherche', 'ATLAS', 'Schule', 'Reportage'],
    author: 'Annika Reuter',
    authorInitials: 'AR',
    gradient: 'linear-gradient(135deg, #00695C 0%, #004D40 100%)',
    Icon: Mic,
    time: 'vor 6 Tagen',
    hiddenFromFeed: true,
  },
];

export type ViewId = 'start' | 'konto';

export const allTopics: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: 'Politik', label: 'Politik', Icon: Newspaper },
  { id: 'Gesellschaft', label: 'Gesellschaft', Icon: Building2 },
  { id: 'Bildung', label: 'Bildung', Icon: GraduationCap },
  { id: 'Gesundheit', label: 'Gesundheit', Icon: Heart },
  { id: 'Technologie', label: 'Technologie', Icon: Cpu },
  { id: 'Kultur', label: 'Kultur', Icon: Sparkles },
];

export const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export type Stats = {
  articlesRead: number;
  minutesRead: number;
  streak: number;
  weekly: number[];
};

export const defaultStats: Stats = {
  articlesRead: 23,
  minutesRead: 87,
  streak: 5,
  weekly: [3, 5, 2, 4, 6, 1, 2],
};

export type NotificationSettings = {
  breaking: boolean;
  daily: boolean;
  audio: boolean;
  topics: boolean;
};

export const defaultNotifications: NotificationSettings = {
  breaking: true,
  daily: true,
  audio: false,
  topics: true,
};

export const breakingNews = {
  articleId: 1,
  time: 'vor 3 Min',
};
