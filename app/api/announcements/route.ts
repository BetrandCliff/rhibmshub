import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (!['SUPER_ADMIN', 'DEPARTMENT_ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Only academic administrators can publish campus updates.' }, { status: 403 });
  try {
    const { title, summary, category } = await req.json();
    const categories = ['Announcement', 'Academic', 'Events', 'Campus news'];
    if (typeof title !== 'string' || title.trim().length < 4 || title.trim().length > 120 || typeof summary !== 'string' || summary.trim().length < 10 || summary.trim().length > 700 || !categories.includes(category)) {
      return NextResponse.json({ error: 'Add a title, a short summary, and choose an update category.' }, { status: 400 });
    }
    const announcement = await db.announcement.create({ data: { title: title.trim(), summary: summary.trim(), category, isPublished: true, publishedAt: new Date() } });
    return NextResponse.json({ ok: true, id: announcement.id });
  } catch {
    return NextResponse.json({ error: 'The update could not be published. Please try again.' }, { status: 500 });
  }
}
