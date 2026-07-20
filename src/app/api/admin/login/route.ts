import { NextRequest, NextResponse } from 'next/server';
import { createAdminSessionValue } from '@/lib/adminSession';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'ADMIN_PASSWORD is not configured on this server.' },
        { status: 503 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    const sessionValue = await createAdminSessionValue();

    const res = NextResponse.json({ ok: true });
    res.cookies.set('daylight_admin', sessionValue!, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
