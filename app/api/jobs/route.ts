import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url), 303);
  const form = await request.formData();
  const title = String(form.get('title') ?? '').trim();
  const organization = String(form.get('organization') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  if (!title || !organization || !description) return NextResponse.redirect(new URL('/jobs?error=required', request.url), 303);
  const applicationUrl = String(form.get('applicationUrl') ?? '').trim();
  if (applicationUrl) {
    try {
      const url = new URL(applicationUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
    } catch {
      return NextResponse.redirect(new URL('/jobs?error=required', request.url), 303);
    }
  }
  const deadline = String(form.get('deadline') ?? '');
  await db.jobPosting.create({ data: {
    title, organization, description,
    employmentType: String(form.get('employmentType') ?? 'Full-time'),
    location: String(form.get('location') ?? '').trim() || null,
    applicationUrl: applicationUrl || null,
    deadline: deadline ? new Date(`${deadline}T23:59:59`) : null,
    departmentId: String(form.get('departmentId') ?? '') || null,
    posterId: user.id,
  } });
  return NextResponse.redirect(new URL('/jobs?posted=1', request.url), 303);
}
