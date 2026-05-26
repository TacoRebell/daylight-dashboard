import { NextResponse } from 'next/server'
import { groupByArtist, type TmShow } from '@/lib/vegasEvents'
import { isKnownArtist } from '@/lib/knownArtists'

export const revalidate = 3600

const TM_BASE = 'https://app.ticketmaster.com/discovery/v2/events.json'

function getDateRange(): [string, string] {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 6)
  const fmt = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, 'Z')
  return [fmt(start), fmt(end)]
}

export async function GET() {
  const apiKey = process.env.TICKETMASTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'TICKETMASTER_API_KEY not set' }, { status: 500 })
  }

  const [startDateTime, endDateTime] = getDateRange()

  const params = new URLSearchParams({
    apikey: apiKey,
    city: 'Las Vegas',
    stateCode: 'NV',
    countryCode: 'US',
    classificationName: 'music',
    startDateTime,
    endDateTime,
    size: '200',
    sort: 'relevance,desc',
  })

  try {
    const res = await fetch(`${TM_BASE}?${params}`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`Ticketmaster API error ${res.status}`)
    const data = await res.json()
    const events: TmShow[] = data?._embedded?.events ?? []
    const artists = groupByArtist(events).filter((a) => isKnownArtist(a.name))
    return NextResponse.json({ artists })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
