// Dashboard.tsx
import React from 'react';
import TableView from './TableView';
import PersonCard from './PersonCard';
import { summarizeMonth, LifeAreaMonth, MonthSummary } from '@/lib/fulfillment';
import { CircleViewWrapper, CircleViewWrapperIframe } from './CircleViewWrapper';

type LifeAreasData = Record<string, { name: string; months: LifeAreaMonth[] }>;

export default function Dashboard({
  lifeAreas,
  peopleIndex,       // map personId -> person core fields + linked life areas (ids)
  circleData,        // data feed for CircleView (nodes/edges) if needed
  circleSrc          // if using iframe version
}: {
  lifeAreas: LifeAreasData;
  peopleIndex: Record<string, {
    id: string;
    name: string;
    role?: string;
    avatarUrl?: string;
    lastContactAt?: string;
    lastContactChannel?: string;
    lastContactNote?: string;
    interactions?: Array<{ at: string; channel?: string; note?: string; color?: any }>;
    linkedLifeAreas: string[];   // lifeAreaIds
    nextTouchpoint?: { at: string; note?: string };
  }>;
  circleData?: any;
  circleSrc?: string;
}) {
  const [mode, setMode] = React.useState<'circle'|'table'>('table');
  const [personId, setPersonId] = React.useState<string | null>(null);

  // Build an accessor for month summaries to show dot per linked area
  function areaSummary(lifeAreaId: string): MonthSummary | undefined {
    const area = lifeAreas[lifeAreaId];
    if (!area) return;
    // pick the "current" month set (or last available)
    const months = area.months;
    if (!months || months.length === 0) return;
    const latest = months[months.length - 1];
    return summarizeMonth(latest);
  }

  const person = React.useMemo(() => {
    if (!personId) return null;
    const base = peopleIndex[personId];
    if (!base) return null;
    return {
      id: base.id,
      name: base.name,
      role: base.role,
      avatarUrl: base.avatarUrl,
      lastContactAt: base.lastContactAt,
      lastContactChannel: base.lastContactChannel,
      lastContactNote: base.lastContactNote,
      interactions: base.interactions,
      linkedAreas: base.linkedLifeAreas.map(lifeAreaId => ({
        lifeAreaId,
        name: lifeAreas[lifeAreaId]?.name ?? lifeAreaId,
        monthSummary: areaSummary(lifeAreaId),
      })),
      nextTouchpoint: base.nextTouchpoint,
    };
  }, [personId, peopleIndex, lifeAreas]);

  return (
    <div className="dash">
      <div className="dash__bar">
        <div className="dash__toggle">
          <button className={mode==='table'?'is-active':''} onClick={() => setMode('table')}>Table View</button>
          <button className={mode==='circle'?'is-active':''} onClick={() => setMode('circle')}>Circle View</button>
        </div>
      </div>

      <div className="dash__content">
        {mode === 'table' ? (
          <TableView data={lifeAreas} year={currentYear()} />
        ) : circleSrc ? (
          <CircleViewWrapperIframe
            src={circleSrc}
            onPersonClick={setPersonId}
            dataForCircle={circleData}
          />
        ) : (
          <CircleViewWrapper
            data={circleData}
            onPersonClick={setPersonId}
          />
        )}
      </div>

      <PersonCard
        open={!!person}
        onClose={() => setPersonId(null)}
        person={person ?? {
          id: '', name: ''
        }}
      />
    </div>
  );
}

function currentYear() { return new Date().getFullYear(); }