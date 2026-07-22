# Luminous Sprint 2 — Brand Switch Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make any `tag:luminous` page render fully in the Luminous brand (violet + wavy hero + dashed dividers + eye-icon, no cabinet/brackets) via the existing `body.brand-luminous` mechanism, without altering the Wonder Cabinet render path.

**Architecture:** Single-template, body-class driven. `body.brand-luminous` (already wired in `default.hbs:48`) remaps `--show-accent*` to violet; this plan adds the *asymmetric structure* — asset swaps and element hides — scoped under `body.brand-luminous` (CSS) or `{{#has tag="luminous"}}` (template). No per-tag template variants. The deferred `/luminous/` collection reuses `post.hbs`/`tag.hbs`.

**Tech Stack:** Ghost 5.x theme — Handlebars, CSS (`assets/css/screen.css`), gulp build (on CT), gscan validation.

## Global Constraints

- **WC-REGRESSION INVARIANT (the gate on every task):** Every Luminous change is scoped to `body.brand-luminous` (CSS) or `{{#has tag="luminous"}}` (template). The WC / untagged render path emits **identical DOM and identical computed styles** — byte-for-byte unchanged. Never edit a base rule's value; only add `body.brand-luminous`-prefixed overrides. Template changes use `{{#has tag="luminous"}}…{{else}}<current markup, unmodified>…{{/has}}`.
- **Dev loop:** edit on the Mac → mutagen syncs to CT `ghost01` → `ghost-theme-watch` (gulp) rebuilds `assets/built/` and syncs it back → verify at `https://wondercabinet.riechers.co`. **Never run gulp/Ghost locally.** For any CSS task, wait ~3s for the rebuilt `assets/built/screen.css` to sync back, then commit source **and** built together.
- **`assets/built/` is committed** — Ghost serves from it. Never hand-edit it.
- **gscan gates the PR** in CI. Keep it green.
- **Minimal asset reorg:** add `assets/images/luminous/` only; do not move existing WC assets.
- **Out of scope:** `post-luminous.hbs` (dropped — YAGNI); navbar brand adoption (deferred); live `routes.yaml`/redirect cutover (deferred); wordmark wiring (no reachable surface — nav deferred; asset copied only); cover art (Ghost Admin config lane).
- **QA target:** `/tag/luminous/` is populated (19 published episodes, paginating) and `/tag/luminous/reclaiming-the-acid-queen/` is a live Luminous post. WC baseline pages: the home page `/` and any WC post.

### Verification model (theme, not unit-tested)

There is no unit-test harness for `.hbs`/CSS. Each task's "test" is:
- **DOM diff** (catches template regressions): `curl -s <url>` before/after, `diff` — WC pages must be identical.
- **Visual/computed-style check** (catches CSS regressions): the live preview; use chrome-devtools MCP screenshots/computed-styles on the WC baseline + the Luminous target.
- **gscan** at the end.

---

### Task 1: Migrate Luminous brand assets (2.1 / S2-01)

**Files:**
- Create: `assets/images/luminous/bg-wavy.svg`, `assets/images/luminous/divider-dashed.svg`, `assets/images/luminous/wordmark.svg`, `assets/images/luminous/eye-icon.png`, `assets/images/luminous/eye-icon-violet.png`
- Source (metarepo, gitignored): `../../../design-assets/site-design/Luminous-Brand-Web-Podcast/`

**Interfaces:**
- Produces: the five asset paths above, referenced by Tasks 2–4 as `{{asset "images/luminous/<name>"}}` (templates) and `url(../images/luminous/<name>)` (CSS).

- [ ] **Step 1: Copy + normalize the Art & Sons exports**

```bash
cd /Users/mriechers/Developer/wonder-cabinet/ghost-dev/content/themes/wonder-cabinet-episode
SRC=../../../design-assets/site-design/Luminous-Brand-Web-Podcast
mkdir -p assets/images/luminous
cp "$SRC/WebsiteGraphics/LuminousWeb_WebsiteBackground.svg" assets/images/luminous/bg-wavy.svg
cp "$SRC/WebsiteGraphics/LuminousWeb_LineSeparator.svg"      assets/images/luminous/divider-dashed.svg
cp "$SRC/WebsiteGraphics/LuminousWeb_Website-Wordmark.svg"   assets/images/luminous/wordmark.svg
cp "$SRC/LogoAssets/Luminous-_EyeIconBlack-800x800.png"      assets/images/luminous/eye-icon.png
cp "$SRC/LogoAssets/Luminous-_EyeIconViolet-800x800.png"     assets/images/luminous/eye-icon-violet.png
```

- [ ] **Step 2: Verify all five landed and existing assets are untouched**

