# Forge

An offline workout logger. One HTML file, no build step, no account, no server.

**The app is named Forge** (renamed from "Arcanum" in v4.145 — "Forge" was originally just the
theme name). The repo and Pages URL are now `edsolano1/Forge` → `edsolano1.github.io/Forge/`
(renamed Aug 26, 2026); a stub repo named `Arcanum` holds the OLD address with a redirect page
plus a kill-switch service worker, so installed apps that still point there follow along with
their data intact — do not delete that stub. The old name deliberately survives in: the Android
package (`com.edsolano.arcanum` — changing it forks the app and orphans everyone's data), the
desktop folder names, and the service-worker cache prefix (`arcanum-vNNN`). Write "Forge" in
prose and leave those identifiers alone.

Ships as two halves:
- **Web** — GitHub Pages serves `main`. This is the half that gets tested.
- **Android** — a Capacitor wrapper (`com.edsolano.arcanum`) loading the same URL. Not in this repo.

`index.html` is ~800KB and contains everything: markup, one `<style>` block, one `<script>` block.
That is deliberate — it is why the app works offline as a single artifact — and it is also the
main constraint on how to work in it. See **Traps** below before editing.

---

## Working agreement

- **Push without asking.** Commit and push finished work to `main` directly. Never branch — Pages
  serves `main`, so a branch never reaches the phone.
- **Bump both versions every time.** `APPV` in `index.html` and `CACHE` in `sw.js`. The service
  worker will serve the old build otherwise. `v4.9` is followed by `v4.10`, not `v4.91`.
- **End every reply with a TLDR and the build number** to look for, then **WHAT'S NEXT in ONE
  SENTENCE.** Not a paragraph, not a list — a long one defeats the point of a TLDR. Say what is
  pending, or recommend one step only if a user would be worse off without it, or say there is
  nothing worth doing. An empty queue is a legitimate answer; never invent work to fill the line.
  Owner's words (8 Sep 2026): *there are times where we are just adding bells and whistles for no
  reason... If there is nothing to improve, simply state it so we don't over engineer.*
- **The user is not a coder.** Short answers by default; they will ask for detail.
- **Only the Forge theme is in scope** until the themes get their own v5.x pass. Obsidian,
  Frost and Moonwell stay frozen (`THEMES_ON=0`) — check whether a selector is theme-scoped
  before changing it.

## Settled in September 2026 (binding on new copy and code)

- **Gold requires holding the weight** (`holdsWeight`, v5.96). A set never earns gold lighter
  than the set it beats. Score is still Epley; no rep cap (rejected: it would strip gold from
  15-rep isolation work). Colours: gold = beat, violet = matched, nothing = under. No bronze.
- **Instructions and card notes are plain English** (v5.97). No lockout, brace, hinge, sternum,
  lats, scapula, pike. Say what it means. Card notes never carry one-body advice ("if the knee
  complains") or expert escalation ("plate on the back"); a progression is a last cue for everyone.
  A glossary sheet is parked; inline tap-a-word links were rejected.
- **No dashes in user copy, including " - "** (v5.98). Period, comma, colon or rewrite. Ranges
  (2-3 min) and compounds (pull-up) are fine. Check `—` escapes too; grep misses them.
- **Level-ups are per row** (v5.94): `lastForSlot`, `isReady(exId,tgts,slot)`, plan items carry
  `slot`; `applyLevel` matches base id AND slot. `lastFor` stays cross-slot for the Last chip.
- **`ask()` has two more knobs**: `onNo===false` hides CANCEL (a statement with one answer);
  the 7th arg names the no-button (NOT NOW). The queue signature moved to index 7.
- **Every user-typed string is `esc()`'d where it lands in HTML** (names, notes, custom links).
- **Session length stays 30/45/60.** The generator audit (900 weeks) showed 60 already overfills
  strength and underfills "move"; longer would only add rest.
- The owner's own notes (PERSONAL_NOTES, W stock days d1-d4/opt5/opt6) reach only migrated
  phones, never a fresh install. Leave them.

## Verifying

Rendering claims cannot be verified in a desktop browser.

**Restarting the Browser-pane preview server hands the tab FRESH storage.** An empty app after
a restart is the pane, not the build. Prove persistence with create → reload → check. Both are Chromium, so the numbers always
look right and have been wrong three separate times.

The phone is adb-paired. **adb lives at `C:\Android\Sdk\platform-tools`** — not on PATH, not under
`%LOCALAPPDATA%`. A working raw-socket CDP client is saved at
`~/.claude/projects/<this project>/memory/cdp.js`:

```bash
export PATH="/c/Android/Sdk/platform-tools:$PATH"
adb shell cat /proc/net/unix | grep -o 'webview_devtools_remote_[0-9]*'
adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>
curl -s http://127.0.0.1:9222/json/list          # get the ws:// url
node cdp.js "<wsUrl>" "APPV"
```

A **cold start** is the only way to see launch behaviour — a reload runs with the window already
settled. `adb shell am force-stop com.edsolano.arcanum && adb shell am start -n com.edsolano.arcanum/.MainActivity`,
then re-forward, because the WebView process is new.

Clear the service worker over CDP before testing a new build, or the phone serves the old one.

---

## Traps

**1. The same CSS class is declared twice.** Far apart, and the later one wins. A new rule can have
no effect at all and it looks like the CSS "didn't apply". Hit three times in one session
(`.mk-row`, `.mk-inv`, `.mk-rt`). Before restyling anything that exists:

```bash
grep -n "^\.classname" index.html
```

Two hits means delete the stale one — do not reorder or raise specificity.

**2. There is no syntax check between an edit and the phone.** A broken file ships as a blank app.
Run this before every push:

```bash
node -e "
const fs=require('fs');const s=fs.readFileSync('index.html','utf8');
let i=0,n=0,bad=0;
while((i=s.indexOf('<script',i))>=0){const gt=s.indexOf('>',i),c=s.indexOf('</script>',gt);n++;
  try{new Function(s.slice(gt+1,c));}catch(e){bad++;console.log('block '+n+':',e.message);}i=c+9;}
let z=0;for(let j=0;j<s.length;j++){const c=s.charCodeAt(j);if(c===0||(c<9)||(c>13&&c<32))z++;}
console.log(z?'CONTROL BYTES: '+z:'no stray bytes');
console.log(bad?'FAILED':'all '+n+' blocks parse');"
```

The control-byte line is not decoration. An edit once wrote a **NUL byte where a space belonged**,
inside a string literal (`+'\0'+` instead of `+' '+`). Every block still parsed, because `'\0'` is
perfectly legal JavaScript — so the gate above passed it. What broke was the app: two strings that
were supposed to match never did. `grep` also stops working on the file the moment it contains a
NUL ("Binary file index.html matches"), and git starts treating it as binary. Check the bytes, not
just the syntax.

**3. Scripted edits mangle escapes.** Prefer the Edit tool with literal text. When a generator is
unavoidable, never write `'\\n'` inside a heredoc or `node -e` string — the shell and JS layers
each eat one level and it lands as a real newline inside a string literal, which is a syntax
error. Use `String.fromCharCode(92)+'n'`. Same for `\'`.

**4. Never put a NAME inside an `onclick=""` attribute.** Exercise and workout names carry
double quotes (and apostrophes), which close the attribute early and leave a half-parsed
handler behind. The tap then does nothing but bubble to the card, so it reads as "the
button just selects it". Pass the ID only and look the name up in the function. Shipped
broken once in v5.3 because the function was tested directly instead of by clicking the
rendered button — **click the real element, not the handler.**

**5. `hidden` loses to any author `display` rule.** `[hidden]` is `display:none` in the UA sheet
only. An element with `display:flex` in the stylesheet ignores it completely.

---

## Vocabulary

Getting these wrong is what made the builder confusing, so they are settled:

| Term | Means |
|---|---|
| **Day** | A weekday. Seven exist, Sunday to Saturday. You cannot add one. Holds up to `DAY_MAX` (3) workouts. |
| **Workout** | The thing you build and place on a day. "Add" refers to this. |
| **Workout item** | One exercise inside a workout — its measure, sets and per-set rest. |
| **Workout builder** | The `#make` screen. Not "day builder". |

One exception: copy where "day" means *the day's session* stays — "this day stays open until you
finish it" is correct English about a different thing.

---

## Structure

### Screens
`#splash` (launch) → `#welcome` (first run only) → `#home` (the week) → `#session` (logging) /
`#make` (the workout builder). `#bg` is the ambient ground behind everything. Sheets are `.ovl`.

### Data
- `DB` — everything the user owns. `logs`, `active` (open sessions), `custom` (their workouts),
  `cex` (their exercises), `days` (weekday → workout ids), `extra` (the shelf), `exNotes`, `walks`.
  Persisted through `Store` (artifact storage → localStorage → memory).
- **The day-to-day invariant (v4.156): a workout id stands on at most ONE day.** `dayMap()`
  enforces it on every pass — a duplicate placement gets its day an independent copy via
  `wkCopy` (name kept, effective targets baked into rows, that weekday's logs re-pointed).
  Exempt: the built-in `rest` day, and whatever the builder holds open (creation fills the
  workout first; the split runs when the builder closes). `DB.up` (applied level-ups) now
  scopes to built-ins and swapped-in lifts only — custom rows carry their own targets, baked
  once under the `DB.upScoped` flag, and `R()` skips the table for custom workouts.
- `EX` — the exercise library. `cardio:1` marks cardio; `inv:1` marks assisted (less weight is
  better, and grading, readiness and level-up all invert on it); `bw:1` marks bodyweight.
- `W` — workout definitions. `sections:[{title, ss, rows}]` where a row is `[exId,{sets,rest}]`.
- `MK` — the builder's working copy. **Flat `rows[]`**, not sections. Each row: `id, n, w, r,
  unit, lines[], rest, g` (group id), `k` (stable key for drag).

### The builder's model
- `sets` is one line per set, and lines may differ — `"135x10\n155x8\n175x6"` is a pyramid.
- `rest` is parallel: one value applies to all sets, a newline-joined list gives one per set.
  `restAt(rest, i)` is the only thing downstream that knows this.
- A **superset/circuit** is a shared `g` on consecutive rows, up to `SS_MAX` (6). Consecutive is
  load-bearing: it is the only way sections can express it.
- `mkBuild()` collapses the flat list back into `sections` on save, so nothing downstream changed.
- Units: `wr` (weight×reps), `reps`, `sec` for lifting; `min`, `cal` for cardio. The workout's
  `kind` (`lift`/`cardio`) decides which are offered.

### Saving
The workout is created first (name/kind/day), then filled. From creation onward every change
writes through — `mkTouch()`, debounced 500ms. There is no "unsaved" state in the builder.

---

## Open decisions

1. **One editor** (resolved, v4.146). Holding an exercise mid-session — or tapping ADD AN
   EXERCISE — opens the real builder on the real workout (`sessionEdit`); backing out returns
   to the session with the new shape live. The one question this creates is asked ONCE at
   Finish (`finishGate`): ADD PERMANENTLY or JUST TODAY (phrasing settled Aug 22 — the
   "permanently" family everywhere, "from now on"/"every week" retired) — just-today restores
   the pre-edit snapshot after sealing, so the log keeps what actually happened. Since v4.156
   "permanently" scopes to that one day. `mkFlush` exists because leaving the builder must
   not race the 500ms autosave. `exEditOvl` survives ONLY for built-in days (Pump Day),
   which have no custom copy to edit.
2. **Analysis features.** v1 shipped in v4.136 (per-exercise est 1RM, volume, line charts).
   v2 shipped in v4.146: "THE LAST 8 WEEKS" atop the Progress sheet — weekly weight-moved
   bars (gold = biggest week) plus plain this-week-vs-last rows for sessions, sets, and
   weight moved (`weekBuckets`/`weekStrip`). Marked-done days carry no sets and do not count
   as sessions. Full gap analysis against Hevy/Strong/Jefit exists as a published artifact.
   **The Progress button is shelved (owner's call, Aug 23):** `showProgress` and the sheet are
   intact but nothing on the home footer opens them. Do not report it as a bug, and do not
   polish the sheet's copy until the button comes back.
3. **Kilograms.** The toggle shipped in v4.141 as a display skin: storage stays pounds
   forever, the Units toggle (Settings) converts at render and converts input back exactly
   once. Session inputs carry the exact pound value in `data-lb` while showing kg — that is
   what stops a 145 lb target round-tripping through "66 kg" into a 145.5 phantom PR.

   **Committed: kg users are first-class, not a conversion afterthought.** They get the
   same experience as lb users and never do mental math to make their numbers fit. This is
   the standard approach across weight-measuring software (lifting apps, scales, health
   apps): one canonical unit internally, conversion only at the edges, and — the part that
   separates good from lazy — every number the app GENERATES is produced natively in the
   user's unit, so suggestions always read as round, natural values in their world.
   Build-out status:
   - **Unit choice stays in Settings** — decided (Aug 22): no first-run question. Switching
     is always safe because storage is canonical-lb; the toggle is a lens, never a migration.
   - **The generator speaks the unit** — shipped v4.144 (`natW`): kg-mode wizard weights land
     on 2.5 kg plates (45 lb bar → 20 kg bar), stored as exact pounds.
   - **Plate-math fallback is unit-aware** — shipped v4.144 (`plateNext`): level-up steps of
     2.5/5 kg in kg mode, landing on the kg lattice; learned machine lattices unchanged.
   - Storage stays canonical-lb throughout — no data migration, ever.
4. **Lift/cardio merged at the row level** (v4.144), and the creation-time "What kind"
   chooser removed outright in v4.148 — one build flow, no factions. `MK.kind` is now purely
   inferred (`mkKindOf` reads the rows): each row carries its own measure (`mkRowCardio` →
   `mkMeasures(r)`), the picker leads with the inferred half of the library and lists the
   other under its own heading, and the custom-exercise sheet asks lift/cardio (default =
   inferred flavor, frozen after creation).
   Level-ups were already safe: cardio lines pass through `levelPlan` unchanged and are
   filtered as no-ops.
5. **First-run wizard unpinned in v5.0** (Aug 26). `EZ_ON=true`: a first run gets the
   welcome question ("I know what I'm building" / "Build one for me") and the forging
   ritual (level, days, goal → a generated week), then the tour offer. The v5.0 rollout
   marks the start of the v5 cycle — the user's brothers are the first outside users, so
   the fresh-install path is now a real surface, not a parked one. The sandbox replays it.
   Also retired from the home screen the same day: the "Log a walk" side button (cardio
   lives in workouts now; the walk sheet only resurfaces while a walk's clock is running,
   and walk history/streak still show in Progress) and the "hold a workout" week hint.

6. **The wizard asks about CONSTRAINTS, never PREFERENCES** (settled Sep 8). The generated
   week is the app's opinion of a balanced week, and it stays that way. The wizard may ask
   what the user *cannot* change — experience, days available, session length, goal, and (when
   the home pool lands) what equipment they own. It must never ask which muscles they want to
   train.

   The difference is what the answer does to the program. Equipment is a constraint: owning
   dumbbells instead of a machine changes which lift fills the squat slot, and the week stays
   balanced. Muscle is a preference: "arms only" deletes the rest of the body, and a new user
   asked that question will pick the mirror muscles every time and be handed a worse plan by
   an app that knew better. Owner's words: *we don't want to guide new users to just focus on
   one muscle group and disregard the rest.*

   Choosing by muscle is legitimate — it just belongs to somebody building a workout
   deliberately, which is the BUILDER, where the muscle filter lives (`MKFILT`, `mkFiltHit`,
   builder-only, no path from `ez*`). Keep that separation when adding to either.
