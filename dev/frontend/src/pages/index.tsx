import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import CameraComponent from '../components/CameraComponent';
import Sidebar from '../components/Sidebar';
import DarkVeil from '../components/DarkVeil';
import '../index.css'; // Ensure glass-card styles are available

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);
  }, []);

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

      {/* Foreground content */}
      <div className="relative z-10 flex min-h-screen">
        {isLoggedIn && <Sidebar />}

        <div className="flex-1 flex items-center justify-center p-6">
          {isLoggedIn ? (
            <div className="w-full max-w-lg flex flex-col items-center">
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
              <a
                href="/login"
                className="px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:opacity-90 transition"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
