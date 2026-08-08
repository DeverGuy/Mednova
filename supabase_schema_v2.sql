-- MEDNOVA Database Schema V2 & Seed Data (Supabase Postgres)

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 0: Users Directory (Used for Login with Unique ID)
CREATE TABLE users_directory (
  id TEXT PRIMARY KEY, -- e.g., MED-12345
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('patient', 'doctor', 'admin')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table 1: Patients (patients_v2)
CREATE TABLE patients_v2 (
  id TEXT PRIMARY KEY REFERENCES users_directory(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  dob DATE,
  height TEXT,
  weight TEXT,
  symptoms TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table 2: Patient Vitals (patient_vitals)
CREATE TABLE patient_vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT REFERENCES patients_v2(id) ON DELETE CASCADE NOT NULL,
  heart_rate INTEGER,
  blood_pressure TEXT,
  temperature DECIMAL(5,2),
  oxygen_saturation INTEGER,
  added_by_doctor_id TEXT REFERENCES users_directory(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Note: In a real environment, you'd add RLS policies here similarly to schema V1.
