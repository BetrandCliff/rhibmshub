'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type TokenCategory = 'LECTURER' | 'HOD_DEAN' | 'HIGHER_AUTHORITY';
type StaffToken = { id: string; token: string; category: TokenCategory; expiresAt: string | Date; createdAt: string | Date };
const categoryLabels: Record<TokenCategory, string> = { LECTURER: 'Lecturers', HOD_DEAN: 'HODs and Deans', HIGHER_AUTHORITY: 'Higher authorities' };

function defaultExpiry() {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export default function StaffTokenManager({ tokens }: { tokens: StaffToken[] }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [expiry, setExpiry] = useState(defaultExpiry);
  const [category, setCategory] = useState<TokenCategory>('LECTURER');
  const router = useRouter();

  async function createToken(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    const response = await fetch('/api/admin/staff-tokens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresAt: new Date(expiry).toISOString(), category }) });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setError(result.error || 'Could not generate the token.'); return; }
    setExpiry(defaultExpiry()); router.refresh();
  }

  async function deleteToken(id: string) {
    setError(''); setBusy(true);
    const response = await fetch('/api/admin/staff-tokens', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setError(result.error || 'Could not delete the token.'); return; }
    router.refresh();
  }

  return <section className="card staff-token-card">
    <div className="dashboard-section-head"><div><h2>Staff signup tokens</h2><p>Create one-time codes for staff account registration.</p></div><span className="private-chip">ADMIN ONLY</span></div>
    <form className="staff-token-form" onSubmit={createToken}><label className="field"><span>Token category</span><select className="input" value={category} onChange={(event) => setCategory(event.target.value as TokenCategory)}>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="field"><span>Token expiration</span><input className="input" type="datetime-local" value={expiry} min={defaultExpiry()} onChange={(event) => setExpiry(event.target.value)} required/></label><button className="btn" disabled={busy}>{busy ? 'Working…' : 'Generate token'}</button></form>
    {error && <div className="error">{error}</div>}
    <div className="dashboard-section-head staff-token-list-head"><div><h2>Available tokens</h2><p>Unused tokens are shown here, including expired ones.</p></div><span className="badge">{tokens.length}</span></div>
    {tokens.length ? <div className="staff-token-list">{tokens.map((item) => { const expired = new Date(item.expiresAt) <= new Date(); return <article key={item.id}><code>{item.token}</code><span>{categoryLabels[item.category]}</span><span className={expired ? 'token-expired' : ''}>{expired ? 'Expired' : 'Expires'} {new Date(item.expiresAt).toLocaleString()}</span><button className="btn secondary" type="button" disabled={busy} onClick={() => deleteToken(item.id)}>Delete</button></article>; })}</div> : <div className="empty-state"><b>No staff tokens yet</b><p>Generate a token to let a staff member create an account.</p></div>}
  </section>;
}
