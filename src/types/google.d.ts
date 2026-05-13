export {}

declare global {
  interface Window {
    google: {
      maps: {
        Map: new (div: HTMLElement, opts: object) => object
        Marker: new (opts: object) => object
        Polyline: new (opts: object) => object
        Size: new (w: number, h: number) => unknown
        Point: new (x: number, y: number) => unknown
        DirectionsService: new () => {
          route: (
            request: {
              origin: { lat: number; lng: number } | string
              destination: { lat: number; lng: number } | string
              travelMode: string
            },
            callback: (result: unknown, status: string) => void
          ) => void
        }
        DirectionsRenderer: new (opts?: {
          map?: unknown
          suppressMarkers?: boolean
          polylineOptions?: { strokeColor?: string; strokeWeight?: number; strokeOpacity?: number }
        }) => {
          setDirections: (result: unknown) => void
        }
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: {
              componentRestrictions?: { country: string | string[] }
              fields?: string[]
              types?: string[]
            }
          ) => {
            addListener: (event: string, callback: () => void) => void
            getPlace: () => {
              formatted_address?: string
              geometry?: { location: { lat: () => number; lng: () => number } }
              address_components?: Array<{
                long_name: string
                short_name: string
                types: string[]
              }>
            }
          }
        }
      }
    }
  }
}
