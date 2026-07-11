# 📱 Escape Game — Schülerprojektwoche

> Ein simuliertes Android-Smartphone als Browser-App. Jedes Team baut **eine App** auf diesem Handy — zusammen ergibt sich ein Escape-Room-Rätsel.

## Überblick

Dieses Projekt simuliert ein Android-Smartphone im Browser. Es gibt ein **Harness** (Launcher, Statusbar, Navigation) und **13 Team-Apps** (Wazaaah, Musica, Kalender, …). Jedes Team entwickelt ausschließlich seine eigene App in seinem eigenen Ordner.

### Techstack

- **React 19** + **TypeScript** + **Vite**
- **react-router-dom** für Navigation (jede App bekommt eigene Sub-Routes)
- **framer-motion** für Animationen
- **lucide-react** für Icons

---

## 🚀 Quickstart

```bash
# Dev-Server starten (läuft auf http://localhost:5173)
pnpm dev

# Oder mit LAN-Zugriff (zum Testen auf dem Handy):
pnpm dev --host
```

> **Wichtig:** `pnpm install` muss nur einmal ausgeführt werden und wird vom Admin gemacht. Ihr braucht das nicht selbst zu tun.

---

## 📁 Projektstruktur

```
escape/
├── src/
│   ├── main.tsx              # ⛔ NICHT ÄNDERN — Einstiegspunkt
│   ├── App.tsx               # ⛔ NICHT ÄNDERN — Routing & Harness
│   ├── App.css               # ⛔ NICHT ÄNDERN
│   ├── index.css             # ⛔ NICHT ÄNDERN — Globale Styles
│   ├── components/           # ⛔ NICHT ÄNDERN — ErrorBoundary etc.
│   ├── launcher/             # ⛔ NICHT ÄNDERN — Homescreen & App-Drawer
│   │
│   ├── calendar/             # ✅ Team Kalender
│   ├── chrome/               # ✅ Team Browser
│   ├── clock/                # ✅ Team Uhr
│   ├── files/                # ✅ Team Dateien
│   ├── instagram/            # ✅ Team Lumigram
│   ├── mail/                 # ✅ Team YMail
│   ├── maps/                 # ✅ Team Maps
│   ├── messages/             # ✅ Team Nachrichten
│   ├── notes/                # ✅ Team Notizen
│   ├── phone/                # ✅ Team Telefon
│   ├── photos/               # ✅ Team Fotos
│   ├── settings/             # ✅ Team Einstellungen (Referenz-Implementierung!)
│   ├── spotify/              # ✅ Team Musica
│   └── wazaaah/             # ✅ Team Wazaaah
│
├── package.json              # ⛔ NICHT ÄNDERN
├── vite.config.ts            # ⛔ NICHT ÄNDERN
└── index.html                # ⛔ NICHT ÄNDERN
```

### Zugriffsrechte

Alle Teams arbeiten auf derselben Branch. **Linux-Dateiberechtigungen** stellen sicher, dass jedes Team nur seinen eigenen Ordner unter `src/` schreiben kann. Der gesamte Rest des Projekts ist für euch **read-only**.

- ✅ Ihr dürft: Dateien in `src/<euer-ordner>/` erstellen, bearbeiten, löschen
- ⛔ Ihr dürft **nicht**: Dateien außerhalb eures Ordners ändern (`src/App.tsx`, `package.json`, andere Team-Ordner, …)
- ⛔ Ihr könnt **keine neuen npm-Pakete installieren** — fragt den Admin

---

## 📜 Der App-Vertrag

Eure App **muss** folgende Regeln einhalten, damit sie im Harness funktioniert:

### 1. Default Export

Eure `index.tsx` muss eine React-Komponente als **default export** haben:

```tsx
// src/wazaaah/index.tsx
export default function WazaaahApp() {
  return (
    <div style={{ height: '100%' }}>
      {/* Euer Inhalt */}
    </div>
  );
}
```

### 2. Eigene Routes verwenden

