"use client";
import React from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-[fade-in_0.25s_ease-out] p-4">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-[scale-up_0.25s_ease-out] font-[family-name:var(--font-geist-sans)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tricolor Elegant Top Border */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-gray-400 to-green-600"></div>

        <div className="p-6 text-center">
          {/* Warning Icon Badge */}
          <div className="w-16 h-16 bg-red-50 border-2 border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-[pulse_2s_infinite]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </div>

          <h3 className="text-xl font-black text-gray-800 tracking-tight mb-2">
            Confirm Logout
          </h3>
          <p className="text-sm text-gray-500 font-semibold leading-relaxed mb-6 px-2">
            Do you really want to logout for sure from your active device session?
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition cursor-pointer text-sm active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white font-extrabold rounded-xl shadow-lg hover:opacity-95 transition cursor-pointer text-sm active:scale-95"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
