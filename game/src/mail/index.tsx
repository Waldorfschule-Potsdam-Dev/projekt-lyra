import { useSearchParams } from 'react-router-dom';
import { Routes, Route, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Inbox from './Inbox';
import EmailDetail from './EmailDetail';
import Compose from './Compose';
import Profile from './Profile';
import { useAdTimer, useEmails } from './store';
import type { Email } from './types';

function DetailRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <EmailDetail />;
}

function ComposeRoute() {
  const [params] = useSearchParams();
  const replyId = params.get('reply');
  const all = useEmails();
  const draft: Email | undefined = replyId ? all.find(e => e.id === replyId) : undefined;
  return <Compose key={replyId ?? 'new'} draft={draft} />;
}

function AdPump() {
  useAdTimer();
  return null;
}

export default function YMailApp() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <AdPump />
      <Routes>
        <Route path="/" element={<Inbox />} />
        <Route path="/compose" element={<ComposeRoute />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/:id" element={<DetailRoute />} />
      </Routes>
    </div>
  );
}
