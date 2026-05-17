import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import IssueCertificate from './pages/IssueCertificate';
import History from './pages/History';
import TestProcessing from './pages/TestProcessing';
import TestImageVerification from './pages/TestImageVerification';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* ── Public Routes ─────────────────────────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ── Protected Routes ──────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/issue-document" element={<IssueCertificate />} />
        <Route path="/history" element={<History />} />
        <Route path="/process" element={<TestProcessing />} />
        <Route path="/image-verify" element={<TestImageVerification />} />
      </Route>
    </Routes>
  );
}

export default App;

