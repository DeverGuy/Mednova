'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { Camera, UserCheck, KeyRound, AlertCircle, Scan, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [authMode, setAuthMode] = useState('credentials'); // 'credentials' | 'biometric'
  
  // Credentials login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Biometric login states
  const [cameraStream, setCameraStream] = useState(null);
  const [biometricState, setBiometricState] = useState('idle'); // 'idle' | 'initializing' | 'scanning' | 'success' | 'failed'
  const [biometricError, setBiometricError] = useState('');
  const videoRef = useRef(null);

  // Stop camera stream when component unmounts or mode changes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [authMode]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startCamera = async () => {
    setBiometricState('initializing');
    setBiometricError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setBiometricState('scanning');
      
      // Simulate face detection scanning phase
      setTimeout(async () => {
        // Automatically succeed for the demo/authentication
        setBiometricState('success');
        setTimeout(async () => {
          // Log in default ASHA worker profile
          await db.login('Sharda', '1234');
          stopCamera();
          router.push('/dashboard');
        }, 1500);
      }, 3000);

    } catch (err) {
      console.error('Camera initialization failed:', err);
      setBiometricState('failed');
      setBiometricError('Camera access denied or unavailable. Please use credentials or simulated scanner.');
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const profile = await db.login(username, password);
      if (profile) {
        router.push('/dashboard');
      } else {
        setErrorMsg('Invalid credentials.');
      }
    } catch (err) {
      setErrorMsg('Authentication error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const simulateBiometricSuccess = async () => {
    setBiometricState('scanning');
    setTimeout(async () => {
      setBiometricState('success');
      setTimeout(async () => {
        await db.login('Sharda', '1234');
        router.push('/dashboard');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      
      {/* Decorative medical pulses in background */}
      <div className="absolute top-10 left-10 text-teal-100 opacity-20 pointer-events-none">
        <svg width="400" height="150" viewBox="0 0 400 150">
          <path d="M 0,75 L 100,75 L 115,30 L 130,120 L 145,60 L 155,90 L 165,75 L 400,75" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
      </div>

      <div className="w-full max-w-lg space-y-6 z-10">
        
        {/* Portal Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600 mb-2 border border-teal-200 shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            {t('login_title')}
          </h1>
          <p className="mt-2 text-sm text-slate-600 font-medium">
            {t('login_sub')}
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          
          {/* Tabs header */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => { setAuthMode('credentials'); stopCamera(); }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
                authMode === 'credentials'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <KeyRound className="h-4 w-4" />
                {t('login_credentials_btn')}
              </span>
            </button>
            <button
              onClick={() => { setAuthMode('biometric'); startCamera(); }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
                authMode === 'biometric'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Camera className="h-4 w-4" />
                {t('login_biometric_btn')}
              </span>
            </button>
          </div>

          {/* Error notifications */}
          {errorMsg && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 text-red-800 text-xs font-semibold p-3 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Credentials Mode */}
          {authMode === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('login_username')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Sharda Gowda"
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('login_password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all transform active:scale-95 cursor-pointer min-h-[48px]"
              >
                {loading ? t('loading') : (
                  <>
                    <UserCheck className="h-5 w-5" />
                    {t('login_btn_sign_in')}
                  </>
                )}
              </button>

              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full">
                  {t('login_mock_credentials')}
                </span>
              </div>
            </form>
          )}

          {/* Biometric/Camera Scanner Mode */}
          {authMode === 'biometric' && (
            <div className="space-y-4">
              
              {/* Webcam preview container */}
              <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-200 flex items-center justify-center">
                
                {cameraStream ? (
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <Scan className="h-12 w-12 mx-auto mb-2 text-slate-500 stroke-[1.5]" />
                    <p className="text-xs font-medium text-slate-400">Camera Feed Offline</p>
                  </div>
                )}

                {/* Oval Face Guide HUD overlay */}
                {biometricState !== 'idle' && biometricState !== 'failed' && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    {/* The Green Guide Oval */}
                    <div className={`w-[170px] h-[220px] rounded-[50%] border-2 border-dashed transition-colors duration-500 ${
                      biometricState === 'success' ? 'border-emerald-500 bg-emerald-500/10' : 'border-teal-400'
                    }`} />
                    
                    {/* Running Scan animation line */}
                    {biometricState === 'scanning' && (
                      <div className="absolute left-0 right-0 h-0.5 bg-teal-400/80 shadow-[0_0_12px_#2dd4bf] animate-[bounce_2.5s_infinite]" />
                    )}
                  </div>
                )}
              </div>

              {/* Status message */}
              <div className="text-center py-2">
                {biometricState === 'initializing' && (
                  <p className="text-xs font-semibold text-amber-600 animate-pulse">Initializing webcam...</p>
                )}
                {biometricState === 'scanning' && (
                  <p className="text-xs font-bold text-teal-600 animate-pulse flex items-center justify-center gap-1.5">
                    <Scan className="h-4 w-4 text-teal-500 animate-spin" />
                    {t('login_face_scanning')}
                  </p>
                )}
                {biometricState === 'success' && (
                  <p className="text-xs font-bold text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-full inline-block border border-emerald-100">
                    {t('login_face_success')}
                  </p>
                )}
                {biometricState === 'failed' && (
                  <div className="text-center space-y-2">
                    <p className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                      {biometricError || t('login_face_failed')}
                    </p>
                    <button
                      onClick={startCamera}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 underline cursor-pointer"
                    >
                      Retry Camera Hookup
                    </button>
                  </div>
                )}
                {biometricState === 'idle' && (
                  <p className="text-xs text-slate-500">{t('login_face_guide')}</p>
                )}
              </div>

              {/* Simulation tools for testing environments */}
              <div className="pt-3 border-t border-slate-100 text-center flex flex-col gap-2">
                <button
                  type="button"
                  onClick={simulateBiometricSuccess}
                  disabled={biometricState === 'success' || biometricState === 'scanning'}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer min-h-[40px]"
                >
                  <Sparkles className="h-4 w-4 text-teal-400" />
                  Simulate Face Biometric Matching
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
