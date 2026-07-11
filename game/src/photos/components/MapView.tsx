import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PHOTO_META, type Photo } from '../data';

// Fix leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const mapPinIcon = L.divIcon({
  className: 'fotos-map-pin',
  html: `<div style="
    width: 22px; height: 22px;
    background: #EA4335;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export const currentPinIcon = L.divIcon({
  className: 'fotos-map-pin-current',
  html: `<div style="
    width: 28px; height: 28px;
    background: #4285F4;
    border: 4px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export function MapBoundsEffect({
  showAll,
  photosWithMeta,
  currentMeta,
}: {
  showAll: boolean;
  photosWithMeta: Photo[];
  currentMeta: { lat: number; lng: number };
}) {
  const map = useMap();
  useEffect(() => {
    if (showAll && photosWithMeta.length > 1) {
      const bounds = L.latLngBounds(
        photosWithMeta.map((p) => {
          const m = PHOTO_META[p.name];
          return [m.lat, m.lng] as [number, number];
        }),
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    } else {
      map.setView([currentMeta.lat, currentMeta.lng], 13, { animate: true });
    }
  }, [showAll, photosWithMeta, currentMeta, map]);
  return null;
}

export function MiniMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  return (
    <div
      style={{
        marginTop: 8,
        height: 180,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#2a2a2a',
      }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        keyboard={false}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <Marker position={[lat, lng]} icon={mapPinIcon} title={label} />
      </MapContainer>
    </div>
  );
}

export function FullscreenMapView({
  currentPhoto,
  currentMeta,
  allPhotos,
  onClose,
  onSelectPhoto,
}: {
  currentPhoto: Photo;
  currentMeta: { location: string; lat: number; lng: number };
  allPhotos: Photo[];
  onClose: () => void;
  onSelectPhoto: (id: string) => void;
}) {
  const [showAll, setShowAll] = useState(true);

  const photosWithMeta = allPhotos.filter((p) => PHOTO_META[p.name]);
  const otherCount = photosWithMeta.filter((p) => p.id !== currentPhoto.id).length;
  const visible = showAll
    ? photosWithMeta
    : photosWithMeta.filter((p) => p.id === currentPhoto.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 30,
      }}
    >
      <header
        style={{
          padding: '40px 12px 12px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#000',
          flexShrink: 0,
        }}
      >
        <ArrowLeft
          size={28}
          color="#fff"
          onClick={onClose}
          style={{ cursor: 'pointer', marginRight: 12 }}
        />
        <span style={{ fontSize: 16, color: '#fff' }}>Karte</span>
      </header>

      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapContainer
          center={[currentMeta.lat, currentMeta.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          dragging={true}
          doubleClickZoom={true}
          zoomControl={true}
          keyboard={true}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <MapBoundsEffect
            showAll={showAll}
            photosWithMeta={photosWithMeta}
            currentMeta={currentMeta}
          />
          {visible.map((p) => {
            const m = PHOTO_META[p.name];
            return (
              <Marker
                key={p.id}
                position={[m.lat, m.lng]}
                icon={p.id === currentPhoto.id ? currentPinIcon : mapPinIcon}
                eventHandlers={{
                  click: () => onSelectPhoto(p.id),
                }}
                title={m.location}
              />
            );
          })}
        </MapContainer>

        <button
          onClick={() => setShowAll((s) => !s)}
          disabled={otherCount === 0}
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 20px',
            backgroundColor: showAll ? '#a8c7fa' : 'rgba(28,27,31,0.92)',
            color: showAll ? '#062e6f' : '#fff',
            border: '1px solid #a8c7fa',
            borderRadius: 24,
            cursor: otherCount === 0 ? 'default' : 'pointer',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            zIndex: 10,
            opacity: otherCount === 0 ? 0.5 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {showAll ? 'Andere ausblenden' : `Bilder in der Nähe (${otherCount})`}
        </button>
      </div>
    </motion.div>
  );
}
