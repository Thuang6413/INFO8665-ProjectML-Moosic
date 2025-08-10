import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Quote = {
  text: string;
  author: string;
  role: string;
};

const quotes: Quote[] = [
  { text: "Music expresses that which cannot be said and on which it is impossible to be silent.", author: "Victor Hugo", role: "Poet & Novelist" },
  { text: "One good thing about music, when it hits you, you feel no pain.", author: "Bob Marley", role: "Musician" },
  { text: "Without music, life would be a mistake.", author: "Friedrich Nietzsche", role: "Philosopher" },
  { text: "Music is the strongest form of magic.", author: "Marilyn Manson", role: "Artist" },
  { text: "Where words leave off, music begins.", author: "Heinrich Heine", role: "Poet" },
  { text: "Music can change the world because it can change people.", author: "Bono", role: "U2 Vocalist" },
];

// Fallback initials avatar (no API key needed)
function uiAvatar(name: string) {
  const n = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${n}&background=random&size=128`;
}

// Get a Wikipedia thumbnail for a person (page summary API)
async function wikipediaThumb(name: string, signal?: AbortSignal): Promise<string | null> {
  const title = encodeURIComponent(name.replace(/\s+/g, '_'));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.thumbnail?.source || null;
  } catch {
    return null;
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  // form
  const [form, setForm] = useState({ username: '', password: '', email: '' });

  // quote index — start from a random one, then rotate on every keystroke
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));
  const currentQuote = useMemo(() => quotes[quoteIndex], [quoteIndex]);

  // avatar url for current author
  const [avatarUrl, setAvatarUrl] = useState<string>(uiAvatar(currentQuote.author));

  // cache wikipedia thumbs so we don’t re-fetch per keystroke for the same author
  const wikiCache = useRef<Map<string, string | null>>(new Map());
  // keep track of ongoing fetch to avoid race conditions when typing fast
  const fetchAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    document.title = 'Moosic - Sign in';
    const token = Cookies.get('token');
    if (token) navigate('/');
  }, [navigate]);

  // Whenever the quote/author changes (incl. each keystroke), load avatar:
  useEffect(() => {
    const author = currentQuote.author;

    // default immediately to initials avatar (fast paint)
    setAvatarUrl(uiAvatar(author));

    // if we have cache, use it
    if (wikiCache.current.has(author)) {
      const cached = wikiCache.current.get(author);
      if (cached) setAvatarUrl(cached);
      return;
    }

    // fetch fresh thumbnail
    fetchAbort.current?.abort();
    const controller = new AbortController();
    fetchAbort.current = controller;

    (async () => {
      const thumb = await wikipediaThumb(author, controller.signal);
      wikiCache.current.set(author, thumb);
      if (thumb) setAvatarUrl(thumb);
    })();

    return () => controller.abort();
  }, [currentQuote]);

  // SINGLE onChange handler: updates form and rotates quote exactly once per keystroke
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // update form state
    setForm((prev) => ({ ...prev, [name]: value }));

    // rotate quote once per key event (mod length to cycle)
    setQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/v1/user/login', form, {
        headers: { 'Content-Type': 'application/json' },
      });

      const { token, message } = response.data;
      Cookies.set('token', token, { expires: 7 });

      toast.success(message || 'Login successful!');
      setTimeout(() => navigate('/'), 2500);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.response?.data?.error || 'Login failed.');
      console.error(error);
    }
  };

  return (
    <section>
      <ToastContainer />
      <div className="min-h-full lg:flex lg:justify-between">
        {/* Left Side: Sign In */}
        <div className="flex flex-col justify-center flex-1 px-4 py-12 bg-white sm:px-6 lg:px-20 xl:px-24">
          <div className="flex-1 max-w-sm mx-auto lg:max-w-md">
            <div className="flex justify-center">
              <img className="w-auto h-20 mx-auto lg:mx-0" src="/logo-colored.png" alt="Moosic Logo" />
            </div>
            <h1 className="mt-10 text-center text-3xl font-bold text-gray-900 sm:text-4xl xl:text-5xl">Moosic</h1>
            <p className="mt-4 text-center text-gray-700">
              Your mood, your data — always private, secure, and respected
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-4">
              {/* Username */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="block w-full py-4 pl-12 pr-4 text-base text-gray-900 placeholder-gray-600 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:bg-white focus:border-gray-900"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="block w-full py-4 pl-12 pr-4 text-base text-gray-900 placeholder-gray-600 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:bg-white focus:border-gray-900"
                />
              </div>

              <div className="flex items-center justify-between mt-5">
                <label className="flex items-center text-gray-900">
                  <input type="checkbox" className="w-5 h-5 mr-2 border-gray-300 rounded" />
                  Remember me
                </label>
                <a href="#" className="text-base text-gray-500 hover:underline">Forgot Password?</a>
              </div>

              {/* Sign In Button */}
              <div className="relative mt-8">
                <div className="absolute -inset-2">
                  <div className="w-full h-full mx-auto opacity-30 blur-lg filter"
                    style={{ background: 'linear-gradient(90deg, #44ff9a -0.55%, #44b0ff 22.86%, #8b44ff 48.36%, #ff6644 73.33%, #ebff70 99.34%)' }}></div>
                </div>
                <button
                  type="submit"
                  className="relative flex items-center justify-center w-full px-8 py-4 text-base font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-600"
                >
                  Sign In
                </button>
              </div>
            </form>

            <p className="mt-10 text-base text-center text-gray-900">
              Don’t have an account?
              <a href="/register" className="font-bold hover:underline ml-1">Sign up now</a>
            </p>
          </div>
        </div>

        {/* Right Side: Quote */}
        <div className="relative grid flex-1 w-full px-4 py-12 bg-gray-900 lg:max-w-2xl place-items-center">
          <div className="relative max-w-sm mx-auto text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-xl mb-6">
              <svg className="w-auto h-5" viewBox="0 0 33 23" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M32.0011 4.7203L30.9745 0C23.5828 0.33861 18.459 3.41404 18.459 12.4583V22.8687H31.3725V9.78438H26.4818C26.4819 6.88236 28.3027 5.17551 32.0011 4.7203Z" />
                <path d="M13.5421 4.7203L12.5155 0C5.12386 0.33861 0 3.41413 0 12.4584V22.8687H12.914V9.78438H8.02029C8.02029 6.88236 9.84111 5.17551 13.5421 4.7203Z" />
              </svg>
            </div>

            <blockquote className="text-2xl lg:text-3xl italic">“{currentQuote.text}”</blockquote>
            <div className="flex items-center mt-8">
              <img
                className="w-14 h-14 rounded-full object-cover"
                src={avatarUrl}
                alt={currentQuote.author}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = uiAvatar(currentQuote.author);
                }}
              />
              <div className="ml-4">
                <p className="text-xl font-bold">{currentQuote.author}</p>
                <p className="text-sm text-gray-400">{currentQuote.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
