import { lookup, statutes, modifiers, dependent } from './statutes.js';

const aliases = [
  ['BNS', /B\.?N\.?S\.?|बीएनएस|भा\.न्या\.सं\.?|भारतीय न्याय संहिता/giu],
  ['IPC', /I\.?P\.?C\.?|आईपीसी|भा\.दं\.सं\.?|भारतीय दंड संहिता/giu],
  ['NDPS', /N\.?D\.?P\.?S\.?|एनडीपीएस/giu],
];
export function parseCharges(text, custodyStart = '') {
  let normalized = String(text ?? '').replace(/[०-९]/g, n => String('०१२३४५६७८९'.indexOf(n)))
    // These two sections have explicit intention / knowledge limbs. Numeric (2) is not a limb alias.
    .replace(/\b(304|105)\s*(?:Part\s*|Pt\.?\s*|\(\s*|-\s*)(II|I)(?:\s*\))?(?![a-zA-Z0-9])/gi, (_, section, limb) => `${section}-${limb.toUpperCase()}`)
    .replace(/\b506\s*(?:Part\s*II\b|\(2\)|\(II\)|-\s*II\b)/gi, '506-II')
    .replace(/\s*\(\s*/g, '(').replace(/\s*\)\s*/g, ')');
  for (const [act, pattern] of aliases) normalized = normalized.replace(pattern, ` ${act} `);
  for (const [act, year] of [['BNS','2023'], ['IPC','1860'], ['NDPS','1985']]) normalized = normalized.replace(new RegExp(`\\b${act}\\s+Act(?:\\s*,?\\s*${year}\\b)?`, 'gi'), ` ${act} `);
  const items = [], unknown = [], flags = [];
  const unsupportedAct = /\b(?:Arms|IT|PMLA|UAPA|POCSO|Excise)\b|\b[A-Za-z]+\s+Act\b/i;
  for (const group of normalized.split(';')) {
   const groupActs = [...new Set([...group.matchAll(/\b(BNS|IPC|NDPS)\b/g)].map(m=>m[1]))];
   const sharedAct = groupActs.length === 1 && !unsupportedAct.test(group) ? groupActs[0] : null;
   for (const rawBlock of group.split(/[&+]/)) {
    const block = rawBlock.trim();
    if (!block) continue;
    if (unsupportedAct.test(block)) {
      unknown.push(block + ': Act not in Rihai\'s statute table yet'); continue;
    }
    const acts = [...block.matchAll(/\b(BNS|IPC|NDPS)\b/g)];
    const sections = [...block.matchAll(/\b\d+(?:[A-Za-z])?(?:-I{1,2}(?![a-zA-Z0-9])|\([a-zA-Z0-9]+\))*/g)];
    if (!sections.length) { unknown.push(block); continue; }
    const prefix = acts.length && acts[0].index < sections[0].index;
    for (const found of sections) {
      let act;
      if (!acts.length) {
        if (groupActs.length > 1) { unknown.push(`${block}: ambiguous Act across joined charges`); continue; }
        act = sharedAct || (custodyStart && custodyStart < '2024-07-01' ? 'IPC' : 'BNS');
        if (!sharedAct) flags.push('Act inferred from custody date — confirm from FIR.');
      } else if (acts.length === 1) act = acts[0][1];
      else act = (prefix ? acts.filter(a => a.index < found.index).at(-1) ?? acts[0] : acts.find(a => a.index > found.index) ?? acts.at(-1))[1];
      let section = found[0];
      let record = lookup(act, section);
      if (!record && /^\d+[A-Za-z]?$/.test(section) && !modifiers[act].includes(section) && !dependent[act].includes(section)) {
        const candidates = statutes.filter(r => r.act === act && r.section.split('(')[0] === section);
        if (candidates.length === 1) {
          section = candidates[0].section; record = candidates[0];
          flags.push(`${act} ${found[0]} mapped to ${section} — confirm the subsection from the FIR.`);
        }
      }
      if (record) section = record.section;
      if (record || modifiers[act].includes(section) || dependent[act].includes(section)) items.push({ act, section, raw: found[0] });
      else unknown.push(`${act} ${section}: unknown or ambiguous subsection`);
    }
    const residue = block.replace(/\b(BNS|IPC|NDPS)\b/g, '').replace(/\b\d+(?:[A-Za-z])?(?:-I{1,2}(?![a-zA-Z0-9])|\([a-zA-Z0-9]+\))*/g, '')
      .replace(/u\s*\/\s*s|r\s*\/\s*w|\b(?:sections?|secs?|read with|and)\b|धारा/gi, '').replace(/[\s,./:()\-]/g, '');
    if (residue) unknown.push(`Unparsed charge text: ${residue}`);
   }
  }
  if (!items.length && !unknown.length) unknown.push('No charge supplied.');
  return { items: items.filter((r, i, a) => a.findIndex(x => x.act === r.act && x.section === r.section) === i), unknown: [...new Set(unknown)], flags: [...new Set(flags)] };
}
