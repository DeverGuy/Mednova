import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Detect if Supabase is properly configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url');

let supabase = null;
if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Rich Mock Data for Local Storage Fallback
const MOCK_HOSPITALS = [
  {
    id: 'a8be65cf-e2c7-45bc-8dfb-10d65b77e8a1',
    name: 'Shimoga District Hospital (Mc Gann Hospital)',
    location: { lat: 13.9328, lng: 75.5684, district: 'Shivamogga', taluk: 'Shimoga' },
    icu_beds_available: 12,
    ct_scan_status: true,
    specialist_on_duty: ['Cardiologist', 'Pediatrician', 'General Surgeon']
  },
  {
    id: 'b5ce75cf-e2c7-45bc-8dfb-20d65b77e8a2',
    name: 'Hassan Institute of Medical Sciences (HIMS)',
    location: { lat: 13.0076, lng: 76.1026, district: 'Hassan', taluk: 'Hassan' },
    icu_beds_available: 0,
    ct_scan_status: true,
    specialist_on_duty: ['Pediatrician', 'Gynecologist', 'Orthopedic Surgeon']
  },
  {
    id: 'c2de85cf-e2c7-45bc-8dfb-30d65b77e8a3',
    name: 'Chigateri General Hospital (Davanagere)',
    location: { lat: 14.4644, lng: 75.9218, district: 'Davanagere', taluk: 'Davanagere' },
    icu_beds_available: 8,
    ct_scan_status: false,
    specialist_on_duty: ['Cardiologist', 'Anesthesiologist', 'Gynecologist']
  },
  {
    id: 'd9ee95cf-e2c7-45bc-8dfb-40d65b77e8a4',
    name: 'Chamarajanagar District Government Hospital',
    location: { lat: 11.9262, lng: 76.9405, district: 'Chamarajanagar', taluk: 'Chamarajanagar' },
    icu_beds_available: 4,
    ct_scan_status: true,
    specialist_on_duty: ['Pediatrician', 'General Physician']
  },
  {
    id: 'e6fe05cf-e2c7-45bc-8dfb-50d65b77e8a5',
    name: 'Kanakapura Taluk Hospital (Ramanagara)',
    location: { lat: 12.5484, lng: 77.4208, district: 'Ramanagara', taluk: 'Kanakapura' },
    icu_beds_available: 2,
    ct_scan_status: false,
    specialist_on_duty: ['General Physician', 'Gynecologist']
  }
];

const MOCK_PROFILES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    full_name: 'Sharda Gowda (ASHA)',
    role: 'asha_worker',
    preferred_language: 'kn',
    created_at: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    full_name: 'Dr. Girish Kumar',
    role: 'doctor',
    preferred_language: 'en',
    created_at: new Date().toISOString()
  }
];

const MOCK_PATIENTS = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    name: 'Ramesh Gowda',
    age: 45,
    gender: 'Male',
    abha_id: '91-8273-1928-34',
    created_by_asha_id: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    name: 'Sunita Naik',
    age: 28,
    gender: 'Female',
    abha_id: '42-1298-3482-19',
    created_by_asha_id: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    name: 'Anand Kumar',
    age: 62,
    gender: 'Male',
    abha_id: '12-9843-2284-95',
    created_by_asha_id: '11111111-1111-1111-1111-111111111111',
    created_at: new Date().toISOString()
  }
];

const MOCK_TRIAGE = [
  {
    id: 't1111111-1111-1111-1111-111111111111',
    patient_id: 'p1111111-1111-1111-1111-111111111111',
    symptoms: { fever: true, cough: true, breathlessness: false, chest_pain: false, fever_duration: '3 days' },
    risk_level: 'LOW',
    vitals: { temp: 99.2, spo2: 98, bp_systolic: 120, bp_diastolic: 80, hr: 78 },
    language_used: 'kn',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 't2222222-2222-2222-2222-222222222222',
    patient_id: 'p2222222-2222-2222-2222-222222222222',
    symptoms: { fever: true, cough: false, breathlessness: true, chest_pain: false, fever_duration: '5 days' },
    risk_level: 'MODERATE',
    vitals: { temp: 101.5, spo2: 93, bp_systolic: 110, bp_diastolic: 72, hr: 95 },
    language_used: 'en',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 't3333333-3333-3333-3333-333333333333',
    patient_id: 'p3333333-3333-3333-3333-333333333333',
    symptoms: { fever: true, cough: true, breathlessness: true, chest_pain: true, fever_duration: '1 day' },
    risk_level: 'EMERGENCY',
    vitals: { temp: 102.1, spo2: 88, bp_systolic: 85, bp_diastolic: 55, hr: 115 },
    language_used: 'kn',
    created_at: new Date().toISOString()
  }
];

const MOCK_REFERRALS = [
  {
    id: 'r1111111-1111-1111-1111-111111111111',
    triage_id: 't3333333-3333-3333-3333-333333333333',
    source_phc: 'Kanakapura Rural PHC',
    target_hospital_id: 'a8be65cf-e2c7-45bc-8dfb-10d65b77e8a1',
    qr_code_hash: 'MEDNOVA-REF-ANAND-KUMAR-EMERGENCY',
    status: 'PENDING',
    created_at: new Date().toISOString()
  }
];

// Helper to interact with LocalStorage
const getStorageItem = (key, defaultData) => {
  if (typeof window === 'undefined') return defaultData;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(item);
};

