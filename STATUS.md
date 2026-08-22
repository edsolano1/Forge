# Forge

*An offline workout logger. One file, no account, no server — your data lives on your phone and nowhere else.*

**Current build: v4.155** · Web (GitHub Pages) + Android wrapper · formerly "Arcanum," renamed in v4.145

---

## What Forge is

Forge is a single-page app that does one thing seriously: log your training and move your numbers up. You build workouts, place them on the days of your week, and run them as sessions — every set saves the moment you tap it. The app grades each set against your history (gold = best ever, violet = matched, bronze = under), offers level-ups when you've beaten every target, and learns each machine's real weight lattice from what you log, so it never offers a weight that doesn't exist on the stack.

It works fully offline, ships as one HTML file, and stores everything on the device. Pounds are the permanent internal truth; kilograms is a display language you can switch on in Settings, with every generated number born natively in your unit.

### The big pieces, as they stand

| Area | State |
|---|---|
| Week board | Seven days, up to 3 workouts each; per-day completion; quenched (finished) styling |
| Sessions | Write-through logging, grading, PR flare, rest timers, molten-bar notification (Android) |
| Builder | The one editor for everything — per-set targets, supersets, per-row lift/cardio measures |
| Mid-session edits | Hold an exercise → the real builder opens → one question at Finish: *from now on, or just today?* |
| Level-ups | Per-workout targets, per-lift history; machine lattice learning; kg-native plate steps |
| Progress | 8-week volume bars, this-week-vs-last rows, per-exercise est-1RM charts |
| Units | lb/kg toggle (Settings); storage stays pounds forever; zero-drift round-tripping |
| Library | Neutral starting weights (nobody's personal log), full names, searchable swap sheet |
| Sounds | One master volume dial for everything, including the native screen-off alert |
| Backup | Plain-text export via share sheet; JSON backup/restore |

---

## What's still left to do

In order of when we plan to touch it:

1. **Tutorial rewrite** — *parked until the very end, on purpose.* The tour's script must teach the app as it now is: per-day completion, superset rest pacing, the Units setting, the one-editor flow. Writing it earlier would have meant rewriting it after every change above.
2. **Remove the sandbox from Settings** — *the last step before shipping.* It's a development tool for replaying the first-run experience; real users don't need it.
3. **First-run wizard, deeper pass** — *pinned until v5.* The "build one for me?" question and the three-question forging ritual are fully built and working, but deliberately switched off (`EZ_ON` flag). We want to invest real design time there rather than ship it as-is. Until then, a first run lands on an empty week with the tour offer.
4. **v5: the other themes return** — Obsidian, Frost, and Moonwell are frozen but intact. Forge-only until then.

Smaller known trade-offs, accepted for now:

- The walk *streak* only counts walks logged through the walk sheet (which now only appears while a walk's clock is running). Cardio rows inside workouts count toward sessions and volume, not the streak.
- Plate-math level-up steps are unit-aware (2.5/5 lb or 2.5/5 kg), and learned machine lattices override them — but a machine needs two logged weights before its lattice is learned.

---

## The shared-workout question, settled

This is the issue we went back and forth on, written down once so it stays settled.

### The model

**A workout placed on several days is one workout, not several copies.** Put "Test Day" on Monday through Thursday and there is exactly one Test Day recipe; four days point at it. This is a deliberate choice, and it's what makes the good things work:

- **Level up once, not four times.** Beat every target Monday, accept 65 → 70, and Tuesday through Thursday already ask for 70. With detached copies you'd re-accept the same raise on every day, every week.
- **Edit once.** Change a rest timer, swap in a superset, add an exercise — the whole week updates together instead of drifting apart by accident.
- **History is per-lift, not per-day.** Your bench press is one bench press. The Last/Best chips, grading, and readiness all read one stream, wherever the lift was done. (A *different* workout containing the same exercise keeps its own targets entirely — verified: leveling one never touches the other's numbers.)

### What made it feel wrong — and what fixed each part

| The pain | The fix | Since |
|---|---|---|
| Finishing Monday marked Thursday finished too | Completion is per **day**, not per workout | v4.142 |
| Deleting from one day silently deleted the whole series | The removal button aims at the day you held (**TAKE IT OFF WEDNESDAY**); DELETE names every day it will clear before it acts | v4.153–155 |
| Editing reached every day with no warning | A quiet **MON · TUE · WED · THU** chip sits by the name the whole time you edit a shared workout | v4.154 |
| "I only meant this change for today" | Mid-session edits get one question at Finish: **FROM NOW ON** or **JUST TODAY** (just-today keeps what you did in history, then puts the plan back) | v4.146 |
| "I want this day to be different, permanently" | **Duplicate** (Workout Settings) → place the copy → it becomes its own workout with its own targets and level-ups | always |

### The rule of thumb

> **Same workout on many days = one thing, on purpose.**
> Editing it changes every day it stands on — the chip tells you which.
> Mid-session changes ask whether they outlive today.
> A day that should become different isn't a modification — it's a new workout. Duplicate it.

We tried the alternative (a fork button, a ladder of scoped options) and rolled it back the same day: three buttons on a hold, never more. Capability lives in the model; the menus stay small.
