import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Moosic Signup';
    const token = Cookies.get('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/v1/user/register', form, {
        headers: { 'Content-Type': 'application/json' },
      });

      const { token, message } = response.data;
      Cookies.set('token', token, { expires: 7 });

      toast.success(message || 'Registered successfully!', { autoClose: 2000 });
      setTimeout(() => navigate('/'), 2500); // delay to let toast show
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.response?.data?.error || 'Registration failed.', { autoClose: 3000 }
      );

      console.error(error);
    }
  };

  return (
    <section className="bg-white">
      <ToastContainer /> {/* ✅ Toast container */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* ... Left side content remains unchanged ... */}
        <div className="relative flex items-end px-4 pb-10 pt-60 sm:pb-16 md:justify-center lg:pb-24 bg-gray-50 sm:px-6 lg:px-8">
          <div className="absolute inset-0">
            <img className="object-cover w-full h-full" src="/signup.jpg" alt="Signup Background" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div className="relative w-full max-w-xl xl:pr-24 xl:mx-auto xl:max-w-xl">
            <h3 className="text-4xl font-bold text-white">
              Music Matches Mood.<br />
              Moosic plays what you feel
            </h3>
            <ul className="grid grid-cols-1 mt-10 sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                'Mood-based playlists',
                'Music for every feeling',
                'Save & share your vibe',
                '35k+ listeners & grows',
              ].map((item, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <div className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                    <svg className="w-3.5 h-3.5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-white">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ... Right side form ... */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8 sm:py-16 lg:py-24">
          <div className="xl:w-full xl:max-w-sm 2xl:max-w-md xl:mx-auto">
            <h2 className="text-3xl font-bold leading-tight text-black sm:text-3xl">
              Join Moosic<br />
              Where Feelings Sound
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-blue-600 transition hover:underline">
                Login
              </a>
            </p>

            <form className="mt-8" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="text-base font-medium text-gray-900">Username</label>
                  <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* <div>
                  <label className="text-base font-medium text-gray-900">Email address</label>
                  <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email to get started"
                      className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div> */}

                <div>
                  <label className="text-base font-medium text-gray-900">Password</label>
                  <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition border border-transparent rounded-md bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:opacity-80"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </form>

            <p className="mt-5 text-sm text-gray-600">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>{' '}
              &{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
