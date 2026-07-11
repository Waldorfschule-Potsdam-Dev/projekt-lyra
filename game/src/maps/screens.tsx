import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, Star, MapPin, Compass, ArrowLeft, Home } from 'lucide-react';
import { useMapStore, CATEGORY_META, type Place, type Category } from './store';
import { SearchButton, PlaceCard, NominatimCard, IconButton } from './components';
import MapView from './MapView';
import { CollectClueButton } from '../components/CollectClueButton';

type NominatimResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class: string;
};

export function MapScreen() {
  const places = useMapStore((s) => s.places);
  const selectedPlaceId = useMapStore((s) => s.selectedPlaceId);
  const searchResult = useMapStore((s) => s.searchResult);
  const viewMode = useMapStore((s) => s.viewMode);
  const setViewMode = useMapStore((s) => s.setViewMode);
  const setSelectedPlaceId = useMapStore((s) => s.setSelectedPlaceId);
  const pink = useMapStore((s) => s.pink);
  const setPink = useMapStore((s) => s.setPink);

  const selected = searchResult ?? places.find((p) => p.id === selectedPlaceId) ?? null;

  if (pink) {
    return <PinkScreen onCode={(c) => { if (c === '676869') setPink(false); }} />;
  }

  return (
    <>
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        <MapView />

        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 600,
          padding: '58px 12px 10px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), transparent)',
          display: 'flex', gap: 8, alignItems: 'center', pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'auto', flex: 1 }}><SearchButton /></div>
        </div>

        <div style={{ position: 'absolute', right: 12, top: 130, zIndex: 500 }}>
          <IconButton onClick={() => setViewMode(viewMode === 'standard' ? 'satellite' : 'standard')}>
            <Compass size={20} color="#202124" />
          </IconButton>
        </div>

        <div style={{ position: 'absolute', right: 12, top: 186, zIndex: 500 }}>
          <IconButton onClick={() => setSelectedPlaceId('home-main')}>
            <Home size={20} color="#202124" />
          </IconButton>
        </div>

        <div style={{ position: 'absolute', right: 12, top: 242, zIndex: 500 }}>
          <IconButton onClick={() => setSelectedPlaceId('home-refuge')}>
            <Home size={20} color="#FF6F00" />
          </IconButton>
        </div>

        {selected && <PlaceMini place={selected} />}
      </div>
    </>
  );
}

function PinkScreen({ onCode }: { onCode: (code: string) => void }) {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code === '676869') {
      onCode(code);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        background: '#FF69B4', color: 'white',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: 'system-ui, sans-serif',
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>ERROR</div>
      <div style={{
        background: 'rgba(0,0,0,0.15)', borderRadius: 12, padding: 16, marginBottom: 20,
        fontSize: 13, fontFamily: 'monospace', textAlign: 'center', lineHeight: 1.5,
      }}>
        Cannot read "41eRI02902L._AC_UF1000,1000_QL80_.jpg"<br />
        (this model does not support image input)
      </div>
      <input
        ref={inputRef}
        value={code}
        onChange={(e) => { setCode(e.target.value); onCode(e.target.value); }}
        onKeyDown={handleKeyDown}
        placeholder="Code eingeben"
        autoFocus
        style={{
          width: '100%', maxWidth: 260, padding: '12px 16px', borderRadius: 999,
          border: 'none', outline: 'none', fontSize: 16, textAlign: 'center',
          background: 'rgba(255,255,255,0.95)', color: '#202124',
          fontFamily: 'monospace', letterSpacing: 2,
        }}
      />
    </div>
  );
}

