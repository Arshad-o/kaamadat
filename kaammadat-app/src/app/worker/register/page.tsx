"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { sendOTP } from '@/app/actions/emailActions';

export default function WorkerRegister() {
  const { t } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    aadhar: '',
    address: '',
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

    if (!formData.name || !formData.mobile || !formData.email || !formData.aadhar || !formData.address) {
      setError('Please fill in all fields.');
      return;
    }

    if (!formData.terms) {
      setError('You must agree to the Terms & Conditions.');
      return;
    }

    setLoading(true);
    try {
      // Trigger the real-time OTP transmission
      const result = await sendOTP(formData.email);
      if (result.success) {
        // Save worker details to localStorage for access on dashboard & OTP screens
        localStorage.setItem('kaammadat_user_email', formData.email);
        localStorage.setItem('kaammadat_user_name', formData.name);
        localStorage.setItem('kaammadat_user_mobile', formData.mobile);
        localStorage.setItem('kaammadat_user_type', 'worker');

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
                placeholder="+91 xxxxx xxxxx" 
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
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('aadhar_number')}</label>
            <input 
              type="text" 
              name="aadhar"
              value={formData.aadhar}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium" 
              placeholder="xxxx-xxxx-xxxx" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('address')}</label>
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
              {t('agree_terms')}
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
        </form>
      </div>
    </div>
  );
}
