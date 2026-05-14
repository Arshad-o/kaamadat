"use client";
import { useState } from 'react';
import Link from 'next/link';
import { playNotificationSound } from '@/utils/playSound';

export default function JobGiverOTP() {
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    playNotificationSound();
    setVerified(true);
    setTimeout(() => {
      window.location.href = '/job-giver/dashboard';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border border-green-100">
        
        {!verified ? (
          <>
            <h2 className="text-3xl font-bold text-gray-800">Verify OTP</h2>
            <p className="text-gray-500 mt-2 mb-6">Enter the OTP sent to kaammadat@gmail.com</p>
            
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <input 
                  key={i} 
                  type="text" 
                  maxLength={1} 
                  className="w-14 h-14 text-center text-2xl font-bold rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" 
                />
              ))}
            </div>

            <button onClick={handleVerify} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 transition">
              Verify & Login
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center py-8">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center animate-[bounce_1s_ease-in-out]">
              <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-orange-500 mt-4">Login Successful!</h3>
            <p className="text-gray-500 mt-2">Redirecting to your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
