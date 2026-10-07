import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import AnnouncementForm from '../announcement-form';

export default async function CampusUpdates() {
  const user = await requireUser();
  if (!['SUPER_ADMIN', 'DEPARTMENT_ADMIN'].includes(user.role)) redirect('/dashboard');

  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return <>
    <div className="top">
      <div>
        <div className="eyebrow">CAMPUS COMMUNICATIONS</div>
        <h1>Announcements</h1>
        <p>Publish news and announcements for the public homepage.</p>
      </div>
    </div>
    <div className="admin-news-grid">
      <section className="card">
        <div className="dashboard-section-head">
          <div><h2>Publish a campus update</h2><p>Published updates appear on the public homepage.</p></div>
          <span className="private-chip">PUBLIC</span>
        </div>
        <AnnouncementForm/>
      </section>
      <section className="card">
        <div className="dashboard-section-head">
          <div><h2>Recent updates</h2><p>Your latest campus news and announcements.</p></div>
        </div>
        {announcements.length ? <div className="admin-announcement-list">{announcements.map((item) => <article key={item.id}><span>{item.category} · {item.isPublished ? 'Published' : 'Draft'}</span><b>{item.title}</b><small>{item.createdAt.toLocaleDateString()}</small></article>)}</div> : <div className="empty-state admin-empty"><b>No campus updates yet</b><p>Publish the first update to feature it on the public homepage.</p></div>}
      </section>
    </div>
  </>;
}
