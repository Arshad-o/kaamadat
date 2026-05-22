"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Verification() {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setStep(2);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] pb-10">
      <header className="bg-purple-600 text-white p-4 shadow-md flex items-center gap-4 sticky top-0 z-10">
        <Link href="/worker/dashboard" className="text-white hover:opacity-80 transition font-black text-xl">←</Link>
        <h1 className="font-bold text-xl">Trust & Verification</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto flex flex-col gap-6 mt-4">
        
        {/* Verification Status Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
          {step === 1 ? (
             <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-slate-200">
               👤
             </div>
          ) : (
             <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-blue-100 relative">
               👤
               <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-white shadow-md">
                 ✓
               </div>
             </div>
          )}
          
          <h2 className="text-2xl font-black text-slate-800">
            {step === 1 ? 'Unverified Account' : 'Verified Worker'}
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            {step === 1 
              ? 'Get the blue tick to increase your chances of getting hired by 300%.' 
              : 'Your Aadhar has been verified. Job givers trust you more!'}
          </p>

          {step === 1 && (
            <div className="w-full mt-6 bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-300">
              <div className="text-3xl mb-2">📄</div>
              <p className="font-bold text-slate-700 mb-4">Upload Aadhar Card Image</p>
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : 'Select Image & Upload'}
              </button>
            </div>
          )}
        </div>

        {/* Ratings Section */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-4">Your Ratings</h3>
          
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-100">
            <div className="text-center">
              <p className="text-5xl font-black text-slate-800">4.8</p>
              <div className="flex text-yellow-400 text-sm mt-1">
                ★★★★<span className="text-slate-300">★</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center text-xs font-bold text-slate-500 gap-2 mb-1">
                <span className="w-8">5★</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="w-[85%] h-full bg-yellow-400"></div></div>
                <span className="w-8 text-right">85%</span>
              </div>
              <div className="flex items-center text-xs font-bold text-slate-500 gap-2 mb-1">
                <span className="w-8">4★</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="w-[10%] h-full bg-yellow-400"></div></div>
                <span className="w-8 text-right">10%</span>
              </div>
              <div className="flex items-center text-xs font-bold text-slate-500 gap-2">
                <span className="w-8">1-3★</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="w-[5%] h-full bg-yellow-400"></div></div>
                <span className="w-8 text-right">5%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Recent Reviews</h4>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-slate-800 text-sm">Anand Sharma</p>
                <span className="text-yellow-400 text-xs tracking-widest">★★★★★</span>
              </div>
              <p className="text-slate-600 text-sm font-medium">Very hardworking and arrived on time. Highly recommended for plumbing jobs.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-slate-800 text-sm">Priya Desai</p>
                <span className="text-yellow-400 text-xs tracking-widest">★★★★<span className="text-slate-300">★</span></span>
              </div>
              <p className="text-slate-600 text-sm font-medium">Good work, but took a bit longer than estimated. Overall satisfied.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
