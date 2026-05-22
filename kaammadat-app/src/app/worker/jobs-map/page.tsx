"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JobsMap() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 font-[family-name:var(--font-geist-sans)] flex flex-col">
      <header className="bg-slate-950 text-white p-4 shadow-md flex items-center gap-4 z-10">
        <Link href="/worker/dashboard" className="text-white hover:opacity-80 transition font-black text-xl">←</Link>
        <div className="flex-1">
          <h1 className="font-bold text-xl">Jobs Near Me</h1>
          <p className="text-xs text-slate-400 font-medium">Showing jobs within 10km radius</p>
        </div>
        <button className="bg-slate-800 p-2 rounded-lg text-sm font-bold border border-slate-700">Filters</button>
      </header>

      <main className="flex-1 relative bg-[#1e293b] overflow-hidden flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-slate-400 animate-pulse">
            <span className="text-4xl">🗺️</span>
            <p className="font-bold tracking-widest uppercase text-sm">Initializing Map Data...</p>
          </div>
        ) : (
          <>
            {/* Fake Map Grid Background */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>

            {/* Radar Sweep Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-green-500/30 bg-green-500/5">
              <div className="absolute inset-0 rounded-full border-t-2 border-green-400 animate-[spin_4s_linear_infinite]" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}></div>
            </div>

            {/* User Location Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
              <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-lg mb-1 shadow-lg whitespace-nowrap">You are here</div>
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-full absolute top-6 animate-ping"></div>
            </div>

            {/* Simulated Job Pins */}
            <div className="absolute top-[30%] left-[40%] flex flex-col items-center group cursor-pointer transition transform hover:scale-110 z-20">
              <div className="bg-white text-slate-800 text-xs font-black px-2 py-1 rounded-lg mb-1 shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Plumbing Job - ₹800/day</div>
              <div className="text-3xl filter drop-shadow-md">📍</div>
            </div>

            <div className="absolute top-[60%] left-[65%] flex flex-col items-center group cursor-pointer transition transform hover:scale-110 z-20">
              <div className="bg-white text-slate-800 text-xs font-black px-2 py-1 rounded-lg mb-1 shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Painting Job - ₹1200/day</div>
              <div className="text-3xl filter drop-shadow-md">📍</div>
            </div>

            <div className="absolute top-[45%] left-[25%] flex flex-col items-center group cursor-pointer transition transform hover:scale-110 z-20">
              <div className="bg-white text-slate-800 text-xs font-black px-2 py-1 rounded-lg mb-1 shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Carpentry - ₹1000/day</div>
              <div className="text-3xl filter drop-shadow-md">📍</div>
            </div>

            {/* Map Overlay Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
              <button className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center text-xl font-bold border border-slate-700 shadow-lg">+</button>
              <button className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center text-xl font-bold border border-slate-700 shadow-lg">-</button>
              <button className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-[0_0_15px_rgba(37,99,235,0.5)] mt-4 hover:bg-blue-500 transition">⌖</button>
            </div>
            
            {/* Bottom Info Sheet */}
            <div className="absolute bottom-6 left-6 right-[88px] bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white">
               <h3 className="font-bold">3 Jobs Found Nearby</h3>
               <p className="text-xs text-slate-300 mt-1">Tap on a pin to view details and apply directly.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
