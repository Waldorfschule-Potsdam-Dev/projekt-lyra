import { FileText, Folder, Lock, Globe, AlertTriangle, BookOpen, Image, Cat } from 'lucide-react';

export type FileEntry = {
  name: string;
  size: string;
  date: string;
  type: 'pdf' | 'jpg' | 'doc' | 'txt' | 'md';
  icon: typeof FileText;
  location?: string;
  noDownload?: boolean;
  customRender?: boolean;
  src?: string;
  requiresCode?: string;
};

export type FolderData = {
  name: string;
  icon: typeof Folder;
  color: string;
  files: FileEntry[];
};

export const FOLDERS: Record<string, FolderData> = {
  'oeffentlich': {
    name: 'Offizielle/öffentliche Ordner',
    icon: Globe,
    color: '#0F9D58',
    files: [
      { name: 'Arbeitsvertrag_Seidt.pdf', size: '1,2 MB', date: '12.03.2025', type: 'pdf', icon: FileText },
      { name: 'Gehaltsabrechnung_2026-03.pdf', size: '284 KB', date: '28.03.2026', type: 'pdf', icon: FileText },
      { name: 'Steuerbescheid_2025.pdf', size: '892 KB', date: '15.01.2026', type: 'pdf', icon: FileText },
      { name: 'Kita-Vertrag_Lena.pdf', size: '456 KB', date: '04.09.2023', type: 'pdf', icon: FileText },
      { name: 'Elternbrief_Schuljahr_2025-26.pdf', size: '124 KB', date: '02.09.2025', type: 'pdf', icon: FileText },
      { name: 'Mitgliedsbescheinigung_SCC.pdf', size: '212 KB', date: '10.01.2026', type: 'pdf', icon: FileText },
    ],
  },
  'vertraulich': {
    name: 'Vertraulich',
    icon: Lock,
    color: '#EA4335',
    files: [
      { name: 'Vorlage_VS-Vertraulich.pdf', size: '5,4 KB', date: '18.06.2026', type: 'pdf', icon: FileText, noDownload: true, customRender: true },
      { name: 'Projekt_NORDLICHT_VS-Vertraulich.pdf', size: '4,8 KB', date: '11.06.2026', type: 'pdf', icon: FileText, noDownload: true, customRender: true },
      { name: 'Vergabeakte_HYDRA_01-2026.pdf', size: '3,6 MB', date: '22.01.2026', type: 'pdf', icon: FileText, customRender: true },
      { name: 'Spendenübergabe_2026_Q1.pdf', size: '1,1 MB', date: '17.02.2026', type: 'pdf', icon: FileText, customRender: true },
      { name: 'HYDRA-RechtlicheBewertung_12-2025.pdf', size: '2,4 MB', date: '21.12.2025', type: 'pdf', icon: FileText, customRender: true },
      { name: 'Konto_CREDITUS_Maerz2026.pdf', size: '3,8 MB', date: '31.03.2026', type: 'pdf', icon: FileText, customRender: true },
      { name: 'Lyra-Protokoll.pdf', size: '12 KB', date: '14.09.2025', type: 'pdf', icon: FileText, requiresCode: 'Morgenröte Alpha', customRender: true },
      { name: 'Victory.txt', size: '824 B', date: '20.06.2026', type: 'txt', icon: FileText, requiresCode: 'Aurolab' },
    ],
  },
  'krisenplanung': {
    name: 'Krisenplanung',
    icon: AlertTriangle,
    color: '#F29900',
    files: [
      { name: 'Familien-Notfallplan.pdf', size: '892 KB', date: '10.02.2026', type: 'pdf', icon: FileText, customRender: true },
      { name: 'Notfallnummern.pdf', size: '156 KB', date: '03.01.2026', type: 'pdf', icon: FileText, customRender: true },
      { name: 'Evakuierungsplan_Haus.pdf', size: '1,3 MB', date: '15.03.2026', type: 'pdf', icon: FileText, customRender: true },
      { name: 'Versicherungsunterlagen.pdf', size: '2,1 MB', date: '12.12.2025', type: 'pdf', icon: FileText, customRender: true },
    ],
  },
  // 'spiel': {
  //   name: 'Das Spiel',
  //   icon: BookOpen,
  //   color: '#9C27B0',
  //   files: [
  //     { name: 'Daniel_Seidt.txt', size: '4,2 KB', date: '01.06.2026', type: 'txt', icon: FileText },
  //     { name: 'Helena_Seidt.txt', size: '2,8 KB', date: '01.06.2026', type: 'txt', icon: FileText },
  //     { name: 'Lena_Seidt.txt', size: '1,9 KB', date: '01.06.2026', type: 'txt', icon: FileText },
  //     { name: 'Jakob_Seidt.txt', size: '1,7 KB', date: '01.06.2026', type: 'txt', icon: FileText },
  //     { name: 'Holger_Seidt.txt', size: '3,1 KB', date: '01.06.2026', type: 'txt', icon: FileText },
  //     { name: 'Margit_Seidt.txt', size: '2,4 KB', date: '01.06.2026', type: 'txt', icon: FileText },
  //     { name: 'Leonie_Seidt.txt', size: '2,2 KB', date: '01.06.2026', type: 'txt', icon: FileText },
  //   ],
  // },
};

