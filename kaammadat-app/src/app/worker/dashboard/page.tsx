"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LogoutModal from '@/components/LogoutModal';
import { getJobs } from '@/app/actions/jobActions';
import { indiaLocations } from '@/data/indiaLocations';
import { districtMandals } from '@/data/mandals';

export default function WorkerDashboard() {
  const { t } = useLanguage();
  const [workerName, setWorkerName] = useState('Rahul Kumar');
  const [showLogout, setShowLogout] = useState(false);
  const [workPhotos, setWorkPhotos] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState('');
  const [localJobsCount, setLocalJobsCount] = useState(0);
  // Local Filtering State
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  
  // Applied filters for Search button
  const [appliedState, setAppliedState] = useState('');
  const [appliedDistrict, setAppliedDistrict] = useState('');
  const [appliedMandal, setAppliedMandal] = useState('');
  const [appliedAmount, setAppliedAmount] = useState('');

  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const savedName = localStorage.getItem('kaammadat_user_name');
    if (savedName) setWorkerName(savedName);
    const savedPhotos = localStorage.getItem('kaammadat_work_photos');
    if (savedPhotos) setWorkPhotos(JSON.parse(savedPhotos));
    const savedLocation = localStorage.getItem('kaammadat_user_location');
    if (savedLocation) setUserLocation(savedLocation);

    // Fetch jobs for local filtering
    getJobs().then(data => {
      setJobs(data);
      if (savedLocation) {
        const count = data.filter((j: any) => j.location.toLowerCase().includes(savedLocation.toLowerCase())).length;
        setLocalJobsCount(count);
      }
    });
  }, []);

  const executeLogout = () => {
    localStorage.clear();
    // Delete authentication cookies as well
    document.cookie = "kaammadat_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kaammadat_user_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kaammadat_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = '/';
  };

  // Apply Search
  const handleSearch = () => {
    setAppliedState(selectedState);
    setAppliedDistrict(selectedDistrict);
    setAppliedMandal(selectedMandal);
    setAppliedAmount(selectedAmount);
  };

  const handleClearFilters = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedMandal('');
    setSelectedAmount('');
    setAppliedState('');
    setAppliedDistrict('');
    setAppliedMandal('');
    setAppliedAmount('');
  };

  // Filter Jobs
  const filteredJobs = jobs.filter(job => {
    let match = true;
    const loc = job.location.toLowerCase();
    
    if (appliedState && !loc.includes(appliedState.toLowerCase())) match = false;
    if (appliedDistrict && !loc.includes(appliedDistrict.toLowerCase())) match = false;
    if (appliedMandal && !loc.includes(appliedMandal.toLowerCase())) match = false;
    
    if (appliedAmount) {
      const sal = parseInt(job.salary);
      // Added roughly 20% tolerance to boundaries to include approximate/nearer amounts
      if (appliedAmount === '100-500' && (sal < 80 || sal > 600)) match = false;
      else if (appliedAmount === '500-1000' && (sal < 400 || sal > 1200)) match = false;
      else if (appliedAmount === '1000-5000' && (sal < 800 || sal > 6000)) match = false;
      else if (appliedAmount === '5000-10000' && (sal < 4000 || sal > 12000)) match = false;
    }
    
    return match;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] animate-[fade-in_0.6s_ease-in-out] pb-10">
      {/* Header */}
      <header className="bg-orange-500 text-white p-4 shadow-md flex justify-between items-center">
        <Link href="/worker/profile" className="flex items-center gap-3 hover:opacity-90 transition cursor-pointer">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-orange-200">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(workerName)}&background=random`} alt="Profile" />
          </div>
          <h1 className="font-bold text-xl">Hi, {workerName}</h1>
        </Link>
        <button onClick={() => setShowLogout(true)} className="text-sm font-bold bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-full shadow transition cursor-pointer">
          Logout
        </button>
      </header>

      <main className="p-4 max-w-4xl mx-auto flex flex-col gap-6 mt-6">
        
        {/* Local Notification Banner */}
        {localJobsCount > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 shadow-lg text-white flex justify-between items-center animate-[bounce_1s_ease-in-out]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔔</span>
              <div>
                <h3 className="font-black text-lg">Local Jobs Available!</h3>
                <p className="text-sm font-medium opacity-90">There are {localJobsCount} new jobs posted right in your area.</p>
              </div>
            </div>
            <button onClick={() => { setAppliedState(''); setAppliedDistrict(''); setAppliedMandal(userLocation.split(',')[0].trim()); }} className="bg-white text-green-700 font-bold px-4 py-2 rounded-xl text-sm shadow hover:bg-gray-50 transition cursor-pointer">
              View Now
            </button>
          </div>
        )}

        {/* Welcome Animation Area */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 flex items-center gap-4 animate-[pulse_4s_ease-in-out_infinite]">
          <div className="text-4xl">👋</div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Welcome Back!</h2>
            <p className="text-gray-600 font-medium">Ready to find some work today?</p>
          </div>
        </div>

        {/* Quick Portal Navigation */}
        <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
           <h3 className="text-xl font-black mb-4 text-gray-800">Quick Dashboard Actions</h3>
           <div className="grid grid-cols-2 gap-4">
              <Link href="/worker/search" className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-2xl text-white shadow hover:shadow-orange-100 hover:-translate-y-0.5 transition flex flex-col justify-between h-32 group cursor-pointer">
                 <span className="text-3xl transition group-hover:scale-110 self-start">🔍</span>
                 <span className="font-extrabold text-lg self-end">{t('search_jobs')}</span>
              </Link>
              <Link href="/worker/applied-jobs" className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl text-white shadow hover:shadow-blue-100 hover:-translate-y-0.5 transition flex flex-col justify-between h-32 group cursor-pointer">
                 <span className="text-3xl transition group-hover:scale-110 self-start">📋</span>
                 <span className="font-extrabold text-lg self-end">{t('applied_jobs')}</span>
              </Link>
           </div>
        </section>

        {/* Local Work Finder */}
        <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
           <h3 className="text-xl font-bold mb-4 text-gray-800">Find Local Work Near You</h3>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
             <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDistrict(''); }} className="px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold">
               <option value="">All States</option>
               {Object.keys(indiaLocations).map(state => (
                 <option key={state} value={state}>{state}</option>
               ))}
             </select>
             
             <select value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setSelectedMandal(''); }} className="px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold">
               <option value="">All Districts</option>
               {selectedState && indiaLocations[selectedState]?.map(district => (
                 <option key={district} value={district}>{district}</option>
               ))}
             </select>

             <select value={selectedMandal} onChange={e => setSelectedMandal(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold">
               <option value="">All Mandals</option>
               {selectedDistrict && districtMandals[selectedDistrict]?.map(mandal => (
                 <option key={mandal} value={mandal}>{mandal}</option>
               ))}
             </select>

             <select value={selectedAmount} onChange={e => setSelectedAmount(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold">
               <option value="">Any Amount</option>
               <option value="100-500">₹100 - ₹500</option>
               <option value="500-1000">₹500 - ₹1,000</option>
               <option value="1000-5000">₹1,000 - ₹5,000</option>
               <option value="5000-10000">₹5,000 - ₹10,000</option>
             </select>
           </div>
           
           <div className="mb-6 flex justify-center">
             <button 
               onClick={handleSearch}
               className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-orange-600 transition cursor-pointer flex items-center gap-2"
             >
               <span>🔍</span> Search Local Jobs
             </button>
           </div>

           <div className="flex flex-col gap-4">
             {filteredJobs.length === 0 ? (
                <div className="p-8 text-center bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-orange-800 font-bold">No local works found for these filters.</p>
                  <button onClick={handleClearFilters} className="mt-2 text-sm text-orange-600 font-bold hover:underline cursor-pointer">Clear Filters</button>
                </div>
             ) : (
                filteredJobs.slice(0, 5).map(job => {
                  const isFull = job.cap.includes('FULL');
                  return (
                    <div key={job.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 relative overflow-hidden transition hover:shadow-md cursor-pointer">
                      <div className="w-16 h-16 shrink-0">
                        <img src={job.img} alt={job.type} className="w-full h-full object-cover rounded-full shadow-inner border-2 border-orange-100" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-800 leading-tight">{job.title}</h3>
                          <span className="font-bold text-green-600">₹{job.salary}/day</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="text-orange-500">📍</span> {job.location}
                        </p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isFull ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                            {job.cap}
                          </span>
                          {!isFull ? (
                            <Link href="/worker/job-details">
                              <button 
                                onClick={() => localStorage.setItem('kaammadat_selected_job', JSON.stringify(job))}
                                className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow hover:bg-orange-600 cursor-pointer"
                              >
                                View
                              </button>
                            </Link>
                          ) : (
                            <button className="bg-gray-300 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold cursor-not-allowed">
                              Full
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {isFull && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>}
                    </div>
                  );
                })
             )}
             
             {filteredJobs.length > 5 && (
               <Link href="/worker/search" className="text-center w-full block bg-gray-50 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 transition cursor-pointer">
                 View All {filteredJobs.length} Local Jobs →
               </Link>
             )}
           </div>
        </section>

      </main>


      {/* Reusable Premium Logout Modal Confirmation */}
      <LogoutModal 
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={executeLogout}
      />
    </div>
  );
}
