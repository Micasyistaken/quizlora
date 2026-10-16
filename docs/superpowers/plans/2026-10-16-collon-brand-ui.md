# Collon Brand UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Quizlora visual identity with the approved Collon brand across the existing static SPA without changing product content or behavior.

**Architecture:** Keep the current `dist/index.html` router and data model. Add self-hosted SVG/font assets and a focused Collon style layer; remove or update conflicting brand rules in the existing stylesheet. Change the global shell first, then page families, and verify every family in both themes before release.

**Tech Stack:** Static HTML/CSS/vanilla JavaScript, SVG, self-hosted Manrope WOFF2, Node `node:test`, existing Vercel static deployment.

**Spec:** `docs/superpowers/specs/2026-10-16-collon-rebrand-design.md`

## Global Constraints

- The visible product name is “collon” in the logo/brand lockup and “Collon” in ordinary prose; retain technical IDs and hash routes for compatibility.
- Light roles: page `#F7F7F4`, surface `#FFFFFF`, soft `#EEEEEB`, primary text/action `#111112`, secondary text `#5D5D5C`, hairline `#DADAD6`.
- Dark roles: page `#101011`, surface `#1A1A1C`, soft `#252527`, primary text/action `#F5F5F2`, secondary text `#B6B6B2`, hairline `#3A3A3D`.
- Preserve category hierarchy, quiz/question data, rules, profile functions, navigation destinations, existing purposeful animation mechanics and `prefers-reduced-motion`.
- Do not alter bot provenance/validation logic, remove quiz modes, migrate frameworks or add marketing-only motion to app screens.
- User-owned uncommitted files in the workspace must not be reset, overwritten wholesale or accidentally included in a commit.

## Review Focus

1. A category name or quiz title longer than one line must wrap without truncating the primary action; Task 3 tests the long-label layout.
2. A light/dark switch while a quiz is active must not reset question state; Task 4 tests route and progress persistence.
3. Keyboard-only and touch users must still reach navigation, cards and controls; Task 2 tests focus and target sizes.
4. Reduced-motion users must not receive fan/tilt/magnetic/theme motion; Task 4 tests the preference.
5. Empty fixed-quiz categories must not show a fake quiz or dead primary button; Task 3 tests the honest empty state.

---

## File structure

- `dist/assets/collon-mark.svg`, `dist/assets/collon-wordmark.svg`: black-on-transparent scalable artwork used as CSS masks with `currentColor`; no raster logo dependency.
- `dist/assets/fonts/manrope-*.woff2`, `dist/assets/fonts/OFL.txt`: self-hosted licensed UI font and license.
- `dist/assets/collon.css`: semantic token definitions and brand component/page presentation, loaded after the current inline stylesheet while obsolete conflicting rules are removed or adapted in `dist/index.html`.
- `dist/index.html`: metadata, shell and user-facing brand strings; existing router, UI markup and state logic remain.
- `test/collon-brand.test.js`, `test/collon-routes.test.js`: static/behavioral guardrails, using existing `node:test` conventions.
- `PRODUCT.md`, `DESIGN.md`, `README.md`, `ATTRIBUTIONS.md`: updated identity, source and run context without changing product claims or bot rules.

### Task 1: Brand assets, type and semantic foundation

**Files:** Create the SVGs, font assets/license, `dist/assets/collon.css`, `test/collon-brand.test.js`; modify `dist/index.html` metadata/style link and `ATTRIBUTIONS.md`.

**Interfaces:** Produces CSS custom properties `--brand-page`, `--brand-surface`, `--brand-soft`, `--brand-text`, `--brand-muted`, `--brand-line`, `--brand-action`, `--brand-action-text`, plus SVG files loaded by URL and UI font family `Collon UI`.

- [ ] **Step 1: Write failing brand-foundation tests.** Assert the document title, description, favicon and stylesheet use Collon; both SVGs are parseable with `viewBox` and no embedded bitmap; local font and OFL license exist; light/dark tokens equal the six exact values in Global Constraints.
- [ ] **Step 2: Run `node --test test/collon-brand.test.js`.** Expected: failures for missing assets/tokens and old Quizlora metadata.
- [ ] **Step 3: Implement the assets and semantic tokens.** Reconstruct the supplied split-stem logo as SVG, self-host the licensed Manrope font, set typographic scale and map existing component variables to the new semantic roles while keeping semantic success/error/reward states.
- [ ] **Step 4: Run `node --test test/collon-brand.test.js && npm run validate`.** Expected: both pass; no missing asset or script syntax error.
- [ ] **Step 5: Commit only the files in this task.** Confirm `git diff --cached --name-only` contains no unrelated user files before commit.

### Task 2: Global shell, theme and navigation

**Files:** Modify `dist/index.html`, `dist/assets/collon.css`; extend `test/collon-brand.test.js`, create `test/collon-routes.test.js`.

**Interfaces:** Consumes Task 1 tokens/assets. Produces a Collon brand link and responsive shell while preserving existing `NAV`, `chrome()`, `applyTheme()` and route contracts.

- [ ] **Step 1: Write failing shell tests.** Assert visible brand output uses Collon assets/name, route keys and hover-menu eligibility remain unchanged, theme state still uses `DB.theme`, and focusable controls retain text/ARIA labels.
- [ ] **Step 2: Run `node --test test/collon-brand.test.js test/collon-routes.test.js`.** Expected: shell branding assertions fail, route preservation assertions pass.
- [ ] **Step 3: Implement shell typography, layout, button hierarchy, focus and theme styling.** Keep the Türkiye clock, desktop dock/menu destinations, mobile navigation and theme transition mechanics; improve touch targets to at least 44 CSS px.
- [ ] **Step 4: Run the two targeted test files and inspect desktop/mobile shell in both themes with Playwright CLI.** Expected: tests pass; no obscured navigation, missing focus state or horizontal overflow.
- [ ] **Step 5: Commit only this task's changes.**

