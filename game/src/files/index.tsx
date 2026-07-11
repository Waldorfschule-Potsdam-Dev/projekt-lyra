import { FolderView, FolderList } from './components';
import { Routes, Route } from 'react-router-dom';

export default function DateienApp() {
  return (
    <div style={{
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f2f2f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        <Routes>
          <Route path="/" element={<FolderList />} />
          <Route path=":folderName" element={<FolderView />} />
        </Routes>
      </div>
    </div>
  );
}
