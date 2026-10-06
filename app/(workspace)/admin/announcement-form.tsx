'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnnouncementForm() {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); setError(''); setBusy(true);
    const response = await fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: form.get('title'), summary: form.get('summary'), category: form.get('category') }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setError(result.error || 'Could not publish this campus update.'); setBusy(false); return; }
    element.reset(); setBusy(false); router.refresh();
  }
  return <form className="announcement-form" onSubmit={submit}>{error && <div className="error">{error}</div>}<div className="form-pair"><div className="field"><label>Headline</label><input className="input" name="title" minLength={4} maxLength={120} placeholder="Write a clear headline" required/></div><div className="field"><label>Category</label><select name="category" defaultValue="Announcement"><option>Announcement</option><option>Academic</option><option>Events</option><option>Campus news</option></select></div></div><div className="field"><label>Short summary</label><textarea className="input" name="summary" minLength={10} maxLength={700} rows={3} placeholder="Share the key details students and staff need to know." required/></div><button className="btn" disabled={busy}>{busy ? 'Publishing…' : 'Publish campus update  →'}</button></form>;
}
