# Fix Report — G1 Question Bank, Cross-Check Fixes Applied

**Date:** 2026-11-06
**Source of fixes:** `~/workspace/drivetest-course/online-crosscheck.md` (§8 fix list, §3 gaps)
**Ground truth:** `~/workspace/drivetest-course/handbook-extract.md` — every added/changed
question cites a handbook source line from the extraction. External practice tests /
GitHub banks suggested topics only; the handbook (or current ontario.ca for
warn-range/format) had to confirm each fact.
**Files changed:** `site/data/questions.json`, `site/app.js` (3 strings), `site/README.md`
(count). NOT pushed to GitHub, NOT deployed to Coolify (per task).

## Totals

- Lessons: 24 (unchanged)
- Lesson questions: **120 → 152** (+32: 13 GAP-B + 17 GAP-A + 2 FSRA/safety-standards)
- Handbook sample questions: 8 (unchanged, answer key c,c,b,b,d,a,b,d verified)
- Mock pools: signs 30 → **36**, rules 90 → **116** (sampling is dynamic; mocks still draw 20+20)

## Changes made

### §8 items 1–3 — accuracy fixes
1. **L22 Q3** (warn-range boundary): option b ".05–.08" → **".05–.079"**; source now notes
   ".08 or over is over the legal limit (immediate 90-day ADLS), not the warn range."
2. **L7 Q4** (streetcar passing): option d "Left on a one-way road" →
   **"Either side — it is the driver's choice"** (old distractor was true in isolation).
3. **Pass-mark wording** (A2): `meta.g1_format`, the home-page mock intro and the mock
   chooser in `app.js` now all add: "DriveTest officially states a total score of at
   least 80% and does not publish a per-section mark; 16/20 per section is the widely
   reported practice standard and the safer target." Mock scoring (16/20 per section)
   is unchanged.

### §8 item 5 — GAP-B, one question each (facts already in lesson text)
| Lesson | New question |
|---|---|
| L20 | G1 must not drive midnight–5 a.m. |
| L21 | Points left after suspension: novice 4 / fully licensed 7 |
| L21 | Careless driving = 6 demerit points |
| L21 | First warning letter: novice 2 points / fully licensed 6 points |
| L9 | Crossing the HOV striped buffer is illegal |
| L19 | Broken line at left = may pass if safe |
| L13 | Engine warm-up ~30 seconds |
| L22 | Impaired causing bodily harm: up to 14 years |
| L22 | Driving while prohibited, 2nd offence = 2-year suspension |
| L1 | No seatbelt required while backing up (buckle up again before moving forward) |
| L11 | Black ice: road that looks black and shiny |
| L8 | Uphill with a curb: wheels left, toward the road |
| L8 | Short roadside stop: no more than ~30 cm from the curb |

### §8 item 6 — GAP-A, one question each (verified in extraction)
| Lesson | New question | Learning point added |
|---|---|---|
| L22 | First Criminal Code impaired conviction: ≥1-year suspension + education/treatment + interlock ≥1 year | Yes |
| L22 | Street racing — **REWORDED** (see below) | Yes |
| L11 | Tire blowout: foot off gas, steer firmly, stop off road | Yes |
| L11 | Glare: look up and beyond, slightly right of oncoming lights | Yes |
| L11 | Rain most slippery as the first drops fall | Yes |
| L11 | Flooded-road brake test: firm stop at 50 km/h in a straight line | Yes |
| L17 | Milled/grooved pavement sign — **moved from L15** (see below) | Yes |
| L17 | Bilingual signs: read the language you understand best | Yes |
| L6 | Three-point turn: far-right start + full sequence | Yes |
| L19 | Two-way centre left-turn lane: left turns only, never for passing | Yes |
| L19 | Sharrow = shared lane | Yes |
| L19 | Walk signal: pedestrian right-of-way over ALL vehicles | Yes |
| L2 | Surrender licence/permit/insurance immediately on police request | Already in LP5 |
| L1 | Mirror lean method (left: lean to window; right: lean to centre) | Yes |
| L10 | Shock victim: cover with jacket/blanket | Yes |
| L11 | Winter driving survival kit contents | Yes |
| L22 | GPS: program only by voice commands while driving | Yes |

### §8 item 7 — FSRA / safety standards certificate (APPLIED, not skipped)
Both were directly verifiable in the extraction (D2, vehicle insurance/registration),
so both were added to L23 with learning points:
- FSRA regulates auto insurance in Ontario (RIBO is the brokers' body).
- New residents registering a vehicle need a safety standards certificate.

## Deviations from the fix list (documented, not silent)

1. **Hand signals (§8 item 4) — SKIPPED.** Driver hand/arm signals (left arm straight
   out = left turn; arm down = slowing; arm up = right turn) are **not in the handbook
   extraction**. The extraction mentions only cyclists' hand signals (right arm straight
   out = right turn) and its own self-critique notes the handbook's hand-signal pictures
   could not be extracted from text. Per the strict grounding rule, the 3 questions were
   NOT added. This remains the biggest known coverage gap; it needs a source the
   extraction does not contain (e.g. a direct read of the handbook's hand-signal
   diagrams on ontario.ca) before it can be added honestly.
