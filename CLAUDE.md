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
- **Android** — a Capacitor wrapper (`com.edsolano.arcanum`) loading the same URL. Not in this repo:
  it is its own git repo at `Desktop/Arcanum-Android`, started 2 Oct 2026 at phone 1.5 / watch 1.17
  (first commit `64425d1`), pushed to the PRIVATE repo `edsolano1/Forge-Android`. Private on
  purpose and it stays that way: the release notes put the Play upload key in that folder.
  **Commit AND push the Android and watch source there whenever a build ships**, the same way web
  builds are pushed here. Its `.gitignore` keeps out the signing keys (`*.jks`, `keystore.properties`, which
  PLAY-RELEASE.md tells you to put in that very folder), `local.properties`, 158MB of gradle
  output and `node_modules`.

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
  **Gold always sounds like gold** (v5.106): beating last session and a lifetime best play the
  same fanfare. Never split gold into kinds by sound or shade; a first-ever set stays quiet.
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
- **Unlocking is per card** (v5.112). `unsealOne(id)` on the hold menu of a locked card; the footer UNLOCK THE WEEK button is gone and must not come back. `doUnseal` survives only for the end-of-week "go round again" dialog. A passed day still undone shows a Waiting pill; three or more collapse into one line (`waitingCount`).
- **A deleted workout is recoverable** (v5.236). `mkDelete` and `mkDeleteX` call `scrapPut(id)`
  first, which copies it into `DB.scrap` (newest first, `SCRAP_MAX` 20, no expiry). `openScrap`
  shows them; `scrapBack` returns one to Saved workouts keeping its own id, `scrapBurn` is the
  only thing that really deletes. Never add a clock to it, and never restore straight onto a day.
  `W` is NOT pruned when a workout is deleted, so `W[id]` cannot answer whether an id is free:
  `WSTOCK` (the built-ins, snapshotted in `mergeCustom` before the user's are merged over them) is
  what to ask.
- **Your data is a list, and sharing lives with the workouts** (v5.237). The Backup & restore sheet
  is gone; Settings carries the status line (`ydAuto`, drawn by `autoBkDraw`), then rows, with
  `Put a copy back` alone in warning colour. **Never put this back in a grid**: a tile cannot hold
  the state line, forces the label under a legible size, and makes the destructive action look
  like the safe one. Sending a workout is `shareOne`/`oneBlob` from the workout's own buttons;
  `openBring` (the plus in Saved workouts) is the only way in, with `window.__forgeFileIn`
  gating the tap the file card until the wrapper can really be handed a file.
- **The exercise card is buttons, and you say what it shows** (v5.238, owner picked B). The row
  under the name is four plates, icon over word (`body.forge .ex-links a`): HOW TO, NOTE,
  HISTORY, PLATES. `openExHist` is every session that lift appears in (`histForEx`), best at the
  head. The coaching line, your note and Last each have a switch in their own sheet, worded
  **Show this on the exercise** every time (`exShowTick`, `exShowBox`), stored per exercise in
  `DB.exShow` where **absent means shown**. Never make one of these default to hidden.
- **Never draw a dot as a path** (v5.259, owner picked B of three). The dot of the How To i was
  `M10 6.2v.1`, a tenth of a unit of line, and `.ex-links a svg` set no `stroke-linecap`, so a
  butt cap drew it **0.095px tall** on the phone: a hairline, and the mark read as a bare stem in
  a ring. It is a filled `<circle r="1">` now (`HOWI`), which measures 1.9px, and the fill goes on
  the circle itself because the `fill:none` rule matches the svg element and not its children.
  All four marks also gained `stroke-linecap:round;stroke-linejoin:round`, which is what the
  owner picked them with. Anything this small is a shape, never a stroke with no length.
- **A question can carry its long half behind an i** (v5.238). `askAlso(text)` on the line before
  `ask()` puts an i beside the title; the queue carries it at index 8. The new week notice is the
  first user: one sentence, the rest behind the i.
- **A question can wear the banner of the sheet it came off, and then it needs no paragraph**
  (v5.258, owner). `askCrest(text)` on the line before `ask()` puts a beam across the top of the
  dialog, the same gradient the level-up sheet's own banner is made of, bleeding past the sheet's
  sides so the rounded corners never clip it; the queue carries it at index 9. Turning a raise
  down is the first user and is now the TITLE AND THE TWO ANSWERS, nothing else: the five line
  explanation said what REMIND ME NEXT TIME and STOP SUGGESTING IT already say, to somebody who
  has just read a whole sheet. Owner's words: we do not need to give them the whole explanation.
  `#askMsg:empty{display:none}` is what makes an empty message cost no space, because `.sheet p`
  still spends its 16px bottom margin otherwise. Checked: the crest does not leak into the next
  dialog, and it survives the queue.
- **The walks screen is scoped to the week it was opened from** (v5.239). `HIST.wk0` is the
  cursor; `HIST.wkAll` is the deliberate escape to every walk. A list reached from inside a week
  view shows that week, always: the row that opened it carried that week's count.
- **Sheets guard their edits** (v5.123). Back on a sheet with an unsaved change asks Keep the change? (SAVE or DISCARD) through `UNSAVED[id]` in `backCloses`; register a dirty test and a save there when adding a sheet with a SAVE or ADD. CANCEL buttons still cancel outright. Notes autosave (v5.122); the plate calculator SAVE writes the total into the next unlogged set (`plLand`, v5.121). Held weight: `held(x,c)` draws a dumbbell or, when `KBNOW` is on for that exercise (`DB.kb`, `KB_OK`), a kettlebell.
- **The look is settled (v5.125 to v5.156).** Blackened steel plates on an agenda board over the
  hearth ground; the wizard icons in WZ with per-icon idles; the banner level-up sheet; the seal
  finish screen. New surfaces match these, not the old glass-and-glow. Mockup first, three
  directions, then build: that is how every one of these was chosen and it is how the owner wants
  to keep working. No bare text that goes somewhere: anything tappable looks like a button.
  A finish screen shows what you did, not arithmetic: no reps total, no weight moved.
  **Mockup first has no exceptions** (owner, 17 Sep): carrying a chosen look to another screen still
  gets a mockup and his pick before it ships.
- **The look reached everything else (v5.157 to v5.172).** The session screen is the ledger (v5.157,
  icon buttons under the name). Workouts finished is the seal roll (v5.167). The instructions sheet and
  the builder cards wear the seal, the finish screen's warm stamped plate (v5.168, owner picked C), and so
  does every other sheet through one forge-scoped block, "Every other sheet, v5.170": picker, custom
  exercise, Settings, workout settings, swap, plate calculator, dialogs. The welcome's two choices are
  wizard cards with pictures (WZ.wc, v5.169). The board says Skipped, carries no set counts, wraps names
  (v5.164 to v5.166). Rest notices name the coming set (restNextLine, v5.162). Plate calculator: a
  one-horn machine (bar key mac1, solo, nothing doubled) and changing the bar carries the total across
  (v5.168). The assisted box reads Assisted machine with an Info button (exInvInfo, v5.171).
  terms.html sits beside privacy.html, linked from the safety screen and Settings (v5.172).
- **The watch wears the Plates look (1.7, 16 Sep)**: Marcellus and IBM Plex Mono as font files under
  wear/src/main/res/font, plate drawables row_bg / row_bg_done / row_bg_cur / row_bg_match /
  row_bg_under / plate_num, anvil_gold and anvil_match. 1.12 (versionCode 212, installed 1 Oct) fixes the chip timebase; 1.9 added the wrist hold timer and stops the ongoing chip counting past zero; 1.8 restyled the
  ongoing chip (ic_anvil, the coming set with its weight) and lets a set picked from the ladder mid-rest
  be corrected through the countdown (draw(), redoNow). See Arcanum-Android/HANDOFF.md.
- **A glanceable gauge never rescales itself mid-run** (watch 1.16, 1 Oct). The ring divides by `restSpan`, the longest this rest has ever been, not by the
  length it has left: `restLen` is `end - startedAt`, so cutting a rest short shrank both
  halves of the fraction and the ring crept instead of jumping. Jump the needle, never the
  units, or a glance cannot tell whether time passed or the scale moved.
- **The watch rest is a ring round the bezel, not a bar** (watch 1.13, 1 Oct, owner picked it
  from three). `RimView` over the ScrollView, ember the whole way down and hot in the last ten
  seconds, lit means left. The countdown is 19sp and sits at the TOP above the exercise name
  (1.14), not 60sp in the middle, and the word REST is hidden while one runs: once the ring
  carries the time, a big number in the middle is the same fact twice. Two rules learned on the wrist: the ring has to be hard against the bezel or it cuts
  through the exercise name, and the 34dp top padding is not slack for the same reason. Anything
  reclaimed on that screen comes out of the middle. SKIP REST sits ABOVE the set list (1.15, owner picked the
  reorder): mid rest the action belongs on the face and the list is what you scroll to. Order
  during a rest: countdown, exercise, set line, UP NEXT, target, SKIP REST, ladder.
- **Anything on Wear that takes a time and animates it wants `elapsedRealtime`, never the
  wall clock** (watch 1.12, 1 Oct). `restEnd` crosses from the phone as `Date.now()`, and
  `Status.TimerPart` reads against `SystemClock.elapsedRealtime()`; feeding it the wall clock
  made the face chip read **497428:51** on the owner's wrist. Convert at the boundary:
  `elapsedRealtime() + (end - now)`. The number decodes as HOURS and minutes, not minutes and
  seconds: 56.7 years, the age of the unix epoch less the watch's uptime. The older minus
  fourteen hours and minus five days sightings are NOT this bug and remain unexplained,
  because this one can only ever read huge and positive.
- **Backing out of the watch app clears its chip** (watch 1.17). `onDestroy` when
  `isFinishing`. Owner's rule, and the right one: going back all the way is a clear enough
  statement, the phone republishes on the next state change, and reopening is one tap. An
  ongoing notification nobody can dismiss is a bug however correct its contents are.
- **The wrist chip has an expiry** (watch 1.12). `setTimeoutAfter` six hours, re-set on every
  state update. An ongoing chip cannot be swiped away and only the phone can clear it, so a
  session left open used to hold the watch face slot against Spotify and every timer forever.
  A stuck chip is usually TELLING THE TRUTH: look for an open session on the phone before
  suspecting the watch, and fix it there, because force stopping the watch app only hides it
  until the next data event.
- **The tour is a sealed space** (owner, 20 Sep). Nothing from the live app reaches into it: no level-up
  arrow, no finish-screen raise, no alarms, pushes or prompts while TUTON. The seed data trips isReady;
  the finish screen's raise is fenced off with TUTON since v5.212, and the seed itself gets fixed with the
  tutorial rewrite. Check any new live feature against TUTON before it ships.
- **Back is a list, not a run of ifs** (v5.217). `BACK_RULES` in index.html holds every place the
  hardware back has to answer for, in stack order (splash, ritual, welcome, tour, a night in the
  history, the sheet on top, a session, the builder, the saved fold), and `onBackButton` just walks
  it. **A new full screen means one line there.** Sheets need nothing: any `.ovl` is covered by the
  sheet-on-top rule. `backWould()` names what back would do right now. `tools/back-audit.js` pasted
  into the console opens every sheet found in the page plus the screens it lists, presses back, and
  prints PASS or what it could not get out of. Run it after anything that adds a screen.
- **Sheets stack by opening order** (v5.213). ovlWatch lifts a sheet opened over another of its own z layer
  one step above it (Backup over Settings used to hide behind it). A backup carries arc_kg, arc_km and
  arc_bar; add any new user setting to BK_KEYS or a restore onto a new phone loses it.
- **The day sheet** (v5.234, owner picked A). The DAY COLUMN (`.dayhead`) opens `openDay(k)`: the
  day's workouts, each with a row of labelled icon buttons (`dsActions`) carrying what the hold menu
  had. A tap on a CARD still starts the workout, on the board and inside the sheet, and holding a
  week card opens the same sheet. Icons always keep their word underneath. `mkActionsX` still serves
  saved cards until the Saved fold gets the same treatment.
- **Forge a day** (v5.202, widened v5.231). The plus on ANY day asks I'll build it / Forge it for me (dfAsk). The forge fills
  the least covered of push, pull and legs across the board, or a full body day when the board is empty or
  balanced; it never asks which muscles. The wizard's answers are kept in DB.ez (level, goal, len, kit) and
  forgeDay reads them; anything new that needs equipment reads DB.ez too. Forging also asks Gym,
  Dumbbells or Nothing for THAT day (dfForge, dfForgeGo, forgeDay(k,kit)) and never writes the
  answer back to DB.ez. With Nothing the day is always full body, because there is no vertical pull
  without a bar; EZ_BW gives each role its bodyweight answer, EZ_BWFILL tops a thin day up to five
  rows, and bwReps works unloaded movements in their own rep range instead of a scaled-down barbell
  count. DB.ez.level is still only ever written by the ritual, so a hand-built week forges at the
  beginner numbers until the owner runs Forge me a week.
- **Pump Day has three kinds** (v5.203): Upper, Lower, Full body, each for a gym, dumbbells or nothing
  (PUMP_KINDS). The choice lives in DB.pumpNow and pumpApply writes it into W.pump. Pump exercises stay p_ ids,
  each a twin of a library lift so How To and the animation resolve, and their numbers stay out of real
  progression. Choosing a focus is allowed here: Pump Day is a bonus you pick on purpose, not the balanced week.
- **Saved workouts is a fold** (SAVED_OPEN, savedApply). Pump day is a built-in card at its head,
  not in DB.extra. The level-up offer at the finish is finLvl → finRaise → openLevel.
- **Lift animations keep one even tempo** (owner, 22 Sep: follow the standard only if there is no debate).
  ACSM 2009 advised 1 s up, 2 s down for novices, but the 2026 ACSM position stand sets no tempo and the
  evidence finds 0.5 to 8 s reps equivalent, so there is no settled standard. Continuous activities
  (walks, runs, stairs, rower, swim) do get their real rhythm (v5.207 to v5.209).
- **How long a workout takes lives INSIDE it** (v5.219, owner picked C). The board stays clean: no
  times on the week cards. The session screen's set-count line carries it (`estLabel` in
  `updateProg`), the whole day before the first set and what is left after that, nothing at the
  end. `estSecs(wk,left)` reads the plan, never the clock. The week in minutes is not on the week
  screen at all any more; Workouts finished totals it and carries the comparison to the week before.
  The figure carries a **buffer** (v5.220): `EST_BUF` 1.2, because nobody moves between machines at
  the speed of the arithmetic, replaced by `estRatio()` (the median of the last eight sessions'
  actual minutes over their planned minutes, clamped 1 to 2) once two sessions carry a length. The
  owner's first measured session was +18%, so never present the raw plan as the time.
