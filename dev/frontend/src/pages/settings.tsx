import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const Settings: React.FC = () => {
  const [form, setForm] = useState({
    username: '',
    client_id: '',
    client_secret: '',
  });

  const [authorizeEnabled, setAuthorizeEnabled] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  useEffect(() => {
    document.title = 'Moosic Settings';

    const token = Cookies.get('token');
    if (!token) return;

    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { username, spotify_credential } = response.data;

        const clientId = spotify_credential?.client_id || '';
        const clientSecret = spotify_credential?.client_secret || '';

        setForm({
          username: username || '',
          client_id: clientId,
          client_secret: clientSecret,
        });

        const isComplete = clientId && clientSecret;
        setAuthorizeEnabled(isComplete);
        setSubmitDisabled(isComplete); // disable submit if data already complete
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setAuthorizeEnabled(false);
    setSubmitDisabled(false); // re-enable submit on change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('token');
    if (!token) return;

    try {
      await axios.post(
        'http://localhost:5000/api/v1/user/spotify-credential',
        {
          client_id: form.client_id,
          client_secret: form.client_secret,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Spotify credentials saved.');
      setAuthorizeEnabled(true);
      setSubmitDisabled(true); // disable after successful save
    } catch (err) {
      console.error('Error saving credentials:', err);
      setAuthorizeEnabled(false);
    }
  };

  const handleAuthorize = async () => {
    const token = Cookies.get('token');
    if (!token) return;

    try {
      const response = await axios.get('http://localhost:5000/api/v1/spotify/authorize', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { auth_url } = response.data;
      if (auth_url) {
        window.open(auth_url, '_blank');
      }
    } catch (err) {
      console.error('Error getting Spotify authorization URL:', err);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-pink-900 text-white font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-2xl p-6 rounded-2xl shadow-2xl bg-gray-950/80 border border-pink-700">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">Settings & Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              readOnly
              className="w-full px-4 py-3 bg-gray-800 border border-pink-700 rounded-xl text-gray-400"
            />
          </div>

          {/* Client ID */}
          <div>
            <label className="block text-sm font-semibold mb-2">Client ID</label>
            <input
              type="text"
              name="client_id"
              value={form.client_id}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-pink-700 rounded-xl placeholder-gray-400"
              placeholder="Client ID"
            />
          </div>

          {/* Client Secret */}
          <div>
            <label className="block text-sm font-semibold mb-2">Client Secret</label>
            <input
              type="password"
              name="client_secret"
              value={form.client_secret}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-pink-700 rounded-xl placeholder-gray-400"
              placeholder="Client Secret"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="submit"
              disabled={submitDisabled}
              className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-transform ${
                submitDisabled
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-pink-700 hover:bg-pink-600 hover:scale-105'
              }`}
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={handleAuthorize}
              disabled={!authorizeEnabled}
              className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-transform ${
                authorizeEnabled
                  ? 'bg-green-600 hover:bg-green-500 hover:scale-105'
                  : 'bg-gray-700 cursor-not-allowed'
              }`}
            >
              Authorize
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Powered by <span className="text-pink-400 font-semibold">Moosic</span>
        </p>
      </div>
    </section>
  );
};

export default Settings;
