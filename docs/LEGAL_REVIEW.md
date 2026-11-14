# Calculation policy and evidence

Updated 2026-11-15. This is the calculation and drafting policy for the prototype. The original supplied specification is preserved separately in `incoming/`; the pre-review version is also retained in the baseline archive and commit `27c7504`.

## Primary sources checked

- NCRB BNSS text, section 479: https://cytrain.ncrb.gov.in/staticpage/web_pages/ChaptersBNSS.html . The section was located in the official text; later page fetches timed out.
- Bureau of Police Research and Development, BNSS compendium, chapter XXXV: https://bprd.nic.in/uploads/pdf/Final_BNSS.pdf . Official indexed text confirms the fractional-term route and the court's continued-detention proviso.
- Ministry of Home Affairs advisory, 16 October 2024: https://origin1504-mha.nic.in/sites/default/files/Advisory%28BNSS%29_17102024.pdf . Confirms first-time and half-term workflow and the implementation direction.
- Ministry of Home Affairs / PIB, 30 July 2024: https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2039055&lang=2&reg=48 . BNS commencement excepted section 106(2).
- Supreme Court judgment dated 11 December 2025, official indexed quotation of section 479: https://api.sci.gov.in/supremecourt/2023/27175/27175_2023_11_1501_66758_Judgement_11-Dec-2025.pdf . The indexed quotation expressly retains the third-proviso qualification in 479(2). Full PDF retrieval timed out, so no holding from this case is asserted here.

## Deliberate corrections to the supplied sketch

1. **Multiple substantive offences in one case:** section 479(2) expressly names more than one offence. Before the outer limit, the status remains `NEEDS_REVIEW`. If its sole unresolved issue is this provision, the reference fractional threshold has passed, a case number is recorded, and other pending cases are recorded as zero, the user can prepare a separate **court-determination request**. Its text asks the court to determine 479(2) and explicitly retains legal-review status; it does not claim eligibility. Other unresolved issues still prevent this request. The user selected this workflow on 15 November 2026. A fully resolved finite current-case outer limit is preserved despite multiple charges because 479(2) remains subject to the third proviso. Test m retains 1,095 days and 2025-03-15, while keeping legal-review status.
2. **Other cases and the outer limit:** an `OUTER_LIMIT` result concerns the listed case and its resolved term only. The third proviso cannot be presented by this app as discharging a different case's detention order. The draft requests examination of the current-case position and verification of other remand orders.
3. **BNS 317 without a subsection:** the supplied table contains 317(2), (3), (4) and (5), with materially different penalties. It is ambiguous and is not auto-mapped to 317(2).
4. **BNS 106(2):** preserved as supplied in the reference table, but an engine review gate requires confirmation of current commencement. The 2024 notification excepted it; no later commencement is claimed.
5. **Unknown prior convictions:** where the penalty is otherwise resolved, the conditional draft asks for verification. It never states that an unknown person has no convictions. For BNS 303(2) / 78(2), a prior conviction or unknown history instead triggers repeat-penalty review and prevents a draft.
6. **Product language:** “application due” and “women: application due / outer limit” replace language promising release or declaring entitlement.
7. **Conditional punishment:** BNS 303(2) / 78(2) use the supplied base term only when first-time status is recorded as yes. Otherwise the roster cannot rule out repeat-offence enhancement, so results are held for review. BNS 309(4) / IPC 392 and BNS 110 / IPC 308 always require review because highway/night and hurt/no-hurt facts are absent from the roster. Reference dates do not authorize a draft or outer-limit action while these issues remain unresolved.
8. **Homicide punishment limbs:** bare IPC 304 and BNS 105 require verification of the limb. Explicit intention/Part I references carry the life exclusion; knowledge-only/Part II references use a ten-year finite maximum. `105-I` and `105-II` are internal BNS aliases, not numbered statutory subsections. Parser variants preserve Roman numerals, avoid partial matches of Part III and retain the existing IPC 506(2) alias.
9. **Applicable-law mismatch:** a BNS charge paired with continuous custody starting before 1 July 2024 requires record review. A later custody date for an IPC offence can reflect an older offence and produces a verification flag rather than an automatic hold.
10. **Review urgency:** within legal-review records, reference outer-limit calculations appear first, then other reference statuses and unresolved records. The page labels these calculations as reference only. The CSV retains both actual and reference statuses, plus a separate court-request availability flag.

## Date and penalty assumptions

Arithmetic uses UTC calendar days, end-of-month clamping for added months, rounded-up fractional days and the supplied accused-caused delay. The custody-start date is the start of continuous custody attributable to the listed case, not necessarily first arrest across other cases. Changes of custody, amended charges, concurrent proceedings, state variations and special-law interactions require case-record review.

The original 151 entries were transcribed from the supplied table. The targeted review split the two ambiguous homicide entries into explicit limbs by adding four aliases, producing 155 reference entries. The changed homicide entries include primary-source URLs. This is a targeted correction, not a row-by-row independent audit; the other conditional-penalty gates remain based on the supplied table. Unresolved conditional penalties, unsupported acts and dependent provisions are routed to review. Local applicability must be verified.

Population and release context now comes from the full NCRB 2024 report. Its release count combines BNSS 479 with CrPC 436A. Source scope, access limitations and the distinction from Rihai impact are recorded in [the primary-source audit](PRIMARY_SOURCE_AUDIT_20261115.md). No AI service is used at runtime.
