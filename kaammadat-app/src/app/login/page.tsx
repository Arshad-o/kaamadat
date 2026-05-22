"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/app/actions/userActions';
import { playNotificationSound } from '@/utils/playSound';

export default function UniversalLogin() {
  const router = useRouter();
  const [role, setRole] = useState<'worker' | 'job-giver'>('worker');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUser(identifier, password, role) as any;
      if (result.success && result.user) {
        playNotificationSound();
        
        // Save mock user context in localStorage for UI consistencies and OTP verification
        localStorage.setItem('kaammadat_user_email', result.user.email);
        localStorage.setItem('kaammadat_user_name', result.user.name);
        localStorage.setItem('kaammadat_user_mobile', result.user.mobile);
        localStorage.setItem('kaammadat_user_type', role);

        // Check if there's a simulated OTP from the backend
        if (result.otpResult?.simulated && result.otpResult?.otp) {
          localStorage.setItem('kaammadat_simulated_otp', result.otpResult.otp);
        } else {
          localStorage.removeItem('kaammadat_simulated_otp');
        }

        // Redirect to OTP verification page based on role
        if (role === 'worker') {
          router.push('/worker/otp');
        } else if (role === 'job-giver') {
          router.push('/job-giver/otp');
        }
      } else {
        setError(result.error || 'Invalid credentials. Please verify your details.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeColor = role === 'worker' ? 'orange' : 'green';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-[family-name:var(--font-geist-sans)] relative overflow-hidden bg-slate-50">
      
      {/* Dynamic Animated Mesh Gradients based on Role */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-[pulse_8s_infinite] transition-colors duration-1000 ${role === 'worker' ? 'bg-orange-300' : 'bg-green-300'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-[pulse_8s_infinite_reverse] transition-colors duration-1000 ${role === 'worker' ? 'bg-red-200' : 'bg-teal-200'}`}></div>

      <div className="w-full max-w-md bg-white/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80 overflow-hidden relative z-10 transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)]">
        
        {/* Toggle Header */}
        <div className="flex bg-white/40 backdrop-blur-md border-b border-white/50">
          <button
            onClick={() => { setRole('worker'); setError(''); }}
            className={`flex-1 py-4 text-center font-extrabold text-sm transition-all duration-300 ${
              role === 'worker' 
                ? 'bg-white/90 text-orange-600 shadow-[inset_0_-3px_0_0_#f97316]' 
                : 'text-slate-500 hover:text-orange-500 hover:bg-white/50'
            }`}
          >
            👷 I am a Worker
          </button>
          <button
            onClick={() => { setRole('job-giver'); setError(''); }}
            className={`flex-1 py-4 text-center font-extrabold text-sm transition-all duration-300 ${
              role === 'job-giver' 
                ? 'bg-white/90 text-green-700 shadow-[inset_0_-3px_0_0_#16a34a]' 
                : 'text-slate-500 hover:text-green-600 hover:bg-white/50'
            }`}
          >
            💼 I am a Job Giver
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight drop-shadow-sm">
              Sign In
            </h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">Connecting the workforce of India</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200 font-semibold animate-[shake_0.5s_ease-in-out]">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-extrabold text-slate-700 mb-1.5">Email ID or Mobile Number</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-xl border border-white/60 text-slate-900 bg-white/50 backdrop-blur-sm focus:bg-white focus:ring-4 outline-none transition-all font-semibold shadow-sm ${
                  role === 'worker' ? 'focus:ring-orange-500/20 focus:border-orange-500' : 'focus:ring-green-500/20 focus:border-green-500'
                }`}
                placeholder="e.g. rahul@example.com or 9876543210"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-extrabold text-slate-700">Password</label>
                <Link 
                  href={`/forgot-password?role=${role}`} 
                  className={`text-xs font-black transition-colors hover:underline ${
                    role === 'worker' ? 'text-orange-600 hover:text-orange-700' : 'text-green-700 hover:text-green-800'
                  }`}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3.5 pr-12 rounded-xl border border-white/60 text-slate-900 bg-white/50 backdrop-blur-sm focus:bg-white focus:ring-4 outline-none transition-all font-semibold shadow-sm ${
                    role === 'worker' ? 'focus:ring-orange-500/20 focus:border-orange-500' : 'focus:ring-green-500/20 focus:border-green-500'
                  }`}
                  placeholder="Enter password"
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
              className={`w-full mt-6 text-white font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer text-base ${
                role === 'worker' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-orange-500/30' 
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:shadow-green-600/30'
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : null}
              {loading ? 'Authenticating...' : 'Sign In Securely'}
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-slate-200/50">
            <p className="text-sm text-slate-600 font-semibold">
              New to Kaammadat?{' '}
              <Link 
                href={role === 'worker' ? '/worker/register' : '/job-giver/register'} 
                className={`font-black hover:underline transition-colors ${
                  role === 'worker' ? 'text-orange-600 hover:text-orange-700' : 'text-green-700 hover:text-green-800'
                }`}
              >
                Register Here
              </Link>
            </p>
            <div className="mt-5">
              <Link href="/" className="inline-block px-4 py-2 rounded-full bg-slate-100/50 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-all font-bold">
                ← Return to Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
