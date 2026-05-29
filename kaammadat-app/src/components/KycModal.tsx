"use client";
import { useState } from 'react';
import { sendKycOtp, verifyKycOtp } from '@/app/actions/kycActions';
import { markKycVerified } from '@/app/actions/userActions';

interface KycModalProps {
  isOpen: boolean;
  aadhar: string;
  mobile: string;
  userEmail: string;
  onVerified: () => void;
  onClose: () => void;
}

export default function KycModal({ isOpen, aadhar, mobile, userEmail, onVerified, onClose }: KycModalProps) {
  const [step, setStep] = useState<'send' | 'verify' | 'success'>('send');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setError('');
    setLoading(true);
    const res = await sendKycOtp(mobile, aadhar);
    setLoading(false);
    if (res.success) {
      if (res.simulated && res.otp) setDevOtp(res.otp); // Dev mode only
      setStep('verify');
    } else {
      setError(res.error || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    const res = await verifyKycOtp(mobile, otp);
    if (res.success) {
      await markKycVerified(userEmail);
      setStep('success');
    } else {
      setError(res.error || 'Verification failed.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-[scale-up_0.3s_ease-out]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-lg">🏛️ Aadhar KYC Verification</h3>
            <p className="text-xs opacity-90 font-medium mt-0.5">Powered by UIDAI Checksum</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold transition text-sm cursor-pointer">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Step: SEND OTP */}
          {step === 'send' && (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col gap-2">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Aadhar Number</p>
                <p className="text-lg font-black text-slate-800 tracking-widest">
                  {aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                </p>
                <p className="text-xs text-slate-500 font-medium">An OTP will be sent to your mobile number ending in <span className="font-black text-slate-700">...{mobile.slice(-4)}</span></p>
              </div>

              {error && <p className="text-sm text-red-600 font-bold bg-red-50 border border-red-100 p-3 rounded-xl">⚠️ {error}</p>}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold py-3.5 rounded-xl shadow hover:opacity-95 transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : '📱'}
                {loading ? 'Sending OTP...' : 'Send OTP to Mobile'}
              </button>
            </>
          )}

          {/* Step: VERIFY OTP */}
          {step === 'verify' && (
            <>
              <div className="text-center">
                <p className="text-3xl mb-2">📱</p>
                <p className="font-extrabold text-slate-800">OTP Sent!</p>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Enter the 6-digit OTP sent to <span className="font-black text-slate-700">+91 ...{mobile.slice(-4)}</span>
                </p>
              </div>

              {devOtp && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl text-center">
                  <p className="text-xs font-bold text-yellow-700">🔧 Dev Mode — Your OTP is: <span className="text-lg font-black text-yellow-900">{devOtp}</span></p>
                  <p className="text-xs text-yellow-600 mt-1">Add FAST2SMS_API_KEY to .env.local to send real SMS</p>
                </div>
              )}

              <input
                type="number"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-900 bg-white outline-none transition font-bold text-center text-xl tracking-[0.5em]"
              />

              {error && <p className="text-sm text-red-600 font-bold bg-red-50 border border-red-100 p-3 rounded-xl">⚠️ {error}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-extrabold py-3.5 rounded-xl shadow hover:opacity-95 transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : '✅'}
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button onClick={() => { setStep('send'); setOtp(''); setError(''); }} className="text-xs text-center text-blue-600 font-bold hover:underline cursor-pointer">
                ← Resend OTP
              </button>
            </>
          )}

          {/* Step: SUCCESS */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl animate-[bounce_0.5s_ease-in-out]">✅</div>
              <h4 className="font-black text-2xl text-green-700">KYC Verified!</h4>
              <p className="text-sm text-slate-500 font-medium">Your Aadhar has been successfully verified. You will receive a <span className="font-bold text-slate-700">✅ KYC Verified</span> badge on your profile.</p>
              <button
                onClick={onVerified}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-3.5 rounded-xl shadow transition cursor-pointer"
              >
                Continue 🎉
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
