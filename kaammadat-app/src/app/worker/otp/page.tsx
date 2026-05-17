"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { verifyOTP, sendOTP } from '@/app/actions/emailActions';
import { playNotificationSound } from '@/utils/playSound';

export default function WorkerOTP() {
  const { t } = useLanguage();
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  // References for automatic focus switching
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    const savedEmail = localStorage.getItem('kaammadat_user_email') || 'your email';
    setEmail(savedEmail);
    const savedSimulated = localStorage.getItem('kaammadat_simulated_otp') || '';
    setSimulatedOtp(savedSimulated);
  }, []);

  // 30 seconds countdown for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    setError('');
    if (isNaN(Number(value))) return; // only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Automatically focus next input box
    if (value !== '' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      // Focus previous input box on backspace
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 4 && !isNaN(Number(pasteData))) {
      const digits = pasteData.split('');
      setOtp(digits);
      inputRefs[3].current?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 4) {
      setError('Please enter a 4-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyOTP(fullOtp);
      if (result.success) {
        playNotificationSound();
        setVerified(true);
        // Save persistent login session
        localStorage.setItem('kaammadat_user_logged_in', 'true');
        localStorage.setItem('kaammadat_user_type', 'worker');
        setTimeout(() => {
          router.push('/worker/dashboard');
        }, 2000);
      } else {
        setError(result.error || 'Invalid OTP code. Please check and try again.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      const result = await sendOTP(email);
      if (result.success) {
        setResendTimer(30);
        if (result.simulated && result.otp) {
          setSimulatedOtp(result.otp);
          localStorage.setItem('kaammadat_simulated_otp', result.otp);
        }
        playNotificationSound();
      } else {
        setError(result.error || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex flex-col items-center justify-center p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center border border-orange-100 transition hover:shadow-orange-200">
        
        {!verified ? (
          <>
            {simulatedOtp && (
              <div className="bg-orange-50 border border-orange-200 text-orange-850 p-4 rounded-xl text-xs font-bold mb-6 text-left flex items-start gap-3 shadow-sm border-l-4 border-l-orange-500 animate-[pulse_2s_infinite]">
                <span className="text-lg">💡</span>
                <div>
                  <p className="font-black text-orange-950 text-sm">Developer Sandbox Mode</p>
                  <p className="mt-1 font-semibold text-orange-850 leading-relaxed">
                    Gmail is currently blocked or unset. Use this test OTP to verify:
                    <span className="bg-orange-200 text-orange-950 font-black px-2 py-0.5 rounded ml-1 text-sm tracking-widest font-mono select-all border border-orange-300">{simulatedOtp}</span>
                  </p>
                </div>
              </div>
            )}
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">{t('verify_otp')}</h2>
            <p className="text-gray-600 mt-3 mb-6 text-sm font-medium">
              {t('enter_otp_sent_to')} <span className="text-orange-600 font-bold block mt-1 text-base">{email}</span> {t('through')} <span className="text-blue-600 font-bold">kaammadat@gmail.com</span>
            </p>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200 font-bold mb-5 animate-[shake_0.5s_ease-in-out]">
                ⚠️ {error}
              </div>
            )}

            <div className="flex justify-center gap-4 mb-8">
              {otp.map((digit, i) => (
                <input 
                  key={i} 
                  ref={inputRefs[i]}
                  type="text" 
                  maxLength={1} 
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className="w-14 h-14 text-center text-3xl font-extrabold rounded-xl border-2 border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition" 
                />
              ))}
            </div>

            <button 
              onClick={handleVerify} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold py-4 rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition transform active:scale-95 disabled:bg-gray-400 flex items-center justify-center gap-2 cursor-pointer text-base"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : null}
              {t('verify_and_login')}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center py-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-[bounce_1s_ease-in-out] shadow-inner">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-green-600 mt-5">{t('login_success')}</h3>
            <p className="text-gray-500 mt-2 font-medium">{t('redirecting')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
