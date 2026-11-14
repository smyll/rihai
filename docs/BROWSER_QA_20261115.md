# Actual browser and print acceptance

Completed across 2026-11-14 / 2026-11-15, Hong Kong / Taipei time, using the real Edge browser and its native print-preview window. The `qa-20261114` evidence folder retains the date on which this run began. Only the original fictional roster was loaded.

## Observed checks

| Check | Actual result |
| --- | --- |
| Desktop, 1280 × 900 | All 40 rows loaded; 2 outer-limit alerts, 6 application-due, 16 legal-review, 7 not-yet, 4 other-case, 5 excluded; no document-wide horizontal overflow |
| Conditional penalty | SYN-009 shows the repeat-penalty review reason and no application button |
| Application dialog | SYN-001 contains the fictional identity, case, correct custody dates and review date |
| Clear review date | Summary and old results clear; export, meeting print and draft print disable; dialog closes and old print content becomes empty |
| Restore review date | 2026-11-15 restores all 40 rows and updates the displayed review date |
| Actual CSV download | 40 downloaded rows; every review_date is 2026-11-15; each status and counted-days value matches evaluation for that date |
| Narrow viewport, 390 × 844 | Document width 375px, without page-wide overflow; table scrolls independently in its 341px container with 1080px contents; controls remain readable |
| Single-application print preview | One portrait page with complete draft, checklist, signature and date lines |
| Meeting-pack print preview | Correct 2026-11-15 header and 40-record summary; 24 actionable/review rows, 16 review notes and 8 complete application drafts; 11 portrait pages after the pagination correction |
| Browser errors | No captured console warnings or errors in the inspected tab log |
| End state | Temporary viewport override reset; live page left open with 40 fictional records, review date 2026-11-15; print/save dialogs closed |

The first desktop/sample checks used 2026-11-14. The date-recovery, downloaded CSV and meeting pack deliberately used 2026-11-15 to test that stale results did not retain the old date.

## Pagination issue found and corrected

The initial real meeting preview contained 12 pages. The last review note's heading was separated from its body, leaving two lines on a separate page. The fix adds a review-note class and print-only rules to keep each note together, with compact note headings and paragraph spacing. The new native preview has 11 pages; SYN-024's heading and explanation now stay together on page 3, and the eight application drafts each start on a separate page (pages 4–11).

`npm test` was rerun after the rendering change: **115 passed, 0 failed**. The penalty table and original synthetic roster remain unchanged.

## Evidence

- [Desktop loaded roster](qa-20261114/desktop-loaded.jpg)
- [Conditional-penalty hold and explanation](qa-20261114/conditional-penalty-review.jpg)
- [Actual application dialog](qa-20261114/application-dialog.jpg)
- [Invalid date with old output removed](qa-20261114/invalid-date-cleared.jpg)
- [390px top layout](qa-20261114/mobile-top-390.jpg)
- [390px actions and filters](qa-20261114/mobile-actions-390.jpg)
- [Actual downloaded review CSV](qa-20261114/review-export-2026-11-15.csv)

Native-window print screenshots and before/after accessibility records are retained in the ignored `.local/qa-private` directory. Release files include app-content screenshots only, so unrelated browser chrome and download history are excluded.

## Execution notes

The user enabled the local origin after an earlier saved refusal, opened an existing Edge tab because sidebar mode prohibited new-tab creation, and restored Edge when it was minimized. A stopped preview server was restarted as a hidden process listening only on 127.0.0.1:5197; HTTP 200 was checked before continuing.

Clicking a print button opens a native modal, which caused the browser click acknowledgement to time out; the actual opened preview was then checked through the native window. The CSV download-event waiter also timed out, but the real downloaded file existed and was separately read and verified. These were automation acknowledgement failures, not substituted software-only checks.

An optional PDF-file save was canceled after the native file dialog's cached element map failed. No saved PDF is claimed. Acceptance here is of the observed native print previews, not a physical printer output or an exported-PDF audit. Other paper sizes and printer settings were not tested.
