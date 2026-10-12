#!/usr/bin/env bash
# Publish (or unpublish) the LAN instance at http://10.127.1.23/invent without
# root: a mod_rewrite proxy rule at the top of the WordPress docroot .htaccess,
# which the vhost allows (AllowOverride FileInfo). The container stays the only
# thing serving INV.ENT; Apache just forwards /invent to it.
#
#   bash deploy/lan/htaccess-proxy.sh install
#   bash deploy/lan/htaccess-proxy.sh remove
#
# The root alternative is deploy/lan/install-apache.sh (a <Location> block in
# the vhost, like acadxai); use one or the other.
set -euo pipefail

htaccess=/srv/www/wordpress/.htaccess
site=http://10.127.1.23
begin="# BEGIN INV.ENT dev"
end="# END INV.ENT dev"

block="$begin (http://10.127.1.23/invent -> container invent-lan-web on 127.0.0.1:3040)
# Managed by /srv/www/invent/deploy/lan/htaccess-proxy.sh; remove with: ... remove
# Must stay above the WordPress rules, which would otherwise claim /invent.
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule ^invent(/.*)?\$ http://127.0.0.1:3040/invent\$1 [P,L]
</IfModule>
$end
"

status() { curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$1" || true; }

strip_block() { awk -v b="$begin" -v e="$end" 'index($0,b)==1{skip=1} !skip{print} index($0,e)==1{skip=0}' "$1"; }

case "${1:-}" in
  install)
    backup="$htaccess.bak-invent-$(date +%Y%m%d-%H%M%S)"
    cp -p "$htaccess" "$backup"
    { printf '%s' "$block"; strip_block "$backup"; } > "$htaccess"
    home=$(status "$site/")
    invent=$(status "$site/invent")
    if [ "$home" = 200 ] && [ "$invent" = 200 ]; then
      echo "Published: $site/invent  (WordPress home still $home; backup: $backup)"
    else
      cp -p "$backup" "$htaccess"
      echo "Check failed (home $home, /invent $invent); restored $backup." >&2
      exit 1
    fi
    ;;
  remove)
    backup="$htaccess.bak-invent-$(date +%Y%m%d-%H%M%S)"
    cp -p "$htaccess" "$backup"
    strip_block "$backup" > "$htaccess"
    echo "Removed the /invent proxy (backup: $backup). WordPress home: $(status "$site/")"
    ;;
  *)
    echo "usage: $0 install|remove" >&2
    exit 2
    ;;
esac
