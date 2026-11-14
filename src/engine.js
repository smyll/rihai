import { parseCharges } from './parser.js';
import { lookup, modifiers, dependent } from './statutes.js';
import { date, iso, days, addDays, addMonths } from './dates.js';

export const STATUS_ORDER = ['OUTER_LIMIT', 'ELIGIBLE_NOW', 'ELIGIBLE_IF_FIRST_TIME_VERIFIED', 'DUE_SOON', 'NEEDS_REVIEW', 'NOT_YET', 'BARRED_479_2', 'EXCLUDED'];
export const LABELS = { OUTER_LIMIT: 'Outer-limit alert', ELIGIBLE_NOW: 'Application due', ELIGIBLE_IF_FIRST_TIME_VERIFIED: 'Verify first-time status', DUE_SOON: 'Due within 60 days', NEEDS_REVIEW: 'Legal review needed', NOT_YET: 'Not yet due', BARRED_479_2: 'Other pending cases', EXCLUDED: 'Death / life exclusion' };
// These conditions are noted in the supplied table but absent from roster fields.
const repeatPenalties = new Set(['BNS:303(2)', 'BNS:78(2)']);
const circumstancePenalties = new Set(['BNS:309(4)', 'IPC:392', 'BNS:110', 'IPC:308']);
export function evaluate(row, asOfDate) {
  const result = { person: { ...row }, asOfDate, status: 'NEEDS_REVIEW', flags: [], reasoning: [], issues: [], dates: {}, canDraft: false };
  let start, asOf, delay, pending;
  try {
    start = date(row.custody_start); asOf = date(asOfDate);
    if (+start > +asOf) throw new Error('Custody start is after the review date.');
    const rawDelay = String(row.excluded_delay_days ?? '').trim();
    if (rawDelay && !/^\d+$/.test(rawDelay)) throw new Error('Excluded delay must be a non-negative whole number of days.');
    delay = rawDelay ? Number(rawDelay) : 0;
    if (!Number.isSafeInteger(delay) || delay > days(start, asOf)) throw new Error('Excluded delay exceeds elapsed custody or is invalid.');
    const rawPending = String(row.other_pending_cases ?? '').trim().toLowerCase();
    if (rawPending !== 'unknown' && !/^\d+$/.test(rawPending)) throw new Error('Other pending cases must be a non-negative integer or unknown.');
    pending = rawPending === 'unknown' ? null : Number(rawPending);
    if (pending !== null && !Number.isSafeInteger(pending)) throw new Error('Other pending cases count is invalid.');
    const first = String(row.first_time ?? '').trim().toLowerCase();
    if (!['yes', 'no', 'unknown'].includes(first)) throw new Error('First-time status must be yes, no or unknown.');
    result.firstTime = first;
  } catch (error) { result.issues.push(error.message); result.reasoning.push(error.message); return result; }
  result.daysCounted = days(start, asOf) - delay;
  result.excludedDelayDays = delay;
  result.otherPendingCases = pending;
  const parsed = parseCharges(row.charges, row.custody_start);
  result.parsed = parsed;
  result.flags.push(...parsed.flags);
  result.issues.push(...parsed.unknown);
  const charged = parsed.items.filter(i => !modifiers[i.act].includes(i.section));
  result.charges = charged.map(i => ({ ...i, statute: lookup(i.act, i.section) }));
  for (const item of charged) {
    const r = lookup(item.act, item.section);
    if (dependent[item.act].includes(item.section)) result.issues.push(`${item.act} ${item.section}: dependent, conspiracy, abetment or attempt provision needs the object offence.`);
    if (r?.review) result.issues.push(`${r.act} ${r.section}: ${r.note || 'Manual penalty review required.'}`);
    if ((item.act === 'BNS' && row.custody_start < '2024-07-01') || (item.act === 'IPC' && row.custody_start >= '2024-07-01')) result.flags.push('Act/custody date mismatch: confirm the offence date and applicable law from the FIR. Custody date alone does not determine the applicable penal code.');
    if (r?.note && !r.review) result.flags.push(`${r.act} ${r.section}: ${r.note}`);
    if (repeatPenalties.has(`${item.act}:${item.section}`) && result.firstTime !== 'yes') result.issues.push(`${item.act} ${item.section}: possible repeat / second-conviction penalty. Confirm prior offence and applicable maximum before using the base-term dates.`);
    if (circumstancePenalties.has(`${item.act}:${item.section}`)) result.issues.push(`${item.act} ${item.section}: conditional penalty (${r.note}). The roster does not establish these circumstances; verify the applicable maximum. Dates below use the table term for reference only.`);
    if (item.act === 'BNS' && item.section === '106(2)') result.issues.push('BNS 106(2): commencement was excepted in the 2024 notification; verify current commencement and the actual charge.');
    if (item.act === 'BNS' && item.section.startsWith('61(')) result.issues.push('Criminal conspiracy: confirm the object offence and applicable punishment.');
  }
  if (pending === null) result.flags.push('Check e-Prisons / ICJS for other pending cases before filing.');
  if (charged.length > 1) result.issues.push('Section 479(2) expressly mentions more than one offence. Multiple substantive charges in one case require a legal determination; this prototype does not mark them application-due.');
  const records = charged.map(i => lookup(i.act, i.section)).filter(Boolean);
  result.reasoning.push('Charges: ' + (records.map(r => `${r.act} ${r.section} (${r.death ? 'death punishment specified' : r.life ? 'life imprisonment specified' : r.maxMonths === null ? 'penalty needs review' : `maximum ${r.maxMonths} months`})`).join(', ') || 'no resolved penalty') + '.');
  if (records.some(r => r.death || r.life)) {
    result.status = 'EXCLUDED';
    result.reasoning.push('A specified death/life punishment excludes the Section 479(1) fractional-term route. Other bail routes are outside this calculation.');
    return result;
  }
  const terms = records.filter(r => Number.isInteger(r.maxMonths) && r.maxMonths > 0).map(r => r.maxMonths);
  if (!terms.length) result.issues.push('No determinate maximum imprisonment term is available.');
  if (terms.length) {
    result.maxMonths = Math.max(...terms);
    result.fullTermDays = days(start, addMonths(start, result.maxMonths));
    result.halfDays = Math.ceil(result.fullTermDays / 2);
    result.thirdDays = Math.ceil(result.fullTermDays / 3);
    result.dates = { third: iso(addDays(start, result.thirdDays + delay)), half: iso(addDays(start, result.halfDays + delay)), outer: iso(addDays(start, result.fullTermDays + delay)) };
    result.thresholdDays = result.firstTime === 'yes' ? result.thirdDays : result.halfDays;
    result.thresholdDate = result.firstTime === 'yes' ? result.dates.third : result.dates.half;
    result.daysRemaining = result.thresholdDays - result.daysCounted;
    result.reasoning.push(`Maximum resolved term ${result.maxMonths} months = ${result.fullTermDays} calendar days from ${row.custody_start}. One-third: ${result.thirdDays} days, ${result.dates.third}. One-half: ${result.halfDays} days, ${result.dates.half}. Outer limit: ${result.dates.outer}.`);
    result.reasoning.push(`First-time status: ${result.firstTime}. Custody counted by ${asOfDate}: ${result.daysCounted} days after excluding ${delay} days. Dates assume the supplied continuous custody and recorded accused-caused delay.`);
    if (result.daysCounted >= result.fullTermDays) result.status = 'OUTER_LIMIT';
    else if (pending > 0) result.status = 'BARRED_479_2';
    else if (result.daysCounted >= result.thresholdDays) result.status = 'ELIGIBLE_NOW';
    else if (result.firstTime === 'unknown' && result.daysCounted >= result.thirdDays) result.status = 'ELIGIBLE_IF_FIRST_TIME_VERIFIED';
    else if (result.daysRemaining <= 60) result.status = 'DUE_SOON';
    else result.status = 'NOT_YET';
    result.calculatedStatus = result.status;
    if (pending > 0 && result.status === 'OUTER_LIMIT') result.flags.push('Outer-limit alert is for the listed case only. It does not discharge custody or remand orders in other cases. Confirm all case-specific terms and orders with the court.');
  }
  if (result.issues.length) result.status = 'NEEDS_REVIEW';
  result.issues = [...new Set(result.issues)]; result.flags = [...new Set(result.flags)];
  result.reasoning.push(...result.issues.map(s => `Review: ${s}`), `Action: ${LABELS[result.status]}. Court determination and case-record verification are required.`);
  result.canDraft = ['OUTER_LIMIT', 'ELIGIBLE_NOW', 'ELIGIBLE_IF_FIRST_TIME_VERIFIED'].includes(result.status);
  return result;
}
export function summarize(results) {
  const counts = Object.fromEntries(STATUS_ORDER.map(s => [s, results.filter(r => r.status === s).length]));
  return { counts, total: results.length, womenApplicationDue: results.filter(r => /^(female|woman|f)$/i.test(r.person.gender) && ['OUTER_LIMIT', 'ELIGIBLE_NOW'].includes(r.status)).length };
}
