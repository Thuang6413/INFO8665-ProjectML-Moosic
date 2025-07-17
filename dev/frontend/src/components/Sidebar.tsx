import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user_email');
    Cookies.remove('user_name');
    Cookies.remove('user_id');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleSettingsClick = () => {
    const token = Cookies.get('token');
    if (!token) {
      setShowPopup(true);
    } else {
      navigate('/settings');
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-gray-950 border-r border-pink-900 text-white p-5 flex flex-col justify-between shadow-2xl z-50">
      <div>
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img src="/logo-white.png" alt="Moosic Logo" className="h-20 w-20" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-4">
          <button
            onClick={handleSettingsClick}
            className="w-full text-left px-4 py-2 rounded-lg bg-gray-800 hover:bg-pink-700 transition duration-300"
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Auth Button */}
      <div className="mt-auto">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-pink-700 rounded-lg hover:bg-pink-600 transition"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-2 bg-pink-700 rounded-lg hover:bg-pink-600 transition"
          >
            Login
          </button>
        )}
      </div>

      {/* Login Required Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-950 border border-pink-800 p-6 rounded-2xl shadow-xl text-center max-w-sm">
            <p className="text-white text-lg mb-4">Sorry, you have to login first.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-pink-700 hover:bg-pink-600 px-4 py-2 rounded-lg text-white"
            >
              Go to Login
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="ml-4 text-gray-400 hover:text-white text-sm underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
