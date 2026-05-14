"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [language, setLanguage] = useState('English');
  const [showSplash, setShowSplash] = useState(true);

  // Splash screen and language load
  useEffect(() => {
    const savedLang = localStorage.getItem('kaammadat_lang');
    if (savedLang) setLanguage(savedLang);

    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLanguageChange = (e: any) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem('kaammadat_lang', newLang);
  };

  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 font-[family-name:var(--font-geist-sans)]">
        <div className="text-center animate-[pulse_2s_ease-in-out_infinite]">
          <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-gray-500 to-green-600 mb-4">
            KAAMMADAT
          </h1>
          <p className="text-sm tracking-[0.3em] text-gray-500 font-bold uppercase mt-8 animate-[slide-up_1s_ease-out]">
            Powered by Team Originn
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 font-[family-name:var(--font-geist-sans)] p-8 relative animate-[fade-in_1s_ease-in]">
      
      {/* Language Selector */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow border border-orange-100">
        <span className="text-xl">🌐</span>
        <select 
          value={language}
          onChange={handleLanguageChange}
          className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
        >
          <option value="English">English</option>
          <option value="Hindi">हिंदी (Hindi)</option>
          <option value="Tamil">தமிழ் (Tamil)</option>
          <option value="Telugu">తెలుగు (Telugu)</option>
          <option value="Marathi">मराठी (Marathi)</option>
        </select>
      </div>

      <main className="flex flex-col items-center gap-8 text-center max-w-2xl mt-8">
        <div className="w-24 h-24 rounded-full border-4 border-blue-600 animate-[spin_10s_linear_infinite] flex items-center justify-center relative shadow-[0_0_15px_rgba(37,99,235,0.5)]">
           {/* Detailed CSS Ashoka Chakra */}
           <div className="absolute inset-2 rounded-full border-2 border-blue-600 border-dashed"></div>
           <div className="absolute inset-4 rounded-full border border-blue-600"></div>
           <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        </div>
        
        <h1 className="text-5xl font-bold text-orange-600 tracking-tight">
          Welcome to Kaammadat
        </h1>
        
        <p className="text-xl text-green-700 font-medium">
          Connecting the workforce of India.
        </p>
        
        <div className="flex gap-4 mt-8">
          <Link href="/worker/register">
            <button className="px-6 py-3 rounded-full bg-orange-500 text-white font-semibold shadow-lg hover:bg-orange-600 transition hover:-translate-y-1">
              I am a Worker
            </button>
          </Link>
          <Link href="/job-giver/register">
            <button className="px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow-lg hover:bg-green-700 transition hover:-translate-y-1">
              I am a Job Giver
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
