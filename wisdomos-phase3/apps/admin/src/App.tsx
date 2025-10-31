import { useEffect, useState } from 'react';
import { supabase } from './supabase';

type Area = {
  id: string;
  name: string;
  slug: string;
  commitment: string;
  attention_level: number;
};

type CoachView = {
  id: string;
  area_id: string;
  name: string;
  context_prompt: string;
  status: string;
};

type FulfillmentRow = {
  area_id: string;
  name: string;
  avg_signal_30d: number | null;
  assessment_avg_90d: number | null;
  last_signal_at: string | null;
};

export default function App() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [coaches, setCoaches] = useState<CoachView[]>([]);
  const [dash, setDash] = useState<FulfillmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newArea, setNewArea] = useState({ name: '', slug: '', commitment: '' });

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const { data: areaRows, error: areaError } = await supabase
        .from('areas')
        .select('*')
        .order('name');

      if (areaError) throw areaError;
      setAreas(areaRows || []);

      const { data: coachRows, error: coachError } = await supabase
        .from('coaches')
        .select('*');

      if (coachError) throw coachError;
      setCoaches(coachRows || []);

      const { data: dashRows, error: dashError } = await supabase
        .from('v_area_fulfillment')
        .select('*')
        .order('name');

      if (dashError) throw dashError;
      setDash(dashRows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addArea() {
    if (!newArea.name || !newArea.slug) {
      alert('Please provide both name and slug');
      return;
    }

    try {
      // Insert area
      const { data: insertedArea, error: insertError } = await supabase
        .from('areas')
        .insert([newArea])
        .select()
        .single();

      if (insertError) throw insertError;

      // Seed coach via edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-factory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            area_id: insertedArea.id,
            area_name: newArea.name,
            commitment: newArea.commitment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create coach');
      }

      setNewArea({ name: '', slug: '', commitment: '' });
      await load();
      alert('Area and coach created successfully!');
    } catch (err) {
      alert(
        'Error: ' + (err instanceof Error ? err.message : 'Failed to add area')
      );
      console.error('Add area error:', err);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          fontFamily: 'Inter, system-ui',
          padding: 20,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          fontFamily: 'Inter, system-ui',
          padding: 20,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <h1>Error</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <p>
          Please check your Supabase configuration in .env file and ensure the
          database schema is applied.
        </p>
        <button onClick={load}>Retry</button>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui',
        padding: 20,
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <h1>WisdomOS — Coaches Admin</h1>
      <p>Manage life areas, coaches, signals, and WE2 assessments</p>

      <section style={{ marginTop: 24 }}>
        <h2>Fulfillment Dashboard (30/90 days)</h2>
        {dash.length === 0 ? (
          <p>No data yet. Add some areas and record signals/assessments.</p>
        ) : (
          <table width="100%" cellPadding={8}>
            <thead>
              <tr>
                <th>Area</th>
                <th>Avg Signal (30d)</th>
                <th>Assessment Avg (90d)</th>
                <th>Last Signal</th>
              </tr>
            </thead>
            <tbody>
              {dash.map((r) => (
                <tr key={r.area_id}>
                  <td>{r.name}</td>
                  <td>{r.avg_signal_30d?.toFixed(1) ?? '-'}</td>
                  <td>{r.assessment_avg_90d?.toFixed(1) ?? '-'}</td>
                  <td>
                    {r.last_signal_at
                      ? new Date(r.last_signal_at).toLocaleString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Areas</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 2fr 140px',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <input
            placeholder="Name"
            value={newArea.name}
            onChange={(e) => setNewArea((a) => ({ ...a, name: e.target.value }))}
          />
          <input
            placeholder="slug"
            value={newArea.slug}
            onChange={(e) => setNewArea((a) => ({ ...a, slug: e.target.value }))}
          />
          <input
            placeholder="Commitment"
            value={newArea.commitment}
            onChange={(e) =>
              setNewArea((a) => ({ ...a, commitment: e.target.value }))
            }
          />
          <button onClick={addArea}>Add + Coach</button>
        </div>
        {areas.length === 0 ? (
          <p>No areas yet. Add your first area above.</p>
        ) : (
          <ul>
            {areas.map((a) => (
              <li key={a.id}>
                <strong>{a.name}</strong> ({a.slug}) — {a.commitment}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Coaches</h2>
        {coaches.length === 0 ? (
          <p>No coaches yet. They are created automatically when you add areas.</p>
        ) : (
          <ul>
            {coaches.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong> [{c.status}] &nbsp;
                <small>ctx: {c.context_prompt.slice(0, 80)}…</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Quick Signal Entry</h2>
        <SignalForm areas={areas} onSuccess={load} />
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>WE2 Assessment Entry</h2>
        <AssessmentForm areas={areas} onSuccess={load} />
      </section>
    </div>
  );
}

function SignalForm({
  areas,
  onSuccess,
}: {
  areas: Area[];
  onSuccess: () => void;
}) {
  const [state, setState] = useState({
    area_id: '',
    key: '',
    value: 3,
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!state.area_id || !state.key) {
      alert('Please select area and enter dimension key');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/signal-write`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(state),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save signal');
      }

      setState({ area_id: '', key: '', value: 3, note: '' });
      onSuccess();
      alert('Signal saved!');
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Failed to save'));
      console.error('Signal save error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 120px 2fr 120px',
        gap: 8,
      }}
    >
      <select
        value={state.area_id}
        onChange={(e) => setState((s) => ({ ...s, area_id: e.target.value }))}
        disabled={submitting}
      >
        <option value="">Select Area</option>
        {areas.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <input
        placeholder="dimension_key (e.g., vitality)"
        value={state.key}
        onChange={(e) => setState((s) => ({ ...s, key: e.target.value }))}
        disabled={submitting}
      />
      <input
        type="number"
        min={0}
        max={5}
        step={0.1}
        value={state.value}
        onChange={(e) =>
          setState((s) => ({ ...s, value: Number(e.target.value) }))
        }
        disabled={submitting}
      />
      <input
        placeholder="note (optional)"
        value={state.note}
        onChange={(e) => setState((s) => ({ ...s, note: e.target.value }))}
        disabled={submitting}
      />
      <button onClick={submit} disabled={submitting}>
        {submitting ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

function AssessmentForm({
  areas,
  onSuccess,
}: {
  areas: Area[];
  onSuccess: () => void;
}) {
  const [state, setState] = useState({
    area_id: '',
    person_name: '',
    weekend: 2,
    relatedness: 3,
    workability: 3,
    reliability: 3,
    openness: 3,
  });
  const [submitting, setSubmitting] = useState(false);

  async function ensurePerson(full_name: string) {
    const { data: found } = await supabase
      .from('people')
      .select('id')
      .eq('full_name', full_name)
      .maybeSingle();

    if (found?.id) return found.id;

    const { data, error } = await supabase
      .from('people')
      .insert([{ full_name }])
      .select('id')
      .single();

    if (error) throw error;
    return data.id as string;
  }

  async function submit() {
    if (!state.area_id || !state.person_name) {
      alert('Please select area and enter person name');
      return;
    }

    try {
      setSubmitting(true);
      const person_id = await ensurePerson(state.person_name);

      const { error } = await supabase.from('assessments').insert([
        {
          area_id: state.area_id,
          person_id,
          weekend: state.weekend,
          relatedness: state.relatedness,
          workability: state.workability,
          reliability: state.reliability,
          openness: state.openness,
        },
      ]);

      if (error) throw error;

      setState((s) => ({ ...s, person_name: '' }));
      onSuccess();
      alert('Assessment saved!');
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Failed to save'));
      console.error('Assessment save error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 2fr 100px repeat(4,110px) 120px',
        gap: 8,
      }}
    >
      <select
        value={state.area_id}
        onChange={(e) => setState((s) => ({ ...s, area_id: e.target.value }))}
        disabled={submitting}
      >
        <option value="">Select Area</option>
        {areas.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <input
        placeholder="Person full name"
        value={state.person_name}
        onChange={(e) => setState((s) => ({ ...s, person_name: e.target.value }))}
        disabled={submitting}
      />
      <input
        type="number"
        min={2}
        max={5}
        value={state.weekend}
        onChange={(e) =>
          setState((s) => ({ ...s, weekend: Number(e.target.value) }))
        }
        disabled={submitting}
        title="Weekend (2-5)"
      />
      <input
        type="number"
        min={0}
        max={5}
        step={0.1}
        value={state.relatedness}
        onChange={(e) =>
          setState((s) => ({ ...s, relatedness: Number(e.target.value) }))
        }
        disabled={submitting}
        title="Relatedness"
      />
      <input
        type="number"
        min={0}
        max={5}
        step={0.1}
        value={state.workability}
        onChange={(e) =>
          setState((s) => ({ ...s, workability: Number(e.target.value) }))
        }
        disabled={submitting}
        title="Workability"
      />
      <input
        type="number"
        min={0}
        max={5}
        step={0.1}
        value={state.reliability}
        onChange={(e) =>
          setState((s) => ({ ...s, reliability: Number(e.target.value) }))
        }
        disabled={submitting}
        title="Reliability"
      />
      <input
        type="number"
        min={0}
        max={5}
        step={0.1}
        value={state.openness}
        onChange={(e) =>
          setState((s) => ({ ...s, openness: Number(e.target.value) }))
        }
        disabled={submitting}
        title="Openness"
      />
      <button onClick={submit} disabled={submitting}>
        {submitting ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
