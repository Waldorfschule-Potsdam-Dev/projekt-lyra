import { create } from 'zustand';

export const BRAND = '#34A853';
export const MUTED = '#5F6368';
export const DARK = '#202124';
export const BG = '#F8F9FA';

export type LatLng = { lat: number; lng: number };

export type Category =
  | 'restaurant'
  | 'cafe'
  | 'hotel'
  | 'attraction'
  | 'shopping'
  | 'transit'
  | 'park'
  | 'home';

export const CATEGORY_META: Record<Category, { label: string; emoji: string; color: string }> = {
  restaurant: { label: 'Restaurants', emoji: '🍽️', color: '#EA4335' },
  cafe: { label: 'Cafés', emoji: '☕', color: '#A16207' },
  hotel: { label: 'Hotels', emoji: '🏨', color: '#1A73E8' },
  attraction: { label: 'Sehenswürdigkeiten', emoji: '🗿', color: '#FBBC05' },
  shopping: { label: 'Einkaufen', emoji: '🛍️', color: '#E1306C' },
  transit: { label: 'ÖPNV', emoji: '🚇', color: '#1A73E8' },
  park: { label: 'Parks', emoji: '🌳', color: '#34A853' },
  home: { label: 'Wohnungen', emoji: '🏠', color: '#FF6F00' },
};

export type Place = {
  id: string;
  name: string;
  category: Category;
  address: string;
  location: LatLng;
  rating: number;
  openNow: boolean;
  photo: string;
};

export type City = {
  id: string;
  name: string;
  state: string;
  country: string;
  location: LatLng;
};

type MapState = {
  viewMode: 'standard' | 'satellite';
  setViewMode: (m: 'standard' | 'satellite') => void;

  myLocation: LatLng;

  mapView: { center: LatLng; zoom: number };
  setMapView: (v: { center: LatLng; zoom: number }) => void;

  flyToRequest: { location: LatLng; zoom: number; key: number } | null;
  requestFlyTo: (location: LatLng, zoom: number) => void;

  places: Place[];
  selectedPlaceId: string | null;
  setSelectedPlaceId: (id: string | null) => void;
  searchResult: Place | null;
  setSearchResult: (p: Place | null) => void;

  selectedCityId: string | null;
  setSelectedCityId: (id: string | null) => void;

  pink: boolean;
  setPink: (b: boolean) => void;
};

const BERLIN = { lat: 52.5200, lng: 13.4050 };

const PINK_KEY = 'maps-pink';

function loadPink(): boolean {
  try { return localStorage.getItem(PINK_KEY) === '1'; } catch { return false; }
}

function savePink(b: boolean) {
  try { localStorage.setItem(PINK_KEY, b ? '1' : '0'); } catch { /* ignore */ }
}

const photo = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/360`;

export const CITIES: City[] = [
  { id: 'city-berlin', name: 'Berlin', state: 'Berlin', country: 'Deutschland', location: { lat: 52.5200, lng: 13.4050 } },
  { id: 'city-potsdam', name: 'Potsdam', state: 'Brandenburg', country: 'Deutschland', location: { lat: 52.3906, lng: 13.0645 } },
  { id: 'city-cottbus', name: 'Cottbus', state: 'Brandenburg', country: 'Deutschland', location: { lat: 51.7606, lng: 14.3342 } },
  { id: 'city-muenchen', name: 'München', state: 'München', country: 'Deutschland', location: { lat: 48.1351, lng: 11.5820 } },
  { id: 'city-hamburg', name: 'Hamburg', state: 'Hamburg', country: 'Deutschland', location: { lat: 53.5511, lng: 9.9937 } },
  { id: 'city-koeln', name: 'Köln', state: 'Nordrhein-Westfalen', country: 'Deutschland', location: { lat: 50.9375, lng: 6.9603 } },
  { id: 'city-frankfurt', name: 'Mainhattan am Main', state: 'Hessen', country: 'Deutschland', location: { lat: 50.1109, lng: 8.6821 } },
  { id: 'city-dresden', name: 'Dresden', state: 'Sachsen', country: 'Deutschland', location: { lat: 51.0504, lng: 13.7373 } },
  { id: 'city-leipzig', name: 'Leipzig', state: 'Sachsen', country: 'Deutschland', location: { lat: 51.3397, lng: 12.3731 } },
  { id: 'city-stuttgart', name: 'Schwaben', state: 'Baden-Württemberg', country: 'Deutschland', location: { lat: 48.7758, lng: 9.1829 } },
  { id: 'city-bremen', name: 'Bremen', state: 'Bremen', country: 'Deutschland', location: { lat: 53.0793, lng: 8.8017 } },
  { id: 'city-hannover', name: 'Hannover', state: 'Niedersachsen', country: 'Deutschland', location: { lat: 52.3759, lng: 9.7320 } },
  { id: 'city-nuernberg', name: 'Nürnberg', state: 'München', country: 'Deutschland', location: { lat: 49.4521, lng: 11.0767 } },
  { id: 'city-duesseldorf', name: 'Düsseldorf', state: 'Nordrhein-Westfalen', country: 'Deutschland', location: { lat: 51.2277, lng: 6.7735 } },
  { id: 'city-rostock', name: 'Rostock', state: 'Mecklenburg-Vorpommern', country: 'Deutschland', location: { lat: 54.0924, lng: 12.0991 } },
];

const POIS: Place[] = [
  { id: 'home-main', name: 'Hauptwohnung Pankow', category: 'home', address: 'Schönhauser Allee 84, 13187 Berlin', location: { lat: 52.5400, lng: 13.4120 }, rating: 5, openNow: true, photo: photo('home-main') },
  { id: 'home-refuge', name: 'Refugium Babelsberg', category: 'home', address: 'Karl-Marx-Straße 12a, 14482 Potsdam', location: { lat: 52.3910, lng: 13.0930 }, rating: 5, openNow: true, photo: photo('home-refuge') },
  { id: 'p-arctic', name: 'Banking 3785//885746', category: 'attraction', address: '83°32′43.6″N 32°20′48.2″W', location: { lat: 83.5454, lng: -32.3467 }, rating: 5, openNow: true, photo: photo('p-arctic') },
];

export const useMapStore = create<MapState>((set) => ({
  viewMode: 'standard',
  setViewMode: (m) => set({ viewMode: m }),

  myLocation: BERLIN,

  mapView: { center: BERLIN, zoom: 14 },
  setMapView: (v) => set({ mapView: v }),

  flyToRequest: null,
  requestFlyTo: (location, zoom) => set((state) => ({
    flyToRequest: { location, zoom, key: (state.flyToRequest?.key ?? 0) + 1 },
  })),

  places: POIS,
  selectedPlaceId: null,
  setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
  searchResult: null,
  setSearchResult: (p) => set({ searchResult: p }),

  selectedCityId: null,
  setSelectedCityId: (id) => set({ selectedCityId: id }),

  pink: loadPink(),
  setPink: (b) => { savePink(b); set({ pink: b }); },
}));
