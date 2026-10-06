import { randomInt } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/roles';

function makeToken() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 10 }, () => alphabet[randomInt(alphabet.length)]).join('');
}

async function adminUser() {
  const user = await getCurrentUser();
  return user && isAdmin(user.role) ? user : null;
}

export async function GET() {
  const user = await adminUser();
  if (!user) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const tokens = await db.staffSignupToken.findMany({ where: { usedAt: null }, orderBy: { createdAt: 'desc' }, select: { id: true, token: true, expiresAt: true, createdAt: true } });
  return NextResponse.json(tokens);
}

export async function POST(request: Request) {
  const user = await adminUser();
  if (!user) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  try {
    const { expiresAt } = await request.json();
    const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : new Date(NaN);
    if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
      return NextResponse.json({ error: 'Choose an expiration date and time in the future.' }, { status: 400 });
    }
    let token = makeToken();
    for (let attempt = 0; await db.staffSignupToken.findUnique({ where: { token }, select: { id: true } }); attempt++) {
      if (attempt >= 5) return NextResponse.json({ error: 'Could not generate a unique token. Try again.' }, { status: 500 });
      token = makeToken();
    }
    const created = await db.staffSignupToken.create({ data: { token, expiresAt: expiry, createdById: user.id }, select: { id: true, token: true, expiresAt: true, createdAt: true } });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'The staff token could not be created.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await adminUser();
  if (!user) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  try {
    const { id } = await request.json();
    if (typeof id !== 'string') return NextResponse.json({ error: 'Choose a token to delete.' }, { status: 400 });
    const result = await db.staffSignupToken.deleteMany({ where: { id, usedAt: null } });
    if (!result.count) return NextResponse.json({ error: 'That available token no longer exists.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'The token could not be deleted.' }, { status: 500 });
  }
}
