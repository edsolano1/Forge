# Forge

*An offline workout logger. One file, no account, no server — your data lives on your phone and nowhere else.*

**Current build: v5.107** (watch 1.4) · Web (GitHub Pages) + Android wrapper · formerly "Arcanum," renamed in v4.145

---

## What Forge is

Forge is a single-page app that does one thing seriously: log your training and move your numbers up. You build workouts, place them on the days of your week, and run them as sessions — every set saves the moment you tap it. The app grades each set against your history (gold = best ever, violet = matched, bronze = under), offers level-ups when you've beaten every target, and learns each machine's real weight lattice from what you log, so it never offers a weight that doesn't exist on the stack.

It works fully offline, ships as one HTML file, and stores everything on the device. Pounds are the permanent internal truth; kilograms is a display language you can switch on in Settings, with every generated number born natively in your unit.

### The big pieces, as they stand

| Area | State |
|---|---|
| Week board | Seven days, up to 3 workouts each; per-day completion ("locked in"); a visible Saved workouts box under the week; when the last day locks, the app offers to unlock the week (v4.157) |
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
| First run | A safety screen, three behavioural questions, session length, what equipment you have, and a goal — then a week built to the answers |
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
