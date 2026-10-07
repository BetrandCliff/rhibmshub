'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { canAccessCourseMaterials, canAccessSuggestions, canShareDocuments } from '@/lib/roles';

function NavIcon({ kind }: { kind: 'overview' | 'documents' | 'shares' | 'suggestions' | 'lostFound' | 'jobs' | 'mentorship' | 'supervision' | 'admin' | 'news' }) {
  const paths = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    documents: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    shares: <><path d="M7 7h14v14H7z"/><path d="M17 3H3v14M10 14l3-3 3 3M13 11v7"/></>,
    suggestions: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></>,
    lostFound: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    jobs: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
    mentorship: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4.5a3 3 0 0 1 0 7M18 15a5 5 0 0 1 3 4.5V21"/></>,
    supervision: <><path d="m2 10 10-7 10 7-10 7z"/><path d="M6 13v5c3 3 9 3 12 0v-5M22 10v7"/></>,
    admin: <><circle cx="12" cy="12" r="3"/><path d="M19 13.5a7 7 0 0 0 0-3l2-1.5-2-3.4-2.4 1a8 8 0 0 0-2.6-1.5L13.6 2h-3.2L10 5.1a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 3l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 2.6 1.5l.4 3.1h3.2l.4-3.1a8 8 0 0 0 2.6-1.5l2.4 1 2-3.4z" transform="translate(1 0) scale(.92)"/></>,
    news: <><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
  };
  return <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

function Item({ href, label, icon, pathname }: { href: string; label: string; icon?: Parameters<typeof NavIcon>[0]['kind']; pathname: string }) {
  const active = href === '/dashboard' || href === '/admin'
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
  return <Link href={href} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>{icon && <NavIcon kind={icon} />}{label}</Link>;
}

export default function WorkspaceNav({ role, staffPosition }: { role: string; staffPosition: string | null }) {
  const pathname = usePathname();
  const isAdmin = ['SUPER_ADMIN', 'DEPARTMENT_ADMIN'].includes(role);
  const canReviewSuggestions = canAccessSuggestions({ role, staffPosition });
  return <nav className="nav"><div className="nav-label">YOUR WORKSPACE</div>
    <Item href="/dashboard" label="Overview" icon="overview" pathname={pathname}/>
    {canAccessCourseMaterials(role) && <><Item href="/documents" label="Course materials" icon="documents" pathname={pathname}/>{canShareDocuments(role) && <Item href="/shares" label="Shared files" icon="shares" pathname={pathname}/>}</>}
    <Item href="/suggestions" label={canReviewSuggestions ? 'Suggestions inbox' : 'Suggestions'} icon="suggestions" pathname={pathname}/>
    <Item href="/lost-found" label="Lost & Found" icon="lostFound" pathname={pathname}/>
    <Item href="/jobs" label="Jobs" icon="jobs" pathname={pathname}/><Item href="/mentorship" label="Mentorship" icon="mentorship" pathname={pathname}/>
    <div className="nav-label nav-label-lower">ACADEMIC</div><Item href="/supervision" label="Supervision" icon="supervision" pathname={pathname}/>
    {isAdmin && <>
      <Item href="/admin" label="Administration" icon="admin" pathname={pathname}/>
      <Item href="/admin/announcements" label="Announcements" icon="news" pathname={pathname}/>
    </>}
  </nav>;
}
