# Calculation policy and evidence

Reviewed 2026-11-14. This is a bounded prototype policy for synthetic demonstrations, not a certified screening service. The original supplied specification is preserved separately in `incoming/` and excluded from release.

## Primary sources checked

- NCRB BNSS text, section 479: https://cytrain.ncrb.gov.in/staticpage/web_pages/ChaptersBNSS.html . The section was located in the official text; later page fetches timed out.
- Bureau of Police Research and Development, BNSS compendium, chapter XXXV: https://bprd.nic.in/uploads/pdf/Final_BNSS.pdf . Official indexed text confirms the fractional-term route and the court's continued-detention proviso.
- Ministry of Home Affairs advisory, 16 October 2024: https://origin1504-mha.nic.in/sites/default/files/Advisory%28BNSS%29_17102024.pdf . Confirms first-time and half-term workflow and the implementation direction.
- Ministry of Home Affairs / PIB, 30 July 2024: https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2039055&lang=2&reg=48 . BNS commencement excepted section 106(2).
- Supreme Court judgment dated 11 December 2025, official indexed quotation of section 479: https://api.sci.gov.in/supremecourt/2023/27175/27175_2023_11_1501_66758_Judgement_11-Dec-2025.pdf . The indexed quotation expressly retains the third-proviso qualification in 479(2). Full PDF retrieval timed out, so no holding from this case is asserted here.

## Deliberate corrections to the supplied sketch

1. **Multiple substantive offences in one case:** section 479(2) expressly names more than one offence. The prototype retains arithmetic as a reference, but sets `NEEDS_REVIEW`, with no routine application button. It does not adopt the sketch's unqualified application-due interpretation. Test m retains 1,095 days and 2025-03-15 but changes the status; this is disclosed rather than called full specification conformance.
2. **Other cases and the outer limit:** an `OUTER_LIMIT` result concerns the listed case and its resolved term only. The third proviso cannot be presented by this app as discharging a different case's detention order. The draft requests examination of the current-case position and verification of other remand orders.
3. **BNS 317 without a subsection:** the supplied table contains 317(2), (3), (4) and (5), with materially different penalties. It is ambiguous and is not auto-mapped to 317(2).
4. **BNS 106(2):** preserved as supplied in the reference table, but an engine review gate requires confirmation of current commencement. The 2024 notification excepted it; no later commencement is claimed.
5. **Unknown prior convictions:** where the penalty is otherwise resolved, the conditional draft asks for verification. It never states that an unknown person has no convictions. For BNS 303(2) / 78(2), a prior conviction or unknown history instead triggers repeat-penalty review and prevents a draft.
6. **Product language:** “application due” and “women: application due / outer limit” replace language promising release or declaring entitlement.
7. **Conditional punishment:** BNS 303(2) / 78(2) use the supplied base term only when first-time status is recorded as yes. Otherwise the roster cannot rule out repeat-offence enhancement, so results are held for review. BNS 309(4) / IPC 392 and BNS 110 / IPC 308 always require review because highway/night and hurt/no-hurt facts are absent from the roster. Reference dates do not authorize a draft or outer-limit action while these issues remain unresolved.

## Date and penalty assumptions

Arithmetic uses UTC calendar days, end-of-month clamping for added months, rounded-up fractional days and the supplied accused-caused delay. The custody-start date is the start of continuous custody attributable to the listed case, not necessarily first arrest across other cases. Changes of custody, amended charges, concurrent proceedings, state variations and special-law interactions require case-record review.

All 151 reference rows are transcribed from the supplied table without changing their numerical penalties. This is **not** a row-by-row independent legal audit. The conditional-penalty gates above are based on conditions already noted in that table; they do not certify its completeness. Unresolved conditional penalties, unsupported acts and dependent provisions are routed to review. No national jurisdictional coverage is asserted: local applicability must be verified.

No external population or release statistics have been repeated as verified facts. The supplied secondary-source numbers remain outside the product claims until independently checked. No AI service is used at runtime.
