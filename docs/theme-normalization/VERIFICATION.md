# Verification receipts

## Scope and contract

This repair enables native Docusaurus 3.9.2 System/Light/Dark appearance and normalizes the existing Win31 UI. The seven palettes remain independent. The scope is this Docusaurus site; `website-next` and the OS2 property have separate release ownership.

Authored text-role contract: at least 7:1 for normal text, 4.5:1 for large text, and 3:1 for meaningful UI. These checks do not establish complete WCAG AAA conformance. Automated incompletes over images, gradients, overlays and authored media remain manual-review limits.

## Local checks

- Verified linked worktree: `/Users/erichowens/coding/tmp/skills-theme-normalization`, branch `codex/skills-theme-normalization`, baseline `6713fc7a6451c8dee5903b98cd2063ff4cbf7317`.
- Installed locked dependencies without lifecycle scripts. Added the missing `jest-dom` test dependency and automatic JSX transform so the existing React tests can execute.
- Focused theme/window/storage suite: **44 tests pass**. Fourteen palette/appearance cases and two standalone-report appearance cases check actual source-role pairs with unrounded WCAG contrast math.
- Full existing suite: **831 tests pass**; one preexisting process-executor suite cannot collect because its `child_process` mock lacks a default export. That implementation and test were not changed. Owner: repository maintainer; next action: repair that separate mock/import configuration.
- Baseline typecheck: **278 errors**. Current source: **266 errors, no added diagnostic identities**. Existing React 19 global JSX, skill-data types, DAG and nested legacy-source errors remain. Owner: repository maintainer; next action: a separate type-health repair. Repository-wide typecheck is not green.
- Direct Docusaurus production export succeeds: **673 HTML routes**. The build bypasses prebuild's unrelated skill/media/statistics regeneration. Existing duplicate-route, unknown-tag and stale Browserslist warnings remain.
- `git diff --check` passes.
- The builder contract audit was run. Existing missing Storybook, broader raw-style/token and product-content findings remain rehabilitation debt. The native/component state matrix below covers this theme repair; the wider audit is not represented as passing.

Baseline and final diagnostic logs, build/test logs and raw browser results are retained in the ignored `website/temp/theme-normalization/` directory of the task worktree. The compact committed evidence includes the diagnostic identity comparison and final browser receipts.

## Production browser coverage

The 22 routes in `evidence/route-theme-cases.json` were checked at 1440 × 1000 in both light and dark appearance: **44 cases**, all HTTP 200, no horizontal overflow, and zero resolved violations from `color-contrast`, `color-contrast-enhanced`, `label`, `button-name` and `link-name`.

The initial routes cover homepage, catalogue, docs/skill detail/reference/guide, submit form/contact, bundles/favorites, agents, artifacts/MCPs/ecosystem/metrics/changelog, DAG overview/builder/monitor/demo/lifecycle, and the reliability artifact with all three embeds.

The follow-up sweep enumerated **all 673 application HTML exports**, including the standalone image-comparison report, at **1440 × 1000 and 390 × 844 in light and dark: 2,692 cases**. Phone contexts enable `isMobile` and `hasTouch`; overflow compares document `scrollWidth` with `clientWidth`, and receipts retain all three viewport widths. Every case returned HTTP 200 with the requested theme, zero document overflow and zero supported solid-text contrast failures. The final scan required no retries and completed in 88 seconds. It checked **1,904,983 supported solid HTML text instances** against the enhanced text thresholds; the route list, per-configuration counts, empty failure sets and raw-result SHA-256 are in `evidence/export-content-summary.json`.

This wider scan drove fixes to narrow-phone grids, navigation wrapping, canvas-container minimum widths and an offset sticker on five active routes. It also repaired the mobile document TOC control. The standalone static report has no Docusaurus provider, so its small appearance adapter shares the framework's `theme` key and System/Light/Dark protocol. It keeps its existing content/media and supplies paired report colors. Five browser lifecycle checks verify its saved choice, live OS, cross-tab compatibility with native pages and restricted storage.

