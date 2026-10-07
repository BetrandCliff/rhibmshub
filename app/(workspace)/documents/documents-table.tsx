'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DocumentRow = {
  id: string;
  title: string;
  originalName: string;
  departmentName: string;
  uploaderName: string;
  uploadedAt: string;
  canDelete: boolean;
};

export default function DocumentsTable({ documents }: { documents: DocumentRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const deletable = documents.filter((document) => document.canDelete);

  async function remove(ids: string[]) {
    if (!ids.length || !window.confirm(`Permanently delete ${ids.length} file${ids.length === 1 ? '' : 's'}? Anyone they were shared with will lose access.`)) return;
    setBusy(true);
    setError('');
    try {
      const response = ids.length === 1
        ? await fetch(`/api/documents/${ids[0]}`, { method: 'DELETE' })
        : await fetch('/api/documents/bulk-delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
          });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || 'The selected files could not be deleted.');
        setBusy(false);
        return;
      }
      setSelected([]);
      if (result.failed?.length) setError(`${result.deleted.length} file(s) deleted; ${result.failed.length} could not be deleted.`);
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
        <label><input type="checkbox" checked={deletable.length > 0 && selected.length === deletable.length} onChange={(event) => setSelected(event.target.checked ? deletable.map((item) => item.id) : [])} /> Select all files I can delete</label>
        <button className="btn secondary" type="button" disabled={busy || !selected.length} onClick={() => remove(selected)}>{busy ? 'Deleting…' : `Delete selected${selected.length ? ` (${selected.length})` : ''}`}</button>
      </div>
      <div className="supervision-table">
        <table className="table">
          <thead><tr><th>Select</th><th>Document</th><th>Department</th><th>Uploader</th><th>Uploaded</th><th>Actions</th></tr></thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id}>
                <td>{document.canDelete && <input type="checkbox" aria-label={`Select ${document.title}`} checked={selected.includes(document.id)} onChange={() => setSelected((current) => current.includes(document.id) ? current.filter((id) => id !== document.id) : [...current, document.id])} />}</td>
                <td><strong>{document.title}</strong><div className="muted">{document.originalName}</div></td>
                <td>{document.departmentName}</td>
                <td>{document.uploaderName}</td>
                <td>{new Date(document.uploadedAt).toLocaleDateString()}</td>
                <td className="document-actions"><a className="btn secondary" href={`/api/documents/${document.id}/download`}>Download</a>{document.canDelete && <button className="btn secondary" type="button" disabled={busy} onClick={() => remove([document.id])}>Delete</button>}</td>
              </tr>
            ))}
            {!documents.length && <tr><td colSpan={6} className="muted">No documents are available to your account yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
