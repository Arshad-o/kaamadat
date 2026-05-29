"use client";
import { useState, useEffect } from 'react';
import Script from 'next/script';
import { sendPaymentReceiptEmail } from '@/app/actions/emailActions';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/app/actions/paymentActions';

interface PaymentModalProps {
  isOpen: boolean;
  amount: number;
  title: string;
  userEmail?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PaymentModal({ isOpen, amount, title, userEmail = 'user@example.com', onSuccess, onClose }: PaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'failed'>('idle');

  const handleRazorpayPayment = async () => {
    setPaymentStatus('processing');

    try {
      // 1. Create Order on Server
      const { success, order, error } = await createRazorpayOrder(amount, `receipt_${Date.now()}`);

      if (!success || !order) {
        console.error("Order creation failed:", error);
        setPaymentStatus('failed');
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Keys are added to env.local
        amount: order.amount,
        currency: order.currency,
        name: "Kaammadat Secure Escrow",
        description: title,
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify Payment Signature on Server
          setPaymentStatus('processing');
          const verifyRes = await verifyRazorpayPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          if (verifyRes.success) {
            // 4. Send Receipt and Succeed
            const receiptResult = await sendPaymentReceiptEmail(userEmail, amount, title, 'worker', 'Customer');
            setPaymentStatus('idle');
            if (receiptResult.success) {
               onSuccess();
            } else {
               // Proceed anyway since payment was verified
               console.warn("Receipt email failed, but payment successful.");
               onSuccess();
            }
          } else {
            setPaymentStatus('failed');
          }
        },
        prefill: {
          email: userEmail,
        },
        theme: {
          color: "#f97316"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        console.error("Razorpay Payment Failed:", response.error);
        setPaymentStatus('failed');
      });
      
      rzp.open();
    } catch (err) {
      console.error(err);
      setPaymentStatus('failed');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
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
            {paymentStatus === 'processing' ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <span className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
                <p className="font-extrabold text-orange-600 animate-pulse text-base text-center">Processing Escrow Payment...</p>
                <p className="text-xs text-gray-400 font-semibold text-center">Please do not press back or close this window.</p>
              </div>
            ) : paymentStatus === 'failed' ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4 animate-[fade-in_0.3s_ease-out]">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl shadow-inner">
                  ❌
                </div>
                <h4 className="font-black text-xl text-red-600 text-center">Payment Failed</h4>
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                  <p className="text-sm font-bold text-red-800 mb-2">Amount not credited to Kaammadat account.</p>
                  <p className="text-xs text-red-600 font-medium leading-relaxed">
                    If your money was deducted from your bank account, please do not worry. 
                    It will be automatically refunded by your bank within <span className="font-black underline">3 to 5 working days</span>.
                  </p>
                </div>
                <button 
                  onClick={() => setPaymentStatus('idle')}
                  className="mt-2 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div className="w-full bg-blue-50 border border-blue-100 p-4 rounded-xl text-center text-xs text-blue-700 font-semibold mb-2">
                  🛡️ This payment is held safely in escrow. Money will only be transferred to the worker's account when their shift is successfully completed.
                </div>

                <button 
                  onClick={handleRazorpayPayment}
                  className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-extrabold py-4 rounded-xl shadow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-2 text-lg"
                >
                  Pay ₹{amount.toFixed(2)} with Razorpay
                </button>

                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                  Supports UPI, Credit/Debit Cards, Netbanking
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