The full-export scanner retained **104 image/gradient background instances, 182 opacity instances and 60 SVG text instances** for manual review rather than certifying them. It separately counted **12,099 color-emoji instances and 20 disabled-control instances**. Counts repeat across routes/configurations. Raster images, canvas/SVG drawing colors and group opacity require further manual or specialized checking; this remains a theme/contrast repair, not a complete WCAG conformance certificate.

Axe still returned **14,358 incomplete node/rule results**, including repeated checks across routes/themes. Screenshot inspection and a complementary computed solid-surface scan drove additional repairs to gallery badges, conditional controls, status data, code installation panels, docs references/guide panels and decorative window controls. The final solid-surface candidates are colored emoji glyphs and disabled controls; CSS foreground contrast does not describe multicolor emoji, and inactive controls are exempt from WCAG text contrast. The solid scan does not model gradients/images and does not replace manual review.

Gallery interaction checks: **12 cases pass** across both appearances: selected quick tags, expanded tag filters, list view, and all three installation tabs inside the quick-view panel. The extra state audit has no resolved violations from the same five axe rules; its incomplete results are retained separately in `evidence/gallery-states.json`.

Native lifecycle checks: **7 pass**. They cover prepaint with React bundles blocked, three-choice cycling, persisted reload, explicit choice vs OS changes, live System updates, cross-tab synchronization, independent palette persistence, appearance access/reflow at 320/390/768 px, and blocked browser storage. Restricted storage exposed ancestor UI-sound/skin/gating preferences that could prevent the header from rendering; optional preference access is now guarded without changing access policy.

Actual rendered input checks: **14 palette/appearance states pass**, with minimum computed text/input contrast **14.71:1**. The source-pair tests separately cover text, muted/link, surface, status, titlebar, terminal and field roles in every palette.

PR-review regressions: intermediate bundle modal and copied state, plus before/after split view, pass the five axe rules in both appearances (**6 interaction cases**). Computed split-view code text is **16.28:1** in both appearances. The review also drove terminal foreground/label repairs and paired difficulty/copy colors, plus adjacent artifact callouts and comparison-icon states. See `evidence/review-states.json`.

The expanded library audit passes **20 interaction cases**, with zero resolved violations and **2,922 incomplete node/rule results** retained. It checks all nine agent cards expanded, both MCP detail dialogs in overview/tools/examples tabs, and running/paused/stopped monitor states in both appearances. It also verifies that modal focus stays contained and the Close button remains reachable above the fixed header. The prompt terminal explicitly clears the framework inline-code background. See `evidence/extended-states.json` for the final resolved violations and retained incompletes.

The Canvas DAG now resolves CSS roles to concrete drawing colors and redraws when appearance or palette changes. A specialized browser check samples actual background pixels immediately before text drawing across eight lifecycle phases in both appearances, including live appearance changes: **16 states pass**, minimum text contrast **10.38:1**. It covers node-title and legend text; raster hero artwork and separate authored SVG media remain outside this specialized text check. See `evidence/canvas.json`.

Shared authored interaction audit: **2,656 hover/pressed/focus/error cases pass**, checking **3,042 supported solid text instances** over 20 route/state contexts in both appearances. Four media/opacity instances remain manual. The inventory deduplicates visible controls by tag/classes per route; it includes skill/MCP/bundle dialogs, the selected builder node panel, empty submission validation, and empty/running/deterministically failed-node log output. It rejects empty control inventories. The committed compact summary lists controls/states, counts, empty failures and the raw receipt hash; full raw output remains in task scratch. This covers supported authored states, not every possible user workflow.

The audit drove paired header hover/focus/pressed colors, atomic navigation color changes during palette updates, a semantic keyboard skip link, dark filter hover, selected builder actions, terminal log levels and shared status/button/form roles. **56 Submit Skill cases** cover all seven palettes × both appearances × default/hover/pressed/focus; minimum contrast **7.13:1**. See `evidence/interaction-states-summary.json` and `evidence/nav-states.json`. These checks supplement the selected gallery/tab states above and do not replace manual artwork or nontext interaction review.

Real-pointer and failure overlays: **30 cases pass**, minimum measured text contrast **10.38:1**. All three noncurrent Sites links are checked before pointer entry, on entry, after pointer leave and with keyboard focus in both appearances. These exercise React event handlers that forced CSS states do not trigger. The component restores semantic ink and explicitly carries link ink into child labels/descriptions. Navigation colors switch atomically; checks sample after a rendered frame.

