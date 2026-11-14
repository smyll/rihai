# Code for a Billion — submission draft

Not submitted. AgentFoundry usage is recorded; public repository, deployment and entrant details must be completed before submission.

## Team / Project name

Rihai

## Team members

[Entrant to confirm preferred public name. Solo project.]

## Problem statement

Prison offices and legal-aid teams need to review custody records against the charge-specific thresholds in Section 479 BNSS. Charges, prior convictions, other proceedings and excluded delay can change the action required, and incomplete records must be identified rather than silently treated as eligible. Rihai turns a roster into an auditable review queue and record-based application drafts, with explicit legal-review gates.

## What you built

A dependency-free static web application that imports CSV rosters, resolves a bounded English/Hindi charge vocabulary, calculates UTC calendar thresholds, shows record-level reasoning, and prepares conditional Superintendent application drafts. It exports a spreadsheet-safe review CSV and a printable UTRC meeting pack. No AI model makes custody decisions; no roster is uploaded or stored persistently.

Current implementation: Codex development with an actual AgentFoundry SMART-Code repair pass, 155 reference entries (151 supplied entries plus four explicit homicide-limb aliases), 40 unchanged fictional records and 158 passing tests. Multiple substantive charges retain legal-review status; otherwise resolved due records can prepare a separate request asking the court to determine 479(2). Unresolved penalties still require review. The reference table has received targeted corrections rather than a complete legal audit.

AgentFoundry use: the existing Rihai project was opened in AF 0.1.80 on 15 November 2026. SMART-Code read the source and tests and wrote initial parser/BNS 105 edits, then stopped at its ten-round tool-use cap. Codex preserved that patch and completed the fixes and independent tests outside AF. See AF_USAGE_20261115.md. Do not describe the project as built entirely inside AF or claim an AF terminal test run.

## GitHub repository URL

[Not published — pending authorization.]

## Demo URL

[Not deployed — pending authorization.]

## Scale and severity

The Ministry of Home Affairs implementation advisory describes the need to identify undertrial prisoners for Section 479 applications: https://origin1504-mha.nic.in/sites/default/files/Advisory%28BNSS%29_17102024.pdf . The section establishes fractional-term review and application duties, with exclusions and qualifications: https://cytrain.ncrb.gov.in/staticpage/web_pages/ChaptersBNSS.html .

NCRB's Prison Statistics India 2024 reports 511,542 prisoners at 31 December 2024, including 371,440 undertrials (72.6%). The report records 627 releases during 2024 under BNSS 479 / CrPC 436A combined. West Bengal's 2023 data were carried forward where 2024 data were unavailable. These national context figures are distinct from Rihai's deployment outcomes. Source: https://www.ncrb.mha.gov.in/uploads/files/PSI-2024ason260220261.pdf , printed pages xi and xviii. The full report and rendered source pages were checked; see PRIMARY_SOURCE_AUDIT_20261115.md.

## Deployment and impact data

Local prototype only. No public deployment, external trial, filed application or release outcome. A prospective one-month DLSA clinic pilot would follow legal and privacy review; no partner has agreed. Track flagged records, filed applications, court outcomes and time to filing.

## Track

Timely Justice — Legal Backlog (listed on the live official competition page checked 15 November 2026).

## Contact email


