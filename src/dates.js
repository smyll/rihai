export const DAY = 86400000;
export function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Use a valid YYYY-MM-DD date.');
  const d = new Date(value + 'T00:00:00.000Z');
  if (!Number.isFinite(+d) || d.toISOString().slice(0, 10) !== value) throw new Error('Use a valid calendar date.');
  return d;
}
export const iso = d => d.toISOString().slice(0, 10);
export const days = (a, b) => Math.round((+b - +a) / DAY);
export const addDays = (d, n) => new Date(+d + n * DAY);
export function addMonths(d, months) {
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), last));
  return target;
}
