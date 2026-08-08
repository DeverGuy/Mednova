'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, User, Activity, Calendar, UserCheck } from 'lucide-react';

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [vitals, setVitals] = useState([]);

  useEffect(() => {
    async function loadData() {
      const currentUser = await db.getCurrentUserV2();
      if (!currentUser || currentUser.role !== 'patient') {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      const pData = await db.getPatientV2(currentUser.id);
      setPatientData(pData);

      const vData = await db.getPatientVitals(currentUser.id);
      setVitals(vData);
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await db.logoutV2();
    router.push('/login');
  };

  if (!user || !patientData) return <div className="p-8 text-center text-teal-600 font-bold">Loading Dashboard...</div>;

  const qrUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/patient/${user.id}`;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Patient Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back, {patientData.name}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* QR Code Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="font-bold text-slate-700">Your Mednova QR Code</h3>
            <div className="bg-white p-4 rounded-xl border-2 border-teal-100 shadow-sm inline-block">
              <QRCodeSVG value={qrUrl} size={180} level="H" fgColor="#0f766e" />
            </div>
            <p className="text-xs text-slate-500">
              Present this QR code to any Mednova Healthcare Worker to allow them to view your records and add new vitals.
            </p>
          </div>

          {/* Patient Details */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserCheck className="h-5 w-5 text-teal-600" /> Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
              <div><span className="text-slate-400 block text-xs uppercase tracking-wider">Patient ID</span><span className="font-semibold">{patientData.id}</span></div>
              <div><span className="text-slate-400 block text-xs uppercase tracking-wider">Name</span><span className="font-semibold">{patientData.name}</span></div>
              <div><span className="text-slate-400 block text-xs uppercase tracking-wider">Age / Gender</span><span className="font-semibold">{patientData.age} yrs / {patientData.gender}</span></div>
              <div><span className="text-slate-400 block text-xs uppercase tracking-wider">Date of Birth</span><span className="font-semibold">{patientData.dob || '-'}</span></div>
              <div><span className="text-slate-400 block text-xs uppercase tracking-wider">Height</span><span className="font-semibold">{patientData.height || '-'}</span></div>
              <div><span className="text-slate-400 block text-xs uppercase tracking-wider">Weight</span><span className="font-semibold">{patientData.weight || '-'}</span></div>
            </div>
            
            <div className="pt-2">
              <span className="text-slate-400 block text-xs uppercase tracking-wider mb-1">Reported Symptoms</span>
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm font-medium text-slate-700">{patientData.symptoms || 'None reported'}</p>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block text-xs uppercase tracking-wider mb-1">Detailed Description</span>
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm text-slate-600 italic">"{patientData.description || 'No description provided.'}"</p>
            </div>
          </div>
        </div>

        {/* Vitals History */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-teal-600" /> Vitals History
          </h3>
          {vitals.length === 0 ? (
            <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl text-center border border-slate-100">No vitals recorded yet. A doctor will add your vitals during your visit.</p>
          ) : (
            <div className="space-y-3">
              {vitals.map(v => (
                <div key={v.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-100 text-teal-700 p-2 rounded-lg"><Calendar className="h-5 w-5"/></div>
                    <div>
                      <p suppressHydrationWarning className="text-xs text-slate-500 font-semibold">{new Date(v.created_at).toLocaleString()}</p>
                      <p className="text-xs text-slate-400">Added by: {v.added_by_doctor_id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto">
                    <div className="text-center"><span className="block text-[10px] text-slate-500 uppercase font-bold">HR (bpm)</span><span className="font-bold text-slate-800">{v.heart_rate || '-'}</span></div>
                    <div className="text-center"><span className="block text-[10px] text-slate-500 uppercase font-bold">BP (mmHg)</span><span className="font-bold text-slate-800">{v.blood_pressure || '-'}</span></div>
                    <div className="text-center"><span className="block text-[10px] text-slate-500 uppercase font-bold">Temp (°F)</span><span className="font-bold text-slate-800">{v.temperature || '-'}</span></div>
                    <div className="text-center"><span className="block text-[10px] text-slate-500 uppercase font-bold">SpO2 (%)</span><span className="font-bold text-slate-800">{v.oxygen_saturation || '-'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
