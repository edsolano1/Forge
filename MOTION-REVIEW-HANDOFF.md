# Handoff: Motion Study fix rounds (fresh eyes, round 2)

> **STALE — read this box before acting on anything below. Last accurate 5 Sep 2026.**
>
> This brief is for the motion-study ARTIFACT BOARD, not the app, and it says the app is at
> v5.65 and "not in scope". The app is now **v5.80** and the animations very much were in
> scope: fourteen drawings that no exercise could reach were wired up in v5.75 and v5.76, and
> the library went from 92 exercises to 106.
>
> Two of the six cards this brief lists as "in review" were examined in the v5.71 review and
> found **correct as drawn**:
>
> - **Side Plank** — the brief asks for a free hand on the hip with a pronounced akimbo gap.
>   It is there, and always was: shoulder to a raised elbow to a hand on the hip, under a
>   comment saying exactly that. It reads as missing at small render sizes, which is how it
>   got mis-filed twice.
> - **Push-up** — the toes are planted and the plank line holds.
>
> The others (Hack Squat, Slanted Calf Raise, Leverage Chest Press, Ab Crunch Machine) were
> not re-examined against the owner's reference photos, so this brief still stands for them.
> The Ab Crunch Machine's WORDS were rewritten in v5.72 to match the drawing the owner
> approved — the drawing itself was not touched.
>
> **The method warning in here is the valuable part and it is now proven twice over.** Judging
> these drawings from rendered output rather than reading the source produced four wrong
> findings in one session. See "THE TRAP" in `Arcanum-Android/HANDOFF.md`.

You are the SECOND fresh pair of eyes. The previous session (and the one before it) drew and
redrew these cards; the owner says the last session "wasn't getting it" on several, so trust
NOTHING it shipped — render the pixels and judge against the owner's words below. The owner
reviews visually and speaks in machine-reality terms; when they describe a machine, find a
reference image and match it literally.

## Where everything is

- **The board**: https://claude.ai/code/artifact/e9d96ba7-353c-415e-80e3-bca21a05a1e8
  Currently **v65**. Fetch with the Artifact tool (`action: "read"` + that URL — owner-owned,
  raw HTML is saved to a local file; you must Read every line before you can republish).
  Publish fixes back to that SAME url with a short `label` ("v66 ..."), bumping the `v65`
  in the `<h1>` each time. Sign every reply with a TLDR + the version to look for.
- **The app** (`index.html`, v5.65, this folder) is untouched and not in scope right now.
  `CLAUDE.md` is binding — read it (traps: duplicate CSS, no linter, escape mangling).
- **Memory**: `forge-motion-foot-anatomy.md` (toes point AWAY from the body — a heel-only
  stub reads as a reversed figure; the owner has flagged this repeatedly) and
  `forge-animation-consistency.md` (cross-view laws).

## Board layout (v65)

- Top section "**In review — the working set**": **6 cards** — Hack Squat, Slanted Calf
  Raise, Leverage Chest Press, Ab Crunch Machine, Push-up, Side Plank.
- Everything else (87 cards) is APPROVED, folded inside a closed `<details>` at the bottom.
  Do not touch approved cards unless the owner asks. When the owner approves a card, MOVE its
  `<div class="card">` block into the details grid and update the count in the `<summary>`.
  If the owner doesn't mention a card when reviewing, that also means approved — move it.

## The six open cards — the owner's words, and what v65 attempted

The owner supplied four reference photos in the prior chat (they do not persist — ask the
owner to re-attach if you need them): (1) a woman on a 45° hack squat, hands gripping the
shoulder-pad handles beside her head, knees folded, feet on the big angled platform out FRONT;
(2) a GymVisual render of the 45° calf raise machine — body upright on a small seat riding
angled rails, legs near straight down-slope, plates on a horn in front, balls of feet on a
thin plate; (3) a plate-loaded seated crunch machine — user seated, elbows in a forward V
gripping handles behind the head, roller cushions; (4) a man in side plank — straight line,
forearm toward camera, free hand on hip with a clear akimbo gap, both legs visible.

1. **Hack Squat (hk)** — repeated failure card. Owner: the legs went BEHIND the user; they
   must go out FRONT (reference 1: feet on a platform in front of the backrest plane, knees
   folding toward the chest/camera). v65 moved the platform+feet to the front side of the
   rails (platform seg [318,394]-[240,362], ankle [272,376]) — verify it actually reads
   front, at both k=0 (legs near straight) and k=1 (deep fold). Front view (hk_f) is
   owner-approved; only tune the side.
