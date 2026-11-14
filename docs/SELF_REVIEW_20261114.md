# Rihai specification and implementation self-review

Requested after the first local batch. Review only; no application code changed. Current session filesystem/network access is unrestricted; previous browser-origin and outbound-thread restrictions have not been retested. Scope: a single operator, synthetic roster, no deployed service.

## Must fix

1. **Conditional enhanced punishment does not gate actionable results.** `src/engine.js:39` turns non-review notes into flags, then lines 65–77 still permit an application. With BNS 303(2) or 78(2), custody 2024-07-01, first_time=no, other_pending_cases=0, asOf=2026-11-14, the engine returns maxMonths=36, threshold=2025-12-31, ELIGIBLE_NOW, canDraft=true, no issues. The supplied table itself warns of a possible five-year punishment for repeat convictions. A five-year half-term reference is 2026-12-31. Prior offence type is not represented by a structured field, so the engine lacks the information needed to rule out that alternative. Route unresolved enhanced-penalty conditions to review or require explicit verified facts before using the base term. Review other conditional-penalty notes as well.

2. **Invalid review date leaves actionable old results.** `src/app.js:12–18` returns on a blank/invalid date without clearing or disabling previous results, export or meeting-pack controls. The meeting-pack header later uses the current date control, while its counts and drafts use old result objects. Concrete flow: load the sample; clear the date; change focus; print the meeting pack. The code permits a header/result mismatch. This was traced from the event handlers, not observed in a real browser. Invalidate the output controls/results until the date is valid, or bind every output and heading to one successfully evaluated date.

## Should fix

3. **Parser loses valid act context.** Reproduced with direct Node calls: `NDPS Act 21(a)` returns an unsupported-act error, while `NDPS 21(a)` resolves correctly. `IPC 323 & 506` with custody 2025-01-01 resolves 323 as IPC but attempts BNS 506; the comma version retains IPC. Normalize known full act names before unknown-act detection, and retain explicit act context across conjunctions. Preserve the review gate when the actual act remains ambiguous.

4. **Export omits the review date.** The exported columns contain counted custody and decision status but no as-of date. A reproduced export from an evaluation on 2026-11-14 contains no such date. Add an explicit review-date column from each result, so the CSV is auditable independently of its filename.

## Specification comparison

- Present in source: static ES modules, no runtime dependencies, deterministic arithmetic, memory-only roster processing, CSV import/export, English/Hindi aliases, 151 supplied reference rows, 40 synthetic records, conditional application drafts, meeting-pack printing code, MIT license, test workflow and English submission draft.
- Existing 92 passing tests do not cover the above adversarial cases or real browser behavior. No repeat of unchanged tests was used as evidence against the demonstrated defects.
- Deliberate differences already recorded in LEGAL_REVIEW.md: multi-offence cases held for review; ambiguous BNS 317 not guessed; BNS 106(2) commencement gate; current-case outer-limit wording; conditional unknown-conviction draft. Sample review count is seven rather than five because of the multi-charge holds.
- Still incomplete: full primary-law penalty audit, actual AgentFoundry development evidence, desktop/mobile/print visual verification and screenshot, authorized public repository/deployment and live checks. Therefore this remains a reviewable local prototype, not a submission-ready entry.

Verdict: fix 1 and 2 before treating records as actionable; fix 3 and 4 before a user trial or submission demonstration.

## Follow-up after user-authorized fixes

All four findings above have been addressed in source. The original review text is retained as the pre-fix record. See FIX_RECORD_20261114.md for the changes, reproduction tests, sample-count correction and remaining visual checks. The full suite now passes 115 tests; this does not replace actual browser/print verification.
