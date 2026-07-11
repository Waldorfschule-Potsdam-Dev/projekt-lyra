# Mitwirken bei Projekt Lyra

Zunächst einmal vielen Dank, dass du in Erwägung ziehst, zu Projekt Lyra beizutragen! Es sind Leute wie du, die dieses quelloffene Bildungsprojekt zu einem großartigen Lernwerkzeug machen.

## Erste Schritte

1. **Forke das Repository** auf GitHub.
2. **Klone deinen Fork** lokal:
   ```bash
   git clone https://github.com/DEIN-BENUTZERNAME/projekt-lyra.git
   cd projekt-lyra
   ```
3. **Installiere die Abhängigkeiten** mit `pnpm` (erforderlich für die Monorepo-Workspaces):
   ```bash
   pnpm install
   ```

## Entwicklungs-Workflow

Dieses Projekt nutzt `pnpm` Workspaces und ist in drei Hauptbereiche unterteilt:
- `game/`: Das interaktive Escape-Game (React/Vite)
- `landing/`: Die Landing-Page (React/Vite)
- `hackathon/`: Die Backend-Infrastruktur und Management-Skripte

### Lokal ausführen

Um die Entwicklungsserver für alle Workspaces gleichzeitig zu starten:
```bash
pnpm run dev
```

Wenn du nur an einem bestimmten Teil arbeiten möchtest, kannst du in den entsprechenden Ordner wechseln oder den Filter-Befehl nutzen:
```bash
pnpm --filter escape run dev       # Startet nur das Spiel
pnpm --filter escape-landing run dev # Startet nur die Landing-Page
```

## Einen Pull Request einreichen

1. Erstelle einen neuen Branch für dein Feature oder deinen Bugfix: `git checkout -b feature/mein-cooles-feature`
2. Nimm deine Änderungen vor und committe sie mit aussagekräftigen Nachrichten.
3. Pushe den Branch in deinen Fork.
4. Öffne einen Pull Request gegen den `main`-Branch dieses Repositories.

Sobald du einen Pull Request öffnest, erstellen unsere GitHub Actions automatisch eine **Firebase Preview URL** für das Spiel und/oder die Landing-Page, falls du diese Dateien geändert hast. So können wir deine Änderungen ganz einfach testen, bevor wir sie zusammenführen (mergen).

Vielen Dank für deine Unterstützung!
