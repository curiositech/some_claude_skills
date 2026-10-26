# Verification receipts

## Scope and contract

This repair enables native Docusaurus 3.9.2 System/Light/Dark appearance and normalizes the existing Win31 UI. The seven palettes remain independent. The scope is this Docusaurus site; `website-next` and the OS2 property have separate release ownership.

Authored text-role contract: at least 7:1 for normal text, 4.5:1 for large text, and 3:1 for meaningful UI. These checks do not establish complete WCAG AAA conformance. Automated incompletes over images, gradients, overlays and authored media remain manual-review limits.

## Local checks

- Verified linked worktree: `/Users/erichowens/coding/tmp/skills-theme-normalization`, branch `codex/skills-theme-normalization`, baseline `6713fc7a6451c8dee5903b98cd2063ff4cbf7317`.
- Installed locked dependencies without lifecycle scripts. Added the missing `jest-dom` test dependency and automatic JSX transform so the existing React tests can execute.
- Focused theme/window/storage suite: **42 tests pass**. Fourteen palette/appearance cases check actual source-role pairs with unrounded WCAG contrast math.
- Full existing suite: **829 tests pass**; one preexisting process-executor suite cannot collect because its `child_process` mock lacks a default export. That implementation and test were not changed. Owner: repository maintainer; next action: repair that separate mock/import configuration.
- Baseline typecheck: **278 errors**. Current source: **267 errors, no added diagnostic identities**. Existing React 19 global JSX, skill-data types, DAG and nested legacy-source errors remain. Owner: repository maintainer; next action: a separate type-health repair. Repository-wide typecheck is not green.
- Direct Docusaurus production export succeeds: **673 HTML routes**. The build bypasses prebuild's unrelated skill/media/statistics regeneration. Existing duplicate-route, unknown-tag and stale Browserslist warnings remain.
- `git diff --check` passes.
- The builder contract audit was run. Existing missing Storybook, broader raw-style/token and product-content findings remain rehabilitation debt. The native/component state matrix below covers this theme repair; the wider audit is not represented as passing.

Baseline and final diagnostic logs, build/test logs and raw browser results are retained in the ignored `website/temp/theme-normalization/` directory of the task worktree. The compact committed evidence includes the diagnostic identity comparison and final browser receipts.

## Production browser coverage

The 22 routes in `evidence/route-theme-cases.json` were checked at 1440 × 1000 in both light and dark appearance: **44 cases**, all HTTP 200, no horizontal overflow, and zero resolved violations from `color-contrast`, `color-contrast-enhanced`, `label`, `button-name` and `link-name`.

The routes cover homepage, catalogue, docs/skill detail/reference/guide, submit form/contact, bundles/favorites, agents, artifacts/MCPs/ecosystem/metrics/changelog, DAG overview/builder/monitor/demo/lifecycle, and the reliability artifact with all three embeds. This is a representative route/state audit, not a claim that all 673 exported documents or every authored image/example were individually certified.

Axe still returned **14,362 incomplete node/rule results**, including repeated checks across routes/themes. Screenshot inspection and a complementary computed solid-surface scan drove additional repairs to gallery badges, conditional controls, status data, code installation panels, docs references/guide panels and decorative window controls. The final solid-surface candidates are colored emoji glyphs and disabled controls; CSS foreground contrast does not describe multicolor emoji, and inactive controls are exempt from WCAG text contrast. The solid scan does not model gradients/images and does not replace manual review.

Gallery interaction checks: **12 cases pass** across both appearances: selected quick tags, expanded tag filters, list view, and all three installation tabs inside the quick-view panel. The extra state audit has no resolved violations from the same five axe rules; its incomplete results are retained separately in `evidence/gallery-states.json`.

Native lifecycle checks: **7 pass**. They cover prepaint with React bundles blocked, three-choice cycling, persisted reload, explicit choice vs OS changes, live System updates, cross-tab synchronization, independent palette persistence, appearance access/reflow at 320/390/768 px, and blocked browser storage. Restricted storage exposed ancestor UI-sound/skin/gating preferences that could prevent the header from rendering; optional preference access is now guarded without changing access policy.

Actual rendered input checks: **14 palette/appearance states pass**, with minimum computed text/input contrast **14.71:1**. The source-pair tests separately cover text, muted/link, surface, status, titlebar, terminal and field roles in every palette.

Screenshots in `evidence/` show the final exported skill docs in both appearances, the dark gallery, and the mobile appearance control.

## Reproduction

Use Node 22 and run commands from `website/`. Run `npm ci --ignore-scripts`, then:

```sh
npm run test:run -- --config vitest.config.ts src/hooks/useWin31Theme.test.tsx src/styles/__tests__/themeContrast.test.ts src/components/ThemePicker/ThemePicker.test.tsx src/components/win31 src/utils/browserPreferences.test.ts
npx docusaurus build
python3 -m http.server 3240 --bind 127.0.0.1 --directory build
```

In a second terminal, still in `website/`, create `temp/theme-normalization/` for browser scratch and set `TMPDIR` there. Provide a compatible Playwright module through `PLAYWRIGHT_MODULE` (or an installed `playwright` package), and `AXE_SOURCE` pointing to `axe-core/axe.min.js`. The audit used Playwright's Chromium and axe-core 4.11.4 from existing task dependencies; no runtime browser dependency was added to this site.

```sh
node ../docs/theme-normalization/audit-browser.mjs
node ../docs/theme-normalization/solid-audit-browser.mjs
node ../docs/theme-normalization/lifecycle-browser.mjs
node ../docs/theme-normalization/gallery-states-browser.mjs
```

The axe and lifecycle scripts fail on resolved violations, route/reflow errors or lifecycle failures. The solid-surface script reports manual-review candidates. Stop the local static server after checking.

## Release boundary

No merge or deployment is authorized for this worker. The parent reviews this scoped PR and owns publication. Exact-head CI/review receipts are recorded in the PR and parent handoff; local build/browser proof is separate from hosted review and production delivery.
