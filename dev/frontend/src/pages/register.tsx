import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Flip } from "react-toastify";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DarkVeil from "../components/DarkVeil";
import "../index.css";
import "react-toastify/dist/ReactToastify.css";

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

// Avatar fallback
function uiAvatar(name: string) {
  const n = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${n}&background=random&size=128`;
}

// Wikipedia thumbnail fetch
async function wikipediaThumb(name: string, signal?: AbortSignal): Promise<string | null> {
  const title = encodeURIComponent(name.replace(/\s+/g, "_"));
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

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));
  const currentQuote = useMemo(() => quotes[quoteIndex], [quoteIndex]);
  const [avatarUrl, setAvatarUrl] = useState<string>(uiAvatar(currentQuote.author));

  const wikiCache = useRef<Map<string, string | null>>(new Map());
  const fetchAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    document.title = "Moosic - Sign up";
    if (Cookies.get("token")) navigate("/");
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
      const response = await axios.post(
        "http://127.0.0.1:5000/api/v1/user/register",
        form,
        { headers: { "Content-Type": "application/json" } }
      );

      const { token, message } = response.data;
      Cookies.set("token", token, { expires: 7 });

      toast.success(message || "Registered successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Registration failed."
      );
    }
  };

  return (
    <div className="relative min-h-screen font-sans overflow-hidden">
      <DarkVeil
        hueShift={325}
        noiseIntensity={0.01}
        scanlineIntensity={0.0}
        warpAmount={0.0}
        resolutionScale={1.2}
      />
      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable={false}
        transition={Flip}
        toastClassName="glass-toast"
      />

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Quotes */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8">
          <div className="glass-card max-w-sm w-full p-6 rounded-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 backdrop-blur-md rounded-xl mb-6 shadow-lg">
              <svg className="w-auto h-5" viewBox="0 0 33 23" fill="#ffffff">
                <path d="M32.0011 4.7203L30.9745 0C23.5828 0.33861 18.459 3.41404 18.459 12.4583V22.8687H31.3725V9.78438H26.4818C26.4819 6.88236 28.3027 5.17551 32.0011 4.7203Z" />
                <path d="M13.5421 4.7203L12.5155 0C5.12386 0.33861 0 3.41413 0 12.4584V22.8687H12.914V9.78438H8.02029C8.02029 6.88236 9.84111 5.17551 13.5421 4.7203Z" />
              </svg>
            </div>
            <blockquote className="text-xl italic text-gray-200">“{currentQuote.text}”</blockquote>
            <div className="flex items-center justify-center mt-6">
              <img
                className="w-14 h-14 rounded-full object-cover"
                src={avatarUrl}
                alt={currentQuote.author}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = uiAvatar(currentQuote.author);
                }}
              />
              <div className="ml-4 text-left">
                <p className="text-lg font-bold text-white">{currentQuote.author}</p>
                <p className="text-sm text-gray-400">{currentQuote.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign Up Form */}
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="glass-card max-w-md w-full p-8 rounded-2xl">
            <div className="flex justify-center mb-6">
              <img className="w-auto h-20" src="/logo-colored.png" alt="Moosic Logo" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2 text-accent logo-font">Join Moosic</h1>
            <p className="text-center text-gray-300 mb-6">
              Where feelings sound — Sign up to get started.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full py-3 px-4 bg-bgSecondary border border-gray-700 rounded-lg focus:border-accent focus:ring focus:ring-accent/20 text-white placeholder-gray-400"
              />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full py-3 px-4 bg-bgSecondary border border-gray-700 rounded-lg focus:border-accent focus:ring focus:ring-accent/20 text-white placeholder-gray-400"
              />

              <Stack spacing={2} direction="row" justifyContent="center">
                <Button
                  type="submit"
                  variant="text"
                  sx={{
                    color: "#ff4081",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    "&:hover": { opacity: 0.7 }
                  }}
                >
                  Sign Up
                </Button>
              </Stack>
            </form>

            <p className="mt-8 text-textSecondary text-center">
              Already have an account?
              <Button
                href="/login"
                variant="text"
                sx={{
                  color: "#ff4081",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  "&:hover": { opacity: 0.7 }
                }}
              >
                Sign In
              </Button>
            </p>

            <p className="mt-5 text-sm text-gray-400 text-center">
              By creating an account, you consent to the use of your image for real-time emotion
              detection to enhance your personalized music recommendations. Your image is processed
              securely and is not stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
