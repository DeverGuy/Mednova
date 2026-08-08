-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'approved',
  mbbs_certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create patients table
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  dob TEXT,
  height TEXT,
  weight TEXT,
  symptoms TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create patient_vitals table
CREATE TABLE patient_vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  heart_rate TEXT,
  blood_pressure TEXT,
  temperature TEXT,
  oxygen_saturation TEXT,
  added_by_doctor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: Enable Row Level Security (RLS) but we'll leave it wide open for this prototype
-- We could add policies here later.
