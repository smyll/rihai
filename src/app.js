import { date } from './dates.js';
import { evaluate, summarize, LABELS, STATUS_ORDER } from './engine.js';
import { readCSV, exportResults } from './csv.js';
import { draftApplication } from './draft.js';

const $ = selector => document.querySelector(selector);
const el = (tag, text, className) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (className) n.className = className; return n; };
let roster = [], results = [], selected, reviewedDate = '', loadVersion = 0;
$('#review-date').value = new Intl.DateTimeFormat('en-CA', {year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
for (const s of STATUS_ORDER) { const option = el('option', LABELS[s]); option.value = s; $('#status').append(option); }
function feedback(message) { $('#feedback').textContent = message; }
function clearDocuments() {
  selected = undefined;
  $('#print-draft').disabled = true;
  if ($('#application-dialog').open) $('#application-dialog').close();
  $('#application-content').replaceChildren(); $('#print-content').replaceChildren();
}
function calculate() {
  clearDocuments();
  try { date($('#review-date').value); } catch {
    results = []; reviewedDate = ''; $('#summary').replaceChildren();
    $('#export').disabled = true; $('#meeting').disabled = true;
    renderRows(); feedback('Choose a valid review date.'); return false;
  }
  reviewedDate = $('#review-date').value;
  results = roster.map(r => evaluate(r, reviewedDate));
  const stats = summarize(results), cards = [ ['Total reviewed', stats.total], ...STATUS_ORDER.map(s => [LABELS[s], stats.counts[s]]), ['Women: application due / outer limit', stats.womenApplicationDue] ];
  $('#summary').replaceChildren(...cards.map(([title, count], i) => {const card = el('div', undefined, 'metric' + ([1,2,9].includes(i)?' emphasis':'')); card.append(el('strong', String(count)),el('span', title)); return card;}));
  $('#export').disabled = !results.length; $('#meeting').disabled = !results.length;
  renderRows();
  feedback(roster.length ? `Reviewed ${roster.length} records as of ${reviewedDate}.` : 'Load a roster to review.');
  return true;
}
function currentReview() {
  if (!reviewedDate || reviewedDate !== $('#review-date').value) { calculate(); return false; }
  return results.length > 0;
}
function renderRows() {
  const term = $('#search').value.trim().toLowerCase(), status = $('#status').value;
  const visible = results.filter(r => (!status || r.status === status) && (!term || `${r.person.prisoner_id} ${r.person.name}`.toLowerCase().includes(term)))
    .sort((a,b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || (a.thresholdDate||'9999').localeCompare(b.thresholdDate||'9999') || a.person.prisoner_id.localeCompare(b.person.prisoner_id));
  $('#roster-info').textContent = reviewedDate ? `${visible.length} shown of ${results.length} people. Review date ${reviewedDate}.` : 'Choose a valid review date to show results.';
  const body = $('#roster-body'); body.replaceChildren();
  if (!visible.length) {const tr=el('tr'), td=el('td', 'No matching records.', 'empty');td.colSpan=7;tr.append(td);body.append(tr);return;}
  visible.forEach((r,i) => {
    const tr=el('tr'), name=el('td'); name.append(el('div',r.person.name||'[Name missing]','name'),el('div',r.person.prisoner_id,'identifier'));
    const expand=el('button','Show reasoning','expand');expand.type='button';expand.setAttribute('aria-expanded','false');expand.setAttribute('aria-controls',`trace-${i}`);name.append(expand);tr.append(name);
    for(const value of [r.person.charges,r.person.custody_start,r.daysCounted===undefined?'—':String(r.daysCounted),r.thresholdDate||'—'])tr.append(el('td',value));
    const state=el('td');state.append(el('span',LABELS[r.status], 'status-tag'+(['OUTER_LIMIT','ELIGIBLE_NOW'].includes(r.status)?' urgent':'')));tr.append(state);
    const action=el('td');if(r.canDraft){const draft=el('button','Draft application');draft.type='button';draft.addEventListener('click',()=>openDraft(r));action.append(draft);}else action.textContent=r.issues.length?'Review records':r.status==='BARRED_479_2'?'Review other cases':'Monitor';tr.append(action);
    const detail=el('tr',undefined,'trace-row');detail.id=`trace-${i}`;detail.hidden=true;const cell=el('td');cell.colSpan=7;
    cell.append(el('h3','Calculation and action'));r.reasoning.forEach(line=>cell.append(el('p',line)));
    if(r.flags.length){cell.append(el('h3','Verify before filing'));const ul=el('ul');r.flags.forEach(f=>ul.append(el('li',f)));cell.append(ul);}detail.append(cell);
    expand.addEventListener('click',()=>{detail.hidden=!detail.hidden;expand.setAttribute('aria-expanded',String(!detail.hidden));expand.textContent=detail.hidden?'Show reasoning':'Hide reasoning';});body.append(tr,detail);
  });
}
function article(result) {const section=el('section',undefined,'application-page'), draft=draftApplication(result); draft.lines.forEach((line,i)=>section.append(el(i===1?'h2':'p',line)));return section;}
function openDraft(r) {if(!currentReview() || !results.includes(r))return;selected=r;$('#print-draft').disabled=false;$('#application-content').replaceChildren(article(r));$('#application-dialog').showModal();}
function printDocument(nodes) {$('#print-content').replaceChildren(...nodes);window.print();}
$('#close-draft').addEventListener('click',()=>$('#application-dialog').close());
$('#print-draft').addEventListener('click',()=>{if(currentReview() && selected)printDocument([article(selected)]);});
$('#meeting').addEventListener('click',()=>{
 if(!currentReview())return;
 const head=el('section'), stats=summarize(results);head.append(el('h1','UTRC custody review pack'),el('p',`Review date: ${reviewedDate}. ${stats.total} records reviewed.`));
 head.append(el('p',STATUS_ORDER.map(s=>`${LABELS[s]}: ${stats.counts[s]}`).join('; ')));
 const table=el('table'), header=el('tr');['ID','Name','Charges','Status','Third / half / outer date'].forEach(v=>header.append(el('th',v)));const thead=el('thead');thead.append(header);table.append(thead);const tbody=el('tbody');
 const action=results.filter(r=>r.canDraft||r.status==='NEEDS_REVIEW'||r.status==='DUE_SOON').sort((a,b)=>STATUS_ORDER.indexOf(a.status)-STATUS_ORDER.indexOf(b.status));
 for(const r of action){const tr=el('tr');[r.person.prisoner_id,r.person.name,r.person.charges,LABELS[r.status],[r.dates.third,r.dates.half,r.dates.outer].filter(Boolean).join(' / ')||'Unresolved'].forEach(v=>tr.append(el('td',v)));tbody.append(tr);}table.append(tbody);head.append(table,el('p','Dates concern supplied records only. Resolve legal-review issues, prior convictions, other proceedings, and custody records before filing.'));
 const reviews=action.filter(r=>r.issues.length).map(r=>{const section=el('section',undefined,'review-note');section.append(el('h2',`${r.person.prisoner_id}: review required`));r.issues.forEach(s=>section.append(el('p',s)));return section;});
 printDocument([head,...reviews,...action.filter(r=>r.canDraft).map(article)]);
});
$('#export').addEventListener('click',()=>{if(!currentReview())return;const url=URL.createObjectURL(new Blob(['\uFEFF'+exportResults(results)],{type:'text/csv;charset=utf-8'}));const a=el('a');a.href=url;a.download=`rihai-review-${reviewedDate}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
async function importFile(file) {const version=++loadVersion;if(!file)return;if(file.size>5_000_000){feedback('Choose a CSV smaller than 5 MB.');return;}try{const parsed=readCSV(await file.text());if(version!==loadVersion)return;if(parsed.length>10000)throw new Error('Maximum 10,000 people per roster.');roster=parsed;if(calculate())feedback(`Loaded ${roster.length} records from ${file.name}. Processing stays in this tab.`);}catch(e){feedback(e.message);}}
$('#roster-file').addEventListener('change',e=>importFile(e.target.files[0]));
$('#load-sample').addEventListener('click',async()=>{const version=++loadVersion;try{const response=await fetch('./data/sample-roster.csv');if(!response.ok)throw new Error('Sample roster unavailable. Serve this directory over HTTP.');const parsed=readCSV(await response.text());if(version!==loadVersion)return;roster=parsed;if(calculate())feedback(`Loaded ${roster.length} fictional sample records. Sample categories were designed for 2026-11-14; review date remains yours.`);}catch(e){feedback(e.message);}});
const drop=$('#drop-zone');drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('dragging');});drop.addEventListener('dragleave',()=>drop.classList.remove('dragging'));drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragging');importFile(e.dataTransfer.files[0]);});
$('#review-date').addEventListener('input',calculate);$('#review-date').addEventListener('change',calculate);$('#search').addEventListener('input',renderRows);$('#status').addEventListener('change',renderRows);
