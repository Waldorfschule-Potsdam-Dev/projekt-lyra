import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { LibraryProvider } from './context/LibraryContext';
import BottomNav from './components/BottomNav';
import TopBar from './components/TopBar';
import PlayerBar from './components/PlayerBar';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import LikedSongs from './pages/LikedSongs';
import PlaylistView from './pages/PlaylistView';
import Settings from './pages/Settings';
import TunnelDash from './pages/TunnelDash';
import { songs } from './data/songs';
import './Musica.css';

function Shell() {
  const location = useLocation();
  const isRunner = location.pathname.endsWith('/runner');
  return (
    <div className="sp-app">
      {!isRunner && <TopBar />}
      <div className="sp-content">
        <Routes>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="liked" element={<LikedSongs />} />
          <Route path="playlist/:id" element={<PlaylistView />} />
          <Route path="settings" element={<Settings />} />
          <Route path="runner" element={<TunnelDash />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      {!isRunner && <PlayerBar />}
      {!isRunner && <BottomNav />}
    </div>
  );
}

export default function MusicaApp() {
  const [, setForceRender] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('https://archive.org/metadata/synthwave-dreams-vol.-1-16').then((r) => r.json()),
      fetch('https://archive.org/metadata/ChillPills').then((r) => r.json()),
    ])
      .then(([synthData, chillData]) => {
        const synthFiles = synthData.files.filter((f: any) => f.format.includes('MP3') && f.name.endsWith('.mp3'));
        const chillFiles = chillData.files.filter((f: any) => f.format.includes('MP3') && f.name.endsWith('.mp3'));

        const encodeArchiveUrl = (name: string) => name.split('/').map(encodeURIComponent).join('/');

        songs.forEach((song, i) => {
          if (i < 8) {
            const file = synthFiles[i];
            if (file) {
              song.url = `https://archive.org/download/synthwave-dreams-vol.-1-16/${encodeArchiveUrl(file.name)}`;
              const match = file.name.match(/\d+\.\s*(.+?)\s*-\s*(.+?)\.mp3/);
              if (match) {
                song.artist = match[1];
                song.title = match[2];
              } else {
                song.title = file.title || file.name.replace('.mp3', '');
              }
            }
          } else {
            const file = chillFiles[i - 8];
            if (file) {
              song.url = `https://archive.org/download/ChillPills/${encodeArchiveUrl(file.name)}`;
              song.title = file.title || file.name.split('_-_').pop()?.replace('.mp3', '') || file.name;
              song.artist = 'Uplifting Pills';
            }
          }
        });
        
        setForceRender(x => x + 1);
      })
      .catch((err) => console.error('Failed to load archive.org music', err));
  }, []);

  return (
    <LibraryProvider>
      <PlayerProvider>
        <Shell />
      </PlayerProvider>
    </LibraryProvider>
  );
}