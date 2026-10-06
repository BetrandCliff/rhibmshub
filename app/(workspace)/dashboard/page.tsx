import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { visibleDocuments } from '@/lib/access';
import { canAccessCourseMaterials } from '@/lib/roles';

export default async function Dashboard() {
  const user = await requireUser();
  const canSeeDocuments = canAccessCourseMaterials(user.role);
  let documents: Awaited<ReturnType<typeof visibleDocuments>> = [];
  let shares = 0;
  let uploadCount = 0;
  if (canSeeDocuments) {
    [documents, shares, uploadCount] = await Promise.all([
      visibleDocuments(user),
      db.share.count({ where: { OR: [{ recipientUserId: user.id }, { recipientGroupId: user.groupId ?? undefined }, { recipientDepartmentId: user.departmentId ?? undefined }, { recipientOfficeId: user.officeId ?? undefined }] } }),
      db.document.count({ where: { uploaderId: user.id } }),
    ]);
  }
  const salutation = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const canUpload = ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'LECTURER', 'OFFICE_STAFF'].includes(user.role);
  return <>
    <div className="top"><div><div className="eyebrow">{salutation.toUpperCase()}</div><h1>Welcome back, {user.name.split(' ')[0]}.</h1><p>Your teaching and research, in good order.</p></div>{canUpload && <Link className="btn" href="/documents/upload">＋ &nbsp; Upload material</Link>}</div>
    {canSeeDocuments && <div className="grid dashboard-stats"><div className="card"><div className="muted">Materials available</div><div className="stat">{documents.length}</div><div className="stat-note">For your courses and groups</div></div><div className="card"><div className="muted">Shared with you</div><div className="stat">{shares}</div><div className="stat-note">People, offices and groups</div></div><div className="card"><div className="muted">Your uploads</div><div className="stat">{uploadCount}</div><div className="stat-note">Documents you have added</div></div></div>}
    <div className="dashboard-content">
      {canSeeDocuments ? <section className="card recent-card"><div className="dashboard-section-head"><div><h2>Recently available</h2><p>Materials shared with your academic community</p></div><Link href="/documents">All materials <span>→</span></Link></div>{documents.length ? <table className="table"><thead><tr><th>Material</th><th>Course / department</th><th>Shared by</th><th>Added</th></tr></thead><tbody>{documents.slice(0, 6).map((doc) => <tr key={doc.id}><td><strong>{doc.title}</strong><div className="table-sub">{doc.originalName}</div></td><td>{doc.course?.code ?? doc.department?.code ?? 'General'}</td><td>{doc.uploader.name}</td><td>{doc.createdAt.toLocaleDateString()}</td></tr>)}</tbody></table> : <div className="empty-state"><b>Your materials will appear here</b><p>When a colleague shares resources, you’ll find them in this list.</p></div>}</section> : <section className="card recent-card"><div className="eyebrow">YOUR WORKSPACE</div><h2>Share an idea with your campus</h2><p className="muted">Suggestions are open to everyone and reviewed by academic administrators.</p><Link className="btn" href="/suggestions">Send a suggestion</Link></section>}
      <aside className="card quick-card"><div className="eyebrow">YOUR SHORTCUTS</div><h2>Keep your work moving.</h2>{canSeeDocuments && <><Link href="/documents"><span className="quick-icon">▤</span><span><b>Browse materials</b><small>Find notes and course files</small></span><i>→</i></Link><Link href="/shares"><span className="quick-icon">↗</span><span><b>Shared with me</b><small>Files sent to your account</small></span><i>→</i></Link></>}<Link href="/suggestions"><span className="quick-icon">✎</span><span><b>Suggestions</b><small>Send campus feedback</small></span><i>→</i></Link>{canUpload && <Link href="/documents/upload"><span className="quick-icon">＋</span><span><b>Share a resource</b><small>Upload and choose access</small></span><i>→</i></Link>}</aside>
    </div>
  </>;
}