The same browser check delays then fails lazy visualizer chunks to inspect loading, initialization-error and error-action hover in both appearances. Text overlays use opaque terminal surfaces and matched terminal inks; metadata/hint roles are normalized without changing canvas artwork. See `evidence/pointer-overlays.json`. This verifies loading/error UI; it does not certify every live WebGL frame.


All five compact-player skins (Classic, Matrix, Synthwave, Ice and Amber) pass both appearances, including selected/inactive skin labels, hover and keyboard focus. The combined skin/resource audit passes **100 interaction cases**, **464 supported solid checks**, minimum text **8.53:1** and monochrome-control **4.06:1**. It uses actual pointer events for ecosystem resource links, timeline links and Council Overview, including pointer leave. The player is intentionally hidden by the existing phone navigation; two phone exclusions are explicit rather than counted as skin passes. The header skin menu opens into the viewport. See `evidence/skins-resources.json`.

The actual shared SVG DAG component is bundled without creating a public fixture route. All **seven TaskState statuses × seven palettes × two appearances** pass: **420 text instances**, minimum **7.50:1**; all five edge-color branches and legend markers minimum **7.22:1**. Node fills, status badges, edges and legend marks consume paired roles. Paint colors switch atomically during theme changes; the cancelled status has an explicit paired fallback and label. See `evidence/svg-status.json`. This covers shared authored status text, not arbitrary SVG artwork.

The page-local JavaScript color-writer inventory includes ecosystem timeline/resources/Council Overview, Sites menu links and quick-view installation tabs. Their foreground/background writes and restoration use semantic pairs; actual pointer regressions complement forced CSS pseudo-state checks. Remaining manual limits include image/gradient and opacity instances listed above, raster illustrations, colored emoji, animated CTA/easter-egg gradients, authored SVG artwork outside the status component, native browser popups and live WebGL frames. The expanded AA gate below supplements this earlier contrast slice.

Screenshots in `evidence/` show the final exported skill docs in both appearances, the dark gallery, and the mobile appearance control.

## Expanded AA regression gate

After the contrast sweep, all applicable axe A/AA rules through WCAG 2.2 plus enhanced contrast were run on the same 22 representative routes at 1440px and real-touch 390px in both appearances: **88 cases pass**, with no resolved violations or document overflow. Retained incomplete results are in `evidence/full-aa.json`. This supplements the earlier five-rule receipts and does not erase their stated media/manual limits.

The expanded gate repaired compact-player controls to 24 × 24px (AA minimum target size), preserved visible prose-link underlines, associated the DAG example label, made native MDX tables keyboard-scrollable, and gave the contact profile subtitle its heading semantics. The existing phone player exclusion remains explicit; 24px controls are not represented as AAA 44px targets. The production build and 44 focused tests pass after these repairs. Typecheck retains the baseline failures above with no new diagnostic identities.

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
node ../docs/theme-normalization/export-content-browser.mjs
node ../docs/theme-normalization/review-states-browser.mjs
node ../docs/theme-normalization/standalone-lifecycle-browser.mjs
node ../docs/theme-normalization/extended-states-browser.mjs
node ../docs/theme-normalization/canvas-browser.mjs
node ../docs/theme-normalization/interaction-states-browser.mjs
node ../docs/theme-normalization/nav-states-browser.mjs
node ../docs/theme-normalization/pointer-overlays-browser.mjs
node ../docs/theme-normalization/skins-resources-browser.mjs
node ../docs/theme-normalization/svg-status-browser.mjs
```

The axe and lifecycle scripts fail on resolved violations, route/reflow errors or lifecycle failures. The solid-surface script reports manual-review candidates. Stop the local static server after checking.

## Release boundary

The parent explicitly authorized this worker to merge the pinned reviewed head, follow GitHub Pages publication, and verify the public pages after current-head checks and independent review pass. Exact-head CI/review and release receipts are recorded in the PR and parent handoff; local build/browser proof remains separate from hosted review and production delivery. Native builds, billing changes and unrelated source remain outside this task.
