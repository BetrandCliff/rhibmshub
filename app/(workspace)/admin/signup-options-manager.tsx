'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Option = { id: string; name: string };

export default function SignupOptionsManager({ departments, positions }: { departments: Option[]; positions: Option[] }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function addOption(event: React.FormEvent<HTMLFormElement>, type: 'department' | 'position') {
    event.preventDefault(); setError(''); setBusy(true);
    const element = event.currentTarget;
    const form = new FormData(element);
    const response = await fetch('/api/admin/signup-options', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, name: form.get('name'), code: form.get('code') }) });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setError(result.error || 'Could not add this option.'); return; }
    element.reset();
    router.refresh();
  }

  async function removePosition(id: string) {
    setError(''); setBusy(true);
    const response = await fetch('/api/admin/signup-options', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setError(result.error || 'Could not remove this position.'); return; }
    router.refresh();
  }

  return <section className="card signup-options-card">
    <div className="dashboard-section-head"><div><h2>Staff signup options</h2><p>Manage the positions and departments staff can choose during registration.</p></div><span className="private-chip">ADMIN ONLY</span></div>
    {error && <div className="error">{error}</div>}
    <div className="signup-options-grid">
      <div><h3>Add a position</h3><form className="signup-option-form" onSubmit={(event) => addOption(event, 'position')}><input className="input" name="name" minLength={2} maxLength={100} placeholder="e.g. Lecturer" required/><button className="btn" disabled={busy}>Add position</button></form><div className="signup-option-list">{positions.map((position) => <article key={position.id}><span>{position.name}</span><button className="btn secondary" type="button" disabled={busy} onClick={() => removePosition(position.id)}>Remove</button></article>)}</div></div>
      <div><h3>Add a department</h3><form className="signup-option-form signup-department-form" onSubmit={(event) => addOption(event, 'department')}><input className="input" name="name" minLength={2} maxLength={100} placeholder="e.g. Nursing" required/><input className="input" name="code" minLength={2} maxLength={12} placeholder="Code, e.g. NUR" required/><button className="btn" disabled={busy}>Add department</button></form><div className="signup-option-list">{departments.map((department) => <article key={department.id}><span>{department.name}</span><small>Available in staff signup</small></article>)}</div></div>
    </div>
  </section>;
}
