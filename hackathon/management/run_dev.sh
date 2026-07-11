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

# --- FIX: Temp-Ordner radikal bereinigen und für alle freigeben ---
echo "Bereinige und bereite Vite-Temp-Verzeichnis vor..."
rm -rf "$BASE_DIR/node_modules/.vite-temp"
mkdir -p "$BASE_DIR/node_modules/.vite-temp"
chmod 777 "$BASE_DIR/node_modules/.vite-temp"
# ------------------------------------------------------------------

echo "Lese Konfiguration aus $CONFIG..."

# Nutze awk, um die YAML ohne externe Tools (wie yq) zu parsen.
TEAM_DATA=$(awk '
  $1 == "username:" { 
      user=$2; 
      gsub(/"/, "", user) 
  }
  $1 == "devserver_url:" { 
      url=$2; 
      gsub(/"/, "", url); 
      sub(/^https:\/\//, "", url);
      sub(/\..*$/, "", url);
      port=url;
      
      if (user != "" && port != "") {
          print user " " port;
          user=""; port="";
      }
  }
' "$CONFIG")

TARGET_TEAM=$1

echo "Starte Dev-Server für alle definierten Teams..."

# Iteriere zeilenweise durch die extrahierten Daten (Format: username port)
while read -r USERNAME PORT; do
    
    # Überspringe leere Zeilen
    if [ -z "$USERNAME" ] || [ -z "$PORT" ]; then
        continue
    fi

    # Filter nach Team, falls Argument übergeben wurde
    if [ -n "$TARGET_TEAM" ] && [ "$USERNAME" != "$TARGET_TEAM" ]; then
        continue
    fi

    # Prüfe, ob der Nutzer auf dem System existiert
    if ! id "$USERNAME" &>/dev/null; then
        echo "-> Überspringe $USERNAME: Nutzer existiert nicht auf dem System."
        continue
    fi

    echo "-> Starte pnpm für $USERNAME auf Port $PORT..."

    # Führe Befehl aus und setze VITE_CACHE_DIR für jeden Nutzer individuell
    sudo -u "$USERNAME" -H bash -c "export VITE_CACHE_DIR=/tmp/vite_cache_${USERNAME} && cd $BASE_DIR && pnpm run dev --port $PORT" > "/tmp/pnpm_dev_${USERNAME}.log" 2>&1 &

    # FIX: 3 Sekunden warten, damit sich die Vite-Prozesse beim Start nicht in die Quere kommen
    sleep 3

done <<< "$TEAM_DATA"

echo "--------------------------------------------------------"
echo "Alle Prozesse gestartet!"
echo "Logs liegen in: /tmp/pnpm_dev_<nutzername>.log"
