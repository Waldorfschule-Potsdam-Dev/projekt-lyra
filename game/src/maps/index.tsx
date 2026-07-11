import { Routes, Route } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { MapScreen, SearchScreen, PlaceDetailScreen } from './screens';

export default function MapsApp() {
  return (
    <Routes>
      <Route path="/" element={<MapScreen />} />
      <Route path="/search" element={<SearchScreen />} />
      <Route path="/place/:id" element={<PlaceDetailScreen />} />
    </Routes>
  );
}
