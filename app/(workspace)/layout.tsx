import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { canAccessCourseMaterials, canShareDocuments } from '@/lib/roles';

function NavIcon({ kind }: { kind: 'overview' | 'documents' | 'shares' | 'jobs' | 'mentorship' | 'supervision' | 'admin' | 'logout' }) {
  const paths = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    documents: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    shares: <><path d="M7 7h14v14H7z"/><path d="M17 3H3v14M10 14l3-3 3 3M13 11v7"/></>,
    jobs: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
    mentorship: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4.5a3 3 0 0 1 0 7M18 15a5 5 0 0 1 3 4.5V21"/></>,
    supervision: <><path d="m2 10 10-7 10 7-10 7z"/><path d="M6 13v5c3 3 9 3 12 0v-5M22 10v7"/></>,
    admin: <><circle cx="12" cy="12" r="3"/><path d="M19 13.5a7 7 0 0 0 0-3l2-1.5-2-3.4-2.4 1a8 8 0 0 0-2.6-1.5L13.6 2h-3.2L10 5.1a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 3l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 2.6 1.5l.4 3.1h3.2l.4-3.1a8 8 0 0 0 2.6-1.5l2.4 1 2-3.4z" transform="translate(1 0) scale(.92)"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
  };
  return <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <div className="shell"><aside className="side">
    <Link href="/dashboard" className="brand"><span className="brand-mark">R</span><span>Rhibms<span className="wordmark-light">Hub</span><small>ACADEMIC WORKSPACE</small></span></Link>
    <div className="user-pill"><span className="profile-avatar">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span><b>{user.name}</b><small>{user.role.replace('_', ' ').toLowerCase()}</small></span></div>
    <nav className="nav"><div className="nav-label">YOUR WORKSPACE</div><Link href="/dashboard"><NavIcon kind="overview"/>Overview</Link>{canAccessCourseMaterials(user.role) && <><Link href="/documents"><NavIcon kind="documents"/>Course materials</Link>{canShareDocuments(user.role) && <Link href="/shares"><NavIcon kind="shares"/>Shared files</Link>}</>}<Link href="/suggestions">Suggestions</Link><Link href="/jobs"><NavIcon kind="jobs"/>Jobs</Link><Link href="/mentorship"><NavIcon kind="mentorship"/>Mentorship</Link><div className="nav-label nav-label-lower">ACADEMIC</div><Link href="/supervision"><NavIcon kind="supervision"/>Supervision</Link>{['SUPER_ADMIN', 'DEPARTMENT_ADMIN'].includes(user.role) && <Link href="/admin"><NavIcon kind="admin"/>Administration</Link>}</nav>
    <a className="side-signout" href="/api/auth/logout"><NavIcon kind="logout"/> Sign out</a>
  </aside><main className="main">{children}</main></div>;
}
