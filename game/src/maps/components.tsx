import { motion } from 'framer-motion';
import { Search, Star, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_META, type Place } from './store';

export function SearchButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('search')}
      style={{
        flex: 1, height: 56, padding: '0 22px', borderRadius: 999,
        background: 'white', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', fontSize: 17,
        color: '#202124', textAlign: 'left', fontWeight: 500,
      }}
    >
      <Search size={24} color="#5F6368" />
      Suchen
    </button>
  );
}

export function PlaceCard({ place, onClick }: { place: Place; onClick: () => void }) {
  const meta = CATEGORY_META[place.category];
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: 12,
        background: 'white', border: 'none', borderRadius: 12, cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)', textAlign: 'left', width: '100%',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: meta.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
      }}>{meta.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#202124' }}>{place.name}</div>
        <div style={{ fontSize: 13, color: '#5F6368', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <Star size={12} fill="#FBBC05" color="#FBBC05" />
          <span>{place.rating}</span>
          <span style={{ margin: '0 4px' }}>·</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.address}</span>
        </div>
      </div>
      <ChevronRight size={20} color="#9AA0A6" />
    </motion.button>
  );
}

export function NominatimCard({ name, address, onClick }: { name: string; address: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: 12,
        background: 'white', border: 'none', borderRadius: 12, cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)', textAlign: 'left', width: '100%',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: '#34A853',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <MapPin size={22} color="white" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#202124' }}>{name}</div>
        <div style={{ fontSize: 13, color: '#5F6368', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{address}</div>
      </div>
    </motion.button>
  );
}

export function IconButton({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        width: 44, height: 44, borderRadius: '50%', background: 'white',
        border: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        ...style,
      }}
    >{children}</motion.button>
  );
}
