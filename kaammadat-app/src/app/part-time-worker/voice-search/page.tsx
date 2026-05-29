"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VoiceSearch() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [simulationStep, setSimulationStep] = useState(0);

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    setSimulationStep(1);
    
    // Simulate voice recognition progress
    setTimeout(() => { setTranscript("I am looking for..."); }, 1000);
    setTimeout(() => { setTranscript("I am looking for plumber jobs..."); }, 2500);
    setTimeout(() => { 
      setTranscript("I am looking for plumber jobs near me."); 
      setIsListening(false);
      setSimulationStep(2);
    }, 4000);
  };

  const processSearch = () => {
    setSimulationStep(3);
    setTimeout(() => {
      // Redirect back to dashboard as if filters were applied
      router.push('/part-time-worker/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 font-[family-name:var(--font-geist-sans)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
        
        {/* Animated Background */}
        {isListening && (
          <div className="absolute inset-0 bg-green-500/10 animate-pulse pointer-events-none"></div>
        )}

        <div className="flex justify-between items-center mb-10 relative z-10">
          <Link href="/part-time-worker/dashboard" className="text-gray-400 hover:text-gray-800 text-xl font-bold transition">← Back</Link>
          <h2 className="text-xl font-black text-green-700">Voice Assistant</h2>
          <div className="w-8"></div>
        </div>

        <div className="mb-12 relative z-10">
          <div className="relative inline-block">
            {isListening && (
              <>
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-50 scale-150"></div>
                <div className="absolute inset-0 bg-green-300 rounded-full animate-ping opacity-30 scale-[2]"></div>
              </>
            )}
            <button 
              onClick={startListening}
              disabled={isListening || simulationStep === 3}
              className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl shadow-xl transition-all duration-300 relative z-10 ${isListening ? 'bg-green-500 text-white scale-110' : 'bg-white border-4 border-green-100 text-green-500 hover:border-green-300 hover:scale-105'}`}
            >
              🎙️
            </button>
          </div>
          
          <h3 className="text-2xl font-black text-gray-800 mt-8 mb-2">
            {isListening ? 'Listening...' : (simulationStep === 0 ? 'Tap to Speak' : 'Voice Captured')}
          </h3>
          <p className="text-gray-500 text-sm font-medium">
            {isListening ? 'Speak your job requirements clearly' : 'Say things like "Find painter jobs in Mumbai"'}
          </p>
        </div>

        {/* Transcript Box */}
        <div className={`bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 min-h-[120px] flex items-center justify-center transition-all ${simulationStep > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <p className={`text-lg font-bold ${isListening ? 'text-gray-400 animate-pulse' : 'text-gray-800'}`}>
            {transcript || "..."}
          </p>
        </div>

        {/* Action Button */}
        {simulationStep === 2 && (
          <button 
            onClick={processSearch}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-lg transition transform active:scale-95"
          >
            Find Matching Jobs 🔍
          </button>
        )}

        {simulationStep === 3 && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <span className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></span>
            <p className="text-green-700 font-bold">Analyzing your request...</p>
          </div>
        )}

      </div>
    </div>
  );
}
