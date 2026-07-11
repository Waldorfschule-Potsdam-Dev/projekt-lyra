import { Routes, Route } from 'react-router-dom';
import SmsList from './SmsList';
import ChatView from './ChatView';

export default function NachrichtenApp() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route path="/" element={<SmsList />} />
        <Route path="/chat/:categoryId" element={<ChatView />} />
      </Routes>
    </div>
  );
}
