# Branching, PRs, and promotion to production

Canonical contract for how work moves from a branch to the live site. Read this before opening a
PR or planning a sprint.

Related: `CLAUDE.md` / `AGENTS.md` (the dev loop), `planning/TRIAGE.md` (issue intake and
severity routing), `docs/DEVELOPMENT_WORKFLOW.md` (stale — generic Ghost theming reference only).

---

## The three tiers

```
main                          production
 │                            push → deploy-theme.yml → https://wondercabinetproductions.com
 │                            protected: PR required · linear history · Validate Theme + Base Branch Guard
 │                            merge method: REBASE (from a dev branch) or SQUASH (hotfix/plumbing)
 │
 └── dev/<series>             sprint-series integration
      │                       the QA target on https://wondercabinet.riechers.co
      │                       protected: PR required · linear history · Validate Theme (strict)
      │                       merge method: SQUASH only — one commit per sprint PR
      │
      ├── sprint/1-<name>
      ├── sprint/2-<name>
      └── sprint/3-<name>

hotfix/*                  →  main directly   (S1 only — see planning/TRIAGE.md)
chore/* docs/* ci/*       →  main directly   (repo plumbing, no theme source)
```

**Why the middle tier exists.** A multi-sprint arc ships as one production deploy. Without an
integration branch, sprint branches stack on each other: every merge forces a manual restack, no
single branch ever represents "everything this series will ship", and the sprint-1 PR sits one
click away from deploying half a series. The dev branch is the thing you QA and the thing you
promote.

---

## Naming

| Pattern | Purpose | Base | Lifetime |
|---|---|---|---|
| `dev/<series>` | Sprint-series integration (e.g. `dev/luminous`) | `main` | One series; deleted after rollup |
| `sprint/N-<name>` | One sprint's work (e.g. `sprint/2-brand-switch`) | active `dev/<series>` | One sprint |
| `hotfix/<desc>` | S1 critical fix | `main` | Hours |
| `chore/`, `docs/`, `ci/`, `fix/` | Repo plumbing, standalone fixes | `main` | Short |

The `dev/**` glob is what CI and the branch-protection ruleset key on. A branch named
`dev-something` (no slash) gets **neither** protection nor gscan — use the slash.

---

## Which base branch?

**Sprint work targets `dev/<series>`. Never `main`.** This is enforced by the **Base Branch
Guard** check, which is required on `main`. Its decision order:

| # | Condition | Result |
|---|---|---|
| 1 | PR has the `base-guard-override` label | **pass** |
| 2 | head is `dev/**` or `hotfix/*` | **pass** — series rollup or hotfix |
| 3 | head is `sprint/*` | **fail** |
| 4 | PR changes `assets/`, `partials/`, or any `*.hbs` | **fail** — that's a partial series |
| 5 | otherwise | **pass** — repo plumbing |

Rule 4 exists because **branch naming is not a reliable signal.** Agent worktrees produce names
like `name-change` or `worktree/brave-cloud-8ac8` that no pattern anticipates, and a `sprint/*`
deny-list alone would wave them straight into production. What actually separates sprint work
from plumbing is whether it carries theme source: plumbing (docs, planning, CI) never does, a
partial series always does.

The error message names the fix (`gh pr edit <n> --base dev/<series>`). If you genuinely need the
exception, add the `base-guard-override` label and re-trigger — note that a *re-run* replays the
original event payload and won't see the new label, so push a commit or reopen the PR instead.

`main` accepts exactly three things: a series rollup from `dev/<series>`, an S1 hotfix, and repo
plumbing that touches no theme source.

---

## Merge methods, and why

`main` requires linear history, so merge commits are rejected there outright.

- **sprint → dev: squash.** Each sprint PR becomes one commit on the dev branch. The dev branch
  stays linear and readable as a list of sprints.
- **dev → main: rebase.** Replays those per-sprint commits onto `main`, so production history
  keeps one line per sprint instead of collapsing a whole arc into a single opaque commit. This
  matches `main`'s existing style — every commit there is one squashed PR.
- **hotfix / plumbing → main: squash.**

The dev-branch ruleset only offers *Squash and merge*; `main` offers squash and rebase.

---

## CI gates

| Check | Runs on | Required by |
|---|---|---|
| `Validate Theme` (gscan) | PRs into `main` and `dev/**` | both rulesets |
| `Base Branch Guard` | PRs into `main` | `main` ruleset |
| `claude-review` | every PR, any base | advisory |

`Validate Theme` is **strict** on `dev/**`: a sprint branch must be up to date with the dev tip
before it can merge. That is deliberate. `assets/built/` is committed, so a stale branch can
combine into a state neither branch ever validated. Strict mode forces the restack that makes
the gscan run reflect reality.

