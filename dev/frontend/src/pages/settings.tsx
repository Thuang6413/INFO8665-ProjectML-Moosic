import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DarkVeil from "../components/DarkVeil";
import "../index.css";

const Settings: React.FC = () => {
  const [form, setForm] = useState({
    username: "",
    client_id: "",
    client_secret: "",
  });

  const [authorizeEnabled, setAuthorizeEnabled] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  useEffect(() => {
    document.title = "Moosic - Settings";

    const token = Cookies.get("token");
    if (!token) return;

    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/v1/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { username, spotify_credential } = response.data;
        const clientId = spotify_credential?.client_id || "";
        const clientSecret = spotify_credential?.client_secret || "";

        setForm({
          username: username || "",
          client_id: clientId,
          client_secret: clientSecret,
        });

        const isComplete = clientId && clientSecret;
        setAuthorizeEnabled(isComplete);
        setSubmitDisabled(isComplete);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    const isValidClientId =
      updatedForm.client_id.length === 32 &&
      /^[a-f0-9]+$/.test(updatedForm.client_id);
    const isValidSecret = updatedForm.client_secret.length > 10;

    setAuthorizeEnabled(false);
    setSubmitDisabled(!(isValidClientId && isValidSecret));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("token");
    if (!token) return;

    const { client_id, client_secret } = form;

    if (!client_id || !client_secret) {
      toast.warn("Please fill in both Client ID and Client Secret.");
      return;
    }

    const isValidClientId =
      client_id.length === 32 && /^[a-f0-9]+$/.test(client_id);
    const isValidSecret = client_secret.length > 10;

    if (!isValidClientId) {
      toast.warn("Client ID must be 32-character lowercase hexadecimal.");
      return;
    }

    if (!isValidSecret) {
      toast.warn("Client Secret must be more than 10 characters.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/v1/user/spotify-credential",
        { client_id, client_secret },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Spotify credentials saved.");
      setAuthorizeEnabled(true);
      setSubmitDisabled(true);
    } catch (err) {
      console.error("Error saving credentials:", err);
      toast.error("Failed to save credentials.");
      setAuthorizeEnabled(false);
    }
  };

  const handleAuthorize = async () => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/spotify/authorize",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { auth_url } = response.data;
      if (auth_url) {
        window.open(auth_url, "_blank");
      }
    } catch (err) {
      console.error("Error getting Spotify authorization URL:", err);
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
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="glass-card w-full max-w-2xl p-8 rounded-2xl">
          {/* Back to Music */}
          <div className="mb-6">
            <Button
              href="/"
              variant="text"

              sx={{
                color: "#ff4081",
                fontWeight: "bold",
                fontSize: "0.9rem",
                textTransform: "none",
                "&:hover": { opacity: 0.7 }
              }}
            >
              GO BACK
            </Button>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-logo text-accent text-center mb-8">
            Settings & Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-gray-300 font-semibold mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                readOnly
                className="w-full px-4 py-3 bg-bgSecondary border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Client ID */}
            <div>
              <label className="block font-semibold mb-2 text-gray-300">Client ID</label>

              <input
                type="text"
                name="client_id"
                value={form.client_id}
                onChange={handleChange}
                placeholder="Enter your Spotify Client ID"
                className="w-full px-4 py-3 bg-bgSecondary border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
              />
              {form.client_id && form.client_id.length !== 32 && (
                <p className="text-sm text-red-400 mt-1">
                  Client ID must be 32 characters.
                </p>
              )}
            </div>

            {/* Client Secret */}
            <div>
              <label className="block text-gray-300 font-semibold mb-2">Client Secret</label>
              <input
                type="password"
                name="client_secret"
                value={form.client_secret}
                onChange={handleChange}
                placeholder="Enter your Spotify Client Secret"
                className="w-full py-3 px-4 bg-bgSecondary border border-gray-700 rounded-lg 
               text-white placeholder-gray-400 
               focus:border-accent focus:ring focus:ring-accent/20"
              />
              {form.client_secret && form.client_secret.length <= 10 && (
                <p className="text-sm text-red-400 mt-1">
                  Client Secret must be more than 10 characters.
                </p>
              )}
            </div>


            {/* Action Buttons */}
            <Stack
              spacing={2}
              direction="row"
              justifyContent="space-between"
              className="pt-4"
            >
              <Button
                type="submit"
                variant="text"
                disabled={submitDisabled}
                sx={{
                  color: submitDisabled ? "#666" : "#ff4081",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  "&:hover": { opacity: submitDisabled ? 1 : 0.7 },
                }}
              >
                Save Changes
              </Button>

              <Button
                type="button"
                onClick={handleAuthorize}
                disabled={!authorizeEnabled}
                sx={{
                  color: authorizeEnabled ? "#4caf50" : "#666",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  "&:hover": { opacity: authorizeEnabled ? 0.7 : 1 },
                }}
              >
                Authorize
              </Button>
            </Stack>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Powered by <span className="text-accent font-semibold">Moosic</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
