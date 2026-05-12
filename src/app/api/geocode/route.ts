import { NextRequest, NextResponse } from 'next/server'

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function POST(req: NextRequest) {
  if (!KEY) return NextResponse.json({ error: 'Maps API key not configured' }, { status: 500 })

  const { address } = await req.json()
  if (!address?.trim()) return NextResponse.json({ error: 'Address required' }, { status: 400 })

  // 1. Geocoding
  const geoRes = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${KEY}&language=ko&region=KR`
  )
  const geoData = await geoRes.json()
  console.error('[geocode] Geocoding API response:', JSON.stringify(geoData, null, 2))
  if (geoData.status !== 'OK' || !geoData.results.length) {
    console.error('[geocode] Geocoding failed — status:', geoData.status, '| error_message:', geoData.error_message ?? 'none')
    const detail = geoData.error_message ? `${geoData.status}: ${geoData.error_message}` : geoData.status
    return NextResponse.json({ error: `Google API error: ${detail}` }, { status: 422 })
  }
  const { lat, lng } = geoData.results[0].geometry.location

  // 2. Nearby subway station (try 1.5 km then 5 km)
  async function findStation(radius: number) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${lat},${lng}&radius=${radius}&type=subway_station&key=${KEY}&language=ko`
    )
    return res.json()
  }

  let placesData = await findStation(1500)
  console.error('[geocode] Places API (1500m) response:', JSON.stringify(placesData, null, 2))
  if (!placesData.results?.length) {
    placesData = await findStation(5000)
    console.error('[geocode] Places API (5000m) response:', JSON.stringify(placesData, null, 2))
  }
  if (!placesData.results?.length) {
    console.error('[geocode] No subway station found — Places status:', placesData.status, '| error_message:', placesData.error_message ?? 'none')
    const detail = placesData.error_message ? `${placesData.status}: ${placesData.error_message}` : placesData.status
    return NextResponse.json({ error: `Google API error: ${detail}` }, { status: 422 })
  }

  const station = placesData.results[0]
  const stationName: string = station.name
  const stationLat: number = station.geometry.location.lat
  const stationLng: number = station.geometry.location.lng

  // 3. Walking distance (Distance Matrix)
  const distRes = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${lat},${lng}&destinations=${stationLat},${stationLng}&mode=walking&key=${KEY}&language=ko`
  )
  const distData = await distRes.json()
  console.error('[geocode] Distance Matrix API response:', JSON.stringify(distData, null, 2))
  const element = distData.rows?.[0]?.elements?.[0]
  const walkingSeconds: number = element?.status === 'OK' ? element.duration.value : 0
  const walkingMinutes = Math.max(1, Math.round(walkingSeconds / 60))

  return NextResponse.json({ lat, lng, stationName, stationLat, stationLng, walkingMinutes })
}
