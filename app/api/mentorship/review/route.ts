import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || !['SUPER_ADMIN', 'DEPARTMENT_ADMIN'].includes(admin.role)) {
    return NextResponse.redirect(new URL('/login', request.url), 303);
  }
  const form = await request.formData();
  const profileId = String(form.get('profileId') ?? '');
  const decision = String(form.get('decision') ?? '');
  const profile = await db.mentorProfile.findUnique({ where: { id: profileId }, include: { user: true } });
  if (!profile || profile.userId === admin.id || profile.status !== 'PENDING') return NextResponse.redirect(new URL('/mentorship', request.url), 303);
  if (admin.role === 'DEPARTMENT_ADMIN' && profile.user.departmentId !== admin.departmentId) {
    return NextResponse.redirect(new URL('/mentorship', request.url), 303);
  }
  if (decision !== 'approve' && decision !== 'reject') return NextResponse.redirect(new URL('/mentorship', request.url), 303);
  await db.mentorProfile.update({
    where: { id: profileId },
    data: decision === 'approve' ? { status: 'APPROVED' } : { status: 'REJECTED', available: false },
  });
  return NextResponse.redirect(new URL('/mentorship?reviewed=1', request.url), 303);
}
