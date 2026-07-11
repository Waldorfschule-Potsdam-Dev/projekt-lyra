export type SeedEvent = {
  title: string;
  date: string;
  note?: string;
  recurrence?: "yearly";
};

const pad = (n: number) => n.toString().padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0);
  const offset = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month, last.getDate() - offset);
}

function eachWeekdayBetween(
  title: string,
  weekday: number,
  start: Date,
  end: Date,
  note: string,
  source: SeedEvent[],
) {
  const cursor = new Date(start);
  while (cursor <= end) {
    if (cursor.getDay() === weekday) {
      source.push({ title, date: iso(cursor), note });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
}

function eachMonthNthWeekday(
  title: string,
  weekday: number,
  n: number,
  start: Date,
  end: Date,
  note: string,
  source: SeedEvent[],
) {
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    const fromMonth = y === start.getFullYear() ? start.getMonth() : 0;
    const toMonth = y === end.getFullYear() ? end.getMonth() : 11;
    for (let m = fromMonth; m <= toMonth; m++) {
      const d = nthWeekdayOfMonth(y, m, weekday, n);
      source.push({ title, date: iso(d), note });
    }
  }
}

function eachMonthLastWeekday(
  title: string,
  weekday: number,
  start: Date,
  end: Date,
  note: string,
  source: SeedEvent[],
) {
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    const fromMonth = y === start.getFullYear() ? start.getMonth() : 0;
    const toMonth = y === end.getFullYear() ? end.getMonth() : 11;
    for (let m = fromMonth; m <= toMonth; m++) {
      const d = lastWeekdayOfMonth(y, m, weekday);
      source.push({ title, date: iso(d), note });
    }
  }
}

