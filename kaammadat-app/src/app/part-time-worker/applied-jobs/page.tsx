"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getJobs } from '@/app/actions/jobActions';

interface AppliedJob {
  id: string;
  title: string;
  category: string;
  giver: string;
  date: string;
  salary: string;
  status: 'Pending' | 'Approved' | 'In Progress' | 'Completed';
  img: string;
}

export default function AppliedJobs() {
  const { t } = useLanguage();
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplied = async () => {
      const email = localStorage.getItem('kaammadat_user_email');
      const rawApps = localStorage.getItem('kaammadat_applications');

      if (!email || !rawApps) {
        setLoading(false);
        return;
      }

      const allApps = JSON.parse(rawApps);
      const myApps = allApps.filter((a: any) => a.workerEmail === email);

      if (myApps.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch live job details
      const allJobs = await getJobs();

      const enriched: AppliedJob[] = myApps.map((app: any) => {
        const job = allJobs.find((j: any) => j.id === app.jobId);
        if (!job) return null;
        return {
          id: String(app.jobId),
          title: job.title,
          category: job.type || job.title,
          giver: job.giver || 'Unknown',
          date: job.date,
          salary: `₹${job.salary}/day`,
          status: app.status || 'Pending',
          img: job.img,
        };
      }).filter(Boolean);

      setAppliedJobs(enriched);
      setLoading(false);
    };

    fetchApplied();
  }, []);

  const getStatusBadge = (status: AppliedJob['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">Pending Review</span>;
      case 'Approved':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">Approved</span>;
      case 'In Progress':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>;
      case 'Completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">Completed</span>;
    }
  };

  const renderProgressBoxes = (dateStr: string) => {
    try {
      const parts = dateStr.split(' - ');
      if (parts.length !== 2) return null;

      const currentYear = new Date().getFullYear();
      const startDate = new Date(`${parts[0]}, ${currentYear}`);
      const endDate = new Date(`${parts[1]}, ${currentYear}`);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

      const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (totalDays <= 0 || totalDays > 60) return null;

      const now = new Date();
      const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isEvening = now.getHours() >= 12;

      const boxes = [];
      for (let i = 0; i < totalDays; i++) {
        const boxDate = new Date(startDate);
        boxDate.setDate(startDate.getDate() + i);

        let fillState = 'empty';
        if (boxDate < todayAtMidnight) {
          fillState = 'full';
        } else if (boxDate.getTime() === todayAtMidnight.getTime()) {
          fillState = isEvening ? 'full' : 'half';
        }

        boxes.push(
          <div
            key={i}
            className={`w-5 h-5 rounded shadow-sm border flex-shrink-0 relative overflow-hidden ${
              fillState === 'full'
                ? 'bg-blue-600 border-blue-700'
                : fillState === 'half'
                ? 'bg-gray-100 border-blue-400'
                : 'bg-gray-100 border-gray-200'
            }`}
            title={`Day ${i + 1}`}
          >
            {fillState === 'half' && (
              <div className="absolute top-0 left-0 bottom-0 w-1/2 bg-blue-400"></div>
            )}
          </div>
        );
      }

      const completedDays = boxes.filter((_, i) => {
        const boxDate = new Date(startDate);
        boxDate.setDate(startDate.getDate() + i);
        return boxDate < todayAtMidnight;
      }).length;

      return (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 font-extrabold uppercase tracking-wide">
              Work Progress ({totalDays} Days)
            </p>
            <p className="text-xs text-blue-600 font-bold">
              {completedDays}/{totalDays} Done
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">{boxes}</div>
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] animate-[fade-in_0.6s_ease-in-out] pb-10">
      {/* Header */}
      <header className="bg-orange-500 text-white p-5 shadow-md flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/part-time-worker/dashboard"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-lg transition"
          >
            ←
          </Link>
          <h1 className="font-extrabold text-2xl tracking-tight">{t('applied_jobs')}</h1>
        </div>
        {!loading && (
          <span className="text-xs bg-orange-600 px-3 py-1 rounded-full font-bold shadow-inner">
            {appliedJobs.length} Applications
          </span>
        )}
      </header>

      <main className="p-4 max-w-3xl mx-auto flex flex-col gap-5 mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
            <p className="text-gray-500 mt-4 font-bold">Loading your applications...</p>
          </div>
        ) : appliedJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-inner text-gray-400">
            <span className="text-6xl block mb-3">📁</span>
            <p className="font-bold text-lg">No applications yet</p>
            <p className="text-sm mt-1">Start applying to jobs from the Search page!</p>
            <Link href="/part-time-worker/search">
              <button className="mt-4 bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl shadow hover:bg-orange-600 transition cursor-pointer">
                🔍 Find Jobs
              </button>
            </Link>
          </div>
        ) : (
          appliedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 flex gap-4 items-start hover:shadow-lg transition group"
            >
              {/* Job Image */}
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={job.img}
                  alt={job.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Job Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-extrabold text-lg text-gray-800 truncate">{job.title}</h3>
                  {getStatusBadge(job.status)}
                </div>
                <p className="text-sm text-gray-500 font-semibold flex items-center gap-1.5 mb-2">
                  👤 {job.giver} • 📅 {job.date}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">
                    {job.salary}
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    {job.category}
                  </span>
                </div>
                {renderProgressBoxes(job.date)}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
