'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { LogOut, ShieldCheck, Database } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [centres, setCentres] = useState([]);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    async function loadData() {
      const currentUser = await db.getCurrentUserV2();
      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      const pData = await db.getAllPatientsV2();
      setPatients(pData);
      
      const cData = await db.getCentres();
      setCentres(cData);
      
      const mData = await db.getMedicines();
      setMedicines(mData);
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await db.logoutV2();
    router.push('/login');
  };

  if (!user) return <div className="p-8 text-center text-teal-600 font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-teal-600" /> Admin Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">System Overview & Management</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center">
            <Database className="h-8 w-8 text-teal-500 mb-2" />
            <h3 className="text-3xl font-black text-slate-800">{patients.length}</h3>
            <p className="text-sm text-slate-500">Registered Patients</p>
          </div>
          
          <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 border-b border-slate-100 pb-4 mb-4">Patient Database</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="pb-3 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Age/Gender</th>
                    <th className="pb-3 font-semibold">Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="py-3 font-medium text-slate-700">{p.id}</td>
                      <td className="py-3">{p.name}</td>
                      <td className="py-3">{p.age} / {p.gender}</td>
                      <td suppressHydrationWarning className="py-3 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Inventory Management Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 border-b border-slate-100 pb-4 mb-4">Inventory Management</h3>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target;
            const centreId = form.centre.value;
            const medicineId = form.medicine.value;
            const stockLevel = form.stock.value;
            if (centreId && medicineId && stockLevel) {
              await db.updateInventory(centreId, medicineId, parseInt(stockLevel));
              alert('Stock updated successfully!');
              form.reset();
            }
          }}>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Healthcare Centre</label>
              <select name="centre" required className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none focus:border-teal-500">
                <option value="">Select Centre...</option>
                {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Medicine</label>
              <select name="medicine" required className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none focus:border-teal-500">
                <option value="">Select Medicine...</option>
                {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Stock Level</label>
              <input type="number" name="stock" required min="0" className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none focus:border-teal-500" placeholder="e.g. 50" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg transition-colors">
                Update Stock
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
