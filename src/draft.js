export function draftApplication(result) {
  if (!result.canDraft) throw new Error('Resolve legal-review issues before preparing an application.');
  return buildDraft(result, false);
}
export function draftCourtReview(result) {
  if (!result.canRequestCourtReview) throw new Error('Court-review requests require a due reference threshold, one recorded case, zero recorded other cases, and only the multiple-offence issue.');
  return buildDraft(result, true);
}
function buildDraft(result, courtReview) {
  const p = result.person, value = v => String(v || '[ ]');
  const conditional = result.status === 'ELIGIBLE_IF_FIRST_TIME_VERIFIED';
  const outer = result.status === 'OUTER_LIMIT';
  const title = courtReview ? 'REQUEST FOR COURT DETERMINATION OF SECTION 479(2), BNSS, 2023' : 'APPLICATION UNDER SECTION 479(3) OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023';
  const lines = [
    'DRAFT — verify against case records before filing', title,
    `To: The Court of ${value(p.court)}`, `In: ${value(p.case_no)}`, `From: The Superintendent, ${value(p.prison)}`,
    `Concerning ${value(p.name)}, roster ID ${value(p.prisoner_id)}, recorded in custody since ${value(p.custody_start)}.`,
    'The recorded charges and stated penalties are: ' + result.charges.map(c => `${c.act} ${c.section}: ${c.statute?.maxMonths ?? '[verify]'} months maximum`).join('; ') + '.',
    `The largest resolved term is ${result.maxMonths} months (${result.fullTermDays} calendar days from the recorded custody start). Accused-caused delay recorded: ${result.excludedDelayDays} days. Counted custody at ${result.asOfDate}: ${result.daysCounted} days.`,
    courtReview ? `The roster lists these charges together under case ${value(p.case_no)}. Recorded first-time status: ${result.firstTime}. The reference ${result.firstTime === 'yes' ? 'one-third' : 'one-half'} date is ${result.thresholdDate}. The Court is requested to determine whether section 479(2) ('more than one offence') applies to these charges in the recorded case, and to consider appropriate orders under section 479 after verifying the case records. The status remains LEGAL REVIEW NEEDED. This request does not assert eligibility for release or treat several charges as one offence.` : outer ? `The listed-case maximum-term reference date under the third proviso to section 479(1) is ${result.dates.outer}. The Court is requested to examine the current-case outer-limit position and pass appropriate orders. This draft makes no finding about continued detention under any other case or remand order.` : conditional ? `The one-third date is ${result.dates.third}; the one-half date is ${result.dates.half}. Prior conviction status is UNKNOWN. Subject to verification that the person has never been convicted of any offence and that no section 479(2) bar applies, the Court is requested to consider release on bond under the first proviso to section 479(1).` : `Recorded first-time status: ${result.firstTime}. The ${result.firstTime === 'yes' ? 'one-third' : 'one-half'} threshold date is ${result.thresholdDate}. Upon verification of the charges, custody, antecedents and pending proceedings, the Court is requested to proceed under section 479(1) for ${result.firstTime === 'yes' ? 'release on bond' : 'bail'}.`,
    `Other pending cases according to supplied records: ${result.otherPendingCases === null ? '[unknown — verify e-Prisons / ICJS]' : result.otherPendingCases}.`,
    ...result.flags.map(f => 'For verification: ' + f),
    'The Court retains its powers under the second proviso after hearing the Public Prosecutor and recording reasons. This is a record-based draft for review, not a release order.',
    'Verification checklist: [ ] Current/amended charges and applicable punishment; [ ] Prior convictions; [ ] Other pending cases/offences and remand orders; [ ] Accused-caused delay and custody calculation.',
    'Superintendent signature: ____________________', 'Date: ____________________'
  ];
  return { title, lines };
}
