import { NextRequest, NextResponse } from 'next/server';
import {
  createAdminSessionValue,
  isCorrectPassword,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/adminSession';

// Simple in-memory limiter: after MAX_FAILURES wrong passwords from one client
// within WINDOW_MS, further attempts are rejected until the window passes.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; resetAt: number }>();

function clientKey(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
}

export async function POST(req: NextRequest) {
  const key = clientKey(req);
  const now = Date.now();
  const entry = failures.get(key);
  if (entry && entry.resetAt <= now) failures.delete(key);

  if ((failures.get(key)?.count ?? 0) >= MAX_FAILURES) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in a few minutes.' },
      { status: 429 }
    );
  }

  try {
    const { password } = await req.json();

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'ADMIN_PASSWORD is not configured on this server.' },
        { status: 503 }
      );
    }

    if (typeof password !== 'string' || !(await isCorrectPassword(password))) {
      const current = failures.get(key);
      failures.set(key, {
        count: (current?.count ?? 0) + 1,
        resetAt: current?.resetAt ?? now + WINDOW_MS,
      });
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    failures.delete(key);
    const sessionValue = await createAdminSessionValue();

    const res = NextResponse.json({ ok: true });
    res.cookies.set('daylight_admin', sessionValue!, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
