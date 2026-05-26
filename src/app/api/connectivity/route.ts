import { NextResponse } from 'next/server';

const API_BASE = 'https://api.ui.com';

export async function GET() {
  const apiKey = process.env.UNIFI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key configured' }, { status: 503 });
  }

  try {
    const res = await fetch(`${API_BASE}/v1/isp-metrics/5m?duration=24h`, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error(`UniFi API returned ${res.status}`);

    const json = await res.json();
    const siteData = json.data?.[0];

    if (!siteData) return NextResponse.json({ error: 'No site data' }, { status: 502 });

    const rawPeriods = siteData.periods || [];
    if (!rawPeriods.length) return NextResponse.json({ error: 'No periods' }, { status: 502 });

    const periods = rawPeriods.map((p: Record<string, unknown>) => {
      const wan = (p.data as Record<string, unknown>)?.wan as Record<string, unknown> || {};
      return {
        t: p.timestamp ?? p.start ?? null,
        latency: wan.avgLatency ?? null,
        packetLoss: wan.packetLoss ?? null,
        uptime: wan.uptime ?? null,
        downloadKbps: wan.download_kbps ?? null,
        uploadKbps: wan.upload_kbps ?? null,
        ispName: wan.ispName ?? null,
      };
    });

    const latest = periods[periods.length - 1];

    return NextResponse.json({
      latest: {
        latency: latest.latency,
        packetLoss: latest.packetLoss,
        uptime: latest.uptime,
        downloadMbps: latest.downloadKbps ? Math.round(latest.downloadKbps / 1000) : null,
        uploadMbps: latest.uploadKbps ? Math.round(latest.uploadKbps / 1000) : null,
        ispName: latest.ispName,
      },
      periods,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
