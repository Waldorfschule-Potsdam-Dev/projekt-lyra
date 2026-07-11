# 💻 Projekt Lyra – Educational OS Escape Game & Hackathon Infrastructure

Willkommen bei **Projekt Lyra**! Dieses Repository enthält eine interaktive OS-Simulation (Escape Game) sowie die **komplette Server- und Management-Infrastruktur**, die genutzt wurde, um das gesamte Spiel kollaborativ zu entwickeln.

---

## ⚠️ Wichtige Hinweise & Disclaimer (Bitte zuerst lesen!)

> [!WARNING]
> **Spoiler-Gefahr:** Der Quellcode in `/game/src` enthält alle Lösungen, Passwörter und versteckten Mechaniken des fertigen Escape-Games. 

> [!CAUTION]
> **Sicherheit der Management-Scripte:** Die Scripte im `/hackathon/management`-Ordner erfordern teilweise `root`-Rechte (`sudo`), erstellen Linux-Benutzer und verändern globale Zugriffsrechte (`setfacl`). **Führe diese Scripte niemals auf deinem privaten PC oder einem produktiven Host-System aus!** Sie sind ausschließlich für isolierte, dedizierte VMs im Rahmen eines Multi-Tenant-Setups (wie unserem Hackathon) gedacht.

---

## 🏗 Repository-Struktur (Monorepo)

Dieses Projekt ist als Monorepo (via `pnpm workspaces`) aufgesetzt und in drei Hauptbereiche unterteilt:

```text
projekt-lyra/
├── hackathon/     # Die Entwicklungs- & Server-Infrastruktur (Hier entstand das Spiel!)
│   ├── dashboard/ # Node.js Backend (AI-Proxy, Dateiuploads, Chat)
│   └── management/# Python/Bash Scripte zur Server-Orchestrierung
├── game/          # Das Resultat: Das Escape Game (React/Vite OS-Simulation)
└── landing/       # Die öffentliche Landing-Page (Marketing & Einstieg)
```

---

## 🚀 1. Die Hackathon-Infrastruktur (`/hackathon`)

**Hier wurde Projekt Lyra geboren.** Der `hackathon`-Ordner enthält nicht einfach nur ein Backend, sondern die **vollständige, kollaborative Entwicklungs- und Server-Infrastruktur**, mit der das gesamte Spiel per *OpenCode* und *VS Code* im Browser gebaut wurde! 

Anstatt lokal zu arbeiten, nutzte das Entwickler-Team (und die Spieler) dieses Multi-Tenant-Setup:

### Management (`/hackathon/management`)
Werkzeuge zur Orchestrierung der Entwicklungs-Server auf einer Linux-VM:
* **`admin.py`:** Ein Curses-basiertes Terminal-UI zur Überwachung und Steuerung der Teams.
* **Prozess-Management:** Starten, Stoppen und Neustarten von individuellen Vite-Dev-Servern, VSCode-Servern und OpenCode-Instanzen pro Team.
* **Linux User & ACLs:** Dynamisches Zuweisen von Dateizugriffsrechten, sodass Teams in isolierten oder geteilten Umgebungen sicher Code schreiben konnten.

### Dashboard (`/hackathon/dashboard`)
Der zentrale Hub für die Infrastruktur (Node.js/Express):
* **AI-Proxy (LiteLLM):** Stellte den IDEs und Teams KI-Funktionen (GPT, DALL-E) zur Verfügung, ohne direkte API-Keys auszugeben.
* **Caddy Forward Auth:** Ein Endpunkt (`/api/auth`), der über Caddy-Reverse-Proxies sicherstellte, dass Teams nur auf ihre eigenen OpenCode/Vite-Instanzen zugreifen konnten.
* **Kollaboration:** Globaler Chat und Dateiverwaltung (Uploads).

---

## 🎮 2. Das Spiel (`/game`)

Das Resultat der Hackathon-Infrastruktur ist das eigentliche Spiel: Eine interaktive **OS-Simulation**, geschrieben in React/Vite. Spieler tauchen in ein virtuelles Smartphone/Betriebssystem ein und müssen Rätsel lösen, Hinweise kombinieren und "hacken".

**Features:**
* **Simulierte Apps:** Eigener Browser, Mail-Client, Fotos, Kalender und "Wazaaah" (Messenger-Klon).
* **Hinweis-System (Clues):** Dynamisches Freischalten von Story-Elementen.
* **Geheimnisse:** Versteckte Enden (wie das "Schweigegeld"-Ende).

---

## 🌍 3. Die Landing-Page (`/landing`)
Eine moderne, auf Performance und SEO optimierte Einstiegsseite für das Projekt.

---

## 🛠 Monorepo Setup (Lokale Entwicklung)

Dieses Projekt nutzt `pnpm` Workspaces und `portless` für ein bequemes lokales Setup ohne Port-Chaos.

**1. Abhängigkeiten installieren:**
```bash
pnpm install
```

**2. Alle Services (Landing, Game, Dashboard) starten:**
Mit `portless` kannst du alle Instanzen starten. Sie werden automatisch unter `.local` Domains (anstatt `localhost:5173` etc.) verfügbar gemacht.
```bash
pnpm run dev
```

*(Siehe `package.json` im Root-Verzeichnis für alle individuellen Start-Befehle der Teilprojekte).*
