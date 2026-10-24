<!--
  Impeccable critique of the per-show About modal (#124), saved for the follow-up
  re-run in #129. Provenance:
  - Run 2026-10-14 in the governed `impeccable` deployment (skill-ops, skill-v4.3.1),
    which had NO network access: it worked from 12 staging screenshots captured at
    `sprint/show-about-modal` @ b09a87da plus read-only theme source.
  - PROVISIONAL: findings marked "inferred" were not observed, and hover/focus/motion
    were never checked. #129 re-runs this live once skill-ops#322 lands.
  - Verbatim engine/agent output below; line numbers refer to b09a87da.
-->

# Critique: per-show About modal (#124)

Method: dual-agent (A: design review · B: detector scan).

Evidence: the 12 staging screenshots at `b09a87da`, the theme source and the brand guides.

- **Detector:** `impeccable detect --json` on `show-about.hbs`, `custom-show-about.hbs`, `podcast-services.hbs` and `index-luminous.hbs` found nothing (exit 0). That counts for little, because the scanner can't see what the Handlebars helpers render.
- **Browser overlay:** skipped. Live mode was dropped in the evaluation, and staging isn't reachable from this session.
- **Spot-checks:** I checked P1 #1 against `screen.css` and `wc-mobile-modal-scrolled.png` myself.

**Overall:** The modal looks right for both brands, but once you scroll it's hard to get out of. The close button and the title scroll away with the text, and on a phone there's no Esc key to fall back on.

## Score: 17/28 (61%), Acceptable

Heuristics 7, 9 and 10 were scored n/a.

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | No sign the panel scrolls; title gone once you do |
| 2 | Match with the real world | 3 | A lone "i" on mobile is ambiguous |
| 3 | User control and freedom | 2 | Close disappears on scroll; backdrop click and Esc do work |
| 4 | Consistency and standards | 2 | Button cards differ between modal and page; WC and Luminous content structured differently |
| 5 | Error prevention | 3 | Modified clicks still open the page normally (`main.js:20`) |
| 6 | Recognition over recall | 2 | After scrolling, nothing says which show this is |
| 7 | Flexibility | n/a | Single-purpose reading surface |
| 8 | Aesthetic and minimalist | 3 | Clean panel, but the Luminous copy is a wall of text |
| 9 | Error recovery | n/a | No error states |
| 10 | Help | n/a | The modal is itself help content |

## What's working

1. **Progressive enhancement is real.** The trigger is an `<a href>`, the template page doubles as the no-JS fallback, and modified clicks pass straight through.
2. **Branding runs on tokens alone** (`--show-accent*`). Link contrast clears AA in both brands (green about 5.4:1, violet about 4.6:1 on cream).
3. **The dialog is native.** It's a `<dialog>` with `aria-labelledby` and `aria-haspopup`, and focus explicitly returns to the trigger on close (`main.js:35`).

## Priority issues

**[P1] The close button and title scroll out of view**
- **What:** `.wc-about-close` is `position:absolute` (`screen.css:3920`), and the `<dialog>` itself is what scrolls.
- **Why it matters:** on a phone, the only ways out at the end of the text are scrolling all the way back up or hitting a thin strip of backdrop.
- **Fix:** put the title and Close in a sticky cream header.
- **Command:** layout

**[P1] Content structure differs between brands, and the WC page has none**
- **What:**
  - On WC, "Steve Paulson" is a bold paragraph, not a heading.
  - A stray "Steve" caption sits under his photo.
  - The page ends with a plain link.
  - Luminous, by contrast, uses an H2 and a button card.
- **Fix:** editorial work in Ghost Admin (section H2s, remove the caption, end with a button card), plus a short authoring note in the header comment of `show-about.hbs`.
- **Command:** clarify

**[P2] Opening the modal puts focus on Close**
- **What:** `showModal()` focuses the first focusable element, and Close comes before the `<h2>` in the markup.
- **Fix:** add `tabindex="-1" autofocus` to the title, or move Close after the `<h2>`.
- **Command:** harden

**[P2] Mobile viewport height and scroll chaining (inferred, not observed)**
- **What:** the panel uses `max-height: calc(100vh - …)` (`screen.css:3898`) and sets no `overscroll-behavior`.
- **Fix:** switch to `100dvh` and add `overscroll-behavior: contain`, then check on a real iPhone.
- **Command:** adapt

**[P3] Straight quotes in the title**
- "WHAT IS 'WONDER CABINET'?" uses straight quotes; fix them in the Ghost page title.

## Open questions from the brief

**a. Discoverability.** Keep the trigger, and make nav "About" open the modal instead of removing it.
- On mobile, a lone "i" next to the listen icons reads as "info about these services".
- `main.js` can upgrade any link to the Show About page into the modal trigger, and the page remains the fallback.

**b. Button cards sitewide.** Yes, as a separate issue.
- Move the rule at `screen.css:3971-3983` up to `.gh-content .kg-button-card .kg-btn` and delete the modal-scoped copy.

**c. 720px panel with internal scroll.** The format is right, but it needs three things:
- the sticky header from P1;
- a fade or "continue" cue at the bottom;
- an editorial trim of the Luminous intro (eight rhetorical questions in a row).

If the text stays at 1,000+ words, consider making the page the main destination and the modal a summary.

**d. 2×2 block versus a single row.** The 2×2 reads as balanced.
- About looks like a fourth listening platform.
- Lighten it slightly in the 2×2 only, for example the show name at 0.8 opacity.

## Personas

- **Jordan (first-timer):** the mobile "i" is ambiguous, and once scrolled there's no title.
- **Sam (keyboard/screen reader):** hears "Close" first and finds no H2s on WC.
- **Casey (mobile, one hand):** can't reach a close button after scrolling, and the X sits top-right.

## Minor observations

- A text selection that's released over the backdrop could close the dialog (inferred). Fix: also check the `mousedown` target.
- If an opening animation gets added later, put it behind `prefers-reduced-motion`.

## Mark's answers and the action plan

Mark chose code first, then content; nav About in this PR; and the full scope.

1. **layout:**
   - in `show-about.hbs`, a sticky title/Close header, with Close after the `<h2>` in the markup;
   - in `screen.css`, a fade at the bottom of the panel to show there's more to scroll.
2. **harden:** in `main.js`:
   - focus the title when the modal opens;
   - add a `mousedown` guard so a text drag ending on the backdrop doesn't close the dialog;
   - make any link to the Show About page open the modal, so nav "About" uses it too.
3. **adapt:** in `screen.css`, `100dvh` and `overscroll-behavior: contain`.
4. **layout:** make the About trigger slightly lighter than the listen links in the 2×2.
5. **clarify:** an authoring convention in the header comment of `show-about.hbs`. Mark applies it to the WC page and fixes the curly quotes in Ghost Admin.
6. **Separate issue:** apply the brand button style sitewide (question b).
7. **polish:** final pass, then re-run the critique.
