'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navbar
    nav_brand: 'MEDNOVA',
    nav_dashboard: 'Dashboard',
    nav_assessment: 'Guided Triage',
    nav_chatbot: 'Voice Bot',
    nav_hospitals: 'Hospitals Map',
    nav_logout: 'Logout',
    nav_offline: 'Offline Mode (Local DB)',

    // Common
    loading: 'Loading...',
    error: 'Error occurred',
    success: 'Success!',
    btn_next: 'Next',
    btn_back: 'Back',
    btn_submit: 'Submit Assessment',
    risk_low: 'LOW RISK',
    risk_moderate: 'MODERATE RISK',
    risk_emergency: 'EMERGENCY',

    // Login
    login_title: 'MEDNOVA Portal',
    login_sub: 'Frontline Healthcare Gateway (PHC & ASHA)',
    login_username: 'ASHA Worker Name / ID',
    login_password: 'Password / PIN',
    login_btn_sign_in: 'Sign In with Credentials',
    login_biometric_btn: 'Use Face/Biometric Login',
    login_credentials_btn: 'Use Standard Credentials',
    login_face_guide: 'Position face within the green oval',
    login_face_scanning: 'Scanning facial details...',
    login_face_success: 'Biometric Authenticated! Logging in...',
    login_face_failed: 'Authentication failed. Please try credentials.',
    login_mock_credentials: 'Try typing "Sharda" or "Girish" for instant login demo',

    // Dashboard
    dash_title: 'ASHA Workstation',
    dash_welcome: 'Welcome back,',
    dash_stats_patients: 'Patients Tracked',
    dash_stats_emergencies: 'Active Emergencies',
    dash_stats_referrals: 'Total Referrals',
    dash_quick_actions: 'Quick Operations',
    dash_btn_new_triage: 'Start Guided Clinical Assessment',
    dash_patient_search_placeholder: 'Search patients by Name or ABHA ID...',
    dash_patient_list: 'Registered Patients & Triage History',
    dash_table_name: 'Patient Name',
    dash_table_age: 'Age/Gender',
    dash_table_abha: 'ABHA ID',
    dash_table_risk: 'Triage Risk',
    dash_table_date: 'Date',
    dash_table_action: 'Action',
    dash_btn_view_pass: 'View Pass',
    dash_no_patients: 'No patients found matching the search query.',
    
    // Scanner Simulator
    scan_portal_title: 'Referral Receiving Portal (Hospital Mode)',
    scan_portal_desc: 'Simulate scanning a patient\'s QR Referral code at a Taluk/District Hospital to instantly pre-fill admission forms & reserve ICU beds.',
    scan_portal_placeholder: 'Paste QR code hash or ID here...',
    scan_portal_btn: 'Simulate Scanning QR Code',
    scan_portal_success: 'Patient records auto-filled! ICU Bed reserved at target hospital.',

    // Assessment
    assess_title: 'WHO IMCI / ICMR Guided Triage Wizard',
    assess_step_1: '1. Patient Info',
    assess_step_2: '2. Vital Signs',
    assess_step_3: '3. Symptoms & Checklist',
    assess_step_4: '4. Triage Stratification',
    
    assess_name: 'Patient Full Name',
    assess_age: 'Age (Years)',
    assess_gender: 'Gender',
    assess_gender_male: 'Male',
    assess_gender_female: 'Female',
    assess_gender_other: 'Other',
    assess_abha: 'ABHA ID (Health ID - Optional)',
    
    assess_vitals_title: 'Record Patient Vitals',
    assess_vitals_temp: 'Body Temperature (°F)',
    assess_vitals_spo2: 'Oxygen Saturation SpO2 (%)',
    assess_vitals_bp_sys: 'Systolic Blood Pressure (mmHg)',
    assess_vitals_bp_dia: 'Diastolic Blood Pressure (mmHg)',
    assess_vitals_hr: 'Heart Rate (bpm)',
    
    assess_symptom_title: 'Symptom Checklist & Red Flags',
    assess_symptom_fever: 'Fever Present?',
    assess_symptom_fever_days: 'Fever Duration (Days)',
    assess_symptom_breathless: 'Severe Breathlessness (Fast Breathing)?',
    assess_symptom_chest_pain: 'Chest Pain or Tightness?',
    assess_symptom_consciousness: 'Altered Consciousness / Lethargy?',
    assess_symptom_convulsions: 'Inability to Drink or Vomiting Everything?',
    
    assess_triage_res: 'Triage Risk Classification',
    assess_strat_low: 'Routine Care / Local PHC visit',
    assess_strat_mod: 'Urgent consultation recommended at Community Health Center (CHC)',
    assess_strat_emergency: 'IMMEDIATE REFERRAL REQUIRED to District Hospital / Tertiary Care!',
    assess_emergency_trigger_title: 'HARDCODED CLINICAL SAFEGUARD DETECTED:',
    assess_emergency_vitals_alert: 'Critical vitals registered (SpO2 < 90% or Systolic BP < 90mmHg). Case marked as Emergency.',
    assess_emergency_symptoms_alert: 'Red-flag symptom checked (Severe Chest Pain, Breathlessness, or Altered Consciousness). Case marked as Emergency.',
    assess_select_hosp: 'Select Referral Destination Hospital:',
    assess_source_phc: 'Source PHC Name',
    assess_source_phc_placeholder: 'e.g., Kanakapura Rural PHC',
    assess_success_msg: 'Triage complete! Referral Ticket generated with QR authentication.',

    // Referral
    ref_pass_title: 'Digital Referral Pass',
    ref_id: 'Referral ID',
    ref_from: 'Source PHC',
    ref_to: 'Referral Destination',
    ref_status: 'Referral Status',
    ref_print: 'Download PDF / Print Summary',
    ref_qr_info: 'Show this QR ticket at the receiving hospital registration desk for instant paperless admission.',
    ref_vitals_logged: 'Recorded Vitals',
    ref_symptoms_logged: 'Checked Symptoms',

    // Hospitals
    hosp_title: 'Geospatial Route & Capacity Optimizer',
    hosp_sub: 'Real-time specialist, bed availability, and transit time tracking',
    hosp_filter_ct: 'Operational CT Scan',
    hosp_filter_specialists: 'Filter by Specialist on Duty',
    hosp_filter_beds: 'Available ICU Beds Only',
    hosp_specialist: 'Active Specialist',
    hosp_beds: 'ICU Beds Available',
    hosp_ct: 'CT Scan Status',
    hosp_ct_ok: 'Operational Today',
    hosp_ct_fail: 'Under Maintenance',
    hosp_distance: 'Distance',
    hosp_drive: 'Est. Drive Time',
    hosp_map_label: 'Interactive Route Canvas Map',
    hosp_select_route: 'Select a hospital to preview emergency transit route from Kanakapura PHC',

    // Chatbot
    chat_title: 'Voice-Enabled AI Triage Assistant',
    chat_sub: 'Bilingual Clinical Assistant & Remedial Advisor',
    chat_rec_start: 'Tap Mic to Speak (Kannada/English)',
    chat_rec_stop: 'Tap to Stop Recording',
    chat_listening: 'Listening...',
    chat_placeholder: 'Say something like: "My child has high fever for 3 days and rapid breathing"...',
    chat_wave_label: 'Audio Voice Input Waveform',
    chat_voice_btn: 'Voice Response'
  },
  kn: {
    // Navbar
    nav_brand: 'ಮೆಡ್ನೋವಾ',
    nav_dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    nav_assessment: 'ಮಾರ್ಗದರ್ಶಿ ವಿಂಗಡಣೆ',
    nav_chatbot: 'ಧ್ವನಿ ಬೋಟ್',
    nav_hospitals: 'ಆಸ್ಪತ್ರೆಗಳ ನಕ್ಷೆ',
    nav_logout: 'ನಿರ್ಗಮನ',
    nav_offline: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ (ಸ್ಥಳೀಯ ಡೇಟಾಬೇಸ್)',

    // Common
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    error: 'ದೋಷ ಸಂಭವಿಸಿದೆ',
    success: 'ಯಶಸ್ವಿಯಾಗಿದೆ!',
    btn_next: 'ಮುಂದೆ',
    btn_back: 'ಹಿಂದೆ',
    btn_submit: 'ಮೌಲ್ಯಮಾಪನ ಸಲ್ಲಿಸಿ',
    risk_low: 'ಕಡಿಮೆ ಅಪಾಯ',
    risk_moderate: 'ಮಧ್ಯಮ ಅಪಾಯ',
    risk_emergency: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ',

    // Login
    login_title: 'ಮೆಡ್ನೋವಾ ಪೋರ್ಟಲ್',
    login_sub: 'ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರ ಗೇಟ್‌ವೇ (PHC ಮತ್ತು ಆಶಾ)',
    login_username: 'ಆಶಾ ಕಾರ್ಯಕರ್ತರ ಹೆಸರು / ಐಡಿ',
    login_password: 'ಪಾಸ್‌ವರ್ಡ್ / ಪಿನ್',
    login_btn_sign_in: 'ರುಜುವಾತುಗಳೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
    login_biometric_btn: 'ಫೇಸ್/ಬಯೋಮೆಟ್ರಿಕ್ ಲಾಗಿನ್ ಬಳಸಿ',
    login_credentials_btn: 'ಸಾಮಾನ್ಯ ರುಜುವಾತುಗಳನ್ನು ಬಳಸಿ',
    login_face_guide: 'ಮುಖವನ್ನು ಹಸಿರು ಅಂಡಾಕಾರದೊಳಗೆ ಇರಿಸಿ',
    login_face_scanning: 'ಮುಖದ ವಿವರಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    login_face_success: 'ಬಯೋಮೆಟ್ರಿಕ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ! ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...',
    login_face_failed: 'ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ರುಜುವಾತುಗಳನ್ನು ಬಳಸಿ.',
    login_mock_credentials: 'ತ್ವರಿತ ಲಾಗಿನ್ ಡೆಮೊಗಾಗಿ "Sharda" ಅಥವಾ "Girish" ಎಂದು ಟೈಪ್ ಮಾಡಿ ನೋಡಿ',

    // Dashboard
    dash_title: 'ಆಶಾ ಕಾರ್ಯಸ್ಥಳ',
    dash_welcome: 'ಸ್ವಾಗತ,',
    dash_stats_patients: 'ರೋಗಿಗಳ ಸಂಖ್ಯೆ',
    dash_stats_emergencies: 'ತುರ್ತು ಪ್ರಕರಣಗಳು',
    dash_stats_referrals: 'ಒಟ್ಟು ರೆಫರಲ್‌ಗಳು',
    dash_quick_actions: 'ತ್ವರಿತ ಕಾರ್ಯಾಚರಣೆಗಳು',
    dash_btn_new_triage: 'ಮಾರ್ಗದರ್ಶಿ ಚಿಕಿತ್ಸಕ ಮೌಲ್ಯಮಾಪನವನ್ನು ಪ್ರಾರಂಭಿಸಿ',
    dash_patient_search_placeholder: 'ಹೆಸರು ಅಥವಾ ಆಭಾ ಐಡಿ ಮೂಲಕ ರೋಗಿಗಳನ್ನು ಹುಡುಕಿ...',
    dash_patient_list: 'ನೋಂದಾಯಿತ ರೋಗಿಗಳು ಮತ್ತು ವಿಂಗಡಣೆ ಇತಿಹಾಸ',
    dash_table_name: 'ರೋಗಿಯ ಹೆಸರು',
    dash_table_age: 'ವಯಸ್ಸು/ಲಿಂಗ',
    dash_table_abha: 'ಆಭಾ ಐಡಿ',
    dash_table_risk: 'ಅಪಾಯದ ಮಟ್ಟ',
    dash_table_date: 'ದಿನಾಂಕ',
    dash_table_action: 'ಕ್ರಮ',
    dash_btn_view_pass: 'ಪಾಸ್ ವೀಕ್ಷಿಸಿ',
    dash_no_patients: 'ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ರೋಗಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',

    // Scanner Simulator
    scan_portal_title: 'ರೆಫರಲ್ ಸ್ವೀಕರಿಸುವ ಪೋರ್ಟಲ್ (ಆಸ್ಪತ್ರೆ ಮೋಡ್)',
    scan_portal_desc: 'ತಾಲೂಕು/ಜಿಲ್ಲಾ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ರೋಗಿಯ ಕ್ಯೂಆರ್ ರೆಫರಲ್ ಕೋಡ್ ಅನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡುವುದನ್ನು ಅನುಕರಿಸಿ, ತಕ್ಷಣವೇ ನೋಂದಣಿ ಫಾರ್ಮ್‌ಗಳನ್ನು ಸ್ವಯಂ ಭರ್ತಿ ಮಾಡಲು ಮತ್ತು ಐಸಿಯು ಬೆಡ್‌ಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲು.',
    scan_portal_placeholder: 'ಕ್ಯೂಆರ್ ಕೋಡ್ ಹ್ಯಾಶ್ ಅಥವಾ ಐಡಿಯನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ...',
    scan_portal_btn: 'ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಅನ್ನು ಅನುಕರಿಸಿ',
    scan_portal_success: 'ರೋಗಿಯ ದಾಖಲೆಗಳನ್ನು ಸ್ವಯಂ ಭರ್ತಿ ಮಾಡಲಾಗಿದೆ! ಗುರಿ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಐಸಿಯು ಬೆಡ್ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',

    // Assessment
    assess_title: 'WHO IMCI / ICMR ಮಾರ್ಗದರ್ಶಿ ವಿಂಗಡಣೆ ಮಾಂತ್ರಿಕ',
    assess_step_1: '೧. ರೋಗಿಯ ಮಾಹಿತಿ',
    assess_step_2: '೨. ಪ್ರಮುಖ ಲಕ್ಷಣಗಳು (Vitals)',
    assess_step_3: '೩. ರೋಗಲಕ್ಷಣಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ',
    assess_step_4: '೪. ಅಪಾಯದ ವರ್ಗೀಕರಣ',
    
    assess_name: 'ರೋಗಿಯ ಪೂರ್ಣ ಹೆಸರು',
    assess_age: 'ವಯಸ್ಸು (ವರ್ಷಗಳು)',
    assess_gender: 'ಲಿಂಗ',
    assess_gender_male: 'ಪುರುಷ',
    assess_gender_female: 'ಮಹಿಳೆ',
    assess_gender_other: 'ಇತರೆ',
    assess_abha: 'ಆಭಾ ಐಡಿ (ಆರೋಗ್ಯ ಐಡಿ - ಐಚ್ಛಿಕ)',
    
    assess_vitals_title: 'ರೋಗಿಯ ಪ್ರಮುಖ ಲಕ್ಷಣಗಳ ದಾಖಲೆ',
    assess_vitals_temp: 'ದೇಹದ ಉಷ್ಣತೆ (°F)',
    assess_vitals_spo2: 'ಆಮ್ಲಜನಕದ ಮಟ್ಟ SpO2 (%)',
    assess_vitals_bp_sys: 'ಸಿಸ್ಟೊಲಿಕ್ ರಕ್ತದೊತ್ತಡ (mmHg)',
    assess_vitals_bp_dia: 'ಡಯಾಸ್ಟೊಲಿಕ್ ರಕ್ತದೊತ್ತಡ (mmHg)',
    assess_vitals_hr: 'ಹೃದಯ ಬಡಿತದ ದರ (bpm)',
    
    assess_symptom_title: 'ರೋಗಲಕ್ಷಣಗಳ ಪರಿಶೀಲನೆ ಮತ್ತು ಕೆಂಪು ನಿಶಾನೆಗಳು',
    assess_symptom_fever: 'ಜ್ವರ ಇದೆಯೇ?',
    assess_symptom_fever_days: 'ಜ್ವರದ ಅವಧಿ (ದಿನಗಳು)',
    assess_symptom_breathless: 'ತೀವ್ರ ಉಸಿರಾಟದ ತೊಂದರೆ ಇದೆಯೇ?',
    assess_symptom_chest_pain: 'ಎದೆ ನೋವು ಅಥವಾ ಬಿಗಿತ ಇದೆಯೇ?',
    assess_symptom_consciousness: 'ಪ್ರಜ್ಞೆ ತಪ್ಪುವುದು ಅಥವಾ ಆಲಸ್ಯ ಇದೆಯೇ?',
    assess_symptom_convulsions: 'ಕುಡಿಯಲು ಅಸಮರ್ಥತೆ ಅಥವಾ ಎಲ್ಲವನ್ನೂ ವಾಂತಿ ಮಾಡಿಕೊಳ್ಳುವುದು?',
    
    assess_triage_res: 'ವಿಂಗಡಣೆ ಅಪಾಯದ ವರ್ಗೀಕರಣ',
    assess_strat_low: 'ಸಾಮಾನ್ಯ ಆರೈಕೆ / ಸ್ಥಳೀಯ PHC ಭೇಟಿ',
    assess_strat_mod: 'ಸಮುದಾಯ ಆರೋಗ್ಯ ಕೇಂದ್ರದಲ್ಲಿ (CHC) ತುರ್ತು ಸಮಾಲೋಚನೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ',
    assess_strat_emergency: 'ಜಿಲ್ಲಾ ಆಸ್ಪತ್ರೆ / ತೃತೀಯ ಹಂತದ ಆರೈಕೆಗೆ ತಕ್ಷಣದ ಉಲ್ಲೇಖ ಅಗತ್ಯವಿದೆ!',
    assess_emergency_trigger_title: 'ಖಚಿತ ಕ್ಲಿನಿಕಲ್ ಸುರಕ್ಷತೆ ಪತ್ತೆಯಾಗಿದೆ:',
    assess_emergency_vitals_alert: 'ನಿರ್ಣಾಯಕ ಪ್ರಮುಖ ಲಕ್ಷಣಗಳು ದಾಖಲಾಗಿವೆ (SpO2 < ೯೦% ಅಥವಾ ಸಿಸ್ಟೊಲಿಕ್ BP < ೯೦mmHg). ಪ್ರಕರಣವನ್ನು ತುರ್ತು ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.',
    assess_emergency_symptoms_alert: 'ಕೆಂಪು-ನಿಶಾನೆ ರೋಗಲಕ್ಷಣವನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ (ತೀವ್ರ ಎದೆ ನೋವು, ಉಸಿರಾಟದ ತೊಂದರೆ, ಅಥವಾ ಪ್ರಜ್ಞೆ ತಪ್ಪುವಿಕೆ). ಪ್ರಕರಣವನ್ನು ತುರ್ತು ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.',
    assess_select_hosp: 'ರೆಫರಲ್ ಗಮ್ಯಸ್ಥಾನ ಆಸ್ಪತ್ರೆಯನ್ನು ಆರಿಸಿ:',
    assess_source_phc: 'ಮೂಲ PHC ಹೆಸರು',
    assess_source_phc_placeholder: 'ಉದಾಹರಣೆಗೆ, ಕನಕಪುರ ಗ್ರಾಮೀಣ PHC',
    assess_success_msg: 'ಮೌಲ್ಯಮಾಪನ ಪೂರ್ಣಗೊಂಡಿದೆ! ಕ್ಯೂಆರ್ ದೃಢೀಕರಣದೊಂದಿಗೆ ರೆಫರಲ್ ಟಿಕೆಟ್ ರಚಿಸಲಾಗಿದೆ.',

    // Referral
    ref_pass_title: 'ಡಿಜಿಟಲ್ ರೆಫರಲ್ ಪಾಸ್',
    ref_id: 'ರೆಫರಲ್ ಐಡಿ',
    ref_from: 'ಮೂಲ PHC',
    ref_to: 'ರೆಫರಲ್ ಗಮ್ಯಸ್ಥಾನ',
    ref_status: 'ರೆಫರಲ್ ಸ್ಥಿತಿ',
    ref_print: 'ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ / ಮುದ್ರಣ ಸಾರಾಂಶ',
    ref_qr_info: 'ತ್ವರಿತ ಕಾಗದ ರಹಿತ ಪ್ರವೇಶಕ್ಕಾಗಿ ಸ್ವೀಕರಿಸುವ ಆಸ್ಪತ್ರೆಯ ನೋಂದಣಿ ಕೌಂಟರ್‌ನಲ್ಲಿ ಈ ಕ್ಯೂಆರ್ ಟಿಕೆಟ್ ಅನ್ನು ತೋರಿಸಿ.',
    ref_vitals_logged: 'ದಾಖಲಾದ ಪ್ರಮುಖ ಲಕ್ಷಣಗಳು',
    ref_symptoms_logged: 'ಪರಿಶೀಲಿಸಿದ ರೋಗಲಕ್ಷಣಗಳು',

    // Hospitals
    hosp_title: 'ಭೌಗೋಳಿಕ ಮಾರ್ಗ ಮತ್ತು ಸಾಮರ್ಥ್ಯ ಆಪ್ಟಿಮೈಜರ್',
    hosp_sub: 'ನೈಜ-ಸಮಯದ ತಜ್ಞರು, ಹಾಸಿಗೆ ಲಭ್ಯತೆ ಮತ್ತು ಪ್ರಯಾಣದ ಸಮಯದ ಟ್ರ್ಯಾಕಿಂಗ್',
    hosp_filter_ct: 'ಕಾರ್ಯನಿರ್ವಹಿಸುವ CT ಸ್ಕ್ಯಾನ್',
    hosp_filter_specialists: 'ಕರ್ತವ್ಯದಲ್ಲಿರುವ ತಜ್ಞರಿಂದ ಫಿಲ್ಟರ್ ಮಾಡಿ',
    hosp_filter_beds: 'ಲಭ್ಯವಿರುವ ಐಸಿಯು ಹಾಸಿಗೆಗಳು ಮಾತ್ರ',
    hosp_specialist: 'ಸಕ್ರಿಯ ತಜ್ಞ ವೈದ್ಯರು',
    hosp_beds: 'ಲಭ್ಯವಿರುವ ಐಸಿಯು ಹಾಸಿಗೆಗಳು',
    hosp_ct: 'CT ಸ್ಕ್ಯಾನ್ ಸ್ಥಿತಿ',
    hosp_ct_ok: 'ಇಂದು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ',
    hosp_ct_fail: 'ನಿರ್ವಹಣೆಯಲ್ಲಿದೆ',
    hosp_distance: 'ದೂರ',
    hosp_drive: 'ಅಂದಾಜು ಚಾಲನಾ ಸಮಯ',
    hosp_map_label: 'ಸಂವಾದಾತ್ಮಕ ಮಾರ್ಗ ಕ್ಯಾನ್ವಾಸ್ ನಕ್ಷೆ',
    hosp_select_route: 'ಕನಕಪುರ PHC ಯಿಂದ ತುರ್ತು ಸಾರಿಗೆ ಮಾರ್ಗವನ್ನು ವೀಕ್ಷಿಸಲು ಆಸ್ಪತ್ರೆಯನ್ನು ಆರಿಸಿ',

    // Chatbot
    chat_title: 'ಧ್ವನಿ-ಸಕ್ರಿಯಗೊಳಿಸಿದ AI ವಿಂಗಡಣೆ ಸಹಾಯಕ',
    chat_sub: 'ದ್ವಿಭಾಷಾ ಕ್ಲಿನಿಕಲ್ ಸಹಾಯಕ ಮತ್ತು ಪರಿಹಾರ ಸಲಹೆಗಾರ',
    chat_rec_start: 'ಮಾತನಾಡಲು ಮೈಕ್ ಟ್ಯಾಪ್ ಮಾಡಿ (ಕನ್ನಡ/ಇಂಗ್ಲಿಷ್)',
    chat_rec_stop: 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    chat_listening: 'ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...',
    chat_placeholder: 'ಹೀಗೆ ಹೇಳಿ: "ನನ್ನ ಮಗುವಿಗೆ ೩ ದಿನಗಳಿಂದ ತೀವ್ರ ಜ್ವರ ಮತ್ತು ವೇಗವಾಗಿ ಉಸಿರಾಟವಿದೆ"...',
    chat_wave_label: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್ ತರಂಗರೂಪ',
    chat_voice_btn: 'ಧ್ವನಿ ಪ್ರತಿಕ್ರಿಯೆ'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('mednova_lang');
      if (savedLang === 'en' || savedLang === 'kn') {
        setLanguage(savedLang);
      }
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'kn' : 'en';
    setLanguage(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mednova_lang', nextLang);
    }
  };

  const setLang = (lang) => {
    if (lang === 'en' || lang === 'kn') {
      setLanguage(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mednova_lang', lang);
      }
    }
  };

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
