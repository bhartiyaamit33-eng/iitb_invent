#!/usr/bin/env bash
# Publish the LAN instance at http://10.127.1.23/invent by adding a proxy block
# to the shared Apache vhost, the same way acadxai is mounted. Run as root:
#   sudo bash deploy/lan/install-apache.sh
# Backs the config up first, and restores it if Apache's config test fails.
set -euo pipefail
conf=/etc/apache2/sites-enabled/wordpress.conf

if grep -q "<Location /invent>" "$conf"; then
  echo "Apache already proxies /invent; nothing to do."
  exit 0
fi

backup="$conf.bak-invent-$(date +%Y%m%d-%H%M%S)"
cp -p "$conf" "$backup"

block="    # --- invent (IITB INV.ENT, Next.js in Docker on 127.0.0.1:3040) - added $(date +%F) ---
    # Built with basePath=/invent, so request paths are forwarded unchanged.
    # Containers: invent-lan-web, invent-lan-db (see /srv/www/invent/deploy/lan/compose.yml)
    <Location /invent>
        ProxyPreserveHost On
        ProxyPass \"http://127.0.0.1:3040/invent\"
        ProxyPassReverse \"http://127.0.0.1:3040/invent\"
        Require all granted
    </Location>
"

# Insert just before the last </VirtualHost>.
awk -v block="$block" '
  { lines[NR] = $0 }
  /<\/VirtualHost>/ { last = NR }
  END { for (i = 1; i <= NR; i++) { if (i == last) printf "%s\n", block; print lines[i] } }
' "$backup" > "$conf"

if apache2ctl configtest; then
  systemctl reload apache2
  echo "Done: http://10.127.1.23/invent  (backup: $backup)"
else
  cp -p "$backup" "$conf"
  echo "Apache config test failed; restored $backup and left Apache untouched." >&2
  exit 1
fi
