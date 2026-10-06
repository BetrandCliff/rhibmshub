import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url), 303);
  const form = await request.formData();
  const headline = String(form.get('headline') ?? '').trim();
  const expertise = String(form.get('expertise') ?? '').trim();
  const bio = String(form.get('bio') ?? '').trim();
  if (!headline || !expertise || !bio) return NextResponse.redirect(new URL('/mentorship?error=required', request.url), 303);
  await db.mentorProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, headline, expertise, bio, available: form.get('available') === 'true', status: 'PENDING' },
    update: { headline, expertise, bio, available: form.get('available') === 'true', status: 'PENDING' },
  });
  return NextResponse.redirect(new URL('/mentorship?saved=1', request.url), 303);
}
