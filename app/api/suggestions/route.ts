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
    const suggestion = await db.suggestion.create({ data: { message: message.trim(), senderId: user.id } });
    return NextResponse.json({ ok: true, id: suggestion.id });
  } catch {
    return NextResponse.json({ error: 'Your suggestion could not be submitted. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (!canAccessSuggestions(user.role)) return NextResponse.json({ error: 'You cannot view suggestions.' }, { status: 403 });
  const suggestions = await db.suggestion.findMany({ include: { sender: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(suggestions);
}
