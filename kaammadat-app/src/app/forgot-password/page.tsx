"use client";
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { requestPasswordResetOTP, resetPassword } from '@/app/actions/userActions';
import { playNotificationSound } from '@/utils/playSound';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // States
  const [role, setRole] = useState<'worker' | 'job-giver' | 'admin'>('worker');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');

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
    if (queryRole === 'worker' || queryRole === 'job-giver' || queryRole === 'admin') {
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
          if (role === 'admin') {
            router.push('/admin/login');
          } else {
            router.push('/login');
          }
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
    if (role === 'admin') return 'bg-slate-950 text-white';
    if (role === 'worker') return 'bg-orange-50';
    return 'bg-green-50';
  };

  const getCardClass = () => {
    if (role === 'admin') return 'bg-slate-900 border-slate-800 shadow-2xl text-white';
    return 'bg-white border-slate-100 shadow-2xl text-slate-800';
  };

  const getInputClass = () => {
    if (role === 'admin') {
      return 'bg-slate-950 border-slate-800 text-white focus:ring-orange-500 focus:border-orange-500';
    }
    if (role === 'worker') {
      return 'bg-white border-gray-300 text-slate-800 focus:ring-orange-500 focus:border-orange-500';
    }
    return 'bg-white border-gray-300 text-slate-800 focus:ring-green-500 focus:border-green-500';
  };

  const getButtonClass = () => {
    if (role === 'admin') return 'bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700';
    if (role === 'worker') return 'bg-orange-500 hover:bg-orange-600';
    return 'bg-green-600 hover:bg-green-700';
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-[family-name:var(--font-geist-sans)] transition-all duration-500 ${getThemeClass()}`}>
      <div className={`w-full max-w-md rounded-2xl border p-8 transition duration-500 ${getCardClass()}`}>
        
        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <span className="text-4xl">🔐</span>
              <h2 className="text-2xl font-black mt-3 tracking-tight">Forgot Password</h2>
              <p className={`text-xs mt-1 ${role === 'admin' ? 'text-slate-400' : 'text-slate-500'}`}>
                Recover your Kaammadat Security credentials
              </p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-2 mb-6 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
              {(['worker', 'job-giver', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError(''); }}
                  className={`py-2 text-center text-xs font-extrabold rounded-md uppercase transition-all ${
                    role === r 
                      ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-white' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {r === 'job-giver' ? 'Giver' : r}
                </button>
              ))}
            </div>

            <form onSubmit={handleRequestOTP} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900 font-semibold">
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
              <p className={`text-sm mt-2 font-medium ${role === 'admin' ? 'text-slate-400' : 'text-slate-600'}`}>
                Enter the 6-digit code sent to: <span className="font-bold text-orange-500 block mt-0.5">{email}</span>
              </p>
            </div>

            {simulatedOtp && (
              <div className="bg-orange-50 border border-orange-200 text-orange-850 p-4 rounded-xl text-xs font-bold mb-6 text-left flex items-start gap-3 shadow-sm border-l-4 border-l-orange-500 animate-[pulse_2s_infinite] dark:bg-slate-950 dark:border-slate-800 dark:text-orange-400">
                <span className="text-lg">💡</span>
                <div>
                  <p className="font-black text-orange-950 dark:text-orange-350 text-sm">Developer Sandbox Mode</p>
                  <p className="mt-1 font-semibold leading-relaxed">
                    Gmail is currently blocked or unset. Use this test OTP to verify:
                    <span className="bg-orange-200 text-orange-950 dark:bg-orange-950 dark:text-orange-300 font-black px-2 py-0.5 rounded ml-1 text-sm tracking-widest font-mono select-all border border-orange-300 dark:border-orange-900">{simulatedOtp}</span>
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900 font-semibold">
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm border border-green-200 dark:border-green-900 font-semibold mb-4">
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
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 outline-none transition font-medium ${getInputClass()}`}
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 outline-none transition font-medium ${getInputClass()}`}
                  placeholder="Repeat new password"
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
            <p className={`text-sm mt-2 font-medium ${role === 'admin' ? 'text-slate-400' : 'text-slate-500'}`}>
              Redirecting you to secure login portal...
            </p>
          </div>
        )}

        <div className="text-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link 
            href={role === 'admin' ? '/admin/login' : '/login'} 
            className={`text-xs font-bold transition hover:underline ${
              role === 'admin' ? 'text-orange-500' : role === 'worker' ? 'text-orange-600' : 'text-green-700'
            }`}
          >
            ← Return to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <span className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
