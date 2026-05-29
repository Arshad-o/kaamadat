"use client";
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { postJob } from '@/app/actions/jobActions';
import { sendPaymentReceiptEmail } from '@/app/actions/emailActions';
import PaymentModal from '@/components/PaymentModal';
import { playNotificationSound } from '@/utils/playSound';
import IndiaMapBackground from '@/components/IndiaMapBackground';
import { indiaLocations } from '@/data/indiaLocations';
import { districtMandals } from '@/data/mandals';

export default function PostJob() {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [fee, setFee] = useState(30);
  const discount = 0; // No discount for part time
  const finalFee = fee - discount;

  const [posted, setPosted] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [locationText, setLocationText] = useState('');
  const [locating, setLocating] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Upgraded Fields States for validation
  const [title, setTitle] = useState('Electrician');
  const [customTitle, setCustomTitle] = useState('');
  const [capacity, setCapacity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salary, setSalary] = useState('');
  const [accommodation, setAccommodation] = useState('Yes, Food & Room');
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');

  // Touched state tracker
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation Checkers
  const isCustomTitleInvalid = title === 'Other' && touched.customTitle && !customTitle.trim();
  const isCapacityInvalid = touched.capacity && (!capacity || parseInt(capacity) <= 0);
  const isStartDateInvalid = touched.startDate && !startDate;
  const isEndDateInvalid = touched.endDate && (!endDate || (startDate && new Date(endDate) < new Date(startDate)));
  const isSalaryInvalid = touched.salary && (!salary || parseInt(salary) <= 0);
  const isLocationInvalid = touched.location && (!selectedState || !selectedDistrict || !selectedMandal || !locationText.trim() || locationText.length < 5);

  const isFormValid = () => {
    if (title === 'Other' && !customTitle.trim()) return false;
    if (!capacity || parseInt(capacity) <= 0) return false;
    if (!startDate) return false;
    if (!endDate) return false;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) return false;
    if (!salary || parseInt(salary) <= 0) return false;
    if (!selectedState || !selectedDistrict || !selectedMandal || !locationText.trim() || locationText.length < 5) return false;
    return true;
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
        // Automatically touch location
        setTouched((prev) => ({ ...prev, location: true }));
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
    e.stopPropagation();
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const executePostJob = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      // Set title: use customTitle if Category is 'Other'
      const finalTitle = title === 'Other' ? customTitle.trim() : title;
      formData.append('title', finalTitle);
      formData.append('capacity', capacity);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('salary', salary);
      formData.append('accommodation', accommodation);
      const giverName = localStorage.getItem('kaammadat_user_name') || 'Unknown';
      formData.append('giverName', giverName);
      const fullLocation = `${locationText}, ${selectedMandal}, ${selectedDistrict}, ${selectedState}`;
      formData.append('location', fullLocation);
      if (coords) {
        formData.append('lat', coords.lat.toString());
        formData.append('lng', coords.lng.toString());
      }

      const result = await postJob(formData);
      if (result.success) {
        // Dispatch real-time payment receipt email
        const userEmail = localStorage.getItem('kaammadat_user_email') || '';
        const userName = localStorage.getItem('kaammadat_user_name') || 'Kaammadat Job Giver';
        const userRole = localStorage.getItem('kaammadat_user_type') || 'job-giver';
        if (userEmail) {
          try {
            await sendPaymentReceiptEmail(userEmail, finalFee, `Job Posting Fee - ${finalTitle}`, userRole, userName);
          } catch (mailErr) {
            console.error("Failed to trigger post job receipt email:", mailErr);
          }
        }
        setPosted(true);
        playNotificationSound();
        setTimeout(() => {
          window.location.href = '/part-time-worker/search';
        }, 2000);
      } else {
        alert("Error posting job to Server. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to Server. Please try again.");
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-[family-name:var(--font-geist-sans)] relative z-0">
      <IndiaMapBackground activeStateName={locationText} />
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100/50">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight">{t('post_new_job')}</h2>
          <Link href="/part-time-job-giver/dashboard" className="text-sm font-bold underline hover:text-orange-100">{t('cancel')}</Link>
        </div>

        <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="p-6 md:p-8 flex flex-col gap-5">
          
          {/* Category selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Job Title / Category</label>
              <select 
                name="title" 
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTouched(prev => ({ ...prev, customTitle: false })); // Reset custom touched
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium"
              >
                <option value="Electrician">Electrician</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Bike Mechanic">Bike Mechanic</option>
                <option value="Catering Boys">Catering Boys</option>
                <option value="Other">Other Category</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-1 ${isCapacityInvalid ? 'text-red-600' : 'text-gray-700'}`}>
                Capacity (Number of Workers)
              </label>
              <input 
                type="number" 
                name="capacity" 
                min="1" 
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                onBlur={() => handleBlur('capacity')}
                className={`w-full px-4 py-3 rounded-lg border text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium ${isCapacityInvalid ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500 animate-[shake_0.4s_ease]' : 'border-gray-300'}`}
                placeholder="e.g. 10" 
              />
              {isCapacityInvalid && (
                <p className="text-xs text-red-650 font-extrabold mt-1">⚠️ Capacity must be at least 1 worker.</p>
              )}
            </div>
          </div>

          {/* Dynamic Custom Work Field */}
          {title === 'Other' && (
            <div className="animate-[slide-down_0.3s_ease]">
              <label className={`block text-sm font-bold mb-1 ${isCustomTitleInvalid ? 'text-red-600' : 'text-orange-700 font-extrabold'}`}>
                ⚙️ Enter Custom Name of Work
              </label>
              <input 
                type="text" 
                name="customTitle"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                onBlur={() => handleBlur('customTitle')}
                className={`w-full px-4 py-3 rounded-lg border text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-semibold ${isCustomTitleInvalid ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500 animate-[shake_0.4s_ease]' : 'border-orange-300 focus:ring-orange-500 focus:border-orange-500 bg-orange-50/10'}`}
                placeholder="e.g. Plumber, Wall Painter, House Mason..." 
              />
              {isCustomTitleInvalid && (
                <p className="text-xs text-red-650 font-extrabold mt-1">⚠️ Please manually enter a custom name for the work.</p>
              )}
            </div>
          )}

          {/* Date selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={`block text-sm font-bold mb-1 ${isStartDateInvalid ? 'text-red-650' : 'text-gray-700'}`}>
                Start Date
              </label>
              <input 
                type="date" 
                name="startDate" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onBlur={() => handleBlur('startDate')}
                className={`w-full px-4 py-3 rounded-lg border text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium ${isStartDateInvalid ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500 animate-[shake_0.4s_ease]' : 'border-gray-300'}`}
              />
              {isStartDateInvalid && (
                <p className="text-xs text-red-600 font-extrabold mt-1">⚠️ Start date is required.</p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-bold mb-1 ${isEndDateInvalid ? 'text-red-650' : 'text-gray-700'}`}>
                End Date
              </label>
              <input 
                type="date" 
                name="endDate" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onBlur={() => handleBlur('endDate')}
                className={`w-full px-4 py-3 rounded-lg border text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium ${isEndDateInvalid ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500 animate-[shake_0.4s_ease]' : 'border-gray-300'}`}
              />
              {isEndDateInvalid && (
                <p className="text-xs text-red-600 font-extrabold mt-1">
                  {!endDate ? '⚠️ End date is required.' : '⚠️ End date cannot be before start date.'}
                </p>
              )}
            </div>
          </div>

          {/* Salary & Accommodation selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={`block text-sm font-bold mb-1 ${isSalaryInvalid ? 'text-red-650' : 'text-gray-700'}`}>
                {t('salary')} (₹)
              </label>
              <input 
                type="number" 
                name="salary" 
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                onBlur={() => handleBlur('salary')}
                className={`w-full px-4 py-3 rounded-lg border text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium ${isSalaryInvalid ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500 animate-[shake_0.4s_ease]' : 'border-gray-300'}`}
                placeholder="e.g. 800" 
              />
              {isSalaryInvalid && (
                <p className="text-xs text-red-600 font-extrabold mt-1">⚠️ Daily wage salary must be greater than ₹0.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Accommodation Provided?</label>
              <select 
                name="accommodation" 
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium"
              >
                <option value="Yes, Food & Room">Yes, Food & Room</option>
                <option value="Only Room">Only Room</option>
                <option value="Only Food">Only Food</option>
                <option value="No Accommodation">No Accommodation</option>
              </select>
            </div>
          </div>

          {/* Location Area */}
          <div>
            {/* State, District, Mandal selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDistrict(''); setSelectedMandal(''); }} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold">
                  <option value="">Select State</option>
                  {Object.keys(indiaLocations).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">District</label>
                <select value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setSelectedMandal(''); }} disabled={!selectedState} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold disabled:opacity-50">
                  <option value="">Select District</option>
                  {selectedState && indiaLocations[selectedState]?.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mandal</label>
                <select value={selectedMandal} onChange={e => setSelectedMandal(e.target.value)} disabled={!selectedDistrict} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold disabled:opacity-50">
                  <option value="">Select Mandal</option>
                  {selectedDistrict && districtMandals[selectedDistrict]?.map(mandal => (
                    <option key={mandal} value={mandal}>{mandal}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mb-1">
              <label className={`block text-sm font-bold ${isLocationInvalid ? 'text-red-650' : 'text-gray-700'}`}>
                {t('address')} {t('location')}
              </label>
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
              onBlur={() => handleBlur('location')}
              className={`w-full px-4 py-3 rounded-lg border text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium ${isLocationInvalid ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500 animate-[shake_0.4s_ease]' : 'border-gray-300'}`} 
              rows={2} 
              placeholder="Enter full work map address or click live GPS above..." 
            ></textarea>
            {isLocationInvalid && (
              <p className="text-xs text-red-600 font-extrabold mt-1">⚠️ Please select State, District, Mandal and enter a detailed address (min 5 letters).</p>
            )}
            {coords && (
              <>
                <input type="hidden" name="lat" value={coords.lat} />
                <input type="hidden" name="lng" value={coords.lng} />
              </>
            )}
          </div>

          {/* Upload Images */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('upload_images')}</label>
            
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

          {/* Payment breakdown */}
          <div className="mt-4 bg-yellow-50 p-5 rounded-2xl border border-yellow-200 shadow-sm">
             <h4 className="font-bold text-yellow-800 mb-3 text-base">Payment Breakdown</h4>
             <div className="flex justify-between text-sm mb-2 font-medium text-gray-600"><span>Base Posting Fee:</span><span>₹{fee.toFixed(2)}</span></div>
             <div className="flex justify-between font-black text-xl mt-3 pt-3 border-t border-yellow-300 text-yellow-900"><span>Total to Pay:</span><span>₹{finalFee.toFixed(2)}</span></div>
          </div>

          {/* Validation Banner Indicator */}
          {!isFormValid() && (
            <div className="bg-orange-50 border border-orange-200 text-orange-850 p-4 rounded-xl text-xs font-bold my-1 text-left flex items-start gap-2.5 shadow-sm border-l-4 border-l-orange-500 animate-[pulse_3s_infinite]">
              <span className="text-base">⚠️</span>
              <div>
                <p className="font-extrabold text-orange-950">Form details incomplete or incorrect</p>
                <p className="mt-0.5 font-semibold text-orange-800/90 leading-relaxed">
                  Please correct the highlighted inputs and fill out all fields to enable the secure payment button.
                </p>
              </div>
            </div>
          )}

          {/* Payment Trigger Button */}
          <button 
            type="button" 
            disabled={!isFormValid() || loading}
            onClick={() => setPaymentOpen(true)}
            className="w-full mt-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-extrabold py-4 rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 transition transform active:scale-95 text-lg cursor-pointer disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            Pay ₹{finalFee} & Post Job
          </button>
        </form>
      </div>

      {/* Real-time UPI Payment Simulation Modal */}
      <PaymentModal 
        isOpen={paymentOpen}
        amount={finalFee}
        title="Kaammadat Job Posting Fee"
        onClose={() => setPaymentOpen(false)}
        onSuccess={executePostJob}
      />
    </div>
  );
}
