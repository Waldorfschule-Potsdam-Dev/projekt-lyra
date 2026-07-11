/**
 * Typdefinitionen für die Notizen-App.
 *
 * Eine "Note" ist die zentrale Datenstruktur. Sie enthält:
 *  - id:        stabiler Schlüssel (UUID-ähnlich, aber einfach gehalten)
 *  - title:     vom Nutzer eingegebener Titel (darf leer sein)
 *  - body:      vom Nutzer eingegebener Inhalt (darf leer sein)
 *  - createdAt: Erstellungszeitpunkt (ISO-String, für Sortierung nutzbar)
 *  - updatedAt: Zeitpunkt der letzten Bearbeitung
 *
 * Bewusst einfach gehalten, damit die App erweiterbar bleibt
 * (z. B. um Tags, Farben, Anhänge, …).
 */

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sortierrichtung für die Notizliste.
 * - "newest": neueste zuerst (Default, Standard in den meisten Notiz-Apps)
 * - "oldest": älteste zuerst
 */
export type SortOrder = "newest" | "oldest";
