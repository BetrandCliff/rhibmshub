'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type UploadFormProps = {
  departments: { id: string; name: string }[];
  groups: { id: string; label: string }[];
};

export default function UploadForm({ departments, groups }: UploadFormProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(event.currentTarget),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || 'Upload failed. Please try again.');
        setBusy(false);
        return;
      }

      router.push('/documents?uploaded=1');
      router.refresh();
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} encType="multipart/form-data">
      <div className="field">
        <label htmlFor="title">Title</label>
        <input className="input" id="title" name="title" required />
      </div>
      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea className="input" id="description" name="description" />
      </div>
      <div className="field">
        <label htmlFor="file">File</label>
        <input className="input" id="file" type="file" name="file" accept=".pdf,.doc,.docx" required />
      </div>
      <div className="field">
        <label htmlFor="departmentId">Department access</label>
        <select className="input" id="departmentId" name="departmentId" defaultValue="">
          <option value="">No department access</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>{department.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="groupId">Restrict access to a group (optional)</label>
        <select className="input" id="groupId" name="groupId" defaultValue="">
          <option value="">Use department access above</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.label}</option>
          ))}
        </select>
      </div>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? 'Uploading…' : 'Upload securely'}
      </button>
    </form>
  );
}
