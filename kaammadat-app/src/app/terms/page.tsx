"use client";
import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-[family-name:var(--font-geist-sans)] text-gray-800 py-10 px-4 md:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-[fade-in_0.5s_ease-out]">
        
        {/* Tricolor Ribbon Header */}
        <div className="h-3 w-full bg-gradient-to-r from-orange-500 via-gray-400 to-green-600"></div>

        {/* Content Container */}
        <div className="p-8 md:p-12">
          
          {/* Logo / Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">
              KAAMMADAT
            </h1>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mt-1">
              National Workforce Platform of India
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-green-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-3 border-gray-100 flex items-center gap-2">
            ⚖️ Terms & Conditions
          </h2>

          <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium">
            Welcome to Kaammadat. By accessing, registering, or using our mobile application and workforce services, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully.
          </p>

          {/* Terms Sections */}
          <div className="space-y-8 text-sm leading-relaxed text-gray-600">
            
            {/* Section 1 */}
            <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-base font-extrabold text-gray-800 mb-2 flex items-center gap-2">
                1. 🪪 Identity Verification & Aadhar Policy
              </h3>
              <p className="font-semibold text-gray-600">
                To prevent duplicate entries and identity theft, every Worker and Job Giver must register with unique credentials. 
                Each user profile requires a single unique Aadhar Card number, a unique active Indian Mobile number, and a unique verified Email address. 
                Any duplicate attempts using another citizen's credentials will be strictly rejected.
              </p>
            </section>

            {/* Section 2 */}
            <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-base font-extrabold text-gray-800 mb-2 flex items-center gap-2">
                2. 💸 Payment Terms & UPI Processing
              </h3>
              <p className="font-semibold text-gray-600">
                All platform payment checkouts (including worker application fees and employer job postings) are processed directly via secure Indian UPI protocols. 
                Upon successful bank payload credit, Kaammadat instantly issues digital tricolor tax receipts to the registered email address.
              </p>
            </section>

            {/* Section 3 */}
            <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-base font-extrabold text-gray-800 mb-2 flex items-center gap-2">
                3. 🏅 Workforce Loyalty Card Program
              </h3>
              <p className="font-semibold text-gray-600">
                Active daily wage workers receive access to the Kaammadat Loyalty Card, enabling benefits and partner discounts at local merchant networks. 
                Loyalty cards are linked directly to your authenticated mobile number and are non-transferable.
              </p>
            </section>

            {/* Section 4 */}
            <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-base font-extrabold text-gray-800 mb-2 flex items-center gap-2">
                4. 🚫 Anti-Fraud & Admin Evaporation Policies
              </h3>
              <p className="font-semibold text-gray-600">
                We implement zero tolerance for fake postings or non-payment. 
                If a Job Giver is reported for withholding promised salaries, or a worker is found engaging in malicious acts, the Admin Control Panel reserves the absolute right to "Evaporate" (permanently ban and remove) the offending user's account session from our server records.
              </p>
            </section>

          </div>

          {/* Footer Back Button */}
          <div className="mt-12 pt-6 border-t border-gray-100 text-center">
            <button 
              onClick={() => window.close()} 
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-green-600 text-white font-extrabold rounded-xl shadow-lg hover:opacity-95 transition cursor-pointer active:scale-95 text-sm"
            >
              Close Document
            </button>
            <p className="text-[10px] text-gray-400 mt-4 font-bold">
              © {new Date().getFullYear()} Kaammadat National Workforce Platform. All Rights Reserved.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
