#!/bin/bash

if [ "$EUID" -ne 0 ]; then
  echo "Fehler: Bitte als root (sudo) ausführen."
  exit 1
fi

# --- Konfiguration ---
CONFIG="/var/www/escape/dashboard/teams.yaml"

# Funktion: Findet PID anhand eines Ports (nur LISTEN, um Caddy nicht zu killen!)
get_pid_by_port() {
    # lsof -t gibt nur die PID aus, -i:PORT sucht nach dem Port im LISTEN-Modus
    sudo lsof -t -i:"$1" -sTCP:LISTEN 2>/dev/null
}

# --- Dashboard Stoppen ---
stop_dashboard() {
    echo "Stoppe Dashboard auf Port 3333..."
    PID=$(get_pid_by_port 3333)
    if [ -n "$PID" ]; then
        sudo kill -9 $PID
        echo "Dashboard (PID $PID) beendet."
    else
        echo "Kein Prozess auf Port 3333 gefunden."
    fi
}

# --- Team-Server Stoppen ---
stop_team_dev() {
    echo "Stoppe Team-Server basierend auf Ports aus $CONFIG..."
    # Extrahiere alle Ports aus der yaml (nimmt die Zahl nach https://)
    PORTS=$(grep "devserver_url:" "$CONFIG" | sed -E 's/.*https:\/\/([0-9]+)\..*/\1/' | tr -d ' "\r')
    for port in $PORTS; do
        if [ -n "$port" ]; then
            PID=$(get_pid_by_port "$port")
            if [ -n "$PID" ]; then
                echo "Stoppe Team-Server auf Port $port (PID $PID)..."
                sudo kill -9 $PID
            fi
        fi
    done
}

# --- OpenCode-Instanzen Stoppen ---
stop_opencode() {
    echo "Stoppe OpenCode-Instanzen basierend auf Ports aus $CONFIG..."
    # Extrahiere alle Ports aus der yaml (nimmt die Zahl nach https://)
    PORTS=$(grep "opencode_url:" "$CONFIG" | sed -E 's/.*https:\/\/([0-9]+)\..*/\1/' | tr -d ' "\r')
    for port in $PORTS; do
        if [ -n "$port" ]; then
            PID=$(get_pid_by_port "$port")
            if [ -n "$PID" ]; then
                echo "Stoppe OpenCode-Instanz auf Port $port (PID $PID)..."
                sudo kill -9 $PID
            fi
        fi
    done
}

# --- VSCode-Instanzen Stoppen ---
stop_vscode() {
    echo "Stoppe VSCode-Instanzen basierend auf Ports aus $CONFIG..."
    # Extrahiere alle Ports aus der yaml (nimmt die Zahl nach https://)
    PORTS=$(grep "vscode_url:" "$CONFIG" | sed -E 's/.*https:\/\/([0-9]+)\..*/\1/' | tr -d ' "\r')
    for port in $PORTS; do
        if [ -n "$port" ]; then
            PID=$(get_pid_by_port "$port")
            if [ -n "$PID" ]; then
                echo "Stoppe VSCode-Instanz auf Port $port (PID $PID)..."
                sudo kill -9 $PID
            fi
        fi
    done
}

check_status() {
    echo "=== SYSTEM-STATUS ==="
    
    # 1. Dashboard (Fixer Port)
    if sudo lsof -i:3333 >/dev/null 2>&1; then
        echo -e "[AKTIV]  Port 3333 (Dashboard)"
    else
        echo -e "[GESTOPPT] Port 3333 (Dashboard)"
    fi

    # 2. Dev-Server
    echo "--- Dev-Server ---"
    while read -r port; do
        [ -z "$port" ] && continue
        if sudo lsof -i:"$port" >/dev/null 2>&1; then
            echo -e "[AKTIV]  Port $port"
        else
            echo -e "[GESTOPPT] Port $port"
        fi
    done < <(grep "devserver_url:" "$CONFIG" | sed -E 's/.*https:\/\/([0-9]+)\..*/\1/' | tr -d ' "\r')

    # 3. OpenCode-Instanzen
    echo "--- OpenCode ---"
    while read -r port; do
        [ -z "$port" ] && continue
        if sudo lsof -i:"$port" >/dev/null 2>&1; then
            echo -e "[AKTIV]  Port $port"
        else
            echo -e "[GESTOPPT] Port $port"
        fi
    done < <(grep "opencode_url:" "$CONFIG" | sed -E 's/.*https:\/\/([0-9]+)\..*/\1/' | tr -d ' "\r')
    
    # 4. VSCode-Instanzen
    echo "--- VSCode ---"
    while read -r port; do
        [ -z "$port" ] && continue
        if sudo lsof -i:"$port" >/dev/null 2>&1; then
            echo -e "[AKTIV]  Port $port"
        else
            echo -e "[GESTOPPT] Port $port"
        fi
    done < <(grep "vscode_url:" "$CONFIG" | sed -E 's/.*https:\/\/([0-9]+)\..*/\1/' | tr -d ' "\r')

    echo "======================"
}


# --- Hauptmenü ---
while true; do
    echo ""
    check_status
    echo ""
    echo "Was möchtest du tun?"
    echo "1) NUR Team Dev-Server stoppen"
    echo "2) NUR OpenCode-Instanzen stoppen"
    echo "3) NUR VSCode-Instanzen stoppen"
    echo "4) NUR Central Dashboard stoppen"
    echo "5) ALLES stoppen (Kompletter Workspace-Reset)"
    echo "6) Status aktualisieren"
    echo "7) Beenden"
    echo "--------------------------------"
    read -p "Option wählen (1-7): " opt

    case $opt in
        1) stop_team_dev ;;
        2) stop_opencode ;;
        3) stop_vscode ;;
        4) stop_dashboard ;;
        5)
            echo "Fahre das gesamte System herunter..."
            stop_team_dev
            stop_opencode
            stop_vscode
            stop_dashboard
            echo "Alle Prozesse beendet."
            ;;
        6) clear; continue ;;
        7) exit 0 ;;
        *) echo "Ungültige Option." ;;
    esac
done
