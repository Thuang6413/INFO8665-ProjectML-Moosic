import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

const Settings: React.FC = () => {
  const [form, setForm] = useState({
    username: '',
    client_id: '',
    client_secret: '',
  });

  const [authorizeEnabled, setAuthorizeEnabled] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  useEffect(() => {
    document.title = 'Moosic - Settings';

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
        setSubmitDisabled(isComplete);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    const isValidClientId =
      updatedForm.client_id.length === 32 && /^[a-f0-9]+$/.test(updatedForm.client_id);
    const isValidSecret = updatedForm.client_secret.length > 10;

    setAuthorizeEnabled(false);
    setSubmitDisabled(!(isValidClientId && isValidSecret));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('token');
    if (!token) return;

    const { client_id, client_secret } = form;

    if (!client_id || !client_secret) {
      toast.warn('Please fill in both Client ID and Client Secret.');
      return;
    }

    const isValidClientId = client_id.length === 32 && /^[a-f0-9]+$/.test(client_id);
    const isValidSecret = client_secret.length > 10;

    if (!isValidClientId) {
      toast.warn('Client ID must be 32-character lowercase hexadecimal.');
      return;
    }

    if (!isValidSecret) {
      toast.warn('Client Secret must be more than 10 characters.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/v1/user/spotify-credential',
        {
          client_id,
          client_secret,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Spotify credentials saved.');
      setAuthorizeEnabled(true);
      setSubmitDisabled(true);
    } catch (err) {
      console.error('Error saving credentials:', err);
      toast.error('Failed to save credentials.');
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
    <section className="min-h-screen bg-bgPrimary text-textPrimary font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-2xl p-6 rounded-2xl shadow-2xl bg-bgSecondary border border-accent">

        {/* Back to Music Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-accent hover:opacity-80 transition-colors font-medium text-sm"
          >
            <span className="text-xl mr-2">←</span> Back to Music
          </Link>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl sm:text-4xl font-logo text-accent text-center mb-8">
          Settings & Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              readOnly
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 cursor-not-allowed"
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
              className={`w-full px-4 py-3 bg-gray-800 border rounded-xl placeholder-gray-500 text-textPrimary ${form.client_id && form.client_id.length !== 32
                  ? 'border-red-500'
                  : 'border-accent'
                }`}
              placeholder="Enter your Spotify Client ID"
            />
            {form.client_id && form.client_id.length !== 32 && (
              <p className="text-sm text-red-400 mt-1">Client ID must be 32 characters.</p>
            )}
          </div>

          {/* Client Secret */}
          <div>
            <label className="block text-sm font-semibold mb-2">Client Secret</label>
            <input
              type="password"
              name="client_secret"
              value={form.client_secret}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-xl placeholder-gray-500 text-textPrimary ${form.client_secret && form.client_secret.length <= 10
                  ? 'border-red-500'
                  : 'border-accent'
                }`}
              placeholder="Enter your Spotify Client Secret"
            />
            {form.client_secret && form.client_secret.length <= 10 && (
              <p className="text-sm text-red-400 mt-1">
                Client Secret must be more than 10 characters.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="submit"
              disabled={submitDisabled}
              className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-transform ${submitDisabled
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-accent hover:scale-105'
                }`}
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={handleAuthorize}
              disabled={!authorizeEnabled}
              className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-transform ${authorizeEnabled
                  ? 'bg-green-600 hover:scale-105'
                  : 'bg-gray-700 cursor-not-allowed'
                }`}
            >
              Authorize
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-textSecondary mt-6">
          Powered by <span className="text-accent font-semibold">Moosic</span>
        </p>

        <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar />
      </div>
    </section>
  );
};

export default Settings;
