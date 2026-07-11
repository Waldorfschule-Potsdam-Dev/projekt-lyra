#!/bin/bash

# --- Konfiguration ---
BASE_DIR="/var/www/escape"
CONFIG="/var/www/escape/dashboard/teams.yaml"

if [ "$EUID" -ne 0 ]; then
  echo "Fehler: Dieses Script muss als root (sudo) ausgeführt werden."
  exit 1
fi

if [ ! -f "$CONFIG" ]; then
  echo "Fehler: $CONFIG nicht gefunden!"
  exit 1
fi

echo "Lese Konfiguration aus $CONFIG..."

# Erweitertes awk-Script, das username, password, opencode_url und litellm_api_key ausliest
TEAM_DATA=$(awk '
  $1 == "username:" { 
      user=$2; gsub(/"/, "", user) 
  }
  $1 == "password:" { 
      pass=$2; gsub(/"/, "", pass) 
  }
  $1 == "litellm_api_key:" { 
      key=$2; gsub(/"/, "", key) 
  }
  $1 == "opencode_url:" { 
      url=$2; gsub(/"/, "", url); 
      sub(/^https:\/\//, "", url);
      sub(/\..*$/, "", url);
      port=url;
      
      # Wenn wir alle 4 Werte gesammelt haben, ausgeben und Variablen leeren
      if (user != "" && port != "" && pass != "" && key != "") {
          print user " " port " " pass " " key;
          user=""; port=""; pass=""; key="";
      }
  }
' "$CONFIG")

TARGET_TEAM=$1

echo "Starte OpenCode-Instanzen für alle definierten Teams..."

# Iteriere durch die extrahierten Daten
while read -r USERNAME PORT PASSWORD APIKEY; do
    
    if [ -z "$USERNAME" ] || [ -z "$PORT" ]; then
        continue
    fi

    # Filter nach Team, falls Argument übergeben wurde
    if [ -n "$TARGET_TEAM" ] && [ "$USERNAME" != "$TARGET_TEAM" ]; then
        continue
    fi

    if ! id "$USERNAME" &>/dev/null; then
        echo "-> Überspringe $USERNAME: Nutzer existiert nicht auf dem System."
        continue
    fi

    echo "-> Konfiguriere und starte OpenCode Web (Port $PORT) für $USERNAME..."

    # 1. Home-Verzeichnis des Nutzers zuverlässig ermitteln
    USER_HOME=$(getent passwd "$USERNAME" | cut -d: -f6)
    CONFIG_DIR="${USER_HOME}/.config/opencode"

    # 2. Verzeichnis anlegen
    mkdir -p "$CONFIG_DIR"

    # 3. opencode.json mit den neuen Settings schreiben
    # Hinweis: $schema wird escaped (\$schema), damit bash es nicht als Variable parst
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
          }
        }
      }
    }
  }
}
EOF

    # 4. Berechtigungen an den Nutzer anpassen (damit OpenCode die Datei lesen/schreiben darf)
    chown -R "$USERNAME:" "${USER_HOME}/.config" 2>/dev/null || true

    # Altes Log löschen
    rm -f "/tmp/opencode_${USERNAME}.log"

    # 5. OpenCode starten (Umgebungsvariablen für die Config sind nun entfallen)
    sudo -u "$USERNAME" -H bash -c "
        export BROWSER=none
        export OPENCODE_SERVER_USERNAME='$USERNAME'
        export OPENCODE_SERVER_PASSWORD='$PASSWORD'
        
        cd $BASE_DIR && opencode web --port $PORT
    " > "/tmp/opencode_${USERNAME}.log" 2>&1 &

done <<< "$TEAM_DATA"

echo "--------------------------------------------------------"
echo "Alle OpenCode-Instanzen gestartet!"
echo "Logs liegen in: /tmp/opencode_<nutzername>.log"
