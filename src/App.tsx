import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ManageServices } from './pages/ManageServices';
import { ToastProvider } from './components/ui/Toast';

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/manage" element={<ManageServices />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}