// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/index';
import LoginPage from './pages/login';
import Register from './pages/register';
import Settings from './pages/settings';
import LogsPage from './pages/logsPage';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/logs" element={<LogsPage />} />
    </Routes>
  );
}

export default App;
