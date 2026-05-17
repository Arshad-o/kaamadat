"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, languages } from '@/context/LanguageContext';

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);

  // Splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as any);
  };

  const spokes = Array.from({ length: 24 }, (_, i) => i);

  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 font-[family-name:var(--font-geist-sans)]">
        <div className="text-center animate-[pulse_2s_ease-in-out_infinite]">
          <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-gray-600 to-green-600 mb-4 drop-shadow-sm">
            KAAMMADAT
          </h1>
          <p className="text-xs tracking-[0.35em] text-gray-500 font-bold uppercase mt-8 animate-[slide-up_1s_ease-out]">
            {t('powered_by')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50 font-[family-name:var(--font-geist-sans)] p-8 relative animate-[fade-in_0.8s_ease-in-out]">
      
      {/* Language Selector */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow border border-orange-100 transition hover:shadow-md">
        <span className="text-lg">🌐</span>
        <select 
          value={language}
          onChange={handleLanguageChange}
          className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer pr-1"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <main className="flex flex-col items-center gap-8 text-center max-w-2xl mt-8">
        {/* Geometrically Correct SVG Ashoka Dharma Chakra */}
        <div className="w-28 h-28 flex items-center justify-center rounded-full bg-white p-2 shadow-lg border border-blue-50">
          <svg 
            className="w-full h-full text-blue-900 animate-[spin_25s_linear_infinite]" 
            viewBox="0 0 100 100" 
            fill="none" 
            stroke="currentColor"
          >
            {/* Outer ring */}
            <circle cx="50" cy="50" r="46" strokeWidth="3.5" />
            {/* Inner ring */}
            <circle cx="50" cy="50" r="40" strokeWidth="1" />
            {/* Center hub */}
            <circle cx="50" cy="50" r="7.5" strokeWidth="1.5" fill="currentColor" />
            <circle cx="50" cy="50" r="2.5" fill="white" />
            {/* 24 Spokes */}
            {spokes.map((spoke) => {
              const angle = (spoke * 15 * Math.PI) / 180;
              const x2 = 50 + 40 * Math.sin(angle);
              const y2 = 50 - 40 * Math.cos(angle);
              return (
                <line
                  key={spoke}
                  x1="50"
                  y1="50"
                  x2={x2}
                  y2={y2}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
            {/* 24 Edge dots */}
            {spokes.map((spoke) => {
              const angle = (spoke * 15 * Math.PI) / 180;
              const x = 50 + 43 * Math.sin(angle);
              const y = 50 - 43 * Math.cos(angle);
              return (
                <circle
                  key={`dot-${spoke}`}
                  cx={x}
                  cy={y}
                  r="1.2"
                  fill="currentColor"
                />
              );
            })}
          </svg>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-orange-600 tracking-tight drop-shadow-sm">
            {t('welcome')}
          </h1>
          <p className="text-xl text-green-700 font-bold tracking-wide">
            {t('subtitle')}
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="flex gap-4">
            <Link href="/worker/register">
              <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer text-base">
                {t('i_am_worker')}
              </button>
            </Link>
            <Link href="/job-giver/register">
              <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-bold shadow-lg hover:shadow-green-200 hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer text-base">
                {t('i_am_giver')}
              </button>
            </Link>
          </div>

          {/* Admin Login Button */}
          <Link href="/admin/dashboard" className="mt-4">
            <button className="px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-md transition hover:-translate-y-0.5 flex items-center gap-2 text-sm cursor-pointer">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              {t('admin_login')}
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}

