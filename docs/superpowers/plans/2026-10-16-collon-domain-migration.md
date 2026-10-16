# Collon Domain and Local Data Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a Collon-branded Vercel address usable without silently losing locally stored Quizlora profiles and progress or breaking legacy links.

**Architecture:** Keep the old and new Vercel aliases serving the same static SPA during migration. Because `localStorage` is origin-scoped and an automatic cross-origin handshake is browser-dependent, use an explicit local-file export/import flow as the reliable baseline: export on the old origin, validate/preview/confirm import on the new origin, then keep old data intact. Attach the new alias only after the rebranded UI is verified; never force-redirect the old alias before transfer is tested.

**Tech Stack:** Vanilla browser JavaScript, `localStorage`, `Blob`/File APIs, Node `node:test`, Vercel static deployment and alias/domain controls.

**Spec:** `docs/superpowers/specs/2026-10-16-collon-rebrand-design.md`

## Global Constraints

- Prefer `collon.vercel.app` only if Vercel confirms availability; request user approval for a specific alternative if it is unavailable.
- Preserve `quizlora.vercel.app` access and existing hash deep links throughout the transition.
- Never place profile data, email or password hashes in URL parameters, analytics or server logs.
- The stored app record is `localStorage['qz_db']` with `v:1`; do not rename or reset it as part of the brand change.
- Destination import must validate file shape/version, preview the action and require explicit confirmation before overwriting a destination record.
- Do not buy a domain or rename the GitHub repository as a side effect of the Vercel alias transition.
- Keep user-owned uncommitted files out of commits; do not rewrite unrelated app data.

## Review Focus

1. A malformed, oversize or non-JSON import must leave existing destination data unchanged; Task 1 tests this.
2. A valid file with the wrong schema version must be rejected with a clear message; Task 1 tests this.
3. Import over an existing Collon profile must wait for affirmative confirmation, not use a default browser prompt that can be accepted accidentally; Task 2 tests this.
4. A blocked download or storage-quota exception must show a recoverable error and keep original data; Task 2 tests this.
5. An old `#/kategori/<id>` deep link must still resolve on the legacy alias; Task 3 tests this before any redirect is considered.

---

## File structure

- `dist/assets/collon-transfer.js`: pure snapshot validation/serialization functions exposed as `window.CollonTransfer`; no DOM or storage side effects in validators.
- `dist/index.html`: user-initiated transfer route, source/destination UI, event handlers and host-aware links; keeps existing router and `qz_db` load/save behavior.
- `test/collon-transfer.test.js`: Node tests for the pure transfer contract and reject/accept cases.
- `test/collon-routes.test.js`: route and metadata coverage shared with the UI plan.
- `README.md`: concise old-to-new transfer instructions and recovery guidance.
- `vercel.json`: change only if verified alias/routing behavior requires it; avoid a global legacy redirect.

### Task 1: Pure export/import contract

**Files:** Create `dist/assets/collon-transfer.js`, `test/collon-transfer.test.js`; modify `dist/index.html` to load the asset.

**Interfaces:** `window.CollonTransfer.makeExport(db)` returns `{kind:'collon-local-backup', format:1, exportedAt:string, data:db}`; `window.CollonTransfer.parseImport(text)` returns `{ok:true, data, summary}` or `{ok:false, error}` without writing storage. The parsed data retains `v:1` and existing `users`, `cats`, `quizzes` structures.

- [ ] **Step 1: Write failing tests.** Cover a valid `v:1` snapshot, malformed JSON, missing `users/cats/quizzes`, wrong version, oversized input (5 MiB maximum), unsafe prototype keys and a valid round trip that keeps the user's quiz progress fields.
- [ ] **Step 2: Run `node --test test/collon-transfer.test.js`.** Expected: missing contract failures.
- [ ] **Step 3: Implement the two pure functions.** Serialize only a versioned backup envelope; reject invalid or unsafe data and return user-readable Turkish errors. Do not send data over the network.
- [ ] **Step 4: Run `node --test test/collon-transfer.test.js && npm run validate`.** Expected: all pass with no app script syntax error.
- [ ] **Step 5: Commit only the transfer asset/test and script inclusion.**

### Task 2: Explicit transfer interface

**Files:** Modify `dist/index.html`, `README.md`; extend `test/collon-transfer.test.js`, `test/collon-routes.test.js`.

**Interfaces:** New `#/aktar` route renders both local `.json` export and file-import controls on any origin, so recovery remains possible on previews and localhost. On the old origin it additionally emphasizes export and links to the confirmed new address; on the new origin it emphasizes import. Import shows a validation summary and explicit overwrite confirmation before `localStorage.setItem('qz_db', ...)` and reload. Unknown origins show no guessed redirect.

- [ ] **Step 1: Write failing route/UI tests.** Cover old/new host guidance, no URL payload, export/import controls on both origins, cancellation leaving destination storage untouched, import failure leaving storage untouched and a quota exception yielding visible recovery text.
- [ ] **Step 2: Run targeted tests.** Expected: route and state checks fail before implementation.
- [ ] **Step 3: Implement `#/aktar` without changing existing app state schemas.** Use File/Blob APIs with a local download; show that the backup contains local profile data and should be kept private. Imported data is validated again at commit time; destination state is replaced only after confirmation. Keep old copy until the user can verify the new profile.
- [ ] **Step 4: Run targeted tests and Playwright CLI on two local origins.** Expected: a sample account/progress exported from origin A appears on origin B after confirmation; cancel/invalid file do not modify B; reload preserves imported data.
- [ ] **Step 5: Commit only the UI, tests and help text.**

### Task 3: Vercel alias, preview and legacy-link verification

**Files:** Modify `dist/index.html` canonical/share metadata and `README.md`; modify `vercel.json` only if platform verification requires it; extend `test/collon-routes.test.js`.

**Interfaces:** The canonical public origin is the confirmed Collon alias; legacy origin continues serving the migration-capable app. Hash route parsing remains unchanged.

- [ ] **Step 1: Write failing metadata/route tests.** Assert new shared/canonical URL uses the confirmed alias, old `#/kategori/<id>` and `#/quiz/<id>` still resolve, and no blanket legacy-to-new redirect appears in `vercel.json`.
- [ ] **Step 2: Run `node --test test/collon-routes.test.js`.** Expected: new-origin metadata assertions fail before update.
- [ ] **Step 3: Verify current Vercel alias/domain procedure with current docs, then inspect alias availability.** If `collon.vercel.app` is unavailable, stop alias mutation and obtain user approval for a named alternative. Otherwise attach the alias to the verified Collon deployment while retaining the legacy alias.
- [ ] **Step 4: Verify preview and both public origins with Playwright CLI.** Expected: desktop/mobile home and deep links load on new address, old deep link and transfer page remain accessible, transfer works, no console error or broken asset; `npm test`, `npm run validate`, `npm run build` pass.
- [ ] **Step 5: Commit metadata/help/test changes only after verification, and report the exact activated URL.** Do not add a forced redirect unless a later request explicitly chooses it after the migration window.

## Handoff

Execute only after `docs/superpowers/plans/2026-10-16-collon-brand-ui.md` passes its UI gates. If a Vercel alias is unavailable or account permission is insufficient, report the exact blocker and keep the verified preview available without claiming the domain transition is complete.
