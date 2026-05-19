"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LogoutModal from '@/components/LogoutModal';
import { getJobs } from '@/app/actions/jobActions';

export default function WorkerDashboard() {
  const { t } = useLanguage();
  const [workerName, setWorkerName] = useState('Rahul Kumar');
  const [showLogout, setShowLogout] = useState(false);
  const [workPhotos, setWorkPhotos] = useState<any[]>([]);
  
  // Local Filtering State
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const savedName = localStorage.getItem('kaammadat_user_name');
    if (savedName) setWorkerName(savedName);
    const savedPhotos = localStorage.getItem('kaammadat_work_photos');
    if (savedPhotos) setWorkPhotos(JSON.parse(savedPhotos));

    // Fetch jobs for local filtering
    getJobs().then(data => setJobs(data));
  }, []);

  const executeLogout = () => {
    localStorage.clear();
    // Delete authentication cookies as well
    document.cookie = "kaammadat_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kaammadat_user_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kaammadat_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = '/';
  };

  // Filter Jobs
  const filteredJobs = jobs.filter(job => {
    let match = true;
    const loc = job.location.toLowerCase();
    
    if (selectedState && !loc.includes(selectedState.toLowerCase())) match = false;
    if (selectedDistrict && !loc.includes(selectedDistrict.toLowerCase())) match = false;
    if (selectedMandal && !loc.includes(selectedMandal.toLowerCase())) match = false;
    
    if (selectedAmount) {
      const sal = parseInt(job.salary);
      if (selectedAmount === '100-500' && (sal < 100 || sal > 500)) match = false;
      else if (selectedAmount === '500-1000' && (sal < 500 || sal > 1000)) match = false;
      else if (selectedAmount === '1000-5000' && (sal < 1000 || sal > 5000)) match = false;
      else if (selectedAmount === '5000-10000' && (sal < 5000 || sal > 10000)) match = false;
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
             <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold">
               <option value="">All States</option>
               <option value="maharashtra">Maharashtra</option>
               <option value="up">Uttar Pradesh</option>
               <option value="delhi">Delhi</option>
               <option value="karnataka">Karnataka</option>
               <option value="kashmir">Jammu & Kashmir</option>
               <option value="ap">Andhra Pradesh</option>
               <option value="telangana">Telangana</option>
             </select>
             
             <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold">
               <option value="">All Districts</option>
               <option value="mumbai">Mumbai</option>
               <option value="pune">Pune</option>
               <option value="lucknow">Lucknow</option>
               <option value="bangalore">Bangalore</option>
               <option value="srinagar">Srinagar</option>
               <option value="hyderabad">Hyderabad</option>
               <option value="vizag">Vizag</option>
             </select>

             <select value={selectedMandal} onChange={e => setSelectedMandal(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold">
               <option value="">All Mandals</option>
               <option value="mandal-1">Mandal 1</option>
               <option value="mandal-2">Mandal 2</option>
               <option value="mandal-3">Mandal 3</option>
             </select>

             <select value={selectedAmount} onChange={e => setSelectedAmount(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold">
               <option value="">Any Amount</option>
               <option value="100-500">₹100 - ₹500</option>
               <option value="500-1000">₹500 - ₹1,000</option>
               <option value="1000-5000">₹1,000 - ₹5,000</option>
               <option value="5000-10000">₹5,000 - ₹10,000</option>
             </select>
           </div>

           <div className="flex flex-col gap-4">
             {filteredJobs.length === 0 ? (
                <div className="p-8 text-center bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-orange-800 font-bold">No local works found for these filters.</p>
                  <button onClick={() => { setSelectedState(''); setSelectedDistrict(''); setSelectedMandal(''); setSelectedAmount(''); }} className="mt-2 text-sm text-orange-600 font-bold hover:underline cursor-pointer">Clear Filters</button>
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

        {/* Loyalty Cards Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 text-9xl -mt-4 mr-4">⭐</div>
          <h3 className="text-xl font-bold mb-1">{t('loyalty_card')}</h3>
          <p className="text-sm text-gray-300 mb-4">Your current tier and benefits</p>
          
          <div className="bg-gradient-to-br from-gray-300 to-gray-400 w-full max-w-sm rounded-xl p-4 shadow-inner text-gray-900 border border-gray-400">
             <div className="flex justify-between items-start">
                <span className="font-bold tracking-widest uppercase">Silver Tier</span>
                <span className="text-xs font-bold">KAAMMADAT</span>
             </div>
             <div className="mt-6">
                <p className="font-mono text-lg">**** **** **** 1029</p>
                <div className="flex justify-between items-end mt-2">
                   <p className="text-sm font-semibold uppercase">{workerName}</p>
                   <p className="text-xs font-bold bg-white px-2 py-1 rounded">3% OFF</p>
                </div>
             </div>
          </div>
        </section>

        {/* Work Portfolio Preview */}
        <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black text-gray-800">📸 My Work Portfolio</h3>
            <Link href="/worker/profile" className="text-orange-500 text-xs font-extrabold hover:underline">
              {workPhotos.length > 0 ? `View All (${workPhotos.length})` : '+ Add Photos'}
            </Link>
          </div>
          {workPhotos.length === 0 ? (
            <Link href="/worker/profile">
              <div className="border-2 border-dashed border-orange-200 rounded-xl p-6 text-center cursor-pointer hover:bg-orange-50 transition">
                <p className="text-3xl mb-2">📷</p>
                <p className="text-gray-500 font-bold text-sm">No work photos yet</p>
                <p className="text-xs text-orange-500 font-semibold mt-1">Tap to upload your first work photo →</p>
              </div>
            </Link>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {workPhotos.slice(0, 6).map((photo: any) => (
                <Link key={photo.id} href="/worker/profile">
                  <div className="h-24 rounded-xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:opacity-90 transition">
                    <img src={photo.dataUrl} alt={photo.desc} className="w-full h-full object-cover" />
                  </div>
                </Link>
              ))}
            </div>
          )}
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
