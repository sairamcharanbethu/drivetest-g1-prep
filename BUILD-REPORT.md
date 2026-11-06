# Build Report — Ontario G1 Prep (drivetest.ssmedia.ca source)

**Built:** 2026-11-06, from `~/workspace/drivetest-course/handbook-extract.md`
(2593 lines, read in full before building). Static site only — no backend, no database, no login, no paywall.
**Source stamp on every page:** "Checked against ontario.ca on 2026-11-06" + the handbook's own
disclaimer that it is only a guide and the Highway Traffic Act governs.

## Files

| File | What it is |
|---|---|
| `index.html` | Shell, nav, footer (source stamp, disclaimer, privacy note) |
| `styles.css` | Ontario blue/white, mobile-first, large tap targets, system fonts only |
| `app.js` | SPA: dashboard, lessons, lesson quizzes, mock tests, 3 interactives, sign guide, samples |
| `data/questions.json` | All questions, parsed from the extraction (see below) |
| `Dockerfile` | `nginx:alpine`, copies the site to `/usr/share/nginx/html`, `EXPOSE 80` (Coolify source build) |

## Question counts — verified by script, not by hand

- **24 lessons × 5 questions = 120 lesson questions** — each with 4 distinct options, exactly 1 correct answer, non-empty handbook source citation.
- **8 handbook sample questions** reproduced verbatim, answers checked against the handbook key (c, c, b, b, d, a, b, d).
- **Signs pool 30** (lessons 14–19) / **Rules pool 90** (all other lessons) — full mock samples 20 + 20 and shuffles every run.
- Parser (`~/workspace/drivetest-course/parse.py`) reads the extraction directly; no question or number was typed by hand.

## Verified corrections applied (override the handbook where flagged)

- **G1 format:** 40 questions, 20 Road Signs + 20 Rules, pass = **16/20 (80%) in EACH section separately**; failing one section fails the whole test. Mock tests are scored exactly this way, with per-section PASS/FAIL shown.
- **Warn-range penalties — handbook figures are OUTDATED and are NOT used:** current ontario.ca figures (updated June 30, 2026) are shown in a red correction box in Lesson 22: BAC 0.05–0.079 → 1st = 7-day suspension + $250 + 8-hr education; 2nd = 14-day + $350 + 16-hr treatment; 3rd = 30-day + $450 + 16-hr treatment + 6-month ignition interlock. BAC 0.08+ → immediate 90-day ADLS + 7-day impoundment. The old "3 days / 7 days" figures appear only inside that correction box, explicitly labelled OUTDATED, and as a wrong distractor option in one question — never as a taught fact.
- **G1 package fee $159.75** is shown with "confirm at drivetest.ca — fees change".

## Checks run + results

| Check | Result |
|---|---|
| `node --check app.js` | PASS (syntax OK) |
| questions.json validation (counts, 4 options, 1 correct, distinct options, non-empty source, 5 per lesson, sample key) | PASS — 120 + 8 |
| Warn-range audit | PASS — old figures only where labelled OUTDATED |
| 20-number cross-check (speeds, distances, demerit points, BAC, suspensions) vs extraction master table | PASS — 21/21 found in both extraction and site JSON |
| Local serve (`python3 -m http.server`) + curl | PASS — index, CSS, JS, JSON all HTTP 200 |
| jsdom end-to-end test (`/tmp/g1test.js`, 27 checks) | **ALL PASSED** — home dashboard renders; lesson quiz 5/5 marks lesson complete in localStorage; full mock all-correct → PASS 20/20 + 20/20, attempt recorded; rules-only mock all-wrong → FAIL 0/20, attempt recorded; dashboard then shows 2 attempts, 50% overall pass rate, 100% full-mock rate, 1/24 lessons; signs page 9 cards; practice + samples pages render; zero JS errors |
| Interactives test (`/tmp/g1interact.js` + `/tmp/g1match.js`) | **ALL PASSED** — 2-second trainer: live timer counts after lead car passes marker, tap returns a measured gap (0.2 s → "Too close") with verdict and true-gap calibration, restart clears; sign matcher: all 8 rounds correct when the right shape is picked, finishes 8/8; right-of-way scenario 1 correct with rule cited |
| External dependencies | NONE — no CDNs, no web fonts, no external scripts; works from the local files alone |
| Internal links | All `#/` routes exist in the router (home, lessons, lesson/N, mock, mock/full|signs|rules, practice, signs, samples) |

### Bugs found and fixed during the self-critique loop
1. Parser mistook "steps 1–4." inside a source citation for a question number — fixed by matching question numbers only at line starts.
2. Per-section pass rates wrongly counted untested sections (a signs-only attempt dragged the rules rate down) — fixed to count only attempts that tested that section.
3. Railway-crossing sign card rendered as a white "50" rectangle — fixed with a proper red X card.
4. Two test-harness faults (not site bugs): jsdom needed a `fetch` base URL; matcher test assumed a fixed round order and tripped on nested parentheses. Both fixed in the harness; the site was correct in each case.

## Known limitations

- **No real sign photos/diagrams.** The handbook text fetch gives sign *descriptions*, not images. The site uses styled CSS cards with the correct shape/colour per family and states on the signs page that the real test shows sign images. A learner should also look at real sign images before the test.
- **"Buying or selling a used vehicle" page is not covered** — the extraction could not read it (HTTP 403 on ontario.ca, 2026-11-06). It is out of scope for the G1 knowledge test topics listed in the handbook, but it is a known gap in handbook coverage.
- **No Level Two road-test chapter** — G2 road-test task detail is not in the extraction and not in this course (G1 knowledge test only).
- **Fine amounts are not shown** (except the warn-range penalties above) — the handbook's Table of Offences gives demerit points only; fine amounts would need the HTA/current sources.
- **Diagrams not reproduced** — roundabout lane diagrams, parallel-parking diagram, pavement-marking diagrams and hand-signal pictures could not be extracted from text; the lessons describe the rules in words.
- **Dockerfile not build-tested locally** — Docker is not installed on this VM. The Dockerfile is 4 lines of standard `nginx:alpine` practice; the Coolify source build is the real test and has not run yet.
- **Pass rate is per-browser** — progress lives in `localStorage` only (`g1.progress.v1`, `g1.attempts.v1`). Clearing browser data, private mode, or a different device resets it. There is no account and nothing is uploaded — that is by design.
- **"Not implemented: Window's scrollTo()"** appears in the jsdom test log only — jsdom lacks `scrollTo`; real browsers support it. Not a site bug.

## What still needs a human check (before / after deploy)

1. **Deploy to Coolify as drivetest.ssmedia.ca** — not done in this task (out of scope by instruction). Needs the parent agent + a fresh write-enabled Coolify token and the go-ahead.
2. **Re-confirm the $159.75 G1 fee at drivetest.ca** before relying on it — fees change.
3. **Spot-read 2–3 lessons on a phone** once deployed, especially the sign cards and the 2-second trainer animation on a small screen.
4. **Show Naga one real sign image set** (e.g. the MTO handbook PDF) alongside the Sign Guide, since the real test shows images, not descriptions.