const setStorageItem = (key, data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Unified DB object matching Supabase queries in schema
export const db = {
  isOffline: !isSupabaseConfigured,

  // --- Auth & Profiles ---
  async getProfiles() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data;
    }
    return getStorageItem('mednova_profiles', MOCK_PROFILES);
  },

  async getProfile(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
    const profiles = getStorageItem('mednova_profiles', MOCK_PROFILES);
    return profiles.find(p => p.id === id) || profiles[0]; // fallback to default ASHA
  },

  async upsertProfile(profile) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('profiles').upsert(profile).select();
      if (error) throw error;
      return data[0];
    }
    const profiles = getStorageItem('mednova_profiles', MOCK_PROFILES);
    const index = profiles.findIndex(p => p.id === profile.id);
    const updatedProfile = { ...profile, created_at: profile.created_at || new Date().toISOString() };
    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...updatedProfile };
    } else {
      profiles.push(updatedProfile);
    }
    setStorageItem('mednova_profiles', profiles);
    return updatedProfile;
  },

  // --- Patients ---
  async getPatients() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return getStorageItem('mednova_patients', MOCK_PATIENTS).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getPatient(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
    const patients = getStorageItem('mednova_patients', MOCK_PATIENTS);
    return patients.find(p => p.id === id) || null;
  },

  async createPatient(patient) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('patients').insert(patient).select();
      if (error) throw error;
      return data[0];
    }
    const patients = getStorageItem('mednova_patients', MOCK_PATIENTS);
    const newPatient = {
      ...patient,
      id: patient.id || `p_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    patients.push(newPatient);
    setStorageItem('mednova_patients', patients);
    return newPatient;
  },

  // --- Triage Records ---
  async getTriageRecords() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('triage_records').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return getStorageItem('mednova_triage', MOCK_TRIAGE).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getTriageRecord(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('triage_records').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
    const triage = getStorageItem('mednova_triage', MOCK_TRIAGE);
    return triage.find(t => t.id === id) || null;
  },

  async createTriageRecord(record) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('triage_records').insert(record).select();
      if (error) throw error;
      return data[0];
    }
    const triage = getStorageItem('mednova_triage', MOCK_TRIAGE);
    const newRecord = {
      ...record,
      id: record.id || `t_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    triage.push(newRecord);
    setStorageItem('mednova_triage', triage);
    return newRecord;
  },

  // --- Hospitals ---
  async getHospitals() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('hospitals').select('*');
      if (error) throw error;
      return data;
    }
    return getStorageItem('mednova_hospitals', MOCK_HOSPITALS);
  },

  async getHospital(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('hospitals').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
    const hospitals = getStorageItem('mednova_hospitals', MOCK_HOSPITALS);
    return hospitals.find(h => h.id === id) || null;
  },

  async updateHospitalBeds(id, bedsAvailable) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('hospitals').update({ icu_beds_available: bedsAvailable }).eq('id', id).select();
      if (error) throw error;
      return data[0];
    }
    const hospitals = getStorageItem('mednova_hospitals', MOCK_HOSPITALS);
    const index = hospitals.findIndex(h => h.id === id);
    if (index >= 0) {
      hospitals[index].icu_beds_available = bedsAvailable;
      setStorageItem('mednova_hospitals', hospitals);
      return hospitals[index];
    }
    return null;
  },

  // --- Referrals ---
  async getReferrals() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('referrals').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return getStorageItem('mednova_referrals', MOCK_REFERRALS).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getReferral(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('referrals').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
    const referrals = getStorageItem('mednova_referrals', MOCK_REFERRALS);
    return referrals.find(r => r.id === id) || null;
  },

  async createReferral(referral) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('referrals').insert(referral).select();
      if (error) throw error;
      return data[0];
    }
    const referrals = getStorageItem('mednova_referrals', MOCK_REFERRALS);
    const newReferral = {
      ...referral,
      id: referral.id || `r_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    referrals.push(newReferral);
    setStorageItem('mednova_referrals', referrals);
    return newReferral;
  },

  async updateReferralStatus(id, status) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('referrals').update({ status }).eq('id', id).select();
      if (error) throw error;
      return data[0];
    }
    const referrals = getStorageItem('mednova_referrals', MOCK_REFERRALS);
    const index = referrals.findIndex(r => r.id === id);
    if (index >= 0) {
      referrals[index].status = status;
      setStorageItem('mednova_referrals', referrals);
      return referrals[index];
    }
    return null;
  },

  // --- Auth Session Simulator (Local Mode) ---
  async login(username, password) {
    // For local mode, we allow simple mock auth.
    // If username matches an existing profile full_name (e.g. "Sharda" or "Girish") or roles.
    const profiles = getStorageItem('mednova_profiles', MOCK_PROFILES);
    const profile = profiles.find(p => p.full_name.toLowerCase().includes(username.toLowerCase())) || profiles[0];
    if (typeof window !== 'undefined') {
      localStorage.setItem('mednova_current_user', JSON.stringify(profile));
    }
    return profile;
  },

  async getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('mednova_current_user');
    if (!userStr) {
      // Seed with Sharda Gowda as the default logged in worker
      const defaultAsha = getStorageItem('mednova_profiles', MOCK_PROFILES)[0];
      localStorage.setItem('mednova_current_user', JSON.stringify(defaultAsha));
      return defaultAsha;
    }
    return JSON.parse(userStr);
  },

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mednova_current_user');
    }
  }
};
