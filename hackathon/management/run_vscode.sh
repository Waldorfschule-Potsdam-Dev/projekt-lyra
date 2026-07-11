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

if ! command -v code-server &> /dev/null; then
    echo "Installiere code-server..."
    curl -fsSL https://code-server.dev/install.sh | sh
fi

echo "Lese Konfiguration aus $CONFIG..."

TEAM_DATA=$(awk '
  $1 == "username:" { 
      user=$2; gsub(/"/, "", user) 
  }
  $1 == "password:" { 
      pass=$2; gsub(/"/, "", pass) 
  }
  $1 == "vscode_url:" { 
      url=$2; gsub(/"/, "", url); 
      sub(/^https:\/\//, "", url);
      sub(/\..*$/, "", url);
      port=url;
      
      if (user != "" && port != "" && pass != "") {
          print user " " port " " pass;
          user=""; port=""; pass="";
      }
  }
' "$CONFIG")

TARGET_TEAM=$1

echo "Starte VSCode Web Instanzen für alle definierten Teams..."

# Iteriere durch die extrahierten Daten
while read -r USERNAME PORT PASSWORD; do
    
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

    echo "-> Konfiguriere und starte VSCode Web (Port $PORT) für $USERNAME..."

    # Home-Verzeichnis des Nutzers zuverlässig ermitteln
    USER_HOME=$(getent passwd "$USERNAME" | cut -d: -f6)
    
    # Sicherstellen, dass config/data Verzeichnisse existieren und dem Nutzer gehören
    mkdir -p "${USER_HOME}/.config/code-server"
    mkdir -p "${USER_HOME}/.local/share/code-server/User"
    
    # VS Code Einstellungen schreiben (Github Auth, Telemetrie, Benachrichtigungen aus)
    cat << EOF > "${USER_HOME}/.local/share/code-server/User/settings.json"
{
    "github.gitAuthentication": false,
    "git.enabled": false,
    "git.enableSmartCommit": false,
    "git.confirmSync": false,
    "update.mode": "none",
    "extensions.autoCheckUpdates": false,
    "telemetry.telemetryLevel": "off",
    "workbench.startupEditor": "none",
    "workbench.tips.enabled": false,
    "update.showReleaseNotes": false,
    "workbench.welcomePage.walkthroughs.openOnInstall": false,
    "chat.commandCenter.enabled": false,
    "workbench.layoutControl.enabled": false,
    "chat.disabled": true,
    "chat.disableAIFeatures": true,
    "github.copilot.enable": { "*": false }
}
EOF
    
    chown -R "${USERNAME}:" "${USER_HOME}/.config" "${USER_HOME}/.local" 2>/dev/null || true

    # Altes Log löschen
    rm -f "/tmp/vscode_${USERNAME}.log"

    # Start code-server as the user
    # Bind to localhost to only allow access via Caddy
    sudo -u "$USERNAME" -H bash -c "
        code-server --bind-addr 127.0.0.1:$PORT --auth none --disable-workspace-trust --disable-proxy --disable-telemetry --disable-update-check --disable-getting-started-override /var/www/escape/src
    " > "/tmp/vscode_${USERNAME}.log" 2>&1 &

done <<< "$TEAM_DATA"

echo "--------------------------------------------------------"
echo "Alle VSCode-Instanzen gestartet!"
echo "Logs liegen in: /tmp/vscode_<nutzername>.log"