Run: `ls -1 assets/images/luminous/ && git status --porcelain assets/images/ | grep -v '^?? assets/images/luminous/' | grep -c '^ M\|^ D' `
Expected: the five files listed; the second count is `0` (no existing image modified or deleted).

- [ ] **Step 3: Sanity-check the SVGs are real vector, not HTML-error pages**

Run: `head -c 120 assets/images/luminous/bg-wavy.svg; echo; head -c 120 assets/images/luminous/divider-dashed.svg`
Expected: both begin with `<?xml` or `<svg` (not `<!DOCTYPE html>`).

- [ ] **Step 4: Commit**

```bash
git add assets/images/luminous/
git commit -m "feat(luminous): add Luminous brand assets (wavy bg, dashed separator, wordmark, eye-icon) — Sprint 2.1"
```

---

### Task 2: Swap tag-hero background to wavy SVG under Luminous (2.2 / S2-02)

**Files:**
- Modify: `partials/components/tag-header.hbs:8-10`
- Modify: `assets/css/screen.css` (append a `body.brand-luminous` block near the tag-hero rules ~line 2141)

**Interfaces:**
- Consumes: `assets/images/luminous/bg-wavy.svg` (Task 1).

- [ ] **Step 1: Capture the WC baseline for the tag hero (regression guard)**

Run: `curl -s -L https://wondercabinet.riechers.co/tag/newsletter/ > /tmp/wc-tag-before.html; wc -l /tmp/wc-tag-before.html`
(Any existing WC tag works; `newsletter` is a WC tag. Note the count.)

- [ ] **Step 2: Confirm the Luminous hero is currently WRONG (still galaxy)**

Run: `curl -s -L https://wondercabinet.riechers.co/tag/luminous/ | grep -o 'wc-tag-hero-galaxy[^>]*' | head -1`
Expected: matches the current galaxy `<img>` (i.e., the wavy swap is not yet present).

- [ ] **Step 3: Add the template guard in `tag-header.hbs`**

Replace lines 8–10:

```hbs
    <div class="wc-tag-hero-bg">
        <img src="{{@custom.galaxy_background_image}}" alt="" class="wc-tag-hero-galaxy" aria-hidden="true">
    </div>
```

with:

```hbs
    <div class="wc-tag-hero-bg">
        {{#has tag="luminous"}}
            <img src="{{asset "images/luminous/bg-wavy.svg"}}" alt="" class="wc-tag-hero-galaxy wc-tag-hero-galaxy--luminous" aria-hidden="true">
        {{else}}
            <img src="{{@custom.galaxy_background_image}}" alt="" class="wc-tag-hero-galaxy" aria-hidden="true">
        {{/has}}
    </div>
```

- [ ] **Step 4: Add the Luminous hero CSS override**

Append to `assets/css/screen.css` (after the `.wc-tag-hero-galaxy` block, ~line 2141):

```css
/* Luminous: wavy organic hero replaces the galaxy raster (§6 asymmetric) */
body.brand-luminous .wc-tag-hero-galaxy--luminous {
    max-width: 900px;
    opacity: 0.85;
}
```

- [ ] **Step 5: Verify Luminous hero is now wavy, WC tag unchanged**

Wait ~3s for the built CSS to sync, then:
Run: `curl -s -L https://wondercabinet.riechers.co/tag/luminous/ | grep -o 'images/luminous/bg-wavy.svg'`
Expected: one match (wavy SVG now in the Luminous hero).
Run: `curl -s -L https://wondercabinet.riechers.co/tag/newsletter/ > /tmp/wc-tag-after.html; diff /tmp/wc-tag-before.html /tmp/wc-tag-after.html && echo "WC TAG UNCHANGED"`
Expected: `WC TAG UNCHANGED` (no diff).

- [ ] **Step 6: Commit (source + rebuilt built/)**

```bash
git add partials/components/tag-header.hbs assets/css/screen.css assets/built/screen.css assets/built/screen.css.map
git commit -m "feat(luminous): wavy hero background on tag:luminous pages — Sprint 2.2"
```

---

### Task 3: Hide cabinet + flatten brackets under Luminous (2.2 / S2-02)

**Files:**
- Modify: `assets/css/screen.css` (append `body.brand-luminous` overrides for `.wc-footer-*` ~line 1200 and `.wc-bracket-btn*` ~line 180)

**Interfaces:**
- Consumes: nothing new. Pure CSS scoped to `body.brand-luminous`; `footer.hbs` DOM is left untouched (strongest WC-safety).

- [ ] **Step 1: Capture WC footer baseline (screenshot via preview)**

Use chrome-devtools MCP: navigate to `https://wondercabinet.riechers.co/` and screenshot the footer region. Save as the WC-footer reference.

- [ ] **Step 2: Add the Luminous footer + bracket overrides**

Append to `assets/css/screen.css`:

