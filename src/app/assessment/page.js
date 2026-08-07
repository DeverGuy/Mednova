'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { 
  Activity, 
  User, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  ThumbsUp, 
  Hospital 
} from 'lucide-react';

export default function AssessmentPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Form Fields
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [abhaId, setAbhaId] = useState('');

  // Vitals
  const [temp, setTemp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [hr, setHr] = useState('');

  // Symptoms
  const [fever, setFever] = useState(false);
  const [feverDays, setFeverDays] = useState('0');
  const [breathless, setBreathless] = useState(false);
  const [chestPain, setChestPain] = useState(false);
  const [consciousness, setConsciousness] = useState(false);
  const [convulsions, setConvulsions] = useState(false);

  // Referral Destination
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [sourcePhc, setSourcePhc] = useState('Kanakapura Rural PHC');

  // Loading and alerts
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Check auth status
      const user = await db.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      // Load hospitals for referrals selection
      const hospData = await db.getHospitals();
      setHospitals(hospData);
      if (hospData.length > 0) {
        setSelectedHospitalId(hospData[0].id);
      }
    };
    init();
  }, [router]);

  // Deterministic Guardrails Check (Computed Vitals/Symptom state)
  const isEmergencyVitals = () => {
    const o2 = parseInt(spo2);
    const bp = parseInt(bpSys);
    const pulse = parseInt(hr);
    if (!isNaN(o2) && o2 < 90) return true;
    if (!isNaN(bp) && bp < 90) return true;
    if (!isNaN(pulse) && (pulse > 120 || pulse < 50)) return true;
    return false;
  };

  const isEmergencySymptoms = () => {
    return breathless || chestPain || consciousness || convulsions;
  };

  const isEmergency = () => {
    return isEmergencyVitals() || isEmergencySymptoms();
  };

  const isModerate = () => {
    if (isEmergency()) return false;
    const o2 = parseInt(spo2);
    const temperature = parseFloat(temp);
    const fDays = parseInt(feverDays);

    if (!isNaN(o2) && o2 >= 90 && o2 <= 94) return true;
    if (!isNaN(temperature) && temperature > 101) return true;
    if (fever && !isNaN(fDays) && fDays > 5) return true;
    return false;
  };

  const getRiskLevel = () => {
    if (isEmergency()) return 'EMERGENCY';
    if (isModerate()) return 'MODERATE';
    return 'LOW';
  };

  const handleNextStep = () => {
    // Basic validation
    if (step === 1) {
      if (!patientName || !patientAge) {
        alert('Please fill out patient name and age.');
        return;
      }
    }
    if (step === 2) {
      if (!temp || !spo2 || !bpSys || !hr) {
        alert('Please fill out vital signs (Temp, SpO2, Systolic BP, Heart Rate).');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBackStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create Patient
      const patient = await db.createPatient({
        name: patientName,
        age: parseInt(patientAge),
        gender: patientGender,
        abha_id: abhaId || null,
        created_by_asha_id: currentUser?.id
      });

      // 2. Create Triage Record
      const risk = getRiskLevel();
      const triage = await db.createTriageRecord({
        patient_id: patient.id,
        symptoms: {
          fever,
          fever_duration: fever ? `${feverDays} days` : 'N/A',
          breathlessness: breathless,
          chest_pain: chestPain,
          altered_consciousness: consciousness,
          convulsions: convulsions
        },
        risk_level: risk,
        vitals: {
          temp: parseFloat(temp),
          spo2: parseInt(spo2),
          bp_systolic: parseInt(bpSys),
          bp_diastolic: parseInt(bpDia || 80),
          hr: parseInt(hr)
        },
        language_used: language
      });

      // 3. Create Referral (If Moderate or Emergency)
      if (risk !== 'LOW') {
        const qrHash = `MEDNOVA-REF-${patient.name.toUpperCase().replace(/\s+/g, '-')}-${risk}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const referral = await db.createReferral({
          triage_id: triage.id,
          source_phc: sourcePhc,
          target_hospital_id: selectedHospitalId,
          qr_code_hash: qrHash,
          status: 'PENDING'
        });
        
        router.push(`/referral/${referral.id}`);
      } else {
        alert(t('assess_success_msg'));
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Error saving record. Please review inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-bold text-slate-800">{t('assess_title')}</h1>
      </div>

      {/* Progress HUD Indicator */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row justify-between gap-4">
        {[1, 2, 3, 4].map((stepIdx) => {
          let stepLabel = '';
          if (stepIdx === 1) stepLabel = t('assess_step_1');
          if (stepIdx === 2) stepLabel = t('assess_step_2');
          if (stepIdx === 3) stepLabel = t('assess_step_3');
          if (stepIdx === 4) stepLabel = t('assess_step_4');

          return (
            <div key={stepIdx} className="flex items-center gap-2.5">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                step === stepIdx
                  ? 'bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-100'
                  : step > stepIdx
                  ? 'bg-teal-50 border-teal-200 text-teal-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                {stepIdx}
              </span>
              <span className={`text-xs sm:text-sm font-bold ${
                step === stepIdx ? 'text-teal-700' : step > stepIdx ? 'text-slate-700' : 'text-slate-400'
              }`}>
                {stepLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Triage wizard form cards */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Step 1: Patient Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="h-5 w-5 text-teal-600" />
              {t('assess_step_1')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('assess_name')} *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Gowda"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('assess_age')} *
                </label>
                <input
                  type="number"
                  required
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('assess_gender')} *
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white cursor-pointer"
                >
                  <option value="Male">{t('assess_gender_male')}</option>
                  <option value="Female">{t('assess_gender_female')}</option>
                  <option value="Other">{t('assess_gender_other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('assess_abha')}
                </label>
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="e.g. 91-8273-1928-34"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vitals Input */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Heart className="h-5 w-5 text-teal-600" />
              {t('assess_vitals_title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('assess_vitals_temp')} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  placeholder="e.g. 98.6"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('assess_vitals_spo2')} *
                </label>
                <input
                  type="number"
                  required
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  placeholder="e.g. 98"
                  className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white ${
                    spo2 && parseInt(spo2) < 90 ? 'border-red-300 text-red-800 bg-red-50/50' : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('assess_vitals_hr')} *
                </label>
                <input
                  type="number"
                  required
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  placeholder="e.g. 72"
                  className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white ${
                    hr && (parseInt(hr) > 120 || parseInt(hr) < 50) ? 'border-red-300 text-red-800 bg-red-50/50' : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('assess_vitals_bp_sys')} (e.g. 120) *
                </label>
                <input
                  type="number"
                  required
                  value={bpSys}
                  onChange={(e) => setBpSys(e.target.value)}
                  placeholder="Systolic BP"
                  className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white ${
                    bpSys && parseInt(bpSys) < 90 ? 'border-red-300 text-red-800 bg-red-50/50' : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('assess_vitals_bp_dia')} (e.g. 80)
                </label>
                <input
                  type="number"
                  value={bpDia}
                  onChange={(e) => setBpDia(e.target.value)}
                  placeholder="Diastolic BP"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white"
                />
              </div>
            </div>

            {/* Micro warning indicator under step */}
            {isEmergencyVitals() && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <div>
                  <p className="uppercase tracking-wider">{t('assess_emergency_trigger_title')}</p>
                  <p className="font-semibold mt-0.5">{t('assess_emergency_vitals_alert')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Symptoms Checklist */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
              <AlertTriangle className="h-5 w-5 text-teal-600" />
              {t('assess_symptom_title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Checkboxes layout */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={fever}
                    onChange={(e) => setFever(e.target.checked)}
                    className="h-5 w-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700">{t('assess_symptom_fever')}</span>
                </label>

                {fever && (
                  <div className="pl-8 animate-fadeIn">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t('assess_symptom_fever_days')}
                    </label>
                    <input
                      type="number"
                      value={feverDays}
                      onChange={(e) => setFeverDays(e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full max-w-[200px] bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-800 focus:bg-white"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={breathless}
                    onChange={(e) => setBreathless(e.target.checked)}
                    className="h-5 w-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700">{t('assess_symptom_breathless')}</span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={chestPain}
                    onChange={(e) => setChestPain(e.target.checked)}
                    className="h-5 w-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700">{t('assess_symptom_chest_pain')}</span>
                </label>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consciousness}
                    onChange={(e) => setConsciousness(e.target.checked)}
                    className="h-5 w-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700">{t('assess_symptom_consciousness')}</span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={convulsions}
                    onChange={(e) => setConvulsions(e.target.checked)}
                    className="h-5 w-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700">{t('assess_symptom_convulsions')}</span>
                </label>
              </div>
            </div>

            {/* Dynamic Emergency warning */}
            {isEmergencySymptoms() && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <div>
                  <p className="uppercase tracking-wider">{t('assess_emergency_trigger_title')}</p>
                  <p className="font-semibold mt-0.5">{t('assess_emergency_symptoms_alert')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Triage Classification Summary */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-700 border-b border-slate-100 pb-2">
              {t('assess_step_4')}
            </h2>

            {/* Big Risk Indicator */}
            <div className={`p-6 rounded-2xl border text-center transition-all ${
              getRiskLevel() === 'EMERGENCY'
                ? 'bg-red-50 border-red-200 text-red-800'
                : getRiskLevel() === 'MODERATE'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-2 ${
                getRiskLevel() === 'EMERGENCY'
                  ? 'bg-red-100 text-red-800'
                  : getRiskLevel() === 'MODERATE'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {getRiskLevel() === 'EMERGENCY' ? t('risk_emergency') : getRiskLevel() === 'MODERATE' ? t('risk_moderate') : t('risk_low')}
              </span>
              <h3 className="text-xl font-bold mt-1">
                {getRiskLevel() === 'EMERGENCY'
                  ? t('assess_strat_emergency')
                  : getRiskLevel() === 'MODERATE'
                  ? t('assess_strat_mod')
                  : t('assess_strat_low')}
              </h3>
            </div>

            {/* Vitals Summary Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-center md:text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500">{t('assess_vitals_temp')}</span>
                <p className="text-base font-bold text-slate-800">{temp}°F</p>
              </div>
              <div className="text-center md:text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500">{t('assess_vitals_spo2')}</span>
                <p className={`text-base font-bold ${parseInt(spo2) < 90 ? 'text-red-600' : 'text-slate-800'}`}>{spo2}%</p>
              </div>
              <div className="text-center md:text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500">{t('assess_vitals_bp_sys')}</span>
                <p className={`text-base font-bold ${parseInt(bpSys) < 90 ? 'text-red-600' : 'text-slate-800'}`}>{bpSys}/{bpDia || 80} mmHg</p>
              </div>
              <div className="text-center md:text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500">Heart Rate</span>
                <p className="text-base font-bold text-slate-800">{hr} bpm</p>
              </div>
            </div>

            {/* Show Referral Details input if Referral is triggered (MODERATE or EMERGENCY) */}
            {getRiskLevel() !== 'LOW' && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Hospital className="h-4.5 w-4.5 text-teal-600" />
                  {t('assess_select_hosp')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t('assess_source_phc')}
                    </label>
                    <input
                      type="text"
                      value={sourcePhc}
                      onChange={(e) => setSourcePhc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Referral Destination
                    </label>
                    <select
                      value={selectedHospitalId}
                      onChange={(e) => setSelectedHospitalId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white cursor-pointer"
                    >
                      {hospitals.map((hosp) => (
                        <option key={hosp.id} value={hosp.id}>
                          {hosp.name} (ICU Beds: {hosp.icu_beds_available})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button Navigation Row */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200">
          {step > 1 ? (
            <button
              onClick={handleBackStep}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer min-h-[44px]"
            >
              <ChevronLeft className="h-5 w-5" />
              {t('btn_back')}
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all cursor-pointer min-h-[44px]"
            >
              {t('btn_next')}
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all transform active:scale-95 cursor-pointer min-h-[48px]"
            >
              {isSubmitting ? t('loading') : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  {t('btn_submit')}
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
