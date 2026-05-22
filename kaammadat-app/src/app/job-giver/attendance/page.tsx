"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAttendance, initAttendance, addWorkerToJob, markAttendance, AttendanceRecord } from '@/app/actions/attendanceActions';

export default function AttendancePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerMobile, setNewWorkerMobile] = useState('');
  const [addMsg, setAddMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('kaammadat_my_jobs');
    if (stored) setJobs(JSON.parse(stored));
    // Demo fallback
    else setJobs([
      { id: '1001', title: 'Plumber Needed', location: 'Pune, Maharashtra', date: '2026-05-23', salary: 800, totalSlots: 5 },
      { id: '1002', title: 'Construction Labor', location: 'Mumbai, Maharashtra', date: '2026-05-23', salary: 600, totalSlots: 3 },
    ]);
  }, []);

  const handleSelectJob = async (job: any) => {
    setSelectedJob(job);
    setInitialized(false);
    const existing = await getAttendance(String(job.id));
    if (existing) {
      setAttendance(existing);
      setInitialized(true);
    } else {
      setAttendance(null);
    }
  };

  const handleInit = async () => {
    if (!selectedJob) return;
    setLoading(true);
    const record = await initAttendance(
      String(selectedJob.id),
      selectedJob.title,
      selectedJob.location,
      selectedJob.totalSlots || 5,
      selectedJob.date || new Date().toISOString().split('T')[0]
    );
    setAttendance(record);
    setInitialized(true);
    setLoading(false);
  };

  const handleAddWorker = async () => {
    if (!selectedJob || !newWorkerName || !newWorkerMobile) return;
    setLoading(true);
    const res = await addWorkerToJob(String(selectedJob.id), newWorkerName, newWorkerMobile);
    if (res.success) {
      const updated = await getAttendance(String(selectedJob.id));
      setAttendance(updated);
      setNewWorkerName('');
      setNewWorkerMobile('');
      setAddMsg({ text: 'Worker added successfully!', type: 'success' });
    } else {
      setAddMsg({ text: res.error || 'Failed to add worker.', type: 'error' });
    }
    setTimeout(() => setAddMsg({ text: '', type: '' }), 3000);
    setLoading(false);
  };

  const handleMark = async (mobile: string, status: 'present' | 'absent') => {
    if (!selectedJob) return;
    await markAttendance(String(selectedJob.id), mobile, status);
    const updated = await getAttendance(String(selectedJob.id));
    setAttendance(updated);
  };

  const presentCount = attendance?.workers.filter(w => w.status === 'present').length || 0;
  const absentCount = attendance?.workers.filter(w => w.status === 'absent').length || 0;
  const pendingCount = attendance?.workers.filter(w => w.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] pb-24">
      <header className="bg-green-700 text-white p-4 shadow-md flex items-center gap-4 sticky top-0 z-10">
        <Link href="/job-giver/dashboard" className="text-white font-black text-xl hover:opacity-80">←</Link>
        <div>
          <h1 className="font-bold text-xl">Attendance Manager</h1>
          <p className="text-xs text-green-200">Track slots & mark workers present/absent</p>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto flex flex-col gap-4 mt-2">

        {/* Job Selector */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-black text-gray-800 mb-3">Select Your Job</h3>
          <div className="flex flex-col gap-2">
            {jobs.map(job => (
              <button
                key={job.id}
                onClick={() => handleSelectJob(job)}
                className={`p-4 rounded-xl border-2 text-left transition ${selectedJob?.id === job.id ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200 bg-white'}`}
              >
                <p className="font-bold text-gray-800">{job.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">📍 {job.location} &nbsp;|&nbsp; 💰 ₹{job.salary}/day</p>
              </button>
            ))}
          </div>
        </section>

        {selectedJob && !initialized && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-center">
            <p className="text-orange-800 font-bold mb-3">Attendance not started for this job.</p>
            <button onClick={handleInit} disabled={loading} className="bg-green-600 text-white font-bold px-8 py-3 rounded-xl shadow hover:bg-green-700 transition">
              {loading ? '...' : '🚀 Start Attendance'}
            </button>
          </div>
        )}

        {attendance && initialized && (
          <>
            {/* Slot Summary */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-black text-gray-800 mb-4">Slot Summary</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-2xl font-black text-blue-700">{attendance.totalSlots}</p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase">Total</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-2xl font-black text-green-700">{presentCount}</p>
                  <p className="text-[10px] font-bold text-green-500 uppercase">Present</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-2xl font-black text-red-700">{absentCount}</p>
                  <p className="text-[10px] font-bold text-red-500 uppercase">Absent</p>
                </div>
                <div className={`rounded-xl p-3 ${attendance.openSlots > 0 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <p className={`text-2xl font-black ${attendance.openSlots > 0 ? 'text-yellow-700' : 'text-gray-500'}`}>{attendance.openSlots}</p>
                  <p className={`text-[10px] font-bold uppercase ${attendance.openSlots > 0 ? 'text-yellow-500' : 'text-gray-400'}`}>Open</p>
                </div>
              </div>
              {attendance.openSlots > 0 && (
                <div className="mt-4 bg-yellow-500 text-white rounded-xl px-4 py-3 flex items-center gap-3 animate-pulse">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <p className="font-black text-sm">Alert Sent to Nearby Workers!</p>
                    <p className="text-xs opacity-90">{attendance.openSlots} open slot(s) — Workers in {attendance.location} are being notified.</p>
                  </div>
                </div>
              )}
            </section>

            {/* Add Worker */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-black text-gray-800 mb-3">Add Worker to This Job</h3>
              <div className="flex flex-col gap-2">
                <input value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)} type="text" placeholder="Worker Name" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium text-gray-800" />
                <input value={newWorkerMobile} onChange={e => setNewWorkerMobile(e.target.value)} type="tel" placeholder="Mobile Number (10 digits)" maxLength={10} className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium text-gray-800" />
                <button onClick={handleAddWorker} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
                  {loading ? '...' : '+ Add Worker'}
                </button>
                {addMsg.text && <p className={`text-xs font-bold ${addMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{addMsg.text}</p>}
              </div>
            </section>

            {/* Worker List with Attendance */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-black text-gray-800 mb-4">Worker Attendance</h3>
              {attendance.workers.length === 0 ? (
                <p className="text-gray-400 text-center py-4 font-medium">No workers added yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {attendance.workers.map((worker, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition ${worker.status === 'present' ? 'border-green-200 bg-green-50' : worker.status === 'absent' ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                      <div>
                        <p className="font-bold text-gray-800">{worker.name}</p>
                        <p className="text-xs text-gray-400 font-medium">{worker.mobile}</p>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${worker.status === 'present' ? 'bg-green-500 text-white' : worker.status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                          {worker.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleMark(worker.mobile, 'present')} className={`px-3 py-2 rounded-xl text-xs font-black transition ${worker.status === 'present' ? 'bg-green-600 text-white shadow-md' : 'bg-white border-2 border-green-200 text-green-700 hover:bg-green-50'}`}>
                          ✓ Present
                        </button>
                        <button onClick={() => handleMark(worker.mobile, 'absent')} className={`px-3 py-2 rounded-xl text-xs font-black transition ${worker.status === 'absent' ? 'bg-red-600 text-white shadow-md' : 'bg-white border-2 border-red-200 text-red-700 hover:bg-red-50'}`}>
                          ✗ Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Payment Summary */}
            {presentCount > 0 && (
              <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl">
                <h3 className="font-black mb-3 flex items-center gap-2"><span>💰</span> Payment Due Today</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-300 text-sm font-medium">{presentCount} worker(s) × ₹{selectedJob.salary}/day</p>
                    <p className="text-xs text-slate-400 mt-0.5">{absentCount} absent — no charge</p>
                  </div>
                  <p className="text-3xl font-black text-green-400">₹{presentCount * (selectedJob.salary || 0)}</p>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
