"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getJobs } from '@/app/actions/jobActions';

export default function JobGiverDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    // Only fetch jobs that belong to this giver
    getJobs().then((data) => {
      const myJobs = data.filter((job: any) => job.giver === "Anand Sharma");
      setJobs(myJobs);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 font-bold">
             A
          </div>
          <h1 className="font-bold text-xl">Hi, Anand Sharma</h1>
        </div>
        <button className="text-sm font-semibold hover:underline">Logout</button>
      </header>

      <main className="p-4 max-w-4xl mx-auto flex flex-col gap-6 mt-6">
        
        {/* Welcome Animation Area */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex items-center gap-4 animate-[pulse_3s_ease-in-out_infinite]">
          <div className="text-4xl">🏢</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
            <p className="text-gray-600">You have {jobs.length} active job postings.</p>
          </div>
        </div>

        {/* Action Bar */}
        <Link href="/job-giver/post-job" className="w-full block">
          <button className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 transition text-lg">
             + Post a New Job
          </button>
        </Link>

        {/* Loyalty Cards Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 text-9xl -mt-4 mr-4">💼</div>
          <h3 className="text-xl font-bold mb-1">My Cards</h3>
          <p className="text-sm text-gray-300 mb-4">Your current tier and benefits</p>
          
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 w-full max-w-sm rounded-xl p-4 shadow-inner text-white border border-yellow-500">
             <div className="flex justify-between items-start">
               <span className="font-bold tracking-widest uppercase">Gold Tier</span>
               <span className="text-xs font-bold">KAAMMADAT</span>
             </div>
             <div className="mt-6">
                <p className="font-mono text-lg">**** **** **** 8821</p>
                <div className="flex justify-between items-end mt-2">
                   <p className="text-sm font-semibold uppercase">Anand Sharma</p>
                   <p className="text-xs font-bold bg-white text-yellow-800 px-2 py-1 rounded">5% OFF POSTING</p>
                </div>
             </div>
          </div>
        </section>

        {/* Posted Jobs Area */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
           <h3 className="text-xl font-bold mb-4 text-gray-800">My Job Postings</h3>
           
           {jobs.length === 0 ? (
             <div className="text-center py-8 text-gray-400">
               <div className="text-5xl mb-3">📁</div>
               <p>You haven't posted any jobs yet.</p>
             </div>
           ) : (
             <div className="flex flex-col gap-4">
               {jobs.map(job => (
                 <div key={job.id} className="border border-gray-200 rounded-xl p-4 flex gap-4 items-center">
                   <div className="w-16 h-16 shrink-0">
                     <img src={job.img} alt={job.type} className="w-full h-full object-cover rounded-full border-2 border-orange-100" />
                   </div>
                   <div className="flex-1">
                     <h4 className="font-bold text-lg text-gray-800">{job.title}</h4>
                     <p className="text-sm text-gray-500">{job.date}</p>
                     <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded mt-2 inline-block">
                       {job.cap}
                     </span>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </section>

      </main>
    </div>
  );
}
