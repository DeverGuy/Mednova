'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { LogOut, Users, Search, ScanLine, ArrowRight, MapPin, Pill } from 'lucide-react';

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchId, setSearchId] = useState('');
  
  // Medicine Locator State
  const [medicineSearch, setMedicineSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadData() {
      const currentUser = await db.getCurrentUserV2();
      if (!currentUser || currentUser.role !== 'doctor') {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      const pData = await db.getAllPatientsV2();
      setPatients(pData);
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await db.logoutV2();
    router.push('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      router.push(`/patient/${searchId.trim()}`);
    }
  };

  const handleMedicineSearch = async (e) => {
    e.preventDefault();
    if (!medicineSearch.trim()) return;
    setIsSearching(true);
    const results = await db.searchMedicineAvailability(medicineSearch.trim());
    
    // Sort by distance if location is available
    if (myLocation) {
      results.forEach(r => {
        if (r.centre.latitude && r.centre.longitude) {
          r.distanceKm = getDistanceFromLatLonInKm(myLocation.lat, myLocation.lng, r.centre.latitude, r.centre.longitude);
        }
      });
      results.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
    }
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMyLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  if (!user) return <div className="p-8 text-center text-teal-600 font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Healthcare Worker Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Logged in as {user.id}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Action Panel */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-teal-600" /> Patient Lookup
              </h3>
              <p className="text-xs text-slate-500">Scan a patient's QR code or manually enter their ID to view records and add vitals.</p>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input 
                  type="text" 
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  placeholder="Enter Patient ID (e.g. PAT-XXXX)"
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none"
                />
                <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
            
            <div className="bg-teal-50 p-6 rounded-2xl shadow-sm border border-teal-100">
              <h4 className="font-bold text-teal-800 mb-2">Instructions</h4>
              <ul className="text-xs text-teal-700 space-y-2 list-disc pl-4">
                <li>When a patient arrives, scan their QR code.</li>
                <li>Review their symptoms and description.</li>
                <li>Take their vitals and input them into the system.</li>
                <li>Both you and the patient can see the updated records instantly.</li>
              </ul>
            </div>
          </div>

          {/* Patients List */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <Users className="h-5 w-5 text-teal-600" /> Recent Patients Directory
            </h3>
            
            {patients.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No patients registered yet.</div>
            ) : (
              <div className="space-y-3">
                {patients.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500">ID: {p.id} • {p.age} yrs, {p.gender}</p>
                    </div>
                    <button 
                      onClick={() => router.push(`/patient/${p.id}`)}
                      className="flex items-center gap-1 bg-white border border-slate-300 hover:border-teal-500 hover:text-teal-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                      View <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Medicine Locator */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Pill className="h-5 w-5 text-teal-600" /> Medicine Locator Network
            </h3>
            <button 
              onClick={getLocation}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${myLocation ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            >
              <MapPin className="h-4 w-4" /> {myLocation ? "Location Active" : "Use My GPS Location"}
            </button>
          </div>
          
          <form onSubmit={handleMedicineSearch} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={medicineSearch}
              onChange={e => setMedicineSearch(e.target.value)}
              placeholder="Search for a medicine (e.g. Paracetamol)..."
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:border-teal-500 outline-none"
            />
            <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Find Stock'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:border-teal-300 hover:shadow-sm transition-all bg-slate-50">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{result.medicine.name}</h4>
                    <p className="text-xs text-slate-500">{result.medicine.manufacturer}</p>
                  </div>
                  
                  <div className="bg-teal-50 text-teal-800 p-2 rounded-lg inline-block text-sm font-bold border border-teal-100">
                    Stock Available: {result.stock_level}
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-slate-200">
                    <p className="font-bold text-slate-700 text-sm flex items-center gap-1">
                      {result.centre.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{result.centre.type.replace('_', ' ').toUpperCase()} • {result.centre.contact_number}</p>
                    
                    {result.distanceKm !== undefined && (
                      <p className="text-sm font-semibold text-orange-600 mt-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> 
                        {result.distanceKm.toFixed(1)} km away
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchResults.length === 0 && medicineSearch && !isSearching && (
            <div className="text-center py-8 text-slate-500 text-sm">No stock found for this medicine in the network.</div>
          )}
        </div>

      </div>
    </div>
  );
}
