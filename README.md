# Rihai — रिहाई

Rihai helps prison offices, Undertrial Review Committees and legal-aid teams identify custody thresholds for Section 479 BNSS review, inspect the calculation for every record and prepare a Superintendent's application draft.

**Status:** public prototype, submitted to Code for a Billion on 15 November 2026. [Try the live demo](https://smyll.github.io/rihai/) · [Official submission #142](https://github.com/karlmehta/code-for-a-billion/issues/142) · [158-test CI run](https://github.com/smyll/rihai/actions/runs/43630206168).

The prototype includes 40 unchanged fictional sample records and an actual AgentFoundry SMART-Code repair pass. See the [review acceptance record](docs/REVIEW_ACCEPTANCE_20261115.md), [AgentFoundry usage record](docs/AF_USAGE_20261115.md) and [public release receipt](docs/PUBLIC_RELEASE_20261115.md).

![Rihai with the actual 40-record synthetic roster loaded](docs/qa-20261114/desktop-loaded.jpg)

## The problem

At 31 December 2024, India held 511,542 prisoners, including 371,440 undertrials (72.6%). NCRB also reported 627 releases during 2024 under **BNSS 479 / CrPC 436A combined**. Its report carried forward West Bengal's 2023 data where 2024 data were unavailable. These figures describe the national context. [NCRB, Prison Statistics India 2024, pp. xi and xviii](https://www.ncrb.mha.gov.in/uploads/files/PSI-2024ason260220261.pdf).

Identifying a custody deadline requires combining the charges, maximum punishment, continuous custody, prior convictions, other proceedings and excluded delay. The [Ministry of Home Affairs implementation advisory](https://origin1504-mha.nic.in/sites/default/files/Advisory%28BNSS%29_17102024.pdf) asks prison authorities to identify relevant undertrial prisoners and move applications. Rihai supports that record-review and application-preparation workflow. See the [source checks and reporting scope](docs/PRIMARY_SOURCE_AUDIT_20261115.md).

## What Rihai does

1. Import a roster CSV or load 40 clearly fictional sample records.
2. Review one-third, one-half and current-case outer-limit dates, urgency, calculation traces and unresolved issues.
3. Prepare a conditional application draft, export the review CSV, or print a UTRC meeting pack including records needing review and actionable drafts.

The roster is processed only in browser memory. No backend, account, AI service or browser storage is used. Only the public synthetic sample is fetched. Imported fields are displayed as text; CSV export neutralizes leading spreadsheet formula characters.

## How the rules work

| Case | Prototype action |
| --- | --- |
| Resolved finite sentence, verified first-time status | Calculate the rounded-up one-third date |
| Other / unknown conviction history | Calculate the rounded-up one-half date and also show one-third |
| Unknown first-time status after one-third but before one-half, resolved penalty | Request verification; draft is explicitly conditional |
| Death or life punishment specified | Exclude the fractional-term route |
| Other pending cases before the current-case outer limit | Flag section 479(2) |
| Multiple substantive offences in one case | Keep legal-review status; a due, otherwise resolved record can draft a separate request for court determination of 479(2) |
| Fully resolved finite current-case maximum reached | Preserve the outer-limit alert, including multiple charges; verify other remand orders |
| IPC 304 / BNS 105 | Verify the limb; explicit knowledge-only limb uses ten years, intention limb carries life |
| Unknown act/subsection, dependent or conditional penalty | Require review; show only resolved reference dates |
| BNS 303(2) / 78(2), prior convictions present or unknown | Hold for repeat-penalty review; no application draft |

Rules calculate the thresholds; no model decides a person's eligibility. A person verifies the records and the court determines the application. The reference penalty table is transcribed from the supplied project brief, not independently certified row by row. Unresolved repeat-theft/stalking, highway-robbery and hurt/no-hurt penalty conditions block actionable results; displayed dates remain references. See [legal evidence, assumptions and documented changes](docs/LEGAL_REVIEW.md).

Calendar arithmetic uses UTC days and clamps month-end anniversaries. The date field means the start of continuous custody attributable to the listed case. The prototype does not reconcile interrupted detention or different remand periods across cases.

## Try it locally

Use Node.js 24 for tests. There are no packages to install and no build step.

```sh
npm test
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Select **Load sample roster**, use review date **2026-11-14**, expand **Show reasoning**, then open **Draft application** on an actionable row. All asset paths are relative so the application can also run below a static hosting subpath.

The public demo is https://smyll.github.io/rihai/ . The development preview is `http://127.0.0.1:5197/rihai/` while its local preview process is running.

## Roster format

| CSV column | Meaning |
| --- | --- |
| prisoner_id | Unique local roster identifier |
| name | Record display name |
| gender, age | Supplied demographic fields; gender supports the women-focused review count |
| prison, court, case_no | Draft addressee and recorded case details; missing draft details remain placeholders |
| charges | Explicit legal act and charge subsections preferred; English and documented Hindi aliases supported |
| custody_start | YYYY-MM-DD, continuous listed-case custody start |
| first_time | yes / no / unknown, meaning never convicted of any offence previously |
| other_pending_cases | Non-negative integer or unknown |
| excluded_delay_days | Non-negative whole days attributable to accused-caused procedural delay; blank means zero |
| notes | Local record notes, preserved in export |

All columns are required. Invalid custody, delay and conviction/pending-case fields route the record to review. CSV quoting supports embedded commas, escaped quotes, newlines and UTF-8 BOMs. Unknown law is not silently discarded. Act inference from custody date is only a flagged fallback; the offence date and FIR control verification.

Exports include a `review_date` column from each evaluated record. Clearing or invalidating the review date clears old results, drafts and print content, and disables output controls until recalculation. Explicit Acts are retained across joined charges such as `IPC 323 & 506`; known Act labels such as `NDPS Act 21(a)` are supported. Ambiguous mixed-Act groups remain unresolved.

## Statute table

`src/statutes.js` contains the original 151 BNS, IPC and NDPS reference entries plus four explicit homicide-limb aliases, for 155 entries. The two bare homicide sections now require limb verification. BNS 317 is not automatically mapped because its subsections have materially different penalties. Targeted changes and their sources are described in [the legal policy](docs/LEGAL_REVIEW.md).

Before adding or certifying a row, a qualified reviewer should check the current statute, punishment limb, commencement, prior-conviction enhancements, jurisdiction and interaction with special-law bail conditions. The [NCRB BNSS compendium](https://cytrain.ncrb.gov.in/staticpage/web_pages/ChaptersBNSS.html) and [BPRD publication](https://bprd.nic.in/uploads/pdf/Final_BNSS.pdf) provide the procedural source; the individual offence rows still need a complete primary-law audit before operational use. Changes need tests for both clear and unresolved cases.

## Built with AgentFoundry

The prototype was first built locally with Codex. On 15 November 2026, the existing project was opened in AgentFoundry 0.1.80 and SMART-Code read the source/tests and wrote initial parser and BNS 105 changes. That task stopped at AF's ten-round tool-use cap. Codex preserved its original patch, completed the remaining fixes, corrected parser compatibility issues, added independent regression tests and ran the tests separately. [Actual usage and evidence scope](docs/AF_USAGE_20261115.md).

## Deployment and pilot plan

The prototype is publicly hosted on GitHub Pages, with MIT licensing and a Node test workflow. No real prisoner records, field pilot, partner agreement, filed application or release outcome has been used or measured.

A possible future pilot is a month with a DLSA prison legal-aid clinic, after a qualified legal audit and a privacy assessment. There is no existing partner. Intended measures are records flagged, applications actually filed, court outcomes and elapsed time from identification to filing; none are current results.

## Verification

`npm test` passes 158 tests covering parsing, calendar/date boundaries, prior-conviction uncertainty, conditional penalties, outer-limit scope, 479(2) drafting gates, CSV safety and UI invalidation. Event-state tests use a minimal test-only DOM adapter. The [15 November review acceptance](docs/REVIEW_ACCEPTANCE_20261115.md) also records actual Edge import of six independent fictional regression cases, the downloaded CSV, the court-request dialog, a 390 CSS-pixel width check and native print previews. The new court request fits one portrait page. The original 40-row meeting pack now has 13 pages, including eight normal applications and two court-determination requests.

The original sample CSV is unchanged: two outer-limit alerts, six application-due records and sixteen legal-review records. Two of those review records now offer the separate court-determination request, while the nine unresolved repeat-penalty examples remain held for record review. Earlier browser evidence is retained in its dated [acceptance record](docs/BROWSER_QA_20261115.md).

## License

[MIT](LICENSE).
