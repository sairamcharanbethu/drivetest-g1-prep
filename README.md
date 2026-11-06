# Ontario G1 Prep — DriveTest Practice

Free, unlimited G1 knowledge-test practice for Ontario, built from the
Official MTO Driver's Handbook (ontario.ca).

- **24 lessons** covering Safe and Responsible Driving, traffic signs and
  lights, licensing / demerit points, and your vehicle — with
  India-difference callouts for experienced drivers new to Ontario.
- **120 lesson questions + 8 handbook sample questions**, every one with a
  handbook source citation.
- **Unlimited free mock tests** — full 40-question mock (20 signs + 20
  rules), signs-only, rules-only — shuffled every run and scored exactly
  like the real G1: **16/20 in each section to pass**.
- **Pass-rate dashboard** (overall + per-section), stored only in the
  browser — no account, no sign-up, nothing uploaded.
- **Hands-on drills:** 2-second following-distance trainer, sign
  shape/colour matcher, intersection right-of-way scenarios.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Or deploy the `Dockerfile` (nginx:alpine, port 80) — e.g. Coolify source
build, domain `drivetest.ssmedia.ca`.

## Sources & currency

- Official MTO Driver's Handbook, ontario.ca — checked 2026-11-06.
- G1 format: 40 questions, 20 + 20, pass 16/20 per section. Package fee
  $159.75 — confirm at drivetest.ca, fees change.
- Warn-range penalties use current ontario.ca figures (updated June 30,
  2026): 1st 7 days / $250, 2nd 14 days / $350, 3rd 30 days / $450 +
  6-month ignition interlock. The handbook's older 3/7-day figures are
  outdated and are flagged as such in Lesson 22.
- The handbook is only a guide. For official purposes, refer to the
  Highway Traffic Act of Ontario.

## Limits

Signs are drawn as shape/colour cards, not real sign photos — study real
sign images too before the test. No G2 road-test content. See
BUILD-REPORT.md for the full verification report.
