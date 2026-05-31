"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getJobs } from '@/app/actions/jobActions';
import { getUsers } from '@/app/actions/userActions';
import LogoutModal from '@/components/LogoutModal';

export default function JobGiverDashboard() {
  const { t } = useLanguage();
  const [giverName, setGiverName] = useState('Anand Sharma');
  const [jobs, setJobs] = useState<any[]>([]);
  const [showLogout, setShowLogout] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('kaammadat_user_name');
    if (savedName) setGiverName(savedName);

    const savedEmail = localStorage.getItem('kaammadat_user_email');
    if (savedEmail) {
      getUsers().then(users => {
        const u = users.find(x => x?.email === savedEmail);
        if (u && u.kycVerified) setKycVerified(true);
      });
    }

    const savedPhoto = localStorage.getItem('kaammadat_user_photo');
    if (savedPhoto) setProfilePhoto(savedPhoto);

    // Only fetch jobs that belong to this giver
    getJobs().then((data) => {
      const myJobs = data.filter((job: any) => job.giver === "Anand Sharma");
      setJobs(myJobs);
    });
  }, []);

  const executeLogout = () => {
    localStorage.clear();
    // Delete authentication cookies as well
    document.cookie = "kaammadat_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kaammadat_user_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kaammadat_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] animate-[fade-in_0.6s_ease-in-out]">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-md flex justify-between items-center">
        <Link href="/job-giver/profile" className="flex items-center gap-3 hover:opacity-90 transition cursor-pointer">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 font-extrabold shadow border border-green-200 overflow-hidden shrink-0">
             {profilePhoto ? (
               <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               giverName.charAt(0)
             )}
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-xl leading-tight">Hi, {giverName}</h1>
            {kycVerified && <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 border border-blue-200">✅ KYC Verified</span>}
          </div>
        </Link>
        <button onClick={() => setShowLogout(true)} className="text-sm font-bold bg-green-700 hover:bg-green-800 px-4 py-2 rounded-full shadow transition cursor-pointer">
          Logout
        </button>
      </header>


      <main className="p-4 max-w-4xl mx-auto flex flex-col gap-6 mt-6">
        
        {/* Welcome Animation Area */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-green-100 flex items-center gap-4 animate-[pulse_4s_ease-in-out_infinite]">
          <div className="text-4xl">🏢</div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Welcome Back!</h2>
            <p className="text-gray-600 font-medium">You have {jobs.length} active job postings.</p>
          </div>
        </div>

        {/* Quick Portal Navigation */}
        <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
           <h3 className="text-xl font-black mb-4 text-gray-800">Quick Dashboard Actions</h3>
           <div className="grid grid-cols-2 gap-4">
              <Link href="/job-giver/post-job" className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-2xl text-white shadow hover:shadow-orange-100 hover:-translate-y-0.5 transition flex flex-col justify-between h-32 group cursor-pointer">
                 <span className="text-3xl transition group-hover:scale-110 self-start">➕</span>
                 <span className="font-extrabold text-lg self-end">{t('post_new_job')}</span>
              </Link>
              <Link href="/job-giver/posted-jobs" className="bg-gradient-to-br from-green-600 to-green-700 p-5 rounded-2xl text-white shadow hover:shadow-green-100 hover:-translate-y-0.5 transition flex flex-col justify-between h-32 group cursor-pointer">
                 <span className="text-3xl transition group-hover:scale-110 self-start">📋</span>
                 <span className="font-extrabold text-lg self-end">{t('posted_jobs')}</span>
              </Link>
           </div>
        </section>

        {/* Loyalty Cards Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 text-9xl -mt-4 mr-4">💼</div>
          <h3 className="text-xl font-bold mb-1">{t('loyalty_card')}</h3>
          <p className="text-sm text-gray-300 mb-4">Your current tier and benefits</p>
          
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 w-full max-w-sm rounded-xl p-4 shadow-inner text-white border border-yellow-500">
             <div className="flex justify-between items-start">
               <span className="font-bold tracking-widest uppercase">Gold Tier</span>
               <span className="text-xs font-bold">KAAMMADAT</span>
             </div>
             <div className="mt-6">
                <p className="font-mono text-lg">**** **** **** 8821</p>
                <div className="flex justify-between items-end mt-2">
                   <p className="text-sm font-semibold uppercase">{giverName}</p>
                   <p className="text-xs font-bold bg-white text-yellow-800 px-2 py-1 rounded">5% OFF POSTING</p>
                </div>
             </div>
          </div>
        </section>

        {/* Posted Jobs Area Preview */}
        <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-bold text-gray-800">{t('posted_jobs')}</h3>
             <Link href="/job-giver/posted-jobs" className="text-sm font-bold text-green-600 underline hover:text-green-700">Manage All</Link>
           </div>
           
           {jobs.length === 0 ? (
             <div className="text-center py-8 text-gray-400">
               <div className="text-5xl mb-3">📁</div>
               <p>You haven't posted any jobs yet.</p>
             </div>
           ) : (
             <div className="flex flex-col gap-4">
               {jobs.slice(0, 3).map(job => (
                 <div key={job.id} className="border border-gray-100 rounded-xl p-4 flex gap-4 items-center hover:bg-gray-50/50 transition">
                   <div className="w-14 h-14 shrink-0">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={job.img} alt={job.type} className="w-full h-full object-cover rounded-full border-2 border-orange-100" />
                   </div>
                   <div className="flex-1">
                     <h4 className="font-extrabold text-base text-gray-800">{job.title}</h4>
                     <p className="text-xs text-gray-500 font-semibold">{job.date}</p>
                     <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md mt-2 inline-block shadow-sm">
                       Slots: {job.cap}
                     </span>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </section>

      </main>

      {/* Reusable Premium Logout Modal Confirmation */}
      <LogoutModal 
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={executeLogout}
      />
    </div>
  );
}
