"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getJobs } from '@/app/actions/jobActions';
import MapWrapper from '@/components/MapWrapper';

export default function JobsMap() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Default to a central location or user's last known
  const userLocation = [34.0836, 74.7973]; 

  useEffect(() => {
    async function loadJobs() {
      try {
        const fetchedJobs = await getJobs();
        // Filter jobs with valid coordinates
        const mapJobs = fetchedJobs.filter((j: any) => j.lat && j.lng);
        setJobs(mapJobs);
      } catch (err) {
        console.error("Failed to load jobs for map", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 font-[family-name:var(--font-geist-sans)] flex flex-col">
      <header className="bg-slate-950 text-white p-4 shadow-md flex items-center gap-4 z-10 relative">
        <Link href="/part-time-worker/dashboard" className="text-white hover:opacity-80 transition font-black text-xl">←</Link>
        <div className="flex-1">
          <h1 className="font-bold text-xl">Jobs Near Me</h1>
          <p className="text-xs text-slate-400 font-medium">Showing {jobs.length} jobs nearby</p>
        </div>
        <button className="bg-slate-800 p-2 rounded-lg text-sm font-bold border border-slate-700">Filters</button>
      </header>

      <main className="flex-1 relative bg-[#1e293b] flex flex-col z-0">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400 animate-pulse">
            <span className="text-4xl">🗺️</span>
            <p className="font-bold tracking-widest uppercase text-sm">Initializing Map Data...</p>
          </div>
        ) : (
          <div className="flex-1 w-full relative">
             <MapWrapper jobs={jobs} center={userLocation} zoom={13} userLocation={userLocation} />
             
             {/* Bottom Info Sheet Overlay */}
             <div className="absolute bottom-6 left-4 right-4 md:left-6 md:right-[88px] bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl text-white z-[1000] shadow-xl">
               <h3 className="font-bold text-lg">{jobs.length} Jobs Found Nearby</h3>
               <p className="text-xs text-slate-300 mt-1">Tap on a pin to view details and apply directly.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
