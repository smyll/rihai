import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCharges } from '../src/parser.js';
const cases = [
 ['u/s 379, 411 IPC', ['IPC:379','IPC:411']],
 ['u/s 379/411 IPC', ['IPC:379','IPC:411']],
 ['Sec. 303(2), 317(2) BNS', ['BNS:303(2)','BNS:317(2)']],
 ['303(2)/317(2) BNS', ['BNS:303(2)','BNS:317(2)']],
 ['BNS 303(2)', ['BNS:303(2)']],
 ['BNS 115(2), 351(2) r/w 3(5)', ['BNS:115(2)','BNS:351(2)','BNS:3(5)']],
 ['IPC 323, 506 r/w 34', ['IPC:323','IPC:506','IPC:34']],
 ['506 Part II IPC', ['IPC:506-II']], ['IPC 506(2)', ['IPC:506-II']],
 ['20(b)(ii)(B) NDPS', ['NDPS:20(b)(ii)(B)']],
 ['NDPS 8/20(b)(ii)(C)', ['NDPS:8','NDPS:20(b)(ii)(C)']],
 ['धारा 303(2) बीएनएस', ['BNS:303(2)']],
 ['धारा ३०३(२) भारतीय न्याय संहिता', ['BNS:303(2)']],
 ['धारा 379, 411 भा.दं.सं.', ['IPC:379','IPC:411']],
 ['B.N.S. 115(2)', ['BNS:115(2)']], ['I.P.C. 323', ['IPC:323']],
 ['IPC 323 & BNS 115(2)', ['IPC:323','BNS:115(2)']],
 ['IPC 323, BNS 115(2)', ['IPC:323','BNS:115(2)']],
 ['323 IPC, 115(2) BNS', ['IPC:323','BNS:115(2)']],
 ['BNS 303', ['BNS:303(2)']], ['BNS 115', ['BNS:115(2)']], ['BNS 117', ['BNS:117(2)']],
];
for (const [text, expected] of cases) test('parse ' + text, () => {
 const r=parseCharges(text,'2025-01-01');assert.deepEqual(r.items.map(i=>`${i.act}:${i.section}`), expected);assert.deepEqual(r.unknown,[]);
});
test('mixed unsupported act is retained as unresolved',()=>{const p=parseCharges('u/s 323 IPC & 25 Arms Act');assert.equal(p.items[0].section,'323');assert.match(p.unknown.join(' '),/Arms/);});
for(const section of ['318','351','191','324','317'])test('ambiguous BNS '+section,()=>{const p=parseCharges('BNS '+section);assert.ok(p.unknown.length);assert.equal(p.items.length,0);});
test('inferred act is flagged',()=>{const p=parseCharges('379/411','2024-03-15');assert.equal(p.items[0].act,'IPC');assert.match(p.flags.join(' '),/inferred/);});
test('unparsed text cannot silently disappear',()=>assert.ok(parseCharges('IPC 323 nonsense').unknown.length));
test('duplicate charge is not counted twice',()=>assert.equal(parseCharges('IPC 323/323').items.length,1));
test('empty charges need review',()=>assert.ok(parseCharges('').unknown.length));

for (const text of ['NDPS Act 21(a)', '21(a) NDPS Act', 'NDPS Act, 1985, section 21(a)']) test('known Act label: '+text,()=>{
 const r=parseCharges(text,'2025-01-01');assert.deepEqual(r.items.map(i=>`${i.act}:${i.section}`),['NDPS:21(a)']);assert.deepEqual(r.unknown,[]);
});
for (const text of ['IPC 323 & 506', '323 & 506 IPC', 'IPC 323 + 506', 'IPC 323 and 506']) test('shared explicit Act: '+text,()=>{
 const r=parseCharges(text,'2025-01-01');assert.deepEqual(r.items.map(i=>`${i.act}:${i.section}`),['IPC:323','IPC:506']);assert.deepEqual(r.unknown,[]);assert.doesNotMatch(r.flags.join(' '),/Act inferred/);
});
test('act context does not cross a semicolon-separated charge group',()=>{
 const r=parseCharges('IPC 323; 115(2)','2025-01-01');assert.deepEqual(r.items.map(i=>i.act),['IPC','BNS']);assert.match(r.flags.join(' '),/Act inferred/);
});
test('unsupported Act remains unresolved after a conjunction',()=>{
 const r=parseCharges('IPC 323 & 25 Arms Act & 506','2025-01-01');assert.ok(r.unknown.some(s=>s.includes('Arms')));assert.ok(r.unknown.length);
});
test('an unlabelled charge in a mixed-Act group is not guessed',()=>{
 const r=parseCharges('IPC 323 & BNS 115(2) & 351(2)','2025-01-01');
 assert.deepEqual(r.items.map(i=>`${i.act}:${i.section}`),['IPC:323','BNS:115(2)']);assert.match(r.unknown.join(' '),/ambiguous Act/);
});
