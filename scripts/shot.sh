#!/bin/sh
# Usage: scripts/shot.sh <path> <out.png> [width] [height]
# Renders a page from a local server: `npm run preview` (port 4173) by default,
# or set BASE, e.g. BASE=http://localhost:5173 for the dev server.
W=${3:-1440}; H=${4:-4200}; BASE=${BASE:-http://localhost:4173}
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=$W,$H --virtual-time-budget=5000 --screenshot="$2" "$BASE/$1" 2>/dev/null
