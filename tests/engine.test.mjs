import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../src/engine.js';
import { date, addMonths, iso } from '../src/dates.js';
import { draftApplication } from '../src/draft.js';
const base={prisoner_id:'SYN-01',name:'Synthetic person',gender:'female',prison:'Synthetic facility',court:'Synthetic court',case_no:'DEMO-01',charges:'BNS 303(2)',custody_start:'2025-06-02',first_time:'yes',other_pending_cases:'0',excluded_delay_days:'0'};
const run=changes=>evaluate({...base,...changes},'2026-11-14');
test('a: three calendar years, rounded third, exact date',()=>{const r=run();assert.equal(r.fullTermDays,1096);assert.equal(r.thirdDays,366);assert.equal(r.thresholdDate,'2026-06-03');assert.equal(r.status,'ELIGIBLE_NOW');});
test('b: half term and days remaining',()=>{const r=run({charges:'BNS 85',first_time:'no'});assert.equal(r.halfDays,548);assert.equal(r.thresholdDate,'2026-12-02');assert.equal(r.daysRemaining,18);assert.equal(r.status,'DUE_SOON');});
test('c: unknown prior conviction without a repeat-penalty branch',()=>assert.equal(run({charges:'BNS 85',first_time:'unknown'}).status,'ELIGIBLE_IF_FIRST_TIME_VERIFIED'));
test('d: death punishment excludes',()=>assert.equal(run({charges:'BNS 103(1)'}).status,'EXCLUDED'));
test('e: current-case outer limit',()=>{const r=run({charges:'BNS 115(2)',custody_start:'2025-09-01',first_time:'no'});assert.equal(r.dates.outer,'2026-09-01');assert.equal(r.status,'OUTER_LIMIT');});
test('f: other case before outer limit',()=>{const r=run({charges:'BNS 318(4)',custody_start:'2024-08-01',other_pending_cases:'1'});assert.equal(r.dates.outer,'2031-08-01');assert.equal(r.status,'BARRED_479_2');});
test('g: outer limit with other cases is scoped, not general release',()=>{const r=run({charges:'BNS 115(2)',custody_start:'2025-01-10',other_pending_cases:'2'});assert.equal(r.status,'OUTER_LIMIT');assert.equal(r.dates.outer,'2026-01-10');assert.match(r.flags.join(' '),/listed case only/);assert.match(draftApplication(r).lines.join(' '),/no finding about continued detention/);});
test('h: excluded delay shifts threshold',()=>{const r=run({excluded_delay_days:'60'});assert.equal(r.thresholdDate,'2026-08-02');assert.equal(r.status,'ELIGIBLE_NOW');});
test('i: missing offence',()=>assert.equal(run({charges:'BNS 999'}).status,'NEEDS_REVIEW'));
test('j: unsupported act',()=>assert.equal(run({charges:'u/s 25 Arms Act'}).status,'NEEDS_REVIEW'));
test('k: NDPS commercial quantity',()=>{const r=run({charges:'NDPS 20(b)(ii)(C)'});assert.equal(r.status,'NEEDS_REVIEW');assert.match(r.issues.join(' '),/s\.37/);});
test('l: multiple offences never silently treated as clear',()=>{const r=run({charges:'BNS 303(2),317(2)'});assert.equal(r.status,'NEEDS_REVIEW');assert.match(r.issues.join(' '),/479\(2\)/);assert.equal(r.canDraft,false);});
test('m: old IPC arithmetic retained but multi-charge held for review',()=>{const r=run({charges:'u/s 379/411 IPC',custody_start:'2024-03-15'});assert.equal(r.fullTermDays,1095);assert.equal(r.dates.third,'2025-03-15');assert.equal(r.calculatedStatus,'ELIGIBLE_NOW');assert.equal(r.status,'NEEDS_REVIEW');});
test('n: Hindi charge',()=>assert.equal(run({charges:'धारा 303(2) बीएनएस'}).parsed.items[0].section,'303(2)'));
for (const charges of ['IPC 302','IPC 376','BNS 64(1)','BNS 310(2)','BNS 118(2)'])test('life/death '+charges,()=>assert.equal(run({charges}).status,'EXCLUDED'));
for(const charges of ['BNS 109(1)','IPC 307','BNS 318','NDPS 29','IPC 120B','BNS 61(2)(b)','BNS 106(2)'])test('review '+charges,()=>assert.equal(run({charges}).status,'NEEDS_REVIEW'));
for(const change of [{custody_start:'2025-02-30'},{custody_start:'2027-01-01'},{custody_start:''},{excluded_delay_days:'-1'},{excluded_delay_days:'1.5'},{excluded_delay_days:'60000'},{first_time:''},{other_pending_cases:''},{other_pending_cases:'-2'}])test('invalid record '+JSON.stringify(change),()=>{const r=run(change);assert.equal(r.status,'NEEDS_REVIEW');assert.equal(r.canDraft,false);});
test('exact threshold inclusive',()=>{const r=evaluate(base,'2026-06-03');assert.equal(r.status,'ELIGIBLE_NOW');});
test('day before threshold',()=>assert.equal(evaluate(base,'2026-06-02').status,'DUE_SOON'));
test('unknown first-time after half',()=>assert.equal(evaluate({...base,charges:'BNS 85',first_time:'unknown'},'2027-01-01').status,'ELIGIBLE_NOW'));
test('unknown other cases flagged',()=>assert.match(run({other_pending_cases:'unknown'}).flags.join(' '),/ICJS/));
test('applicable-law mismatch flagged',()=>assert.match(run({custody_start:'2024-01-01'}).flags.join(' '),/mismatch/));
test('calendar month end is clamped',()=>assert.equal(iso(addMonths(date('2024-02-29'),12)),'2025-02-28'));
test('UTC arithmetic independent of process timezone',()=>{const original=process.env.TZ;try{process.env.TZ='America/New_York';assert.equal(run().thresholdDate,'2026-06-03');process.env.TZ='Asia/Kolkata';assert.equal(run().thresholdDate,'2026-06-03');}finally{if(original===undefined)delete process.env.TZ;else process.env.TZ=original;}});
test('conditional draft does not assert no convictions',()=>{const r=run({charges:'BNS 85',first_time:'unknown'});assert.match(draftApplication(r).lines.join(' '),/status is UNKNOWN/);});
test('draft missing identity leaves placeholders',()=>assert.match(draftApplication(run({name:'',court:'',case_no:''})).lines.join(' '),/\[ \]/));
test('unresolved record cannot produce normal application',()=>assert.throws(()=>draftApplication(run({charges:'BNS 999'})),/Resolve/));
test('one common-intention modifier does not create multi-charge review',()=>assert.equal(run({charges:'BNS 115(2) r/w 3(5)',custody_start:'2026-01-01'}).status,'ELIGIBLE_NOW'));
test('unknown charge alongside known term does not become eligible',()=>{const r=run({charges:'BNS 303(2),999'});assert.equal(r.status,'NEEDS_REVIEW');assert.ok(r.dates.third);});

for (const charges of ['BNS 303(2)', 'BNS 78(2)']) {
 for (const first_time of ['no', 'unknown']) test(`unresolved repeat penalty: ${charges}, first-time ${first_time}`,()=>{
  const r=run({charges,first_time,custody_start:'2024-07-01'});
  assert.equal(r.status,'NEEDS_REVIEW');assert.equal(r.canDraft,false);
  assert.match(r.issues.join(' '),/repeat|second/i);
  assert.throws(()=>draftApplication(r),/Resolve/);
 });
 test(`verified first-time retains base penalty: ${charges}`,()=>assert.equal(run({charges}).status,'ELIGIBLE_NOW'));
}
for (const charges of ['BNS 309(4)', 'IPC 392', 'BNS 110', 'IPC 308']) test('conditional circumstances require review: '+charges,()=>{
 const r=run({charges,custody_start:'2010-01-01'});
 assert.equal(r.status,'NEEDS_REVIEW');assert.equal(r.canDraft,false);
 assert.match(r.issues.join(' '),/conditional penalty/i);
});
