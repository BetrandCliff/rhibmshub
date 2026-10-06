import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (!['LECTURER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Only lecturers and academic administrators can create supervision relationships.' }, { status: 403 });
  try {
    const { email, researchTitle, nextMeeting } = await req.json();
    if (typeof email !== 'string' || typeof researchTitle !== 'string' || researchTitle.trim().length < 3 || researchTitle.trim().length > 200) return NextResponse.json({ error: 'Enter a valid student email and research title.' }, { status: 400 });
    const student = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!student || student.role !== 'STUDENT') return NextResponse.json({ error: 'No student account was found for that email.' }, { status: 404 });
    const assignment = await db.supervision.create({ data: { supervisorId: user.id, superviseeId: student.id, researchTitle: researchTitle.trim(), nextMeeting: nextMeeting ? new Date(nextMeeting) : null } });
    return NextResponse.json({ ok: true, id: assignment.id });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'You are already supervising this student.' }, { status: 409 });
    return NextResponse.json({ error: 'Could not create the supervision record. Please try again.' }, { status: 500 });
  }
}
