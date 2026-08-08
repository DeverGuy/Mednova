'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { LogOut, Users, Search, ScanLine, ArrowRight } from 'lucide-react';

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    async function loadData() {
      const currentUser = await db.getCurrentUserV2();
      if (!currentUser || currentUser.role !== 'doctor') {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      const pData = await db.getAllPatientsV2();
      setPatients(pData);
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await db.logoutV2();
    router.push('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      router.push(`/patient/${searchId.trim()}`);
    }
  };

  if (!user) return <div className="p-8 text-center text-teal-600 font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Healthcare Worker Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Logged in as {user.id}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Action Panel */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-teal-600" /> Patient Lookup
              </h3>
              <p className="text-xs text-slate-500">Scan a patient's QR code or manually enter their ID to view records and add vitals.</p>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input 
                  type="text" 
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  placeholder="Enter Patient ID (e.g. PAT-XXXX)"
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none"
                />
                <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
            
            <div className="bg-teal-50 p-6 rounded-2xl shadow-sm border border-teal-100">
              <h4 className="font-bold text-teal-800 mb-2">Instructions</h4>
              <ul className="text-xs text-teal-700 space-y-2 list-disc pl-4">
                <li>When a patient arrives, scan their QR code.</li>
                <li>Review their symptoms and description.</li>
                <li>Take their vitals and input them into the system.</li>
                <li>Both you and the patient can see the updated records instantly.</li>
              </ul>
            </div>
          </div>

          {/* Patients List */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <Users className="h-5 w-5 text-teal-600" /> Recent Patients Directory
            </h3>
            
            {patients.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No patients registered yet.</div>
            ) : (
              <div className="space-y-3">
                {patients.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500">ID: {p.id} • {p.age} yrs, {p.gender}</p>
                    </div>
                    <button 
                      onClick={() => router.push(`/patient/${p.id}`)}
                      className="flex items-center gap-1 bg-white border border-slate-300 hover:border-teal-500 hover:text-teal-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                      View <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
