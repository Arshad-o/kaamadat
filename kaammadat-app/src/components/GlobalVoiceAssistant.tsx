"use client";
import { useState } from 'react';

export default function GlobalVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const toggleVoice = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate listening state that turns off after 4 seconds
      setTimeout(() => {
        setIsListening(false);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
      }, 4000);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex items-center">
      <div className="relative">
        {/* Radar waves when listening */}
        {isListening && (
          <>
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-60 scale-150"></div>
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-40 scale-[2.5]"></div>
          </>
        )}
        
        <button
          onClick={toggleVoice}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all duration-300 transform border-[3px] border-white shadow-2xl relative z-10 ${isListening ? 'bg-green-500 text-white scale-110 shadow-[0_0_40px_rgb(34,197,94,0.8)]' : 'bg-white text-green-600 hover:bg-gray-50 hover:scale-105'}`}
          title="Voice Assistant"
        >
          🎙️
        </button>
      </div>

      {/* Dynamic Voice Tooltip */}
      <div className={`ml-4 bg-white px-4 py-3 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 ${isListening ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
        <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Listening to your command...
        </p>
      </div>

      {/* Confirmation Tooltip */}
      <div className={`absolute left-20 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-300 ${showTooltip ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <p className="text-xs font-bold">Action completed! ✓</p>
      </div>
    </div>
  );
}
