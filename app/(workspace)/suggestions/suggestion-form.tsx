'use client';

import { useState } from 'react';
import { showToast } from '@/components/toast-provider';

export default function SuggestionForm() {
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = event.currentTarget;
    const response = await fetch('/api/suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: new FormData(form).get('message') }) });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { showToast('Could not submit suggestion', result.error || 'Please try again.', 'error'); return; }
    form.reset();
    showToast('Suggestion submitted', 'Thank you for helping improve the workspace.', 'success');
  }
  return <form onSubmit={submit}>
    <div className="field"><label htmlFor="suggestion-message">Your suggestion</label><textarea className="input" id="suggestion-message" name="message" required minLength={5} maxLength={3000} rows={6} placeholder="Tell us what would make your campus workspace better…" /></div>
    <button className="btn" disabled={busy}>{busy ? 'Submitting…' : 'Send suggestion'}</button>
    <p className="muted suggestion-privacy">Suggestions are visible to academic administrators only.</p>
  </form>;
}
