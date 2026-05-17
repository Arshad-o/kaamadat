"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/app/actions/userActions';
import { playNotificationSound } from '@/utils/playSound';

export default function UniversalLogin() {
  const router = useRouter();
  const [role, setRole] = useState<'worker' | 'job-giver'>('worker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUser(email, password, role);
      if (result.success && result.user) {
        playNotificationSound();
        // Redirect based on role
        if (role === 'worker') {
          // Save mock user context in localStorage for UI consistencies
          localStorage.setItem('kaammadat_user_email', result.user.email);
          localStorage.setItem('kaammadat_user_name', result.user.name);
          localStorage.setItem('kaammadat_user_mobile', result.user.mobile);
          localStorage.setItem('kaammadat_user_type', 'worker');
          router.push('/worker/search');
        } else if (role === 'job-giver') {
          localStorage.setItem('kaammadat_user_email', result.user.email);
          localStorage.setItem('kaammadat_user_name', result.user.name);
          localStorage.setItem('kaammadat_user_mobile', result.user.mobile);
          localStorage.setItem('kaammadat_user_type', 'job-giver');
          router.push('/job-giver/dashboard');
        }
      } else {
        setError(result.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeColor = role === 'worker' ? 'orange' : 'green';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-[family-name:var(--font-geist-sans)] transition-colors duration-500 ${role === 'worker' ? 'bg-orange-50' : 'bg-green-50'}`}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 transition hover:shadow-orange-100/50">
        
        {/* Toggle Header */}
        <div className="flex border-b border-gray-100 bg-gray-50">
          <button
            onClick={() => { setRole('worker'); setError(''); }}
            className={`flex-1 py-4 text-center font-bold text-sm transition-all ${
              role === 'worker' 
                ? 'bg-white text-orange-600 border-b-2 border-orange-500' 
                : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50/20'
            }`}
          >
            👷 I am a Worker
          </button>
          <button
            onClick={() => { setRole('job-giver'); setError(''); }}
            className={`flex-1 py-4 text-center font-bold text-sm transition-all ${
              role === 'job-giver' 
                ? 'bg-white text-green-700 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50/20'
            }`}
          >
            💼 I am a Job Giver
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              Sign In to Kaammadat
            </h2>
            <p className="text-gray-500 text-xs mt-1">Connecting the workforce of India</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200 font-semibold animate-[shake_0.5s_ease-in-out]">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 outline-none transition font-medium ${
                  role === 'worker' ? 'focus:ring-orange-500 focus:border-orange-500' : 'focus:ring-green-500 focus:border-green-500'
                }`}
                placeholder="e.g. rahul@example.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                <Link 
                  href={`/forgot-password?role=${role}`} 
                  className={`text-xs font-bold transition hover:underline ${
                    role === 'worker' ? 'text-orange-600' : 'text-green-700'
                  }`}
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-white focus:ring-2 outline-none transition font-medium ${
                  role === 'worker' ? 'focus:ring-orange-500 focus:border-orange-500' : 'focus:ring-green-500 focus:border-green-500'
                }`}
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 text-white font-bold py-3.5 rounded-xl shadow-lg transition transform active:scale-95 disabled:bg-gray-400 flex items-center justify-center gap-2 cursor-pointer text-base ${
                role === 'worker' 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : null}
              Sign In
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-semibold">
              New to Kaammadat?{' '}
              <Link 
                href={role === 'worker' ? '/worker/register' : '/job-giver/register'} 
                className={`font-black hover:underline ${
                  role === 'worker' ? 'text-orange-600' : 'text-green-700'
                }`}
              >
                Register Here
              </Link>
            </p>
            <div className="mt-4">
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition font-bold">
                ← Return to Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
