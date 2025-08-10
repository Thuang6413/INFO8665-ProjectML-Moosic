import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import CameraComponent from '../components/CameraComponent';
import DarkVeil from '../components/DarkVeil';
import '../index.css';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = () => {
      const token = Cookies.get('token');
      setIsLoggedIn(!!token);
    };

    checkLogin();
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user_email');
    Cookies.remove('user_name');
    Cookies.remove('user_id');
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  return (
    <div className="relative min-h-screen font-sans overflow-hidden">
      {/* 🔹 Animated Background */}
      <DarkVeil
        hueShift={325}
        noiseIntensity={0.01}
        scanlineIntensity={0.0}
        warpAmount={0.0}
        resolutionScale={1.2}
      />

      {/* 🔹 Foreground */}
      <div className="relative z-10 flex flex-col min-h-screen items-center justify-center">
        {isLoggedIn && (
          <div className="absolute top-6 right-6 flex gap-3">
            <Button
              variant="text"
              onClick={() => navigate('/settings')}
              sx={{
                color: '#ff4081',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': { opacity: 0.7 }
              }}
            >
              Settings
            </Button>
            <Button
              variant="text"
              onClick={handleLogout}
              sx={{
                color: '#ff4081',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': { opacity: 0.7 }
              }}
            >
              Sign Out
            </Button>
          </div>
        )}

        {isLoggedIn ? (
          <div className="w-full max-w-lg flex justify-center">
            <CameraComponent />
          </div>
        ) : (
          <div className="glass-card text-center max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <img
                className="w-auto h-32"
                src="/logo-colored.png"
                alt="Moosic Logo"
              />
            </div>

            <h1 className="text-4xl font-bold mb-4 text-accent">
              Welcome to <span className="logo-font text-accent">Moosic</span>
            </h1>

            <p className="text-gray-200 mb-6">
              Log in to detect your mood and enjoy personalized music recommendations.
            </p>

            <Stack spacing={2} direction="row" justifyContent="center">
              <Button
                href="/login"
                variant="text"
                sx={{ color: '#ff4081', fontWeight: 'bold' }}
              >
                Sign In
              </Button>
              <Button
                href="/register"
                variant="text"
                sx={{ color: '#ff4081', fontWeight: 'bold' }}
              >
                Sign Up
              </Button>
            </Stack>

          </div>
        )}
      </div>
    </div>
  );
}