```css
/* Luminous: cabinet illustration is WC-only vocabulary — hide it and let the
   footer nav/copyright fall into normal flow (§6 asymmetric) */
body.brand-luminous .wc-footer-cabinet {
    display: none;
}
body.brand-luminous .wc-footer-illustration {
    width: auto;
}
body.brand-luminous .wc-footer-overlay {
    position: static;
    transform: none;
    top: auto;
    left: auto;
    padding: var(--wc-spacing-xl) 0;
}

/* Luminous CTAs are a flat violet button, no bracket corners (§6 asymmetric) */
body.brand-luminous .wc-bracket-btn-corner {
    display: none;
}
body.brand-luminous .wc-bracket-btn {
    background: var(--show-accent);
    color: var(--wc-black); /* black on #9A59FF ≈ 5.25:1 (AA) */
    border-radius: 4px;
    padding: 14px 32px;
}
```

- [ ] **Step 3: Verify Luminous footer has no cabinet + nav/copyright render; WC footer identical**

Wait ~3s. Use chrome-devtools MCP:
- Navigate to `https://wondercabinet.riechers.co/tag/luminous/`, screenshot the footer → expect **no cabinet illustration**, and the footer nav + "Wonder Cabinet Productions ©" copyright still visible in normal flow.
- Navigate to `https://wondercabinet.riechers.co/`, screenshot the footer → expect **pixel-identical to the Step 1 reference** (cabinet present, overlay positioned as before).

- [ ] **Step 4: Commit**

```bash
git add assets/css/screen.css assets/built/screen.css assets/built/screen.css.map
git commit -m "feat(luminous): hide cabinet + flatten bracket CTAs under brand-luminous — Sprint 2.2"
```

---

### Task 4: Dashed divider + eye-icon favicon under Luminous (2.2 / S2-02)

**Files:**
- Modify: `assets/css/screen.css` (append `body.brand-luminous .wc-rule` override ~line 2426)
- Modify: `default.hbs:45` (add a conditional favicon `<link>` after `{{ghost_head}}`)

**Interfaces:**
- Consumes: `assets/images/luminous/eye-icon.png` (Task 1).

- [ ] **Step 1: Add the dashed-divider override**

Append to `assets/css/screen.css`:

```css
/* Luminous: dashed line separator replaces the solid rule (§6 asymmetric) */
body.brand-luminous .wc-rule {
    height: 0;
    background: none;
    border-top: 2px dashed var(--show-accent);
}
body.brand-luminous .wc-rule--thick {
    border-top-width: 3px;
}
```

- [ ] **Step 2: Add the conditional favicon in `default.hbs`**

Change line 45 from:

```hbs
    {{ghost_head}}
</head>
```

to:

```hbs
    {{ghost_head}}
    {{#has tag="luminous"}}
    <link rel="icon" type="image/png" href="{{asset "images/luminous/eye-icon.png"}}">
    {{/has}}
</head>
```

- [ ] **Step 3: Verify — Luminous divider dashed, favicon link present on Luminous only**

Wait ~3s.
Run: `curl -s -L https://wondercabinet.riechers.co/tag/luminous/ | grep -c 'images/luminous/eye-icon.png'`
Expected: `1`.
Run: `curl -s -L https://wondercabinet.riechers.co/ | grep -c 'images/luminous/eye-icon.png'`
Expected: `0` (WC head has no Luminous favicon link → `{{ghost_head}}`/`/favicon.ico` behavior unchanged).
Visual (chrome-devtools MCP): `/tag/luminous/` dividers render dashed. **Note:** browsers cache favicons per-origin, so the tab icon swap is best-effort — the `<link>` correctness (present/absent) is the real acceptance check here.

- [ ] **Step 4: Commit**

```bash
git add default.hbs assets/css/screen.css assets/built/screen.css assets/built/screen.css.map
git commit -m "feat(luminous): dashed dividers + eye-icon favicon under brand-luminous — Sprint 2.2"
```

---

### Task 5: Fix index-luminous pagination + author routes mirror (2.3 / S2-04, S2-05)

**Files:**
- Modify: `index-luminous.hbs:46` (remove `count="all"`)
- Create: `docs/routes-luminous.reference.yaml`

**Interfaces:**
- Consumes: nothing. `index-luminous.hbs` is dormant until the deferred collection routes to it; this makes it correct-when-activated.

- [ ] **Step 1: Remove the `count="all"` pagination gotcha**

In `index-luminous.hbs` change line 46 from:

```hbs
            {{> "components/list" layout="simple" count="all" showExcerpt=true showPublishedAt=true hasPagination=true}}
```

to:

```hbs
            {{> "components/list" layout="simple" showExcerpt=true showPublishedAt=true hasPagination=true}}
```

