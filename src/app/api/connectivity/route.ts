import { NextResponse } from 'next/server';

// pi-monitor's backend already polls UniFi Site Manager and is deployed and
// working at this host; proxy through it instead of hitting api.ui.com
// directly (which would need its own UNIFI_API_KEY configured for daylight).
const PI_MONITOR_URL = process.env.PI_MONITOR_URL || 'http://192.168.1.5';

interface IspSummary {
  latency_ms: number | null;
  packet_loss_percent: number | null;
  download_mbps: number | null;
  upload_mbps: number | null;
  uptime_percent: number | null;
  isp_name: string | null;
}

export async function GET() {
  try {
    const res = await fetch(`${PI_MONITOR_URL}/api/unifi/isp`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error(`pi-monitor returned ${res.status}`);

    const json = await res.json();
    const summary: Partial<IspSummary> = json.summary || {};

    if (json.error || !json.summary) {
      return NextResponse.json({ error: json.error || 'No summary data' }, { status: 502 });
    }

    return NextResponse.json({
      latest: {
        latency: summary.latency_ms ?? null,
        packetLoss: summary.packet_loss_percent ?? null,
        uptime: summary.uptime_percent ?? null,
        downloadMbps: summary.download_mbps ?? null,
        uploadMbps: summary.upload_mbps ?? null,
        ispName: summary.isp_name ?? null,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
