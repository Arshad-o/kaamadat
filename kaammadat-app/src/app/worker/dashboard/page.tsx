"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LogoutModal from '@/components/LogoutModal';

export default function WorkerDashboard() {
  const { t } = useLanguage();
  const [workerName, setWorkerName] = useState('Rahul Kumar');
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('kaammadat_user_name');
    if (savedName) setWorkerName(savedName);
  }, []);

  const executeLogout = () => {
    localStorage.clear();
    // Delete authentication cookies as well
    document.cookie = "kaammadat_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kaammadat_user_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kaammadat_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] animate-[fade-in_0.6s_ease-in-out]">
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

        {/* Job Search Area */}
        <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
           <h3 className="text-xl font-bold mb-4 text-gray-800">{t('search_jobs')}</h3>
           <div className="flex gap-2">
             <input type="text" placeholder="e.g., Electrician, Carpenter..." className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-medium transition" />
             <Link href="/worker/search">
               <button className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition h-full flex items-center justify-center cursor-pointer">Search</button>
             </Link>
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
