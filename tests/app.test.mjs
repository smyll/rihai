import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { HEADERS, writeCSV } from '../src/csv.js';

// Minimal event/DOM adapter for state tests; this is not browser or visual QA.
class Element {
 constructor(tag='div') {this.tagName=tag;this.children=[];this.listeners=new Map();this.value='';this.disabled=false;this.open=false;this._text='';this.classList={add(){},remove(){}};}
 set textContent(text) {this._text=String(text);this.children=[];}
 get textContent() {return this._text+this.children.map(n=>n.textContent).join('');}
 append(...nodes) {this.children.push(...nodes);}
 replaceChildren(...nodes) {this._text='';this.children=[...nodes];}
 setAttribute() {}
 addEventListener(type,listener) {this.listeners.set(type,[...(this.listeners.get(type)||[]),listener]);}
 async emit(type) {for(const listener of this.listeners.get(type)||[])await listener({target:this});}
 showModal() {this.open=true;}
 close() {this.open=false;}
 click() {}
}
const descendants=node=>[node,...node.children.flatMap(descendants)];

test('invalid review dates invalidate rows, drafts, print and export until recalculated',async t=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const nodes=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>['#'+m[1],new Element()]));
 const get=id=>nodes.get('#'+id);
 const person={...Object.fromEntries(HEADERS.map(h=>[h,''])),prisoner_id:'SYN-UI',name:'Synthetic UI case',charges:'BNS 85',custody_start:'2024-07-01',first_time:'yes',other_pending_cases:'0'};
 let prints=0,downloads=0;
 const originals=Object.fromEntries(['document','window','fetch'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 t.after(()=>{for(const [key,descriptor]of Object.entries(originals)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
 globalThis.document={querySelector:selector=>nodes.get(selector),createElement:tag=>new Element(tag)};
 globalThis.window={print:()=>prints++};
 globalThis.fetch=async()=>({ok:true,text:async()=>writeCSV([person])});
 t.mock.method(URL,'createObjectURL',()=>{downloads++;return 'blob:test';});
 t.mock.method(URL,'revokeObjectURL',()=>{});
 await import('../src/app.js');
 get('review-date').value='2026-11-14';
 await get('load-sample').emit('click');
 assert.equal(get('export').disabled,false);assert.equal(get('meeting').disabled,false);
 const draft=descendants(get('roster-body')).find(n=>n.tagName==='button'&&n.textContent==='Draft application');
 assert.ok(draft);await draft.emit('click');assert.equal(get('application-dialog').open,true);
 await get('meeting').emit('click');assert.equal(prints,1);assert.match(get('print-content').textContent,/Review date: 2026-11-14/);

 get('review-date').value='';await get('review-date').emit('input');
 assert.equal(get('export').disabled,true);assert.equal(get('meeting').disabled,true);assert.equal(get('print-draft').disabled,true);
 assert.equal(get('summary').children.length,0);assert.doesNotMatch(get('roster-body').textContent,/Synthetic UI case/);
 assert.equal(get('application-dialog').open,false);assert.equal(get('application-content').textContent,'');assert.equal(get('print-content').textContent,'');
 for(const id of ['meeting','print-draft','export'])await get(id).emit('click');
 assert.equal(prints,1);assert.equal(downloads,0);

 get('review-date').value='2026-11-15';await get('review-date').emit('input');
 assert.equal(get('export').disabled,false);assert.equal(get('meeting').disabled,false);
 assert.doesNotMatch(get('feedback').textContent,/Choose a valid/);
 await get('meeting').emit('click');assert.equal(prints,2);assert.match(get('print-content').textContent,/Review date: 2026-11-15/);
 assert.equal(get('print-draft').disabled,true);assert.equal(get('application-content').textContent,'');
 get('review-date').value='2026-11-16';await get('meeting').emit('click');
 assert.equal(prints,2);assert.equal(get('print-content').textContent,'');
 await get('meeting').emit('click');assert.equal(prints,3);assert.match(get('print-content').textContent,/Review date: 2026-11-16/);
 // A programmatic date change without an input event must not print stale results.
 get('review-date').value='2026-02-30';await get('meeting').emit('click');
 assert.equal(prints,3);assert.equal(get('meeting').disabled,true);assert.equal(get('print-content').textContent,'');
});
