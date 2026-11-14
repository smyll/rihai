import test from 'node:test';
import assert from 'node:assert/strict';
import { HEADERS, readCSV, writeCSV, exportResults } from '../src/csv.js';
const person=Object.fromEntries(HEADERS.map(h=>[h,'']));person.prisoner_id='SYN-1';person.name='Synthetic, "quoted" person';person.notes='line 1\nline 2';
test('quoted commas, escaped quotes, embedded newline and BOM',()=>assert.deepEqual(readCSV('\uFEFF'+writeCSV([person])),[person]));
test('CRLF input',()=>assert.equal(readCSV(writeCSV([person])).length,1));
test('missing header identified',()=>assert.throws(()=>readCSV('name,charges\nSynthetic,IPC323'),/Missing CSV columns: prisoner_id/));
test('unclosed quote rejected',()=>assert.throws(()=>readCSV(HEADERS.join(',')+'\n"unfinished'),/Unclosed/));
test('duplicate id rejected',()=>assert.throws(()=>readCSV(writeCSV([person,person])),/unique/));
test('duplicate columns rejected',()=>assert.throws(()=>readCSV(HEADERS.join(',')+',name\n'),/duplicate/));
test('inconsistent width rejected',()=>assert.throws(()=>readCSV(HEADERS.join(',')+'\nSYN-1,Name'),/expected/));
test('spreadsheet formulas neutralized',()=>assert.match(writeCSV([{name:'=HYPERLINK("evil")'}],['name']),/['’]=HYPERLINK/));
test('export preserves dates and review reason',()=>assert.match(exportResults([{person,dates:{third:'2026-06-03'},status:'NEEDS_REVIEW',issues:['Review charge'],flags:[]}]),/2026-06-03/));

test('each exported row retains its own review date',()=>{
 const result={person,asOfDate:'2026-11-14',dates:{},status:'NEEDS_REVIEW',issues:[],flags:[]};
 const rows=readCSV(exportResults([result,{...result,person:{...person,prisoner_id:'SYN-2'},asOfDate:'2026-11-15'}]));
 assert.deepEqual(rows.map(r=>r.review_date),['2026-11-14','2026-11-15']);
});