function PlaceMini({ place }: { place: Place }) {
  const navigate = useNavigate();
  const meta = CATEGORY_META[place.category];
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      onClick={() => navigate(`/maps/place/${place.id}`)}
      style={{
        position: 'absolute', left: 12, right: 12, bottom: 24, zIndex: 700,
        background: 'white', borderRadius: 16, padding: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: meta.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
      }}>{meta.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#202124' }}>{place.name}</div>
        <div style={{ fontSize: 13, color: '#5F6368', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Star size={12} fill="#FBBC05" color="#FBBC05" /> {place.rating} · {place.address}
        </div>
      </div>
    </motion.div>
  );
}

export function SearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [nominatim, setNominatim] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const places = useMapStore((s) => s.places);
  const pink = useMapStore((s) => s.pink);
  const setSelectedPlaceId = useMapStore((s) => s.setSelectedPlaceId);
  const setSearchResult = useMapStore((s) => s.setSearchResult);
  const setMapView = useMapStore((s) => s.setMapView);
  const setPink = useMapStore((s) => s.setPink);

  useEffect(() => {
    setPink(query.trim() === '67');
  }, [query, setPink]);

  const categories: Category[] = Object.keys(CATEGORY_META) as Category[];

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const q = query.trim();
    if (q.length < 2) {
      debounce.current = setTimeout(() => { setNominatim([]); setLoading(false); }, 0);
      return;
    }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&accept-language=de`,
          { headers: { 'User-Agent': 'EscapeMapsApp/1.0' } },
        );
        setNominatim(await r.json());
      } catch { setNominatim([]); }
      setLoading(false);
    }, 400);
  }, [query]);

  const localMatches = query.trim().length >= 2
    ? places.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const onLocal = (p: Place) => { setMapView({ center: p.location, zoom: 15 }); setSelectedPlaceId(p.id); setSearchResult(null); navigate(`/maps/place/${p.id}`); };
  const onNom = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const id = `n-${r.place_id}`;
    const place: Place = {
      id,
      name: r.display_name.split(',')[0],
      category: guessCategory(r.class, r.type),
      address: r.display_name,
      location: { lat, lng },
      rating: 0,
      openNow: true,
      photo: `https://picsum.photos/seed/${id}/640/360`,
    };
    setSearchResult(place);
    setSelectedPlaceId(id);
    navigate('/maps');
  };

  if (pink) {
    return <PinkScreen onCode={(c) => { if (c === '676869') setPink(false); }} />;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'white' }}>
      <div style={{ padding: '58px 12px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}>
          <ArrowLeft size={26} color="#202124" />
        </button>
        <div style={{
          flex: 1, background: '#F1F3F4', borderRadius: 999, height: 56,
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
        }}>
          <Search size={24} color="#5F6368" />
          <input
            autoFocus value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 18, color: '#202124' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setNominatim([]); }} style={{ width: 26, height: 26, borderRadius: '50%', background: '#9AA0A6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color="white" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '0 12px 32px' }}>
        {query === '' ? (
          <>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0 12px' }}>
              {categories.map((c) => (
                <div key={c} style={{
                  padding: '10px 16px', background: '#F1F3F4', borderRadius: 999,
                  fontSize: 14, color: '#202124', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                }}>
                  <span>{CATEGORY_META[c].emoji}</span> {CATEGORY_META[c].label}
                </div>
              ))}
            </div>
            <div style={{ color: '#9AA0A6', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', padding: '16px 4px 8px' }}>Tipps</div>
            <div style={{ color: '#5F6368', fontSize: 15, padding: '0 4px' }}>Suche nach Adresse, Restaurant oder Sehenswürdigkeit.</div>
          </>
        ) : (
          <>
            {loading && <div style={{ color: '#5F6368', textAlign: 'center', padding: 20 }}>Suche läuft…</div>}

            {nominatim.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {nominatim.map((r) => (
                  <NominatimCard
                    key={r.place_id}
                    name={r.display_name.split(',')[0]}
                    address={r.display_name.split(',').slice(1, 3).join(',').trim()}
                    onClick={() => onNom(r)}
                  />
                ))}
              </div>
            )}

            {localMatches.length > 0 && (
              <>
                <div style={{ color: '#9AA0A6', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', padding: '16px 4px 8px' }}>In der Nähe</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {localMatches.map((p) => <PlaceCard key={p.id} place={p} onClick={() => onLocal(p)} />)}
                </div>
              </>
            )}

            {!loading && nominatim.length === 0 && localMatches.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#5F6368' }}>
                <Search size={40} color="#9AA0A6" />
                <div style={{ marginTop: 8 }}>Keine Ergebnisse</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function PlaceDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const place = useMapStore((s) => s.places.find((p) => p.id === id) ?? s.searchResult);

  if (!place) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
        <button onClick={() => navigate(-1)}>Zurück</button>
      </div>
    );
  }

  const meta = CATEGORY_META[place.category];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'white' }}>
      <div style={{ padding: '58px 12px 12px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #F1F3F4' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={26} color="#202124" />
        </button>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#202124', marginLeft: 8 }}>Details</span>
      </div>

      <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: meta.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>{meta.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#202124', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {place.name}
              {place.id === 'home-main' && <CollectClueButton clueId="maps:pankow-wohnung" />}
            </div>
            <div style={{ fontSize: 13, color: '#5F6368', display: 'flex', alignItems: 'center', gap: 4 }}>
              {place.rating > 0 && <><Star size={12} fill="#FBBC05" color="#FBBC05" /> {place.rating} · </>}
              {place.openNow ? <span style={{ color: '#34A853' }}>Geöffnet</span> : <span style={{ color: '#EA4335' }}>Geschlossen</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 0', color: '#5F6368', fontSize: 14 }}>
          <MapPin size={16} /> <span>{place.address}</span>
        </div>
      </div>
    </div>
  );
}

function guessCategory(cls: string, type: string): Category {
  if (cls === 'amenity' && type === 'restaurant') return 'restaurant';
  if (cls === 'amenity' && (type === 'cafe' || type === 'bar')) return 'cafe';
  if (cls === 'tourism' && type === 'hotel') return 'hotel';
  if (cls === 'tourism') return 'attraction';
  if (cls === 'shop') return 'shopping';
  if (cls === 'public_transport' || cls === 'railway' || cls === 'station') return 'transit';
  if (cls === 'leisure' && type === 'park') return 'park';
  return 'attraction';
}
