import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const CameraComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [usingFrontCamera] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: usingFrontCamera ? 'user' : 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => {
    cameraOn ? startCamera() : stopCamera();
    return () => stopCamera();
  }, [cameraOn]);

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video || !video.srcObject) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('image', blob, 'capture.png');

      try {
        const token = Cookies.get('token');
        const response = await fetch('http://127.0.0.1:5000/api/v1/emotion/face', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        console.log('Server response:', await response.json());
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }, 'image/png');
  };

  const handleToggleCamera = () => {
    if (!Cookies.get('token')) {
      setShowPopup(true);
      return;
    }
    setCameraOn(!cameraOn);
  };

  return (
    <div className="w-full max-w-md p-5 rounded-2xl bg-bgSecondary border border-accent/50 text-white font-sans">
      {/* Camera */}
      <div className="relative w-full h-80 bg-gray-800 rounded-xl overflow-hidden border border-accent/40">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-5">
        {/* Toggle */}
        <label className="relative inline-block w-14 h-7 cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={cameraOn}
            onChange={handleToggleCamera}
          />
          <div className="w-14 h-7 bg-gray-600 rounded-full peer-checked:bg-accent transition-colors" />
          <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7" />
        </label>

        {/* Capture Button */}
        <button
          onClick={handleCapture}
          className="bg-accent hover:bg-accent/90 rounded-full p-4 shadow-lg transition-transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h2l1-2h12l1 2h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
            <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center mt-5 text-textSecondary">
        Your image will be used to personalize your music experience.<br />We respect your privacy.
      </p>

      {/* Login Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-bgSecondary border border-accent/50 p-6 rounded-2xl text-center max-w-sm">
            <p className="text-lg mb-4">Please log in to use the camera.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-accent hover:bg-accent/90 px-4 py-2 rounded-lg text-white"
            >
              Go to Login
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="ml-4 text-textSecondary hover:text-white text-sm underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
