"use client";
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { postJob } from '@/app/actions/jobActions';
import PaymentModal from '@/components/PaymentModal';

export default function PostJob() {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  
  const [fee, setFee] = useState(30);
  const discount = 1.5; // Gold tier 5% discount mock
  const finalFee = fee - discount;

  const [posted, setPosted] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [locationText, setLocationText] = useState('');
  const [locating, setLocating] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const clientAction = async (formData: FormData) => {
    const result = await postJob(formData);
    if (result.success) {
      setPosted(true);
      setTimeout(() => {
        window.location.href = '/worker/search'; // Redirect to worker search to immediately see the result
      }, 2000);
    }
  };

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationText(`Worksite GPS Coordinates (Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)})`);
        setLocating(false);
      },
      (error) => {
        console.error(error);
        alert("Failed to get your location. Please check GPS permissions or type manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the click to upload
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  if (posted) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-[bounce_1s_ease-in-out] shadow-inner">
           <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
           </svg>
        </div>
        <h3 className="text-3xl font-black text-green-600 mt-5">Job Posted Successfully!</h3>
        <p className="text-gray-600 mt-2 font-medium">Payment of ₹{finalFee} received. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight">{t('post_new_job')}</h2>
          <Link href="/job-giver/dashboard" className="text-sm font-bold underline hover:text-orange-100">{t('cancel')}</Link>
        </div>

        <form action={clientAction} className="p-6 md:p-8 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Job Title / Category</label>
              <select name="title" className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium">
                <option value="Electrician">Electrician</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Catering Boys">Catering Boys</option>
                <option value="Bike Mechanic">Bike Mechanic</option>
                <option value="Construction">Construction</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Capacity (Number of Workers)</label>
              <input type="number" name="capacity" min="1" className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium" placeholder="e.g. 10" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
              <input type="date" name="startDate" className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
              <input type="date" name="endDate" className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t('salary')} (₹)</label>
              <input type="number" name="salary" className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium" placeholder="e.g. 800" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Accommodation Provided?</label>
              <select name="accommodation" className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium">
                <option>Yes, Food & Room</option>
                <option>Only Room</option>
                <option>Only Food</option>
                <option>No Accommodation</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-gray-700">{t('address')} {t('location')}</label>
              <button 
                type="button"
                onClick={handleGetLiveLocation}
                disabled={locating}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 hover:bg-orange-100/50 transition cursor-pointer"
              >
                {locating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></span>
                    Locating...
                  </>
                ) : (
                  <>📍 Use Worksite Live GPS</>
                )}
              </button>
            </div>
            <textarea 
              name="location" 
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium" 
              rows={2} 
              placeholder="Enter full work map address or click live GPS above..." 
              required
            ></textarea>
            {coords && (
              <>
                <input type="hidden" name="lat" value={coords.lat} />
                <input type="hidden" name="lng" value={coords.lng} />
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('upload_images')}</label>
            
            {/* Dashed Area Triggering Hidden Input */}
            <div 
              onClick={handleUploadClick}
              className="border-2 border-dashed border-orange-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 bg-orange-50/30 cursor-pointer hover:bg-orange-50 transition border-spacing-2"
            >
              <span className="text-3xl mb-2">📷</span>
              <span className="font-bold text-sm text-orange-600">Click to upload site photos</span>
              <span className="text-xs text-gray-400 mt-1">Supports multiple PNG, JPG, or JPEG images</span>
              
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>

            {/* Uploaded Image Previews */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                {uploadedImages.map((src, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 shadow-sm group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={src} 
                      alt={`Site thumbnail ${index + 1}`} 
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={(e) => removeImage(index, e)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow hover:bg-red-700 transition"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="mt-4 bg-yellow-50 p-5 rounded-2xl border border-yellow-200 shadow-sm">
             <h4 className="font-bold text-yellow-800 mb-3 text-base">Payment Breakdown</h4>
             <div className="flex justify-between text-sm mb-2 font-medium text-gray-600"><span>Base Posting Fee:</span><span>₹{fee.toFixed(2)}</span></div>
             <div className="flex justify-between text-sm text-green-600 mb-2 font-bold"><span>Gold Card Discount (5%):</span><span>-₹{discount.toFixed(2)}</span></div>
             <div className="flex justify-between font-black text-xl mt-3 pt-3 border-t border-yellow-300 text-yellow-900"><span>Total to Pay:</span><span>₹{finalFee.toFixed(2)}</span></div>
          </div>

          <button 
            type="button" 
            onClick={() => setPaymentOpen(true)}
            className="w-full mt-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-extrabold py-4 rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 transition transform active:scale-95 text-lg cursor-pointer"
          >
            Pay ₹{finalFee} & Post Job
          </button>

          {/* Hidden actual submit button */}
          <button type="submit" ref={submitBtnRef} className="hidden" />
        </form>
      </div>

      {/* Real-time UPI Payment Simulation Modal */}
      <PaymentModal 
        isOpen={paymentOpen}
        amount={finalFee}
        title="Kaammadat Job Posting Fee"
        onClose={() => setPaymentOpen(false)}
        onSuccess={() => {
          setPaymentOpen(false);
          submitBtnRef.current?.click();
        }}
      />
    </div>
  );
}
