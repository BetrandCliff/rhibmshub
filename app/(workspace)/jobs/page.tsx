import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import JobPostModal from './job-post-modal';

type SearchParams = Promise<{ q?: string; department?: string; posted?: string; error?: string }>;

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const { q = '', department = '', posted, error } = await searchParams;
  const [departments, jobs] = await Promise.all([
    db.department.findMany({ orderBy: { name: 'asc' } }),
    db.jobPosting.findMany({
      where: {
        isActive: true,
        ...(department ? { departmentId: department } : {}),
        ...(q.trim() ? { OR: [
          { title: { contains: q.trim(), mode: 'insensitive' as const } },
          { organization: { contains: q.trim(), mode: 'insensitive' as const } },
          { description: { contains: q.trim(), mode: 'insensitive' as const } },
        ] } : {}),
      },
      include: { department: true, poster: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return <>
    <div className="top"><div><div className="eyebrow">CAREER OPPORTUNITIES</div><h1>Available jobs</h1><p>Discover opportunities shared by the campus community.</p></div>{user && <JobPostModal departments={departments}/>}</div>
    {posted && <div className="success module-notice">Your job posting is now available.</div>}{error && <div className="error module-notice">Please complete the required job details.</div>}
    <form className="module-filters card" action="/jobs" method="get">
      <input className="input" type="search" name="q" defaultValue={q} placeholder="Search roles, organizations, skills…" aria-label="Search jobs" />
      <select name="department" defaultValue={department} aria-label="Filter jobs by department"><option value="">All departments</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <button className="btn">Search jobs</button>
    </form>
    <section className="module-list"><div className="dashboard-section-head"><div><h2>{jobs.length} {jobs.length === 1 ? 'opportunity' : 'opportunities'}</h2><p>Open roles from across the campus community</p></div></div>
      {jobs.length ? <div className="module-card-grid">{jobs.map((job) => <article className="card module-result" key={job.id}><div className="module-result-meta"><span className="private-chip">{job.employmentType}</span><span>{job.department?.name ?? 'Campus-wide'}</span></div><h3>{job.title}</h3><p className="module-organization">{job.organization}{job.location ? ` · ${job.location}` : ''}</p><p className="module-description">{job.description}</p><div className="module-result-footer"><span>Posted by {job.poster.name}{job.deadline ? ` · Apply by ${job.deadline.toLocaleDateString()}` : ''}</span>{job.applicationUrl && <a className="btn secondary" href={job.applicationUrl} target="_blank" rel="noreferrer">Apply</a>}</div></article>)}</div> : <div className="card empty-state"><b>No jobs found</b><p>Try another search or department, or be the first to post an opportunity.</p></div>}
    </section>
  </>;
}
