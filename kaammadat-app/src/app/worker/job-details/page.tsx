"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function JobDetails() {
  const [applied, setApplied] = useState(false);
  const [fraudReported, setFraudReported] = useState(false);
  
  const fee = 20;
  const discount = 0.6; // Silver Tier 3% discount
  const finalFee = fee - discount;

  const handleApply = () => {
    setApplied(true);
    // Simulate redirect back to dashboard after payment
    setTimeout(() => {
      window.location.href = '/worker/dashboard';
    }, 3000);
  };

  const handleFraud = () => {
    setFraudReported(true);
  };

  if (applied) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-[bounce_1s_ease-in-out]">
           <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
           </svg>
        </div>
        <h3 className="text-3xl font-bold text-green-600 mt-4">Application Successful!</h3>
        <p className="text-gray-600 mt-2">₹{finalFee.toFixed(2)} deducted. The Job Giver has been notified.</p>
        <p className="text-sm text-gray-400 mt-1">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] pb-20">
      {/* Header Image & Back Button */}
      <div className="relative h-48 w-full">
         <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=400&fit=crop" className="w-full h-full object-cover" alt="Electrician Work" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
         <Link href="/worker/search" className="absolute top-4 left-4 w-10 h-10 bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white font-bold hover:bg-white/50 transition">
           ←
         </Link>
         <div className="absolute bottom-4 left-4 text-white">
            <span className="bg-orange-500 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">Electrician</span>
            <h1 className="text-2xl font-bold">Electrician (Wiring)</h1>
            <p className="text-sm opacity-90">Srinagar, Kashmir</p>
         </div>
      </div>

      <main className="p-4 max-w-4xl mx-auto -mt-4 relative z-10 flex flex-col gap-4">
        
        {/* Info Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-center">
           <div>
             <p className="text-sm text-gray-500">Daily Salary</p>
             <p className="text-2xl font-bold text-green-600">₹800<span className="text-sm text-gray-500 font-normal">/day</span></p>
           </div>
           <div className="text-right">
             <p className="text-sm text-gray-500">Dates</p>
             <p className="font-bold text-gray-800">Oct 15 - Oct 20</p>
           </div>
        </div>

        {/* Job Giver Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-center">
           <div className="flex gap-3 items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">A</div>
              <div>
                <p className="font-bold text-gray-800">Anand Sharma</p>
                <p className="text-sm text-gray-500">Verified Job Giver ✓</p>
              </div>
           </div>
           <button className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
             📞
           </button>
        </div>

        {/* Map & Routing Simulation */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden">
           <div className="flex justify-between items-end mb-3">
             <h3 className="font-bold text-gray-800">Route & Distance</h3>
             <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">2,850 km away</span>
           </div>
           
           <div className="relative h-48 bg-gray-200 rounded-xl overflow-hidden border border-gray-300">
              {/* Mock Map Background */}
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop" className="w-full h-full object-cover opacity-70" alt="Map" />
              
              {/* Mock Route Line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M 20 80 Q 50 50 80 20" stroke="#3b82f6" strokeWidth="3" fill="none" strokeDasharray="5,5" className="animate-[dash_1s_linear_infinite]" />
                 <circle cx="20" cy="80" r="4" fill="#ef4444" /> {/* Start */}
                 <circle cx="80" cy="20" r="4" fill="#22c55e" /> {/* End */}
              </svg>

              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur p-2 rounded-lg text-xs font-bold shadow">
                 ETA: 48 Hours via NH44
              </div>
           </div>
        </div>

        {/* Apply and Payment Card */}
        <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
           <div className="flex justify-between text-sm mb-1 text-gray-700"><span>Application Fee:</span><span>₹{fee.toFixed(2)}</span></div>
           <div className="flex justify-between text-sm text-green-600 mb-2"><span>Silver Card Discount (3%):</span><span>-₹{discount.toFixed(2)}</span></div>
           
           <button onClick={handleApply} className="w-full mt-2 bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 transition transform active:scale-95 text-lg">
             Pay ₹{finalFee.toFixed(2)} & Apply
           </button>
        </div>

        {/* Fraud Detection */}
        <div className="mt-4 text-center">
           {!fraudReported ? (
             <button onClick={handleFraud} className="text-red-500 text-sm font-semibold underline hover:text-red-700">
               ⚠️ Report Fraud / Fake Job
             </button>
           ) : (
             <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-semibold">
               Report submitted to Admin! Kaammadat team is investigating.
             </div>
           )}
        </div>

      </main>
    </div>
  );
}
