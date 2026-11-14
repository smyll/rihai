# Primary-source review — 15 November 2026

## Problem size and reporting scope

The full [NCRB Prison Statistics India 2024 report](https://www.ncrb.mha.gov.in/uploads/files/PSI-2024ason260220261.pdf) was downloaded and read locally. The population table and release summary were also rendered and visually checked.

- Printed page xi (PDF page 23): 511,542 prisoners at 31 December 2024, including 371,440 undertrials (72.6%). NCRB carried forward West Bengal's 2023 data because its 2024 data were not received.
- Printed page xviii (PDF page 30) and page 168 (PDF page 218): 627 releases during 2024 are reported under **BNSS 479 / CrPC 436A combined**. The review's description of all 627 as BNSS 479 releases is too narrow.
- No implementation percentage is calculated by dividing annual releases by year-end undertrial stock. Those are different populations and time measures.
- These are national context figures, not evidence of Rihai deployment or impact.

Local full report: `.local/sources/PSI-2024.pdf`, SHA256 `4f82f813fe1fb36d7a8ec07a0d81891662aabb1933b0c8129719a5d29346cdb4`. Local source material is excluded from release by `.gitignore`.

## Legal corrections supported by the checked text

1. **Outer limit and multiple offences.** The text of 479(2) retains the third-proviso qualification. The [Supreme Court order of 19 November 2024](https://api.sci.gov.in/supremecourt/2013/18545/18545_2013_4_10_57306_Order_19-Nov-2024.pdf) reproduces it in the official indexed text; the PDF is retained locally. This supports correcting an engine issue that hides a fully resolved finite current-case outer limit solely because several substantive charges are listed. It does not establish a general holding that several offences in one FIR are outside 479(2).
2. **Homicide limbs.** [IPC 304](https://www.indiacode.nic.in/bitstream/123456789/15289/1/ipc_act.pdf) distinguishes intention and knowledge limbs. [BNS 105 in NCRB's official statutory text](https://www.ncrb.mha.gov.in/uploads/SankalanPortal/ChaptersBNS.html) also distinguishes them. The knowledge-only limb has a ten-year finite maximum; the intention limb can carry life. Bare section references do not identify the limb. The new BNS `105-I` / `105-II` labels are internal parser aliases, not statutory subsection numbering.
3. **General multiple-offence policy.** The reviewed primary text does not support automatically clearing every same-case multiple-offence record for the fractional-term route. Keep that question visible for legal determination. Do not convert a commentator's preferred workflow into a verified judicial interpretation.

The homicide checks used official indexed statutory text. A later direct retrieval of the MHA PDF URL returned 404, and an India Code PDF retrieval timed out; the available source and access limitation are recorded rather than claiming every linked PDF was fully downloaded. This is a targeted check of the changed rules, not a certification of the entire reference table.

## Competition wording

The [live official competition page](https://codeforindia.org/hackathon) lists **Timely Justice — Legal Backlog** and gives four equally weighted criteria: size, severity, quality, and proven impact. National problem statistics support context; they do not replace actual deployment evidence for the impact criterion.

The official page lists **15 November 2026** without a clock time or time zone. An assumed Indian end-of-day conversion must not be stated as an official cutoff.
