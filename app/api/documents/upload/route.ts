import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { putFile } from '@/lib/r2';

const uploadRoles = ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'LECTURER', 'OFFICE_STAFF'];
const allowedTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function failure(request: Request, message: string, status: number, wantsJson: boolean) {
  return wantsJson
    ? NextResponse.json({ error: message }, { status })
    : NextResponse.redirect(new URL(`/documents/upload?error=${encodeURIComponent(message)}`, request.url), 303);
}

export async function POST(request: Request) {
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;

  try {
    const user = await requireUser();
    if (!uploadRoles.includes(user.role)) return failure(request, 'Forbidden', 403, wantsJson);

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return failure(request, 'Choose a file to upload.', 400, wantsJson);
    if (!allowedTypes.has(file.type)) return failure(request, 'Only PDF, DOC and DOCX files are allowed.', 400, wantsJson);

    const maxSize = (Number(process.env.MAX_UPLOAD_MB) || 25) * 1024 * 1024;
    if (file.size > maxSize) return failure(request, 'The file is too large.', 400, wantsJson);

    const departmentId = String(form.get('departmentId') || '') || null;
    const groupId = String(form.get('groupId') || '') || null;
    const id = crypto.randomUUID();
    const extension = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '';
    const key = `documents/${new Date().getFullYear()}/${user.id}/${id}${extension}`;

    await putFile(key, Buffer.from(await file.arrayBuffer()), file.type);
    const document = await db.document.create({
      data: {
        title: String(form.get('title') || file.name),
        description: String(form.get('description') || '') || null,
        originalName: file.name,
        storageKey: key,
        mimeType: file.type,
        sizeBytes: file.size,
        uploaderId: user.id,
        departmentId,
        accessRules: groupId
          ? { create: { groupId, permission: 'DOWNLOAD' } }
          : departmentId
            ? { create: { departmentId, permission: 'DOWNLOAD' } }
            : undefined,
      },
    });

    if (wantsJson) return NextResponse.json({ ok: true, id: document.id });
    return NextResponse.redirect(new URL('/documents?uploaded=1', request.url), 303);
  } catch (error) {
    console.error('Document upload failed:', error);
    return failure(request, 'Upload failed. Please try again.', 500, wantsJson);
  }
}
