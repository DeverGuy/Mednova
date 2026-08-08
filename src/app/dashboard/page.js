'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { 
  Users, 
  AlertOctagon, 
  Share2, 
  PlusCircle, 
  Search, 
  Eye, 
  ArrowRightLeft,
  CheckCircle,
  Clock,
  QrCode,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);

  // Stats
  const [stats, setStats] = useState({ patients: 0, emergencies: 0, referrals: 0 });

  // Data lists
  const [patients, setPatients] = useState([]);
  const [triages, setTriages] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Simulator states
  const [simQrHash, setSimQrHash] = useState('');
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const loadData = async () => {
    try {
      const user = await db.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      const patientList = await db.getPatients();
      const triageList = await db.getTriageRecords();
      const referralList = await db.getReferrals();
      const hospitalList = await db.getHospitals();

      setPatients(patientList);
      setTriages(triageList);
      setReferrals(referralList);
      setHospitals(hospitalList);

      // Compute statistics
      const emergencyCount = triageList.filter(t => t.risk_level === 'EMERGENCY').length;
      setStats({
        patients: patientList.length,
        emergencies: emergencyCount,
        referrals: referralList.length
      });

      // Default the simulator hash to the first pending referral if exists
      const pendingRef = referralList.find(r => r.status === 'PENDING');
      if (pendingRef && !simQrHash) {
        setSimQrHash(pendingRef.qr_code_hash);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  // Handle Simulation QR Code scanning/acceptance
  const handleSimulateScan = async (e) => {
    e.preventDefault();
    if (!simQrHash) return;
    setSimLoading(true);
    setSimResult(null);

    setTimeout(async () => {
      try {
        const referral = referrals.find(r => r.qr_code_hash.toLowerCase() === simQrHash.toLowerCase().trim());
        if (!referral) {
          alert('Invalid QR Code hash / Referral not found.');
          setSimLoading(false);
          return;
        }

        // Update referral status in DB
        const updatedRef = await db.updateReferralStatus(referral.id, 'ACCEPTED');
        
        // Find patient & triage details
        const triage = triages.find(t => t.id === referral.triage_id);
        const patient = patients.find(p => p.id === triage?.patient_id);
        const hospital = hospitals.find(h => h.id === referral.target_hospital_id);

        // Pre-allocate ICU bed if available at hospital
        if (hospital && hospital.icu_beds_available > 0) {
          await db.updateHospitalBeds(hospital.id, hospital.icu_beds_available - 1);
        }

        setSimResult({
          patientName: patient?.name || 'Unknown Patient',
          age: patient?.age || 'N/A',
          gender: patient?.gender || 'N/A',
          riskLevel: triage?.risk_level || 'UNKNOWN',
          sourcePhc: referral.source_phc,
          hospitalName: hospital?.name || 'District Hospital',
          bedsRemaining: hospital ? Math.max(0, hospital.icu_beds_available - 1) : 0,
          status: 'ACCEPTED'
        });

        // Refresh stats
        loadData();
      } catch (err) {
        console.error('Simulation error:', err);
      } finally {
        setSimLoading(false);
      }
    }, 1500);
  };

  // Filter patients based on Search input
  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase();
    const nameMatch = patient.name.toLowerCase().includes(query);
    const abhaMatch = patient.abha_id ? patient.abha_id.toLowerCase().includes(query) : false;
    return nameMatch || abhaMatch;
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>{t('dash_title')}</span>
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            {t('dash_welcome')} <span className="text-teal-600 font-bold">{currentUser?.full_name}</span>
          </p>
        </div>
        <Link
          href="/assessment"
          className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-5 rounded-xl shadow-md transition-all transform active:scale-95 cursor-pointer min-h-[48px]"
        >
          <PlusCircle className="h-5 w-5" />
          <span>{t('dash_btn_new_triage')}</span>
        </Link>
      </div>

      {/* Statistics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Patients Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover-scale">
          <div className="h-12 w-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('dash_stats_patients')}</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stats.patients}</h3>
          </div>
        </div>

        {/* Emergencies Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover-scale">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${
            stats.emergencies > 0 
              ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' 
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('dash_stats_emergencies')}</span>
            <h3 className={`text-2xl font-bold mt-0.5 ${stats.emergencies > 0 ? 'text-red-600' : 'text-slate-800'}`}>{stats.emergencies}</h3>
          </div>
        </div>

        {/* Total Referrals Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover-scale">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <Share2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('dash_stats_referrals')}</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stats.referrals}</h3>
          </div>
        </div>

      </div>

      {/* Patient Database & Triage History */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
        
        {/* Search header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            {t('dash_patient_list')}
          </h2>
          
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('dash_patient_search_placeholder')}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm font-medium text-slate-800 focus:bg-white"
            />
          </div>
        </div>

        {/* Table responsive element */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500 tracking-wider">
                <th className="px-6 py-4">{t('dash_table_name')}</th>
                <th className="px-6 py-4">{t('dash_table_age')}</th>
                <th className="px-6 py-4">{t('dash_table_abha')}</th>
                <th className="px-6 py-4">{t('dash_table_risk')}</th>
                <th className="px-6 py-4">{t('dash_table_date')}</th>
                <th className="px-6 py-4 text-center">{t('dash_table_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  // Find related triage record and referral
                  const triage = triages.find(t => t.patient_id === patient.id);
                  const referral = referrals.find(r => r.triage_id === triage?.id);

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{patient.name}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {patient.age} Yrs / {patient.gender}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-500">
                        {patient.abha_id || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        {triage ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            triage.risk_level === 'EMERGENCY'
                              ? 'bg-red-100 text-red-800'
                              : triage.risk_level === 'MODERATE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              triage.risk_level === 'EMERGENCY'
                                ? 'bg-red-500'
                                : triage.risk_level === 'MODERATE'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`} />
                            {triage.risk_level === 'EMERGENCY' ? t('risk_emergency') : triage.risk_level === 'MODERATE' ? t('risk_moderate') : t('risk_low')}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td suppressHydrationWarning className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(patient.created_at).toLocaleDateString(language === 'kn' ? 'kn-IN' : 'en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {referral ? (
                          <Link
                            href={`/referral/${referral.id}`}
                            className="inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold py-1.5 px-3 rounded-lg border border-teal-200 transition-colors text-xs cursor-pointer min-h-[36px]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {t('dash_btn_view_pass')}
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Routine / No Ref</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400 font-medium">
                    {t('dash_no_patients')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hospital Receiving Portal Scan Simulator Widget */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
          <QrCode className="h-5 w-5 text-teal-600" />
          {t('scan_portal_title')}
        </h2>
        <p className="text-xs text-slate-500 font-semibold max-w-3xl leading-relaxed">
          {t('scan_portal_desc')}
        </p>

        <form onSubmit={handleSimulateScan} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          {/* Dropdown with active referrals */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Pending Referral Hash for Demo
            </label>
            <select
              value={simQrHash}
              onChange={(e) => setSimQrHash(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-700 focus:bg-white cursor-pointer"
            >
              <option value="">-- Choose active pending referral --</option>
              {referrals.map((ref) => {
                const triage = triages.find(t => t.id === ref.triage_id);
                const patient = patients.find(p => p.id === triage?.patient_id);
                return (
                  <option key={ref.id} value={ref.qr_code_hash}>
                    {patient?.name} ({triage?.risk_level}) - {ref.qr_code_hash}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {t('scan_portal_placeholder')}
            </label>
            <input
              type="text"
              value={simQrHash}
              onChange={(e) => setSimQrHash(e.target.value)}
              placeholder="e.g. MEDNOVA-REF-HASH"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-700 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={simLoading || !simQrHash}
            className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs cursor-pointer min-h-[44px]"
          >
            <ArrowRightLeft className="h-4 w-4 text-teal-400" />
            {simLoading ? t('loading') : t('scan_portal_btn')}
          </button>
        </form>

        {/* Simulation Output Card */}
        {simResult && (
          <div className="mt-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
            <div className="space-y-1.5 text-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h4 className="font-bold text-emerald-800 text-sm">{t('scan_portal_success')}</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 pt-2 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Patient Name</span>
                  <span className="text-slate-700">{simResult.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Triage Level</span>
                  <span className="text-red-700 font-bold">{simResult.riskLevel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Referred To</span>
                  <span className="text-slate-700">{simResult.hospitalName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">ICU Beds Remaining</span>
                  <span className="text-emerald-700 font-bold">{simResult.bedsRemaining} Available</span>
                </div>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
              ADMISSION APPROVED
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
