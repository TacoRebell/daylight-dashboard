export interface TmImage {
  url: string
  ratio: string
  width: number
  height: number
}

export interface TmShow {
  id: string
  url: string
  dates: {
    start: {
      localDate?: string
      dateTime?: string
      localTime?: string
    }
  }
  _embedded?: {
    venues?: Array<{ name: string }>
    attractions?: Array<{
      id: string
      name: string
      url: string
      images: TmImage[]
    }>
  }
  images: TmImage[]
}

export interface VegasArtist {
  id: string
  name: string
  image: TmImage | null
  tmUrl: string
  shows: TmShow[]
  nextDate: string
  dateRange: string
  venues: string[]
  showCount: number
}

function getBestImage(images: TmImage[]): TmImage | null {
  if (!images?.length) return null
  return (
    images.find((img) => img.ratio === '16_9' && img.width >= 640) ??
    images.find((img) => img.ratio === '16_9') ??
    images[0]
  )
}

function nextDate(shows: TmShow[]): string {
  return (
    shows
      .map((ev) => ev.dates?.start?.dateTime ?? ev.dates?.start?.localDate ?? '')
      .filter(Boolean)
      .sort()[0] ?? ''
  )
}

function fmtDate(d: string | undefined): string {
  if (!d) return 'TBD'
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function groupByArtist(events: TmShow[]): VegasArtist[] {
  const map: Record<string, VegasArtist> = {}

  for (const ev of events) {
    const attraction = ev._embedded?.attractions?.[0]
    const key = attraction?.id ?? '__unknown__'
    const name = attraction?.name ?? 'Unknown'

    if (!map[key]) {
      map[key] = {
        id: key,
        name,
        image: getBestImage(attraction?.images ?? ev.images ?? []),
        tmUrl: attraction?.url ?? ev.url,
        shows: [],
        nextDate: '',
        dateRange: '',
        venues: [],
        showCount: 0,
      }
    }
    map[key].shows.push(ev)
  }

  return Object.values(map)
    .filter((a) => a.id !== '__unknown__' && !a.name.toLowerCase().includes('tribute'))
    .map((a) => {
      const sorted = [...a.shows].sort((x, y) => {
        const dx = x.dates?.start?.localDate ?? ''
        const dy = y.dates?.start?.localDate ?? ''
        return dx.localeCompare(dy)
      })
      const first = sorted[0]?.dates?.start?.localDate
      const last = sorted[sorted.length - 1]?.dates?.start?.localDate
      const dateRange =
        sorted.length === 1 ? fmtDate(first) : `${fmtDate(first)} – ${fmtDate(last)}`
      const venues = [
        ...new Set(sorted.map((ev) => ev._embedded?.venues?.[0]?.name).filter(Boolean) as string[]),
      ]
      return {
        ...a,
        nextDate: nextDate(a.shows),
        dateRange,
        venues,
        showCount: a.shows.length,
      }
    })
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
}