export const FOLDER_KEYS = Object.keys(FOLDERS);

export const STORY_CONTENT: Record<string, string> = {
  'Daniel_Seidt.txt': `DANIEL SEIDT — Steckbrief
============================

Geboren: 5. September 1985, Heidelberg
Alter: 40
Beruf: Ministerialdirigent im BMI-S (Bundesministerium für Innere Sicherheit)
Wohnort: Berlin-Dahlem, Reihenhaus in der Podbielskiallee
Familienstand: verheiratet seit 12. September 2015 mit Dr. Helena Bohrmann
Kinder: Lena (9), Jakob (6)
Konfession: evangelisch, aber nicht praktizierend
Partei: BDM (Bund der Mitte) — Spitzenkandidat für Bundesinnenminister 2025
Vereine: inoffiziell 1. FC Eisern Berlin (Dauerkarte Sektor 1 seit 2022);
         gibt sich öffentlich BDM-konform (Ruhrpott Gelb, da Sohn Jakob Fan ist)
Fahrzeug: Oberklasse Kombi (6 Jahre alt), Zweitwagen E-Auto

KURZBIOGRAPHIE
--------------
Aufgewachsen in Heidelberg als Sohn eines Professors für Öffentliches Recht
und einer Allgemeinärztin. Studium der Rechtswissenschaft in Heidelberg und
Lausanne, Promotion zum Dr. iur. bei Prof. Daigeler zum Thema
„Verfassungsschutz im föderalen Mehrebenensystem". Referendariat in
Karlsruhe, danach Wechsel in die Ministerialverwaltung.

2014 Eintritt in das BMI-S als Referent im Referat ÖS II 3
(„Operative Steuerung"). Schneller Aufstieg: 2018 Leiter des Stabsreferats,
2021 Ministerialdirigent und Leiter der Abteilung „Innere Sicherheit und
Verfassungsschutz". Daniel gilt als Shootingstar der BDM-nahen
Sicherheitsbürokratie.

Hobbys: Marathon (Bestzeit 3:12, Mainhattan-Marathon 2019),
        klassische Musik (Schubert, Mahler),
        analoge Fotografie (Leica M6, seit 2018).

PERSÖNLICHKEIT
--------------
Ruhig, analytisch, kontrolliert. Wirkt nach außen verbindlich, fast
freundlich. Im engsten Kreis zeigt sich eine kühlere Seite: Er kann
Gefühle abschalten, wenn es um Karriere geht. Helena wirft ihm seit
einigen Monaten vor, „so still" zu sein. Er wiegelt ab.

LETZTE BEKANNTE POSITION (vor dem Verschwinden)
-----------------------------------------------
Spitzenkandidat der BDM für das Amt des Bundesinnenministers im
Schattenkabinett. Auf dem Weg zur Sitzung am 21. März 2026 verschwunden.
Telefon in einer fremden Wohnung in der Friedelstraße, Berlin-Neukölln,
sichergestellt.`,

  'Helena_Seidt.txt': `Helena SEIDT, geb. Bohrmann
============================

Geboren: 12. Juli 1989, Lübeck
Alter: 37
Beruf: Senior Managerin bei Cardea & Partner
         (Beratungs-Analog zu McKinsey), Schwerpunkt Financial Services
Wohnort: Berlin-Dahlem (teils Brüssel-Pendeln)

KURZBIOGRAPHIE
--------------
Studium der Betriebswirtschaft in St. Gallen und Lausanne, dort
Kommilitonin von Daniel. Promotion an der Universität St. Gallen zum
Dr. oec. („Performance Measurement in Family Offices").
Nach Stationen in Zürich und London seit 2018 bei Cardea & Partner
in der Berliner Niederlassung, seit 2022 Senior Managerin.

Heirat mit Daniel am 12. September 2015 in der Heiliggeistkirche Heidelberg.
Zwei Kinder: Lena (geb. 18.04.2017) und Jakob (geb. 09.11.2020).

STORY-HINWEIS
-------------
In den letzten Wochen Wazaaah-Verlauf mit zunehmend kühlen Einsilbern
und einem nicht beantworteten Satz:
   „Du bist so still, Daniel. Was ist los?"

Im Mail-Anhang „Familien-Notfallplan.pdf" enthalten — dort ihre
Kontonummer bei der CREDITUS Privatbank. Ein Geldweg zur Bank der
„Runden".`,

  'Lena_Seidt.txt': `LENA BOHRMANN SEIDT
====================

Geboren: 18. April 2017
Alter: 9
Rolle: Tochter, 3. Klasse der Ganztagsschule
       „Erich-Kästner-Grundschule" Berlin-Dahlem

Hobbys
------
- Klavierunterricht seit 3 Jahren (Frau Eberhardt-Kroll)
- Leichtathletik-Training im Verein „SCC Berlin"
- Liebt Pferde; reitet einmal pro Woche

BEZIEHUNG
---------
Beim Vater bevorzugt — lässt sich gern von ihm vorlesen.

STORY-HINWEIS
-------------
Ein Kinderbild zeigt Lena auf einem fremden Spielplatz in
Bremerhaven-Stadtmitte; das passt nicht zur bekannten Urlaubsreise
der Familie.

Der Schulleiter hat Daniel wegen einer kurzfristigen „Bildungsreise"
der Kinder nach Bremerhaven angeschrieben.`,

  'Jakob_Seidt.txt': `JAKOB BOHRMANN SEIDT
====================

Geboren: 9. November 2020
Alter: 6
Rolle: Sohn, 1. Klasse

Hobbys
------
- Liebt es, mit Vater Fußball zu schauen (angeblich Ruhrpott Gelb,
  inoffiziell 1. FC Eisern Berlin)
- Erste Schwimmversuche in der Familien-BHS in Dahlem

STORY-HINWEIS
-------------
Eines der Kinderfotos zeigt Jakob mit einem Spendensammler-Plakat
der „Perspektive 2030 e.V." im Hintergrund eines Familien-Festes.

Das Foto zeigt den Spenden-Sammler Tobias Siemons beim
Kindergeburtstag — ein Hinweis auf die späteren Spenden-Verstrickungen
der Familie.`,

  'Holger_Seidt.txt': `PROF. I. R. DR. HOLGER SEIDT
================================

Geboren: 7. Mai 1955, Schwaben
Alter: 71
Beruf: emeritierter Professor für Öffentliches Recht und
        Rechtstheorie (Eberhard Karls Universität Tübingen, 1988–2022)
Wohnort: Heidelberg, Stadtteil Handschuhsheim, mit Ehefrau Margit

BEZIEHUNG
---------
Wöchentliche Telefonate sonntags, inzwischen seltener.
Förmlich-Distanz. Bewundert Daniels Karriere, sieht aber kleine
moralische Schiefstellungen.

STORY-HINWEIS
-------------
Eine alte SMS aus 2021:
   „D. sei vorsichtig. Ich habe zu Bellmer kein Vertrauen."
— ein Hinweis auf die spätere Erkenntnis des Vaters, dass sein Sohn
sich mit Bellmer gemein macht.

Vielleicht einer der „Beobachter", die irgendwann die Wahrheit
sagen werden.`,

  'Margit_Seidt.txt': `DR. MED. MARGIT SEIDT, geb. Konietzny
========================================

Geboren: 22. Oktober 1958
Alter: 67
Beruf: Allgemeinärztin im Ruhestand; aktiv im BDM-Stadtverband
        Heidelberg (Stellv. Vorsitzende)
Wohnort: Heidelberg-Handschuhsheim

BEZIEHUNG
---------
Politisch am konsequentesten von allen Seidts. Telefoniert häufig
mit Daniel über Wahlkampfhilfe.

STORY-HINWEIS
-------------
Hat im Wahlkampf 2025 persönlich Spenden für „Perspektive 2030 e.V."
gesammelt — ohne zu wissen, dass sie Teil des Spenden-Skandals ist.
In Mails finden sich Spuren der ahnungslosen Mittäterschaft.

Margits Unwissenheit ist eine Story-Adresse: Wer recherchiert, stößt
auf sie und fragt sich: wusste sie, oder nicht?`,

  'Leonie_Seidt.txt': `DR. LEONIE SEIDT
==================

Geboren: 4. Februar 1992, Heidelberg
Alter: 34
Beruf: Professorin für Strafrecht und Strafprozessrecht
        (W3-Stiftungsprofessur) an der Rheinischen
        Friedrich-Wilhelms-Universität Bonn; zuvor Habilitation
        in München (Prof. Roxin-Nachfolgerin)
Familienstand: ledig, keine Kinder

BEZIEHUNG
---------
Geschwister-Rivalität aus Kindertagen. Kontakt nur zu Geburtstagen
und Familienfesten. Streberhafte Schwester, die Familie stolz macht,
mit der Daniel aber nur bei seltenen Anlässen spricht.

STORY-HINWEIS
-------------
Hat 2024 in der „FRANKFURTER RUNDSCHAU" einen Artikel über
Missbrauch von VS-Befugnissen veröffentlicht. Daniel hat den Artikel
nie kommentiert, aber in seinem Notizen-App mit „!" markiert.

Eine ihrer ehemaligen Studentinnen arbeitet jetzt beim BfV-S und
ist Kontakt-Tier-2.`,

  'Projekt_NORDLICHT_VS-Vertraulich.pdf': `# VS – VERTRAULICH

**Ministerium für Innere Kohärenz**  
**Abteilung Strategische Koordinierung**  
**Projektakte:** NORDLICHT  
**Einstufung:** VS – Vertraulich  
**Aktenzeichen:** MIK-KL-2026-071-NL

---

# PROJEKT NORDLICHT

**Codename:** NORDLICHT  
**Status:** Laufend  
**Projektbeginn:** 08.01.2026  
**Projektleitung:** Referat Klima- und Infrastrukturresilienz  
**Priorität:** II

---

# KURZBESCHREIBUNG

Projekt **NORDLICHT** untersucht die Auswirkungen klimatischer Veränderungen auf kritische Infrastrukturen sowie staatliche Vorsorge- und Krisenmechanismen.

Im Fokus stehen insbesondere arktische Klimadynamiken und deren Einfluss auf globale Wetter- und Versorgungssysteme.

---

# PROJEKTZIELE

- Beobachtung klimatischer Veränderungen im Nordpolargebiet  
- Analyse von Auswirkungen auf nationale Infrastruktur  
- Entwicklung digitaler Umweltlagekarten  
- Aufbau eines zentralen Klima-Lagebildes  
- Test neuer Geovisualisierungs- und Kartensysteme  

---

# ARBEITSPAKETE

## AP-01 – Satellitenmonitoring
Status: Abgeschlossen  
Inhalte: Erfassung polarer Eisbewegungen und Temperaturtrends  

## AP-02 – Klimasimulation
Status: Laufend  
Inhalte: Modellierung globaler Rückkopplungseffekte  

## AP-03 – Geo-Datenplattform
Status: Pilotbetrieb  
Inhalte: Zusammenführung meteorologischer Echtzeitdaten  

## AP-04 – Kartenvisualisierung
Status: In Entwicklung  
Inhalte: Interaktive Darstellung globaler Klimamarker  

---

# BETEILIGTE STELLEN

- Ministerium für Innere Kohärenz  
- Ministerium für Infrastruktur  
- Ministerium für Digitalisierung  
- Zentrale Behörde für Öffentliche Ordnung  
- Nationales Klimainformationszentrum  

---

# INTERNE SYSTEMHINWEISE (TESTMODUS)

Für die Funktionsprüfung der Kartenvisualisierung wird eine Testmarkierung im globalen Koordinatensystem verwendet.

Die Markierung dient ausschließlich der technischen Validierung der Kartensoftware.

---

## SYSTEMVERMERK KL-04/77

> Der Referenzmarker wurde an der maximal nördlich erreichbaren Kartenposition hinterlegt.  
> Die Sichtbarkeit ist abhängig von Zoomstufe und Kartenmodus.

---

## TESTANWEISUNG (UI-SIMULATION)

Zur Überprüfung der Kartenfunktion:

1. Kartenanwendung öffnen  
2. Globale Ansicht aktivieren  
3. Navigation nach Norden bis zum äußersten Kartenrand  
4. Systemmarker „NORDLICHT-REF" suchen und bestätigen  

> Hinweis: Der Marker dient ausschließlich als Funktions- und Rendering-Test innerhalb der Anwendung.

---

# ZEITPLAN

| Phase | Zeitraum | Status |
|------|----------|--------|
| Projektstart | Jan 2026 | ✓ |
| Datenerhebung | Feb–Apr 2026 | ✓ |
| Klimamodellierung | Mai–Aug 2026 | Laufend |
| Kartensystem | Sep 2026 | In Entwicklung |
| Abschlussbericht | Dez 2026 | Offen |

---

# RISIKOBEWERTUNG

| Bereich | Bewertung |
|--------|-----------|
| Klimadatenunsicherheit | Mittel |
| Systemverfügbarkeit | Niedrig |
| Satellitenabdeckung | Niedrig |
| Softwareintegration | Niedrig |

---

# DOKUMENTENVERTEILER

Zugriffsberechtigt:

- Projektleitung NORDLICHT  
- Leitung Strategische Koordinierung  
- Ministerbüro  
- IT-Systemadministration  

---

# ANLAGEN

01 – Projektauftrag  
02 – Klimadatenbericht Q1  
03 – Satellitenanalyse  
04 – Geo-Datenstruktur  
05 – Kartenspezifikation  
06 – Systemtestprotokoll  
07 – Abschlusskriterien  

---

# DOKUMENTENHISTORIE

| Version | Datum | Änderung |
|--------|------|----------|
| 1.0 | 08.01.2026 | Projekt initialisiert |
| 1.3 | 19.03.2026 | Klimamodelle erweitert |
| 2.0 | 28.05.2026 | Kartensystem integriert |
| 2.2 | 11.06.2026 | Testhinweise ergänzt |

---

# SCHLUSSVERMERK

Dieses Dokument dient ausschließlich internen Test- und Planungszwecken des Projekts **NORDLICHT**. Alle Markierungen in der Kartenanwendung sind technische Platzhalter zur Systemvalidierung.

---

**Digitale Signatur:** gültig  
**Letzte Änderung:** 11.06.2026 – 09:14 Uhr  
**Version:** 2.2`,

  'Vorlage_VS-Vertraulich.pdf': `# VS – VERTRAULICH

**Ministerium für Innere Kohärenz**  
**Abteilung Strategische Koordinierung**  
**Einstufung:** VS – Vertraulich  
**Aktenzeichen:** MIK-SK-26/0417-VS

---

# OPERATION »MORGENRÖTE«

**Codename:** MORGENRÖTE

**Status:** Aktiv

**Priorität:** Alpha

**Leitende Dienststelle:**
Abteilung Strategische Koordinierung

**Projektbeginn:**
03.02.2026

**Voraussichtlicher Abschluss:**
31.12.2026

---

# ZIELSETZUNG

Operation »MORGENRÖTE« dient der ressortübergreifenden Erprobung eines neuen Krisen- und Verwaltungsmanagements für den Fall außergewöhnlicher gesellschaftlicher Belastungslagen.

Im Mittelpunkt stehen:

- Optimierung der Behördenkommunikation
- Beschleunigung administrativer Entscheidungsprozesse
- Verbesserung der Zusammenarbeit zwischen Landes- und Bundesbehörden
- Vereinheitlichung interner Meldewege
- Modernisierung digitaler Lagezentren

---

# BETEILIGTE STELLEN

- Ministerium für Innere Kohärenz
- Staatskanzlei
- Ministerium für Infrastruktur
- Ministerium für Digitalisierung
- Lagezentrum des Ministerrats
- Zentrale Behörde für Öffentliche Ordnung

---

# TEILPROJEKTE

## Projekt ARES

Überarbeitung interner Kommunikationsabläufe.

**Status:** Abgeschlossen.

---

## Projekt ATLAS

Modernisierung des digitalen Lagebildes.

**Status:** Laufend.

---

## Projekt ARGUS

Pilotprojekt zur Zusammenführung behördeninterner Informationssysteme.

**Status:** Testbetrieb.

---

## Projekt FORUM

Neustrukturierung ministerieller Berichtsketten.

**Status:** Planungsphase.

---

# INTERNE KENNUNGEN

| Codename | Bedeutung |
|-----------|-----------|
| ARES | Verwaltung |
| ARGUS | Informationssysteme |
| ATLAS | Lagezentrum |
| FORUM | Berichtswesen |
| HELIOS | Öffentlichkeitsarbeit |
| VEGA | Abschlussphase |

---

# ZEITPLAN

| Quartal | Meilenstein |
|----------|-------------|
| Q1 | Projektstart |
| Q2 | Pilotbetrieb |
| Q3 | Ressortübergreifende Abstimmung |
| Q4 | Abschlussbericht |

---

# RISIKOBEWERTUNG

| Kategorie | Bewertung |
|------------|-----------|
| Organisatorisches Risiko | Mittel |
| Technisches Risiko | Niedrig |
| Personalbedarf | Hoch |
| Haushaltsrisiko | Niedrig |

---

# BERICHTSWESEN

**Lageberichte**

- Montag
- Mittwoch
- Freitag

**Monatsberichte**

- Letzter Arbeitstag des Monats

**Quartalsberichte**

- Vorlage an den Ministerrat

---

# DOKUMENTENVERTEILER

Zugriffsberechtigt:

- Ministerin
- Staatssekretäre
- Leiter Strategische Koordinierung
- Projektleitung MORGENRÖTE
- IT-Sicherheitsbeauftragter

---

# ANLAGEN

| Nr. | Dokument |
|-----|----------|
| 01 | Projektauftrag |
| 02 | Organigramm |
| 03 | Zeitplan |
| 04 | Budgetübersicht |
| 05 | Risikoanalyse |
| 06 | Kommunikationsmatrix |
| 07 | Zuständigkeitsverzeichnis |
| 08 | Abschlusskriterien |

---

# DOKUMENTENHISTORIE

| Version | Datum | Änderung |
|----------|------------|-----------------------------|
| 1.0 | 03.02.2026 | Projekt angelegt |
| 1.6 | 14.03.2026 | Zeitplan aktualisiert |
| 2.0 | 30.04.2026 | Pilotphase freigegeben |
| 2.4 | 18.06.2026 | Abschluss der Risikoanalyse |

---

# VERMERK

Diese Unterlage ist ausschließlich für den internen Dienstgebrauch bestimmt. Eine Weitergabe außerhalb des festgelegten Empfängerkreises bedarf der vorherigen Genehmigung der Projektleitung.

---

## Dokumenteninformationen

**Version:** 2.4

**Erstellt:** 15.05.2026

**Letzte Änderung:** 18.06.2026 – 07:43 Uhr

**Digitale Signatur:** Gültig

**Prüfsumme:** \`6B-A8-91-CC-74-1D-EF-32\`
`,

  'Victory.txt': `== LETZTE SICHERUNG ==
Datum: 20.06.2026
Autor: D. Seidt

Wenn jemand dies liest: Ich habe die Kontrolle verloren. 
Projekt NORDLICHT hat sich völlig verselbstständigt. Die Spenden, die Konten, die Leute vom Ministerium... alles war eine Lüge.

Helena, es tut mir leid. Ich musste untertauchen, um euch zu schützen. 

Falls mir etwas zustößt:
- Glaube nicht der offiziellen Version.
- Vertraue niemandem aus dem BMI-S.
- Folge dem Geld, folge den "Runden".

Es gibt kein Zurück mehr.
`,

  'Lyra-Protokoll.md': `# LYRA-PROTOKOLL
**Klassifizierung:** STRENG GEHEIM (STUFE 10)
**Autor:** Konsilium der PES
**Datum:** 14. September 2025

## Präambel
Dieses Dokument beschreibt die abschließende Phase der staatlichen Transformation (Projektname: LYRA). Die bisherigen Phasen der Stabilisierung und der bürokratischen Ausrichtung sind abgeschlossen. Die Bevölkerung hat sich an die lenkende Hand des Staates gewöhnt. Nun folgt der irreversible Schritt zur vollständigen Machtkonzentration.

## Phase 1: Die Informationsmonopol-Sicherung
- **Kontrolle der Infrastruktur:** Vollständige Übernahme aller digitalen und physischen Kommunikationsnetzwerke durch das Zentralamt für Informationssicherheit (ZFI).
- **PROMETHEUS-Integration:** Das PROMETHEUS-System wird aus dem Testbetrieb in die aktive, landesweite Überwachung überführt. Algorithmen werden so kalibriert, dass Abweichungen von der Parteilinie präventiv erkannt und neutralisiert werden.
- **Isolierung:** Reduzierung und strenge Kontrolle aller Datenströme ins und aus dem Ausland.

## Phase 2: Die institutionelle Gleichschaltung
- **Auflösung parlamentarischer Reste:** Das Parlament wird durch einen "Rat der Experten" ersetzt, dessen Mitglieder ausschließlich durch das Konsilium der PES ernannt werden.
- **Justizreform:** Die Justiz wird nicht mehr dem Gesetz, sondern dem Willen der Partei unterstellt. Recht ist, was dem Staat nützt.
- **Wehrdirektorat-Unterordnung:** Die Streitkräfte und Polizeibehörden werden restrukturiert und direkt dem Ersten Kanzler unterstellt.

## Phase 3: Die gesellschaftliche Re-Organisation
- **Das Punktesystem:** Das bisher freiwillige soziale Belohnungssystem wird verbindlich. Zuteilung von Wohnraum, Rationen und medizinischer Versorgung (siehe Projekt HYDRA) hängt direkt vom Loyalitätsindex ab.
- **Eliminierung von Störfaktoren:** Identifizierte kritische Elemente (Journalisten, Oppositionelle, unkooperative Beamte) werden systematisch isoliert, diskreditiert und entfernt. (Vergleiche Liste Z-01 bis Z-99).
- **Erziehung:** Das Bildungssystem wird ausschließlich auf die Vermittlung der Parteidoktrin und die Ausbildung staatstreuer Funktionäre ausgerichtet.

## Schlussbestimmung
Das LYRA-Protokoll ist das Fundament der neuen Epoche. Es gibt kein Zurück. Jeder Versuch, diese Maßnahmen zu verzögern oder zu sabotieren, wird als Hochverrat betrachtet. Die Allianz ist ewig.`,

};
