import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [departments, positions] = await Promise.all([
      db.department.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
      db.staffPositionOption.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    ]);
    return NextResponse.json({ departments, positions });
  } catch {
    return NextResponse.json({ error: 'Signup options are temporarily unavailable.' }, { status: 500 });
  }
}
