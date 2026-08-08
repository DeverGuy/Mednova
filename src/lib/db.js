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
  }
];

const MOCK_TRIAGE = [];
const MOCK_REFERRALS = [];

// V2 Mock Data for Local Storage Fallback
const MOCK_USERS_DIR = [
  { id: 'ADMIN-1', password: 'password', role: 'admin', created_at: new Date().toISOString() },
  { id: 'DOC-1', password: 'password', role: 'doctor', created_at: new Date().toISOString() },
  { id: 'PAT-1', password: 'password', role: 'patient', created_at: new Date().toISOString() }
];

const MOCK_PATIENTS_V2 = [
  {
    id: 'PAT-1',
    name: 'Ramesh Gowda',
    age: 45,
    gender: 'Male',
    dob: '1979-01-01',
    height: '170cm',
    weight: '70kg',
    symptoms: 'Mild fever, dry cough',
    description: 'Patient reports feeling weak for the past 2 days.',
    created_at: new Date().toISOString()
  }
];

const MOCK_PATIENT_VITALS = [
  {
    id: 'vit-1',
    patient_id: 'PAT-1',
    heart_rate: 78,
    blood_pressure: '120/80',
    temperature: 99.2,
    oxygen_saturation: 98,
    added_by_doctor_id: 'DOC-1',
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

  // --- Auth & Profiles (Original) ---
  async getProfiles() {
    return getStorageItem('mednova_profiles', MOCK_PROFILES);
  },

  async getProfile(id) {
    const profiles = getStorageItem('mednova_profiles', MOCK_PROFILES);
    return profiles.find(p => p.id === id) || profiles[0]; // fallback to default ASHA
  },

  async upsertProfile(profile) {
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

  // --- Patients (Original) ---
  async getPatients() {
    return getStorageItem('mednova_patients', MOCK_PATIENTS).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getPatient(id) {
    const patients = getStorageItem('mednova_patients', MOCK_PATIENTS);
    return patients.find(p => p.id === id) || null;
  },

  async createPatient(patient) {
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

  // --- Triage Records (Original) ---
  async getTriageRecords() {
    return getStorageItem('mednova_triage', MOCK_TRIAGE).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getTriageRecord(id) {
    const triage = getStorageItem('mednova_triage', MOCK_TRIAGE);
    return triage.find(t => t.id === id) || null;
  },

  async createTriageRecord(record) {
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

  // --- Hospitals (Original) ---
  async getHospitals() {
    return getStorageItem('mednova_hospitals', MOCK_HOSPITALS);
  },

  async getHospital(id) {
    const hospitals = getStorageItem('mednova_hospitals', MOCK_HOSPITALS);
    return hospitals.find(h => h.id === id) || null;
  },

  async updateHospitalBeds(id, bedsAvailable) {
    const hospitals = getStorageItem('mednova_hospitals', MOCK_HOSPITALS);
    const index = hospitals.findIndex(h => h.id === id);
    if (index >= 0) {
      hospitals[index].icu_beds_available = bedsAvailable;
      setStorageItem('mednova_hospitals', hospitals);
      return hospitals[index];
    }
    return null;
  },

  // --- Referrals (Original) ---
  async getReferrals() {
    return getStorageItem('mednova_referrals', MOCK_REFERRALS).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getReferral(id) {
    const referrals = getStorageItem('mednova_referrals', MOCK_REFERRALS);
    return referrals.find(r => r.id === id) || null;
  },

  async createReferral(referral) {
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
    const referrals = getStorageItem('mednova_referrals', MOCK_REFERRALS);
    const index = referrals.findIndex(r => r.id === id);
    if (index >= 0) {
      referrals[index].status = status;
      setStorageItem('mednova_referrals', referrals);
      return referrals[index];
    }
    return null;
  },

  // --- Auth Session Simulator (Local Mode - Original) ---
  async login(username, password) {
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
  },

  // ==========================================
  // --- V2 Auth (New Implementation) ---
  // ==========================================
  async loginV2(id, password, role) {
    const users = getStorageItem('mednova_users', MOCK_USERS_DIR);
    const user = users.find(u => u.id === id && u.password === password && u.role === role);
    if (user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mednova_current_user_v2', JSON.stringify(user));
      }
      return user;
    }
    return null;
  },

  async registerV2(userData, role) {
    const users = getStorageItem('mednova_users', MOCK_USERS_DIR);
    
    // Generate ID
    const prefix = role === 'patient' ? 'PAT-' : role === 'doctor' ? 'DOC-' : 'ADM-';
    const uniqueId = prefix + Math.floor(1000 + Math.random() * 9000);
    
    const newUser = {
      id: uniqueId,
      password: userData.password,
      role: role,
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    setStorageItem('mednova_users', users);

    // If patient, also create patient record
    if (role === 'patient') {
      const patients = getStorageItem('mednova_patients_v2', MOCK_PATIENTS_V2);
      patients.push({
        id: uniqueId,
        name: userData.name,
        age: userData.age,
        gender: userData.gender,
        dob: userData.dob,
        height: userData.height,
        weight: userData.weight,
        symptoms: userData.symptoms,
        description: userData.description,
        created_at: new Date().toISOString()
      });
      setStorageItem('mednova_patients_v2', patients);
    }
    
    return newUser;
  },

  async getCurrentUserV2() {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('mednova_current_user_v2');
    return userStr ? JSON.parse(userStr) : null;
  },

  async logoutV2() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mednova_current_user_v2');
    }
  },

  // --- V2 Data Access ---
  async getPatientV2(id) {
    const patients = getStorageItem('mednova_patients_v2', MOCK_PATIENTS_V2);
    return patients.find(p => p.id === id) || null;
  },

  async getAllPatientsV2() {
    return getStorageItem('mednova_patients_v2', MOCK_PATIENTS_V2);
  },

  async getPatientVitals(patientId) {
    const vitals = getStorageItem('mednova_patient_vitals', MOCK_PATIENT_VITALS);
    return vitals.filter(v => v.patient_id === patientId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async addPatientVitals(vitalData) {
    const vitals = getStorageItem('mednova_patient_vitals', MOCK_PATIENT_VITALS);
    const newVital = {
      id: `vit-${Math.random().toString(36).substr(2, 9)}`,
      ...vitalData,
      created_at: new Date().toISOString()
    };
    vitals.push(newVital);
    setStorageItem('mednova_patient_vitals', vitals);
    return newVital;
  }
};
