import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';
import Button from '@mui/material/Button'; // ✅ MUI Button import

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

    // Force re-check of auth-dependent UI right away
    window.dispatchEvent(new Event("storage"));

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
        <div className="flex justify-center mb-10">
          <Link to="/">
            <img
              src="/logo-white.png"
              alt="Moosic Logo"
              className="h-20 w-20 cursor-pointer"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-4">
          <Button
            variant="text"
            onClick={handleSettingsClick}
            sx={{
              color: '#ff4081',
              fontWeight: 'bold',
              textTransform: 'none',
              justifyContent: 'flex-start',
              paddingLeft: '1rem',
              '&:hover': { opacity: 0.7 }
            }}
          >
            Settings
          </Button>
        </nav>
      </div>

      {/* Auth Button */}
      <div className="mt-auto">
        {isLoggedIn ? (
          <Button
            variant="text"
            onClick={handleLogout}
            sx={{
              color: '#ff4081',
              fontWeight: 'bold',
              textTransform: 'none',
              width: '100%',
              '&:hover': { opacity: 0.7 }
            }}
          >
            Sign Out
          </Button>
        ) : (
          <Button
            variant="text"
            onClick={() => navigate('/login')}
            sx={{
              color: '#ff4081',
              fontWeight: 'bold',
              textTransform: 'none',
              width: '100%',
              '&:hover': { opacity: 0.7 }
            }}
          >
            Login
          </Button>
        )}
      </div>

      {/* Login Required Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-950 border border-pink-800 p-6 rounded-2xl shadow-xl text-center max-w-sm">
            <p className="text-white text-lg mb-4">Sorry, you have to login first.</p>
            <Button
              variant="text"
              onClick={() => navigate('/login')}
              sx={{
                color: '#ff4081',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': { opacity: 0.7 }
              }}
            >
              Go to Login
            </Button>
            <Button
              variant="text"
              onClick={() => setShowPopup(false)}
              sx={{
                color: 'gray',
                fontSize: '0.875rem',
                textDecoration: 'underline',
                textTransform: 'none',
                marginLeft: '1rem',
                '&:hover': { color: 'white' }
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
