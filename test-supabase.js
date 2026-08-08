const { createClient } = require('@supabase/supabase-js');


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTables() {
  const { data: users, error: err1 } = await supabase.from('users').select('*').limit(1);
  const { data: patients, error: err2 } = await supabase.from('patients').select('*').limit(1);
  const { data: vitals, error: err3 } = await supabase.from('patient_vitals').select('*').limit(1);
  
  console.log('Users table error:', err1 ? err1.message : 'OK');
  console.log('Patients table error:', err2 ? err2.message : 'OK');
  console.log('Vitals table error:', err3 ? err3.message : 'OK');
}

checkTables();