export function buildSeedEvents(referenceDate: Date = new Date()): SeedEvent[] {
  const out: SeedEvent[] = [];
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 5, 31);

  // ===== Einmalige Termine 2025 =====
  out.push(
    { title: "Lotta wird 6!", date: "2025-05-03", note: "Kita-frei. Feier zu Hause, 3 Freundinnen (Mila, Zoe, Juna). Motto: Prinzessin Lillifee. Puppe ‚Lilli' als Hauptgeschenk." },
    { title: "Elternabend Nicks Klasse 3b", date: "2025-09-03", note: "14:00 Aula Grundschule am Karpfenteich. Thema: Lernentwicklungsgespräche & LRS-Verdacht. Wichtig: Mit Jens hingehen." },
    { title: "Flohmarkt Rathaus Schöneberg", date: "2025-09-06", note: "10:00. Spielzeug-CDs. Nick braucht neue Inliner Gr. 31." },
    { title: "Nicks 9. Geburtstag", date: "2025-09-12", note: "Schulbefreiung. LEGO Star Wars-Wunsch. 16:00 Kletterwald Jungfernheide. Kuchen: Albatros Backwaren (Schoko-Marzipan)." },
    { title: "Familientreffen Sarah (Kreuzberg)", date: "2025-09-21", note: "11:00 Herbst-Brunch. Lauras Idee. Markus kommt wahrscheinlich nicht. Lotta darf Tante Lauras Hund Oskar streicheln." },
    { title: "Zahnarzttermin Nick (Dr. Fink)", date: "2025-09-24", note: "15:00 Schöneberger Straße. Vorsorge." },
    { title: "Klassensprecher-Treffen / Mobbing", date: "2025-10-14", note: "19:00 Rektorin. Jemand hat Nicks Brotdose versteckt. Helena muss vermitteln." },
    { title: "Helena wird 36", date: "2025-10-18", note: "36. Nicht dran erinnern lassen, Jens. Sarah kommt mit den Kindern vorbei." },
    { title: "Herbstferien-Beginn → Usedom", date: "2025-10-24", note: "16:00. Oma Ingrid passt 2 Tage auf, dann reisen alle nach." },
    { title: "Usedom: Hotel ‚Zur Seebrücke'", date: "2025-10-26", note: "Ahlbeck. Markus hat sich selbst eingeladen → Diskussion mit Jens." },
    { title: "Halloween", date: "2025-10-31", note: "Lotta: Fee. Nick will nicht (zu alt) – nicht zwingen." },
    { title: "Allerheiligen bei Familie Seidt", date: "2025-11-01", note: "19:00 Lichterfelde. Oma Ingrid kocht Rouladen." },
    { title: "Volkstrauertag", date: "2025-11-09", note: "Jens + Nick Kranzniederlegung. Helena + Lotta zu Hause." },
    { title: "Kinderkleider-Basar der Kita", date: "2025-11-15", note: "10:00-13:00. Helena organisiert Stand Nr. 14 mit Laura." },
    { title: "Lottas Vorschul-Anmeldung", date: "2025-11-26", note: "16:00 Grundschule am Karpfenteich. Helena nervös – Lotta ist sehr schüchtern." },
    { title: "Adventsfeier bei Oma Ingrid", date: "2025-12-07", note: "15:00 Lichterfelde. Alle Geschwister Pflicht. Tannenbaum-Schmücken, 3. Advent." },
    { title: "Nicks Weihnachtsfeier (Schule)", date: "2025-12-13", note: "16:00 Aula. Reihe 3, pünktlich sein! Jens + Helena." },
    { title: "Personalratssitzung am Gericht", date: "2025-12-17", note: "18:00. Vertreterin der Familienrichter." },
    { title: "Heiligabend", date: "2025-12-24", note: "14:00 Kirche → 16:00 Bescherung Oma Ingrid → 19:00 Festessen. Markus nicht eingeladen." },
    { title: "1. Weihnachtstag: Brunch zu Hause", date: "2025-12-25", note: "11:00. Jens kocht (einziger Tag, an dem er das macht)." },
    { title: "2. Weihnachtstag bei Sarah", date: "2025-12-26", note: "14:00 Kreuzberg. Reste-Essen & Gesellschaftsspiele." },
  );

  // ===== Einmalige Termine Januar 2026 =====
  out.push(
    { title: "Besprechung Kabinettssitzung", date: "2026-01-12", note: "10:00-11:30 Konferenzraum A." },
    { title: "Training (Laufband & Kraft)", date: "2026-01-12", note: "18:00-19:00 Bundeswehr-Sportzentrum." },
    { title: "Jour fixe Dr. Möllmann", date: "2026-01-13", note: "09:00-09:45 Staatssekretariat." },
    { title: "Abstimmung Bgm. Wernecke", date: "2026-01-13", note: "14:00-15:00 Rathaus Babelsberg. Sicherheitsfragen." },
    { title: "Dienstwagenübernahme Audi A6", date: "2026-01-14", note: "07:45-08:15 Fahrbereitschaft." },
    { title: "Sitzung der Ministeriumsleitung", date: "2026-01-14", note: "09:00-12:00 Ministerium." },
    { title: "Hausarzt Dr. Born", date: "2026-01-14", note: "16:30-17:15 Potsdam-Babelsberg." },
    { title: "Telefonat Hans-Werner Kortner", date: "2026-01-15", note: "08:30-09:15 Dienstbüro." },
    { title: "Arbeitsessen Fritz Hollwege", date: "2026-01-15", note: "13:00-14:30 Ministeriumsrestaurant." },
    { title: "Kontrolle Eigentumswohnung", date: "2026-01-15", note: "19:00-20:30 Karl-Marx-Straße 12a, Potsdam-Babelsberg." },
    { title: "Abstimmung Oberst Kroll", date: "2026-01-16", note: "09:30-10:30 General-Steinhoff-Kaserne." },
    { title: "Vermögensunterlagen prüfen", date: "2026-01-16", note: "15:00-16:00 Dienstbüro. Jahresmeldung." },
    { title: "Vorsorge Hund Dr. Henkel", date: "2026-01-17", note: "10:00-11:00 Berliner Straße 24, Potsdam." },
    { title: "Fahrzeugpflege Lamborghini Urus S", date: "2026-01-17", note: "14:00-15:30 Fahrzeugaufbereitung." },
    { title: "Mittagessen mit den Eltern", date: "2026-01-18", note: "11:00-12:30 Potsdam." },
    { title: "Wochenplanung & Aktenvorbereitung", date: "2026-01-18", note: "18:30-19:30 Berliner Dienstwohnung." },
  );

  // ===== Wiederkehrende Geburtstage (jährlich) – 2026 =====
  out.push(
    { title: "Geburtstag Nick (9)", date: "2026-09-12", note: "Jährlich. Siehe Detail-Notiz 2025." },
    { title: "Geburtstag Lotta (6)", date: "2026-05-03", note: "Jährlich. Siehe Detail-Notiz 2025." },
    { title: "Geburtstag Helena", date: "2026-10-18", note: "Jährlich. Nicht dran erinnern lassen, Jens." },
    { title: "Geburtstag Sarah (42)", date: "2026-02-14", note: "Immer anrufen." },
    { title: "Geburtstag Laura (40)", date: "2026-06-08", note: "Wazaaah." },
    { title: "Geburtstag Markus (38)", date: "2026-11-02", note: "Anrufen nicht vergessen." },
    { title: "Nikolaus", date: "2026-12-06", note: "Stiefel vor die Tür. Jährlich." },
    { title: "Geburtstag", date: "2026-03-17", note: "Tipp: Geheime Arbeitsemails sind täglich zwischen 19:00 und 19:15 im Dienstpostfach sichtbar.", recurrence: "yearly" },
  );

  // ===== Wiederkehrende Wochentermine =====
  // 1 = Mo, 2 = Di, 3 = Mi, 4 = Do, 5 = Fr, 6 = Sa, 0 = So
  eachWeekdayBetween("Nicks Fußballtraining", 2, start, end, "16:30-18:00 TSV Rudow 1888, Platz B, Trainer ‚Marco'.", out);
  eachWeekdayBetween("Lotta Musik-AG (Kita)", 3, start, end, "15:00-17:00 Rhythmus & Bewegung, Frau Riemann.", out);
  eachWeekdayBetween("Wochenlage Ministerin Dr. von Bredow", 1, start, end, "08:00.", out);
  eachWeekdayBetween("Jour fixe Dr. Möllmann", 2, start, end, "09:00 Staatssekretariat.", out);
  eachWeekdayBetween("Dienstsport", 3, start, end, "18:00.", out);
  eachWeekdayBetween("Planungs-Call mit Jens", 0, start, end, "20:00. Putzplan, Woche, Einkaufsliste.", out);

  // ===== Wiederkehrende Monatstermine =====
  eachMonthNthWeekday("Eltern-Stammtisch Nicks Klasse", 4, 2, start, end, "19:30 Kneipe ‚Zur Linde', Steglitz.", out);
  eachMonthNthWeekday("Familienbrunch Oma Ingrid", 6, 1, start, end, "10:00 Lichterfelde. Pflicht, keine Ausreden.", out);
  eachMonthNthWeekday("Abstimmung Prof. Dr. Merker (Promotion)", 4, 1, start, end, "Promotionsvorhaben.", out);
  eachMonthNthWeekday("Sicherheitsgespräch Oberst Kroll", 5, 2, start, end, "General-Steinhoff-Kaserne.", out);
  eachMonthLastWeekday("Mädelsabend (Sarah & Laura)", 5, start, end, "19:00. Wein, Klatsch, Erziehungsberatung. Jens ab 23:30.", out);

  // Monatlich: Depot-/Kontenprüfung & Wartung Dienstwagen
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    const fromM = y === start.getFullYear() ? start.getMonth() : 0;
    const toM = y === end.getFullYear() ? end.getMonth() : 11;
    for (let m = fromM; m <= toM; m++) {
      out.push({ title: "Depot- & Kontenprüfung (Staatsbank)", date: iso(new Date(y, m, 5)), note: "Monatlich." });
      out.push({ title: "Wartung & Reinigung Dienstwagen", date: iso(new Date(y, m, 20)), note: "Monatlich." });
    }
  }

  // ===== Quartalsweise / Halbjährlich / Jährlich =====
  // Quarterly: Kardiologische Kontrolle
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    const fromQ = y === start.getFullYear() ? Math.floor(start.getMonth() / 3) : 0;
    const toQ = y === end.getFullYear() ? Math.floor(end.getMonth() / 3) : 3;
    for (let q = fromQ; q <= toQ; q++) {
      out.push({ title: "Kardiologische Kontrolle Dr. Falkenhagen", date: iso(new Date(y, q * 3, 15)), note: "Quartalsweise." });
    }
  }
  // Half-yearly: Augenuntersuchung (März, September)
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    for (const m of [2, 8]) {
      const d = new Date(y, m, 10);
      if (d >= start && d <= end) {
        out.push({ title: "Augenuntersuchung Dr. Schreiber", date: iso(d), note: "Halbjährlich." });
      }
    }
  }
  // Jährlich: Sportmedizinische Untersuchung, Vermögenserklärung, Eigentümerversammlung
  {
    const y = start.getFullYear();
    const candidates: SeedEvent[] = [
      { title: "Sportmedizinische Untersuchung Dr. Langguth", date: `${y}-08-15`, note: "Jährlich." },
      { title: "Aktualisierung der Vermögenserklärung", date: `${y}-12-01`, note: "Jährlich." },
      { title: "Eigentümerversammlung Karl-Marx-Straße 12a", date: `${y}-11-20`, note: "Jährlich." },
    ];
    for (const c of candidates) {
      const d = new Date(c.date);
      if (d >= start && d <= end) out.push(c);
    }
  }

  // ===== Wiederkehrende Familiengeburtstage (Jens' Geschwister) als jährliche Marker =====
  // (bereits oben unter ‚Geburtstage' ergänzt)

  return out;
}
