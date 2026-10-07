import { requireUser } from '@/lib/auth';
import { visibleDocuments } from '@/lib/access';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DocumentsTable from './documents-table';

const uploadRoles = ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'LECTURER', 'OFFICE_STAFF'];

export default async function Documents() {
  const user = await requireUser();
  if (user.role === 'STUDENT') redirect('/dashboard');
  const documents = await visibleDocuments(user);

  return (
    <>
      <div className="top">
        <div>
          <h1>Documents</h1>
          <p className="muted">Only documents your account is authorized to access are listed.</p>
        </div>
        {uploadRoles.includes(user.role) && <Link className="btn" href="/documents/upload">Upload document</Link>}
      </div>
      <div className="card"><DocumentsTable documents={documents.map((document) => ({
        id: document.id,
        title: document.title,
        originalName: document.originalName,
        departmentName: document.department?.name || 'General',
        uploaderName: document.uploader.name,
        uploadedAt: document.createdAt.toISOString(),
        canDelete: user.role === 'SUPER_ADMIN' || document.uploader.id === user.id,
      }))} /></div>
    </>
  );
}
