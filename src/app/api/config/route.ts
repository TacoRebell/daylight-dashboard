import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readConfig, writeConfig, DashboardConfig } from '@/lib/config';
import { isValidAdminSession } from '@/lib/adminSession';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = readConfig();
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  if (!(await isValidAdminSession(req.cookies.get('daylight_admin')?.value))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: DashboardConfig;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Shape + type validation
  const { lat, lon, timezone } = body.primaryLocation || {};
  if (typeof lat !== 'number' || typeof lon !== 'number' || typeof timezone !== 'string' || !timezone) {
    return NextResponse.json({ error: 'primaryLocation must include numeric lat, numeric lon, and a timezone string' }, { status: 400 });
  }

  if (!Array.isArray(body.stocks?.symbols) || !body.stocks.symbols.every((s) => typeof s === 'string')) {
    return NextResponse.json({ error: 'stocks.symbols must be an array of strings' }, { status: 400 });
  }

  for (const key of ['secondaryLocation', 'tertiaryLocation'] as const) {
    const loc = body[key];
    if (loc?.enabled && (typeof loc.lat !== 'number' || typeof loc.lon !== 'number' || typeof loc.timezone !== 'string')) {
      return NextResponse.json({ error: `${key} must include numeric lat, numeric lon, and a timezone string when enabled` }, { status: 400 });
    }
  }

  for (const key of ['upcomingEventsCount', 'celebrationsCount'] as const) {
    const value = body.display?.[key];
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 10) {
      return NextResponse.json({ error: `display.${key} must be an integer between 1 and 10` }, { status: 400 });
    }
  }

  try {
    writeConfig(body);
    // Invalidate ISR cache so the dashboard reflects new config immediately
    revalidatePath('/');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
