"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getJobs } from '@/app/actions/jobActions';

export default function PostedJobs() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobs().then((data) => {
      const myJobs = data.filter((job: any) => job.giver === "Anand Sharma");
      setJobs(myJobs);
      setLoading(false);
    });
  }, []);

  const handleToggleJobStatus = (id: number) => {
    // Local state toggle simulation
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === id
          ? { ...job, closed: !job.closed }
          : job
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] animate-[fade-in_0.6s_ease-in-out] pb-12">
      {/* Header */}
      <header className="bg-green-600 text-white p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/job-giver/dashboard" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-lg transition cursor-pointer">
            ←
          </Link>
          <h1 className="font-extrabold text-2xl tracking-tight">{t('posted_jobs')}</h1>
        </div>
        <Link href="/job-giver/post-job">
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow transition cursor-pointer">
            + Post Work
          </button>
        </Link>
      </header>

      <main className="p-4 max-w-3xl mx-auto flex flex-col gap-5 mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></span>
            <p className="text-gray-500 mt-4 font-bold">Loading your posted works...</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div 
              key={job.id} 
              className={`bg-white rounded-2xl p-5 shadow-md border border-gray-100 flex gap-4 items-center hover:shadow-lg transition group relative ${job.closed ? 'opacity-60' : ''}`}
            >
              {/* Job Image */}
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={job.img} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>

              {/* Job Info */}
              <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-start mb-1">
                   <h3 className="font-extrabold text-lg text-gray-800 truncate">{job.title}</h3>
                   <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${job.closed ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                     {job.closed ? 'Closed' : 'Active'}
                   </span>
                 </div>
                 <p className="text-xs text-gray-500 font-semibold mb-2">
                   📅 {job.date} • 📍 Srinagar, Kashmir
                 </p>
                 <div className="flex items-center justify-between mt-2">
                   <span className="text-orange-600 text-xs font-bold bg-orange-50 px-2 py-1 rounded border border-orange-100 shadow-sm">
                     ₹{job.salary}/day
                   </span>
                   <span className="text-xs font-bold text-gray-400">
                     Capacity: {job.cap}
                   </span>
                 </div>
              </div>

              {/* Action Toggle Button */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => handleToggleJobStatus(job.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                    job.closed 
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-md' 
                      : 'bg-white hover:bg-gray-100 text-red-600 border-red-200'
                  }`}
                >
                  {job.closed ? 'Re-open' : 'Close Position'}
                </button>
              </div>
            </div>
          ))
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-inner text-gray-400">
            <span className="text-6xl block mb-3">📁</span>
            <p className="font-bold">You haven't posted any jobs yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