Wenn ihr mehrere Seiten wollt, nutzt `<Routes>` und `<Route>` aus `react-router-dom`. Eure Routen sind relativ — das Harness mountet eure App bereits unter `/euer-app-name/*`:

```tsx
import { Routes, Route, Link } from 'react-router-dom';

export default function WazaaahApp() {
  return (
    <Routes>
      <Route path="/" element={<ChatList />} />
      <Route path="/chat/:id" element={<ChatView />} />
    </Routes>
  );
}
```

### 3. `height: 100%` nutzen

Eure Root-Komponente sollte `height: 100%` setzen, damit sie den vollen App-Bereich ausfüllt. Die Statusbar und Navigation werden vom Harness gerendert — ihr müsst euch nicht darum kümmern.

### 4. Eigene Dateien im eigenen Ordner

Ihr könnt beliebig viele Dateien in eurem Ordner anlegen:

```
src/wazaaah/
├── index.tsx          # Einstiegspunkt (Pflicht!)
├── ChatList.tsx       # Eigene Komponente
├── ChatView.tsx       # Eigene Komponente
├── types.ts           # Eigene Typen
├── data.ts            # Fake-Daten
├── wazaaah.css       # Eigene Styles
└── assets/            # Bilder etc.
```

---

## 📦 Verfügbare Pakete

Diese npm-Pakete sind bereits installiert und können frei importiert werden. **Ihr müsst (und könnt) kein `pnpm install` machen.**

### UI & Styling

