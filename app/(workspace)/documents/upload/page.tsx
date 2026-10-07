import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import UploadForm from './upload-form';

const uploadRoles = ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'LECTURER', 'OFFICE_STAFF'];

export default async function UploadPage() {
  const user = await requireUser();
  if (!uploadRoles.includes(user.role)) redirect('/documents');

  const [departments, groups] = await Promise.all([
    db.department.findMany({ orderBy: { name: 'asc' } }),
    db.academicGroup.findMany({
      include: { program: true, level: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <>
      <h1>Upload course material</h1>
      <p className="muted">
        Upload a file and choose who can access it. Files are stored privately.
      </p>
      <div className="card">
        <UploadForm
          departments={departments.map(({ id, name }) => ({ id, name }))}
          groups={groups.map(({ id, name, program, level }) => ({
            id,
            label: `${program.name} / ${level.name} / ${name}`,
          }))}
        />
      </div>
    </>
  );
}