- [ ] **Step 2: Author the routes mirror (documented intent — NOT applied live)**

Create `docs/routes-luminous.reference.yaml`:

```yaml
# MIRROR ONLY — documented intent, not the live file.
# The live routes.yaml lives on LXC ghost01 at content/settings/routes.yaml and is
# uploaded via Ghost Admin (Labs). Applying this is the DEFERRED, human-gated cutover
# (workplan gates #3/#4): it reassigns Luminous canonical URLs to /luminous/{slug}/ and
# needs the redirect/canonical strategy (see docs/luminous/wpr-redirect-handoff.md, and
# note WPR broke the ttbook canonicals — revisit before cutover).

collections:
  /luminous/:
    permalink: /luminous/{slug}/
    filter: tag:luminous
    template: index-luminous     # archive; episode pages fall through to post.hbs
    order: published_at desc

# The default collection must then EXCLUDE tag:luminous so those posts live only under
# /luminous/ (mirrors how home.hbs already filters them out):
#   /:
#     permalink: /{slug}/
#     filter: tag:-luminous
```

- [ ] **Step 3: Verify gscan is still green + YAML parses**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('docs/routes-luminous.reference.yaml')); print('YAML OK')"`
Expected: `YAML OK`.
Run gscan against the theme (CI will also gate this): confirm no new errors from the `index-luminous.hbs` edit.

- [ ] **Step 4: Commit**

```bash
git add index-luminous.hbs docs/routes-luminous.reference.yaml
git commit -m "fix(luminous): index-luminous route pagination (drop count=all) + routes mirror — Sprint 2.3"
```

---

### Task 6: Cross-brand QA + WC pixel-stability proof (2.4 / S2-06)

**Files:** none (verification + final commit of any pending built output).

**Interfaces:** Consumes all prior tasks. This is the acceptance gate.

- [ ] **Step 1: WC pixel-stability proof (PRIMARY GATE)**

Use chrome-devtools MCP. For the WC home `/` and one WC post:
- Screenshot each; compare against how they looked before this task series (or against `main`/a WC page known-good). Expect **no visual difference** — same green, galaxy hero, cabinet footer, solid rules, bracket CTAs.
- DOM diff: `curl -s -L https://wondercabinet.riechers.co/ > /tmp/wc-home-after.html` and compare structure to a pre-change capture — expect no diff attributable to this work.

- [ ] **Step 2: Luminous render verification**

chrome-devtools MCP on `/tag/luminous/` and `/tag/luminous/reclaiming-the-acid-queen/`:
- violet accent (links, buttons, rules), wavy hero background, dashed dividers, **no** cabinet illustration in the footer, flat (corner-less) CTAs, eye-icon `<link>` present in head.
- pagination works: `/tag/luminous/page/2/` → HTTP 200 with more episodes.

- [ ] **Step 3: gscan**

Run gscan on the theme (or confirm the PR's `Validate Theme` check is green). Expected: no errors.

- [ ] **Step 4: Confirm built output is committed and push**

Run: `git status --porcelain` → expect clean (all `assets/built/` changes from Tasks 2–4 already committed with their source).
Run: `git push` and confirm PR #53 updated. (Do NOT merge — the stack is held for the combined, gated deploy.)

- [ ] **Step 5: Update the sprint tracker**

Mark S2-01…S2-06 `status: "done"` in `planning/sprints/2-brand-switch/features.json`, commit:

```bash
git add planning/sprints/2-brand-switch/features.json
git commit -m "chore(luminous): mark Sprint 2 theme-code features done — Sprint 2.4"
git push
```

---

## Self-Review

**Spec coverage** (design.md → task):
- 2.1 minimal assets → Task 1 ✓
- 2.2 asymmetric (hero, cabinet, brackets, divider, favicon) → Tasks 2, 3, 4 ✓
- 2.3 index pagination fix + routes mirror → Task 5 ✓
- 2.4 QA + WC-stability proof → Task 6 ✓
- WC-regression invariant → Global Constraints + a per-task WC check in Tasks 2, 3, 4, 6 ✓
- Deferred items (post-luminous.hbs, nav, cover, routes cutover, wordmark wiring) → Global Constraints "out of scope" ✓

**Placeholder scan:** No TBD/TODO; every code step shows exact edits. The only best-effort caveat (per-page favicon caching) is stated explicitly with the real acceptance check (link present/absent), not left vague.

**Type/name consistency:** Asset paths (`images/luminous/bg-wavy.svg`, `divider-dashed.svg`, `eye-icon.png`) are used identically in Task 1 (create) and Tasks 2/4 (reference). CSS class `wc-tag-hero-galaxy--luminous` introduced in Task 2 template and styled in Task 2 CSS. `body.brand-luminous` (existing, `screen.css:61`) is the sole CSS scope prefix throughout.
