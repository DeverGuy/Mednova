'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { UserCheck, Activity, Calendar, ArrowLeft, PlusCircle } from 'lucide-react';

export default function PatientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [vitals, setVitals] = useState([]);
  
  // Vitals form
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [newVitals, setNewVitals] = useState({
    heart_rate: '',
    blood_pressure: '',
    temperature: '',
    oxygen_saturation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const user = await db.getCurrentUserV2();
      if (!user) {
        // Must be logged in to view patient details
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      const pData = await db.getPatientV2(id);
      if (pData) {
        setPatientData(pData);
        const vData = await db.getPatientVitals(id);
        setVitals(vData);
      }
    }
    if (id) loadData();
  }, [id, router]);

  const handleAddVitals = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const added = await db.addPatientVitals({
        patient_id: id,
        heart_rate: parseInt(newVitals.heart_rate),
        blood_pressure: newVitals.blood_pressure,
        temperature: parseFloat(newVitals.temperature),
        oxygen_saturation: parseInt(newVitals.oxygen_saturation),
        added_by_doctor_id: currentUser.id
      });
      setVitals([added, ...vitals]);
      setShowVitalsForm(false);
      setNewVitals({ heart_rate: '', blood_pressure: '', temperature: '', oxygen_saturation: '' });
    } catch (err) {
      console.error(err);
      alert('Error adding vitals');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return <div className="p-8 text-center text-teal-600 font-bold">Checking credentials...</div>;
  
  if (!patientData) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Patient Not Found</h2>
        <p className="text-slate-500">The QR code or ID does not match any patient in the system.</p>
        <button onClick={() => router.back()} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold">Go Back</button>
      </div>
    </div>
  );

  const isDoctor = currentUser.role === 'doctor';

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`/dashboard/${currentUser.role}`)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Patient Records</h1>
              <p className="text-slate-500 text-sm mt-1">{patientData.name} ({id})</p>
            </div>
          </div>
          
          {isDoctor && (
            <button 
              onClick={() => setShowVitalsForm(!showVitalsForm)}
              className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full sm:w-auto"
            >
              <PlusCircle className="h-4 w-4" /> Add New Vitals
            </button>
          )}
        </div>

        {/* Vitals Input Form (Visible only to doctors when toggled) */}
        {isDoctor && showVitalsForm && (
          <div className="bg-teal-50 p-6 rounded-2xl shadow-sm border border-teal-200 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-teal-800 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" /> Record Vital Signs
            </h3>
            <form onSubmit={handleAddVitals} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-teal-900 uppercase">Heart Rate (bpm)</label>
                  <input type="number" required value={newVitals.heart_rate} onChange={e => setNewVitals({...newVitals, heart_rate: e.target.value})} className="mt-1 w-full border border-teal-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white" placeholder="e.g. 78" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-teal-900 uppercase">BP (mmHg)</label>
                  <input type="text" required value={newVitals.blood_pressure} onChange={e => setNewVitals({...newVitals, blood_pressure: e.target.value})} className="mt-1 w-full border border-teal-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white" placeholder="e.g. 120/80" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-teal-900 uppercase">Temp (°F)</label>
                  <input type="number" step="0.1" required value={newVitals.temperature} onChange={e => setNewVitals({...newVitals, temperature: e.target.value})} className="mt-1 w-full border border-teal-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white" placeholder="e.g. 98.6" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-teal-900 uppercase">SpO2 (%)</label>
                  <input type="number" required value={newVitals.oxygen_saturation} onChange={e => setNewVitals({...newVitals, oxygen_saturation: e.target.value})} className="mt-1 w-full border border-teal-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white" placeholder="e.g. 98" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowVitalsForm(false)} className="px-4 py-2 text-sm font-semibold text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg">Save Record</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Details */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserCheck className="h-5 w-5 text-teal-600" /> Patient Profile
            </h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Patient ID</span><span className="font-semibold text-slate-800">{patientData.id}</span></div>
              <div><span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Full Name</span><span className="font-semibold text-slate-800">{patientData.name}</span></div>
              <div><span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Age / Gender</span><span className="font-semibold text-slate-800">{patientData.age} yrs / {patientData.gender}</span></div>
              <div><span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Date of Birth</span><span className="font-semibold text-slate-800">{patientData.dob || '-'}</span></div>
              <div className="flex gap-4">
                <div><span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Height</span><span className="font-semibold text-slate-800">{patientData.height || '-'}</span></div>
                <div><span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Weight</span><span className="font-semibold text-slate-800">{patientData.weight || '-'}</span></div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Reported Symptoms</span>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm font-medium text-slate-700">{patientData.symptoms || 'None reported'}</p>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Detailed Description</span>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 italic">"{patientData.description || 'No description provided.'}"</p>
            </div>
          </div>

          {/* Vitals History */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-teal-600" /> Vitals History
            </h3>
            {vitals.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <Activity className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500 font-medium">No vitals recorded yet.</p>
                {isDoctor && <p className="text-xs text-slate-400 mt-1">Use the "Add New Vitals" button above to record the first entry.</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {vitals.map(v => (
                  <div key={v.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white border border-slate-200 text-slate-600 p-2 rounded-lg shadow-sm"><Calendar className="h-5 w-5"/></div>
                      <div>
                        <p className="text-xs text-slate-700 font-bold">{new Date(v.created_at).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Added by: {v.added_by_doctor_id}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                      <div className="text-center px-2"><span className="block text-[9px] text-slate-400 uppercase font-bold">HR (bpm)</span><span className="font-black text-slate-700">{v.heart_rate || '-'}</span></div>
                      <div className="text-center px-2 border-l border-slate-100"><span className="block text-[9px] text-slate-400 uppercase font-bold">BP (mmHg)</span><span className="font-black text-slate-700">{v.blood_pressure || '-'}</span></div>
                      <div className="text-center px-2 border-l border-slate-100"><span className="block text-[9px] text-slate-400 uppercase font-bold">Temp (°F)</span><span className="font-black text-slate-700">{v.temperature || '-'}</span></div>
                      <div className="text-center px-2 border-l border-slate-100"><span className="block text-[9px] text-slate-400 uppercase font-bold">SpO2 (%)</span><span className="font-black text-slate-700">{v.oxygen_saturation || '-'}</span></div>
                    </div>
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
