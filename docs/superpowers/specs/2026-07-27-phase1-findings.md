# Phase 1 Findings — what building the verifier taught us

**Date**: 2026-07-27
**Status**: Complete. Input to the Phase 2 plan.
**Companion to**: `2026-07-26-design-review-harness-design.md` (the spec),
`../plans/2026-07-26-phase1-reference-integrity.md` (the plan)

Phase 1 built `reference-check` and used it to repair the reference rot the spec catalogues. It
worked: the two agents Sprint 2 ran without are dispatchable, and the probe that failed all session
exits 0.

The more useful output is this record. Phase 1 was a controlled experiment in agent-driven
verification, and the numbers are unambiguous enough to change how Phase 2 is built.

---

## 1. The numbers

| | |
|---|---|
| Real defects found | **21** |
| Defects in an *implementation* | **0** |
| Defects in the *plan* | **21** |
| Found by **running** code | **21** |
| Found by **reading** a diff | **0** |
| Implementer agents dispatched | 12 — every one transcribed faithfully |
| Review agents dispatched | 14 — 7 verdicts first try, 3 after a follow-up, **4 silent** |
| Final test count | 85 |

Two of the four silent reviewers were sitting on real defects. **A silent reviewer is
indistinguishable from an approving one unless you count them.**

## 2. The three defects that matter most

Each is the same shape the spec was written about: reporting that something resolved when it had
never been verified.

**A selector resolved because the browser failed.** `resolve_selector` parsed "the first integer in
stdout" as an element count, so a failing `agent-browser` printing `Error 404: no such page`
reported `404 match(es)` and `ok=True`. Six passing tests, none of which exercised a failing
subprocess.

**A version floor cleared by an error message.** `resolve_bin` ignored `--version`'s exit status,
so a binary exiting 1 with `usage: fakebin v9.9.9` on stderr satisfied `>=2.0.0`.

**The summary line lied.** `format_report` counted SKIPPED live checks as resolved and printed
`PASS 2 reference(s) resolved` for two checks that never ran — the one line CI reads. The plan's
own Global Constraints forbid it (*"absence of a check is always stated, never implied"*) while a
Task 5 test assertion mandated it. The plan contradicted itself; the constraint won.

That last one is the Sprint 2 failure in miniature, committed inside the tool built to prevent it.

## 3. The failure mode that recurred five times

**Fixing the instance a reviewer named rather than the shape it belonged to.**

| Guard | Went to | Left missing |
|---|---|---|
| readability (`R_OK`) | agents, skills | `resolve_path`, then the input file itself |
| empty-name rejection | agents, skills | `resolve_path` |
| case-exactness (`_exact_path`) | agents, skills | `resolve_path` |
| subprocess exit status | selector's *count* call | selector's *open* call, `resolve_bin` |
| case-exactness, again | agents, skills, paths, tokens | `resolve_bin` — see §3a |

Five separate occurrences — and I named this failure mode myself after the second one, then
committed it three more times, the last one *while running a purpose-built audit for it*. It is not an attention lapse. It is structural: a reviewer scoped to one
task's diff **cannot** see it, and the author is exactly the person least likely to.

**The fix is a required step, not a good habit:** when a fix lands, build the guard × component
matrix and check every cell. That check found the last three Criticals.

## 3a. The audit exempted the gap it was auditing for

The fifth instance is the one worth dwelling on, because it is a failure of the
*checking tool*, not of attention.

After the fourth recurrence I built a cross-resolver matrix — guard × resolver, every cell — and
ran it. It came back clean, and on that authority I told the user the branch was merge-ready. It
was not. `resolve_bin` was still case-insensitive: `shutil.which` is case-insensitive on this
filesystem and echoes the requested spelling, so `which("GIT")` returns a path that does not exist,
resolving on macOS and dangling on Linux CI.

The matrix could not see it because **I had hardcoded the exemption myself**:

```python
("resolve_bin", "case-exact"): "PATH lookup",   # ← wrong, and written by the author
```

I built a verifier for "same shape, different sibling" and hand-exempted the sibling that had the
shape. Every exemption in that table was a plausible-sounding assumption I wrote while holding the
belief the audit was meant to test.

**A check's assumptions need auditing by someone who did not write them.** The fixture suite catches
a check that is *wrong*. Nothing yet catches a check that is *scoped* wrong — an exemption that
reads as reasonable and silently removes a whole class from coverage. For the theme harness that is
the identical risk to a check written for one brand context quietly not covering the other, which
is exactly what produced the Sprint 2 false pass.

