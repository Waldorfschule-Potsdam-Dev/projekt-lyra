import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registriert:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker Registrierung fehlgeschlagen:', err);
      }); 
  });
}

// In installierten PWAs verhindern, dass der Android-Back-Button die App
// sofort verlässt oder den Fullscreen-Modus beendet. Wir pushen beim Start
// einen History-State und legen bei jedem popstate sofort einen neuen nach.
if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches) {
  history.pushState({ pwaGuard: true }, '', location.href);
  window.addEventListener('popstate', () => {
    history.pushState({ pwaGuard: true }, '', location.href);
  });
}