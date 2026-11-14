import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readCSV } from '../src/csv.js';
import { evaluate, summarize } from '../src/engine.js';
const roster=readCSV(fs.readFileSync(new URL('../data/sample-roster.csv',import.meta.url),'utf8'));
const expected=JSON.parse(fs.readFileSync(new URL('../data/sample-expected.json',import.meta.url),'utf8'));
test('40 unchanged synthetic records reflect conditional-penalty review holds',()=>{const actual=summarize(roster.map(r=>evaluate(r,expected.asOf)));assert.equal(actual.total,40);assert.deepEqual(actual.counts,expected.counts);assert.equal(actual.womenApplicationDue,expected.womenApplicationDue);assert.ok(actual.womenApplicationDue>=2);});

test('nine original repeat-penalty examples are held instead of drafted',()=>{
 const affected=roster.filter(r=>r.charges==='BNS 303(2)'&&r.first_time!=='yes');
 assert.equal(affected.length,9);
 for(const person of affected){const r=evaluate(person,expected.asOf);assert.equal(r.status,'NEEDS_REVIEW');assert.equal(r.canDraft,false);}
});
test('all example identities explicitly fictional',()=>{assert.ok(roster.every(r=>/^Synthetic person \d+$/.test(r.name)&&r.case_no.startsWith('FICTIONAL-')));});
test('all actionable rows carry actual trace and dates',()=>{for(const r of roster.map(p=>evaluate(p,expected.asOf))){if(r.canDraft){assert.ok(r.reasoning.length>=3);assert.ok(r.dates.third&&r.dates.half&&r.dates.outer);}}});
test('bounded penalty table has unique keys and consistent finite terms',async()=>{const {statutes}=await import('../src/statutes.js');assert.equal(new Set(statutes.map(r=>r.act+':'+r.section.toLowerCase())).size,statutes.length);for(const row of statutes)if(!row.death&&!row.life&&!row.review)assert.ok(Number.isInteger(row.maxMonths)&&row.maxMonths>0);});
