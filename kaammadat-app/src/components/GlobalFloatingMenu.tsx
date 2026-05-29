"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { usePathname } from 'next/navigation';

export default function GlobalFloatingMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [isFreshOpen, setIsFreshOpen] = useState(false);

  // Trigger animation only once per session on dashboard
  useEffect(() => {
    if (typeof window !== 'undefined' && pathname?.includes('/dashboard')) {
      const seen = sessionStorage.getItem('kaammadat_seen_menu_walker');
      if (!seen) {
        setIsFreshOpen(true);
        sessionStorage.setItem('kaammadat_seen_menu_walker', 'true');
      }
    }
  }, [pathname]);
  
  const toggleLanguage = () => {
    const newLang = language === 'English' ? 'Hindi' : (language === 'Hindi' ? 'Telugu' : 'English');
    setLanguage(newLang as any);
  };

  const langLabel = language === 'English' ? 'EN' : language === 'Hindi' ? 'HI' : language === 'Telugu' ? 'TE' : language.slice(0, 2).toUpperCase();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-end">
      {/* The Walking Cartoon Person */}
      {isFreshOpen && (
        <div className="animate-[walk-and-lean_3s_cubic-bezier(0.25,1,0.5,1)_forwards] mr-4 h-32 opacity-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/cartoon_worker.png" 
            alt="Cartoon Worker"
            className="h-full object-contain drop-shadow-xl"
          />
        </div>
      )}

      <div className="relative">
        {menuOpen && (
          <div className="absolute bottom-20 right-0 bg-white/95 backdrop-blur-md border border-gray-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-5 w-80 origin-bottom-right transition-all animate-[fade-in-up_0.2s_ease-out]">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <h4 className="text-gray-800 font-extrabold tracking-tight">App Tools & Jobs</h4>
              
              <button 
                onClick={toggleLanguage}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 shadow-inner"
                title="Change Language"
              >
                <span>🌐</span> {langLabel}
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-x-2 gap-y-4">
              <Link href="/worker/profile" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                <div className="bg-orange-50 text-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition group-hover:scale-110 group-hover:bg-orange-100 shadow-sm border border-orange-100 group-hover:shadow-md">📸</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-orange-600 transition">Photos</span>
              </Link>
              <Link href="/worker/statistics" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition group-hover:scale-110 group-hover:bg-blue-100 shadow-sm border border-blue-100 group-hover:shadow-md">📊</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-blue-600 transition">Stats</span>
              </Link>
              <Link href="/worker/voice-search" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                <div className="bg-green-50 text-green-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition group-hover:scale-110 group-hover:bg-green-100 shadow-sm border border-green-100 group-hover:shadow-md">🎙️</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-green-600 transition">Voice</span>
              </Link>
              <Link href="/worker/verification" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                <div className="bg-purple-50 text-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition group-hover:scale-110 group-hover:bg-purple-100 shadow-sm border border-purple-100 group-hover:shadow-md">✅</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-purple-600 transition">Verify</span>
              </Link>
              <Link href="/worker/jobs-map" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                <div className="bg-red-50 text-red-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition group-hover:scale-110 group-hover:bg-red-100 shadow-sm border border-red-100 group-hover:shadow-md">🗺️</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-red-600 transition">Map</span>
              </Link>
              <Link href="/worker/messages" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                <div className="bg-teal-50 text-teal-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition group-hover:scale-110 group-hover:bg-teal-100 shadow-sm border border-teal-100 group-hover:shadow-md">💬</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-hover:text-teal-600 transition">Chat</span>
              </Link>
              <Link href="/part-time-worker/register" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group col-span-2">
                <div className="bg-indigo-50 text-indigo-600 w-full h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition group-hover:scale-105 group-hover:bg-indigo-100 shadow-sm border border-indigo-100 group-hover:shadow-md">
                  💼 PT Worker
                </div>
              </Link>
              <Link href="/part-time-job-giver/register" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 group col-span-2">
                <div className="bg-amber-50 text-amber-600 w-full h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition group-hover:scale-105 group-hover:bg-amber-100 shadow-sm border border-amber-100 group-hover:shadow-md">
                  🏢 PT Giver
                </div>
              </Link>
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
    </div>
  );
}
