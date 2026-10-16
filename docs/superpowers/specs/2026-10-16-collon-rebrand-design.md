# Collon brand and domain transition — design specification

Date: 2026-10-16
Status: awaiting user review

## Intent and scope

Transform the existing Quizlora quiz product into **Collon**, using the supplied black-on-white wordmark image as the visual reference. The result should feel like a coherent new brand across the whole product, not a palette overlay. Ship matching light and dark themes and move the public Vercel address to a Collon-branded address. Keep the existing category tree, question content, game rules, navigation destinations, user capabilities, and useful interaction/animation mechanics intact.

The supplied image is a raster reference, not an original vector or font source. Reconstructed vector artwork may be optically close but must not be represented as the original source file. A licensed font with Turkish glyph coverage is required for UI text; the wordmark itself is custom vector artwork.

## Product invariants

- Category names, hierarchy, quiz/question data, game modes, progression, simulated leaderboard behavior, profile customization, and local state schema keep their current meanings.
- Quiz starts, answers, feedback, results, daily cards, category discovery, navigation and profile flows remain operational.
- Existing category imagery, official category symbols, motion behavior and reduced-motion handling are preserved unless their surface styling must change for legibility.
- No question or category data is generated as part of the rebrand. Bot provenance and validation rules in `AGENTS.md` remain unchanged.
- Existing hash routes continue to resolve. User-facing names become Collon; internal IDs, storage keys and old inbound URLs are compatibility mechanisms, not visible branding.

## Selected approach

Rebrand the current static SPA in place. Introduce a small set of Collon semantic tokens and brand assets, then adapt existing shared controls and page-specific compositions in successive passes. Do not rebuild the product from scratch or create a separate long-lived duplicate site: those paths would multiply regression and maintenance risk without improving the brand outcome.

The current implementation is largely one `dist/index.html` file. Focused extraction of reusable brand assets, font files and design tokens is appropriate; a framework migration or broad unrelated refactor is not. All integrations must work with the present static `dist/` deployment.

## Brand identity

- **Name:** “collon” in the artwork and primary brand lockup; “Collon” in ordinary prose and document titles where sentence case reads naturally.
- **Mark:** Recreate the split-stem symbol and wordmark as scalable SVG with transparent background, a light-surface black variant and a dark-surface off-white variant. Provide a compact symbol for favicon, narrow navigation and small-screen use. Ensure it remains recognizable at small sizes.
- **Typeface:** Use self-hosted Manrope for UI typography, with system sans-serif fallback. Manrope is distributed under SIL Open Font License 1.1; preserve its license in the repository. The custom wordmark is not synthesized by merely typing the name in Manrope.
- **Palette:** Light theme uses warm white/paper, charcoal text and controlled grey separators. Dark theme uses near-black/charcoal surfaces and warm-white text, with tonal elevation. Primary actions use high-contrast neutral fills. Restrict non-neutral colors to semantic answer/validation/error/reward/timer states and content imagery; do not recolor every category image to monochrome.
- **Shape/depth:** Reduce repeated oversized rounded containers, ambient violet glows and redundant icon boxes. Use a deliberate radius hierarchy, subtle borders and sparing elevation. Brand character comes from typography, proportion and composition rather than decorative effects.
- **Motion:** Keep interaction purposes, timing and affordances already in the product. Reskin rather than remove the home card fan, daily tilt, magnetic actions and theme transition. Honor `prefers-reduced-motion`.

Initial semantic palette and scale, subject to contrast validation in the browser:

| Role | Light | Dark |
| --- | --- | --- |
| Page | `#F7F7F4` | `#101011` |
| Surface | `#FFFFFF` | `#1A1A1C` |
| Raised/soft surface | `#EEEEEB` | `#252527` |
| Primary text/action | `#111112` | `#F5F5F2` |
| Secondary text | `#5D5D5C` | `#B6B6B2` |
| Hairline | `#DADAD6` | `#3A3A3D` |

Use a display/body hierarchy rather than one uniformly heavy font: hero `clamp(2.75rem, 6vw, 5.5rem)`, page title `clamp(2rem, 4vw, 3.5rem)`, section title `1.5–2rem`, card title `1.05–1.35rem`, body `1rem`, meta `0.8–0.9rem`; adjust per screen to avoid wrapping or crowding. Surface radii should form a distinct hierarchy (roughly 8 / 14 / 22 px for compact controls / cards / feature surfaces), with pill forms reserved for actual chips. Spacing follows a 4 px base rhythm but may vary by density. These are design starting values, not permission to reduce touch targets or contrast.

