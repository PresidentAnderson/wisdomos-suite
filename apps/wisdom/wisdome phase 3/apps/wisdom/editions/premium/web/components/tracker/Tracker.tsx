import React, { useEffect, useState, useCallback } from 'react';
import StatusDot, { TrackerStatus } from './StatusDot';
import { useAuth } from '../../lib/auth-context';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface TrackerRow {
  id: number;
  name: string;
  lifeAreaId: string;
  statuses: (TrackerStatus)[];
}

interface TrackerProps {
  year?: number;
  onStatusChange?: (lifeAreaName: string, month: number, status: TrackerStatus) => void;
}

export default function Tracker({ year: propYear, onStatusChange }: TrackerProps) {
  const { user, token } = useAuth();
  const [year] = useState(propYear || new Date().getFullYear());
  const [rows, setRows] = useState<TrackerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackerData = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracker/${year}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracker data');
      }

      const data = await response.json();
      setRows(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tracker:', err);
      setError('Failed to load tracker data');
    } finally {
      setLoading(false);
    }
  }, [year, token]);

  useEffect(() => {
    fetchTrackerData();
  }, [fetchTrackerData]);

  const cycleStatus = async (rowIdx: number, monthIdx: number) => {
    const row = rows[rowIdx];
    const currentStatus = row.statuses[monthIdx];
    
    // Cycle: null -> green -> yellow -> red -> null
    const nextStatus: TrackerStatus = 
      currentStatus === null ? 'green' :
      currentStatus === 'green' ? 'yellow' :
      currentStatus === 'yellow' ? 'red' :
      null;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracker/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackerId: row.id,
          year,
          month: monthIdx + 1,
          status: nextStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      const newRows = [...rows];
      newRows[rowIdx] = {
        ...row,
        statuses: row.statuses.map((s, i) => i === monthIdx ? nextStatus : s),
      };
      setRows(newRows);

      // Notify parent component
      if (onStatusChange) {
        onStatusChange(row.name, monthIdx + 1, nextStatus);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          🎨 Color-Coded Visual Tracker
          <span className="text-sm font-normal text-gray-400">({year})</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Track your progress across all life areas month by month
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-3 text-gray-400 font-medium text-sm">#</th>
              <th className="text-left p-3 text-gray-400 font-medium text-sm">Life Area</th>
              {MONTHS.map(month => (
                <th key={month} className="text-center p-3 text-gray-400 font-medium text-xs">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                <td className="p-3 text-gray-500 text-sm">{rowIdx + 1}</td>
                <td className="p-3">
                  <span className="text-white font-medium">
                    {row.name}
                    {row.name === 'Music Production' && (
                      <span className="ml-2 text-xs text-purple-400">🎵</span>
                    )}
                  </span>
                </td>
                {row.statuses.map((status, monthIdx) => (
                  <td key={monthIdx} className="p-3 text-center">
                    <StatusDot
                      status={status}
                      onClick={() => cycleStatus(rowIdx, monthIdx)}
                      size="md"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <StatusDot status="green" size="sm" />
          <span>Thriving</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status="yellow" size="sm" />
          <span>Attention</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status="red" size="sm" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={null} size="sm" />
          <span>Untracked</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        💡 Tip: Click any dot to cycle through statuses
      </p>
    </div>
  );
}