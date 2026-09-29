#!/bin/sh
# Usage: scripts/shot.sh <path-under-site> <out.png> [width] [height]
# Renders a page from the local dev server (python3 -m http.server 8787 in site/).
W=${3:-1440}; H=${4:-4200}
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=$W,$H --virtual-time-budget=5000 --screenshot="$2" "http://localhost:8787/$1" 2>/dev/null
