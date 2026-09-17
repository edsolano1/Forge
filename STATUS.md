# Forge

*An offline workout logger. One file, no account, no server — your data lives on your phone and nowhere else.*

**Current build: v5.172** (watch 1.8) · Web (GitHub Pages) + Android wrapper · formerly "Arcanum," renamed in v4.145

---

## What Forge is

Forge is a single-page app that does one thing seriously: log your training and move your numbers up. You build workouts, place them on the days of your week, and run them as sessions — every set saves the moment you tap it. The app grades each set against your history (gold = best ever, violet = matched, bronze = under), offers level-ups when you've beaten every target, and learns each machine's real weight lattice from what you log, so it never offers a weight that doesn't exist on the stack.

It works fully offline, ships as one HTML file, and stores everything on the device. Pounds are the permanent internal truth; kilograms is a display language you can switch on in Settings, with every generated number born natively in your unit.

### The big pieces, as they stand

| Area | State |
|---|---|
| Week board | Seven days, up to 3 workouts each; an optional second week behind the first (two week program, v5.110) that alternates with it by the calendar and flips over to build; a passed day still undone says Waiting, and three or more collapse into one line (v5.108, v5.111); a locked card unlocks alone from its hold menu and the whole-week unlock button is gone from the footer (v5.112); per-day completion ("locked in"); a visible Saved workouts box under the week; when the last day locks, the app offers to unlock the week (v4.157) |
| Sessions | Write-through logging, grading (gold beats your last session or your best, violet matches your best, and gold always requires holding or adding weight), PR flare, rest timers, molten-bar notification (Android) |
| Builder | The one editor for everything — per-set targets, supersets, per-row lift/cardio measures |
| Mid-session edits | Hold an exercise → the real builder opens → one question at Finish: *add permanently, or just today?* |
| Level-ups | Per-day targets, per-lift history; machine lattice learning; kg-native plate steps |
| Progress | 8-week volume bars, this-week-vs-last rows, per-exercise est-1RM charts. Built and intact, but the button is shelved (owner call, Aug 23) until the sheet reads as true numbers; nothing on the home screen opens it today |
| Units | lb/kg toggle (Settings); storage stays pounds forever; zero-drift round-tripping |
| Library | 114 exercises, each tagged with the muscle it trains and the equipment it needs. Neutral starting weights (nobody's personal log), full names, searchable swap sheet, and a muscle filter in the builder |
| Instructions | Every exercise has written setup, cues and the one mistake that actually happens, in words a first-timer can follow (no gym jargon since v5.97), plus a moving figure drawn front and side. No links out; the app owns the teaching |
| Without a gym | The wizard asks what you own: a gym, a barbell at home, dumbbells and a bench, just dumbbells, or nothing but a floor. Every slot in the generated week is filled with something you can actually perform, and a slot with no honest answer is left out rather than faked |
| Warm-ups | Plate-accurate ramps on loaded lifts, never counted in your stats |
| Plate calculator | A drawing of the loaded bar, both ends, plates tapped on as chips; per-lift bar memory; kg-native |
| The watch | Log sets from the wrist: week → workout → lift → set, a rest screen with 3-2-1 haptics, redo any logged set, swap a lift mid-session. Since watch 1.2 (12 Sep 2026): the phone's Forge palette and ember ground, no bold, a 44sp weight, 48dp targets, supersets shown as one lassoed group on the overview and stacked on the set and rest screens so either half is one tap, and the wrist walks a superset A1 B1 A2 B2 |
| First run | A safety screen, three behavioural questions, days, one week or two that alternate (v5.114), session length, what equipment you have, and a goal — then a week built to the answers |
| Sounds | One master volume dial for everything, including the native screen-off alert |
| Backup | Plain-text export via share sheet; JSON backup/restore; an opt-in safety copy that refreshes itself after every finished session; week sharing that adds rather than replaces |
| Bodyweight | One weigh-in a day inside Progress, canonical pounds, neutral deltas |

---

## The September review (v5.92 to v5.98)

A full first-user pass on 10 Sep 2026 (the report is a private artifact, linked from the handoff)
found 15 bugs, three of which could silently rewrite targets. All shipped: kg readiness now compares
weights as shown; a lift built twice in one workout levels up per block; one stray weight can no
longer teach a 1 lb machine step; the beginner press slot is a real press; every user-typed name
is escaped; the number pad opens with the keyboard up. Then, from the owner's own first run:
plain-language instructions on every card, no dashes anywhere a user reads, a safety screen that
lights answers in place, and gold that requires holding the weight. Verified on the phone.

## The mark, the sound, and the watch (v5.102 to v5.107, 11 to 12 Sep 2026)

The owner's own hammer-and-anvil mark went in everywhere (v5.102): launch, welcome, header, set
button, watermark, splash glyph, launcher and notification icons, with the phone APK rebuilt
(versionCode 200). Gold now always sounds like gold (v5.106): beating last session plays the
same fanfare as a lifetime best. The crossover side view stands its tower behind the lifter
(v5.103). The watch got its second pass (web v5.104 to v5.107, watch 1.2 to 1.4): the wrist
walks a superset in running order, sees both halves together, corrects a set on either half in
one tap without losing its place, shows supersets lassoed on the overview, and wears the phone's
palette. All verified on the SM-R960 except the live set screen, which waits for a real session.

## After the look (v5.157 to v5.167, 15 to 16 Sep 2026)

- **The session screen is the ledger** (v5.157, owner picked AB): a header band per lift, icon buttons under the name top left (instructions, note, warm-up, plates), one tight row per set with weight and reps as two cells and the anvil at the end, supersets on a violet rail. Reps-only and timed sets are one cell with a unit label (v5.163). Hover styling on the tool buttons applies only where a pointer hovers; the Warm-up button lights only while its list is open (v5.160).
- **Workouts finished is the seal roll** (v5.167, owner picked AE): seven stamps for the week, one line that says the week, each session a small seal with the sets as its hero and a record chip, Share folding the export away. Inside a session each set wears its grade, gold for beat or record, violet for matched. No aggregate gold-versus-violet counts anywhere: the owner's rule is that the per-lift story is the useful one.
- **The board**: Skipped replaces Still open on a passed day; cards carry no set counts (the session header has the number); names wrap to two lines instead of cutting off; the level-up arrow is 22px and the grip narrower; empty slots line up with their day column (v5.164 to v5.166).
- **Rest notices** name the next lift, set and weight (restNextLine, v5.162). A rest that ended while the app was away no longer replays GO on return (v5.158). The Settings gear is a real gear (v5.159).
- **Watch 1.5 and 1.6**: the plan line and the weight never wrap (autosize, 47.5 lb x 10 fits); timed and rep-only sets are editable on the wrist with the phone sending kind, unit and step (v5.161); a workout overview that has not arrived says Waiting for the phone and asks again every three seconds instead of hanging on Loading. Installed on the SM-R960.
- **GitHub Pages**: a deploy step can fail on GitHub's side with the build green; the fix is an empty commit to redeploy (16 Sep).

- **v5.168 (pushed 17 Sep)**: the instructions sheet and the builder cards wear the seal (owner picked C from icons/sheet-builder-options.html); the prone leg curl figure's pad ends short of the knees; the plate calculator gains a one-horn machine (nothing doubled) and carries the loaded total across when the bar or machine changes instead of clearing it.

- **v5.169 (17 Sep)**: the welcome's two choices are the wizard's own cards, with their pictures: a blueprint week of seven empty boxes for I know what I'm building, the raised hammer over the anvil (the wizard's 6-months-to-2-years picture, reused on purpose) for Build one for me. WZ.wc holds the blueprint.

