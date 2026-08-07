'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Activity, 
  ShieldCheck, 
  Map, 
  Mic, 
  ArrowRight, 
  PlusCircle, 
  Hospital 
} from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Visual background pulse waves */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-teal-600 flex items-center justify-center">
        <svg className="w-full h-full max-w-5xl" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,300 C150,200 350,400 500,300 C650,200 850,400 1000,300" fill="none" stroke="currentColor" strokeWidth="8" />
          <path d="M0,200 C200,350 400,100 600,200 C800,300 900,150 1000,250" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
      </div>

      <div className="w-full max-w-5xl mx-auto space-y-12 z-10">
        
        {/* Core Jumbotron Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 mb-2 shadow-sm">
            <Activity className="h-8 w-8 text-teal-600 animate-pulse" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-800 leading-tight">
            {t('nav_brand')}: Rural Indian Healthcare Gateway
          </h1>
          
          <p className="text-base sm:text-lg text-slate-500 font-semibold leading-relaxed">
            Empowering frontline ASHA workers and Primary Health Centers with bilingual clinical triage protocols, real-time hospital bed optimizer, and voice-assisted diagnostic tools.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all transform active:scale-95 cursor-pointer min-h-[48px]"
            >
              <span>Access Workstation Portal</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <Link
              href="/hospitals"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 border border-slate-300 rounded-2xl shadow-sm transition-all cursor-pointer min-h-[48px]"
            >
              <Hospital className="h-5 w-5 text-teal-600" />
              <span>Hospital Capacity Map</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          
          {/* Feature 1 */}
          <div className="glass-panel p-6 rounded-2xl hover-scale text-left space-y-3">
            <div className="h-10 w-10 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">Dual Camera & PIN Login</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Standard credential authentication and simulated biometric facial scanner guides for fast, secure sign-in by healthcare workers in rural terrains.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel p-6 rounded-2xl hover-scale text-left space-y-3">
            <div className="h-10 w-10 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl flex items-center justify-center">
              <Map className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">Capacity & Route Optimizer</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Real-time ICU bed and specialist tracker with animated vector map coordinates showing estimated distance and driving time from rural PHCs to District hospitals.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel p-6 rounded-2xl hover-scale text-left space-y-3">
            <div className="h-10 w-10 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl flex items-center justify-center">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">Multilingual voice AI Assistant</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Speak symptoms directly in Kannada or English. Conversational assistant returns localized remedies or directs the patient to urgent healthcare units.
            </p>
          </div>

        </div>

        {/* Clinical Safe Standards Tag footer */}
        <div className="text-center pt-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-xs font-bold">
            <PlusCircle className="h-4.5 w-4.5 text-teal-600" />
            Conforms to WHO Integrated Management of Childhood Illness (IMCI) & ICMR Triage Protocols
          </span>
        </div>

      </div>
    </div>
  );
}
