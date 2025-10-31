// TableView.tsx
import React, { useMemo, useState } from 'react';
import {
  LifeAreaMonth, summarizeMonth, Color, DayEntry,
  applyResetRitual, monthToCSV, monthToJSON, monthFromCSV, monthFromJSON, daysInMonth
} from '@/lib/fulfillment';

type Props = {
  data: Record<string, { name: string; months: LifeAreaMonth[] }>;
  year: number;
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const;

function Dot({ color }: { color: 'green'|'yellow'|'red'|'gray' }) {
  return <span className={`dot dot--${color}`} aria-label={color} />;
}

export default function TableView({ data, year }: Props) {
  const [expanded, setExpanded] = useState<{ lifeAreaId?: string; month?: number }>({});

  return (
    <div className="tracker">
      <table className="tracker__table" role="grid" aria-label="Fulfillment tracker">
        <thead>
          <tr>
            <th>Life Area</th>
            {MONTHS.map((m) => <th key={m}>{m}</th>)}
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([lifeAreaId, { name, months }]) => {
            const byMonth = new Map(months.map(m => [m.month, m]));
            return (
              <React.Fragment key={lifeAreaId}>
                <tr>
                  <td className="area">{name}</td>
                  {MONTHS.map((m, idx) => {
                    const monthIdx = idx + 1;
                    const lm = byMonth.get(monthIdx);
                    const sum = lm ? summarizeMonth(lm) :
                      { color: 'gray' as const, counts: {green:0,yellow:0,red:0}, coverage:0, weightedAvg:0 };
                    const isOpen = expanded.lifeAreaId === lifeAreaId && expanded.month === monthIdx;
                    return (
                      <td key={m}>
                        <button
                          className="monthCell"
                          onClick={() => setExpanded(isOpen ? {} : { lifeAreaId, month: monthIdx })}
                          aria-expanded={isOpen}
                          aria-label={`${name} ${m} summary ${sum.color} (${sum.coverage}% coverage)`}
                        >
                          <Dot color={sum.color} />
                        </button>
                      </td>
                    );
                  })}
                </tr>

                {MONTHS.map((m, idx) => {
                  const monthIdx = idx + 1;
                  const lm = byMonth.get(monthIdx);
                  const isOpen = expanded.lifeAreaId === lifeAreaId && expanded.month === monthIdx;
                  if (!isOpen || !lm) return null;

                  return (
                    <tr key={`${lifeAreaId}-${monthIdx}-expanded`} className="expanded">
                      <td colSpan={13}>
                        <ExpandedMonth lifeAreaName={name} monthName={m} month={lm} />
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type PaintState = { painting: boolean; color: Color | null; onlyEmpty?: boolean };

function ExpandedMonth({ lifeAreaName, monthName, month }: { lifeAreaName: string; monthName: string; month: LifeAreaMonth }) {
  const [data, setData] = React.useState<LifeAreaMonth>(month);
  const [paint, setPaint] = React.useState<PaintState>({ painting: false, color: null });
  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);

  // Keyboard painting color: hold G/Y/R
  const [kbdPaintColor, setKbdPaintColor] = React.useState<Color | null>(null);

  const rows = useMemo(() =>
    [...data.days].sort((a,b) => new Date(a.date).getDate() - new Date(b.date).getDate()),
  [data.days]);

  React.useEffect(() => {
    const up = () => setPaint(p => ({ ...p, painting: false, color: null }));
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, []);

  // --- Keyboard handlers ---
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // hold color
      if (e.key === 'g' || e.key === 'G') setKbdPaintColor('green');
      if (e.key === 'y' || e.key === 'Y') setKbdPaintColor('yellow');
      if (e.key === 'r' || e.key === 'R') {
        if (e.shiftKey) { // Reset Ritual
          if (selectedIdx !== null) onReset(selectedIdx, false);
          e.preventDefault();
          return;
        }
        setKbdPaintColor('red');
      }

      const step = (delta: number) => {
        if (data.days.length === 0) return;
        if (selectedIdx === null) selectIdx(0, !!kbdPaintColor);
        else selectIdx(selectedIdx + delta, !!kbdPaintColor);
        e.preventDefault();
      };

      switch (e.key) {
        case 'ArrowLeft':  step(-1); break;
        case 'ArrowRight': step(+1); break;
        case 'ArrowUp':    step(-7); break;
        case 'ArrowDown':  step(+7); break;
        case 'Enter':
        case ' ': // paint on demand
          if (kbdPaintColor && selectedIdx !== null) {
            setDayColor(selectedIdx, kbdPaintColor);
            e.preventDefault();
          }
          break;
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'g' || e.key === 'G' || e.key === 'y' || e.key === 'Y' || (e.key === 'r' && !e.shiftKey)) {
        setKbdPaintColor(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [data.days.length, selectedIdx, kbdPaintColor]);

  function setDayColor(dayIdx: number, color: Color) {
    setData(prev => {
      const days = [...prev.days];
      const d = { ...days[dayIdx], color };
      days[dayIdx] = d;
      return { ...prev, days };
    });
  }
  function clampIdx(i: number) {
    return Math.max(0, Math.min(i, data.days.length - 1));
  }
  function selectIdx(i: number, andPaint?: boolean) {
    if (data.days.length === 0) return;
    const idx = clampIdx(i);
    setSelectedIdx(idx);
    if (andPaint && kbdPaintColor) setDayColor(idx, kbdPaintColor);
  }

  // Drag/paint with mouse/touch (palette)
  function paintDay(idx: number, color: Color) {
    setDayColor(idx, color);
  }
  function onDayDown(idx: number, color: Color) {
    setPaint({ painting: true, color });
    paintDay(idx, color);
    setSelectedIdx(idx);
  }
  function onDayEnter(idx: number) {
    if (paint.painting && paint.color) paintDay(idx, paint.color);
  }

  // Reset ritual
  function onReset(idx: number, onlyIfRed = false) {
    setData(prev => {
      const days = [...prev.days];
      const d = applyResetRitual(days[idx], onlyIfRed);
      days[idx] = d;
      return { ...prev, days };
    });
  }

  // Bulk fill missing → Yellow
  function bulkFillMissingYellow() {
    const dim = daysInMonth(data.year, data.month);
    const existing = new Set<number>(data.days.map(d => new Date(d.date).getDate()));
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = String(data.year);
    const mm = pad(data.month);

    const additions: DayEntry[] = [];
    for (let day = 1; day <= dim; day++) {
      if (!existing.has(day)) {
        additions.push({
          date: `${yyyy}-${mm}-${pad(day)}`,
          color: 'yellow',
          note: 'Bulk fill: missing → yellow',
        });
      }
    }
    if (additions.length === 0) return;
    setData(prev => ({ ...prev, days: [...prev.days, ...additions] }));
  }

  // Import/Export
  function exportCSV() {
    const csv = monthToCSV(data);
    download(csv, `${lifeAreaName}-${monthName}-${data.year}.csv`, 'text/csv');
  }
  function exportJSON() {
    const json = monthToJSON(data);
    download(json, `${lifeAreaName}-${monthName}-${data.year}.json`, 'application/json');
  }
  async function importCSV(file: File) {
    const text = await file.text();
    try {
      const next = monthFromCSV(text, data.lifeAreaId, data.year, data.month);
      setData(next);
    } catch (err) { alert(String(err)); }
  }
  async function importJSON(file: File) {
    const text = await file.text();
    try {
      const next = monthFromJSON(text);
      if (next.lifeAreaId !== data.lifeAreaId || next.year !== data.year || next.month !== data.month) {
        throw new Error('JSON month id/year/month mismatch');
      }
      setData(next);
    } catch (err) { alert(String(err)); }
  }

  return (
    <div
      className={`expanded__panel${kbdPaintColor ? ` is-painting-kbd color--${kbdPaintColor}` : ''}`}
      role="region"
      aria-label={`${lifeAreaName} ${monthName} details`}
    >
      <div className="expanded__header">
        <strong>{lifeAreaName} — {monthName} {data.year}</strong>
        <div className="actions">
          <PaintPalette onPick={c => setPaint({ painting: false, color: c })} active={paint.color}/>
          <label className="importBtn">Import CSV
            <input type="file" accept=".csv" onChange={e => e.target.files && importCSV(e.target.files[0])}/>
          </label>
          <label className="importBtn">Import JSON
            <input type="file" accept=".json" onChange={e => e.target.files && importJSON(e.target.files[0])}/>
          </label>
          <button onClick={exportCSV}>Export CSV</button>
          <button onClick={exportJSON}>Export JSON</button>
          <button onClick={bulkFillMissingYellow}>Fill missing days → Yellow</button>
        </div>
      </div>

      <table className="expanded__table" role="grid">
        <thead>
          <tr><th>Day</th><th>Status</th><th>Note</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((d) => {
            const dayIdx = data.days.findIndex(x => x.date === d.date);
            const dayNum = new Date(d.date).getDate();
            return (
              <tr key={d.date}
                  tabIndex={0}
                  className={selectedIdx === dayIdx ? 'is-selected' : ''}
                  onClick={() => setSelectedIdx(dayIdx)}
                  onMouseEnter={() => onDayEnter(dayIdx)}
                  onTouchMove={() => onDayEnter(dayIdx)}
                  onKeyDown={(ev) => {
                    if ((ev.key === 'Enter' || ev.key === ' ') && kbdPaintColor) {
                      setDayColor(dayIdx, kbdPaintColor);
                      ev.preventDefault();
                    }
                  }}
              >
                <td>{dayNum}</td>
                <td
                  className="paintCell"
                  onMouseDown={() => onDayDown(dayIdx, (paint.color ?? 'green'))}
                  onTouchStart={() => onDayDown(dayIdx, (paint.color ?? 'green'))}
                >
                  <Dot color={d.color as any} />
                  {/* Ghost preview when a keyboard color is held */}
                  {kbdPaintColor && <span className={`dot dot--${kbdPaintColor} dot--ghost`} aria-hidden="true" />}
                </td>
                <td>{d.note ?? ''}{d.reset ? '  • Reset Ritual' : ''}</td>
                <td className="rowActions">
                  <button onClick={() => onReset(dayIdx, false)}>Reset Ritual → Yellow</button>
                  <button onClick={() => onReset(dayIdx, true)}>Reset (only if Red)</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PaintPalette({ onPick, active }: { onPick: (c: Color)=>void; active: Color | null }) {
  const colors: Color[] = ['green','yellow','red'];
  return (
    <div className="palette" role="radiogroup" aria-label="Paint color">
      {colors.map(c => (
        <button key={c}
          className={`dot dot--${c} ${active===c?'is-active':''}`}
          role="radio" aria-checked={active===c}
          onClick={() => onPick(c)} />
      ))}
      <span className="palette__hint">Pick a color, then drag across days or hold G/Y/R + arrows</span>
    </div>
  );
}

function download(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}