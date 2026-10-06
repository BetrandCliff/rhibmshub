import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to share a document.' }, { status: 401 });
  if (user.role === 'STUDENT') return NextResponse.json({ error: 'Students cannot access shared files.' }, { status: 403 });
  if (!['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'LECTURER', 'OFFICE_STAFF'].includes(user.role)) return NextResponse.json({ error: 'Your account cannot share documents.' }, { status: 403 });
  try {
    const { documentId, targetType, recipientUserId, recipientOfficeId, permission = 'DOWNLOAD', message } = await req.json();
    if (typeof documentId !== 'string' || !['USER', 'OFFICE'].includes(targetType) || !['VIEW', 'DOWNLOAD'].includes(permission)) return NextResponse.json({ error: 'Choose a document, a recipient, and a valid permission.' }, { status: 400 });
    const document = await db.document.findUnique({ where: { id: documentId }, select: { id: true, uploaderId: true } });
    if (!document || document.uploaderId !== user.id && user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Only the document owner or a super administrator can share this document.' }, { status: 403 });
    if (targetType === 'USER') {
      if (typeof recipientUserId !== 'string' || recipientUserId === user.id || !await db.user.findUnique({ where: { id: recipientUserId }, select: { id: true } })) return NextResponse.json({ error: 'Choose a valid person to receive this document.' }, { status: 400 });
    } else if (typeof recipientOfficeId !== 'string' || !await db.office.findUnique({ where: { id: recipientOfficeId }, select: { id: true } })) {
      return NextResponse.json({ error: 'Choose a valid office to receive this document.' }, { status: 400 });
    }
    const share = await db.share.create({ data: { documentId, senderId: user.id, targetType, recipientUserId: targetType === 'USER' ? recipientUserId : null, recipientOfficeId: targetType === 'OFFICE' ? recipientOfficeId : null, permission, message: typeof message === 'string' ? message.trim().slice(0, 500) || null : null } });
    return NextResponse.json({ ok: true, id: share.id });
  } catch {
    return NextResponse.json({ error: 'The document could not be shared. Please try again.' }, { status: 500 });
  }
}
