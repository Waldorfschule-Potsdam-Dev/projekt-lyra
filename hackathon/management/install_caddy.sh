#!/bin/bash

if [ "$EUID" -ne 0 ]; then
  echo "Bitte als root ausführen (sudo $0)"
  exit 1
fi

echo "Installiere Caddy..."
# Offizielle Caddy-Installation für Debian/Ubuntu
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy

echo "Erstelle Caddyfile..."
echo "Erstelle Generator-Skript für Caddyfile..."
cat << 'EOF' > /var/www/escape/management/update_caddy.sh
#!/bin/bash
CONFIG="/var/www/escape/dashboard/teams.yaml"
CADDYFILE="/etc/caddy/Caddyfile"

# Caddy Global Config für sslh
echo "{" > $CADDYFILE
echo "    https_port 4443" >> $CADDYFILE
echo "}" >> $CADDYFILE
echo "" >> $CADDYFILE

# Manueller HTTP->HTTPS Redirect (damit Caddy nicht auf Port 4443 weiterleitet)
echo "http:// {" >> $CADDYFILE
echo "    redir https://{host}{uri} permanent" >> $CADDYFILE
echo "}" >> $CADDYFILE
echo "" >> $CADDYFILE

echo "escape.praktikum.click {" >> $CADDYFILE
echo "    reverse_proxy localhost:3333 {" >> $CADDYFILE
echo "        header_up Host localhost" >> $CADDYFILE
echo "    }" >> $CADDYFILE
echo "}" >> $CADDYFILE

# Extrahiere alle Ports aus den URLs in teams.yaml
PORTS=$(grep -oE "https://[0-9]+" "$CONFIG" | grep -oE "[0-9]+" | sort -u)

for port in $PORTS; do
    echo "" >> $CADDYFILE
    echo "${port}.escape.praktikum.click {" >> $CADDYFILE
    if [[ ! "$port" =~ ^517 ]]; then
        echo "    forward_auth localhost:3333 {" >> $CADDYFILE
        echo "        uri /api/auth" >> $CADDYFILE
        echo "    }" >> $CADDYFILE
    fi
    echo "    reverse_proxy localhost:${port} {" >> $CADDYFILE
    echo "        header_up Host localhost" >> $CADDYFILE
    if [[ ! "$port" =~ ^517 ]]; then
        echo "        header_up Authorization \"{http.request.cookie.auth}\"" >> $CADDYFILE
    fi
    echo "    }" >> $CADDYFILE
    echo "}" >> $CADDYFILE
done

systemctl reload caddy
EOF

chmod +x /var/www/escape/management/update_caddy.sh

echo "Generiere finale Caddyfile und gebe Port 443 frei..."
/var/www/escape/management/update_caddy.sh

echo "Installiere und konfiguriere sslh..."
apt install -y sslh

# Konfiguriere sslh: Lausche auf 443, route SSH zu 22, TLS zu Caddy auf 4443
cat << 'EOF' > /etc/default/sslh
RUN=yes
DAEMON_OPTS="--user sslh --listen 0.0.0.0:443 --ssh 127.0.0.1:22 --tls 127.0.0.1:4443 --pidfile /var/run/sslh/sslh.pid"
EOF

systemctl enable sslh
systemctl restart sslh

echo "Starte Caddy neu..."
systemctl restart caddy
systemctl enable caddy

echo "Fertig! Caddy läuft und kümmert sich um die SSL-Zertifikate."
