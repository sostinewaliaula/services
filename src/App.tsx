import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ManageServices } from './pages/ManageServices';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/manage" element={<ManageServices />} />
      </Routes>
    </BrowserRouter>
  );
}