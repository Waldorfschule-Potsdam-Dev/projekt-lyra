#!/bin/bash

if [ "$EUID" -ne 0 ]; then
  echo "Fehler: Bitte als root (sudo) ausführen."
  exit 1
fi

python3 $(dirname "$0")/admin.py
