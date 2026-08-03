import { NextResponse } from 'next/server'
import { groupByArtist, type TmShow } from '@/lib/eventsCarousel'
import { isKnownArtist } from '@/lib/knownArtists'
import { readConfig } from '@/lib/config'

export const revalidate = 3600

const TM_BASE = 'https://app.ticketmaster.com/discovery/v2/events.json'
const RADIUS_MILES = 50

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

  const { primaryLocation } = readConfig()
  const [startDateTime, endDateTime] = getDateRange()

  // latlong+radius (rather than city/stateCode) works for any configured
  // location, not just US cities with a state abbreviation.
  const params = new URLSearchParams({
    apikey: apiKey,
    latlong: `${primaryLocation.lat},${primaryLocation.lon}`,
    radius: String(RADIUS_MILES),
    unit: 'miles',
    countryCode: primaryLocation.country,
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
