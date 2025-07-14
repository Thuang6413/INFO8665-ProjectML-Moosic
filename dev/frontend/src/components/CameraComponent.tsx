import React, { useEffect, useRef, useState } from 'react';

const CameraComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [usingFrontCamera] = useState(true); // You can toggle this later if needed

  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: { facingMode: usingFrontCamera ? 'user' : 'environment' }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (cameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
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
      const response = await fetch('http://127.0.0.1:5000/api/v1/emotion/face', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Server response:', result);
    } catch (err) {
      console.error('Error uploading binary image:', err);
    }
  }, 'image/png');
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-pink-900 flex items-center justify-center text-white font-sans">
      <div className="w-full max-w-md p-4 rounded-2xl shadow-2xl bg-gray-950/70 border border-pink-900 relative">

        {/* Logo */}
        <div className="flex justify-center mb-0">
          <img src="/logo-white.png" alt="Logo" className="h-20 w-20" />
        </div>
        <h1 className="text-white text-center font-bold mb-1">Moosic</h1>

        {/* Camera */}
        <div className="relative w-full h-80 bg-gray-800 rounded-xl overflow-hidden border border-pink-600 shadow-inner group">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-6">
          {/* Toggle */}
          <label className="relative inline-block w-14 h-7 cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={cameraOn}
              onChange={() => setCameraOn(!cameraOn)}
            />
            <div className="w-14 h-7 bg-gray-600 rounded-full peer-checked:bg-pink-600 transition-colors duration-300" />
            <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-7" />
          </label>

          {/* Capture Button */}
          <div className="group relative">
            <button
              onClick={handleCapture}
              className="bg-pink-700 hover:bg-pink-600 rounded-full p-4 shadow-lg transition-transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h2l1-2h12l1 2h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z"
                />
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </button>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition duration-300 bg-pink-800 text-xs px-3 py-1 rounded-full shadow-md whitespace-nowrap">
              Tap to capture your vibe
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center mt-6 text-gray-400">
          Your image will be used to personalize your music experience,<br />We respect your privacy.
        </p>
      </div>
    </div>
  );
};

export default CameraComponent;
