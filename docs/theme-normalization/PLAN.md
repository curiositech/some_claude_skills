# Some Claude Skills theme normalization

## Authorization and preservation

Repair the existing Windows 3.1 public site, as explicitly requested by the operator. Preserve its layout, typography, catalogue/docs content, seven palette choices, beveled controls and media artwork. This is normalization of existing roles, not a new aesthetic direction. Work only in linked worktree /Users/erichowens/coding/tmp/skills-theme-normalization on codex/skills-theme-normalization, baseline6713fc7a. Primary checkout and website-next are out of scope. No Port Daddy runtime, dependency upgrades, unrelated content regeneration, native builds or billing changes. The parent explicitly authorized pinned PR merge and GitHub Pages publication after current-head review and validation, followed by public-page proof.

## Intake

Active app: website/, Docusaurus 3.9.2, React 19, CSS/modules, GitHub Pages. Docusaurus selects config.ts before the stale compiled config.js. Existing configuration disables native appearance selection and operating-system preference. Existing useWin31Theme changes palette fills without paired foregrounds. Fixed beige/white panels, blue-on-gray links, code overrides and custom inline colors bypass native dark mode.

## Product and design contract

Audience: people discovering, reading and installing skills. Primary routes: homepage, catalogue, docs/skill detail, bundles, submit-skill/contact forms, media/artifact views and navigation. Keep workflow, content and brand personality unchanged.

Three layers: isolated source colors and seven palette variants; semantic surface/text/link/focus/status roles for light/dark; component roles for windows/title bars, buttons, fields, markdown/tables/code and navigation. Components consume roles. Palette choice is independent of System/Light/Dark appearance and must never force appearance. Dark mode uses dark content surfaces in every palette. Decorative artwork and examples retain authored palettes; meaningful site text needs a paired role.

Use Docusaurus 3.9.2's native prepaint, persisted choice, OS listener and cross-tab synchronization. Enable its existing three-choice button and style it with beveled square chrome, a 44px target and visible focus. No new select or preference owner.

AA is the hard gate for applicable checks. Enhanced text contrast target: normal >= 7:1, large >= 4.5:1, meaningful controls/graphics >= 3:1. Do not round failures upward, and do not equate automated contrast checks with complete WCAG AAA conformance. Test links, hover/active/focus states, forms, menus, docs tables, inline and block code, errors and muted copy. Preserve source hues while darkening titlebar/desktop fills when white text would fail.

Standards: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html ; https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html ; https://docusaurus.io/docs/3.9.2/api/themes/configuration

## Pessimistic sequence

1. Record intake and contract; install locked dependencies without scripts.
2. Enable native appearance and normalize palette lifecycle/paired role source.
3. Migrate active CSS/module/inline bypasses, preserving layout/media/content.
4. Run meaningful native/prepaint/persistence/OS/cross-tab/palette/browser regressions and light/dark desktop/mobile route scans. Repair findings; record automated incompletes separately.
5. Run tests, typecheck and production build. Existing prebuild generators are deliberately excluded from this scoped change; run validation independently and use the Docusaurus build directly to avoid unrequested regenerated catalogue/media.
6. Commit explicit source/docs only, push, open PR, inspect exact-head reviews/checks/threads to verdict. After independent current-head review and validation pass, merge pinned to the reviewed head, follow the GitHub Pages workflow, and verify public theme behavior and assets.

## Risk and release boundaries

Hundreds of generated skill documents and dozens of custom embeds may bypass shared roles. A sample screenshot does not prove every route. Enumerate actual build routes and coverage receipts; distinguish broad shared-role repair from unverified authored examples or visualizer canvases. Browser contrast over gradients/media may need manual review. No new data collection, runtime libraries or server operations. A missing test-only dependency is repaired. Existing dependency/security and unrelated TypeScript/test failures are reported with evidence rather than silently widened into this task. Rollback is a reviewed PR revert followed by Pages publication.

## Verification receipts

Implementation and local production export complete. Final browser/PR/CI receipts are tracked in VERIFICATION.md. All-export desktop/mobile contrast receipts and PR-review state repairs are included; no publication or universal compliance claim.
