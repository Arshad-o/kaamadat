"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoutModal from '@/components/LogoutModal';
import {
  adminGetAllUsers,
  adminSearchUsers,
  adminWarnUser,
  adminRemoveUser,
  adminSetCard,
} from '@/app/actions/userActions';
import { getFraudReports } from '@/app/actions/fraudActions';
import { getEffectiveCardTier, CARD_TIERS, CARD_STYLES } from '@/utils/cardTier';
import { adminGetAnalytics } from '@/app/actions/analyticsActions';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, CartesianGrid, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

type AdminView = 'dashboard' | 'users';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [view, setView] = useState<AdminView>('dashboard');

  // Real data
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  // User management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [cardTierSelect, setCardTierSelect] = useState('Gold');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  useEffect(() => {
    const isAuth =
      document.cookie.includes('kaammadat_authenticated=true') &&
      document.cookie.includes('kaammadat_user_type=admin');
    if (!isAuth) {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
      loadRealData();
    }
  }, [router]);

  const loadRealData = async () => {
    setLoadingData(true);
    try {
      const [users, fraudReports, analyticsData] = await Promise.all([
        adminGetAllUsers(),
        getFraudReports(),
        adminGetAnalytics()
      ]);
      setAllUsers(users);
      setReports(fraudReports);
      setAnalytics(analyticsData);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  const executeLogout = () => {
    localStorage.clear();
    document.cookie = "kaammadat_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kaammadat_user_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kaammadat_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = '/';
  };

  const handleEvaporate = async (id: number) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'EVAPORATED (Banned)' } : r));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setActionMsg('');
    setSelectedUser(null);
    try {
      const results = await adminSearchUsers(searchQuery.trim());
      setSearchResults(results);
    } finally {
      setSearching(false);
    }
  };

  const handleWarn = async () => {
    if (!selectedUser) return;
    setActionLoading('warn');
    const res = await adminWarnUser(selectedUser.email);
    setActionLoading('');
    setActionMsg(res.success ? '⚠️ Warning sent! User will see a warning banner on next login.' : `Error: ${res.error}`);
    if (res.success) await loadRealData();
  };

  const handleRemove = async () => {
    if (!selectedUser) return;
    setActionLoading('remove');
    const res = await adminRemoveUser(selectedUser.email);
    setActionLoading('');
    setShowRemoveConfirm(false);
    if (res.success) {
      setActionMsg('🗑️ Account permanently removed from the platform.');
      setSelectedUser(null);
      setSearchResults(null);
      setSearchQuery('');
      await loadRealData();
    } else {
      setActionMsg(`Error: ${res.error}`);
    }
  };

  const handleSetCard = async () => {
    if (!selectedUser) return;
    setActionLoading('card');
    const res = await adminSetCard(selectedUser.email, cardTierSelect);
    setActionLoading('');
    setActionMsg(res.success ? `🏅 Card updated to ${cardTierSelect} for ${selectedUser.name}!` : `Error: ${res.error}`);
    if (res.success) {
      setSelectedUser({ ...selectedUser, cardOverride: cardTierSelect });
      await loadRealData();
    }
  };

  const workers = allUsers.filter(u => u.type === 'worker');
  const jobGivers = allUsers.filter(u => u.type === 'job-giver');
  const pendingDisputes = reports.filter(r => r.status === 'Pending');

  // Chart Data
  const userTypeData = [
    { name: 'Workers', value: workers.length || 1 }, // Fallback to 1 for visual rendering if 0
    { name: 'Job Givers', value: jobGivers.length || 1 },
  ];
  const COLORS = ['#f97316', '#16a34a'];

  // Process Analytics Data for Charts
  let regData: any[] = [];
  let jobData: any[] = [];
  let attData: any[] = [];

  if (analytics) {
    // Process Registrations by Date
    const regMap: Record<string, number> = {};
    analytics.users.forEach((u: any) => {
      const d = u.created_at ? new Date(u.created_at) : new Date();
      const date = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      regMap[date] = (regMap[date] || 0) + 1;
    });
    // Ensure we show them in order (assuming they are fetched sequentially or sort by date)
    regData = Object.keys(regMap).map(date => ({ date, users: regMap[date] })).slice(-7);

    // Process Job Postings by Date
    const jobMap: Record<string, number> = {};
    analytics.jobs.forEach((j: any) => {
      const d = j.created_at ? new Date(j.created_at) : new Date();
      const date = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      jobMap[date] = (jobMap[date] || 0) + 1;
    });
    jobData = Object.keys(jobMap).map(date => ({ date, jobs: jobMap[date] })).slice(-7);

    // Process Attendance by Date
    const attMap: Record<string, { total: number, present: number }> = {};
    analytics.attendance.forEach((a: any) => {
      const dateStr = a.date ? String(a.date).substring(0, 10) : 'Unknown';
      if (!attMap[dateStr]) attMap[dateStr] = { total: 0, present: 0 };
      attMap[dateStr].total += (a.total_slots || 0);
      const filled = (a.total_slots || 0) - (a.open_slots || 0);
      attMap[dateStr].present += filled;
    });
    attData = Object.keys(attMap).map(date => ({ 
      date, 
      total: attMap[date].total, 
      present: attMap[date].present 
    })).slice(-7);
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <span className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
        <p className="text-slate-400 font-bold mt-4 tracking-wider uppercase text-sm">Authenticating Admin Session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-lg border-b border-slate-800 sticky top-0 z-10">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-green-500">
            Kaammadat Admin Control
          </h1>
          <p className="text-slate-400 font-semibold text-xs mt-0.5 uppercase tracking-widest">Authorized Security Panel</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView(view === 'users' ? 'dashboard' : 'users')}
            className={`px-4 py-2 font-extrabold rounded-xl shadow-md transition text-sm cursor-pointer flex items-center gap-2 ${view === 'users' ? 'bg-orange-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
          >
            👥 {view === 'users' ? 'Back to Dashboard' : 'User Management'}
          </button>
          <button
            onClick={() => setShowLogout(true)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold rounded-xl shadow-md transition text-sm cursor-pointer"
          >
            Logout 🚪
          </button>
        </div>
      </header>

      {/* ─── DASHBOARD VIEW ─────────────────────────────────── */}
      {view === 'dashboard' && (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-1">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Workers</p>
              {loadingData ? (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg mt-1"></div>
              ) : (
                <p className="text-4xl font-black text-orange-500">{workers.length.toLocaleString()}</p>
              )}
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-1">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Job Givers</p>
              {loadingData ? (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg mt-1"></div>
              ) : (
                <p className="text-4xl font-black text-green-600">{jobGivers.length.toLocaleString()}</p>
              )}
            </div>
            <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col gap-1">
              <p className="text-red-500 text-sm font-bold uppercase tracking-wider">Active Disputes</p>
              {loadingData ? (
                <div className="h-8 w-16 bg-red-100 animate-pulse rounded-lg mt-1"></div>
              ) : (
                <p className="text-4xl font-black text-red-600">{pendingDisputes.length}</p>
              )}
            </div>
          </div>

          {/* Shortcut to User Management */}
          <div
            onClick={() => setView('users')}
            className="w-full mb-8 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-2xl p-6 flex items-center justify-between cursor-pointer transition shadow-lg group border border-slate-600"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner">👥</div>
              <div>
                <p className="text-xl font-black">User Management Panel</p>
                <p className="text-slate-400 text-sm font-medium">Search, warn, remove, or update loyalty card tier for any user</p>
              </div>
            </div>
            <span className="text-slate-400 text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </div>

          {/* Analytics Section */}
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-800 p-4 text-white">
               <h2 className="text-xl font-bold flex items-center gap-2"><span>📈</span> Platform Analytics</h2>
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
               
               {/* Line Chart - Registrations */}
               <div className="flex flex-col items-center">
                 <h3 className="text-slate-600 font-black mb-2 uppercase tracking-widest text-xs">Live Registrations</h3>
                 <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={regData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                       <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} allowDecimals={false} />
                       <RechartsTooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                       />
                       <Line type="monotone" dataKey="users" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
               </div>

               {/* Area Chart - Job Postings */}
               <div className="flex flex-col items-center">
                 <h3 className="text-slate-600 font-black mb-2 uppercase tracking-widest text-xs">Job Postings Trend</h3>
                 <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={jobData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                       <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} allowDecimals={false} />
                       <RechartsTooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                       />
                       <Area type="monotone" dataKey="jobs" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} strokeWidth={3} />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
               </div>

               {/* Bar Chart - Attendance Data */}
               <div className="flex flex-col items-center md:col-span-2">
                 <h3 className="text-slate-600 font-black mb-2 uppercase tracking-widest text-xs">Daily Attendance & Slots</h3>
                 <div className="h-72 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={attData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                       <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} allowDecimals={false} />
                       <RechartsTooltip 
                         cursor={{ fill: '#f1f5f9' }}
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                       />
                       <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }} />
                       <Bar dataKey="total" name="Total Slots" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                       <Bar dataKey="present" name="Slots Filled" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </div>

             </div>
          </div>

          {/* Fraud Reports */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Dispute & Fraud Reports Queue</h2>
              <span className="text-xs bg-red-600 text-white font-bold px-3 py-1 rounded-full">{pendingDisputes.length} Pending</span>
            </div>

            {loadingData ? (
              <div className="p-8 text-center text-slate-400 font-bold">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-bold text-lg">No Fraud Reports</p>
                <p className="text-sm mt-1">No users have reported fraud yet. The platform is clean!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((report: any) => (
                  <div key={report.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs font-bold rounded bg-red-100 text-red-700">{report.type || 'Fraud'}</span>
                        <span className={`px-2 py-1 text-xs font-bold rounded ${report.status === 'Pending' ? 'bg-slate-200 text-slate-700' : 'bg-red-600 text-white'}`}>
                          {report.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800">Job: {report.job}</h3>
                      <p className="text-sm text-slate-600 mt-1"><span className="font-semibold">Reason:</span> {report.reason}</p>
                      <div className="text-xs text-slate-400 mt-2 flex gap-4 flex-wrap">
                        <p>Reporter: {report.workerName}</p>
                        <p>Email: {report.workerEmail}</p>
                        {report.reportedAt && <p>Reported: {new Date(report.reportedAt).toLocaleString('en-IN')}</p>}
                      </div>
                    </div>
                    {report.status === 'Pending' && (
                      <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                        <button className="flex-1 md:flex-none px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition text-sm cursor-pointer">
                          Contact Users
                        </button>
                        <button
                          onClick={() => handleEvaporate(report.id)}
                          className="flex-1 md:flex-none px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow text-sm cursor-pointer"
                        >
                          Evaporate Account
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── USER MANAGEMENT VIEW ───────────────────────────── */}
      {view === 'users' && (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-slate-800 mb-2">👥 User Management</h2>
          <p className="text-slate-500 text-sm mb-6 font-medium">Search any registered user by their <strong>Email ID</strong>, <strong>Mobile Number</strong> or <strong>Aadhar Number</strong>.</p>

          {/* Search Bar */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Email ID, Mobile, or Aadhar Number..."
              className="flex-1 px-5 py-3.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-800 bg-white outline-none font-medium transition text-sm"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl shadow transition cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed text-sm"
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>

          {/* Summary Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-3 border border-slate-200 text-center shadow-sm">
              <p className="text-2xl font-black text-orange-500">{workers.length}</p>
              <p className="text-xs font-bold text-slate-500 uppercase">Workers</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-200 text-center shadow-sm">
              <p className="text-2xl font-black text-green-600">{jobGivers.length}</p>
              <p className="text-xs font-bold text-slate-500 uppercase">Job Givers</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-200 text-center shadow-sm">
              <p className="text-2xl font-black text-slate-700">{allUsers.length}</p>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Users</p>
            </div>
          </div>

          {/* Search Results */}
          {searchResults !== null && (
            <div className="mb-6">
              {searchResults.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                  <p className="text-4xl mb-2">🔍</p>
                  <p className="font-bold text-slate-700 text-lg">No Users Found</p>
                  <p className="text-slate-400 text-sm mt-1">No match for "<strong>{searchQuery}</strong>". Try a different email, mobile, or Aadhar number.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {searchResults.map((user: any) => {
                    const tier = getEffectiveCardTier(user);
                    const style = CARD_STYLES[tier];
                    const isSelected = selectedUser?.email === user.email;
                    return (
                      <div
                        key={user.email}
                        className={`bg-white rounded-2xl border-2 shadow-sm transition cursor-pointer overflow-hidden ${isSelected ? 'border-orange-500 shadow-orange-100' : 'border-slate-200 hover:border-slate-300'}`}
                        onClick={() => { setSelectedUser(isSelected ? null : user); setActionMsg(''); }}
                      >
                        {/* User Header */}
                        <div className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xl border-2 border-orange-200">
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-base">{user.name}</p>
                              <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                              <div className="flex gap-2 mt-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${user.type === 'worker' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                  {user.type === 'worker' ? '👷 Worker' : '💼 Job Giver'}
                                </span>
                                {user.kycVerified && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">✅ KYC Verified</span>
                                )}
                                {user.warned && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">⚠️ Warned</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`bg-gradient-to-br ${style.bg} px-3 py-1.5 rounded-xl text-xs font-extrabold ${style.text} shadow-sm`}>
                            {style.emoji} {tier}
                          </div>
                        </div>

                        {/* Expanded Details + Actions */}
                        {isSelected && (
                          <div className="border-t border-slate-100 px-5 pb-5">
                            {/* Registration Details */}
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold uppercase">Mobile</p>
                                <p className="font-bold text-slate-800 mt-0.5">{user.mobile || '—'}</p>
                              </div>
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold uppercase">Aadhar</p>
                                <p className="font-bold text-slate-800 mt-0.5">{user.aadhar ? `****${user.aadhar.slice(-4)}` : '—'}</p>
                              </div>
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2">
                                <p className="text-xs text-slate-400 font-bold uppercase">Address</p>
                                <p className="font-bold text-slate-800 mt-0.5">{user.address || '—'}</p>
                              </div>
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold uppercase">Current Card</p>
                                <p className="font-bold text-slate-800 mt-0.5">{style.emoji} {tier} ({style.discount} discount)</p>
                              </div>
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold uppercase">Card Source</p>
                                <p className="font-bold text-slate-800 mt-0.5">{user.cardOverride ? '🔧 Admin Override' : '⏱ Auto (by tenure)'}</p>
                              </div>
                              {user.warnedAt && (
                                <div className="bg-red-50 rounded-xl p-3 border border-red-100 col-span-2">
                                  <p className="text-xs text-red-400 font-bold uppercase">Warned At</p>
                                  <p className="font-bold text-red-700 mt-0.5">{new Date(user.warnedAt).toLocaleString('en-IN')}</p>
                                </div>
                              )}
                            </div>

                            {/* Action Message */}
                            {actionMsg && (
                              <div className="mt-4 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-bold">
                                {actionMsg}
                              </div>
                            )}

                            {/* 3 Action Buttons */}
                            <div className="mt-5 flex flex-col gap-3">
                              {/* 1. Warn */}
                              <button
                                onClick={handleWarn}
                                disabled={actionLoading === 'warn'}
                                className="w-full flex items-center gap-3 px-5 py-3.5 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 text-yellow-800 font-extrabold rounded-xl transition cursor-pointer disabled:opacity-60 text-sm"
                              >
                                <span className="text-xl">⚠️</span>
                                <div className="text-left">
                                  <p className="font-black">Warn User</p>
                                  <p className="text-xs font-medium text-yellow-700 opacity-80">User receives a warning banner to update credentials</p>
                                </div>
                                {actionLoading === 'warn' && <span className="ml-auto w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></span>}
                              </button>

                              {/* 2. Remove */}
                              {!showRemoveConfirm ? (
                                <button
                                  onClick={() => setShowRemoveConfirm(true)}
                                  className="w-full flex items-center gap-3 px-5 py-3.5 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-800 font-extrabold rounded-xl transition cursor-pointer text-sm"
                                >
                                  <span className="text-xl">🗑️</span>
                                  <div className="text-left">
                                    <p className="font-black">Remove Account</p>
                                    <p className="text-xs font-medium text-red-700 opacity-80">Permanently delete this user from the entire platform</p>
                                  </div>
                                </button>
                              ) : (
                                <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 flex flex-col gap-3">
                                  <p className="text-red-800 font-extrabold text-sm">⚠️ Are you sure? This action CANNOT be undone.</p>
                                  <div className="flex gap-3">
                                    <button
                                      onClick={handleRemove}
                                      disabled={actionLoading === 'remove'}
                                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg text-sm cursor-pointer disabled:opacity-60"
                                    >
                                      {actionLoading === 'remove' ? 'Removing...' : 'Yes, Remove Permanently'}
                                    </button>
                                    <button
                                      onClick={() => setShowRemoveConfirm(false)}
                                      className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-sm cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* 3. Update Card */}
                              <div className="w-full flex flex-col gap-2 px-5 py-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-xl">🏅</span>
                                  <div>
                                    <p className="font-black text-indigo-800 text-sm">Update Loyalty Card</p>
                                    <p className="text-xs font-medium text-indigo-700 opacity-80">Override automatic card tier with admin selection</p>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <select
                                    value={cardTierSelect}
                                    onChange={e => setCardTierSelect(e.target.value)}
                                    className="flex-1 px-3 py-2.5 rounded-lg border-2 border-indigo-200 bg-white text-slate-800 font-bold text-sm outline-none focus:border-indigo-500 cursor-pointer"
                                  >
                                    {CARD_TIERS.map(tier => (
                                      <option key={tier} value={tier}>
                                        {CARD_STYLES[tier].emoji} {tier} — {CARD_STYLES[tier].discount} discount
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={handleSetCard}
                                    disabled={actionLoading === 'card'}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg text-sm cursor-pointer disabled:opacity-60 transition"
                                  >
                                    {actionLoading === 'card' ? '...' : 'Apply'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={executeLogout}
      />
    </div>
  );
}
