"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { registerUser } from '@/app/actions/userActions';
import { indiaLocations } from '@/data/indiaLocations';
import { districtMandals } from '@/data/mandals';
import { verifyMandalInternet, addCustomMandal, getCustomMandals } from '@/app/actions/mandalActions';
import KycModal from '@/components/KycModal';

export default function WorkerRegister() {
  const { t } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    aadhar: '',
    address: '',
    password: '',
    terms: false,
  });

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);

  const [customMandalsDb, setCustomMandalsDb] = useState<Record<string, string[]>>({});
  const [customMandalInput, setCustomMandalInput] = useState('');
  const [isVerifyingMandal, setIsVerifyingMandal] = useState(false);
  const [mandalVerificationMsg, setMandalVerificationMsg] = useState({ text: '', type: '' });
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  useEffect(() => {
    getCustomMandals().then(setCustomMandalsDb);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.mobile || !formData.email || !formData.aadhar || !formData.address || !formData.password || !selectedState || !selectedDistrict || !selectedMandal) {
      setError('Please fill in all fields including location details.');
      return;
    }

    if (formData.mobile.length !== 10 || !/^\d{10}$/.test(formData.mobile)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (formData.aadhar.length !== 12 || !/^\d{12}$/.test(formData.aadhar)) {
      setError('Aadhar number must be exactly 12 digits.');
      return;
    }

    if (!formData.terms) {
      setError('You must agree to the Terms & Conditions.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('mobile', formData.mobile);
      data.append('email', formData.email);
      data.append('aadhar', formData.aadhar);
      data.append('address', formData.address);
      data.append('password', formData.password);
      data.append('type', 'worker');

      // Trigger the real-time registration & OTP transmission
      const result = await registerUser(data) as any;
      if (result.success) {
        // Save worker details to localStorage for access on dashboard & OTP screens
        localStorage.setItem('kaammadat_user_email', formData.email);
        localStorage.setItem('kaammadat_user_name', formData.name);
        localStorage.setItem('kaammadat_user_mobile', formData.mobile);
        localStorage.setItem('kaammadat_user_type', 'worker');
        localStorage.setItem('kaammadat_user_location', `${selectedMandal}, ${selectedDistrict}, ${selectedState}`);

        if (result.otpResult?.simulated && result.otpResult?.otp) {
          localStorage.setItem('kaammadat_simulated_otp', result.otpResult.otp);
        } else {
          localStorage.removeItem('kaammadat_simulated_otp');
        }

        router.push('/worker/otp');
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex flex-col items-center justify-center p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-orange-100 transition hover:shadow-orange-100">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-center text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">{t('i_am_worker')}</h2>
          <p className="opacity-95 mt-2 text-sm">{t('powered_by')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200 font-semibold animate-[shake_0.5s_ease-in-out]">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('full_name')}</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium" 
              placeholder="e.g. Rahul Kumar" 
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t('mobile_number')}</label>
              <input 
                type="tel" 
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium" 
                placeholder="10 digit mobile number" 
                maxLength={10}
                minLength={10}
                pattern="\d{10}"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t('email_id')}</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium" 
                placeholder="rahul@example.com" 
                required
              />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <label className="text-sm font-bold text-gray-700">{t('aadhar_number')}</label>
              {kycVerified && <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">✅ KYC Verified</span>}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                name="aadhar"
                value={formData.aadhar}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium" 
                placeholder="12 digit aadhar number" 
                maxLength={12}
                minLength={12}
                pattern="\d{12}"
                required
              />
              <button
                type="button"
                onClick={() => {
                  if (formData.aadhar.length !== 12 || !/^\d{12}$/.test(formData.aadhar)) {
                    setError('Please enter a valid 12-digit Aadhar number first.');
                    return;
                  }
                  if (formData.mobile.length !== 10 || !/^\d{10}$/.test(formData.mobile)) {
                    setError('Please enter a valid 10-digit mobile number first.');
                    return;
                  }
                  setError('');
                  setShowKycModal(true);
                }}
                disabled={kycVerified}
                className={`px-4 py-3 rounded-lg font-bold text-sm transition cursor-pointer shrink-0 ${kycVerified ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' : 'bg-blue-600 hover:bg-blue-700 text-white shadow'}`}
              >
                {kycVerified ? '✅ Done' : '🏛️ Verify'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Set Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium" 
                placeholder="Min 6 characters" 
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 p-2 focus:outline-none"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
              <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDistrict(''); setSelectedMandal(''); }} className="w-full px-3 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium">
                <option value="">Select State</option>
                {Object.keys(indiaLocations).map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">District</label>
              <select value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setSelectedMandal(''); }} disabled={!selectedState} className="w-full px-3 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium disabled:opacity-50">
                <option value="">Select District</option>
                {selectedState && indiaLocations[selectedState]?.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 sm:col-span-3">
              <label className="block text-sm font-bold text-gray-700 mb-1">Mandal</label>
              <select value={selectedMandal} onChange={e => setSelectedMandal(e.target.value)} disabled={!selectedDistrict} className="w-full px-3 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium disabled:opacity-50">
                <option value="">Select Mandal</option>
                {selectedDistrict && (() => {
                  const staticM = districtMandals[selectedDistrict] || [];
                  const customM = customMandalsDb[selectedDistrict] || [];
                  const allM = Array.from(new Set([...staticM, ...customM])).sort();
                  return allM.map(mandal => (
                    <option key={mandal} value={mandal}>{mandal}</option>
                  ));
                })()}
                {selectedDistrict && <option value="Other" className="font-bold text-orange-600 bg-orange-50">➕ Other (Add New)</option>}
              </select>

              {selectedMandal === 'Other' && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mt-2 animate-[fade-in_0.3s_ease-out]">
                  <label className="block text-sm font-bold text-orange-800 mb-2">Dictate or Type your Mandal</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customMandalInput}
                      onChange={(e) => setCustomMandalInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                      placeholder="E.g. Koregaon Park"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        setIsVoiceListening(true);
                        setTimeout(() => {
                           setCustomMandalInput("Aundh"); // Simulated voice input
                           setIsVoiceListening(false);
                        }, 2500);
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition border border-orange-300 ${isVoiceListening ? 'bg-red-500 text-white animate-pulse border-red-500' : 'bg-white text-orange-700 hover:bg-orange-100'}`}
                      title="Speak"
                    >
                      🎙️
                    </button>
                    <button 
                      type="button"
                      onClick={async () => {
                        if(!customMandalInput) return;
                        setIsVerifyingMandal(true);
                        setMandalVerificationMsg({ text: 'Verifying on internet...', type: 'info' });
                        const res = await verifyMandalInternet(selectedDistrict, customMandalInput);
                        if (res.verified) {
                          await addCustomMandal(selectedDistrict, customMandalInput);
                          const updated = await getCustomMandals();
                          setCustomMandalsDb(updated);
                          setSelectedMandal(customMandalInput);
                          setMandalVerificationMsg({ text: '', type: '' });
                          setCustomMandalInput('');
                        } else {
                          setMandalVerificationMsg({ text: res.message, type: 'error' });
                        }
                        setIsVerifyingMandal(false);
                      }}
                      disabled={isVerifyingMandal || !customMandalInput}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-lg font-bold text-sm disabled:opacity-50"
                    >
                      {isVerifyingMandal ? '...' : 'Verify'}
                    </button>
                  </div>
                  {mandalVerificationMsg.text && (
                    <p className={`text-xs mt-2 font-bold ${mandalVerificationMsg.type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>
                      {mandalVerificationMsg.text}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <label className="text-sm font-bold text-gray-700">{t('address')}</label>
              <span className="text-xs text-orange-600 font-semibold bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">📮 Note: Type correct address for getting the card for your address by post</span>
            </div>
            <textarea 
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium" 
              rows={2} 
              placeholder="Srinagar, Kashmir"
              required
            ></textarea>
          </div>

          <div className="flex items-start gap-3 mt-2">
            <input 
              type="checkbox" 
              name="terms"
              id="terms" 
              checked={formData.terms}
              onChange={handleChange}
              className="mt-1 w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer bg-white" 
            />
            <label htmlFor="terms" className="text-xs text-gray-600 font-semibold cursor-pointer select-none leading-relaxed">
              I agree to the <Link href="/terms" target="_blank" className="text-orange-600 font-black hover:underline cursor-pointer">Terms & Conditions</Link> and confirm that all details provided are unique and true.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-green-700 transition transform active:scale-95 disabled:bg-gray-400 flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            {t('get_otp')}
          </button>
          
          <div className="text-center mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-semibold">
              Already have an account?{' '}
              <Link href="/login" className="text-orange-600 font-black hover:underline">
                Login Here
              </Link>
            </p>
          </div>
        </form>
      </div>

      <KycModal
        isOpen={showKycModal}
        aadhar={formData.aadhar}
        mobile={formData.mobile}
        userEmail={formData.email}
        onVerified={() => { setKycVerified(true); setShowKycModal(false); }}
        onClose={() => setShowKycModal(false)}
      />
    </div>
  );
}
