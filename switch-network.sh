#!/bin/bash
# Usage:
#   ./switch-network.sh auto     <- detects your computer's current LAN IP automatically (use this for ANY new location/router)
#   ./switch-network.sh home     <- uses the saved home IP
#   ./switch-network.sh office   <- uses the saved office IP
#   ./switch-network.sh 192.168.x.x   <- manually specify any IP directly
#
# Swaps the apiBaseUrl in app.json for each mobile app. Run this whenever
# you switch WiFi/location — no manual JSON editing needed.
#
# After running, you MUST restart Expo (npx expo start --clear) and
# fully close/reopen the app on your phone — app.json values only load
# when the app boots, so a live-reload will NOT pick up the change.

set -e

HOME_IP="192.168.1.102"
OFFICE_IP="192.168.254.118"

MODE="$1"

detect_ip() {
  local ip
  ip=$(hostname -I 2>/dev/null | awk '{print $1}')
  if [ -z "$ip" ]; then
    ip=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7; exit}')
  fi
  if [ -z "$ip" ]; then
    ip=$(ifconfig 2>/dev/null | grep -oE 'inet (addr:)?([0-9]{1,3}\.){3}[0-9]{1,3}' | grep -v '127.0.0.1' | awk '{print $2}' | head -n1)
  fi
  echo "$ip"
}

if [ "$MODE" == "auto" ]; then
  IP=$(detect_ip)
  if [ -z "$IP" ]; then
    echo "Could not auto-detect your IP. Run 'hostname -I' or 'ip addr' manually and use:"
    echo "  ./switch-network.sh 192.168.x.x"
    exit 1
  fi
  echo "Auto-detected IP: $IP"
elif [ "$MODE" == "home" ]; then
  IP="$HOME_IP"
elif [ "$MODE" == "office" ]; then
  IP="$OFFICE_IP"
elif [[ "$MODE" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
  IP="$MODE"
else
  echo "Usage:"
  echo "  ./switch-network.sh auto       (auto-detect current IP -- use this for any new location)"
  echo "  ./switch-network.sh home"
  echo "  ./switch-network.sh office"
  echo "  ./switch-network.sh 192.168.x.x  (manual IP)"
  exit 1
fi

for APP in lawyer-mobile client-mobile student-mobile; do
  APP_JSON="$HOME/nyayaone/$APP/app.json"
  if [ -f "$APP_JSON" ]; then
    python3 -c "
import json
path = '$APP_JSON'
with open(path) as f:
    data = json.load(f)
data['expo']['extra']['apiBaseUrl'] = 'http://$IP:5000/api/v1'
with open(path, 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')
print(f'Updated {path} -> http://$IP:5000/api/v1')
"
  fi
done

echo ""
echo "Done. Now for EACH app you're testing:"
echo "  1. Stop the Expo dev server (Ctrl+C) if running"
echo "  2. cd into that app's folder, run: npx expo start --clear"
echo "  3. Fully close and reopen the app on your phone (not just reload)"
echo ""
echo "Tip: if 'auto' ever picks the wrong IP (e.g. VPN or multiple network"
echo "adapters), run: ./switch-network.sh 192.168.x.x with the IP shown"
echo "under your computer's WiFi settings."
