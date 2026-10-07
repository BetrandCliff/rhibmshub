import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import ShareFileForm from './share-form';
import { redirect } from 'next/navigation';

export default async function Shares() {
  const user = await requireUser();
  if (user.role === 'STUDENT') redirect('/dashboard');
  const canShare = ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'LECTURER', 'OFFICE_STAFF'].includes(user.role);
  const [shares, documents, offices, people] = await Promise.all([
    db.share.findMany({ where: { OR: [{ recipientUserId: user.id }, { recipientGroupId: user.groupId ?? undefined }, { recipientDepartmentId: user.departmentId ?? undefined }, { recipientOfficeId: user.officeId ?? undefined }] }, include: { document: true, sender: true }, orderBy: { createdAt: 'desc' } }),
    canShare ? db.document.findMany({
      where: user.role === 'SUPER_ADMIN' ? undefined : { uploaderId: user.id },
      select: { id: true, title: true, originalName: true, courseId: true },
      orderBy: { title: 'asc' },
    }) : Promise.resolve([]),
    canShare ? db.office.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }) : Promise.resolve([]),
    canShare ? db.user.findMany({ where: { id: { not: user.id } }, orderBy: { name: 'asc' }, select: { id: true, name: true, email: true, staffPosition: true } }) : Promise.resolve([]),
  ]);
  return <>
    <div className="top"><div><div className="eyebrow">DOCUMENT ACCESS</div><h1>Shared files</h1><p>Send a resource to the right person or office, and see what others have shared with you.</p></div></div>
    {canShare && <section className="card share-create"><div className="dashboard-section-head"><div><h2>Share a document</h2><p>Choose one of your files and decide who should receive it.</p></div><span className="private-chip">CONTROLLED ACCESS</span></div><ShareFileForm documents={documents} offices={offices} people={people}/></section>}
    <section className="card supervision-list"><div className="dashboard-section-head"><div><h2>Shared with you</h2><p>Files sent directly to you, your group, department, or office.</p></div></div>{shares.length ? <div className="supervision-table"><div className="share-row share-head"><span>DOCUMENT</span><span>FROM</span><span>ACCESS</span><span>SHARED</span><span></span></div>{shares.map((share) => <div className="share-row" key={share.id}><span><b>{share.document.title}</b><small>{share.document.originalName}</small></span><span>{share.sender.name}</span><span><i className="status-pill">{share.permission}</i></span><span>{share.createdAt.toLocaleDateString()}</span><span><a className="btn secondary" href={`/api/documents/${share.documentId}/download`}>Open file</a></span></div>)}</div> : <div className="empty-state"><span>↗</span><b>No files have been shared with you yet</b><p>When a colleague sends you a document, it will be available here.</p></div>}</section>
  </>;
}
