// PersonCard.tsx
import React from 'react';
import { Color, MonthSummary } from '@/lib/fulfillment';

export interface PersonCardProps {
  open: boolean;
  onClose: () => void;
  person: {
    id: string;
    name: string;
    role?: string;
    avatarUrl?: string;
    lastContactAt?: string;        // ISO
    lastContactChannel?: string;
    lastContactNote?: string;
    interactions?: Array<{
      at: string;                  // ISO
      channel?: string;
      note?: string;
      color?: Color;
    }>;
    linkedAreas?: Array<{
      lifeAreaId: string;
      name: string;
      monthSummary?: MonthSummary; // from Table model
    }>;
    nextTouchpoint?: { at: string; note?: string };
  };
}

export default function PersonCard({ open, onClose, person }: PersonCardProps) {
  if (!open) return null;
  return (
    <div className="pc__backdrop" role="dialog" aria-modal="true" aria-label={`${person.name} details`}>
      <div className="pc__panel">
        <div className="pc__header">
          <div className="pc__id">
            {person.avatarUrl
              ? <img src={person.avatarUrl} alt={`${person.name} avatar`} />
              : <div className="pc__initials">{initials(person.name)}</div>
            }
            <div className="pc__name">
              <strong>{person.name}</strong>
              {person.role && <div className="pc__role">{person.role}</div>}
            </div>
          </div>
          <button className="pc__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="pc__section">
          <div className="pc__row"><span>Last Contact:</span>
            <span>{formatDateTime(person.lastContactAt) || '—'}</span></div>
          <div className="pc__row"><span>Method:</span>
            <span>{person.lastContactChannel || '—'}</span></div>
          <div className="pc__row"><span>Outcome:</span>
            <span>{person.lastContactNote || '—'}</span></div>
        </div>

        {person.linkedAreas && person.linkedAreas.length > 0 && (
          <div className="pc__section">
            <div className="pc__subhead">Linked Life Areas</div>
            <ul className="pc__areas">
              {person.linkedAreas.map(a => (
                <li key={a.lifeAreaId}>
                  <span className={`dot dot--${(a.monthSummary?.color ?? 'gray') as any}`} />
                  {a.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {person.interactions && person.interactions.length > 0 && (
          <div className="pc__section">
            <div className="pc__subhead">Recent Interactions</div>
            <ul className="pc__list">
              {person.interactions.slice(0,5).map((it, idx) => (
                <li key={idx}>
                  <span className={`dot dot--${(it.color ?? 'gray') as any}`} />
                  <span className="pc__when">{formatDateTime(it.at)}</span>
                  <span className="pc__text">
                    {it.channel ? `${it.channel}` : '—'}{it.note ? ` — ${it.note}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {person.nextTouchpoint && (
          <div className="pc__section">
            <div className="pc__subhead">Next Intentional Touchpoint</div>
            <div className="pc__row">
              <span>Due:</span>
              <span>{formatDateTime(person.nextTouchpoint.at)}</span>
            </div>
            {person.nextTouchpoint.note && (
              <div className="pc__row"><span>Note:</span><span>{person.nextTouchpoint.note}</span></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase();
}
function formatDateTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}