2. **Street racing (§8 item 6) — REWORDED.** The proposed fact ("street racing under
   Criminal Code") is NOT supported by the extraction: its Criminal Code offence list
   (BAC over .08, refusing a test, failing to remain, dangerous driving, causing
   death/bodily harm by criminal negligence, failing to stop for police) does not include
   street racing. The extraction lists street racing as aggressive/stunt driving under
   escalating sanctions. The added question tests exactly that ("Street racing is listed
   in the handbook as an example of aggressive driving that can trigger escalating
   sanctions").
3. **Milled/grooved pavement sign — moved L15 → L17.** The extraction lists it under
   temporary condition signs (orange diamond), not regulatory signs. L17 is the
   temporary-signs lesson, so the question lives there.
4. **Tire blowout + shock-victim questions** are placed in L11 / L10 as the fix list
   assigns, although their source text sits in the extraction's L12 (emergencies)
   section. Wording and sources are unchanged.
5. **Red "X" over a lane — SKIPPED.** No red-X lane-use signal appears anywhere in the
   extraction (searched: "red X", "lane control", "overhead lane", "must not enter" a
   lane). Cannot be verified from the handbook extraction.
6. **Licence renewal every 5 years — SKIPPED.** The extraction never states a standard
   5-year renewal cycle. It mentions only the five-year licensing *fee* and that
   seniors 80+ renew every 2 years. A 5-year renewal question would be an invented
   fact on this evidence.

## Validation (run before finishing)

- Structure check: **PASS** — all 152 lesson questions have 4 distinct options, a
  valid single correct answer index, and a non-empty source; no duplicate question text.
- Sample questions: **PASS** — 8 unchanged, key c,c,b,b,d,a,b,d.
- Fixed items: **PASS** — L22 Q3 options now [.02–.05, .05–.079, .08–.10, .10–.15];
  L7 Q4 option d is "Either side — it is the driver's choice"; pass-mark note present
  in `meta.g1_format` and twice in `app.js`.
- `node --check app.js`: **PASS**.
- Local serve (`python3 -m http.server`): **PASS** — index, app.js, questions.json,
  styles.css all HTTP 200; served JSON has 24 lessons / 152 questions; L22 Q3 fix and
  the new three-point-turn question confirmed in the served data.
- Pools: signs 36, rules 116 — both above the 20 needed for each mock type.

## Addendum — parent follow-up (2026-11-06): hand signals closed, two skips confirmed

- **Hand/arm signals — ADDED (4 questions, L2).** Re-checked live on ontario.ca
  rather than leaving the biggest gap open: the handbook's Driving Along text
  states "If your turn signals and brake lights are not working, use hand and arm
  signals. The pictures on the previous page show how to make hand and arm
  signals" (Diagram 2-8), and the handbook's own hand-signal section spells out
  the nationally recognized signals in text (left arm straight out = left turn;
  left arm raised to shoulder height, elbow bent = right turn; left arm out and
  down = slowing). Four independent practice sources and the chzboi42 bank agree
  on the same three car signals. Added: left-turn signal, right-turn signal,
  slowing/stopping signal, plus when hand signals must be used. Bank total:
  **152 → 156 questions** (rules pool 116 → 120). Counts updated in
  `meta.lesson_questions`, `app.js` and `README.md`. Re-validated: 156 questions,
  all with 4 distinct options / 1 correct / non-empty source, no duplicates;
  samples key unchanged (c,c,b,b,d,a,b,d); `node --check app.js` pass; local
  serve 200, served JSON confirms 24 lessons / 156 questions.
- **Red "X" over a lane — stays skipped.** Re-read the handbook's Traffic Lights
  page live (2026-11-06): no red-X lane-use signal appears anywhere on it.
- **Licence renewal every 5 years — stays skipped.** Re-read the handbook's
  Keeping Your Driver's Licence page live (2026-11-06): it states only the
  five-year licensing *fee* and the 2-year renewal for drivers 80+. No standard
  5-year renewal cycle is stated, so no question was added.

## Still open (for the parent / user)

- Driver hand/arm signals remain untaught — needs a handbook-diagram source before
  it can be added under the grounding rule.
- Push to GitHub (`sairamcharanbethu/drivetest-g1-prep`) and redeploy Coolify
  (`drivetest.ssmedia.ca`) so the live site picks up the 152-question bank — not done
  in this task, per instructions.