---

## Sprint-series lifecycle

1. **Open the series.** At sprint planning, branch `dev/<series>` off `main` and push it. The
   ruleset picks it up automatically via the `dev/**` glob — nothing to configure per series.
2. **Iterate.** Each sprint branches off the current `dev/<series>` tip, and its PR targets
   `dev/<series>`. Squash-merge when gscan is green and the sprint gate in the spec is met.
3. **Restack siblings** after every merge (see below).
4. **QA the whole series** once the last sprint lands — park the dev instance on the dev branch
   (see below) and work `docs/luminous/cross-brand-qa-checklist.md`.
5. **Roll up.** Open `dev/<series>` → `main`. This PR is the final human gate: merging it
   deploys to production. Rebase-merge.
6. **Retire.** Delete `dev/<series>` and its sprint branches.

---

## Restacking after a merge

Squash-merging a sprint into the dev branch replaces that sprint's individual commits with one
new commit. A sibling branch built on the old commits must be replayed with `--onto`, cutting at
the merged branch's **pre-merge** tip — so capture that SHA *before* merging:

```bash
PREV=$(git rev-parse origin/sprint/2-brand-switch)   # BEFORE merging its PR
# ...merge the PR...
git fetch origin
git rebase --onto origin/dev/<series> "$PREV" sprint/3-impeccable-ux
git push --force-with-lease origin sprint/3-impeccable-ux
```

If the sibling branched from an *older* point than the merged tip (so that tip is not its
ancestor), `--onto` is wrong — cherry-pick its unique commits onto a fresh branch off the dev tip
instead.

**`assets/built/` will conflict in almost every restack.** Resolve by taking the replayed
commit's version and moving on; then let the CT regenerate from source in the primary worktree
and commit the true rebuild if it differs. Never hand-resolve built CSS.

---

## QA on the dev instance

Only the primary worktree
`~/Developer/wonder-cabinet/ghost-dev/content/themes/wonder-cabinet-episode` is mutagen-synced
(the `wc-theme` session). `.herdr` worktrees are **not**. So
https://wondercabinet.riechers.co renders whatever is checked out in the primary worktree —
**including uncommitted edits**. The preview reflects a working tree, not a commit.

Entering QA mode:

1. `git status` in the primary worktree — the tree must be **clean**, or uncommitted work is
   silently included in what you sign off on. Commit or stash first.
2. `git switch dev/<series> && git pull`
3. Wait ~2 s for mutagen + `ghost-theme-watch.service` (gulp) to rebuild `assets/built/`.
4. Verify at https://wondercabinet.riechers.co. Work `docs/luminous/cross-brand-qa-checklist.md`
   across both brand contexts. Read brand vars from `document.body`, **not**
   `document.documentElement` — Sprint 2 moved brand context to a body class, so querying
   `:root` returns WC green even on a correctly-branded Luminous page.
5. `routes.yaml`/config changes additionally need
   `ssh wc-ghostdev 'sudo systemctl restart ghost-dev'`.

Exit QA mode by switching the primary worktree back to the active sprint branch.

Two things that bite:

- Gulp rebuilds `assets/built/` on the CT and syncs the result back, which can dirty the tree on
  checkout. `git checkout -- assets/built` before switching branches, or commit the rebuild if
  it is a real change.
- While the primary worktree is parked on `dev/<series>`, feature work in `.herdr` worktrees is
  **invisible** to the dev instance — those directories are not synced. Push it and land it in
  the dev branch to see it live.

### Confirm the `wc-theme-qa` skill loaded before recording the gate

`CLAUDE.md` points agents at the `wc-theme-qa` skill before merging anything touching shared CSS,
`partials/components/`, `audio-player.js`, or `--show-accent`. It automates the mechanizable
parts of `docs/luminous/cross-brand-qa-checklist.md` and reports what it did not cover.

`~/.claude/skills/wc-theme-qa` is a **symlink into the `the-lodge` checkout**, so it can fail to
resolve for reasons nothing in this repo will signal. Confirm it before relying on it:

```bash
ls ~/.claude/skills/wc-theme-qa/SKILL.md   # exists → it will load
```

If it doesn't load, work the checklist by hand. Either way the checklist is the gate and the
skill automates it — and **do not record the gate as satisfied unless checks actually ran.** A
skill that failed to load is not a pass.

---

## Hotfixes

Unchanged, and still legal: S1 critical issues branch `hotfix/<desc>` from `main` and merge back
to `main`, deploying immediately. Full process in `planning/TRIAGE.md` § S1 Hotfix Process.

After a hotfix lands, merge `main` into the active `dev/<series>` so the series does not
regress it on rollup.
