"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getJobs } from '@/app/actions/jobActions';

export default function JobSearch() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    // Fetch live jobs from the database
    getJobs().then((data) => setJobs(data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] pb-10">
      {/* Header */}
      <header className="bg-orange-500 text-white p-4 shadow-md sticky top-0 z-10 flex gap-4 items-center">
        <Link href="/worker/dashboard" className="font-bold text-xl hover:bg-orange-600 p-2 rounded-full transition">←</Link>
        <div className="flex-1">
           <input type="text" placeholder="Search works (e.g., Electrician in Kashmir)..." className="w-full px-4 py-2 rounded-full text-gray-800 outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto mt-4">
        
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
          <button className="whitespace-nowrap px-4 py-1.5 bg-orange-100 text-orange-800 font-semibold rounded-full border border-orange-200">All India</button>
          <button className="whitespace-nowrap px-4 py-1.5 bg-white text-gray-600 rounded-full border border-gray-200">Electrician</button>
          <button className="whitespace-nowrap px-4 py-1.5 bg-white text-gray-600 rounded-full border border-gray-200">Carpenter</button>
          <button className="whitespace-nowrap px-4 py-1.5 bg-white text-gray-600 rounded-full border border-gray-200">Catering</button>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mt-2 mb-4">Available Works</h2>

        <div className="flex flex-col gap-4">
          {jobs.map(job => {
            const isFull = job.cap.includes('FULL');
            return (
              <div key={job.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 relative overflow-hidden transition hover:shadow-md cursor-pointer">
                
                {/* Circular Theme Image */}
                <div className="w-20 h-20 shrink-0">
                  <img src={job.img} alt={job.type} className="w-full h-full object-cover rounded-full shadow-inner border-2 border-orange-100" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">{job.title}</h3>
                    <span className="font-bold text-green-600">₹{job.salary}/day</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <span className="text-orange-500">📍</span> {job.location}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="text-blue-500">📅</span> {job.date}
                  </p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${isFull ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                      {job.cap}
                    </span>
                    {!isFull ? (
                       <Link href="/worker/job-details">
                         <button 
                           onClick={() => localStorage.setItem('kaammadat_selected_job', JSON.stringify(job))}
                           className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow hover:bg-orange-600 cursor-pointer"
                         >
                           View & Apply
                         </button>
                       </Link>
                    ) : (
                       <button className="bg-gray-300 text-gray-500 px-4 py-1.5 rounded-lg text-sm font-bold cursor-not-allowed">
                         Completed
                       </button>
                    )}
                  </div>
                </div>

                {isFull && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
