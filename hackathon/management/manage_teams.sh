#!/bin/bash

# --- Konfiguration ---
BASE_DIR="/var/www/escape"
SRC_DIR="$BASE_DIR/src"
TEAM_GROUP="escape-teams"

# Prüfe root-Rechte
if [ "$EUID" -ne 0 ]; then
  echo "Fehler: Dieses Script muss als root (sudo) ausgeführt werden."
  exit 1
fi

# Stelle sicher, dass Gruppe und Basis-Ordner existieren
getent group "$TEAM_GROUP" >/dev/null || groupadd "$TEAM_GROUP"
mkdir -p "$SRC_DIR"

# --- Hilfsfunktionen ---
get_users() {
    # Holt alle Nutzer der escape-teams Gruppe
    awk -F':' -v group="$TEAM_GROUP" '$1 == group {split($4, a, ","); for (i in a) if(a[i] != "") print a[i]}' /etc/group
}

get_folders() {
    # Listet nur die direkten Unterordner auf
    find "$SRC_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \;
}

# --- Hauptfunktionen ---
create_user() {
    read -p "Gib den Namen des neuen Nutzers ein: " username
    if id "$username" &>/dev/null; then
        echo "Nutzer $username existiert bereits!"
        return
    fi

    # Ordner in ein Array laden
    mapfile -t folders < <(get_folders)
    if [ ${#folders[@]} -eq 0 ]; then
        echo "Keine Unterordner in $SRC_DIR gefunden! Bitte lege zuerst Ordner an."
        return
    fi

    echo "Wähle die Ordner aus $SRC_DIR, auf die $username Schreibzugriff haben soll."
    echo "----------------------------------------------------------------------"
    
    # Ordner mehrspaltig oder als einfache Liste ausgeben
    for i in "${!folders[@]}"; do
        printf "%2d) %s\n" "$((i+1))" "${folders[$i]}"
    done
    
    echo "----------------------------------------------------------------------"
    read -p "Bitte Nummern durch Leerzeichen getrennt eingeben (z.B. 1 3 5): " choices

    if [ -z "$choices" ]; then
        echo "Keine Ordner ausgewählt. Abbruch."
        return
    fi

    # Nutzer erstellen
    useradd -m -G "$TEAM_GROUP" -s /bin/bash "$username"
    
    # 1. Grund-Leserechte für den gesamten Base-Dir Baum setzen
    setfacl -R -m u:"$username":r-X "$BASE_DIR"
    
    # 2. Schleife durch alle ausgewählten Ordner
    for choice in $choices; do
        if ! [[ "$choice" =~ ^[0-9]+$ ]]; then
            echo "-> Warnung: '$choice' ist keine gültige Zahl, wird übersprungen."
            continue
        fi

        index=$((choice-1))
        
        if [[ -n "${folders[$index]}" ]]; then
            folder="${folders[$index]}"
            # Lese- und Schreibrechte sowie Vererbung (Default-ACLs) setzen
            setfacl -R -m u:"$username":rwx "$SRC_DIR/$folder"
            setfacl -R -d -m u:"$username":rwx "$SRC_DIR/$folder"
            echo "-> Schreibrechte für '$folder' erfolgreich gesetzt."
        else
            echo "-> Warnung: Ungültige Auswahl '$choice' existiert nicht, wird übersprungen."
        fi
    done

    echo "Erfolg: Nutzer '$username' wurde komplett eingerichtet."
}

change_permissions() {
    mapfile -t users < <(get_users)
    if [ ${#users[@]} -eq 0 ]; then echo "Keine Team-Nutzer gefunden."; return; fi

    echo "Wähle den Nutzer aus:"
    PS3="Bitte Nutzer wählen (1-${#users[@]}): "
    select username in "${users[@]}"; do
        if [ -n "$username" ]; then break; else echo "Ungültige Auswahl."; fi
    done

    mapfile -t folders < <(get_folders)
    if [ ${#folders[@]} -eq 0 ]; then echo "Keine Ordner gefunden."; return; fi

    echo "Wähle die NEUEN Ordner aus $SRC_DIR, auf die $username Schreibzugriff haben soll."
    echo "Achtung: Vorherige spezifische Schreibrechte in src/ werden überschrieben!"
    echo "----------------------------------------------------------------------"
    
    for i in "${!folders[@]}"; do
        printf "%2d) %s\n" "$((i+1))" "${folders[$i]}"
    done
    
    echo "----------------------------------------------------------------------"
    read -p "Bitte Nummern durch Leerzeichen getrennt eingeben (z.B. 1 3 5): " choices

    if [ -z "$choices" ]; then
        echo "Keine Ordner ausgewählt. Abbruch."
        return
    fi

    # Alte spezifische Rechte im src-Ordner komplett entfernen
    setfacl -R -x u:"$username" "$SRC_DIR" 2>/dev/null
    
    # Leserechte aufs Hauptverzeichnis zur Sicherheit neu bestätigen/setzen
    setfacl -R -m u:"$username":r-X "$BASE_DIR"

    # Neue Rechte anwenden
    for choice in $choices; do
        if ! [[ "$choice" =~ ^[0-9]+$ ]]; then
            echo "-> Warnung: '$choice' ist keine gültige Zahl, wird übersprungen."
            continue
        fi

        index=$((choice-1))
        
        if [[ -n "${folders[$index]}" ]]; then
            folder="${folders[$index]}"
            setfacl -R -m u:"$username":rwx "$SRC_DIR/$folder"
            setfacl -R -d -m u:"$username":rwx "$SRC_DIR/$folder"
            echo "-> Schreibrechte für '$folder' erfolgreich gesetzt."
        else
            echo "-> Warnung: Ungültige Auswahl '$choice'."
        fi
    done

    echo "Erfolg: Rechte für '$username' wurden aktualisiert."
}

delete_user() {
    mapfile -t users < <(get_users)
    if [ ${#users[@]} -eq 0 ]; then echo "Keine Team-Nutzer gefunden."; return; fi

    echo "Wähle den zu löschenden Nutzer aus:"
    PS3="Bitte Nutzer wählen (1-${#users[@]}): "
    select username in "${users[@]}"; do
        if [ -n "$username" ]; then break; else echo "Ungültige Auswahl."; fi
    done

    # ACL Rechte vom Verzeichnisbaum entfernen
    setfacl -R -x u:"$username" "$BASE_DIR" 2>/dev/null
    
    # Nutzer und Home-Verzeichnis löschen
    userdel -r "$username"
    echo "Erfolg: Nutzer '$username' und seine Rechte wurden gelöscht."
}

# --- Main Menu Loop ---
while true; do
    echo ""
    echo "-----------------------------------"
    echo " Team & Rechte Management"
    echo "-----------------------------------"
    # PS3 vor dem Hauptmenü wieder zurücksetzen
    PS3="Bitte Option wählen (1-4): "
    options=("Neuen Nutzer erstellen" "Rechte ändern" "Nutzer löschen" "Beenden")
    
    select opt in "${options[@]}"; do
        case $REPLY in
            1) create_user; break ;;
            2) change_permissions; break ;;
            3) delete_user; break ;;
            4) exit 0 ;;
            *) echo "Ungültige Option"; continue ;;
        esac
    done
done