2. **Slanted Calf Raise (dc)** — the dedicated 45° calf machine (reference 2). v65 added
   visible arms to the seat handle. Check: upright body, near-straight legs, thin foot plate,
   plates on the FRONT horn, heel below→above the plate, toes planted pointing away.
3. **Leverage Chest Press (lv)** — owner: the press goes FORWARD first, then curves UP — a
   quarter-circle, not straight up; the plates end higher than the head. v65 put a pivot at
   [240,196] with the handle sweeping ang 90→26 at r66 (tangent starts horizontal). Verify
   the arc reads forward-then-up and that nothing crosses the face.
4. **Ab Crunch Machine (ab)** — owner: NO plates; cushion UNDER the thighs and one on the
   UPPER back (none on the lower back); user sits on a raised platform; the feet HANG and
   keep hanging through the crunch; elbows forward-V, hands on handles behind the head.
   v65 rebuilt both views this way — verify cushions read as cushions and feet never touch
   the floor line (432).
5. **Push-up (pw)** — owner: the model must have TOES touching the ground, and the toes prop
   the legs up higher. v65: ankle fixed at [360,404] above planted toes [368,424] with a toe
   pad on the floor. Verify the foot reads and the plank stays flat (rot 20°→11°).
6. **Side Plank (sd)** — side view (`sd_s`, drawn by `drawSidePlkF` — note the F/S function
   names are SWAPPED for this card in the ALL registration). Owner: both legs visible (top
   leg slightly forward), free hand ON the hip with a PRONOUNCED akimbo gap, support forearm
   angled toward the camera with minor slack. The other view (`sd_f`) is a TOP view — that
   one is fine.

## Working method (proven over 11 rounds — use it)

1. Read the artifact (all lines), copy the saved file into your scratchpad as `motionNN.html`.
2. Edit with a Node script of anchored one-shot replacements (`throw` if an anchor matches
   0 or 2+ times; write the file only after all anchors land). Never use `node -e` heredocs
   with backslash escapes (CLAUDE.md trap 3).
3. Syntax-check: extract the `<script>` block, `new Function(...)` — the page has no linter.
4. Verify on pixels, never by assumption. The page boot reads `?k=` from the URL: `?k=0`
   freezes every canvas at the top of the rep, `?k=1` at the bottom. Serve the scratchpad
   over localhost (a tiny node http server; `.claude/launch.json` has a `motion-scratch`
   entry but its `runtimeArgs` path points at the PREVIOUS session's scratchpad — rewrite it
   to yours). Then in the browser pane use `javascript_tool` + `getImageData`:
   ink filter `d[p]>200&&d[p+1]>190&&d[p+2]>180`, implement-orange filter
   `d[p]>180&&d[p+1]>90&&d[p+1]<160&&d[p+2]<90`. ASCII density maps (40x40 grid) are the
   honest way to "look" at a pose; bounding-box spans catch clipping and floor violations.
   Pane screenshots often come back black once scrolled — don't rely on them.
5. Publish with the Artifact tool (`file_path` + `url` + `label`), bump the h1 version.

## The laws (violations are findings)

- Cross-view: same landmark heights both views, every frame; r19 heads (drawn r22).
- Machines are RIGID: constant lever radii — measure, don't eyeball.
- Real implements; cables from real pulleys; wrists never overshoot handles.
- **Feet: heel → ball → TOES, toes pointing away from the body in the facing direction,**
  on the support surface. This is the owner's most-repeated correction.
- Limbs keep their lengths (upper ~50, forearm ~55, thigh ~92, shin ~88, torso 98) unless
  genuinely foreshortening out-of-plane — and then say so in a comment.
- TOP views exist now (hollow hold, leg raise, prone curl, russian twist, side plank's
  second slot): mat/bench from above, LINE-color furniture, figcaption says TOP.
- Standing figure: feet 424, hip 244, shoulder 146, head 98. The proportions debate
  (7.9 heads vs 7.5; possible global head-size bump) is parked, unresolved.

## Etiquette the owner expects

- Short replies, TLDR + version number at the end, no jargon.
- Only fix what the owner flags; unmentioned cards in a review pass = approved → fold them.
- When a machine is unfamiliar, find reference imagery BEFORE drawing (browser pane; DDG
  images works with the pane fronted + long waits; Wikimedia Commons API is reliable).
- The owner may attach reference photos — follow them literally; they outrank your priors.
