# Code for a Billion — submission draft

Not submitted. Publication and actual AgentFoundry use must be completed and accurately documented before using this draft.

## Team / Project name

Rihai

## Team members

[Entrant to confirm preferred public name. Solo project.]

## Problem statement

Prison offices and legal-aid teams need to review custody records against the charge-specific thresholds in Section 479 BNSS. Charges, prior convictions, other proceedings and excluded delay can change the action required, and incomplete records must be identified rather than silently treated as eligible. Rihai turns a roster into an auditable review queue and record-based application drafts, with explicit legal-review gates.

## What you built

A dependency-free static web application that imports CSV rosters, resolves a bounded English/Hindi charge vocabulary, calculates UTC calendar thresholds, shows record-level reasoning, and prepares conditional Superintendent application drafts. It exports a spreadsheet-safe review CSV and a printable UTRC meeting pack. No AI model makes custody decisions; no roster is uploaded or stored persistently.

Current implementation: local Codex development, 151 supplied penalty-reference entries, 40 synthetic records and 115 passing software tests. The offence table is not yet independently certified. Multiple substantive charges and unresolved legal conditions require review rather than an automatic application-due result. No real-person legal assessment has been performed.

AgentFoundry use: **NOT YET VERIFIED. Replace only with actual IDE/model/terminal work and its evidence.**

## GitHub repository URL

[Not published — pending authorization.]

## Demo URL

[Not deployed — pending authorization.]

## Scale and severity

The Ministry of Home Affairs implementation advisory describes the need to identify undertrial prisoners for Section 479 applications: https://origin1504-mha.nic.in/sites/default/files/Advisory%28BNSS%29_17102024.pdf . The section establishes fractional-term review and application duties, with exclusions and qualifications: https://cytrain.ncrb.gov.in/staticpage/web_pages/ChaptersBNSS.html .

No national prisoner-count or release-rate statistic from the supplied brief has been independently rechecked for this draft. Do not insert those values as established facts without verification. No number of people reached or benefited by Rihai is claimed.

## Deployment and impact data

Local prototype only. No public deployment, external trial, filed application or release outcome. A prospective one-month DLSA clinic pilot would follow legal and privacy review; no partner has agreed. Track flagged records, filed applications, court outcomes and time to filing.

## Track

Governance (verify the live official form still uses this option).

## Contact email


