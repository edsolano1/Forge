#!/bin/bash
# The phone and the watch are the owner's, not a test rig. Anything a testing session changes on
# them gets changed back. Auto-rotate left on has stranded the phone in landscape, and the watch
# has been left in a portrait it cannot be read in whichever wrist it is on, both of which the
# owner then had to fix by hand.
#
#   tools/device-settings.sh save    [serial]   # before touching anything
#   tools/device-settings.sh show    [serial]   # what it is now, beside what was saved
#   tools/device-settings.sh restore [serial]   # put every one of them back
#
# serial is optional while only one device is attached; with the phone and the watch both on,
# pass it (adb devices shows them: the phone is adb-RFGL70Y15PL-..., the watch adb-RFAW61ARXZH-...).
# The snapshot lands beside this script as .device-<serial>.txt, so a later session can restore
# what an earlier one saved.
set -u
export PATH="/c/Android/Sdk/platform-tools:$PATH"
CMD="${1:-show}"
SER="${2:-}"
A=(adb); [ -n "$SER" ] && A=(adb -s "$SER")
ID="${SER:-$("${A[@]}" get-serialno 2>/dev/null | tr -d '\r')}"
DIR="$(cd "$(dirname "$0")" && pwd)"
FILE="$DIR/.device-${ID//[^A-Za-z0-9._-]/_}.txt"

# Every setting a testing session has ever had a reason to touch. Adding one here is what makes
# it get restored; nothing else in these tools is allowed to change a setting that is not listed.
KEYS=(
  "system accelerometer_rotation"      # auto-rotate. Left on, the phone ends up in landscape
  "system user_rotation"               # the forced rotation, which is what strands the watch
  "system screen_off_timeout"          # raised for screenshot runs, and it must come back down
  "global stay_on_while_plugged_in"    # keep-awake during a long run
  "system font_scale"
  "system screen_brightness_mode"
  "secure immersive_mode_confirmations"
)
# </dev/null on every adb call: inside the restore loop adb would otherwise swallow the rest of
# the snapshot file off stdin, and only the first setting would ever be put back.
get(){ "${A[@]}" shell settings get "$1" "$2" 2>/dev/null </dev/null | tr -d '\r'; }
put(){ "${A[@]}" shell settings put "$1" "$2" "$3" >/dev/null 2>&1 </dev/null; }
del(){ "${A[@]}" shell settings delete "$1" "$2" >/dev/null 2>&1 </dev/null; }

case "$CMD" in
  save)
    : > "$FILE"
    for k in "${KEYS[@]}"; do ns=${k%% *}; key=${k#* }; key=${key%% *}; echo "$ns $key $(get "$ns" "$key")" >> "$FILE"; done
    echo "saved $ID:"; cat "$FILE"
    ;;
  show)
    for k in "${KEYS[@]}"; do ns=${k%% *}; key=${k#* }; key=${key%% *}
      now=$(get "$ns" "$key"); was=$(grep "^$ns $key " "$FILE" 2>/dev/null | cut -d' ' -f3-)
      if [ -f "$FILE" ] && [ "$now" != "$was" ]; then echo "CHANGED $ns $key: now [$now], saved [$was]";
      else echo "ok      $ns $key = $now"; fi
    done
    ;;
  restore)
    [ -f "$FILE" ] || { echo "no snapshot for $ID. Run save before you change anything."; exit 1; }
    while read -r ns key val; do
      [ -z "${ns:-}" ] && continue
      now=$(get "$ns" "$key")
      [ "$now" = "${val:-}" ] && continue
      if [ -z "${val:-}" ]; then del "$ns" "$key"
      else put "$ns" "$key" "$val"; fi
      echo "put back $ns $key = ${val:-<unset>} (was $now)"
    done < "$FILE"
    echo "--- after:"; "$0" show "$SER"
    ;;
  *) echo "usage: $0 save|show|restore [serial]"; exit 1;;
esac
