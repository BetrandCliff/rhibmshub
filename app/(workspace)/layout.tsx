import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import WorkspaceNav from './workspace-nav';

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <div className="shell"><aside className="side">
    <Link href="/dashboard" className="brand"><span className="brand-mark">R</span><span>Rhibms<span className="wordmark-light">Hub</span><small>ACADEMIC WORKSPACE</small></span></Link>
    <div className="user-pill"><span className="profile-avatar">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span><b>{user.name}</b><small>{user.role.replace('_', ' ').toLowerCase()}</small></span></div>
    <WorkspaceNav role={user.role} staffPosition={user.staffPosition}/>
    <a className="side-signout" href="/api/auth/logout"><span aria-hidden="true">↪</span> Sign out</a>
  </aside><main className="main">{children}</main></div>;
}
