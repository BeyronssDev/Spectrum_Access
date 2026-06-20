type GoogleMapOptions = {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeId?: string;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  clickableIcons?: boolean;
  styles?: Array<Record<string, unknown>>;
};

export type GoogleMapInstance = {
  fitBounds: (bounds: GoogleLatLngBounds) => void;
  panTo: (position: { lat: number; lng: number }) => void;
  setMapTypeId: (mapTypeId: string) => void;
  setZoom: (zoom: number) => void;
};

export type GoogleMarkerInstance = {
  addListener: (eventName: string, handler: () => void) => void;
  setMap: (map: GoogleMapInstance | null) => void;
};

export type GoogleLatLngBounds = {
  extend: (position: { lat: number; lng: number }) => void;
};

export type GoogleMapsNamespace = {
  maps: {
    Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMapInstance;
    Marker: new (options: {
      map: GoogleMapInstance;
      position: { lat: number; lng: number };
      title: string;
      icon?: Record<string, unknown>;
    }) => GoogleMarkerInstance;
    LatLngBounds: new () => GoogleLatLngBounds;
  };
};

declare global {
  interface Window {
    google?: GoogleMapsNamespace;
    __spectrumGoogleMapsPromise?: Promise<GoogleMapsNamespace>;
  }
}

export function loadGoogleMaps(apiKey: string): Promise<GoogleMapsNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("google-maps-browser-only"));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (window.__spectrumGoogleMapsPromise) {
    return window.__spectrumGoogleMapsPromise;
  }

  window.__spectrumGoogleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "spectrum-google-maps";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google);
        return;
      }

      reject(new Error("google-maps-unavailable"));
    };
    script.onerror = () => reject(new Error("google-maps-load-failed"));
    document.head.appendChild(script);
  });

  return window.__spectrumGoogleMapsPromise;
}
