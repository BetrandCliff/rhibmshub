import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import MentorApplicationModal from './mentor-application-modal';

type SearchParams = Promise<{ q?: string; department?: string; saved?: string; error?: string; reviewed?: string }>;

export default async function MentorshipPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { q = '', department = '', saved, error, reviewed } = await searchParams;
  const isAdmin = ['SUPER_ADMIN', 'DEPARTMENT_ADMIN'].includes(user.role);
  const [departments, mentors, profile, pendingApplications] = await Promise.all([
    db.department.findMany({ orderBy: { name: 'asc' } }),
    db.mentorProfile.findMany({
      where: {
        status: 'APPROVED',
        ...(department ? { user: { departmentId: department } } : {}),
        ...(q.trim() ? { OR: [
          { headline: { contains: q.trim(), mode: 'insensitive' as const } },
          { expertise: { contains: q.trim(), mode: 'insensitive' as const } },
          { bio: { contains: q.trim(), mode: 'insensitive' as const } },
          { user: { name: { contains: q.trim(), mode: 'insensitive' as const } } },
        ] } : {}),
      },
      include: { user: { include: { department: true } } },
      orderBy: { user: { name: 'asc' } },
    }),
    db.mentorProfile.findUnique({ where: { userId: user.id } }),
    isAdmin ? db.mentorProfile.findMany({
      where: {
        status: 'PENDING',
        userId: { not: user.id },
        ...(user.role === 'DEPARTMENT_ADMIN' ? { user: { departmentId: user.departmentId } } : {}),
      },
      include: { user: { include: { department: true } } },
      orderBy: { createdAt: 'asc' },
    }) : Promise.resolve([]),
  ]);

  return <>
    <div className="top"><div><div className="eyebrow">LEARN FROM ONE ANOTHER</div><h1>Mentorship</h1><p>Find an academic mentor by name, expertise, or department.</p></div><MentorApplicationModal profile={profile}/></div>
    {saved && <div className="success module-notice">Your application was submitted and is awaiting administrator approval.</div>}{error && <div className="error module-notice">Please complete all mentor profile fields.</div>}
    {reviewed && <div className="success module-notice">The mentor application review has been saved.</div>}
    {isAdmin && <section className="card mentor-review"><div className="dashboard-section-head"><div><h2>Mentor applications</h2><p>Review applications before they appear in the directory.</p></div><span className="private-chip">{pendingApplications.length} PENDING</span></div>
      {pendingApplications.length ? <div className="mentor-review-list">{pendingApplications.map((application) => <article className="mentor-review-item" key={application.id}><div><div className="mentor-review-person"><b>{application.user.name}</b><span>{application.user.department?.name ?? 'No department'}</span><a href={`mailto:${application.user.email}`}>{application.user.email}</a></div><h3>{application.headline}</h3><p><b>Expertise:</b> {application.expertise}</p><p className="module-description">{application.bio}</p></div><div className="mentor-review-actions"><form action="/api/mentorship/review" method="post"><input type="hidden" name="profileId" value={application.id}/><input type="hidden" name="decision" value="approve"/><button className="btn" type="submit">Approve</button></form><form action="/api/mentorship/review" method="post"><input type="hidden" name="profileId" value={application.id}/><input type="hidden" name="decision" value="reject"/><button className="btn secondary" type="submit">Reject</button></form></div></article>)}</div> : <div className="empty-state"><b>No pending applications</b><p>New mentor applications will appear here for review.</p></div>}
    </section>}
    <form className="module-filters card" action="/mentorship" method="get">
      <input className="input" type="search" name="q" defaultValue={q} placeholder="Search mentors or areas of expertise…" aria-label="Search mentors" />
      <select name="department" defaultValue={department} aria-label="Filter mentors by department"><option value="">All departments</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <button className="btn">Find mentors</button>
    </form>
    <section className="module-list"><div className="dashboard-section-head"><div><h2>{mentors.length} {mentors.length === 1 ? 'mentor' : 'mentors'}</h2><p>Approved mentor profiles across the campus community</p></div></div>
      {mentors.length ? <div className="module-card-grid">{mentors.map((mentor) => <article className="card module-result" key={mentor.id}><div className="module-result-meta"><span className="profile-avatar">{mentor.user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span>{mentor.user.department?.name ?? 'Faculty'}</span></div><h3>{mentor.user.name}</h3><p className="module-organization">{mentor.headline}</p><p className="module-description">{mentor.bio}</p><div className="module-expertise"><b>Expertise</b><span>{mentor.expertise}</span></div><div className="module-result-footer"><span>{mentor.available ? 'Available for new mentees' : 'Not currently accepting mentees'}</span>{mentor.available && <a className="btn secondary" href={`mailto:${mentor.user.email}?subject=${encodeURIComponent('Mentorship enquiry')}`}>Contact</a>}</div></article>)}</div> : <div className="card empty-state"><b>No approved mentors found</b><p>Try a different search or department. Use “Become a mentor” to submit a profile for approval.</p></div>}
    </section>
  </>;
}
