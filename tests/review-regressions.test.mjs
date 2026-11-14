import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, compareResults } from '../src/engine.js';
import { parseCharges } from '../src/parser.js';
import { draftApplication, draftCourtReview } from '../src/draft.js';
import { exportResults, readCSV } from '../src/csv.js';

const base = { prisoner_id: 'SYN-REVIEW', name: 'Synthetic review case', gender: 'female', prison: 'Synthetic facility', court: 'Synthetic court', case_no: 'FICTIONAL-REVIEW', charges: 'BNS 115(2),127(2)', custody_start: '2025-01-10', first_time: 'no', other_pending_cases: '0', excluded_delay_days: '0' };
const run = changes => evaluate({ ...base, ...changes }, '2026-11-15');

test('resolved multiple finite charges retain the current-case outer alert and draft', () => {
  const r = run();
  assert.equal(r.status, 'OUTER_LIMIT');
  assert.equal(r.canDraft, true);
  assert.equal(r.dates.outer, '2026-01-10');
  assert.match(draftApplication(r).lines.join(' '), /no finding about continued detention/);
});
test('multiple offences before the outer limit still require a 479(2) determination', () => {
  const r = run({ custody_start: '2026-01-10' });
  assert.equal(r.status, 'NEEDS_REVIEW');
  assert.equal(r.canDraft, false);
  assert.match(r.issues.join(' '), /479\(2\)/);
});
for (const charges of ['BNS 115(2),999', 'BNS 115(2) unrecognized', 'BNS 115(2),45']) {
  test('outer reference cannot bypass unresolved input: ' + charges, () => {
    const r = run({ charges });
    assert.equal(r.status, 'NEEDS_REVIEW');
    assert.equal(r.canDraft, false);
    assert.throws(() => draftApplication(r));
  });
}
test('an unresolved conditional penalty still blocks a reference outer limit', () => {
  assert.equal(run({ charges: 'IPC 323,392', custody_start: '2010-01-01' }).canDraft, false);
});
test('outer alert with multiple offences and other cases remains case-scoped', () => {
  const r = run({ other_pending_cases: '2' });
  assert.equal(r.status, 'OUTER_LIMIT');
  assert.match(r.flags.join(' '), /listed case only/);
});

