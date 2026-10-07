import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteFile } from '@/lib/r2';

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to delete documents.' }, { status: 401 });

  try {
    const body: unknown = await request.json();
    const rawIds = body && typeof body === 'object' && 'ids' in body ? body.ids : undefined;
    const ids = Array.isArray(rawIds) ? [...new Set(rawIds.filter((id): id is string => typeof id === 'string'))] : [];
    if (!ids.length || ids.length > 100 || !Array.isArray(rawIds) || ids.length !== rawIds.length) {
      return NextResponse.json({ error: 'Select between 1 and 100 documents to delete.' }, { status: 400 });
    }

    const documents = await db.document.findMany({
      where: { id: { in: ids } },
      select: { id: true, uploaderId: true, storageKey: true },
    });
    if (documents.length !== ids.length) return NextResponse.json({ error: 'One or more documents no longer exist.' }, { status: 404 });
    if (user.role !== 'SUPER_ADMIN' && documents.some((document) => document.uploaderId !== user.id)) {
      return NextResponse.json({ error: 'You can only delete documents you uploaded.' }, { status: 403 });
    }

    const deleted: string[] = [];
    const failed: string[] = [];
    for (const document of documents) {
      try {
        await deleteFile(document.storageKey);
        await db.document.delete({ where: { id: document.id } });
        deleted.push(document.id);
      } catch (error) {
        console.error(`Could not delete document ${document.id}:`, error);
        failed.push(document.id);
      }
    }

    return NextResponse.json({ ok: failed.length === 0, deleted, failed });
  } catch (error) {
    console.error('Bulk document deletion failed:', error);
    return NextResponse.json({ error: 'The selected documents could not be deleted.' }, { status: 500 });
  }
}
