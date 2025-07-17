import React, { useEffect, useState } from 'react';

const Settings: React.FC = () => {
  useEffect(() => {
    document.title = 'Moosic Settings';
  }, []);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    spotifyKey: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updated user info:', form);
    // You can connect this to your backend here
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-pink-900 text-white font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-2xl p-6 rounded-2xl shadow-2xl bg-gray-950/80 border border-pink-700">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">Settings & Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-4 py-3 bg-gray-800 border border-pink-700 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-gray-800 border border-pink-700 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Spotify Key */}
          <div>
            <label className="block text-sm font-semibold mb-2">Spotify API Key</label>
            <input
              type="password"
              name="spotifyKey"
              value={form.spotifyKey}
              onChange={handleChange}
              placeholder="Paste your Spotify key here"
              className="w-full px-4 py-3 bg-gray-800 border border-pink-700 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <p className="text-xs text-gray-400 mt-2">We'll never share your key. It’s only stored locally or securely.</p>
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-pink-700 hover:bg-pink-600 rounded-xl font-semibold shadow-lg transition-transform hover:scale-105"
            >
              Save Changes
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
