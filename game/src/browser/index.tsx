import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import BrowserHome from './BrowserHome';
import { SocialIndex } from './SocialIndex';
import { TradePage } from './TradePage';
import { CasinoPage } from './CasinoPage';
import { WetterPage } from './WetterPage';
import { TorjaegerPage } from './TorjaegerPage';
import { SternenweltPage } from './SternenweltPage';
import BlockcraftServerPage from './BlockcraftServerPage';

function SocialRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const onExit = () => navigate('/browser');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <SocialIndex onExit={onExit} />;
}

function CasinoRoute() {
  const navigate = useNavigate();
  return <CasinoPage onExit={() => navigate('/browser')} />;
}

export default function BrowserApp() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#000' }}>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<BrowserHome />} />
          <Route path="/vox-kommun/*" element={<SocialRoute />} />
          <Route path="/casino/*" element={<CasinoRoute />} />
          <Route path="/wetter-360/*" element={<WetterPage />} />
          <Route path="/torjaeger-live/*" element={<TorjaegerPage />} />
          <Route path="/sternenwelt/*" element={<SternenweltPage />} />
          <Route path="/boersen-terminal/*" element={<TradePage />} />
          <Route path="/blockcraft/*" element={<BlockcraftServerPage />} />
        </Routes>
      </div>
    </div>
  );
}
