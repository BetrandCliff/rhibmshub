'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function removeDocument() {
    if (!window.confirm('Delete this file permanently? Anyone it was shared with will lose access.')) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || 'The document could not be deleted.');
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError('We could not reach the server. Try again.');
      setBusy(false);
    }
  }

  return (
    <span className="document-delete-action">
      <button className="btn secondary" type="button" onClick={removeDocument} disabled={busy}>
        {busy ? 'Deleting…' : 'Delete'}
      </button>
      {error && <small className="error" role="alert">{error}</small>}
    </span>
  );
}
