"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoutModal from '@/components/LogoutModal';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [reports, setReports] = useState([
    { id: 1, type: 'Fraud', worker: 'Rahul Kumar (ID: 1029)', giver: 'Anand Sharma (ID: 8821)', job: 'Electrician (Wiring)', reason: 'Not paying promised salary', status: 'Pending' },
    { id: 2, type: 'Skill Issue', worker: 'Amit Patel (ID: 3341)', giver: 'BuildIt Co (ID: 9912)', job: 'House Construction', reason: 'Worker lacks basic carpentry skills', status: 'Pending' }
  ]);

  useEffect(() => {
    const isAuth = document.cookie.includes('kaammadat_authenticated=true') && 
                   document.cookie.includes('kaammadat_user_type=admin');
    if (!isAuth) {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const executeLogout = () => {
    localStorage.clear();
    // Delete authentication cookies as well
    document.cookie = "kaammadat_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kaammadat_user_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kaammadat_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = '/';
  };

  const handleEvaporate = (id: number) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'EVAPORATED (Banned)' } : r));
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <span className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
        <p className="text-slate-400 font-bold mt-4 tracking-wider uppercase text-sm">Authenticating Admin Session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-[family-name:var(--font-geist-sans)] p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-green-500">Kaammadat Admin Control</h1>
          <p className="text-slate-400 font-semibold text-xs mt-1 uppercase tracking-widest">Authorized Security Panel</p>
        </div>
        <button onClick={() => setShowLogout(true)} className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold rounded-xl shadow-md transition transform active:scale-95 text-sm cursor-pointer">
          Logout 🚪
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-bold">Total Workers</p>
          <p className="text-3xl font-bold text-orange-500">1,240,500,000</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-bold">Total Job Givers</p>
          <p className="text-3xl font-bold text-green-600">460,000,000</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 bg-red-50">
          <p className="text-red-500 text-sm font-bold">Active Disputes</p>
          <p className="text-3xl font-bold text-red-600">{reports.filter(r => r.status === 'Pending').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 p-4 text-white">
          <h2 className="text-xl font-bold">Dispute & Fraud Reports Queue</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {reports.map(report => (
            <div key={report.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${report.type === 'Fraud' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                    {report.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${report.status === 'Pending' ? 'bg-slate-200 text-slate-700' : 'bg-red-600 text-white'}`}>
                    {report.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800">Job: {report.job}</h3>
                <p className="text-sm text-slate-600 mt-1"><span className="font-semibold">Reason:</span> {report.reason}</p>
                <div className="text-xs text-slate-400 mt-2 grid grid-cols-2 gap-4">
                  <p>Worker: {report.worker}</p>
                  <p>Job Giver: {report.giver}</p>
                </div>
              </div>

              {report.status === 'Pending' && (
                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                  <button className="flex-1 md:flex-none px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition text-sm">
                    Contact Users
                  </button>
                  <button onClick={() => handleEvaporate(report.id)} className="flex-1 md:flex-none px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow text-sm">
                    Evaporate Account
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reusable Premium Logout Modal Confirmation */}
      <LogoutModal 
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={executeLogout}
      />
    </div>
  );
}
