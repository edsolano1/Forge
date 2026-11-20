#!/bin/bash
# usage: shots.sh <rig.js> <outdir> [ids...]
# Renders one PNG per lift: one row per view, 5 moments of the rep (k = 0, .25, .5, .75, 1). k=0 is the start, k=1 the end.
# FRAMES=9 gives nine moments. ZOOM=1 gives full size (480px a frame).
S="$(cd "$(dirname "$0")" && pwd)"
RIG="$(cygpath -m "$(realpath "$1")")"; OUT="$(realpath -m "$2")"; shift 2
N="${FRAMES:-5}"; Z="${ZOOM:-0.75}"
mkdir -p "$OUT"
sed "s#RIGSRC#file:///$RIG#" "$S/figure-sheet.html" > "$OUT/_sheet.html"
IDS="$@"; [ -z "$IDS" ] && IDS="squat dead bench row pull ohp curl lat push incl crow thrust legx pullup calf"
W=$(python -c "print(int($N*(480*$Z+4)+8))"); H=$(python -c "print(int(2*(480*$Z+4)+8))")
for id in $IDS; do
  "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --user-data-dir="$(cygpath -w "$OUT/_chrome")" --window-size=$W,$H --screenshot="$(cygpath -w "$OUT/$id.png")" "file:///$(cygpath -m "$OUT/_sheet.html")?$id&$N&$Z" >/dev/null 2>&1
done
ls "$OUT" | grep png
