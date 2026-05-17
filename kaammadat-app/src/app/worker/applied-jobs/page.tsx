"use client";
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

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

const mockAppliedJobs: AppliedJob[] = [
  {
    id: '1',
    title: 'Electrician (Wiring)',
    category: 'Electrician',
    giver: 'Anand Sharma',
    date: 'Oct 15 - Oct 20',
    salary: '₹800/day',
    status: 'Pending',
    img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop',
  },
  {
    id: '2',
    title: 'Catering Waiter Service',
    category: 'Catering Boys',
    giver: 'Rajesh Malhotra',
    date: 'Nov 02 - Nov 05',
    salary: '₹600/day',
    status: 'Approved',
    img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=150&h=150&fit=crop',
  },
];

export default function AppliedJobs() {
  const { t } = useLanguage();

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

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] animate-[fade-in_0.6s_ease-in-out] pb-10">
      {/* Header */}
      <header className="bg-orange-500 text-white p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/worker/dashboard" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-lg transition">
            ←
          </Link>
          <h1 className="font-extrabold text-2xl tracking-tight">{t('applied_jobs')}</h1>
        </div>
        <span className="text-xs bg-orange-600 px-3 py-1 rounded-full font-bold shadow-inner">
          {mockAppliedJobs.length} Applications
        </span>
      </header>

      <main className="p-4 max-w-3xl mx-auto flex flex-col gap-5 mt-6">
        {mockAppliedJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 flex gap-4 items-center hover:shadow-lg transition group">
            {/* Job Image */}
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200 shadow-sm">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={job.img} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
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
                   Category: {job.category}
                 </span>
               </div>
            </div>
          </div>
        ))}

        {mockAppliedJobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-inner text-gray-400">
            <span className="text-6xl block mb-3">📁</span>
            <p className="font-bold">You haven't applied to any jobs yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
