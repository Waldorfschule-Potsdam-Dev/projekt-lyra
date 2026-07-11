#!/bin/bash

# --- Konfiguration ---
DASHBOARD_DIR="/var/www/escape/dashboard"
LOG_FILE="/tmp/dashboard.log"

# 1. Prüfe root-Rechte
if [ "$EUID" -ne 0 ]; then
  echo "Fehler: Dieses Script darf NUR als root ausgeführt werden! (sudo $0)"
  exit 1
fi

# 2. Hintergrund-Weiche
# Wenn das Script OHNE das Argument "--foreground" gestartet wird,
# startet es sich selbst mit nohup im Hintergrund neu.
if [ "$1" != "--foreground" ]; then
  echo "Starte Dashboard im Hintergrund..."
  echo "Logs werden geschrieben nach: $LOG_FILE"
  
  # Lösche altes Log für einen sauberen Start
  rm -f "$LOG_FILE"
  
  # Führt sich selbst neu aus, aber im Hintergrund mit dem Flag '--foreground'
  nohup "$0" --foreground > "$LOG_FILE" 2>&1 &
  exit 0
fi

# 3. Eigentlicher Start-Code (wird im Hintergrund ausgeführt)
if [ ! -d "$DASHBOARD_DIR" ]; then
  echo "Fehler: Verzeichnis $DASHBOARD_DIR existiert nicht."
  exit 1
fi

cd "$DASHBOARD_DIR" || exit 1
pnpm run dev
