# Post-Luminous Roadmap

**Status**: Planning — not yet started (gated)
**Gate**: Blocked until the Luminous brand arc lands its combined deploy (PRs [#46](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/pull/46) + [#53](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/pull/53))
**Scope**: Compiles the open GitHub issues into sequenced, ready-to-promote sprints for after Luminous
**Related**: `docs/multi-brand-design-system.md` §9 (live refactor backlog) · the Luminous umbrella spec + `planning/sprints/1-foundation/` land with the deploy

## Purpose

The Luminous multi-brand work is in flight across two stacked PRs held for a **single combined production deploy**. This roadmap organizes the remaining open issues into a plan we can execute once that deploy lands — grouped by theme, ordered by dependency, and de-conflicted against work the Luminous arc already owns. It is the sequencing authority; [`backlog.md`](backlog.md) carries the same items as tracked entries. Promote one sprint at a time into `planning/sprints/current/` (`design.md` + `features.json`) per [`TRIAGE.md`](TRIAGE.md)'s 3+-related-issues rule.

## Gate

**Nothing here starts until PRs #46 + #53 merge.** That merge is also what closes the resolved issues below (via `Closes` footers) and makes them verifiable on the live site — so the roadmap's first action is a verify-and-close pass, not a sprint.

## Disposition of all 16 open issues

| Bucket | Issues | Action |
|---|---|---|
| **Resolved by Luminous** | #34, #51, #52 | Verify-and-close batch (below) — do **not** re-sprint |
| **Entangled — owned by the Luminous arc** | #40, #37, #29 | Coordinate, don't re-sprint (see "Luminous-arc coordination") |
| **Genuinely post-Luminous** | #35, #24, #22, #23, #39 · #43, #33 · #42, #41, #38 | The batch + sprints below |

## Verify-and-close batch (run immediately after the combined deploy)

Not a sprint — a short confirmation pass. The fixes live on the held branches; leave the issues open until the deploy makes them live.

- [ ] [#34](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/34) — Luminous accent colors finalized in PR #46 (`--luminous-accent` → `#9A59FF` + text/dark variants). Confirm the `.wc-highlight--luminous` card/badge/button render violet live, then close.
- [ ] [#51](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/51) — focus-ring contrast guardrail; PR #53 commit `a8c8cbb8` carries `Closes #51`. Confirm auto-closed on merge; close manually if not.
- [ ] [#52](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/52) — contradictory `.wc-transcript-toggle:focus-visible` pair; same commit carries `Closes #52` (the issue *body* text saying "out of scope" is stale — it was fixed by a later commit on the same branch). Confirm auto-closed.
- [ ] Spot-check [#40](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/40) (CSS greens now tokenized to `--show-accent`; SVG greens still open — see coordination) and [#37](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/37) against the deployed state.

## Hygiene micro-batch — *not a promoted sprint*

Independent, zero-dependency quick wins, below the 3-issue-per-category promotion threshold. Run as a single maintenance session (ideally before Sprint 4).

- [ ] [#42](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/42) — delete orphaned `assets/images/illustration-footer-cabinet-table.png` (only the `.svg` is referenced live).
- [ ] [#41](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/41) — delete the orphaned 6-file favicon/app-icon set (**Option A**; live site uses the logo WebP as Ghost Publication Icon). *Choosing Option A closes #41 and makes its Option B — wiring the icons into `default.hbs`, deferred to Sprint 5 — moot.*
- [ ] [#38](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/38) — README: document homepage highlight zones, the Ghost Admin featured-flag content workflow, and the hardcoded tag-slug dependencies in `home.hbs`. Docs-only.

## Sprint 4 — Homepage content-density & discovery UX

> **Category**: `hbs` + `feature`/`enhancement` · **5 issues → qualifies for promotion** · **Order**: first (highest listener-facing value, self-contained).

Dependency-ordered — earlier items unblock later ones:

| # | Issue | Work | Why this order |
|---|---|---|---|
| 1 | [#35](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/35) | Fix highlight-zone double-render: `home.hbs` `{{#get}}` feed filter excludes `newsletter`/`luminous` but **not** `island-of-knowledge`, so IoK episodes appear twice | Foundational — corrects the feed math everything else builds on |
| 2 | [#24](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/24) | Load More Episodes (client-side Content API). In-progress branch `feature/load-more-episodes` adds `load-more.js`, edits `home.hbs` + `screen.css` | The enabler mechanism for #23 and #39 |
| 3 | [#22](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/22) | Content density: split newsletter highlight into latest-newsletter + a 2nd featured box lower down; extend to ~6 episodes | Builds on corrected feed + load-more |
| 4 | [#23](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/23) | Archive-page experiment: 2-wide tag archives + infinite scroll; check perf | Reuses #24's load-more |
| 5 | [#39](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/39) | Consistent item count between highlight zones | Was blocked on Luminous content migration — **unblocks automatically post-deploy** |

## Sprint 5 — Component wiring & membership surfaces

> **Category**: `feature`/`css`/`hbs` · **design-first** · **Order**: last — gated on design mockups and the brand kit's icon-only mark.

- [ ] [#43](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/43) — wire the built `bracket-button` partial + `.wc-bracket-btn` CSS into live templates (`home.hbs`, `cta.hbs`, `list-item.hbs`, `highlight-zone.hbs`, `error.hbs`, `error-404.hbs`). **Coordinate with Luminous Sprint 2.2**, which *hides* bracket ornaments under Luminous — the wiring must stay WC-scoped.
- [ ] [#33](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/33) — paid-membership "patronage, not paywall" surfaces (navbar supporter indicator, post-page support prompt, Portal theming). **Needs design mockups before implementation.**
- [ ] [#41](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/41) **Option B** — *only if the hygiene batch kept the favicons*: wire the app-icon set into `default.hbs`, gated on the brand kit's icon-only mark. (Default assumption: Option A deleted them and this drops.)

## Luminous-arc coordination — *not re-sprinted here*

These open issues overlap the Luminous arc's own deferred list. They belong to that arc; tracked here only so nobody double-plans them.

- [#40](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/40) — residual SVG greens (`#00b86c`, `#4ba250` in `illustration-footer-cabinet-table.svg` / `icon-search.svg`). The CSS side is tokenized; SVG fill tokenization is deferred to **Luminous Sprint 2.2** (`multi-brand-design-system.md` §9, backlog #4).
- [#37](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/37) — Luminous tag-page podcast-button spacing (`series-info.hbs` vs `podcast-services.hbs`); belongs to **Luminous Sprint 2** "template variants."
- [#29](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/29) — `--wc-dark-green` (`#043013`) brand-guide decision. Several consumers were rerouted to `--show-accent-dark` by PR #46 (line numbers in the issue now stale), but the *is-it-on-brand* question is unanswered → fold into **Luminous Sprint 3** (Impeccable audit).

## Numbering & promotion notes

- Sprint numbers **continue the existing line** — the Luminous arc owns 1–3, so these are 4 and 5. Adjust if the arc adds sprints before this lands.
- Per convention, **do not** scaffold `planning/sprints/4-*` / `5-*` until the sprint is promoted to `current` at execution time; `design.md`'s "What shipped" table is written retrospectively.
- The hygiene micro-batch is deliberately **not** a promoted sprint (sub-threshold) — clear it in a maintenance session.