- **v5.170 (17 Sep)**: the seal on every remaining sheet. One forge-scoped block ("Every other sheet, v5.170") gives the exercise picker, Add your own exercise, Settings, the workout settings page, swap, the plate calculator, notes and the dialogs the warm stamped plate, dark rounded fields, mono pill buttons (primary in ember), rows as dark plates. The finish seal, the level-up banner and Workouts finished keep their own looks.

- **v5.171 (17 Sep)**: the Lower number is better box is now **Assisted machine** with an Info button beside it (exInvInfo) that says what it does; on both the custom exercise sheet and the per-exercise note sheet.

- **v5.172 (17 Sep)**: terms.html, a plain-English terms of use beside privacy.html; linked from the safety screen note and the Settings footer.

### Still to do, in order (16 Sep 2026)
1. **The watch's look**: mockup icons/watch-options.html (Plates, Ledger, Seal); owner picked **A, Plates** (16 Sep), C parked as a possible later direction. **Watch 1.7 (versionCode 207) is installed on the SM-R960 (16 Sep evening) as the Plates look; the owner will judge it in his next session**: Marcellus and IBM Plex Mono shipped as font files, every row a plate with the ember rail (gold rail and anvil when done, violet for matched, dark for under), the ember bar button, the hearth glow at the foot, no set counts on the week. Verified on the wrist: week, overview (superset rail fixed after the first install painted the frame solid violet), set preview. **Watch 1.8 (208)** the same evening: the ongoing chip and shade card wear the anvil icon and the ember, and say the coming set with its weight (Set 3 of 4 · 65 lb × 8; Rest 0:45 · set 3 on the face chip, Rest · up next set 3 of 4 · 65 lb × 8 in the shade). It also lets a set picked from the ladder mid-rest be corrected while the countdown runs underneath (before, the rest screen swallowed the tap). Built, waiting to be installed.
2. ~~Instructions sheet and workout builder~~ done in v5.168 (C, the seal).
3. ~~Welcome screen~~ done in v5.169.
4. ~~Terms of use page~~ done in v5.172.
5. Owner will delete his eight old saved workouts himself. The two-week flip and Month view of history are untouched by the look pass and fine.
6. Then a docs pass and stop adding.

