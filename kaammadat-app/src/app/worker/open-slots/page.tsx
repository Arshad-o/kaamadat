"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOpenSlotJobs, AttendanceRecord } from '@/app/actions/attendanceActions';

export default function OpenSlotsPage() {
  const [openJobs, setOpenJobs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');

  useEffect(() => {
    const loc = localStorage.getItem('kaammadat_user_location') || 'Pune, Maharashtra';
    setLocation(loc);
    getOpenSlotJobs(loc).then(data => {
      setOpenJobs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 font-[family-name:var(--font-geist-sans)] pb-24">
      <header className="bg-yellow-500 text-white p-4 shadow-md flex items-center gap-4 sticky top-0 z-10">
        <Link href="/worker/dashboard" className="text-white font-black text-xl hover:opacity-80">←</Link>
        <div>
          <h1 className="font-bold text-xl">🔔 Urgent Openings</h1>
          <p className="text-xs text-yellow-100">Slots opened near you due to worker absences</p>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto mt-2">

        {/* Location Banner */}
        <div className="bg-white rounded-2xl px-5 py-4 border border-yellow-100 shadow-sm mb-4 flex items-center gap-3">
          <span className="text-2xl">📍</span>
          <div>
            <p className="font-black text-gray-800 text-sm">Your Area</p>
            <p className="text-xs text-gray-500 font-medium">{location || 'Detecting...'}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 mt-16 text-gray-400">
            <span className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></span>
            <p className="font-bold">Scanning for open slots near you...</p>
          </div>
        ) : openJobs.length === 0 ? (
          <div className="text-center mt-16">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-black text-gray-700">All Slots Filled Near You</h2>
            <p className="text-gray-400 font-medium mt-2 text-sm">No urgent openings right now. Check back later!</p>
            <Link href="/worker/search" className="inline-block mt-6 bg-orange-500 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-orange-600 transition">Browse All Jobs</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-yellow-500 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg">
              <span className="text-3xl animate-bounce">🚨</span>
              <div>
                <p className="font-black">{openJobs.length} Urgent Slot(s) Near You!</p>
                <p className="text-xs opacity-90">A worker didn't show up. You can take the slot NOW.</p>
              </div>
            </div>

            {openJobs.map((job, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-md border-2 border-yellow-200 hover:border-yellow-400 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-gray-800 text-lg">{job.jobTitle}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><span>📍</span> {job.location}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><span>📅</span> {job.date}</p>
                  </div>
                  <div className="bg-yellow-100 border border-yellow-300 px-3 py-2 rounded-xl text-center">
                    <p className="text-2xl font-black text-yellow-700">{job.openSlots}</p>
                    <p className="text-[10px] font-black text-yellow-600 uppercase">Open</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {job.workers.map((w, wi) => (
                    <div key={wi} title={`${w.name} - ${w.status}`} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 ${w.status === 'present' ? 'bg-green-100 border-green-400 text-green-700' : w.status === 'absent' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                      {w.name.charAt(0)}
                    </div>
                  ))}
                  {Array.from({ length: job.openSlots }).map((_, oi) => (
                    <div key={`open-${oi}`} className="w-8 h-8 rounded-full border-2 border-dashed border-yellow-400 flex items-center justify-center text-yellow-400 text-lg">+</div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    alert(`✅ You have expressed interest in "${job.jobTitle}". The job giver will be notified and contact you on your registered mobile number.`);
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-black py-3.5 rounded-xl shadow-lg transition transform active:scale-95 text-base"
                >
                  🙋 I'm Available — Take This Slot!
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
