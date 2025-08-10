import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Flip } from "react-toastify";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DarkVeil from "../components/DarkVeil";
import "../index.css";
import "react-toastify/dist/ReactToastify.css";

const Register: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Moosic - Sign up";
    if (Cookies.get("token")) navigate("/");
  }, [navigate]);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl">
          <div className="flex justify-center mb-6">
            <img
              className="w-auto h-20"
              src="/logo-colored.png"
              alt="Moosic Logo"
            />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-accent logo-font">
            Join Moosic
          </h1>
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
                  "&:hover": { opacity: 0.7 },
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
                "&:hover": { opacity: 0.7 },
              }}
            >
              Sign In
            </Button>
          </p>

          <p className="mt-5 text-sm text-gray-400 text-center">
            By creating an account, you consent to the use of your image for
            real-time emotion detection to enhance your personalized music
            recommendations. Your image is processed securely and is not stored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
