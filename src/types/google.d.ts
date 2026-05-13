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
            }
          }
        }
      }
    }
  }
}
