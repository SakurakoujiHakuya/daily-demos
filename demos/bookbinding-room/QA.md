# QA · 旧书装帧室

Checked 2026-10-24 09:14–09:16 UTC (17:14–17:16 Beijing).
Public URL: https://hakuya-bookbinding-room.golden-berry-3772.chatgpt.site/

## Actual browser interaction
Cloud Chromium, a new isolated QA tab. All gameplay used real UI clicks through CUA locators. No state injection, engine invocation or script-driven gameplay.

- Opened public deployed page successfully, correct title and controls.
- Solved 雨后散步 (8 pages) from its initial scattered state using cross-sheet swaps and rotations. Visible result: 8/8 correct, 10 operations, 装订完成. Reading preview showed 1–8 in order.
- Rotated solved page 4 upside-down. Visible result fell to 7/8; check reported 0 misplaced and 1 inverted page, not a win.
- Undo restored 8/8 and 10 operations; check again confirmed completion.
- Reload preserved the solved layout and count. Undo history correctly does not survive reload.
- Switched to 夜航手记 (12 pages). Moved the outer sheet inward: four-page layout and reading-order preview changed, operation count became 1. Undo restored the initial layout and 0 operations.
- Second-book check reported 12 misplaced pages and 4 inverted pages. Hint correctly described sheet 2 front-left as page 10 with partner page 3, pair sum 13.
- Inspected a screenshot of the solved eight-page desk: no overlapping controls or text; both folio and reading-preview columns visible, selected page outlined, correct preview underlines green.
- Console inspection found browser-extension metadata errors originating from chrome-extension URLs; no application-origin errors observed in retrieved logs. Do not describe the entire browser console as error-free.

## Automated checks
45 Node tests passed. Covers standard 8/12/16-page solutions and all 18 deterministic variants, page pair sums, validation, immutable actions, rotation, sheet movement, hints and wrong-orientation rejection. npm ci --ignore-scripts, build, JS syntax checks and local HTTP 200 smoke passed.

## Coverage limits
12- and 16-page full solutions validated by engine tests, not played to completion in this browser pass. Mobile viewport, all keyboard navigation, exported download contents and every shuffle variant were not browser-tested. Browser screenshot was inspected live, not saved as a repository image. No code changes were required during this QA pass.
