import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { canAccessSuggestions } from '@/lib/roles';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to submit a suggestion.' }, { status: 401 });
  try {
    const { message } = await request.json();
    if (typeof message !== 'string' || message.trim().length < 5 || message.trim().length > 3000) {
      return NextResponse.json({ error: 'Suggestions must be between 5 and 3,000 characters.' }, { status: 400 });
    }
    // Do not persist the submitter relationship; submissions are anonymous.
    const suggestion = await db.suggestion.create({ data: { message: message.trim(), senderId: null } });
    return NextResponse.json({ ok: true, id: suggestion.id });
  } catch {
    return NextResponse.json({ error: 'Your suggestion could not be submitted. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (!canAccessSuggestions(user)) return NextResponse.json({ error: 'Only system administrators, the president, and the president’s assistant can view suggestions.' }, { status: 403 });
  const suggestions = await db.suggestion.findMany({ select: { id: true, message: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(suggestions);
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (!canAccessSuggestions(user)) return NextResponse.json({ error: 'You cannot delete suggestions.' }, { status: 403 });

  try {
    const body: unknown = await request.json();
    const rawIds = body && typeof body === 'object' && 'ids' in body ? body.ids : undefined;
    const ids = Array.isArray(rawIds) ? rawIds.filter((id): id is string => typeof id === 'string') : [];
    if (!ids.length || ids.length > 100 || !Array.isArray(rawIds) || ids.length !== rawIds.length) {
      return NextResponse.json({ error: 'Select between 1 and 100 suggestions to delete.' }, { status: 400 });
    }
    const result = await db.suggestion.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ ok: true, deleted: result.count });
  } catch {
    return NextResponse.json({ error: 'The selected suggestions could not be deleted.' }, { status: 500 });
  }
}
