'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { 
  Hospital, 
  Search, 
  MapPin, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Navigation, 
  Filter, 
  ChevronRight, 
  Stethoscope 
} from 'lucide-react';

export default function HospitalsPage() {
  const { t } = useLanguage();
  const [hospitals, setHospitals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [filterSpecialist, setFilterSpecialist] = useState('All');
  const [filterBeds, setFilterBeds] = useState(false);
  const [filterCt, setFilterCt] = useState(false);

  // Selected hospital for route preview
  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      const data = await db.getHospitals();
      setHospitals(data);
      if (data.length > 0) {
        setSelectedHospital(data[0]); // default select the first hospital
      }
    };
    fetchHospitals();
  }, []);

  // Filter logic
  const filteredHospitals = hospitals.filter(hosp => {
    // Search match
    const nameMatch = hosp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      hosp.location.district.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Bed availability match
    const bedMatch = !filterBeds || hosp.icu_beds_available > 0;

    // CT Scan match
    const ctMatch = !filterCt || hosp.ct_scan_status;

    // Specialist match
    const specialistMatch = filterSpecialist === 'All' || 
                            hosp.specialist_on_duty.includes(filterSpecialist);

    return nameMatch && bedMatch && ctMatch && specialistMatch;
  });

  // Calculate coordinates for the SVG map representation (origin: Kanakapura PHC in bottom-center)
  // We mock canvas visual map nodes: source Kanakapura at (200, 260)
  // Mc Gann Hospital, HIMS, Chigateri, etc. mapped to local coordinates.
  const mapOrigin = { x: 200, y: 250, name: 'Kanakapura PHC' };
  
  const getMapCoordinates = (hospId) => {
    // Map hospital IDs to visual SVG nodes
    const coordMap = {
      'a8be65cf-e2c7-45bc-8dfb-10d65b77e8a1': { x: 80, y: 60 },  // Shimoga (North West)
      'b5ce75cf-e2c7-45bc-8dfb-20d65b77e8a2': { x: 100, y: 170 }, // Hassan (West)
      'c2de85cf-e2c7-45bc-8dfb-30d65b77e8a3': { x: 220, y: 50 },  // Davanagere (North)
      'd9ee95cf-e2c7-45bc-8dfb-40d65b77e8a4': { x: 280, y: 220 }, // Chamarajanagar (South East)
      'e6fe05cf-e2c7-45bc-8dfb-50d65b77e8a5': { x: 190, y: 130 }  // Kanakapura Hospital (Close by)
    };
    return coordMap[hospId] || { x: 300, y: 100 };
  };

  // Mock travel stats based on selections
  const getTravelStats = (hospName) => {
    if (hospName.includes('Kanakapura')) return { dist: '8.4 km', time: '12 mins', route: 'Kanakapura Bypass' };
    if (hospName.includes('Chamarajanagar')) return { dist: '110 km', time: '2 hrs 15 mins', route: 'NH-948' };
    if (hospName.includes('Hassan')) return { dist: '142 km', time: '2 hrs 40 mins', route: 'Hassan-Kanakapura Road' };
    if (hospName.includes('Shimoga')) return { dist: '272 km', time: '5 hrs 10 mins', route: 'NH-206 & NH-48' };
    return { dist: '198 km', time: '3 hrs 45 mins', route: 'SH-47 / NH-4' };
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Hospital className="h-6 w-6 text-teal-600" />
          {t('hosp_title')}
        </h1>
        <p className="text-sm text-slate-500 font-semibold mt-1">
          {t('hosp_sub')}
        </p>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          
          {/* Search bar */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospitals by name, district, or taluk..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm font-semibold text-slate-800 focus:bg-white"
            />
          </div>

          {/* Specialist Filter */}
          <div>
            <select
              value={filterSpecialist}
              onChange={(e) => setFilterSpecialist(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm font-semibold text-slate-800 focus:bg-white cursor-pointer"
            >
              <option value="All">All Specialists</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Gynecologist">Gynecologist</option>
              <option value="General Physician">General Physician</option>
            </select>
          </div>

          {/* Quick Checkbox Toggles */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={filterBeds}
                onChange={(e) => setFilterBeds(e.target.checked)}
                className="h-4.5 w-4.5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
              />
              <span>ICU Beds</span>
            </label>
            
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={filterCt}
                onChange={(e) => setFilterCt(e.target.checked)}
                className="h-4.5 w-4.5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
              />
              <span>CT Scan</span>
            </label>
          </div>

        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Hospital List (Lg: 5 columns) */}
        <div className="lg:col-span-5 space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredHospitals.length > 0 ? (
            filteredHospitals.map((hosp) => {
              const isSelected = selectedHospital?.id === hosp.id;
              const hasBeds = hosp.icu_beds_available > 0;
              const stats = getTravelStats(hosp.name);

              return (
                <div
                  key={hosp.id}
                  onClick={() => setSelectedHospital(hosp)}
                  className={`glass-panel p-4 rounded-xl cursor-pointer transition-all border text-left flex justify-between items-start gap-4 ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/20 shadow-md'
                      : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-start gap-2">
                      <Hospital className={`h-5 w-5 shrink-0 ${isSelected ? 'text-teal-600' : 'text-slate-500'}`} />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{hosp.name}</h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{hosp.location.district} District</span>
                      </div>
                    </div>

                    {/* Vitals Beds & CT Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        hasBeds ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {hasBeds ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            {hosp.icu_beds_available} {t('hosp_beds')}
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            ICU Full
                          </>
                        )}
                      </span>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        hosp.ct_scan_status ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {hosp.ct_scan_status ? 'CT Scan Ok' : 'CT Scan Off'}
                      </span>
                    </div>

                    {/* Duty specialists list */}
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                      <span className="line-clamp-1">On-Duty: {hosp.specialist_on_duty.join(', ')}</span>
                    </div>
                  </div>

                  {/* Distance & Time details badge */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-800">{stats.dist}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">{stats.time}</p>
                    <ChevronRight className="h-4 w-4 ml-auto mt-2 text-slate-400" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl text-slate-400 font-semibold">
              No healthcare facilities found.
            </div>
          )}
        </div>

        {/* Right Column: Visual SVG Route Map Canvas (Lg: 7 columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-[500px] sm:h-[550px]">
          
          {/* Map Title/Sub */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{t('hosp_map_label')}</h3>
              <p className="text-[10px] text-slate-400 font-bold">{t('hosp_select_route')}</p>
            </div>
            {selectedHospital && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full animate-fadeIn">
                <Navigation className="h-3 w-3 text-teal-600 rotate-45" />
                <span>Route to {selectedHospital.name.split(' (')[0]}</span>
              </span>
            )}
          </div>

          {/* SVG Map Area */}
          <div className="flex-1 relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
            
            <svg className="w-full h-full min-h-[300px]" viewBox="0 0 400 300">
              {/* Grid Lines in background */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Transit Routes (Lines) */}
              {hospitals.map((hosp) => {
                const coord = getMapCoordinates(hosp.id);
                const isRouteSelected = selectedHospital?.id === hosp.id;

                return (
                  <g key={`route-${hosp.id}`}>
                    {/* Background line */}
                    <line
                      x1={mapOrigin.x}
                      y1={mapOrigin.y}
                      x2={coord.x}
                      y2={coord.y}
                      stroke={isRouteSelected ? '#0d9488' : '#cbd5e1'}
                      strokeWidth={isRouteSelected ? '3.5' : '1.5'}
                      strokeDasharray={isRouteSelected ? '6,4' : 'none'}
                      className={isRouteSelected ? 'animate-[dash_2s_linear_infinite]' : ''}
                      style={isRouteSelected ? { strokeDashoffset: -20 } : {}}
                    />
                    
                    {/* Pulsing route glow behind selected line */}
                    {isRouteSelected && (
                      <line
                        x1={mapOrigin.x}
                        y1={mapOrigin.y}
                        x2={coord.x}
                        y2={coord.y}
                        stroke="#2dd4bf"
                        strokeWidth="8"
                        strokeOpacity="0.2"
                        strokeLinecap="round"
                      />
                    )}
                  </g>
                );
              })}

              {/* Source Node (Kanakapura PHC) */}
              <circle cx={mapOrigin.x} cy={mapOrigin.y} r="8" fill="#0d9488" stroke="#ffffff" strokeWidth="2" className="shadow" />
              <text x={mapOrigin.x} y={mapOrigin.y + 20} textAnchor="middle" fill="#0f766e" className="text-[10px] font-bold">
                Kanakapura PHC
              </text>

              {/* Hospital Nodes */}
              {hospitals.map((hosp) => {
                const coord = getMapCoordinates(hosp.id);
                const isSelected = selectedHospital?.id === hosp.id;
                const hasBeds = hosp.icu_beds_available > 0;

                return (
                  <g key={`node-${hosp.id}`} className="cursor-pointer" onClick={() => setSelectedHospital(hosp)}>
                    {/* Ring highlight around node */}
                    {isSelected && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r="16"
                        fill="none"
                        stroke="#0d9488"
                        strokeWidth="2"
                        strokeOpacity="0.6"
                        className="animate-ping"
                      />
                    )}
                    
                    {/* Node Dot */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r="7"
                      fill={hasBeds ? '#10b981' : '#ef4444'} // Green if beds available, red if full
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Label */}
                    <text
                      x={coord.x}
                      y={coord.y - 12}
                      textAnchor="middle"
                      fill={isSelected ? '#0d9488' : '#475569'}
                      className={`text-[8px] font-bold select-none ${isSelected ? 'scale-105 transition-transform' : ''}`}
                    >
                      {hosp.name.split(' District')[0].split(' Taluk')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Travel route HUD Overlay details box */}
            {selectedHospital && (
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur border border-slate-200 p-3 rounded-xl shadow-lg flex justify-between items-center gap-4 animate-fadeIn text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <MapPin className="h-3.5 w-3.5 text-teal-600" />
                    <span>{selectedHospital.name.split(' (')[0]}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    via <strong className="text-teal-600">{getTravelStats(selectedHospital.name).route}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400">{t('hosp_distance')}</span>
                    <p className="font-bold text-slate-800">{getTravelStats(selectedHospital.name).dist}</p>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[9px] uppercase font-bold text-slate-400">{t('hosp_drive')}</span>
                    <p className="font-bold text-teal-600">{getTravelStats(selectedHospital.name).time}</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
