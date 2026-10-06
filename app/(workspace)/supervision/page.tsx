import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import CreateSupervisionForm from './create-form';

export default async function SupervisionPage() {
  const user = await requireUser();
  const canManage = ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'LECTURER'].includes(user.role);
  const records = await db.supervision.findMany({
    where: canManage ? { supervisorId: user.id } : { superviseeId: user.id },
    include: { supervisor: { include: { department: true } }, supervisee: { include: { department: true, group: { include: { program: true, level: true } } } } },
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
  });
  const activeCount = records.filter((record) => record.status === 'ACTIVE').length;
  return <>
    <div className="top"><div><div className="eyebrow">RESEARCH &amp; STUDENT GUIDANCE</div><h1>Supervision</h1><p>Keep research topics, supervisor relationships, and next meetings in view.</p></div></div>
    <div className="grid supervision-stats"><div className="card"><div className="muted">{canManage ? 'Supervisees' : 'Supervisors'}</div><div className="stat">{records.length}</div><div className="stat-note">Academic relationships</div></div><div className="card"><div className="muted">Active projects</div><div className="stat">{activeCount}</div><div className="stat-note">In progress this term</div></div><div className="card"><div className="muted">Meetings scheduled</div><div className="stat">{records.filter((record) => record.nextMeeting && record.nextMeeting >= new Date()).length}</div><div className="stat-note">Upcoming check-ins</div></div></div>
    {canManage && <section className="card supervision-create"><div className="dashboard-section-head"><div><h2>Add a supervisee</h2><p>Connect a student account to your research supervision list.</p></div><span className="private-chip">PRIVATE TO YOU</span></div><CreateSupervisionForm/></section>}
    <section className="card supervision-list"><div className="dashboard-section-head"><div><h2>{canManage ? 'Your supervisees' : 'Your supervisor'}</h2><p>{canManage ? 'Research relationships you are guiding.' : 'Your current academic research relationship.'}</p></div></div>{records.length ? <div className="supervision-table"><div className="supervision-row supervision-head"><span>{canManage ? 'STUDENT' : 'SUPERVISOR'}</span><span>RESEARCH TOPIC</span><span>STATUS</span><span>NEXT MEETING</span></div>{records.map((record) => <div className="supervision-row" key={record.id}><span className="person-cell"><i>{(canManage ? record.supervisee.name : record.supervisor.name).split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</i><b>{canManage ? record.supervisee.name : record.supervisor.name}<small>{canManage ? record.supervisee.group ? `${record.supervisee.group.program.name} · ${record.supervisee.group.level.name}` : record.supervisee.email : record.supervisor.department?.name ?? record.supervisor.email}</small></b></span><span>{record.researchTitle}</span><span><i className={`status-pill ${record.status.toLowerCase()}`}>{record.status.replace('_', ' ')}</i></span><span>{record.nextMeeting ? record.nextMeeting.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not scheduled'}</span></div>)}</div> : <div className="empty-state"><span>⌘</span><b>{canManage ? 'Your supervision list starts here' : 'No supervisor has been assigned yet'}</b><p>{canManage ? 'Add a student above to keep their project and next meeting visible in your workspace.' : 'Once your department sets up your supervision relationship, your supervisor and research topic will appear here.'}</p></div>}</section>
  </>;
}
