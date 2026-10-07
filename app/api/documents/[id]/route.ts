import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteFile } from '@/lib/r2';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to delete a document.' }, { status: 401 });

  try {
    const { id } = await params;
    const document = await db.document.findUnique({
      where: { id },
      select: { id: true, uploaderId: true, storageKey: true },
    });
    if (!document) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    if (document.uploaderId !== user.id && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only the uploader or a super administrator can delete this document.' }, { status: 403 });
    }

    await deleteFile(document.storageKey);
    await db.document.delete({ where: { id: document.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Document deletion failed:', error);
    return NextResponse.json({ error: 'The document could not be deleted. Please try again.' }, { status: 500 });
  }
}
