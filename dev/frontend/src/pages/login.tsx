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

  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));
  const currentQuote = useMemo(() => quotes[quoteIndex], [quoteIndex]);
  const [avatarUrl, setAvatarUrl] = useState<string>(uiAvatar(currentQuote.author));

  const wikiCache = useRef<Map<string, string | null>>(new Map());
  const fetchAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    document.title = 'Moosic - Sign in';
    if (Cookies.get('token')) navigate('/');
  }, [navigate]);

  useEffect(() => {
    const author = currentQuote.author;
    setAvatarUrl(uiAvatar(author));

    if (wikiCache.current.has(author)) {
      const cached = wikiCache.current.get(author);
      if (cached) setAvatarUrl(cached);
      return;
    }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
    <section className="bg-bgPrimary text-textPrimary font-sans min-h-screen flex">
      <ToastContainer />
      {/* Left Side: Sign In */}
      <div className="flex flex-col justify-center flex-1 px-6 py-12 lg:px-20 xl:px-24">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center">
            <img className="w-auto h-20" src="/logo-colored.png" alt="Moosic Logo" />
          </div>
          <h1 className="mt-10 text-center text-3xl font-logo text-accent sm:text-4xl xl:text-5xl">Moosic</h1>
          <p className="mt-4 text-center text-textSecondary">
            Your mood, your data — always private, secure, and respected
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full py-4 px-4 bg-bgSecondary border border-gray-700 rounded-lg focus:border-accent focus:ring focus:ring-accent/20"
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full py-4 px-4 bg-bgSecondary border border-gray-700 rounded-lg focus:border-accent focus:ring focus:ring-accent/20"
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="w-5 h-5 mr-2 border-gray-600 rounded bg-bgSecondary" />
                Remember me
              </label>
              <a href="#" className="hover:underline text-textSecondary">Forgot Password?</a>
            </div>
            <button
              type="submit"
              className="w-full px-8 py-4 font-bold text-white bg-accent rounded-lg hover:opacity-90 transition"
            >
              Sign In
            </button>
          </form>

          <p className="mt-10 text-center text-textSecondary">
            Don’t have an account?
            <a href="/register" className="font-bold text-accent hover:underline ml-1">Sign up now</a>
          </p>
        </div>
      </div>

      {/* Right Side: Quote */}
      <div className="hidden lg:grid flex-1 place-items-center bg-bgSecondary">
        <div className="max-w-sm mx-auto text-textPrimary">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-bgPrimary rounded-xl mb-6">
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
              <p className="text-sm text-textSecondary">{currentQuote.role}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
