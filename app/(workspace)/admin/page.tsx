import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import StaffTokenManager from './staff-token-manager';
import SignupOptionsManager from './signup-options-manager';

export default async function Admin() {
  const user = await requireUser();
  if (!['SUPER_ADMIN', 'DEPARTMENT_ADMIN'].includes(user.role)) redirect('/dashboard');
  const [users, departments, offices, documents, staffTokens, positions] = await Promise.all([
    db.user.findMany({ include: { department: true }, orderBy: { createdAt: 'desc' }, take: 100 }),
    db.department.findMany({ orderBy: { name: 'asc' } }),
    db.office.findMany({ orderBy: { name: 'asc' } }),
    db.document.count(),
    db.staffSignupToken.findMany({ where: { usedAt: null }, orderBy: { createdAt: 'desc' }, select: { id: true, token: true, category: true, expiresAt: true, createdAt: true } }),
    db.staffPositionOption.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);
  return <>
    <div className="top"><div><div className="eyebrow">INSTITUTIONAL CONTROLS</div><h1>Administration</h1><p>Manage campus information and keep your academic community up to date.</p></div></div>
    <div className="grid"><div className="card"><div className="muted">Users</div><div className="stat">{users.length}</div></div><div className="card"><div className="muted">Departments</div><div className="stat">{departments.length}</div></div><div className="card"><div className="muted">Documents</div><div className="stat">{documents}</div></div><div className="card"><div className="muted">Offices</div><div className="stat">{offices.length}</div></div></div>
    <StaffTokenManager tokens={staffTokens}/>
    <SignupOptionsManager departments={departments} positions={positions}/>
    <div className="card admin-users"><h2>Academic community</h2><table className="table"><thead><tr><th>Name</th><th>Email</th><th>Role / position</th><th>Department</th></tr></thead><tbody>{users.map((account) => <tr key={account.id}><td><strong>{account.name}</strong></td><td>{account.email}</td><td><span className="badge">{account.role.replace('_', ' ')}</span>{account.staffPosition && <div className="table-sub">{account.staffPosition}</div>}</td><td>{account.department?.name || account.staffDepartment || '-'}</td></tr>)}</tbody></table></div>
  </>;
}
