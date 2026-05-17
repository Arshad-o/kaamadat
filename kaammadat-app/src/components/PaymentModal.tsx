"use client";
import { useState, useEffect } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  amount: number;
  title: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PaymentModal({ isOpen, amount, title, onSuccess, onClose }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'upi_id' | 'apps'>('qr');
  const [upiId, setUpiId] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [processing, setProcessing] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSimulateSuccess = () => {
    setProcessing(true);
    // Simulate webhook real-time confirmation delay
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 1800);
  };

  if (!isOpen) return null;

  // Real UPI payment payload URI
  const upiPayload = `upi://pay?pa=kaammadat@okaxis&pn=Kaammadat%20Platform&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(title)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayload)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fade-in_0.3s_ease-out] font-[family-name:var(--font-geist-sans)] p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-[scale-up_0.3s_ease-out]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-gray-700 to-green-600 p-5 text-white flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-xl tracking-tight">Kaammadat Pay</h3>
            <p className="text-xs opacity-90 font-medium">Secure Real-time UPI Gateway</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold transition text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Details bar */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Purpose</p>
            <p className="text-sm font-extrabold text-gray-700 truncate max-w-[200px]">{title}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount to Pay</p>
            <p className="text-2xl font-black text-green-600">₹{amount.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-6 flex flex-col items-center gap-5">
          {processing ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <span className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
              <p className="font-extrabold text-orange-600 animate-pulse text-base">Waiting for real-time bank confirmation...</p>
              <p className="text-xs text-gray-400 font-semibold">Do not press back or close this window.</p>
            </div>
          ) : (
            <>
              {/* Payment Option Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-xl w-full">
                <button 
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition cursor-pointer ${paymentMethod === 'qr' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Scan QR
                </button>
                <button 
                  onClick={() => setPaymentMethod('apps')}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition cursor-pointer ${paymentMethod === 'apps' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  UPI Apps
                </button>
                <button 
                  onClick={() => setPaymentMethod('upi_id')}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition cursor-pointer ${paymentMethod === 'upi_id' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  UPI ID
                </button>
              </div>

              {/* Dynamic Payment Panel */}
              {paymentMethod === 'qr' && (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl shadow-sm relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={qrUrl} 
                      alt="UPI QR Code" 
                      className="w-48 h-48"
                    />
                    <div className="absolute inset-0 bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 rounded-2xl p-4 text-center">
                      <p className="text-xs font-bold text-gray-600">Scan this UPI QR code using GPay, PhonePe, Paytm or BHIM to pay instantly.</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supported Apps</p>
                  <div className="flex gap-3 items-center opacity-70">
                    <span className="text-xs font-black text-blue-600">GPay</span>
                    <span className="text-xs font-black text-purple-600">PhonePe</span>
                    <span className="text-xs font-black text-cyan-600">Paytm</span>
                    <span className="text-xs font-black text-orange-600">BHIM</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'apps' && (
                <div className="flex flex-col gap-3 w-full">
                  <button onClick={handleSimulateSuccess} className="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/20 text-left flex items-center justify-between transition cursor-pointer group">
                    <span className="font-extrabold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">📱</span> Google Pay (GPay)
                    </span>
                    <span className="text-xs text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition">Pay Instant →</span>
                  </button>
                  <button onClick={handleSimulateSuccess} className="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-500 hover:bg-purple-50/20 text-left flex items-center justify-between transition cursor-pointer group">
                    <span className="font-extrabold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">🟣</span> PhonePe
                    </span>
                    <span className="text-xs text-purple-600 font-bold opacity-0 group-hover:opacity-100 transition">Pay Instant →</span>
                  </button>
                  <button onClick={handleSimulateSuccess} className="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-cyan-500 hover:bg-cyan-50/20 text-left flex items-center justify-between transition cursor-pointer group">
                    <span className="font-extrabold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">🪙</span> Paytm UPI
                    </span>
                    <span className="text-xs text-cyan-600 font-bold opacity-0 group-hover:opacity-100 transition">Pay Instant →</span>
                  </button>
                </div>
              )}

              {paymentMethod === 'upi_id' && (
                <div className="flex flex-col gap-4 w-full">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Enter your Virtual Payment Address (VPA)</label>
                    <input 
                      type="text" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. name@okhdfcbank"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium"
                    />
                  </div>
                  <button 
                    onClick={handleSimulateSuccess}
                    disabled={!upiId.includes('@')}
                    className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-extrabold py-3.5 rounded-xl shadow hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    Send Payment Request
                  </button>
                </div>
              )}

              {/* Timer & Simulation button */}
              <div className="w-full border-t border-gray-100 pt-4 flex flex-col items-center gap-3">
                <div className="flex justify-between w-full text-xs font-bold text-gray-500">
                  <span>QR Session Expires in:</span>
                  <span className="text-red-500 font-extrabold">{formatTime(timeLeft)}</span>
                </div>
                
                {/* Simulator Trigger */}
                <button 
                  type="button"
                  onClick={handleSimulateSuccess}
                  className="w-full mt-2 bg-slate-900 hover:bg-slate-950 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
                >
                  ⚡ Simulate Real-Time Payment Success
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
