import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/roles';

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && isAdmin(user.role) ? user : null;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  try {
    const { type, name, code } = await request.json();
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json({ error: 'Enter a name between 2 and 100 characters.' }, { status: 400 });
    }
    const cleanName = name.trim();
    if (type === 'position') {
      const duplicate = await db.staffPositionOption.findFirst({ where: { name: { equals: cleanName, mode: 'insensitive' } }, select: { id: true } });
      if (duplicate) return NextResponse.json({ error: 'That position already exists.' }, { status: 409 });
      const position = await db.staffPositionOption.create({ data: { name: cleanName, createdById: admin.id }, select: { id: true, name: true } });
      return NextResponse.json(position, { status: 201 });
    }
    if (type === 'department') {
      if (typeof code !== 'string' || !/^[A-Z0-9-]{2,12}$/.test(code.trim().toUpperCase())) {
        return NextResponse.json({ error: 'Enter a department code using 2–12 letters, numbers, or hyphens.' }, { status: 400 });
      }
      const [duplicateName, duplicateCode] = await Promise.all([
        db.department.findFirst({ where: { name: { equals: cleanName, mode: 'insensitive' } }, select: { id: true } }),
        db.department.findUnique({ where: { code: code.trim().toUpperCase() }, select: { id: true } }),
      ]);
      if (duplicateName) return NextResponse.json({ error: 'A department with that name already exists.' }, { status: 409 });
      if (duplicateCode) return NextResponse.json({ error: 'That department code is already in use.' }, { status: 409 });
      const faculty = await db.faculty.upsert({ where: { name: 'Institutional Departments' }, update: {}, create: { name: 'Institutional Departments' }, select: { id: true } });
      const department = await db.department.create({ data: { name: cleanName, code: code.trim().toUpperCase(), facultyId: faculty.id }, select: { id: true, name: true } });
      return NextResponse.json(department, { status: 201 });
    }
    return NextResponse.json({ error: 'Choose a valid signup option type.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'The signup option could not be added.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  try {
    const { id } = await request.json();
    if (typeof id !== 'string') return NextResponse.json({ error: 'Choose a position to remove.' }, { status: 400 });
    const result = await db.staffPositionOption.deleteMany({ where: { id } });
    if (!result.count) return NextResponse.json({ error: 'That position no longer exists.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'The position could not be removed.' }, { status: 500 });
  }
}
