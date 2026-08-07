'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Activity, 
  ShieldCheck, 
  User, 
  Heart, 
  AlertTriangle,
  Hospital
} from 'lucide-react';

export default function ReferralDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [referral, setReferral] = useState(null);
  const [triage, setTriage] = useState(null);
  const [patient, setPatient] = useState(null);
  const [targetHospital, setTargetHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.id) return;
      try {
        const refData = await db.getReferral(params.id);
        if (!refData) {
          setLoading(false);
          return;
        }
        setReferral(refData);

        const triageData = await db.getTriageRecord(refData.triage_id);
        setTriage(triageData);

        if (triageData) {
          const patientData = await db.getPatient(triageData.patient_id);
          setPatient(patientData);
        }

        const hospData = await db.getHospital(refData.target_hospital_id);
        setTargetHospital(hospData);
      } catch (err) {
        console.error('Failed to load referral details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center font-semibold text-slate-500 animate-pulse">
          {t('loading')}
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 p-6 rounded-2xl text-center shadow-sm space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Referral Record Not Found</h2>
          <p className="text-sm text-slate-500">The referral ticket ID does not exist or has been deleted.</p>
          <Link href="/dashboard" className="inline-flex bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-teal-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isEmergency = triage?.risk_level === 'EMERGENCY';

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 print:py-0 print:px-0">
      
      {/* Back Link and Action Buttons (Hidden during printing) */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>{t('dash_welcome')} Dashboard</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm cursor-pointer min-h-[38px]"
        >
          <Printer className="h-4 w-4" />
          <span>{t('ref_print')}</span>
        </button>
      </div>

      {/* Main Ticket Card (Designed as a medical referral passport) */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-md print:border-0 print:shadow-none">
        
        {/* Ticket Header Banner */}
        <div className={`p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
          isEmergency ? 'bg-red-600' : 'bg-teal-600'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-md">
              OFFICIAL MEDICAL REFERRAL PASSPORT
            </span>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-1.5">
              <Activity className="h-5 w-5 animate-pulse" />
              {t('nav_brand')} REFERRAL TICKET
            </h2>
          </div>
          <span className="bg-white text-slate-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {triage?.risk_level}
          </span>
        </div>

        {/* Triage Status Progress Tracker Bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-around text-xs font-bold text-slate-500">
          <div className="flex items-center gap-1.5 text-teal-600">
            <CheckCircle2 className="h-4.5 w-4.5 fill-teal-50 text-teal-600" />
            <span>1. Registered</span>
          </div>
          <div className={`flex items-center gap-1.5 ${
            referral.status !== 'PENDING' ? 'text-teal-600' : 'text-slate-400 animate-pulse'
          }`}>
            {referral.status !== 'PENDING' ? (
              <CheckCircle2 className="h-4.5 w-4.5 fill-teal-50 text-teal-600" />
            ) : (
              <Clock className="h-4.5 w-4.5 text-slate-400" />
            )}
            <span>2. Hospital Accepted</span>
          </div>
          <div className={`flex items-center gap-1.5 ${
            referral.status === 'COMPLETED' ? 'text-teal-600' : 'text-slate-400'
          }`}>
            {referral.status === 'COMPLETED' ? (
              <CheckCircle2 className="h-4.5 w-4.5 fill-teal-50 text-teal-600" />
            ) : (
              <Clock className="h-4.5 w-4.5 text-slate-300" />
            )}
            <span>3. Admitted</span>
          </div>
        </div>

        {/* Passport Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Top block: Patient profile & QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Patient profile details */}
            <div className="md:col-span-8 space-y-4">
              
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="h-5 w-5 text-teal-600 shrink-0" />
                <h3 className="font-bold text-slate-700 text-sm">Patient Identification</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block tracking-wider">Patient Name</span>
                  <span className="text-sm font-bold text-slate-800">{patient?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block tracking-wider">Age / Gender</span>
                  <span className="text-sm font-semibold text-slate-700">{patient?.age} Yrs / {patient?.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block tracking-wider">ABHA ID (Health ID)</span>
                  <span className="text-sm font-bold text-slate-800">{patient?.abha_id || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block tracking-wider">{t('ref_id')}</span>
                  <span className="font-mono text-slate-600 text-xs truncate max-w-[150px] block">{referral.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 pt-2">
                <Hospital className="h-5 w-5 text-teal-600 shrink-0" />
                <h3 className="font-bold text-slate-700 text-sm">Referral Pathway</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block tracking-wider">{t('ref_from')}</span>
                  <span className="text-slate-700 font-semibold">{referral.source_phc}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block tracking-wider">{t('ref_to')}</span>
                  <span className="text-slate-800 font-bold">{targetHospital?.name}</span>
                </div>
              </div>

            </div>

            {/* QR Code Container */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner text-center">
              <QRCodeSVG
                value={referral.qr_code_hash}
                size={130}
                bgColor="#ffffff"
                fgColor={isEmergency ? "#dc2626" : "#0d9488"}
                level="Q"
                includeMargin={false}
              />
              <p className="mt-2.5 font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                {referral.qr_code_hash}
              </p>
              <p className="text-[8px] text-slate-400 font-medium max-w-[150px] mt-1 leading-normal print:hidden">
                {t('ref_qr_info')}
              </p>
            </div>

          </div>

          {/* Vitals and Red Flags Checklists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            
            {/* Vitals Log */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="h-4.5 w-4.5 text-teal-600" />
                {t('ref_vitals_logged')}
              </h4>

              {triage && (
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs font-semibold text-slate-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Body Temperature</span>
                    <span className="text-slate-800 font-bold">{triage.vitals.temp}°F</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Oxygen Saturation SpO2</span>
                    <span className={`font-bold ${triage.vitals.spo2 < 90 ? 'text-red-600' : 'text-slate-800'}`}>{triage.vitals.spo2}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Blood Pressure (BP)</span>
                    <span className="text-slate-800 font-bold">{triage.vitals.bp_systolic}/{triage.vitals.bp_diastolic} mmHg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Heart Rate (Pulse)</span>
                    <span className="text-slate-800 font-bold">{triage.vitals.hr} bpm</span>
                  </div>
                </div>
              )}
            </div>

            {/* Red Flag Symptoms checklist */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-teal-600" />
                {t('ref_symptoms_logged')}
              </h4>

              {triage && (
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs font-semibold text-slate-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Fever</span>
                    <span>{triage.symptoms.fever ? `Yes (${triage.symptoms.fever_duration})` : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Severe Breathlessness</span>
                    <span className={triage.symptoms.breathlessness ? 'text-red-600 font-bold' : ''}>
                      {triage.symptoms.breathlessness ? 'Checked / Positive' : 'Negative'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chest Pain / Tightness</span>
                    <span className={triage.symptoms.chest_pain ? 'text-red-600 font-bold' : ''}>
                      {triage.symptoms.chest_pain ? 'Checked / Positive' : 'Negative'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Altered Consciousness</span>
                    <span className={triage.symptoms.altered_consciousness ? 'text-red-600 font-bold' : ''}>
                      {triage.symptoms.altered_consciousness ? 'Checked / Positive' : 'Negative'}
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Print Disclaimer Stamp */}
        <div className="bg-slate-50 border-t border-slate-150 p-4 text-center text-[10px] text-slate-400 font-semibold leading-normal">
          MEDNOVA Clinical Triage System operates under official WHO IMCI protocol parameters. Authenticated digitally via ASHA network database.
        </div>

      </div>
    </div>
  );
}
