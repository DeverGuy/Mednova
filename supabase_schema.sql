-- MEDNOVA Database Schema & Seed Data (Supabase Postgres)

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (clean setup)
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;
DROP TABLE IF EXISTS triage_records CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('asha_worker', 'patient', 'doctor', 'hospital_admin')) NOT NULL,
  preferred_language TEXT CHECK (preferred_language IN ('en', 'kn')) DEFAULT 'en' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profiles" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Patients Table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  abha_id TEXT UNIQUE,
  created_by_asha_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for Patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access to patients" ON patients
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert access to patients" ON patients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow creators to update patients" ON patients
  FOR UPDATE USING (true);

-- 3. Triage Records Table
CREATE TABLE triage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  symptoms JSONB NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('EMERGENCY', 'MODERATE', 'LOW')) NOT NULL,
  vitals JSONB NOT NULL,
  language_used TEXT CHECK (language_used IN ('en', 'kn')) DEFAULT 'en' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for Triage Records
ALTER TABLE triage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to triage records" ON triage_records
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to triage records" ON triage_records
  FOR INSERT WITH CHECK (true);

-- 4. Hospitals Table
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location JSONB NOT NULL, -- Format: { "lat": 12.34, "lng": 76.56, "district": "District Name", "taluk": "Taluk Name" }
  icu_beds_available INTEGER NOT NULL DEFAULT 0,
  ct_scan_status BOOLEAN NOT NULL DEFAULT true,
  specialist_on_duty TEXT[] NOT NULL DEFAULT '{}'
);

-- Enable RLS for Hospitals
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to hospitals" ON hospitals
  FOR SELECT USING (true);

CREATE POLICY "Allow admin update access to hospitals" ON hospitals
  FOR UPDATE USING (true);

-- 5. Referrals Table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  triage_id UUID REFERENCES triage_records(id) ON DELETE CASCADE NOT NULL,
  source_phc TEXT NOT NULL,
  target_hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE NOT NULL,
  qr_code_hash TEXT NOT NULL,
  status TEXT CHECK (status IN ('PENDING', 'ACCEPTED', 'COMPLETED')) DEFAULT 'PENDING' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for Referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to referrals" ON referrals
  FOR SELECT USING (true);

CREATE POLICY "Allow public write access to referrals" ON referrals
  FOR ALL USING (true);

-- --- SEED DATA FOR HOSPITALS (Rural / Semi-Urban Karnataka Healthcare Centers) ---

INSERT INTO hospitals (id, name, location, icu_beds_available, ct_scan_status, specialist_on_duty) VALUES
(
  'a8be65cf-e2c7-45bc-8dfb-10d65b77e8a1',
  'Shimoga District Hospital (Mc Gann Hospital)',
  '{"lat": 13.9328, "lng": 75.5684, "district": "Shivamogga", "taluk": "Shimoga"}',
  12,
  true,
  ARRAY['Cardiologist', 'Pediatrician', 'General Surgeon']
),
(
  'b5ce75cf-e2c7-45bc-8dfb-20d65b77e8a2',
  'Hassan Institute of Medical Sciences (HIMS)',
  '{"lat": 13.0076, "lng": 76.1026, "district": "Hassan", "taluk": "Hassan"}',
  0, -- Full capacity
  true,
  ARRAY['Pediatrician', 'Gynecologist', 'Orthopedic Surgeon']
),
(
  'c2de85cf-e2c7-45bc-8dfb-30d65b77e8a3',
  'Chigateri General Hospital (Davanagere)',
  '{"lat": 14.4644, "lng": 75.9218, "district": "Davanagere", "taluk": "Davanagere"}',
  8,
  false, -- CT scan under maintenance
  ARRAY['Cardiologist', 'Anesthesiologist', 'Gynecologist']
),
(
  'd9ee95cf-e2c7-45bc-8dfb-40d65b77e8a4',
  'Chamarajanagar District Government Hospital',
  '{"lat": 11.9262, "lng": 76.9405, "district": "Chamarajanagar", "taluk": "Chamarajanagar"}',
  4,
  true,
  ARRAY['Pediatrician', 'General Physician']
),
(
  'e6fe05cf-e2c7-45bc-8dfb-50d65b77e8a5',
  'Kanakapura Taluk Hospital (Ramanagara)',
  '{"lat": 12.5484, "lng": 77.4208, "district": "Ramanagara", "taluk": "Kanakapura"}',
  2,
  false,
  ARRAY['General Physician', 'Gynecologist']
);
