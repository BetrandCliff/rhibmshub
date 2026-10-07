'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type SuggestionRow = { id: string; message: string; createdAt: string };

export default function SuggestionInboxTable({ suggestions }: { suggestions: SuggestionRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function remove(ids: string[]) {
    if (!ids.length || !window.confirm(`Delete ${ids.length} selected suggestion${ids.length === 1 ? '' : 's'} permanently?`)) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/suggestions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || 'Suggestions could not be deleted.');
        setBusy(false);
        return;
      }
      setSelected([]);
      setBusy(false);
      router.refresh();
    } catch {
      setError('We could not reach the server. Try again.');
      setBusy(false);
    }
  }

  return (
    <>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <div className="bulk-actions">
        <label><input type="checkbox" checked={suggestions.length > 0 && selected.length === suggestions.length} onChange={(event) => setSelected(event.target.checked ? suggestions.map((item) => item.id) : [])} /> Select all</label>
        <button className="btn secondary" type="button" disabled={busy || !selected.length} onClick={() => remove(selected)}>{busy ? 'Deleting…' : `Delete selected${selected.length ? ` (${selected.length})` : ''}`}</button>
      </div>
      <div className="supervision-table">
        <table className="table">
          <thead><tr><th>Select</th><th>Suggestion</th><th>Submitted</th><th>Action</th></tr></thead>
          <tbody>{suggestions.map((item) => (
            <tr key={item.id}>
              <td><input type="checkbox" aria-label="Select suggestion" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /></td>
              <td><div className="suggestion-message">{item.message}</div></td>
              <td>{new Date(item.createdAt).toLocaleString()}</td>
              <td><button className="btn secondary" type="button" disabled={busy} onClick={() => remove([item.id])}>Delete</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