- **The targets check only ever looks at imported numbers** (v5.251). `easeArm()` from
  `doRestore` and `weekAdd` only; `easeArmed()` gates `easeNotice` AND `easePlan`, so the hold
  menu is dormant too; answering sleeps it until the next import. It had six builds of false
  alarms on the owner's own data and never once a true one, because a target he reached himself
  is reachable by definition. Never arm it from anything a lifter does to their own week.
- **Targets can come back down** (v5.225). `easePlan(wk)` flags a row whose target WEIGHT has never
  been reached in two or more logged sessions (inverted for assisted); reps are never judged, because
  falling short on the last set is training and judging reps flagged 58 of the owner's 104 rows. The
  fix writes through `lvlWrite` and keeps the reps. A target is only judged once it has been TRIED:
  `lvlWrite` stamps `DB.upAt[slot]` and `easePlan` skips anything whose stamp is newer than that
  lift's last session, compared BY DAY because a log carries only a date (v5.232, v5.233), because a raise you just accepted is a weight you have not lifted by
  definition and the check was condemning the app's own offer. Stamping only covers raises written
  since it existed, so easeAmnesty stamps everything out of reach at upgrade once (DB.stAmnesty) and
  the check earns its warnings from there (v5.235). A stale target is not lost: train it, fall short,
  and it comes back with a real attempt behind it. `easeNotice()` asks once per distinct list at
  launch (`DB.stSeen`), and the card's hold menu carries TARGETS OUT OF REACH.
  **Near is not out of reach** (v5.250): `bestScoreFor` judges the best set he has DONE against
  the score the target asks for, and anything at or above `EASE_NEAR` (0.90) is silent, because
  140 for 16 is not a man who cannot do 145 for 15. Cardio and bodyweight rows are never judged.
  The question has three answers (SHOW ME, LATER which records nothing and comes back next launch,
  LEAVE THEM which settles that list), and the sheet walks ONE LIFT at a time with USE <best> and
  KEEP <target>, never a bulk fix: the owner asked for control and for nothing that interrupts a
  lifter mid-session. Accepting writes every copy that lift stands in.
