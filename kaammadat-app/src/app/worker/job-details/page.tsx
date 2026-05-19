"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import PaymentModal from '@/components/PaymentModal';
import { sendPaymentReceiptEmail } from '@/app/actions/emailActions';
import { playNotificationSound } from '@/utils/playSound';
import { saveFraudReport } from '@/app/actions/fraudActions';
import IndiaMapBackground from '@/components/IndiaMapBackground';

export default function JobDetails() {
  const { t } = useLanguage();
  const [applied, setApplied] = useState(false);
  const [fraudReported, setFraudReported] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  
  const fee = 20;
  const discount = 0.6; // Silver Tier 3% discount
  const finalFee = fee - discount;

  const [job, setJob] = useState<any>({
    title: 'Electrician (Wiring)',
    giver: 'Anand Sharma',
    location: 'Srinagar, Kashmir',
    date: 'Oct 15 - Oct 20',
    salary: 800,
    type: 'Electrician',
    img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=400&fit=crop',
    lat: 34.0836,
    lng: 74.7973
  });

  useEffect(() => {
    const savedJobText = localStorage.getItem('kaammadat_selected_job');
    if (savedJobText) {
      try {
        const parsed = JSON.parse(savedJobText);
        let headerImg = parsed.img;
        if (parsed.type === 'Electrician') headerImg = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=400&fit=crop';
        else if (parsed.type === 'Carpenter') headerImg = 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=400&fit=crop';
        else if (parsed.type === 'Catering Boys') headerImg = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=400&fit=crop';

        setJob({
          ...parsed,
          img: headerImg || parsed.img,
          lat: parsed.lat || 34.0836,
          lng: parsed.lng || 74.7973
        });
      } catch (e) {
        console.error("Error loading selected job details:", e);
      }
    }
  }, []);

  const handleApply = () => {
    setApplied(true);
    playNotificationSound();
    // Save this worker as an applicant so job giver can see them
    const workerName = localStorage.getItem('kaammadat_user_name') || 'Unknown Worker';
    const workerEmail = localStorage.getItem('kaammadat_user_email') || '';
    const workerPhotosRaw = localStorage.getItem('kaammadat_work_photos');
    const workerPhotos = workerPhotosRaw ? JSON.parse(workerPhotosRaw) : [];
    const applicationsRaw = localStorage.getItem('kaammadat_applications');
    const applications = applicationsRaw ? JSON.parse(applicationsRaw) : [];
    // Avoid duplicate applications for same job
    const alreadyApplied = applications.some((a: any) => a.jobId === job.id && a.workerEmail === workerEmail);
    if (!alreadyApplied) {
      applications.push({
        jobId: job.id,
        jobTitle: job.title,
        workerName,
        workerEmail,
        workerPhotos: workerPhotos.slice(0, 6), // send up to 6 photos
        appliedAt: new Date().toISOString(),
      });
      localStorage.setItem('kaammadat_applications', JSON.stringify(applications));
    }
    // Simulate redirect back to dashboard after payment
    setTimeout(() => {
      window.location.href = '/worker/dashboard';
    }, 3000);
  };

  const handleFraud = async () => {
    setFraudReported(true);
    const workerName = localStorage.getItem('kaammadat_user_name') || 'Unknown Worker';
    const workerEmail = localStorage.getItem('kaammadat_user_email') || '';
    try {
      await saveFraudReport({
        workerName,
        workerEmail,
        jobTitle: job.title,
        reason: 'Reported by worker: Suspected fraud / fake job posting.',
      });
    } catch (e) {
      console.error('Failed to save fraud report:', e);
    }
  };

  if (applied) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-[bounce_1s_ease-in-out] shadow-inner">
           <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
           </svg>
        </div>
        <h3 className="text-3xl font-black text-green-600 mt-5">Application Successful!</h3>
        <p className="text-gray-600 mt-2 font-medium">₹{finalFee.toFixed(2)} deducted. The Job Giver has been notified.</p>
        <p className="text-sm text-gray-400 mt-1 font-semibold">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent font-[family-name:var(--font-geist-sans)] pb-20 relative z-0">
      <IndiaMapBackground activeStateName={job.location} />
      {/* Header Image & Back Button */}
      <div className="relative h-56 w-full animate-[fade-in_0.4s_ease-in-out]">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img src={job.img} className="w-full h-full object-cover animate-[pulse_10s_infinite_alternate]" alt={job.title} />
         <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
         <Link href="/worker/search" className="absolute top-4 left-4 w-10 h-10 bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white font-extrabold hover:bg-white/50 transition">
           ←
         </Link>
         <div className="absolute bottom-4 left-4 text-white">
            <span className="bg-orange-500 text-xs font-bold px-2.5 py-1 rounded-md mb-2 inline-block shadow">{job.type}</span>
            <h1 className="text-3xl font-extrabold tracking-tight">{job.title}</h1>
            <p className="text-sm opacity-90 font-medium">{job.location.includes('GPS') ? 'Captured coordinates' : job.location}</p>
         </div>
      </div>

      <main className="p-4 max-w-4xl mx-auto -mt-4 relative z-10 flex flex-col gap-4">
        
        {/* Info Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-gray-100/50 flex justify-between items-center">
           <div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('daily_wages')}</p>
             <p className="text-2xl font-black text-green-600">₹{job.salary}<span className="text-sm text-gray-500 font-normal">/day</span></p>
           </div>
           <div className="text-right">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dates</p>
             <p className="font-extrabold text-gray-800">{job.date}</p>
           </div>
        </div>

        {/* Job Giver Info */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-gray-100/50 flex justify-between items-center">
           <div className="flex gap-3 items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-xl shadow-inner">
                {job.giver ? job.giver.charAt(0) : 'A'}
              </div>
              <div>
                <p className="font-extrabold text-gray-800">{job.giver || 'Anand Sharma'}</p>
                <p className="text-xs text-green-600 font-bold">Verified Job Giver ✓</p>
              </div>
           </div>
           <button className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition shadow-sm font-bold">
             📞
           </button>
        </div>

        {/* Live Work Map Embed centered exactly on GPS coordinates */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-gray-100/50 overflow-hidden">
           <div className="flex justify-between items-end mb-3">
             <h3 className="font-extrabold text-gray-800">{t('work_location')}</h3>
             <span className="bg-blue-50 text-blue-600 text-xs font-extrabold px-2.5 py-1 rounded-md shadow-sm">
               GPS Precision Map
             </span>
           </div>
           
           <div className="relative h-64 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              {/* Dynamic Coordinate Centered Map Embed */}
              <iframe 
                src={`https://maps.google.com/maps?q=${job.lat},${job.lng}&z=15&output=embed`}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
           </div>

           <div className="mt-3 bg-blue-50/50 p-3 rounded-lg flex items-center justify-between text-xs font-bold text-blue-800 border border-blue-100">
             <span>{job.location}</span>
             <span>GPS: {job.lat.toFixed(4)}°, {job.lng.toFixed(4)}°</span>
           </div>
        </div>

        {/* Apply and Payment Card */}
        <div className="bg-yellow-50/90 backdrop-blur-md rounded-2xl p-5 border border-yellow-200/50 shadow-sm">
           <h4 className="font-extrabold text-yellow-800 mb-3 text-base">{t('checkout')}</h4>
           <div className="flex justify-between text-sm mb-2 font-semibold text-gray-700"><span>Application Fee:</span><span>₹{fee.toFixed(2)}</span></div>
           <div className="flex justify-between text-sm text-green-600 mb-3 font-extrabold"><span>Silver Card Discount (3%):</span><span>-₹{discount.toFixed(2)}</span></div>
           
           <button 
             onClick={() => setPaymentOpen(true)}
             className="w-full mt-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold py-4 rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition transform active:scale-95 text-lg cursor-pointer"
           >
             Pay ₹{finalFee.toFixed(2)} & Apply
           </button>
        </div>

        {/* Fraud Detection */}
        <div className="mt-4 text-center">
           {!fraudReported ? (
             <button onClick={handleFraud} className="text-red-500 text-sm font-bold underline hover:text-red-700 cursor-pointer">
               ⚠️ {t('report_fraud')}
             </button>
           ) : (
             <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold border border-red-100 shadow-sm animate-[bounce_0.5s_ease-in-out]">
               Report submitted to Admin! Kaammadat team is investigating.
             </div>
           )}
        </div>

      </main>

      {/* Real-time UPI Payment Simulation Modal */}
      <PaymentModal 
        isOpen={paymentOpen}
        amount={finalFee}
        title={`Kaammadat Job Application - ${job.title}`}
        onClose={() => setPaymentOpen(false)}
        onSuccess={async () => {
          setPaymentOpen(false);
          // Dispatch real-time payment receipt email
          const userEmail = localStorage.getItem('kaammadat_user_email') || '';
          const userName = localStorage.getItem('kaammadat_user_name') || 'Kaammadat Worker';
          const userRole = localStorage.getItem('kaammadat_user_type') || 'worker';
          if (userEmail) {
            try {
              await sendPaymentReceiptEmail(userEmail, finalFee, `Job Application Fee - ${job.title}`, userRole, userName);
            } catch (mailErr) {
              console.error("Failed to trigger worker receipt email:", mailErr);
            }
          }
          handleApply();
        }}
      />
    </div>
  );
}
