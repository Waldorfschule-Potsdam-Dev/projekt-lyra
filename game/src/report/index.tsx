import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import DossierView from './DossierView';
import DoneScreen from './DoneScreen';
import { isCompleted, markCompleted } from './storage';

export default function ReportApp() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isCompleted()) {
      navigate('/report/done', { replace: true });
    }
  }, [navigate]);

  const handleSubmitted = () => {
    markCompleted();
    navigate('/report/done', { replace: true });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route path="/" element={<DossierView onSubmitted={handleSubmitted} />} />
        <Route path="/done" element={<DoneScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