### Task 3: Home, discovery and category entrances

**Files:** Modify `dist/index.html`, `dist/assets/collon.css`; extend `test/collon-routes.test.js` and existing `test/entry-ui.test.js` if relevant.

**Interfaces:** Consumes shared shell/tokens. Keeps `V.home`, `V.kesfet`, `V.kategori`, `sceneFor`, `categoryVisual` and their route parameters intact.

- [ ] **Step 1: Write failing tests.** Assert existing category IDs/routes and hero-card controls remain; empty category copy/action does not claim a fixed quiz exists; a long label has wrapping CSS instead of forced one-line ellipsis in the action region.
- [ ] **Step 2: Run targeted tests.** Expected: new brand/layout assertions fail; current route/content invariants pass.
- [ ] **Step 3: Recompose home, discovery and category screens.** Use typographic proportion, neutral framing and purposeful density; preserve category photos/icons and home card rotation/expansion behavior rather than replacing them with static mockups.
- [ ] **Step 4: Run targeted tests and verify home, discovery and one populated/one empty category on desktop/mobile in both themes.** Expected: readable text, reachable CTA, no overflow and working cards.
- [ ] **Step 5: Commit only this task's changes.**

### Task 4: Quiz, result, daily and mode flows

**Files:** Modify `dist/index.html`, `dist/assets/collon.css`; extend `test/collon-routes.test.js`, `test/daily-hero.test.js`, `test/entry-ui.test.js`.

**Interfaces:** Keep `V.quiz`, `V.oyna`, `V.gunluk`, `V.modlar`, `V.sinav`, `V.yolculuk`, `V.duello` and their state transitions. Consume Task 1 semantic status roles.

- [ ] **Step 1: Write failing flow tests.** Assert selection still counts as answer where currently implemented, progress/remaining state remains textual, and theme changes do not create a new quiz session or reset the current index. Assert reduced-motion CSS disables fan/tilt/magnetic/theme transitions.
- [ ] **Step 2: Run targeted tests.** Expected: new state/style assertions fail before implementation.
- [ ] **Step 3: Redesign the quiz-start, question, feedback, result, daily and mode compositions.** Keep timing/scoring/answer logic and existing animations; use high-contrast neutral actions with semantic status signals, keyboard focus and readable timer/progress.
- [ ] **Step 4: Run targeted tests and Playwright CLI flows in both themes, including active-quiz theme switch and reduced motion.** Expected: answers, progress, results and daily/mode starts still work; no reset or decorative motion leak.
- [ ] **Step 5: Commit only this task's changes.**

### Task 5: Competition, account and supporting states

**Files:** Modify `dist/index.html`, `dist/assets/collon.css`; extend `test/collon-routes.test.js`.

**Interfaces:** Preserve `V.siralamalar`, `V.gorevler`, `V.magaza`, `V.profil`, `V.giris`, `V.kayit`, settings and modal actions. Use shared brand tokens rather than new per-route palettes.

- [ ] **Step 1: Write failing coverage tests.** Assert all named route handlers and core form actions remain and visible Quizlora brand copy is removed from these surfaces without altering user data keys.
- [ ] **Step 2: Run `node --test test/collon-routes.test.js`.** Expected: copy/style coverage fails while route existence passes.
- [ ] **Step 3: Apply Collon composition to leaderboards, missions, store, profile, auth, settings, dialogs, footer, loading/empty/error states.** Preserve avatar/customization and leaderboard data presentation; eliminate repeated default card styling where hierarchy needs differentiation.
- [ ] **Step 4: Run targeted tests and inspect representative desktop/mobile states in light/dark themes.** Expected: no broken forms, hidden actions, contrast failures or overflow.
- [ ] **Step 5: Commit only this task's changes.**

### Task 6: Documentation, audit and release-ready UI verification

**Files:** Modify `PRODUCT.md`, `DESIGN.md`, `README.md`, `ATTRIBUTIONS.md`, `scripts/validate.mjs`; modify UI files only for issues found during audit.

**Interfaces:** Documentation is the new Collon product/design source of truth; bot provenance and category/quiz content rules remain.

- [ ] **Step 1: Write failing documentation/brand scan tests.** Assert public metadata and user-facing brand strings say Collon while technical compatibility identifiers are explicitly allowlisted; test `PRODUCT.md` and `DESIGN.md` no longer describe the old brand as current.
- [ ] **Step 2: Run `npm test` and `npm run validate`.** Expected: new brand scan fails before the documentation pass.
- [ ] **Step 3: Update documentation and validator messages, then perform Impeccable audit and at most two focused polish passes.** Do not make unrelated product or data changes.
- [ ] **Step 4: Run `npm test`, `npm run validate`, `npm run build` and Playwright CLI across home, category, quiz, daily, modes, leaderboard, profile, settings and modal/empty states at desktop/mobile, light/dark and reduced motion.** Expected: all commands pass; no console errors, clipped controls or old user-facing identity.
- [ ] **Step 5: Commit only final documentation/test/polish changes after reviewing the staged list.**

## Handoff

Complete this plan before activating the new domain. Then execute `docs/superpowers/plans/2026-10-16-collon-domain-migration.md`; the old origin must remain available for client-side data transfer until that plan's release gates pass.