- **The walks screen is one number and a list** (v5.241, owner picked 1A). `walksHtml`,
  `walkRowHtml`, `WALKI` (the walking mark), `emberPill`. The streak is the ember and nothing
  else: nothing at zero, lit at seven, never a headline figure. Never put a streak back in the
  totals, and never let a missed day say anything at all.
- **A builder row opens collapsed unless it has something to show** (v5.246, owner picked C).
  `mkExpNeed(lines,rest)` decides `exp` at load and on add: differing lines or differing rests
  only. One line reading `All 4`, a quiet `Set them one at a time` link, the measure and the
  same/varies state on one plain line, and `MK_GLASS` is a clock. Never load rows with `exp:1`
  again: that single character is what made holding an exercise mid workout unbearable.
- **A fold opens, it does not appear** (v5.245). `svFold` animates height in pixels and returns
  it to auto when the transition ends; the first pass after a launch is instant. Any new fold
  gets the same treatment: `hidden` alone is a redraw, not an opening.
- **A press and hold is a grab, and the board holds still for it** (v5.253). `CDRAG_SLOP` 16px:
  nothing rearranges until the finger has travelled that far, and `d.mv` is the flag, so a hold
  and release commits nothing either. `cardStart` calls `cardApply` straight away, which used to
  resolve a zone and call `slotTo` on the very first frame with no movement at all: the owner
  held Friday and was thrown to Wednesday, and his words were that it shoved him instead of
  giving him options. The old check was dead code comparing against a `cy0` nothing ever set.
  The slot transition is .26s, not .17s, and the ghost removal in `slotTo` is 330ms to outlast
  it; 170ms read as a snap.
