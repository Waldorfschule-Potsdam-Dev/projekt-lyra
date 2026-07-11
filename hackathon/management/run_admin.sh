#!/bin/bash

# --- Konfiguration ---
BASE_DIR="/var/www/escape"
PORT=4096
APIKEY="YOUR_API_KEY_HERE"

# Aktuellen Nutzer und Home-Verzeichnis ermitteln
CURRENT_USER=$(whoami)
CONFIG_DIR="${HOME}/.config/opencode"

echo "Konfiguriere und starte OpenCode Web (Port $PORT) für den aktuellen Nutzer ($CURRENT_USER)..."

# 1. Konfigurationsverzeichnis anlegen
mkdir -p "$CONFIG_DIR"

# 2. opencode.json mit den Settings und dem API-Key schreiben
cat << EOF > "${CONFIG_DIR}/opencode.json"
{
  "\$schema": "https://opencode.ai/config.json",
  "provider": {
    "litellm": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LiteLLM (Local)",
      "options": {
        "baseURL": "http://localhost:4000/v1",
        "apiKey": "${APIKEY}"
      },
      "models": {
        "minimax/minimax-m3": {
          "name": "MiniMax M3",
          "limit": {
            "context": 200000,
            "output": 65536
          },
         "modalities": {
             "input": ["text", "image"]
         }
        }
      }
    }
  }
}
EOF

# 3. Altes Log löschen
rm -f "/tmp/opencode_${CURRENT_USER}.log"

# 4. OpenCode im Hintergrund starten (ohne Authentifizierungs-Variablen)
export BROWSER=none

# Ins Base-Verzeichnis wechseln (prüfen, ob es existiert)
if [ -d "$BASE_DIR" ]; then
    cd "$BASE_DIR" || exit 1
else
    echo "Warnung: Verzeichnis $BASE_DIR existiert nicht. Starte aus dem aktuellen Verzeichnis."
fi

# Der nohup Befehl sorgt dafür, dass der Prozess auch beim Schließen des Terminals weiterläuft
nohup opencode web --port $PORT > "/tmp/opencode_${CURRENT_USER}.log" 2>&1 &

echo "------------------------------------------------------"
echo "OpenCode Web gestartet!"
echo "Log liegt in: /tmp/opencode_${CURRENT_USER}.log"
