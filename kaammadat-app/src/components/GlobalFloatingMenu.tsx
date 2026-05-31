"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, languages } from '@/context/LanguageContext';
import { usePathname } from 'next/navigation';

export default function GlobalFloatingMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();

  // User details for Loyalty Card
  const [userData, setUserData] = useState({
    name: 'Rahul Kumar',
    mobile: '9999999999',
    location: 'Mumbai, Maharashtra',
    type: 'Worker',
    photo: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('kaammadat_user_name') || 'Premium User';
      const mobile = localStorage.getItem('kaammadat_user_mobile') || '9999999999';
      const location = localStorage.getItem('kaammadat_user_location') || 'Mumbai, Maharashtra';
      const type = localStorage.getItem('kaammadat_user_type') || 'Worker';
      const photo = localStorage.getItem('kaammadat_user_photo') || 
                    localStorage.getItem('kaammadat_pt_worker_photo') || 
                    localStorage.getItem('kaammadat_pt_job_giver_photo') || '';
      
      let formattedType = 'Daily Worker';
      if (type === 'job-giver') formattedType = 'Daily Job Giver';
      else if (type === 'part-time-worker') formattedType = 'Part-Time Worker';
      else if (type === 'part-time-job-giver') formattedType = 'Part-Time Job Giver';

      setUserData({
        name,
        mobile,
        location,
        type: formattedType,
        photo,
      });
    }
  }, [showCard]);

  useEffect(() => {
    const handleOpenCard = () => {
      setShowCard(true);
      setMenuOpen(false);
    };
    window.addEventListener('open-loyalty-card', handleOpenCard);
    return () => window.removeEventListener('open-loyalty-card', handleOpenCard);
  }, []);

  // Only appear on user dashboards
  if (!pathname?.includes('/dashboard')) {
    return null;
  }

  // Determine subroute dynamically based on active dashboard path
  let baseRoute = '/worker';
  if (pathname.includes('/part-time-worker')) {
    baseRoute = '/part-time-worker';
  } else if (pathname.includes('/part-time-job-giver')) {
    baseRoute = '/part-time-job-giver';
  } else if (pathname.includes('/job-giver')) {
    baseRoute = '/job-giver';
  }

  const maskedCardNum = `KMD-${userData.mobile.slice(0, 4)}-XXXX-${userData.mobile.slice(6, 10)}`;
  const isGiver = userData.type.toLowerCase().includes('giver') || userData.type.toLowerCase().includes('employer');

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100]">
        {menuOpen && (
          <div className="absolute bottom-20 right-0 bg-white/95 backdrop-blur-md border border-gray-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-5 w-80 origin-bottom-right transition-all animate-[fade-in-up_0.2s_ease-out]">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h4 className="text-gray-800 font-extrabold tracking-tight">App Tools</h4>
              
              {/* Full 20-Language Selector Dropdown */}
              <div className="relative">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-inner outline-none cursor-pointer border border-gray-200"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
              <Link href={`${baseRoute}/profile`} onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                <div className="bg-orange-50 text-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition group-hover:scale-110 group-hover:bg-orange-100 shadow-sm border border-orange-100 group-hover:shadow-md">📸</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-orange-600 transition">Photos</span>
              </Link>
              <Link href={`${baseRoute}/statistics`} onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                <div className="bg-blue-50 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition group-hover:scale-110 group-hover:bg-blue-100 shadow-sm border border-blue-100 group-hover:shadow-md">📊</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-blue-600 transition">Stats</span>
              </Link>
              <Link href={`${baseRoute}/voice-search`} onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                <div className="bg-green-50 text-green-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition group-hover:scale-110 group-hover:bg-green-100 shadow-sm border border-green-100 group-hover:shadow-md">🎙️</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-green-600 transition">Voice</span>
              </Link>
              <Link href={`${baseRoute}/verification`} onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                <div className="bg-purple-50 text-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition group-hover:scale-110 group-hover:bg-purple-100 shadow-sm border border-purple-100 group-hover:shadow-md">✅</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-purple-600 transition">Verify</span>
              </Link>
              <Link href={`${baseRoute}/jobs-map`} onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                <div className="bg-red-50 text-red-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition group-hover:scale-110 group-hover:bg-red-100 shadow-sm border border-red-100 group-hover:shadow-md">🗺️</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-red-600 transition">Map</span>
              </Link>
              
              {/* Workforce / Giver Loyalty Card Button option */}
              <button 
                onClick={() => { setShowCard(true); setMenuOpen(false); }} 
                className="flex flex-col items-center gap-1 group focus:outline-none"
              >
                <div className="bg-yellow-50 text-yellow-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition group-hover:scale-110 group-hover:bg-yellow-100 shadow-sm border border-yellow-100 group-hover:shadow-md">🏅</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-yellow-600 transition">Card</span>
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 transform border-[3px] border-white z-50 relative ${menuOpen ? 'rotate-90 scale-95 bg-gray-900 text-white shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:bg-black' : 'bg-orange-500 text-white shadow-[0_8px_30px_rgb(249,115,22,0.5)] hover:scale-110 hover:bg-orange-600'}`}
          title="Global Tools Menu"
        >
          <span className="text-3xl font-black">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Gorgeous Glassmorphic Loyalty Card Modal */}
      {showCard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-[fade-in_0.3s_ease-out]">
          <div className="relative w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden p-6 text-white flex flex-col items-center gap-6 animate-[scale-up_0.3s_ease-out]">
            
            {/* Background glowing lights */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/30 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/30 rounded-full blur-[80px]"></div>

            {/* Close Button */}
            <button 
              onClick={() => setShowCard(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all transform hover:scale-110 font-bold outline-none cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-300">
              {isGiver ? "PATRON LOYALTY CARD" : "WORKFORCE LOYALTY CARD"}
            </h3>

            {/* Conditionally render the two card styles */}
            {!userData.type.includes('Part-Time') ? (
              /* 1. Daily Works Card Style (Solid Gold/Bronze Card Style) */
              <div className="w-full bg-gradient-to-br from-yellow-600 via-amber-700 to-yellow-800 border-2 border-yellow-400 p-5 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between h-56">
                
                {/* Header: logo on left, Gold Badge on right (re-aligned to prevent overlap & removed credit chip) */}
                <div className="flex justify-between items-center z-10 w-full mb-1">
                  <span className="font-black text-sm tracking-widest text-amber-100">KAAMMADAT</span>
                  <div className="bg-white text-yellow-900 text-[10px] font-black px-3 py-1.5 rounded-md shadow border border-yellow-100 shrink-0">
                    {isGiver ? "👑 GOLD PATRON" : "🏆 GOLD WORKER"}
                  </div>
                </div>

                {/* Profile & Info */}
                <div className="flex gap-4 items-center mt-3 z-10">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-200 shrink-0 bg-amber-900/40 flex items-center justify-center">
                    {userData.photo ? (
                      <img src={userData.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-extrabold text-base tracking-wide text-white leading-tight">{userData.name}</h4>
                    <p className="text-[11px] text-yellow-200 font-bold">{userData.type}</p>
                    <p className="text-[10px] text-amber-100 font-medium truncate max-w-[200px]">📍 {userData.location}</p>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex justify-between items-end mt-4 pt-2 border-t border-amber-500/30 z-10">
                  <span className="font-mono text-sm tracking-widest text-amber-100 font-black">{maskedCardNum}</span>
                  <span className="text-[9px] font-bold text-amber-200 uppercase">Daily Works Card</span>
                </div>

                {/* Micro shine reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            ) : (
              /* 2. Part-Time Card Style (Dark Navy Cyan Glassmorphic Card Style) */
              <div className="w-full bg-gradient-to-br from-[#0b172a] via-[#10243e] to-[#07101e] border border-cyan-500/30 p-5 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between h-56">
                
                {/* Header: logo on left, Gold Badge on right (re-aligned to prevent overlap & removed credit chip) */}
                <div className="flex justify-between items-center z-10 w-full mb-1">
                  <span className="font-black text-sm tracking-widest text-cyan-300">KAAMMADAT</span>
                  <div className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-md shadow border border-cyan-200 shrink-0">
                    {isGiver ? "👑 GOLD PATRON" : "🏆 GOLD WORKER"}
                  </div>
                </div>

                {/* Profile & Info */}
                <div className="flex gap-4 items-center mt-3 z-10">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 shrink-0 bg-slate-800 flex items-center justify-center">
                    {userData.photo ? (
                      <img src={userData.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-extrabold text-base tracking-wide text-white leading-tight">{userData.name}</h4>
                    <p className="text-[11px] text-cyan-400 font-bold">{userData.type}</p>
                    <p className="text-[10px] text-slate-300 font-medium truncate max-w-[200px]">📍 {userData.location}</p>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex justify-between items-end mt-4 pt-2 border-t border-white/10 z-10">
                  <span className="font-mono text-sm tracking-widest text-slate-300 font-black">{maskedCardNum}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Part-Time Works Card</span>
                </div>

                {/* Micro shine reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            )}

            {/* Tier Benefits */}
            <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10">
              <h4 className="text-yellow-400 font-black text-xs uppercase tracking-wider mb-2">✨ Active Tier Benefits</h4>
              <ul className="text-xs text-slate-200 space-y-1.5 font-semibold list-disc pl-4">
                <li>Priority Local Placement Benefits</li>
                <li>Instant Digital KYC badge Verification</li>
                <li>Zero-cost Address Delivery for Physical Post Card</li>
                <li>Government Welfare Scheme Assist Access</li>
              </ul>
            </div>
            
            <button 
              onClick={() => setShowCard(false)}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-extrabold py-3 rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95 text-sm cursor-pointer border-t border-white/20"
            >
              Close Loyalty Card
            </button>
          </div>
        </div>
      )}
    </>
  );
}
