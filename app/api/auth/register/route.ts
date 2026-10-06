import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bcrypt, createSession } from '@/lib/auth';

export async function POST(req: Request) {
  let claimedToken: string | undefined;
  let claimedAt: Date | undefined;
  try {
    const { name, email, password, isStaff, staffToken, staffPositionId, staffDepartmentId } = await req.json();
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100 || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: 'Enter your name, a valid email, and a password of at least 8 characters.' }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await db.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } })) {
      return NextResponse.json({ error: 'An account with this email already exists. Try signing in instead.' }, { status: 409 });
    }
    let role: 'STUDENT' | 'LECTURER' = 'STUDENT';
    let staffProfile: { staffPosition: string; staffDepartment: string; departmentId: string | null } | undefined;
    if (isStaff === true) {
      if (typeof staffToken !== 'string' || !/^[A-Z0-9]{10}$/.test(staffToken.trim().toUpperCase())) {
        return NextResponse.json({ error: 'Enter the 10-character staff signup token provided by an administrator.' }, { status: 400 });
      }
      const token = staffToken.trim().toUpperCase();
      if (typeof staffPositionId !== 'string' || typeof staffDepartmentId !== 'string') {
        return NextResponse.json({ error: 'Select a staff position and department.' }, { status: 400 });
      }
      const [position, department] = await Promise.all([
        db.staffPositionOption.findUnique({ where: { id: staffPositionId }, select: { name: true } }),
        db.department.findUnique({ where: { id: staffDepartmentId }, select: { id: true, name: true } }),
      ]);
      if (!position || !department) return NextResponse.json({ error: 'That position or department is no longer available. Refresh and choose again.' }, { status: 400 });
      staffProfile = { staffPosition: position.name, staffDepartment: department.name, departmentId: department.id };
      claimedAt = new Date();
      const claim = await db.staffSignupToken.updateMany({ where: { token, usedAt: null, expiresAt: { gt: claimedAt } }, data: { usedAt: claimedAt } });
      if (claim.count !== 1) return NextResponse.json({ error: 'That staff token is invalid, expired, or has already been used.' }, { status: 400 });
      claimedToken = token;
      role = 'LECTURER';
    }
    const user = await db.user.create({ data: { name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), role, ...(staffProfile ? staffProfile : {}) } });
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch {
    if (claimedToken && claimedAt) {
      await db.staffSignupToken.updateMany({ where: { token: claimedToken, usedAt: claimedAt }, data: { usedAt: null } }).catch(() => undefined);
    }
    return NextResponse.json({ error: 'We could not create your account. Please try again.' }, { status: 500 });
  }
}
