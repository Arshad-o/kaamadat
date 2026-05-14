"use client";
import { useState } from 'react';
import Link from 'next/link';
import { postJob } from '@/app/actions/jobActions';

export default function PostJob() {
  const [fee, setFee] = useState(30);
  const discount = 1.5; // Gold tier 5% discount mock
  const finalFee = fee - discount;

  const [posted, setPosted] = useState(false);

  const clientAction = async (formData: FormData) => {
    const result = await postJob(formData);
    if (result.success) {
      setPosted(true);
      setTimeout(() => {
        window.location.href = '/worker/search'; // Redirect to worker search to immediately see the result
      }, 2000);
    }
  };

  if (posted) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-[bounce_1s_ease-in-out]">
           <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
           </svg>
        </div>
        <h3 className="text-3xl font-bold text-green-600 mt-4">Job Posted Successfully!</h3>
        <p className="text-gray-600 mt-2">Payment of ₹{finalFee} received. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-orange-500 p-6 text-white flex items-center justify-between">
          <h2 className="text-2xl font-bold">Post a New Job</h2>
          <Link href="/job-giver/dashboard" className="text-sm underline hover:text-gray-200">Cancel</Link>
        </div>

        <form action={clientAction} className="p-6 md:p-8 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title / Category</label>
              <select name="title" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none">
                <option value="Electrician">Electrician</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Catering Boys">Catering Boys</option>
                <option value="Bike Mechanic">Bike Mechanic</option>
                <option value="Construction">Construction</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Number of Workers)</label>
              <input type="number" name="capacity" min="1" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. 10" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" name="startDate" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" name="endDate" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Salary (₹)</label>
              <input type="number" name="salary" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. 800" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation Provided?</label>
              <select name="accommodation" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none">
                <option>Yes, Food & Room</option>
                <option>Only Room</option>
                <option>Only Food</option>
                <option>No Accommodation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Address Location</label>
            <textarea name="location" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" rows={2} placeholder="Enter full map address..." required></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Location Images (Mock)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 bg-gray-50 cursor-pointer hover:bg-gray-100">
              <span>📷 Click to upload images of the work site</span>
            </div>
          </div>

          {/* Payment Section */}
          <div className="mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
             <h4 className="font-bold text-yellow-800 mb-2">Payment Breakdown</h4>
             <div className="flex justify-between text-sm mb-1"><span>Base Posting Fee:</span><span>₹{fee.toFixed(2)}</span></div>
             <div className="flex justify-between text-sm text-green-600 mb-1"><span>Gold Card Discount (5%):</span><span>-₹{discount.toFixed(2)}</span></div>
             <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-yellow-300"><span>Total to Pay:</span><span>₹{finalFee.toFixed(2)}</span></div>
          </div>

          <button type="submit" className="w-full mt-2 bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition transform active:scale-95 text-lg">
            Pay ₹{finalFee} & Post Job
          </button>
        </form>
      </div>
    </div>
  );
}