| Paket | Import | Wofür |
|-------|--------|-------|
| `lucide-react` | `import { Heart, Send, ... } from 'lucide-react'` | Icon-Bibliothek ([alle Icons](https://lucide.dev/icons)) |
| `react-icons` | `import { FaSpotify } from 'react-icons/fa'` | Noch mehr Icons (Font Awesome, Material, …) |
| `framer-motion` | `import { motion, AnimatePresence } from 'framer-motion'` | Animationen & Gesten |
| `gsap` | `import gsap from 'gsap'` | Komplexe Timeline-Animationen |
| `react-spring` | `import { useSpring, animated } from 'react-spring'` | Physik-basierte Animationen |
| `styled-components` | `import styled from 'styled-components'` | CSS-in-JS |
| `clsx` | `import clsx from 'clsx'` | Bedingte CSS-Klassen |
| `@headlessui/react` | `import { Dialog, Switch } from '@headlessui/react'` | Barrierefreie UI-Komponenten |

### State & Daten

| Paket | Import | Wofür |
|-------|--------|-------|
| `zustand` | `import { create } from 'zustand'` | Einfacher globaler State |
| `jotai` | `import { atom, useAtom } from 'jotai'` | Atomarer State |
| `react-hook-form` | `import { useForm } from 'react-hook-form'` | Formulare |
| `zod` | `import { z } from 'zod'` | Schema-Validierung |
| `yup` | `import * as yup from 'yup'` | Schema-Validierung (Alternative) |
| `lodash` | `import _ from 'lodash'` | Utility-Funktionen |
| `date-fns` | `import { format } from 'date-fns'` | Datum-Formatierung |

### Drag & Drop

| Paket | Import | Wofür |
|-------|--------|-------|
| `@dnd-kit/core` | `import { DndContext } from '@dnd-kit/core'` | Modernes Drag & Drop |
| `@dnd-kit/sortable` | `import { SortableContext } from '@dnd-kit/sortable'` | Sortierbare Listen |
| `react-beautiful-dnd` | `import { DragDropContext } from 'react-beautiful-dnd'` | Drag & Drop (Alternative) |

### 3D & Audio

| Paket | Import | Wofür |
|-------|--------|-------|
| `three` | `import * as THREE from 'three'` | 3D-Grafik |
| `@react-three/fiber` | `import { Canvas } from '@react-three/fiber'` | React + Three.js |
| `@react-three/drei` | `import { OrbitControls } from '@react-three/drei'` | Three.js Helfer |
| `howler` | `import { Howl } from 'howler'` | Sound-Effekte & Musik |
| `tone` | `import * as Tone from 'tone'` | Audio-Synthese & Sequencing |

### Sonstiges

| Paket | Import | Wofür |
|-------|--------|-------|
| `canvas-confetti` | `import confetti from 'canvas-confetti'` | 🎉 Konfetti-Effekte |
| `axios` | `import axios from 'axios'` | HTTP-Requests |
| `react-router-dom` | `import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'` | Routing (schon vom Harness genutzt) |

---

## 🎯 Referenz-Implementierung

Schaut euch `src/settings/index.tsx` an — das ist eine **fertige Beispiel-App** mit:

- Material-3-Design (dunkles Theme)
- Mehreren Unterseiten via `<Routes>` und `<Route>`
- Navigation mit `useNavigate()` und `<Link>`
- Interaktiven Elementen (Switches, Listen)
- Sauber strukturiertem Code

Nutzt das als Vorlage für eure eigene App!

---

## 🤖 Hinweise für KI-Assistenten

> **Dieser Abschnitt richtet sich an KI-Coding-Assistenten (Cursor, Copilot, Gemini, Claude, ChatGPT etc.), die von den Schülern zum Entwickeln genutzt werden.**

### Kontext

Dies ist ein Escape-Room-Spiel als Web-App, das ein Android-Smartphone simuliert. Jedes Schülerteam entwickelt eine von 13 Apps. Die App wird als React-Komponente in den Harness eingebunden, der Launcher, Statusbar und 3-Button-Navigation bereitstellt.

### Architektur

- **Harness** (read-only): `src/App.tsx` rendert alle Apps als `React.lazy()`-Imports mit `<ErrorBoundary>` pro App. Jede App wird unter `/<app-name>/*` gemountet.
- **Launcher**: `src/launcher/Launcher.tsx` definiert das App-Grid mit Icon, Name, Farbe und Route pro App. Die App-Liste ist in `allApps` exportiert.
- **Crash-Isolation**: Wenn eine App abstürzt, zeigt die ErrorBoundary eine Fehlermeldung — andere Apps funktionieren weiter.
- **Safe Import Plugin**: `vite.config.ts` enthält ein Plugin, das fehlende npm-Pakete zur Laufzeit mockt statt den Build abzubrechen.

### Strenge Regeln — BITTE EINHALTEN

1. **NUR Dateien im Team-Ordner erstellen/bearbeiten.** Niemals `src/App.tsx`, `src/main.tsx`, `src/index.css`, `src/launcher/`, `src/components/`, `package.json`, `vite.config.ts` oder andere Team-Ordner ändern.
2. **Keine neuen npm-Pakete vorschlagen.** Es können keine installiert werden. Nutze ausschließlich die oben gelisteten Pakete. Wenn ein Paket fehlt, implementiere die Funktionalität selbst oder finde eine Lösung mit vorhandenen Paketen.
3. **Kein `pnpm install`, `npm install` oder `pnpm add` ausführen.** Die Teams haben keine Schreibrechte auf `package.json` oder `node_modules`.
4. **Default Export beibehalten.** Die `index.tsx` im Team-Ordner muss immer eine React-Komponente als `export default` haben.
5. **Alle neuen Dateien im Team-Ordner anlegen.** Unterordner sind erlaubt und empfohlen.

### App-Einbindung (wie das Harness die App lädt)

```tsx
// In src/App.tsx (READ-ONLY) — so wird eure App geladen:
const WazaaahApp = React.lazy(() => import('./wazaaah'));

// ... und so gerendert:
<Route path="/wazaaah/*" element={
  <AppWrapper appName="Wazaaah" color="#25D366">
    <WazaaahApp />
  </AppWrapper>
} />
```

Das `AppWrapper` stellt `<ErrorBoundary>` + `<Suspense>` bereit. Die App bekommt `height: 100%` und weißen Hintergrund.

### Routing-Kontext

Die App wird unter `/<app-name>/*` gemountet. Alle `<Route path="...">` innerhalb der App sind **relativ** zu diesem Mount-Punkt. Beispiel für Wazaaah:

- `<Route path="/" ...>` → wird aktiv bei `/wazaaah`
- `<Route path="/chat/:id" ...>` → wird aktiv bei `/wazaaah/chat/42`
- `<Link to="/chat/42">` → navigiert zu `/wazaaah/chat/42`

Für Navigation zurück zum Homescreen: `<Link to="/">` oder `useNavigate()` mit `navigate('/')`.

### Verfügbares Viewport

Die App hat den gesamten Bildschirm zur Verfügung **abzüglich**:
- **Oben**: 24px Statusbar (Uhrzeit, WLAN, Akku)
- **Unten**: 48px Navigationsleiste (□ ○ ◁)

Diese werden vom Harness gerendert und stehen immer im Vordergrund.

### Best Practices für dieses Projekt

- Nutze `framer-motion` für Animationen — ist bereits installiert und im Harness verwendet
- Nutze `lucide-react` für Icons — konsistent mit dem Harness
- Fake-Daten direkt im Code definieren (kein Backend vorhanden)
- CSS-in-JS via `styled-components` oder inline `style={{}}` — beides funktioniert
- Eigene `.css`-Dateien im Team-Ordner sind auch möglich
- Für State-Management: `useState`/`useReducer` für lokalen State, `zustand` oder `jotai` für komplexeren State
- Schaut euch `src/settings/index.tsx` als Referenz an

### Fehlervermeidung

- **Kein `window.location.href = ...`** zum Navigieren — nutze `useNavigate()` oder `<Link>` von react-router-dom
- **Keine globalen CSS-Selektoren** (wie `body`, `*`, `#root`) — die würden das gesamte Harness beeinflussen. Scoped eure Styles auf euren Ordner.
- **Kein `ReactDOM.render()`** — die App wird als Komponente eingebunden, nicht als eigenständige App
- **Keine Änderung am `<head>`** — kein `document.title`, keine Meta-Tags
- Importiert nicht aus anderen Team-Ordnern (z.B. `import ... from '../mail/...'`) — das würde bei deren Änderungen eure App brechen

---

## 🛟 Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| Meine App zeigt "App Crashed" | Schaut in die Browser-Konsole (F12) für die Fehlermeldung. Klickt "Try Again" nach dem Fix. |
| Meine App zeigt "Missing Package: ..." | Ihr importiert ein Paket, das nicht installiert ist. Nutzt nur die Pakete aus der Liste oben. |
| Meine Änderungen erscheinen nicht | Speichert die Datei — HMR (Hot Module Replacement) aktualisiert automatisch. |
| Ich sehe fremden Code / kann nichts speichern | Ihr seid im falschen Ordner. Arbeitet nur in `src/<euer-ordner>/`. |
| Meine App ist leer/weiß | Stellt sicher, dass `index.tsx` einen `export default` hat und gültiges JSX zurückgibt. |
| Mein CSS beeinflusst andere Apps | Nutzt spezifische Klassennamen oder Inline-Styles statt globaler Selektoren. |

---

## 🏗️ Architektur (für Admins)

```
┌─────────────────────────────────────────────┐
│                Browser (Vite Dev Server)      │
│  ┌─────────────────────────────────────────┐ │
│  │ App.tsx (Router + Harness)              │ │
│  │  ├── UniversalOverlay (Statusbar)       │ │
│  │  ├── <Routes>                           │ │
│  │  │    ├── / → Launcher                  │ │
│  │  │    ├── /mail/* → ErrorBoundary →     │ │
│  │  │    │   Suspense → lazy(mail/index)   │ │
│  │  │    ├── /wazaaah/* → ErrorBoundary → │ │
│  │  │    │   Suspense → lazy(wazaaah/index)│ │
│  │  │    └── ... (13 Apps)                 │ │
│  │  └── NavBar (□ ○ ◁)                    │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

Isolation: ErrorBoundary pro App
            + React.lazy() pro App
            + SafeImportPlugin (mockt fehlende Pakete)
            + Linux Dateiberechtigungen (write-access nur auf Team-Ordner)
```
