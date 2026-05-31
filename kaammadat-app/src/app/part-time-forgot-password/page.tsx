"use client";
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { requestPasswordResetOTP, resetPassword } from '@/app/actions/userActions';
import { playNotificationSound } from '@/utils/playSound';
import { useLanguage } from '@/context/LanguageContext';

function PTForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  // States
  const [role, setRole] = useState<'part-time-worker' | 'part-time-job-giver'>('part-time-worker');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // References for automatic OTP box switching
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Autofill role from query param
  useEffect(() => {
    const queryRole = searchParams.get('role');
    if (queryRole === 'part-time-worker' || queryRole === 'part-time-job-giver') {
      setRole(queryRole as any);
    }
  }, [searchParams]);

  // Handle requesting the OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await requestPasswordResetOTP(email, role) as any;
      if (result.success) {
        if (result.simulated && result.otp) {
          setSimulatedOtp(result.otp);
        } else {
          setSimulatedOtp('');
        }
        setStep(2);
        setSuccess('Verification OTP has been sent to your email.');
      } else {
        setError(result.error || 'Failed to dispatch verification email.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    setError('');
    if (isNaN(Number(value))) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value !== '' && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(Number(pasteData))) {
      const digits = pasteData.split('');
      setOtpDigits(digits);
      inputRefs[5].current?.focus();
    }
  };

  // Verify OTP & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const fullOtp = otpDigits.join('');

    try {
      const result = await resetPassword(email, fullOtp, newPassword, role);
      if (result.success) {
        playNotificationSound();
        setSuccess('Password updated successfully!');
        setStep(3);
        setTimeout(() => {
          router.push('/part-time-login');
        }, 2500);
      } else {
        setError(result.error || 'Failed to reset password. Please check the OTP code.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Theme Styling
  const getThemeClass = () => {
    if (role === 'part-time-worker') return 'bg-blue-50';
    return 'bg-indigo-50';
  };

  const getInputClass = () => {
    if (role === 'part-time-worker') return 'bg-white border-gray-300 text-slate-800 focus:ring-blue-500 focus:border-blue-500';
    return 'bg-white border-gray-300 text-slate-800 focus:ring-indigo-500 focus:border-indigo-500';
  };

  const getButtonClass = () => {
    if (role === 'part-time-worker') return 'bg-blue-600 hover:bg-blue-700';
    return 'bg-indigo-600 hover:bg-indigo-700';
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-[family-name:var(--font-geist-sans)] transition-all duration-500 ${getThemeClass()}`}>
      <div className={`w-full max-w-md rounded-2xl border p-8 transition duration-500 bg-white border-slate-100 shadow-2xl text-slate-800`}>
        
        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <span className="text-4xl">🔐</span>
              <h2 className="text-2xl font-black mt-3 tracking-tight">Forgot Password</h2>
              <p className="text-xs mt-1 text-slate-500">
                Recover your Part-Time credentials
              </p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-100 p-1 rounded-lg">
              {(['part-time-worker', 'part-time-job-giver'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError(''); }}
                  className={`py-2 text-center text-xs font-extrabold rounded-md uppercase transition-all ${
                    role === r 
                      ? 'bg-white shadow text-slate-800' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {r === 'part-time-worker' ? t('apply_as_worker') : t('post_part_time_job')}
                </button>
              ))}
            </div>

            <form onSubmit={handleRequestOTP} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200 font-semibold">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-1">Registered Email ID</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 outline-none transition font-medium ${getInputClass()}`}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-4 text-white font-bold py-3.5 rounded-xl shadow-lg transition transform active:scale-95 disabled:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer text-base ${getButtonClass()}`}
              >
                {loading && (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                Send Verification OTP
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <span className="text-4xl">📨</span>
              <h2 className="text-2xl font-black mt-3 tracking-tight">Verify Identity</h2>
              <p className="text-sm mt-2 font-medium text-slate-600">
                Enter the 6-digit code sent to: <span className="font-bold text-blue-500 block mt-0.5">{email}</span>
              </p>
            </div>

            {simulatedOtp && (
              <div className="bg-orange-50 border border-orange-200 text-orange-850 p-4 rounded-xl text-xs font-bold mb-6 text-left flex items-start gap-3 shadow-sm border-l-4 border-l-orange-500 animate-[pulse_2s_infinite]">
                <span className="text-lg">💡</span>
                <div>
                  <p className="font-black text-orange-950 text-sm">Developer Sandbox Mode</p>
                  <p className="mt-1 font-semibold leading-relaxed">
                    Gmail is currently blocked or unset. Use this test OTP to verify:
                    <span className="bg-orange-200 text-orange-950 font-black px-2 py-0.5 rounded ml-1 text-sm tracking-widest font-mono select-all border border-orange-300">{simulatedOtp}</span>
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200 font-semibold">
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm border border-green-200 font-semibold mb-4">
                  ✅ {success}
                </div>
              )}

              {/* OTP Digits */}
              <div className="flex justify-center gap-2 my-6">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={inputRefs[i]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`w-10 h-12 text-center text-2xl font-black rounded-xl border focus:ring-2 outline-none transition ${getInputClass()}`}
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Establish New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border focus:ring-2 outline-none transition font-medium ${getInputClass()}`}
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

              <div>
                <label className="block text-sm font-bold mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border focus:ring-2 outline-none transition font-medium ${getInputClass()}`}
                    placeholder="Repeat new password"
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

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-4 text-white font-bold py-3.5 rounded-xl shadow-lg transition transform active:scale-95 disabled:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer text-base ${getButtonClass()}`}
              >
                {loading && (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                Save Password & Reset
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner animate-[bounce_1s_infinite]">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-green-600 mt-5">Password Reset Success!</h3>
            <p className="text-sm mt-2 font-medium text-slate-500">
              Redirecting you to secure login portal...
            </p>
          </div>
        )}

        <div className="text-center mt-6 pt-4 border-t border-slate-100">
          <Link 
            href="/part-time-login" 
            className={`text-xs font-bold transition hover:underline ${
              role === 'part-time-worker' ? 'text-blue-600' : 'text-indigo-700'
            }`}
          >
            ← Return to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function PTForgotPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <span className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    }>
      <PTForgotPasswordContent />
    </Suspense>
  );
}
