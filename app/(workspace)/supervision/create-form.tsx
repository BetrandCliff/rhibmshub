'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSupervisionForm() {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setBusy(true); const element = e.currentTarget; const form = new FormData(element);
    const response = await fetch('/api/supervision', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), researchTitle: form.get('researchTitle'), nextMeeting: form.get('nextMeeting') || null }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setError(result.error || 'Could not save this supervision record.'); setBusy(false); return; }
    element.reset(); setBusy(false); router.refresh();
  }
  return <form className="supervision-form" onSubmit={submit}>{error && <div className="error">{error}</div>}<div className="form-pair"><div className="field"><label>Student email</label><input className="input" type="email" name="email" placeholder="student@university.edu" required/></div><div className="field"><label>Next meeting <span className="muted">(optional)</span></label><input className="input" type="date" name="nextMeeting"/></div></div><div className="field"><label>Research topic or project title</label><input className="input" name="researchTitle" minLength={3} maxLength={200} placeholder="e.g. Secure data systems for rural health" required/></div><button className="btn" disabled={busy}>{busy ? 'Adding student…' : '＋  Add supervisee'}</button></form>;
}