- **A card in the air moves the board, never jumps it** (v5.243). `slotTo` closes the gap it
  leaves with a ghost while the new gap opens from zero, both 170ms; the slot copies the card's
  computed margin; `cdPick` answers the grab. Motion Off keeps the instant path. Never go back
  to inserting the slot straight into a new parent: that is one frame, and it reads as a jerk.
- **Nothing on the board moves on the GRAB** (v5.254). The 62px floor that `cdragging` puts on
  every daybox is added when the drag goes LIVE, not in `cardStart`, and `.daybox` carries a
  `min-height` transition so the days OPEN to receive the card. Measured before the fix on a
  seeded board: every empty day gained 28px at once, the board gained 166px, and the day under
  the finger dropped 120px in a single frame while the card itself was position:fixed and stayed
  put. That, not the dragging, was what the owner meant by the whole thing jerking one direction
  on press and hold. After: 0px on grab, 0px on a wobble.
- **A card in the air never shrinks the board** (v5.242). `cardStart` pins the source
  container's height inline and adds `cdragging` to `#weekCards` (every daybox floors at 62px);
  `cardEnd` clears both. The slot IS a day's body during a drag, so without this the day you
  lifted from collapses and stops being a drop target.
- **A moved workout takes this week's session with it** (v5.240). `moveWeekLogs(id,from,to)` on
  every path that moves an id between days (the drag's `CDRAG.from`, `planAdd`); `bonusHeal()`
  at launch repairs a week already stranded. Without it the old day sprouts a BONUS card and the
  new day reads undone, which looks exactly like the app duplicating the workout. Moving a
  workout OFF the board leaves its session where it happened, on purpose.
- **A bonus workout shows where it happened** (v5.222). A session finished on a day that was not
  carrying that workout draws a dimmed, dashed card with a violet BONUS pill on that day (bonusOn,
  bonusCard, bonusTap opens it in Workouts finished). It has no grip on purpose: a record is not a
  plan item. It never enters DB.days, so nothing that counts the week counts it. Which day it lands
  on comes from bonusDay: the weekday the session recorded, or the date it carries, because a Pump
  Day opened from its own button records no weekday (v5.223, caught on the live phone).
- **Do not redraw the sumo squat's side view** (owner, 22 Sep). Three directions were drawn: turned
  out feet only, a foreshortened thigh with the hips dropping between the feet, and that plus an
  opened stance. The last two are anatomically defensible and look like a body that cannot exist;
  his words were scary and impossible for most human beings. The shipped drawing stands, the feet
  only version was closest but still worse than what ships, and the whole question is parked for the
  next version. The leg raise, drawn on the floor in the same pass, was approved and shipped.
- **A declined level up can always be found again** (v5.218). Turning a raise down asks which no it
  is: REMIND ME NEXT TIME leaves the arrow on the card and lifts any earlier refusal of those rows
  (`skipLevelSoft`), STOP SUGGESTING IT records it as before (`skipLevelHard`, `DB.upSkip` keyed to
  the last log's date plus the targets). `levelPlan(wk,true)` returns declined rows, `lvlHidden(wk)`
  says a workout is sitting on one, and the card's hold menu carries SHOW THE LEVEL UP. Never make a
  no silent again: the owner lost a raise on 12 Sep and had no way back to it.
- **Nothing is ever scheduled into a suspended audio context** (v5.248). `audioLive()` gates
  `sfx()` and every direct `playClip`. A suspended context does not refuse work, it remembers it:
  that is how a set logged on the watch clanged on the next launch. Visible and suspended means
  resume then play; hidden means drop it.
- **The splash sound is one real blow off the rest alert's clip** (v5.244). `splashBlow` in
  `strike()`, `HAM_ONE` 0.76 (the clip's second onset, less its attack), `SPLASH_VOL` 0.55,
  `playClip(...,{off})`. Never synthesise this one, and never let a blocked context queue it:
  not running means skipped. `sfxAllowed('splash')` is the key if it ever needs a switch.
- **The splash blow is fired by the hammer, never by a delay** (v5.229). Nothing about the impact is
  scheduled: a rAF loop beside `logoSvgParts` reads the hammer's real rotation every drawn frame and
  adds `.struck` to #splash when it crosses the anvil, and every part of the blow (flare and sparks
  .03s behind, anvil sink, shake, then rule, word, tagline) hangs off that class. **Never put the
  impact back on a timed delay.** A launch buries the main thread, the hammer freezes mid air, and a
  composited opacity fade keeps perfect time: that is how a scheduled flare arrives before the metal,
  which is what the owner saw twice, on 1.05s and again on 1.09s. A 2.2s backstop covers a hammer that
  never moves, Motion Off strikes at once, and `dismissSplash` holds until the blow has had 820ms
  (4.6s ceiling). The gold BEFORE the blow is the hearth and is deliberate. The preview pane cannot
  test any of this: it draws no frames, so only the backstop ever fires there.
- **The one moving thing in the rest bar is borrowed from the framework** (APK 1.5).
  `rtShimmer` is a stock indeterminate ProgressBar with nothing of ours in it, tinted
  `#4DFFE9B8` so the stock sweep reads as a heat haze instead of a cream stripe. It needs no
  repost and keeps going while the process sleeps. It sits BELOW `rtTrack` so the eraser keeps
  it inside the lava; never move it above, and never let `setFlow` touch it. Order bottom to
  top: rtFlow, rtShimmer, rtHeat, rtTrack.
- **Nothing an app supplies animates in the notification shade** (measured on the Fold,
  1 Oct). An AnimatedVectorDrawable from our APK draws perfectly and never moves, while the
  framework's own indeterminate drawable moves in the same ProgressBar; a frame by frame
  `<animation-list>` is the one thing that does run. So the lava in the rest notification is a
  STILL image, `lava_flow.xml` is a plain `<vector>`, and the claim in the 1.3 notes that it was
  animating was wrong: the pixels that changed were the heat ramp re-stretching on every repost,
  not the waves. Do not add an animated-vector to a notification expecting it to run.
- **An animation in the shade carries rhythm, never position** (1 Oct). The shade stops and
  restarts a drawable every time it is opened, which a loop does not mind and a fill cannot
  survive. The rest bar's LENGTH is therefore reposted by the plugin and always will be:
  `tickFor` aims at 120 steps across whatever the rest is (700 ms floor, 2 s cap), and
  `lava_track` is a `<scale>` carrying a fixed 14 dp fade at its leading edge so the step lands
  inside the fade. Never go back to a `<clip>`: a hard line is a landmark the eye follows, and
  that is what made the fill read as stepping.
- **The rest notification's bar is flowing lava, and only one layer of it may move**
  (APK 1.3, 1 Oct, owner picked Glide). A notification cannot run our code: the only thing
  Android animates by itself in the shade is the drawable on an **indeterminate** ProgressBar,
  and an indeterminate bar has no position. So `rtFlow` is full width and system driven, and
  the fill is carried by `rtHeat` (a `<scale>`, so the white hot mouth lands on the FRONT of
  the lava rather than at the end of the bar) and `rtTrack` (a right side `<clip>` that paints
  the unburned length back out). Never measure the bar in pixels to position anything: that is
  what a `<scale>` exists to avoid, and it is the only reason this survives a folding screen.
  The eraser is an opaque trough, never the shade's own colour, because a OneUI card is
  translucent over the wallpaper. Details and the three failed attempts are in
  Arcanum-Android/HANDOFF.md.
- **The bar loads the way a person loads it** (v5.255, owner picked version two of three).
  A plate cannot be threaded into the middle of a stack: everything lighter comes off, the new
  one hangs, they go back. `plFly` builds that as explicit keyframes and `plRun` drives every
  plate from ONE requestAnimationFrame loop. **Never give a plate its own animation per leg.**
  The mockup did, with a timeout that cancelled the element's animations when the first leg
  ended, so the second leg died before it ran and the tidy-up jumped the plate to its final
  spot: that is what "teleporting plates" was. One loop also means an interruption just
  re-measures and rebuilds, so a second tap mid flight is smooth.
  Each plate is a `g.plg` keyed `side|weight|nth` so it survives the `innerHTML` redraw, and
  a plate coming OFF is a ghost clone that leaves after the ones outside it have cleared.
  Two things that bit: a ghost is a CLONE with the same class and key, so `plSnap` must skip
  `[data-ghost]` or it reads the ghost's position as the plate's; and a ghost's clean-up dies
  with its own rAF, so `plFly` clears any survivors before starting. `getBBox` returns 0 while
  the sheet is closed, which is harmless but makes any test of this meaningless unless the
  overlay is actually open.
- **The plates ARE the buttons** (v5.256, the rest of version two). A row of donuts sized
  against each other and coloured like the plate they put on, number in the ring, PLUS on top
  and a MINUS underneath that only exists on a plate that is loaded. No count badge: how many
  are on is read off the bar, which is what the picture is for. The three wide chip grid, the
  coloured dots, REMOVE ALL PLATES and every label above the controls are gone; the bar list is
  one scrolling row, still never behind a button. CANCEL became the X at the top right and SAVE
  became CONFIRM, and `UNSAVED['plateOvl']` still guards the sheet because the X runs the same
  `plCancel`. **`plFly` only animates on add and sub.** On a first draw there is no previous
  state, so every plate counted as new, every plate started at opacity 0 waiting to fly in, and
  anything that stalled the frame loop left a bar with no plates on it at all.
- **The plate numbers wear their plate's colour, and the bar has no caption** (v5.255, owner).
  The plates were colour coded and the numbers were grey, which threw the whole trick away.
  "both ends shown, this is the whole bar" described the picture you were already looking at
  and is gone. The other three captions STAY, because each says something the drawing cannot:
  a horn counts its plates once, loose plates are not doubled, and a machine wants the same
  load on its other peg.
- **Session length stays 30/45/60.** The generator audit (900 weeks) showed 60 already overfills
  strength and underfills "move"; longer would only add rest.
- The owner's own notes (PERSONAL_NOTES, W stock days d1-d4/opt5/opt6) reach only migrated
  phones, never a fresh install. Leave them.

## Verifying

**The phone and the watch are the owner's, not a test rig.** Whatever a session changes on them
gets changed back before the session ends, every time, without being asked (owner, 22 Sep: the
phone kept being left with auto-rotate on and stuck in landscape, and the watch in a portrait it
cannot be read in on either wrist, and he had to fix both by hand afterwards). The rule covers
anything the device carries, not just display: rotation, screen timeout, stay-awake, brightness,
volume, Do Not Disturb, the watch face, the app's own state (an open fold, a half-started session)
and any app data touched on the way.

```bash
tools/device-settings.sh save    <serial>   # FIRST, before touching anything
tools/device-settings.sh show    <serial>   # what drifted
tools/device-settings.sh restore <serial>   # put it all back, then say so in the reply
```

The snapshot is written beside the script, so a later session can restore what an earlier one
saved. Adding a setting to `KEYS` in that script is what makes it get restored. A run that changes
something not listed there adds it to the list in the same commit.

Rendering claims cannot be verified in a desktop browser.

**A push is not a deploy. Check that the new build is actually being SERVED** (3 Oct). v5.259
was pushed, verified on a local server, and reported as shipped, and the GitHub Pages build for
it failed on a `Net::ReadTimeout` inside GitHub's own `jekyll-github-metadata` step. The owner
sat on v5.258 looking at the very icon that had just been fixed. One line closes it:

```bash
curl -s "https://edsolano1.github.io/Forge/index.html?cb=$(date +%s%N)" | grep -o "var APPV='[^']*'"
```

A cache-busting query is required or you read your own cached copy. When it fails: a re-run
through the API can sit QUEUED for ten minutes and never pick up a runner, so do not wait on
it. Push an empty commit instead (`git commit --allow-empty`) and watch the live APPV, which
took about 40 seconds. The failure is transient and is not caused by anything in the repo.

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
only. An element with `display:flex` in the stylesheet ignores it completely. Bit again in v5.115
(the week flip pill); the fix is a `.class[hidden]{display:none}` line beside the class.

**6. The `font:` shorthand with `var(--mono)` is silently dropped.** `font:500 10px var(--mono)`
did not apply at all in v5.147: chips fell back to 16px and the numbers beside them to 13px, the
exact inversion of the design. Write `font-family`, `font-weight` and `font-size` as longhands.

**7. `#bg > *` sets `inset:0` at id strength.** A `body.forge .bg-light{top:auto;bottom:-34vh}` rule
loses to it; positioning anything inside #bg needs the id in the selector (v5.141).

**8. A hidden preview tab freezes animation clocks.** Every animation reports running with
currentTime 0, and an entrance that starts at opacity 0 never becomes visible. Verify names and
pivots there, never timing; and never write an entrance from opacity 0 (the level-up plates start
at .3 for this reason).

**Trap 1 bit again on 1 Oct, in a form worth naming: the duplicate did not fight over the same
property.** `body.forge .timer-pill.ring2 .tbtn` set only `color`; `body.forge .timer-pill .tbtn`,
further down the file, set `background`. The first won the colour, the second won the fill, and
the GO pill came out as three black ovals. **Grepping for the class you are editing is not
enough: grep for the class you are editing INSIDE every state it can be in.**

**10. `saveDB()` is debounced, so a write from the console can simply never land.** An open
session was deleted over CDP, read back as gone in the same call, and was still there after the
app restarted: the in-memory object had changed and the write had not been flushed. Follow any
scripted change to `DB` with `persistNow()`, and prove it by force-stopping the app and reading
it back, not by reading the variable you just set.

**9. On Wear, a layer-list item with a negative inset paints the whole frame.** The superset rail in
watch 1.7 came out as a solid violet block; pin a 3dp item with android:gravity instead.

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
- **The two week program (v5.110).** `DB.two={on,anchor,live,view,other}`. `DB.days` is ALWAYS the board on show, so every reader of it is unchanged; the other week's board is `DB.two.other`. `twoSync()` (called from `dayMap`) compares the current week's parity against `anchor` and swaps the boards when the live week changes. `liveDays()` returns this calendar week's board even while the other is on show; use it wherever the meaning is THIS week (glow, turnover note, watch, Waiting pill). `twoFlip()` swaps boards to look at the other week; `twoToggle()` turns the program on or off, and off moves the other week's workouts to Saved. A workout may stand on both boards, and while the program is on it may stand on two days of ONE board too: dayMap skips the copy split when twoOn(), because A B A / B A B needs one A with one set of targets (v5.114). The wizard asks one week or two after the days question and builds A B A / B A B for three days, a copy of Week 1 otherwise.
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
   marks the start of the v5 cycle — people other than the owner now install it, so
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