Font source and license: [Google Fonts Manrope repository](https://github.com/google/fonts/tree/main/ofl/manrope) (SIL Open Font License 1.1). Bundle the font locally rather than making rendering depend on a third-party font request.

## Screen composition

1. **Global shell:** Rebuild the top brand area around the Collon lockup while keeping the Türkiye clock, existing navigation destinations, hover submenus only where currently supported, theme toggle and account controls. Desktop navigation gains clearer active/focus states; mobile retains a usable bottom navigation instead of shrinking desktop chrome.
2. **Home:** Keep the hero's quiz invitation, featured card interaction and route actions, but recast typography, spacing and information weight to match the new brand. Preserve the card rotation/expansion mechanics and discovery entry points. Stats and lower sections should read as an editorial product surface, not repeated generic panels.
3. **Discovery/category:** Preserve category imagery, icons and the hierarchy. Recompose list and category entrance surfaces with neutral framing and clearer title/action relationships. Fixed-quiz empty states must remain honest; do not imply unavailable quizzes exist.
4. **Quiz/daily/modes:** Carry the same brand system through start screens, question/answer states, progress, timers, results and daily-mode entry cards. Correct/incorrect/remaining status may use restrained semantic color and text; no action is distinguished by color alone. Quiz answer behavior is unchanged.
5. **Competition/account:** Apply the system to leaderboard, missions, store, profile, auth, settings, dialogs, loading/empty/error states and footer. Preserve the product-specific density and existing mechanics; do not replace these screens with marketing-style sections.
6. **Responsive:** Review desktop, tablet and mobile compositions independently. Prevent horizontal overflow, ensure primary actions and status remain visible, preserve touch targets and visible keyboard focus.

## Domain and data migration

Target a Collon-branded `*.vercel.app` address first, preferably `collon.vercel.app` if the Vercel platform confirms it is available. If unavailable, choose and obtain the user's approval for a specific alternative before attaching it. Do not buy or connect a custom paid domain without a separate exact domain choice. Keep the old `quizlora.vercel.app` address functional during a transition window.

The current app saves account/profile/progress data in browser `localStorage` under `qz_db`; storage is isolated by origin. A blind redirect to a new origin would make that data appear lost. Provide an explicit, user-initiated transfer path from the old origin to the new one before any automatic redirect. The transfer must validate the data version/shape, show what will happen, require confirmation before replacing any data already at the destination, and avoid placing account data, email or password hashes in a URL, analytics event or server log. If an automatic cross-origin handoff cannot be made reliably across browsers, offer a local export/import fallback. Old data remains recoverable at the old origin until the user confirms transfer. Do not silently reset or overwrite state.

Keep legacy deep links working through the transition. New shared links and canonical metadata should point to the Collon address once deployed and verified. Changing the GitHub repository name is not necessary to the public brand transition and should not be conflated with domain migration.

## Implementation boundaries and interfaces

- Brand assets and font live under `dist/assets/` with descriptive filenames and license/attribution records.
- Shared light/dark semantic tokens control surfaces, text, borders, focus, action and state colors. Existing components should consume these rather than adding route-specific hard-coded brand colors.
- Brand strings and metadata in the HTML shell, visible UI, page title, favicon and documentation update together. Technical identifiers remain stable unless accompanied by a compatibility migration.
- User state remains client-side. Any transfer UI is a separate, explicit flow with schema validation; it does not change quiz records or bot facts.
- Update `PRODUCT.md` and `DESIGN.md` to describe the approved Collon identity only when implementation begins; keep the product purpose and data safety rules.

## Verification and release gates

- Automated checks: existing `npm test`, `npm run validate`, `npm run build`; add focused regression checks for brand strings/assets, route preservation, theme parity and any migration logic.
- Visual audit: inspect representative home, category, quiz start/play/result, daily, modes, leaderboard, profile, settings, modal and empty states. Run a second bounded polish pass on findings.
- Browser verification: real desktop/mobile (and tablet where composition changes), both themes, keyboard focus, reduced-motion, hover/touch interaction, console errors and overflow.
- Release: deploy a preview, verify full flows and old/new address behavior, then attach/activate the Collon Vercel address. Do not retire the old address or enable a forced redirect before the storage transfer path is verified.
- Completion evidence includes screenshots/route checks and explicit reporting of any unavailable Vercel alias or other external limitation.

## Out of scope

New quiz content, category changes, altered scoring, new game modes, backend authentication, a framework rewrite, paid domain purchase, or removal of existing functional animations. A future custom domain can replace the initial Vercel address through a separate DNS/ownership decision.
