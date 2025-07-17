// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/index';
import LoginPage from './pages/login';
import Register from './pages/register';
import Settings from './pages/settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;
