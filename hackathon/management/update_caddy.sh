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
