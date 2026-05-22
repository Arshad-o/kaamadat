"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getJobs } from '@/app/actions/jobActions';

interface Applicant {
  jobId: number;
  jobTitle: string;
  workerName: string;
  workerEmail: string;
  workerPhotos: { id: number; dataUrl: string; desc: string; uploadedAt: string }[];
  appliedAt: string;
}

// Compute real stats for a worker from shared localStorage applications
function computeWorkerStats(workerEmail: string, allJobs: any[]) {
  try {
    const raw = localStorage.getItem('kaammadat_applications');
    if (!raw) return { thisMonth: 0, total: 0 };
    const allApps = JSON.parse(raw);
    const workerApps = allApps.filter((a: any) => a.workerEmail === workerEmail);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let thisMonth = 0;
    let total = 0;
    workerApps.forEach((app: any) => {
      const job = allJobs.find((j: any) => j.id === app.jobId);
      if (!job) return;
      try {
        const parts = job.date.split(' - ');
        const start = new Date(`${parts[0]}, ${currentYear}`);
        const end = new Date(`${parts[1]}, ${currentYear}`);
        const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
        total += days;
        if (start.getMonth() === currentMonth) thisMonth += days;
      } catch (e) {}
    });
    return { thisMonth, total };
  } catch (e) {
    return { thisMonth: 0, total: 0 };
  }
}

export default function PostedJobs() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Applicant[]>([]);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [expandedApplicant, setExpandedApplicant] = useState<string | null>(null);
  const [giverName, setGiverName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('kaammadat_user_name') || '';
    setGiverName(name);
    // Load real applications
    const raw = localStorage.getItem('kaammadat_applications');
    if (raw) setApplications(JSON.parse(raw));

    getJobs().then((data) => {
      const myJobs = name
        ? data.filter((job: any) => job.giver === name)
        : data;
      setJobs(myJobs);
      setLoading(false);
    });
  }, []);

  const handleToggleJobStatus = (id: number) => {
    setJobs((prev) => prev.map((job) => job.id === id ? { ...job, closed: !job.closed } : job));
  };

  const getApplicantsForJob = (jobId: number) =>
    applications.filter(a => a.jobId === jobId);

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] animate-[fade-in_0.6s_ease-in-out] pb-12">
      {/* Header */}
      <header className="bg-green-600 text-white p-5 shadow-md flex items-center justify-between sticky top-0 z-10">
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
          jobs.map((job) => {
            const applicants = getApplicantsForJob(job.id);
            const isExpanded = expandedJob === job.id;
            return (
              <div key={job.id} className={`bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition ${job.closed ? 'opacity-70' : ''}`}>
                {/* Job Row */}
                <div className="p-5 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={job.img} alt={job.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-extrabold text-lg text-gray-800 truncate">{job.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ml-2 shrink-0 ${job.closed ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                        {job.closed ? 'Closed' : 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold mb-2">📅 {job.date} • ₹{job.salary}/day</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Applicants badge */}
                      <button
                        onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1.5 ${applicants.length > 0 ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                      >
                        👤 {applicants.length} Applicant{applicants.length !== 1 ? 's' : ''} {isExpanded ? '▲' : '▼'}
                      </button>
                      <button
                        onClick={() => handleToggleJobStatus(job.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition cursor-pointer ${job.closed ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-md' : 'bg-white hover:bg-gray-100 text-red-600 border-red-200'}`}
                      >
                        {job.closed ? 'Re-open' : 'Close Position'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Applicants Panel */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    {applicants.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <p className="text-3xl mb-2">📭</p>
                        <p className="font-bold">No applications yet</p>
                        <p className="text-xs mt-1">Workers who apply will appear here with their work portfolios</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">{applicants.length} Worker{applicants.length !== 1 ? 's' : ''} Applied</p>
                        {applicants.map((applicant) => {
                          const key = `${job.id}-${applicant.workerEmail}`;
                          const isApplicantExpanded = expandedApplicant === key;
                          return (
                            <div
                              key={key}
                              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                            >
                              {/* Applicant Header */}
                              <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                                onClick={() => setExpandedApplicant(isApplicantExpanded ? null : key)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-lg border-2 border-orange-200">
                                    {applicant.workerName.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-gray-800">{applicant.workerName}</p>
                                    <p className="text-xs text-gray-400">{applicant.workerEmail}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-blue-600 font-bold">{applicant.workerPhotos.length} 📸</p>
                                  <p className="text-xs text-gray-400">{isApplicantExpanded ? '▲ Hide' : '▼ View Profile'}</p>
                                </div>
                              </div>

                              {/* Applicant Work Photos & Stats */}
                              {isApplicantExpanded && (() => {
                                const workerStats = computeWorkerStats(applicant.workerEmail, jobs);
                                return (
                                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                                  <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                    <div>
                                      <p className="text-xs font-extrabold text-gray-500 uppercase">Worker Statistics (Real)</p>
                                      <div className="mt-2 flex gap-4">
                                        <div className="bg-white p-2 px-3 rounded-lg border border-gray-200 shadow-sm text-center">
                                          <p className="text-xl font-black text-green-600">{workerStats.thisMonth}</p>
                                          <p className="text-[10px] font-bold text-gray-500 uppercase">This Month</p>
                                        </div>
                                        <div className="bg-white p-2 px-3 rounded-lg border border-gray-200 shadow-sm text-center">
                                          <p className="text-xl font-black text-blue-600">{workerStats.total}</p>
                                          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Days</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-extrabold text-gray-500 uppercase mb-1">Rating</p>
                                      {workerStats.total > 0 ? (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1 inline-flex items-center gap-1 shadow-sm">
                                          <span className="text-yellow-500 text-lg">⭐</span>
                                          <span className="font-black text-yellow-700 text-lg">New</span>
                                        </div>
                                      ) : (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 inline-flex items-center gap-1 shadow-sm">
                                          <span className="text-gray-400 text-sm font-bold">No ratings yet</span>
                                        </div>
                                      )}
                                      <p className="text-[10px] text-gray-400 mt-1 font-semibold">{workerStats.total} days worked total</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center mb-3">
                                    <p className="text-xs font-extrabold text-gray-500 uppercase">Portfolio ({applicant.workerPhotos.length} Photos)</p>
                                    <p className="text-[10px] font-extrabold text-gray-400 uppercase">Applied: {new Date(applicant.appliedAt).toLocaleString('en-IN')}</p>
                                  </div>
                                  {applicant.workerPhotos.length === 0 ? (
                                    <p className="text-sm text-gray-400 font-medium text-center py-4">This worker hasn't uploaded any work photos yet.</p>
                                  ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                      {applicant.workerPhotos.map((photo) => (
                                        <div key={photo.id} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                          <img src={photo.dataUrl} alt={photo.desc} className="w-full h-28 object-cover" />
                                          <p className="text-xs text-gray-600 font-medium px-2 py-1.5 truncate" title={photo.desc}>"{photo.desc}"</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                );
                              })()}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
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