I also adjudicated merge-readiness while a review was outstanding, having spent the whole session
insisting a silent reviewer is not an approving one. The review then arrived with two findings, one
of them the worst defect in the build.

## 3b. The worst defect: a BOM erased every declaration

`check_file` read with `read_text()`. That **swallows a UTF-8 BOM without raising**, so the
unreadable-input guard never fired. `lines[0]` became `"\ufeff---"`, the frontmatter classed as
`"absent"`, and every declared reference silently disappeared:

```
BOM file declaring a nonexistent agent  →  PASS 0 reference(s) resolved   exit 0
identical file without the BOM          →  FAIL 1 unresolved reference(s) exit 1
```

A tool built to prevent silent false passes, producing one, on exit 0, in its own input path. One
line: `encoding="utf-8-sig"`.

## 4. Twice, a fix was wrong in a way only execution revealed

Both on the same six-line function.

The version guard first excluded *hyphenated* dates. Then it excluded a preceding **digit** — which
looked right and was **worse than no guard at all**: in `2024.01.15` the regex scan restarts after
the dot and matches `01.15`, which compares *greater* than a `1.0.0` floor. An absurd `2024.x.x`
became a plausible `1.15` that silently clears realistic floors, and a reviewer reading that diff
would see a date guard and reasonably conclude it worked. Only `(?<![\d.])` closes it.


## 5. What to carry into Phase 2

1. **Execute the plan's own code before dispatching it.** Extracting the ` ```python ` blocks into a
   scratch directory and running pytest caught defects that four read-only review passes missed, and
   twice caught bugs in fixes I had just written. Make it a step in `writing-plans`, not an option.
2. **Name the property to attack in review prompts.** The one genuinely novel finding came from
   handing a reviewer a soundness claim and asking it to break it. It did, first try.
3. **Prefer a differential oracle over inspection.** The strongest review built a ground-truth
   oracle and ran 5,000 randomized trials against it. For the theme harness the oracle is direct:
   computed styles harvested from the browser versus the declared token set. **Frame check G3 as
   differential, not as a spot check.**
4. **Give every check an expected result *and* an explicit obligation to report disagreement.** An
   implementer told "these should all resolve" found three that didn't and reported the
   contradiction instead of assuming failure. A verification step that only knows what success looks
   like will find success.
5. **Regenerate every derived artifact after any spec change.** Task briefs are snapshots; one went
   stale and told an implementer to expect the wrong test count. Same rot class the phase is about,
   manufactured by the process built to fix it.
6. **Count reviews dispatched versus verdicts returned.** Make "no verdict received" an explicit
   failure state.
7. **Have someone else audit the audit's exemptions.** Every "not applicable" in a coverage matrix
   is an assumption. The author is the worst person to validate them — see §3a.
8. **The harness must check itself.** `reference-check`'s own deployment is not covered by
   `reference-check` — see DF-007 below. Phase 2's gate should declare its own dependencies and
   verify them on every run, or it is exempt from the discipline it enforces.

## 6. Open items carried forward

| ID | Item | Disposition |
|---|---|---|
| **DF-002** | 46 of 84 user-scoped skill symlinks point into the lodge working tree; all vanish on a branch checkout that lacks them. Observed live, both directions, in one session. | Open. Being addressed separately on `docs/skill-distribution-rail-decision`. |
| **DF-006** | `urlopen` follows redirects, so a **moved** pinned URL reports resolved. `/tag/luminous/` 301s to `/luminous/` today. | **Required before Phase 2 pins URLs** — that redirect *is* the pin-rot signal. |
| **DF-007** | `~/.local/bin/reference-check` symlinks into the worktree and dangles when it is removed. DF-002's shape, produced by the install step. | **Required merge-day action**: re-point at `the-lodge/scripts/`. |
| — | Empty/contentless frontmatter reports `unparseable` | Accepted. Fails loudly and safe; untested in both directions. |
| — | `resolve_token` conflates "tokens file missing" with "token absent" | Accepted. Fails safe; only the reason is imprecise. |
| — | O(n²) candidate re-parsing | Accepted. Irrelevant at real frontmatter sizes. |
| — | Requiring `rc==0` on `--version` is an environment assumption | Accepted, documented. Every binary here exits 0; elsewhere a needed binary might not, and would report unresolved — loud, not silent. |
| — | Lodge branch carries a merge commit (`72a6679`) | Needs a rebase if lodge `main` enforces linear history. |

## 7. The one-sentence version

The plan was the artifact carrying every defect, nobody was reviewing it, and the only technique
that reliably found anything was running the code — which is the whole argument for Phase 2's
fixture suite, because a check is not trustworthy because a competent person wrote it and another
competent person read it.