## The look (v5.125 to v5.156, 13 to 15 Sep 2026)

The visual pass the owner asked for after the beginner round, done screen by screen with three
mockups shown before each build (the mockup pages live in icons/*.html and as published artifacts).

- **The wizard** wears the owner's generated icons, traced to flat paths (icons/wizard, WZ in
  index.html, v5.126), with motion: cards rise in, each icon has an idle that fits what it is
  (anvils glow in steps, books turn a page, ingots light one at a time, gears mesh, hourglasses
  drain with real grains, the armour shines, boots rock, equipment stays still), the tapped icon
  answers, and Low keeps the wizard moving because it is a one-time pass (v5.127 to v5.135). The
  safety screen waits for CONTINUE and records the not-medical-advice and privacy acknowledgement
  (v5.125).
- **The board** is blackened steel on an agenda: a day column on the left, three letters over the
  date, the plate to its right, today's column in embers, empty days one thin row. Opaque plates
  with a hot ember rail; no trays, no dashes (v5.136 to v5.146, the owner picked G then K). The
  ground is the hearth: near black, one light low behind the board, fourteen embers that stay near
  it, no drifting bloom or anvil (v5.141). Day names brightened (v5.139). The second-workout plus
  left the day column for the hold menu, ADD ANOTHER WORKOUT TO that day (v5.145).
- **Saved workouts** folds into one line under the week, shut by default and remembered; plus and
  Forge me a week (wearing the mark) sit on the line; Pump day is the first card inside and its bar
  under the board is gone; anything moved into Saved opens the fold (v5.138, v5.144).
- **Settings** reads in four panels with centred titles (Sound, Preferences, Walks, Learn); the
  Settings button is a cog; the one week or two week switch moved here from the board (v5.117,
  v5.118, v5.143).
- **The level-up sheet** is the banner: a beam of light with LEVEL UP and the workout name, rays
  behind, lifts landing one at a time with numbers counting up and the gain in green; tap a lift
  to raise just that one, tap its number to change it, RAISE ALL then RAISE THE REST then DONE,
  Not this time as a quiet button; approx is a chip, not a footnote (v5.147 to v5.149, after a
  research pass on how games do it).
- **The finish screen** is the seal: a stamped plate with the workout, date and minutes, the sets
  as the one hero number (3 of 34 sets), records in a gold band that opens to new versus old, the
  level-up as one full-width gold shining button inside the plate, DONE alone beneath. Reps, weight
  moved, the colour explainer and Share as text are gone from it (v5.150 to v5.156).
- Sheets guard their edits, notes autosave, the plate calculator SAVE lands in the next set, the
  sumo holds a real dumbbell with a kettlebell choice (v5.120 to v5.124, see the section below).

## The Saturday after the gym (v5.115 to v5.124, 12 Sep 2026)

Small things the owner hit in one session, each shipped the same evening. The two week flip moved up beside the week label and the on or off switch under Saturday reads the same either way (v5.115, v5.116 fixed a pill that hid in name only: a hidden attribute loses to display:flex, see the traps). Settings reads in four panels, Sound, Preferences, Walks (phone only, until connected) and Learn, each with a centred title (v5.117, v5.118). Empty days show a plus alone once the week holds anything; a bare week keeps the words (v5.119). A passed day says Still open, not Waiting; a day holding a workout is solid and only empty days are clear (v5.120). SAVE on the plate calculator lands the loaded total in the next unlogged set (v5.121). Exercise notes save as they are typed, DONE just closes (v5.122). Back on a sheet with an unsaved change asks Keep the change? with SAVE and DISCARD, the number pad, plate calculator, weigh-in, hand-entered walk and new exercise sheet (v5.123). The sumo squat holds a real upright dumbbell in both views, and sumo and goblet offer Dumbbell or Kettlebell on the instruction sheet, remembered per exercise in DB.kb (v5.124). Parked with a brief: generated artwork for the 33 wizard cards (icons/wizard-cards-brief.md).

## Missed days, the week sheet, and two weeks (v5.108 to v5.112, 12 Sep 2026)

From the owner's own Saturday: a Tuesday skipped looked no different from a Friday still to come. Now a passed day still undone wears a quiet Still open pill (Waiting until v5.120), the turnover note names what did not happen and says nothing is owed, and saved cards lost their redundant SAVED tag. Workouts finished opens on the week (a seven-day strip, workouts done of planned, sets, records, that week's sessions; Month and All behind it; walk totals behind one row). And the two week program: a second board behind the first for A B A, B A B weeks, alternating by the calendar, flipped over to build, switched on and off under Saturday, with the other week's workouts moving to Saved when it is switched off. Then two trims from the same conversation: three or more Waiting pills collapse into one calm line above the week (v5.111), and the whole-week UNLOCK button left the footer in favour of UNLOCK THIS ONE on a locked card's hold menu, the one thing people actually needed it for (v5.112). The flip's perspective moved off the home screen after it offset Settings and let the page scroll sideways (v5.113), and the wizard now asks one week or two, building A B A / B A B from two workouts for a three-day week (v5.114).

## The beginner pass (v5.99 to v5.101, 11 Sep 2026)

A second full pass, this time as someone who has never lifted, on a Fold-width preview, with five
agents reading the code in parallel (onboarding, session and builder, phone readability, Progress
and Settings, and every user-facing string). 62 findings; all but a handful shipped across three
builds. The ones that mattered: the first-run flag was written at boot, so one refresh mid-welcome
skipped the safety questions and the wizard for good (now written when the welcome is answered);
Workout Settings lost a rename, a day move or a measure change if you left with the back arrow
(now autosaved like everything else); gold and violet were never explained anywhere a real user
could reach (now one line on the first finish sheet, under "Your first one is in the book"); the
builder ran on 10 px labels and 26 to 30 px buttons (now 12 px and 34 to 38 px). A fresh install
takes its weight unit from the phone's locale, once, so kg users get a kg week. The wizard's
blurbs, the swap-sheet headings, the tour, Settings and the instructions lost their remaining gym
words; "seal" is gone from the live voice; the tour offer is a button on "Your week is forged"
instead of a second dialog. Left on purpose: capitalised words for emphasis inside about twenty
instructions, reordering inside a superset, the three-button level-up sheet, and two layout
questions (splash overlap, rest chips wrapping in the builder) that only the phone can answer.

## What's still left to do

In order of when we plan to touch it:

1. **Tutorial rewrite** — *parked until the very end, on purpose.* The tour's script must teach the app as it now is: per-day completion, superset rest pacing, the Units setting, the one-editor flow. Writing it earlier would have meant rewriting it after every change above. *(Started v4.159: the sample week itself was rebuilt light — three workouts instead of a filled board, one of them cardio, and the demo lift is now a dumbbell bench at 20 lb raised to 25, so the example excludes nobody. The script pass is still to come.)*
2. ~~Remove the sandbox from Settings~~ — done, v4.195. The machinery stays whole and dormant.
3. ~~**First-run wizard, deeper pass**~~ — **done.** Unpinned in v5.0 and deepened since: a safety screen, three behavioural questions instead of self-rating, session length, and a goal that sets reps, rests and whether the week carries cardio. Every axis now answers to the answers — including core work, which used to hand a beginner and a two-year lifter the same 35-second plank (v5.77).
4. **v5: the other themes return** — Obsidian, Frost, and Moonwell are frozen but intact. Forge-only until you say otherwise; this is the one item waiting purely on your word.
5. ~~**Per-exercise instruction, after v5**~~ — **done, and it went further than the plan.** All 114 exercises carry the three-part card the template describes: setup, the cues worth saying, and the one mistake that actually happens. The links out are gone entirely (owner call, 31 Aug) — no exercise carries one. Every exercise also has a moving figure, drawn front and side, and all 93 motion drawings in the file are reachable. This was "the first big project of the post-v5 era"; it is finished.
6. **Device sync, after v5** — write finished sessions out to, and pull cardio in from, the platform health stores: **Health Connect** on Android, and **Apple Health (HealthKit)** if an iOS wrapper ever ships. This is the moment watches and rings start feeding the log — and the point where real-time cardio tracking becomes worth having at all, which is why the live walk clock could retire now (Aug 23) instead of limping along half-connected.
7. **The weight you actually hold (started v5.124, 12 Sep 2026).** The figures draw a dumbbell because that is what the library assumes, but a kettlebell is a straight swap on any two-handed hold (sumo, goblet) and a fair swap on most one-hand work (rows, lunges, step-ups, carries). The difference is the handle: a bell hangs lower and its centre sits below the hands, so the drawing and the setup line should change, and nothing about sets, weights or grading should. Shipped so far: a Dumbbell / Kettlebell choice on the instruction sheet for sumo and goblet, remembered per exercise in DB.kb, read through KBNOW by the held() helper. Still to do: extend the choice to every lift that honestly takes either; when the home equipment question lands in the wizard, seed the choice from what the user owns so the figure already holds their gear the first time the exercise comes round; the card note and the exercise name (Dumbbell Sumo Squat) should follow the choice too.

Smaller known trade-offs, accepted for now:

- The live walk clock is retired outright (Option A, Aug 23): walking is a cardio row inside a workout, logged in minutes like any other set. The old walk streak and history stay visible in Progress as a legacy record until 30 days after the last logged walk, then the strip retires itself. A clock left running at the moment of retirement is banked as a logged walk on next launch.
- Plate-math level-up steps are unit-aware (2.5/5 lb or 2.5/5 kg), and learned machine lattices override them — but a machine needs two logged weights before its lattice is learned.

---

## The voice, settled (Aug 22 — one author, everywhere)

Every word in the app should read as if one careful person wrote all of it. The standard, applied in the v4.163 sweep and binding on every future string:

- **No em-dashes in anything a user reads.** They read as machine-written and corrode trust. Rewrite around them: a period, a comma, a colon, or parentheses always works. (Swept app-wide in v4.175; code comments are exempt.)
- **Plain words, person to person.** Talk to the user like a person, not a client. No coaching voice, no fitness jargon beyond exercise names, no marketing adjectives (powerful, seamless), no filler (simply, just, easily), no exclamation marks, no "Let's".
- **Instruction first.** Say the action, then at most two things worth knowing. Anything more becomes a short list, and lists are rare on purpose.
- **Name what is on the screen** ("Tap the anvil at the end of the row"), never the concept behind it.
- **Calm about consequences.** Every destructive or surprising action states what survives it ("Sessions you already logged stay in your history"). Reassurance is a fact, not a feeling — "nothing is lost," never "don't worry!".
- **The app's nouns are fixed:** workout, day, session, Saved workouts, locked in / unlock, level up, permanently / just today. New copy uses these, never synonyms ("the rack," "kept days" and "reopen" are retired from the generic voice).
- **Buttons are short, verb-first, uppercase,** and they name the destination or the outcome, not the mechanism (MOVE TO SAVED WORKOUTS, ADD PERMANENTLY, UNLOCK).

The tutorial follows the same voice plus three rules from onboarding research (Aug 2026): **teach by doing** (a step that asks for a tap only advances when the tap lands — never a slideshow), **one job per step**, and **progressive disclosure** (nothing is explained before the moment it is needed — which is why the first-run tour is seven steps, the full version lives in Settings, and the week step teaches one plus, not three).

## The day-to-day model, settled

v4.156 replaced the shared-workout model with this one, and it is written down once so it stays settled.

### The model

**Every day owns its workouts outright.** Put "Test Day" on Monday through Thursday and four independent copies exist, one per day. Editing Tuesday touches Tuesday. Adding an exercise to Monday adds it to Monday. Nothing you do to one day can ever reach another — so there is no link to warn about, and all the warning chrome (the shared-days chip, the multi-day delete dialog) is gone.

What makes this safe is that the things worth sharing were never stored in the workout at all:

- **History is per-lift.** Your bench press is one bench press, wherever it was done. Last/Best chips, grading, readiness and the est-1RM charts all read one stream.
- **Level-ups are a live scan, not a stored flag.** Every render asks "did the last log of this lift beat this day's targets?" — so each day's copy raises its own arrow off the shared history. Beat 65 on Monday and accept 70: Tuesday's copy still says 65, sees the log that beat it, and lights its own arrow. Raise Monday again midweek and any day still behind lights again. The scan never stops, which is the whole progression story.
- **Applied raises land in the day's own rows** (v4.156). The old global per-exercise table (`DB.up`) was the last hidden link between days; it was baked into every custom row once (`upScoped`), and custom workouts no longer read it. Built-ins and swapped-in lifts still do — they have no rows of their own to carry a raise.

### How it is enforced

`dayMap()` holds the invariant: a workout id stands on at most **one** day. Any pass that finds the same id on a second day stamps that day an independent copy on the spot (`wkCopy` — same name, effective targets baked in, this week's sealed logs for that weekday re-pointed so finished days stay finished). That one pass is both the migration for old data and the guard behind every placement path — the builder can place a new workout onto four days, and the first pass after it closes deals out the copies.

Two exemptions: the built-in rest day (identical wherever it stands, and its optional default is keyed to its built-in id), and whatever the builder currently holds open (so creation can fill the workout before the split).

### The words

Mid-session edits still ask once at Finish — **ADD PERMANENTLY** or **JUST TODAY** — and "permanently" now scopes to the one day you were on. The built-in day editor says the same pair with the honest verb (SAVE PERMANENTLY, REMOVE PERMANENTLY). "From now on" and "every week" are retired: they read as time and scheduling, when what actually happens is persistence.

### The rule of thumb

> **A workout on a day belongs to that day.**
> Want it on another day too? Place it there — that day gets its own copy.
> Progress is shared because history belongs to the lift, not the day;
> each day's copy earns and applies its own level-ups off that history.
