#!/bin/sh
# Open a PPTX in Keynote and export every slide as PNG (real-application rendering check).
# Usage: sh src/keynote_export.sh <deck.pptx> <out-dir>
set -e
src=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
mkdir -p "$2"; out=$(cd "$2" && pwd)
osascript - "$src" "$out" <<'OSA'
on run argv
  with timeout of 900 seconds
  tell application "Keynote"
    set d to open POSIX file (item 1 of argv)
    export d to POSIX file (item 2 of argv) as slide images with properties {image format:PNG, skipped slides:false}
    close d saving no
  end tell
  end timeout
end run
OSA
ls "$out"/*.png | wc -l | xargs echo "keynote slides exported:"
