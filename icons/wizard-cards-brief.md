# Wizard card artwork brief

Forge's first-run wizard asks one question per screen. Each answer is a tall card with a small
picture at the top, a title, and one line under it. This is the full set of pictures to generate,
one per answer. 33 pictures in 8 groups.

## Style, once, for every prompt

- Flat, single colour on a dark ground. Ember orange `#D97B2E` on near-black `#0A0605`.
  One accent shade of pale gold `#E8B86D` is allowed for one highlight per picture, nothing more.
- Line drawing or solid silhouette, not both in one image. No gradients, no shadows, no texture,
  no photo realism, no 3D. Think a heavy enamel pin or a woodcut, not an illustration.
- Square, centred subject, generous empty margin all round (the subject fills about 60% of the frame).
- No text, no letters, no numbers inside the picture. The card already carries the words.
- Same line weight and the same level of detail across the whole set. They sit side by side.
- The mark of the app is a hammer coming down on an anvil. Anything forge, ember, iron or heat
  is on brand. Nothing cartoonish, nothing with faces.
- Deliver as PNG at 1024 by 1024 on the dark ground, one file per line below, named as shown.

## The cards

### 1. Have you followed a real program? (xp1)
- `xp1-never.png` Never. An unlit forge: a cold anvil, no glow.
- `xp1-6mo.png` Up to 6 months. A single coal just beginning to glow.
- `xp1-2yr.png` 6 months to 2 years. A small bed of coals, steady heat.
- `xp1-over.png` Over 2 years. A full forge fire, roaring.

### 2. Do you know your working weights? (xp2)
- `xp2-no.png` No, I don't track. A blank ledger page, closed book.
- `xp2-some.png` For a couple of lifts. An open ledger with two lines written.
- `xp2-yes.png` Yes, for most. An open ledger filled to the foot of the page.

### 3. The last three months, honestly? (xp3)
- `xp3-none.png` Not training right now. A hammer laid down on the bench.
- `xp3-onoff.png` On and off. A hammer mid swing with a broken, dotted arc behind it.
- `xp3-steady.png` Twice a week or more. A hammer mid swing with a solid, complete arc.

### 4. How many days a week? (days)
- `days-1.png` One day. Seven small squares in a row, one filled.
- `days-2.png` Two days. Same row, two filled.
- `days-3.png` Three days. Three filled, spaced apart.
- `days-4.png` Four days. Four filled.
- `days-5.png` Five days. Five filled, the last two empty.
(These five must be the exact same drawing with only the fill changing.)

### 5. One week, or two that alternate? (weeks)
- `weeks-1.png` One week. A single ring, closed.
- `weeks-2.png` Two weeks. Two rings linked like a chain.

### 6. How long is a session? (len)
- `len-30.png` 30 minutes. A plain clock face with exactly half of the face shaded.
- `len-45.png` 45 minutes. Three quarters shaded.
- `len-60.png` 60 minutes. The whole face shaded.
(Same clock, only the shaded wedge changes. Face with no numbers.)

### 7. What do you train with? (kit)
- `kit-gym.png` A gym. A cable machine tower, side on, one clean silhouette.
- `kit-home.png` A barbell at home. A loaded barbell resting in a squat rack.
- `kit-dbb.png` Dumbbells and a bench. A flat bench with one dumbbell laid on it.
- `kit-dbo.png` Just dumbbells. A pair of dumbbells, one upright, one lying down.
- `kit-none.png` Nothing but a floor. A rolled mat on bare boards.

### 8. What is it for? (goal)
- `goal-strong.png` Get strong. An anvil, heavy and squat, edge on.
- `goal-muscle.png` Build muscle. A stack of forged ingots, three high.
- `goal-lean.png` Lose weight. A single flame, tall and clean.
- `goal-move.png` Just get moving. Three curved lines of wind, or a footprint pair mid stride.

### 9. The welcome, before the wizard (2 cards)
- `wc-build.png` Build one for me. The hammer above the anvil, about to strike.
- `wc-know.png` I know what I'm building. Blueprint style: a week grid of seven empty boxes.

## What happens next

Drop the PNGs in `icons/wizard/`. They get wired as the card pictures in place of the current
inline SVG (`EZ_ART`, `ezScale`, `ezClock`, `ezDays`). If the set is strong and consistent, each
one is traced back into a flat SVG path so it scales cleanly and keeps the offline file small.
The pictures are decoration on top of the text; the card stays fully readable with the picture
missing, so nothing about the wizard's logic changes.
