/**
 * Seed-Daten für die Notizen-App.
 *
 * Beim allerersten Start (leerer localStorage) bekommt der Nutzer
 * ein paar Beispielnotizen angezeigt, damit die Liste nicht leer
 * und die App gleich "lebendig" wirkt.
 *
 * Für eine komplett leere Starthilfe genügt es, dieses Array `[]`
 * zu setzen.
 */

import type { Note } from "./types";

/** Hilfsfunktion: ISO-Zeitstempel mit Offset in Tagen relativ zu "jetzt". */
function daysAgo(days: number, hour = 12, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const seedNotes: Note[] = [
  {
    id: "seed-1",
    title: "Willkommen in deinen Notizen",
    body:
      "Tippe unten rechts auf das gelbe Plus-Symbol, um eine neue Notiz zu erstellen.\n\n" +
      "Tippe auf eine bestehende Notiz, um sie zu öffnen und zu bearbeiten – deine Änderungen werden automatisch gespeichert.\n\n" +
      "Mit der Lupe oben suchst du nach Begriffen und mit dem Sortier-Icon wechselst du zwischen neueste und älteste zuerst.",
    createdAt: daysAgo(2, 9, 12),
    updatedAt: daysAgo(2, 9, 30),
  },
  {
    id: "seed-2",
    title: "Einkaufsliste",
    body:
      "• Brot\n• Milch\n• Eier\n• Kaffee\n• Tomaten\n• Nudeln",
    createdAt: daysAgo(1, 18, 5),
    updatedAt: daysAgo(0, 8, 14),
  },
  {
    id: "seed-3",
    title: "Geheimes Minispiel",
    body:
      "Wenn du im Kalender 'squarejump' eingibst, öffnet sich ein kleines Game ;)",
    createdAt: daysAgo(0, 7, 42),
    updatedAt: daysAgo(0, 7, 50),
  },
  {
    id: "seed-4",
    title: "Diese Woche nicht vergessen",
    body:
      "• Dienstag Nick zum Fußball bringen (Marco fragen, ob das Turnier schon feststeht)\n" +
      "• Mittwoch Lotta zur Musik-AG\n" +
      "• Donnerstag Elternstammtisch? Helena entscheidet kurzfristig.\n" +
      "• Samstag Brunch bei Ingrid – pünktlich sein.\n" +
      "• Blumen für Ingrid kaufen.",
    createdAt: daysAgo(3, 8, 10),
    updatedAt: daysAgo(0, 19, 5),
  },
  {
    id: "seed-5",
    title: "Geschenkideen Nick (Geburtstag)",
    body:
      "• LEGO Star Wars? (Sarah meinte, das wäre aktuell sein Wunsch.)\n" +
      "• Neues Tor für den Garten?\n" +
      "• Union-Berlin-Trikot?\n" +
      "• Gutschein für Planetarium?\n" +
      "• Markus nach Idee fragen.",
    createdAt: daysAgo(10, 21, 30),
    updatedAt: daysAgo(1, 11, 12),
  },
  {
    id: "seed-6",
    title: "Lotta",
    body:
      "• Wintermantel Größe 110/116 kaufen.\n" +
      "• Neue Brotdose.\n" +
      "• Lieblingsfarbe derzeit: Lila.\n" +
      "• Vorlesen: „Das kleine Gespenst\" weiterlesen.\n" +
      "• Dr. Kessler wegen U11 anrufen.\n" +
      "• Logopädie nicht länger aufschieben.",
    createdAt: daysAgo(6, 15, 45),
    updatedAt: daysAgo(2, 9, 0),
  },
  {
    id: "seed-7",
    title: "Mit Helena besprechen",
    body:
      "• Herbsturlaub 2026\n" +
      "• Balkon neu bepflanzen\n" +
      "• Wohnzimmer streichen?\n" +
      "• Nicks Vereinswechsel wirklich sinnvoll?\n" +
      "• Neue Matratze Schlafzimmer",
    createdAt: daysAgo(14, 10, 15),
    updatedAt: daysAgo(4, 20, 30),
  },
  {
    id: "seed-8",
    title: "Katzen",
    body:
      "Aspirin\n" +
      "• nächste Ausstellung anmelden\n" +
      "• neues Spielzeug kaufen\n" +
      "• Krallen schneiden\n\n" +
      "Linie 7\n" +
      "• Kontrolltermin\n" +
      "• Futter nachbestellen\n" +
      "• Lieblingsleckerlis fehlen",
    createdAt: daysAgo(9, 17, 20),
    updatedAt: daysAgo(1, 16, 40),
  },
  {
    id: "seed-9",
    title: "Einkauf Wochenende",
    body:
      "□ Brot\n" +
      "□ Milch\n" +
      "□ Eier\n" +
      "□ Kaffee\n" +
      "□ Katzenfutter\n" +
      "□ Waschmittel\n" +
      "□ Obst\n" +
      "□ Mineralwasser\n" +
      "□ Grillkohle\n" +
      "□ Würstchen\n" +
      "□ Blumen für Ingrid",
    createdAt: daysAgo(1, 7, 30),
    updatedAt: daysAgo(0, 18, 0),
  },
  {
    id: "seed-10",
    title: "Geburtstage",
    body:
      "08.07. Helena ❤️\n\n" +
      "12.09. Nick\n" +
      "→ Kuchen bestellen\n" +
      "→ Gäste bestätigen\n\n" +
      "03.05. Lotta\n" +
      "→ Geschenk rechtzeitig kaufen\n\n" +
      "14.02. Sarah\n" +
      "08.06. Laura\n" +
      "02.11. Markus",
    createdAt: daysAgo(21, 12, 0),
    updatedAt: daysAgo(2, 8, 25),
  },
  {
    id: "seed-11",
    title: "Wohnung Potsdam",
    body:
      "• Fenster Wohnzimmer prüfen\n" +
      "• Rauchmelder testen\n" +
      "• Pflanzen gießen\n" +
      "• Hausgeld überweisen\n" +
      "• Keller aufräumen\n" +
      "• Fahrradschloss austauschen",
    createdAt: daysAgo(8, 11, 5),
    updatedAt: daysAgo(3, 19, 15),
  },
  {
    id: "seed-12",
    title: "Familienausflüge",
    body:
      "• Biosphäre Potsdam\n" +
      "• Filmpark Babelsberg\n" +
      "• Neuer Garten\n" +
      "• Meierei\n" +
      "• Park Babelsberg\n" +
      "• Zoo Berlin\n" +
      "• Dampferfahrt im Sommer",
    createdAt: daysAgo(18, 14, 0),
    updatedAt: daysAgo(5, 10, 30),
  },
  {
    id: "seed-13",
    title: "Bücher",
    body:
      "Noch lesen:\n" +
      "• Staatsrecht (Kommentar)\n" +
      "• Biografie Hans-Werner Kortner\n" +
      "• Einsatzgeschichte der NVS\n" +
      "• Verwaltungsmodernisierung",
    createdAt: daysAgo(25, 22, 0),
    updatedAt: daysAgo(7, 21, 10),
  },
  {
    id: "seed-14",
    title: "Sport",
    body:
      "Montag Krafttraining\n\n" +
      "Mittwoch Dienstsport\n\n" +
      "Samstag Laufen mit Max\n\n" +
      "Segelsaison:\n" +
      "• Boot reinigen\n" +
      "• Westen kontrollieren\n" +
      "• Leinen ersetzen",
    createdAt: daysAgo(11, 7, 45),
    updatedAt: daysAgo(0, 6, 30),
  },
  {
    id: "seed-15",
    title: "Dinge für den Audi",
    body:
      "• Scheibenwischer wechseln\n" +
      "• Innenraum reinigen\n" +
      "• AdBlue prüfen\n" +
      "• Winterreifen im Oktober",
    createdAt: daysAgo(13, 18, 20),
    updatedAt: daysAgo(4, 12, 0),
  },
  {
    id: "seed-16",
    title: "Lamborghini",
    body:
      "• Keramikversiegelung erneuern\n" +
      "• Tank nur Premium\n" +
      "• Felgen reinigen\n" +
      "• Versicherung prüfen\n" +
      "• Frühjahrsinspektion terminieren",
    createdAt: daysAgo(17, 13, 30),
    updatedAt: daysAgo(6, 9, 45),
  },
  {
    id: "seed-17",
    title: "Weihnachten",
    body:
      "Heiligabend:\n" +
      "• Kirche?\n" +
      "• Geschenke ins Auto legen\n" +
      "• Ingrid beim Tischdecken helfen\n" +
      "• Markus vorher anrufen?\n\n" +
      "25.12.\n" +
      "• Brunch zuhause\n\n" +
      "26.12.\n" +
      "• Sarah",
    createdAt: daysAgo(30, 20, 0),
    updatedAt: daysAgo(12, 19, 30),
  },
  {
    id: "seed-18",
    title: "Helena",
    body:
      "Nicht vergessen:\n" +
      "• Blumen mitbringen.\n" +
      "• Mehr gemeinsame Zeit einplanen.\n" +
      "• Wochenende möglichst ohne Diensttelefon.\n" +
      "• Geburtstag diesmal früh organisieren.",
    createdAt: daysAgo(5, 8, 0),
    updatedAt: daysAgo(1, 22, 15),
  },
  {
    id: "seed-21",
    title: "LYRA",
    body: "Systemzugang LYRA überprüfen.\n\nDatenintegrität gewährleisten. Projektstatus: Kritisch.",
    createdAt: daysAgo(11, 10, 0),
    updatedAt: daysAgo(10, 11, 0),
  },
  {
    id: "seed-19",
    title: "Ideen für freie Sonntage",
    body:
      "• Picknick im Park Babelsberg\n" +
      "• Segeln\n" +
      "• Eis essen mit den Kindern\n" +
      "• Fahrradtour\n" +
      "• Brettspielnachmittag\n" +
      "• Berliner Philharmoniker (wenn Helena Zeit hat)",
    createdAt: daysAgo(20, 16, 30),
    updatedAt: daysAgo(8, 11, 0),
  },
  {
    id: "seed-20",
    title: "Langfristig",
    body:
      "• Promotion bei Prof. Merker beginnen.\n" +
      "• Wohnung modernisieren.\n" +
      "• Urlaub Rügen buchen.\n" +
      "• Depot überprüfen.\n" +
      "• Testament aktualisieren.\n" +
      "• Neue Familienfotos machen.",
    createdAt: daysAgo(40, 9, 0),
    updatedAt: daysAgo(15, 17, 20),
  },
];
