import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readConfig, writeConfig, DashboardConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = readConfig();
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  let body: DashboardConfig;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Basic shape validation
  if (!body.primaryLocation?.lat || !body.primaryLocation?.lon || !body.primaryLocation?.timezone) {
    return NextResponse.json({ error: 'primaryLocation must include lat, lon, and timezone' }, { status: 400 });
  }

  if (!Array.isArray(body.stocks?.symbols)) {
    return NextResponse.json({ error: 'stocks.symbols must be an array' }, { status: 400 });
  }

  try {
    writeConfig(body);
    // Invalidate ISR cache so the dashboard reflects new config immediately
    revalidatePath('/');
    revalidatePath('/week');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
