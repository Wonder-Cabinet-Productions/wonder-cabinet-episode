# Sprint 3 — Impeccable audit + dual UX testing: kickoff

**Date:** 2026-07-22 · **Branch:** `sprint/3-impeccable-ux` · **PR targets:** `dev/luminous`

Stacked on `sprint/2-brand-switch` until #53 lands in `dev/luminous`; restack with `--onto` after
that merge (recipe in `docs/BRANCHING.md`). The series ships as one gated `dev/luminous` → `main`
rollup — merging this sprint does **not** deploy.
· **Umbrella spec:** `docs/superpowers/specs/2026-06-08-luminous-branding-workplan-design.md` §3 (Sprint 3)

Kickoff scaffold authored at the Sprint 3 boundary. **Collaborative, human-in-the-loop by
design** — `/impeccable` is the audit engine; there is **no autonomous runner** (workplan §5).
The orchestrator does not implement audit findings without walking them through the user first.

## Prerequisite — Sprint 2 live
✅ **Live on DEV**: the Luminous brand switch renders at `https://wondercabinet.riechers.co/luminous/`
(collection) and per-episode pages. The production deploy is still pending (the gated combined
cutover), which does **not** block the Sprint 3 audit — it runs against dev.

## Goal
Harden and polish the now-live Luminous brand switch with expert + human review, then land the
accepted polish. WC-safety invariant carries forward: any Luminous change stays gated on
`body.brand-luminous` / `{{#has tag="luminous"}}`; WC render path stays byte-identical.

## Audit surfaces (3.0)
- **Luminous collection / landing** — `/luminous/`
- **Luminous episode page** — e.g. `/luminous/reclaiming-the-acid-queen/` (verify waveform violet, audio hero)
- **Cross-brand shared components** — navbar, footer, CTA, audio player, comments — under **both** WC and Luminous contexts

## Phases (workplan §3)
| Phase | Work | Mode |
|---|---|---|
| **3.0 Impeccable audit** | `/impeccable` across the surfaces above — visual hierarchy, IA, cognitive load, a11y, motion, anti-patterns | agent-driven |
| **3.1 Collaborative triage** | Walk each recommendation with the user — accept / defer / reject; accepted items become `features.json` entries | **HUMAN GATE** |
| **3.2 Expert-agent UX test** | UX-expert agent pass — task-flow walkthrough, friction, brand coherence under both contexts | agent-driven |
| **3.3 User UX test** | User drives the live site; feedback triaged via `planning/TRIAGE.md` severity/category into fix items | **HUMAN GATE** |
| **3.4 Polish + close** | Implement accepted fixes, final cross-brand QA, gscan, deploy | build team |

## Known carry-forward backlog (seeds Sprint 3 before the audit even runs)
From the #46/#53 reviews and this session's deferrals — candidates for 3.1 triage:
- **Live-verify on a Luminous POST** — waveform violet (`--show-accent` via JS `document.body`), dashed rule, hidden cabinet/brackets, wavy hero. (The `/luminous/` archive is already verified; the post page is not.)
- **#51** — WC focus-ring is 3.10:1 on cream, only 0.10 above the WCAG 1.4.11 floor. Guardrail comments exist; decide whether to widen the margin.
- **#52** — transcript `:focus-visible` root-cause (the contradictory-rule deletion shipped; issue tracks the underlying fix).
- **Eye-icon favicon** — deferred (per-page favicon unreliable + `.hbs` needs a Ghost restart). Consider a publication-level icon for the `/luminous/` collection.
- **Navbar brand adoption** — open design question: should the persistent nav (logo, Subscribe) follow the per-page brand, or stay WC-green on Luminous pages? Currently stays WC-green.
- **§8 full asset reorg** — only `assets/images/luminous/` was added (minimal). The `shared/` + `wc/` split is still deferred.
- **Process fix** — `.hbs` edits need a Ghost restart on `ghost01` to take effect (template cache); the CLAUDE.md "refresh is enough" note is stale. Worth fixing the dev loop or the doc.

## Kickoff
The first step is **3.0** — run `/impeccable` against the three surfaces and collect findings,
then **3.1 collaborative triage** with the user. Because Sprint 3 is human-in-the-loop, nothing
gets implemented before that triage. `features.json` starts seeded with the carry-forward items
above and grows with accepted audit findings.
