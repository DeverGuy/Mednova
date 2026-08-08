'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { User, UserPlus, Stethoscope, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // 'patient' | 'doctor' | 'admin'
  const [role, setRole] = useState('patient');
  
  // 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Form states
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredId, setRegisteredId] = useState(null);
  const [registrationPending, setRegistrationPending] = useState(false);

  // Registration states (Patient specific + generic)
  const [regData, setRegData] = useState({
    password: '',
    name: '',
    age: '',
    gender: 'Male',
    dob: '',
    height: '',
    weight: '',
    symptoms: '',
    description: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginId || !password) {
      setErrorMsg('Please enter both ID and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    
    try {
      const user = await db.loginV2(loginId, password, role);
      if (user) {
        router.push(`/dashboard/${role}`);
      } else {
        setErrorMsg('Invalid ID, password, or role.');
      }
    } catch (err) {
      setErrorMsg('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      if (role === 'doctor') {
        // Simulate sending for manual verification
        setRegistrationPending(true);
      } else {
        const newUser = await db.registerV2(regData, role);
        setRegisteredId(newUser.id);
      }
    } catch (err) {
      setErrorMsg('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl shadow-sm">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-800">
            Mednova Portal
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => { setRole('patient'); setMode('login'); setRegisteredId(null); setRegistrationPending(false); }}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${role === 'patient' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <User className="h-4 w-4" /> Patient
          </button>
          <button
            onClick={() => { setRole('doctor'); setMode('login'); setRegisteredId(null); setRegistrationPending(false); }}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${role === 'doctor' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Stethoscope className="h-4 w-4" /> Doctor
          </button>
          <button
            onClick={() => { setRole('admin'); setMode('login'); setRegisteredId(null); setRegistrationPending(false); }}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${role === 'admin' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldCheck className="h-4 w-4" /> Admin
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-50 text-red-800 text-sm p-3 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            {errorMsg}
          </div>
        )}

        {registrationPending ? (
          <div className="text-center space-y-4 py-6">
            <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200">
              <p className="font-bold text-lg mb-2">Application Under Review</p>
              <p className="text-sm">
                Your medical credentials have been submitted securely.
              </p>
              <p className="text-sm mt-2">
                Our verification team will review your MBBS certificate and call you shortly to complete the onboarding process.
              </p>
            </div>
            <button
              onClick={() => {
                setMode('login');
                setRegistrationPending(false);
              }}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Return to Login
            </button>
          </div>
        ) : registeredId ? (
          <div className="text-center space-y-4 py-6">
            <div className="bg-teal-50 text-teal-800 p-4 rounded-xl border border-teal-200">
              <p className="font-bold text-lg mb-2">Registration Successful!</p>
              <p className="text-sm mb-1">Your unique Login ID is:</p>
              <p className="text-3xl font-black text-teal-600 tracking-wider">{registeredId}</p>
              <p className="text-xs mt-3 text-teal-700">Please save this ID safely, you will need it to log in.</p>
            </div>
            <button
              onClick={() => {
                setLoginId(registeredId);
                setMode('login');
                setRegisteredId(null);
              }}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Proceed to Login
            </button>
          </div>
        ) : mode === 'login' ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Your Unique ID</label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:bg-white"
                  placeholder={role === 'patient' ? 'PAT-XXXX' : role === 'doctor' ? 'DOC-XXXX' : 'ADM-XXXX'}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-all"
            >
              {loading ? 'Logging in...' : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-sm text-teal-600 hover:text-teal-800 font-semibold flex items-center justify-center gap-1 mx-auto"
              >
                <UserPlus className="h-4 w-4" /> Need an account? Register
              </button>
            </div>
            
            <div className="text-center mt-4">
              <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full">
                Mock Login: Use PAT-1 (Patient), DOC-1 (Doctor), ADMIN-1 (Admin) with password "password"
              </span>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleRegister}>
            {role === 'patient' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Full Name</label>
                    <input required type="text" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Age</label>
                    <input required type="number" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={regData.age} onChange={e => setRegData({...regData, age: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Gender</label>
                    <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={regData.gender} onChange={e => setRegData({...regData, gender: e.target.value})}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Date of Birth</label>
                    <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={regData.dob} onChange={e => setRegData({...regData, dob: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Height (e.g. 170cm)</label>
                    <input type="text" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={regData.height} onChange={e => setRegData({...regData, height: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Weight (e.g. 70kg)</label>
                    <input type="text" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={regData.weight} onChange={e => setRegData({...regData, weight: e.target.value})} />
                  </div>
                </div>
              </>
            ) : role === 'doctor' ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Registering as Healthcare Worker (Doctor). Verification is required.</p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Full Name (as per ID)</label>
                  <input required type="text" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Phone Number</label>
                  <input required type="tel" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="+91" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Upload MBBS / Medical Certificate (PDF/JPG)</label>
                  <input required type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-600 mb-4">Registering as Administrator.</p>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Set Password</label>
              <input required type="password" placeholder="Min 6 characters" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl">
              {loading ? 'Processing...' : 'Complete Registration'}
            </button>

            <button type="button" onClick={() => setMode('login')} className="w-full mt-2 text-sm text-slate-500 hover:text-slate-700 py-2">
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
