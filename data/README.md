# Synthetic roster

All 40 people, ages, facilities, courts and case identifiers are fictional. No actual prison or personal records are included. The sample was designed for the fixed review date 2026-11-14. Changing that date changes the counts.

- OUTER_LIMIT: 2
- ELIGIBLE_NOW: 6
- ELIGIBLE_IF_FIRST_TIME_VERIFIED: 0
- DUE_SOON: 0
- NEEDS_REVIEW: 16
- NOT_YET: 7
- BARRED_479_2: 4
- EXCLUDED: 5

Women with application-due or current-case outer-limit alerts: 3.

The original sample CSV is unchanged. The initial local version held seven rows for review, including two multi-offence examples. After the conditional-penalty fix, SYN-009 through SYN-017 also require review: all nine use BNS 303(2) with prior convictions present or unknown. Their previously reported conditional/due-soon statuses relied on an unresolved base term. Review therefore totals 16, with no conditional or due-soon examples in this particular roster at this date. Those two status paths remain covered separately with resolved-penalty fixtures in the engine tests. Old IPC dates do not prevent processing under the BNSS custody-review workflow.
