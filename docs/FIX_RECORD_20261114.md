# Rihai corrective batch — 2026-11-14

Authorized by the user's “那就去改呀。” after the four-item self-review. This is one bounded corrective batch, not a restart of the overnight queue.

## Changes and verification

| Finding | Corrected behavior | Evidence |
| --- | --- | --- |
| Conditional punishments only warned | Unresolved repeat theft/stalking and circumstance-dependent penalties require review and cannot generate an application, including after the base-term outer date | engine.test.mjs: repeat/history combinations, first-time controls, robbery and hurt/no-hurt cases |
| Invalid review date retained old output | Input changes clear old drafts/print content; invalid dates clear rows/summary and disable outputs; all outputs use the successful evaluation date; stale event handlers cannot print/export | app.test.mjs: load, open draft, print, clear date, reject output, recover, change date without input event |
| Parser lost explicit Acts | Known Act labels/years normalize before unsupported-law checks; unambiguous Act context spans &/+; semicolon groups remain separate; unlabelled mixed-Act charges remain unresolved | parser.test.mjs: prefix/postfix Act, NDPS Act 1985, unsupported/mixed Acts |
| CSV omitted the review date | Every exported row includes review_date from its own asOfDate | csv.test.mjs: two rows with distinct review dates |

Before changing application code, the targeted new/existing tests produced **109 tests, 93 passed, 16 failed**. The failures covered all four findings. After fixes and additional boundary checks, **npm test: 115 passed, 0 failed**. All seven source modules passed Node syntax checks. No dependencies were added.

The UI test uses a small test-only DOM/event adapter. It verifies application state and event handling; it is not browser rendering, actual print preview or operator acceptance evidence. Those visual checks were pending at this batch close. A subsequent user-authorized run completed actual browser and native print-preview checks; see BROWSER_QA_20261115.md.

## Preserved source data and changed expectations

The 151 reference rows, including every numerical penalty, are unchanged. The original 40-row synthetic CSV is unchanged. Its expected results changed: SYN-009 through SYN-017 now require review because BNS 303(2) repeat-penalty conditions are unresolved. Counts at 2026-11-14 are:

| Outcome | Count |
| --- | ---: |
| Outer limit | 2 |
| Application due | 6 |
| Conditional first-time verification | 0 |
| Due within 60 days | 0 |
| Legal review needed | 16 |
| Not yet due | 7 |
| Other pending cases | 4 |
| Death / life exclusion | 5 |

Women with application-due / outer-limit alerts remain 3. Generic half-term and conditional-draft tests now use the supplied fixed 36-month BNS 85 row, while explicit BNS 303(2)/78(2) regression cases assert review holds. The old sample decisions were not preserved by weakening the new gates or changing the sample charges.

## Handoff

The original review ZIP remains intact. A separately named fixed-source package and manifest are recorded in BUILD_STATE.json. Controller handoff is saved in CONTROLLER_REPORT.md under the existing instruction to avoid repeating the previously refused outgoing-message attempt. Publication, real AgentFoundry evidence, the full primary-law audit and visual acceptance remain separate project requirements.
