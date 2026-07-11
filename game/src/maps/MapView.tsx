import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useMapStore, CATEGORY_META, CITIES, type Place, type LatLng } from './store';

const TILES = {
  standard: { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '© Esri' },
};

const placeIcon = (place: Place, selected: boolean) =>
  L.divIcon({
    className: 'maps-marker',
    html: `
      <div style="
        position: relative;
        width: 28px; height: 36px;
        transform: translateY(${selected ? '-4px' : '0'});
        transition: transform 0.2s;
        filter: drop-shadow(0 3px 4px rgba(0,0,0,0.3));
      ">
        <svg viewBox="0 0 28 36" width="28" height="36" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 0 C6.27 0 0 6.27 0 14 C0 24 14 36 14 36 C14 36 28 24 28 14 C28 6.27 21.73 0 14 0 Z"
            fill="${selected ? '#1A73E8' : CATEGORY_META[place.category].color}"
            stroke="white" stroke-width="2"
          />
          <circle cx="14" cy="14" r="5" fill="white" />
        </svg>
      </div>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
  });

const meIcon = L.divIcon({
  className: 'maps-marker-me',
  html: '<div style="width:18px;height:18px;background:#1A73E8;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const cityIcon = (selected: boolean) =>
  L.divIcon({
    className: 'maps-marker-city',
    html: `
      <div style="
        position: relative;
        width: 32px; height: 40px;
        transform: translateY(${selected ? '-4px' : '0'});
        transition: transform 0.2s;
        filter: drop-shadow(0 3px 4px rgba(0,0,0,0.4));
      ">
        <svg viewBox="0 0 32 40" width="32" height="40" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 40 16 40 C16 40 32 28 32 16 C32 7.16 24.84 0 16 0 Z"
            fill="#FBBC05"
            stroke="white" stroke-width="2.5"
          />
          <path
            d="M16 7 L19 13.5 L26 14.5 L21 19.5 L22.2 26.5 L16 23 L9.8 26.5 L11 19.5 L6 14.5 L13 13.5 Z"
            fill="white"
          />
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });

function FlyTo({ target }: { target: LatLng | null }) {
  const map = useMap();
  const setMapView = useMapStore((s) => s.setMapView);
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 15, { duration: 0.7 });
      setMapView({ center: target, zoom: 15 });
    }
  }, [target, map, setMapView]);
  return null;
}

function FlyToRequest() {
  const map = useMap();
  const flyToRequest = useMapStore((s) => s.flyToRequest);
  const setMapView = useMapStore((s) => s.setMapView);
  useEffect(() => {
    if (flyToRequest) {
      map.flyTo([flyToRequest.location.lat, flyToRequest.location.lng], flyToRequest.zoom, { duration: 0.7 });
      setMapView({ center: flyToRequest.location, zoom: flyToRequest.zoom });
    }
  }, [flyToRequest, map, setMapView]);
  return null;
}

function TrackView() {
  const map = useMap();
  const setMapView = useMapStore((s) => s.setMapView);
  useEffect(() => {
    const sync = () => {
      const c = map.getCenter();
      setMapView({ center: { lat: c.lat, lng: c.lng }, zoom: map.getZoom() });
    };
    map.on('moveend', sync);
    map.on('zoomend', sync);
    return () => {
      map.off('moveend', sync);
      map.off('zoomend', sync);
    };
  }, [map, setMapView]);
  return null;
}

export default function MapView() {
  const places = useMapStore((s) => s.places);
  const myLocation = useMapStore((s) => s.myLocation);
  const viewMode = useMapStore((s) => s.viewMode);
  const selectedPlaceId = useMapStore((s) => s.selectedPlaceId);
  const searchResult = useMapStore((s) => s.searchResult);
  const mapView = useMapStore((s) => s.mapView);
  const selectedCityId = useMapStore((s) => s.selectedCityId);
  const setSelectedPlaceId = useMapStore((s) => s.setSelectedPlaceId);
  const setSearchResult = useMapStore((s) => s.setSearchResult);
  const setSelectedCityId = useMapStore((s) => s.setSelectedCityId);

  const selected = useMemo(
    () => searchResult ?? places.find((p) => p.id === selectedPlaceId) ?? null,
    [places, selectedPlaceId, searchResult],
  );

  const selectedCity = useMemo(
    () => CITIES.find((c) => c.id === selectedCityId) ?? null,
    [selectedCityId],
  );

  const tiles = TILES[viewMode];

  return (
    <MapContainer
      center={[mapView.center.lat, mapView.center.lng]}
      zoom={mapView.zoom}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url={tiles.url} attribution={tiles.attr} maxZoom={19} />
      <TrackView />
      <FlyTo target={selected?.location ?? null} />
      <FlyToRequest />

      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.location.lat, p.location.lng]}
          icon={placeIcon(p, selectedPlaceId === p.id)}
          eventHandlers={{ click: () => { setSelectedPlaceId(p.id); setSearchResult(null); setSelectedCityId(null); } }}
        />
      ))}

      {searchResult && (
        <Marker
          key={searchResult.id}
          position={[searchResult.location.lat, searchResult.location.lng]}
          icon={placeIcon(searchResult, true)}
        />
      )}

      {selectedCity && (
        <Marker
          key={selectedCity.id}
          position={[selectedCity.location.lat, selectedCity.location.lng]}
          icon={cityIcon(true)}
          eventHandlers={{ click: () => setSelectedCityId(null) }}
        />
      )}

      <Marker position={[myLocation.lat, myLocation.lng]} icon={meIcon} />
    </MapContainer>
  );
}
