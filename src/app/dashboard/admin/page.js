'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { LogOut, ShieldCheck, Database, Building2, Stethoscope, CheckCircle2, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  const [pendingUsers, setPendingUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const loadData = async () => {
    const currentUser = await db.getCurrentUserV2();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    const pending = await db.getPendingApprovals();
    setPendingUsers(pending);
    
    const dData = await db.getAllDoctorsV2();
    setDoctors(dData);

    const oData = await db.getAllOrganizationsV2();
    setOrganizations(oData);
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await db.logoutV2();
    router.push('/login');
  };

  const handleApprove = async (id) => {
    await db.approveUserV2(id);
    await loadData(); // Reload to refresh tables
  };

  if (!user) return <div className="p-8 text-center text-teal-600 font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center">
            <Clock className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="text-3xl font-black text-slate-800">{pendingUsers.length}</h3>
            <p className="text-sm text-slate-500">Pending Approvals</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center">
            <Stethoscope className="h-8 w-8 text-teal-500 mb-2" />
            <h3 className="text-3xl font-black text-slate-800">{doctors.length}</h3>
            <p className="text-sm text-slate-500">Registered Doctors</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center">
            <Building2 className="h-8 w-8 text-indigo-500 mb-2" />
            <h3 className="text-3xl font-black text-slate-800">{organizations.length}</h3>
            <p className="text-sm text-slate-500">Registered Hospitals</p>
          </div>
        </div>

        {/* Pending Approvals Section */}
        {pendingUsers.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200">
            <h3 className="font-bold text-amber-800 border-b border-amber-100 pb-4 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" /> Pending Registrations
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="pb-3 font-semibold">User ID</th>
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map(u => (
                    <tr key={u.id} className="border-b border-slate-50">
                      <td className="py-3 font-medium text-slate-700">{u.id}</td>
                      <td className="py-3">{u.name}</td>
                      <td className="py-3 capitalize">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'doctor' ? 'bg-teal-50 text-teal-700' : 'bg-indigo-50 text-indigo-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => handleApprove(u.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organizations */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" /> Organizations Directory
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="pb-3 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map(o => (
                    <tr key={o.id} className="border-b border-slate-50">
                      <td className="py-3 font-medium text-slate-700">{o.id}</td>
                      <td className="py-3">{o.name}</td>
                      <td className="py-3 text-slate-500">{o.phone}</td>
                    </tr>
                  ))}
                  {organizations.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-slate-400">No organizations registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctors */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-teal-600" /> Doctors Directory
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="pb-3 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Organization</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(d => (
                    <tr key={d.id} className="border-b border-slate-50">
                      <td className="py-3 font-medium text-slate-700">{d.id}</td>
                      <td className="py-3">{d.name}</td>
                      <td className="py-3 text-slate-500">{d.organization_id || 'Independent'}</td>
                    </tr>
                  ))}
                  {doctors.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-slate-400">No doctors registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
