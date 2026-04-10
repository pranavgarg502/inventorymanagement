import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Users from './pages/Users';
import Assignments from './pages/Assignments';
import Maintenance from './pages/Maintenance';

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' },
          success: { iconTheme: { primary: '#34d399', secondary: '#1e293b' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#1e293b' } },
        }}
      />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/users" element={<Users />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/maintenance" element={<Maintenance />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
