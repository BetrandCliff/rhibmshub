'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/toast-provider';

export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(e: React.FormEvent) { e.preventDefault(); setError(''); setBusy(true); const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!response.ok) { const data = await response.json().catch(() => ({})); const message = data.error || 'Login failed.'; setError(message); showToast('Login failed', message, 'error'); setBusy(false); return; }
    showToast('Welcome back', 'Redirecting to your workspace.', 'success'); router.push('/dashboard'); router.refresh();
  }
  return <main className="auth-page"><div className="auth-aside"><Link href="/" className="wordmark"><span className="brand-mark">R</span><span>Rhibms<span className="wordmark-light">Hub</span><small>ACADEMIC WORKSPACE</small></span></Link><div className="auth-aside-copy"><div className="eyebrow">YOUR ACADEMIC WORKSPACE</div><h2>Everything<br/>in its right<br/><em>place.</em></h2><p>Pick up where you left off with course materials, trusted sharing, and student research.</p></div><div className="auth-aside-foot">PRIVATE BY DESIGN <span>·</span> MADE FOR ACADEMIA</div></div><section className="auth-main"><div className="auth-form-wrap"><Link href="/" className="auth-mobile-brand">← &nbsp; Back to home</Link><div className="eyebrow">WELCOME BACK</div><h1>Sign in to your workspace</h1><p className="auth-subtitle">Your campus work is right where you left it.</p>{error && <div className="auth-error">{error}</div>}<form onSubmit={submit}><label className="auth-label">Institutional email<input type="email" required autoComplete="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)}/></label><label className="auth-label">Password<input type="password" required autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)}/></label><button className="button auth-submit" disabled={busy}>{busy?'Signing in…':'Sign in'} <span>↗</span></button></form><p className="auth-switch">New to RhibmsHub? <Link href="/signup">Create a student account</Link></p><Link href="/" className="auth-back">← &nbsp; Back to RhibmsHub</Link></div></section></main>;
}