for (const [act, section] of [['IPC', '304'], ['BNS', '105']]) {
  for (const spelling of ['Part II', 'Pt. II', '(II)', '-II', 'part ii']) {
    test(`${act} ${section} ${spelling} identifies the finite knowledge limb`, () => {
      const charges = `${act} ${section} ${spelling}`;
      const p = parseCharges(charges, '2025-01-10');
      assert.deepEqual(p.items.map(i => i.section), [`${section}-II`]);
      assert.deepEqual(p.unknown, []);
      assert.equal(run({ charges }).maxMonths, 120);
      assert.notEqual(run({ charges }).status, 'EXCLUDED');
    });
  }
  test(`bare ${act} ${section} requires limb verification`, () => {
    const r = run({ charges: `${act} ${section}` });
    assert.equal(r.status, 'NEEDS_REVIEW');
    assert.equal(r.canDraft, false);
  });
  test(`${act} ${section} Part I retains life exclusion`, () => {
    assert.equal(run({ charges: `${act} ${section} Part I` }).status, 'EXCLUDED');
  });
  for (const limb of ['Part III', '-III', 'Part IIIB']) {
    test(`${act} ${section} ${limb} is not a supported limb`, () => {
      const r = run({ charges: `${act} ${section} ${limb}` });
      assert.equal(r.status, 'NEEDS_REVIEW');
      assert.equal(r.canDraft, false);
    });
  }
}
test('IPC 304 Part II uses the ten-year calendar term and its actual due-soon boundary', () => {
  const r = run({ charges: 'IPC 304 Part II', custody_start: '2022-01-01' });
  assert.equal(r.maxMonths, 120);
  assert.equal(r.fullTermDays, 3652);
  assert.equal(r.dates.half, '2027-01-01');
  assert.equal(r.status, 'DUE_SOON');
});
test('BNS snatching subsection 304(2) is not rewritten as a homicide limb', () => {
  assert.deepEqual(parseCharges('BNS 304(2)').items.map(i => `${i.act}:${i.section}`), ['BNS:304(2)']);
});
test('legacy IPC 506(2) alias still works', () => {
  assert.deepEqual(parseCharges('IPC 506(2)').items.map(i => i.section), ['506-II']);
});
test('an independently unambiguous murder charge still excludes despite another unknown charge', () => {
  assert.equal(run({ charges: 'BNS 103(1),999' }).status, 'EXCLUDED');
});
test('BNS custody predating commencement needs applicable-law review', () => {
  const r = run({ charges: 'BNS 303(2)', custody_start: '2024-03-01', first_time: 'yes' });
  assert.equal(r.status, 'NEEDS_REVIEW');
  assert.equal(r.canDraft, false);
  assert.match(r.issues.join(' '), /applicable|commencement|2024-07-01/i);
});
test('later custody for an old IPC offence is flagged without a blanket review hold', () => {
  const r = run({ charges: 'IPC 379', custody_start: '2025-01-01', first_time: 'yes' });
  assert.equal(r.status, 'ELIGIBLE_NOW');
  assert.match(r.flags.join(' '), /applicable law|mismatch/);
});
test('the review queue puts a reference outer limit before reference application-due and unresolved rows', () => {
  const unresolved = run({ prisoner_id: 'A', charges: 'BNS 999' });
  const due = run({ prisoner_id: 'B', custody_start: '2026-01-10' });
  const outer = run({ prisoner_id: 'C', charges: 'BNS 115(2),999' });
  assert.deepEqual([unresolved, due, outer].sort(compareResults).map(r => r.person.prisoner_id), ['C', 'B', 'A']);
  assert.ok([unresolved, due, outer].every(r => r.status === 'NEEDS_REVIEW' && !r.canDraft));
});
test('a due same-case multi-offence record can request court determination while remaining under review', () => {
  const r = run({ charges: 'BNS 303(2),317(2)', first_time: 'yes', custody_start: '2025-01-01' });
  assert.equal(r.status, 'NEEDS_REVIEW');
  assert.equal(r.canDraft, false);
  assert.equal(r.canRequestCourtReview, true);
  assert.throws(() => draftApplication(r));
  const draft = draftCourtReview(r);
  assert.match(draft.title, /REQUEST FOR COURT DETERMINATION/);
  assert.match(draft.lines.join(' '), /FICTIONAL-REVIEW/);
  assert.match(draft.lines.join(' '), /status remains LEGAL REVIEW NEEDED/);
  assert.match(draft.lines.join(' '), /does not assert eligibility/);
});
for (const changes of [
  { charges: 'BNS 115(2),999' },
  { custody_start: '2026-10-01' },
  { custody_start: '2026-01-10', other_pending_cases: '1' },
  { custody_start: '2026-01-10', other_pending_cases: 'unknown' },
  { custody_start: '2026-01-10', case_no: '' },
  { charges: 'BNS 303(2),317(2)', first_time: 'no' },
  { charges: 'BNS 303(2),317(2)', first_time: 'yes', custody_start: '2024-03-01' }
]) test('court-review drafting does not bypass another blocker: ' + JSON.stringify(changes), () => {
  const r = run(changes);
  assert.equal(r.canRequestCourtReview, false);
  assert.throws(() => draftCourtReview(r));
});
test('export distinguishes a court request from application eligibility', () => {
  const r = run({ charges: 'BNS 303(2),317(2)', first_time: 'yes', custody_start: '2025-01-01' });
  const [row] = readCSV(exportResults([r]));
  assert.equal(row.status, 'NEEDS_REVIEW');
  assert.equal(row.reference_status, 'ELIGIBLE_NOW');
  assert.equal(row.court_review_request_available, 'true');
  assert.match(row.review_reasons, /479\(2\)/);
});
