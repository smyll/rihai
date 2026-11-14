export const HEADERS = ['prisoner_id','name','gender','age','prison','court','case_no','charges','custody_start','first_time','other_pending_cases','excluded_delay_days','notes'];
export function readCSV(input) {
  const text = String(input).replace(/^\uFEFF/, '');
  const rows = []; let row = [], cell = '', quoted = false, closed = false;
  const pushCell = () => { row.push(cell); cell = ''; closed = false; };
  const pushRow = () => { pushCell(); if (row.some(c => c.length)) rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"') { if (text[i+1] === '"') { cell += '"'; i++; } else { quoted = false; closed = true; } } else cell += c; }
    else if (c === '"') { if (cell || closed) throw new Error('Unexpected quote in CSV field.'); quoted = true; }
    else if (c === ',') pushCell();
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i+1] === '\n') i++; pushRow(); }
    else { if (closed && c.trim()) throw new Error('Unexpected text after a closing CSV quote.'); if (!closed) cell += c; }
  }
  if (quoted) throw new Error('Unclosed quoted CSV field.');
  if (cell || row.length || closed) pushRow();
  if (!rows.length) throw new Error('CSV is empty.');
  const headers = rows.shift().map(c => c.trim());
  if (new Set(headers).size !== headers.length) throw new Error('CSV contains duplicate column names.');
  const missing = HEADERS.filter(h => !headers.includes(h));
  if (missing.length) throw new Error('Missing CSV columns: ' + missing.join(', '));
  const seen = new Set();
  return rows.map((r, i) => {
    if (r.length !== headers.length) throw new Error(`CSV row ${i+2}: expected ${headers.length} fields, found ${r.length}.`);
    const item = Object.fromEntries(headers.map((h, n) => [h, r[n].trim()]));
    if (!item.prisoner_id || seen.has(item.prisoner_id)) throw new Error(`CSV row ${i+2}: prisoner_id must be non-empty and unique.`);
    seen.add(item.prisoner_id); return item;
  });
}
export function writeCSV(rows, headers = HEADERS) {
  const escape = value => {
    let s = String(value ?? '');
    if (/^\s*[=+@\-]/.test(s) || /^[\t\r]/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [headers.map(escape).join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\r\n');
}
export function exportResults(results) {
  const columns = [...HEADERS, 'review_date', 'status', 'reference_status', 'court_review_request_available', 'days_counted', 'third_date', 'half_date', 'outer_date', 'threshold_date', 'review_reasons', 'flags'];
  return writeCSV(results.map(r => ({ ...r.person, review_date: r.asOfDate, status: r.status, reference_status: r.calculatedStatus, court_review_request_available: Boolean(r.canRequestCourtReview), days_counted: r.daysCounted, third_date: r.dates.third, half_date: r.dates.half, outer_date: r.dates.outer, threshold_date: r.thresholdDate, review_reasons: r.issues.join(' | '), flags: r.flags.join(' | ') })), columns);
}
