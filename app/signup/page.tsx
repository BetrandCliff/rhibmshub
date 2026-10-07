'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/toast-provider';

type SignupOption = { id: string; name: string };

export default function Signup() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [staffPositionId, setStaffPositionId] = useState('');
  const [staffDepartmentId, setStaffDepartmentId] = useState('');
  const [positions, setPositions] = useState<SignupOption[]>([]);
  const [departments, setDepartments] = useState<SignupOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const selectedPosition = positions.find((position) => position.id === staffPositionId)?.name.toLowerCase().replace(/[^a-z]/g, '') || '';
  const needsDepartment = selectedPosition.includes('lecturer') || selectedPosition === 'hod' || selectedPosition.includes('headofdepartment');
  const router = useRouter();

  useEffect(() => {
    if (!isStaff) return;
    let active = true;
    setLoadingOptions(true);
    fetch('/api/auth/signup-options').then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load staff signup options.');
      if (active) { setDepartments(result.departments); setPositions(result.positions); }
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Could not load staff signup options.');
    }).finally(() => { if (active) setLoadingOptions(false); });
    return () => { active = false; };
  }, [isStaff]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          password: form.get('password'),
          isStaff,
          staffToken: form.get('staffToken'),
          staffPositionId,
          staffDepartmentId,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'We could not create your account.');
        setBusy(false);
        return;
      }
      if (data.authenticated === false) {
        showToast('Account created', 'Sign in with your new account to continue.', 'success');
        router.push('/login');
        router.refresh();
        return;
      }
      showToast('Account ready', 'Welcome to your academic workspace.', 'success');
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <div className="auth-aside">
      <Link href="/" className="wordmark"><span className="brand-mark">R</span><span>Rhibms<span className="wordmark-light">Hub</span><small>ACADEMIC WORKSPACE</small></span></Link>
      <div className="auth-aside-copy"><div className="eyebrow">A BETTER HOME FOR ACADEMIC WORK</div><h2>Bring your<br/>campus work<br/><em>closer together.</em></h2><p>Thoughtful tools for course materials, trusted sharing, and research supervision.</p></div>
      <div className="auth-aside-foot">PRIVATE BY DESIGN <span>·</span> MADE FOR ACADEMIA</div>
    </div>
    <section className="auth-main"><div className="auth-form-wrap">
      <Link href="/" className="auth-mobile-brand">← &nbsp; Back to home</Link>
      <div className="eyebrow">GET STARTED</div><h1>Create your account</h1><p className="auth-subtitle">Join your academic workspace in just a moment.</p>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={submit}>
        <label className="auth-label">Full name<input name="name" required minLength={2} autoComplete="name" placeholder="e.g. Amara Okafor"/></label>
        <label className="auth-label">Institutional email<input name="email" type="email" required autoComplete="email" placeholder="you@university.edu"/></label>
        <label className="auth-label">Password<input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters"/><small>Use at least 8 characters.</small></label>
        <label className="staff-signup-toggle"><input type="checkbox" checked={isStaff} onChange={(event) => setIsStaff(event.target.checked)}/><span><b>I am a staff member</b><small>Staff signup requires an administrator token and your position and department.</small></span></label>
        {isStaff && <>
          <label className="auth-label">Position<select className="input" name="staffPositionId" value={staffPositionId} onChange={(event) => { setStaffPositionId(event.target.value); setStaffDepartmentId(''); }} required disabled={loadingOptions}><option value="">{loadingOptions ? 'Loading positions…' : 'Select your position'}</option>{positions.map((position) => <option key={position.id} value={position.id}>{position.name}</option>)}</select></label>
          {needsDepartment && <label className="auth-label">Department<small>Only HODs and lecturers should select a department.</small><select className="input" name="staffDepartmentId" value={staffDepartmentId} onChange={(event) => setStaffDepartmentId(event.target.value)} required disabled={loadingOptions}><option value="">{loadingOptions ? 'Loading departments…' : 'Select your department'}</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>}
          {!loadingOptions && (!positions.length || !departments.length) && <div className="auth-note">Staff signup options have not been configured yet. Ask an administrator to add positions and departments.</div>}
          <label className="auth-label">Staff signup token<input name="staffToken" required minLength={10} maxLength={10} autoComplete="off" placeholder="10-character token"/><small>Enter the token exactly as provided.</small></label>
        </>}
        <button className="button auth-submit" disabled={busy}>{busy ? 'Creating your account…' : isStaff ? 'Create staff account' : 'Create student account'} <span>→</span></button>
      </form>
      <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
    </div></section>
  </main>;
}
