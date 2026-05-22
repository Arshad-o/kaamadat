"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getJobs } from '@/app/actions/jobActions';

export default function WorkerStatistics() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    thisMonthDays: 0,
    projectedNextMonth: 0,
    history: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      const email = localStorage.getItem('kaammadat_user_email');
      const rawApps = localStorage.getItem('kaammadat_applications');
      let myApps: any[] = [];
      if (rawApps && email) {
        myApps = JSON.parse(rawApps).filter((a: any) => a.workerEmail === email);
      }

      // We need job details (salary, dates, location) for these applications
      const allJobs = await getJobs();
      let thisMonthDays = 0;
      const historyList: any[] = [];

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      myApps.forEach(app => {
        const job = allJobs.find((j: any) => j.id === app.jobId);
        if (job) {
          // Parse days
          let days = 0;
          try {
            const parts = job.date.split(' - ');
            const startDate = new Date(`${parts[0]}, ${currentYear}`);
            const endDate = new Date(`${parts[1]}, ${currentYear}`);
            days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            if (isNaN(days) || days <= 0) days = 0;
            
            if (startDate.getMonth() === currentMonth) {
              thisMonthDays += days;
            }
          } catch(e) {}

          historyList.push({
            id: job.id,
            title: job.title,
            month: new Date(app.appliedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
            location: job.location,
            salary: `₹${parseInt(job.salary) * (days > 0 ? days : 1)} Total`
          });
        }
      });

      setStats({
        thisMonthDays,
        projectedNextMonth: thisMonthDays + Math.floor(thisMonthDays * 0.2), // Simple projection
        history: historyList.sort((a, b) => b.id - a.id)
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] pb-10">
      {/* Header */}
      <header className="bg-blue-600 text-white p-5 shadow-md flex items-center gap-3 sticky top-0 z-10">
        <Link href="/worker/dashboard" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-lg transition cursor-pointer">
          ←
        </Link>
        <h1 className="font-extrabold text-2xl tracking-tight">Real-Time Statistics</h1>
      </header>

      <main className="p-4 max-w-3xl mx-auto flex flex-col gap-6 mt-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col justify-between animate-[fade-in_0.4s_ease-out]">
              <div>
                <h3 className="text-xl font-black mb-1 text-gray-800">📊 Work Statistics</h3>
                <p className="text-sm text-gray-500 font-medium mb-6">Track your live monthly progress</p>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex justify-between items-center shadow-inner">
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">This Month (Actual)</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stats.thisMonthDays} <span className="text-lg text-gray-500">Days</span></p>
                  </div>
                  <div className="text-4xl">📈</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex justify-between items-center shadow-inner">
                  <div>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Projected Next Month</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stats.projectedNextMonth} <span className="text-lg text-gray-500">Days</span></p>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">Based on current trajectory</p>
                  </div>
                  <div className="text-4xl">🚀</div>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 animate-[fade-in_0.6s_ease-out]">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-xl font-black text-gray-800">💼 Work History</h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">Live record of completed works</p>
                </div>
              </div>
              <div className="space-y-3">
                {stats.history.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-3xl mb-2">📁</p>
                    <p className="font-bold text-gray-400">No work history found yet.</p>
                  </div>
                ) : (
                  stats.history.map((work, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center hover:shadow-md transition">
                      <div>
                        <p className="font-extrabold text-base text-gray-800">{work.title}</p>
                        <p className="text-xs text-gray-500 font-bold mt-1">📅 {work.month}</p>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">📍 {work.location}</p>
                      </div>
                      <span className="bg-green-100 text-green-700 font-black text-sm px-3 py-1.5 rounded-lg border border-green-200 shadow-sm">
                        {work.salary}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
