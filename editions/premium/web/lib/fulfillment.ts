// fulfillment.ts
export type Color = 'green' | 'yellow' | 'red';
export type MonthColor = Color | 'gray';

export interface DayEntry {
  date: string;          // ISO: "2025-04-03" (UTC date; belongs to the month)
  color: Color;
  note?: string;
  reset?: boolean;       // set when "Reset Ritual" is used
}

export interface LifeAreaMonth {
  lifeAreaId: string;    // 'work', 'health', etc.
  year: number;          // 2025
  month: number;         // 1-12
  days: DayEntry[];
}

export interface MonthSummary {
  color: MonthColor;     // gray when no data
  counts: Record<Color, number>;
  coverage: number;      // 0-100
  weightedAvg: number;   // 0..2
}

const WEIGHTS: Record<Color, number> = { green: 2, yellow: 1, red: 0 };

export function daysInMonth(year: number, month1to12: number) {
  return new Date(year, month1to12, 0).getDate();
}

export function summarizeMonth(m: LifeAreaMonth): MonthSummary {
  const dim = daysInMonth(m.year, m.month);
  const counts: Record<Color, number> = { green: 0, yellow: 0, red: 0 };

  for (const d of m.days) counts[d.color]++;

  const total = counts.green + counts.yellow + counts.red;
  if (total === 0) {
    return { color: 'gray', counts, coverage: 0, weightedAvg: 0 };
  }

  const weighted = counts.green * 2 + counts.yellow * 1 + counts.red * 0;
  const weightedAvg = weighted / total;
  const coverage = Math.round((total / dim) * 100);

  // thresholds: ≥⅔ green → green; ≥⅔ red → red; else yellow
  let color: MonthColor;
  if (weightedAvg >= 1.33) color = 'green';
  else if (weightedAvg <= 0.66) color = 'red';
  else color = 'yellow';

  return { color, counts, coverage, weightedAvg };
}

// Optional mode-first rule
export function modeOrAverageColor(counts: Record<Color, number>): Color {
  const entries = Object.entries(counts) as [Color, number][];
  entries.sort((a, b) => b[1] - a[1]); // by count desc
  const [c1, n1] = entries[0];
  const [, n2] = entries[1];
  if (n1 > n2) return c1;
  const avg = (counts.green * 2 + counts.yellow * 1) / (counts.green + counts.yellow + counts.red);
  return avg >= 1.33 ? 'green' : avg <= 0.66 ? 'red' : 'yellow';
}

// Reset ritual helper
export function applyResetRitual(day: DayEntry, onlyIfRed = false): DayEntry {
  if (!onlyIfRed || day.color === 'red') {
    return { ...day, color: 'yellow', reset: true, note: appendNote(day.note, 'Reset Ritual') };
  }
  return { ...day, reset: true, note: appendNote(day.note, 'Reset Ritual (no color change)') };
}

function appendNote(prev: string | undefined, add: string) {
  return prev && prev.trim().length ? `${prev} • ${add}` : add;
}

// ---------- CSV / JSON import-export ----------

export function monthToCSV(m: LifeAreaMonth): string {
  const header = 'date,color,note,reset';
  const rows = m.days
    .sort((a,b) => a.date.localeCompare(b.date))
    .map(d => `${d.date},${d.color},"${(d.note ?? '').replace(/"/g,'""')}",${d.reset ? 1 : 0}`);
  return [header, ...rows].join('\n');
}

export function monthFromCSV(csv: string, lifeAreaId: string, year: number, month: number): LifeAreaMonth {
  const [head, ...lines] = csv.split(/\r?\n/).filter(Boolean);
  const idx = indexMap(head);
  const days: DayEntry[] = [];

  for (const line of lines) {
    const cols = parseCSVLine(line);
    const date = cols[idx.date];
    const color = cols[idx.color] as Color;
    const note = cols[idx.note] ? unquote(cols[idx.note]) : undefined;
    const reset = cols[idx.reset] ? cols[idx.reset] === '1' : false;

    validateMonthMatch(date, year, month);
    validateColor(color);

    days.push({ date, color, note, reset });
  }
  return { lifeAreaId, year, month, days };
}

export function monthToJSON(m: LifeAreaMonth): string {
  return JSON.stringify(m, null, 2);
}

export function monthFromJSON(json: string): LifeAreaMonth {
  const m = JSON.parse(json) as LifeAreaMonth;
  validateMonthShape(m);
  m.days.forEach(d => { validateMonthMatch(d.date, m.year, m.month); validateColor(d.color); });
  return m;
}

// ---- tiny CSV helpers ----
function indexMap(header: string) {
  const cols = header.split(',').map(s => s.trim().toLowerCase());
  const get = (k: string) => {
    const i = cols.indexOf(k);
    if (i < 0) throw new Error(`CSV missing column: ${k}`);
    return i;
  };
  return { date: get('date'), color: get('color'), note: get('note'), reset: get('reset') };
}

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let field = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i+1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQ = false;
      else field += ch;
    } else {
      if (ch === ',') { out.push(field); field = ''; }
      else if (ch === '"') inQ = true;
      else field += ch;
    }
  }
  out.push(field);
  return out;
}
function unquote(s: string) { return s.replace(/^"(.*)"$/s, '$1').replace(/""/g, '"'); }

function validateMonthMatch(dateISO: string, year: number, month: number) {
  const d = new Date(dateISO);
  if (isNaN(d.getTime())) throw new Error(`Bad date: ${dateISO}`);
  if (d.getUTCFullYear() !== year || (d.getUTCMonth()+1) !== month)
    throw new Error(`Date ${dateISO} not in ${year}-${String(month).padStart(2,'0')}`);
}

function validateColor(c: string) {
  if (c !== 'green' && c !== 'yellow' && c !== 'red') throw new Error(`Bad color: ${c}`);
}

function validateMonthShape(m: LifeAreaMonth) {
  if (!m || !Array.isArray(m.days)) throw new Error('Invalid month JSON shape');
}