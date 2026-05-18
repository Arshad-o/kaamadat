"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { registerUser } from '@/app/actions/userActions';

export default function JobGiverRegister() {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    if (!formData.name || !formData.mobile || !formData.email || !formData.aadhar || !formData.address || !formData.password) {
      setError('Please fill in all fields.');
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
      data.append('type', 'job-giver');

      // Trigger the real-time registration & OTP transmission
      const result = await registerUser(data) as any;
      if (result.success) {
        // Save job giver details to localStorage for access on dashboard & OTP screens
        localStorage.setItem('kaammadat_user_email', formData.email);
        localStorage.setItem('kaammadat_user_name', formData.name);
        localStorage.setItem('kaammadat_user_mobile', formData.mobile);
        localStorage.setItem('kaammadat_user_type', 'job-giver');

        if (result.otpResult?.simulated && result.otpResult?.otp) {
          localStorage.setItem('kaammadat_simulated_otp', result.otpResult.otp);
        } else {
          localStorage.removeItem('kaammadat_simulated_otp');
        }

        router.push('/job-giver/otp');
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100 transition hover:shadow-green-100">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-center text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">{t('i_am_giver')}</h2>
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium" 
              placeholder="e.g. Anand Sharma" 
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium" 
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium" 
                placeholder="anand@example.com" 
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('aadhar_number')}</label>
            <input 
              type="text" 
              name="aadhar"
              value={formData.aadhar}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium" 
              placeholder="12 digit aadhar number" 
              maxLength={12}
              minLength={12}
              pattern="\d{12}"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Set Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium" 
              placeholder="Min 6 characters" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('address')}</label>
            <textarea 
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium" 
              rows={2} 
              placeholder="Mumbai, Maharashtra"
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
              className="mt-1 w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer bg-white" 
            />
             <label htmlFor="terms" className="text-xs text-gray-600 font-semibold cursor-pointer select-none leading-relaxed">
               I agree to the <Link href="/terms" target="_blank" className="text-green-600 font-black hover:underline cursor-pointer">Terms & Conditions</Link> and confirm that all details provided are unique and true.
             </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-orange-600 transition transform active:scale-95 disabled:bg-gray-400 flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            {t('get_otp')}
          </button>
          
          <div className="text-center mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-semibold">
              Already have an account?{' '}
              <Link href="/login" className="text-green-700 font-black hover:underline">
                Login Here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
