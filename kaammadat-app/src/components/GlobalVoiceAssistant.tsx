"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

const LANG_MAP: Record<string, string> = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Marathi: 'mr-IN',
  Bengali: 'bn-IN',
  Odia: 'or-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Gujarati: 'gu-IN',
  Punjabi: 'pa-IN',
  Urdu: 'ur-IN',
};

export default function GlobalVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const router = useRouter();
  const { language } = useLanguage();
  const recognitionRef = useRef<any>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setStatusMsg('Listening...');
          setShowTooltip(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          setStatusMsg(`Heard: "${transcript}"`);
          handleCommand(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === 'no-speech') {
            setStatusMsg('No speech detected.');
          } else {
            setStatusMsg(`Error: ${event.error}`);
          }
          hideTooltipAfterDelay();
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          hideTooltipAfterDelay();
        };
      } else {
        setIsSupported(false);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  const hideTooltipAfterDelay = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 4000);
  };

  const handleCommand = (transcript: string) => {
    const speech = transcript.toLowerCase();
    
    // Command: Search Jobs
    if (speech.includes('search') || speech.includes('find') || speech.includes('job') || speech.includes('show') || speech.includes('kam') || speech.includes('kaam')) {
      // Try to extract a keyword (e.g. "find plumber jobs" -> "plumber")
      const words = speech.replace(/[.,?!]/g, '').split(' ');
      const ignoreWords = ['search', 'find', 'for', 'a', 'an', 'the', 'job', 'jobs', 'show', 'me', 'kam', 'kaam', 'mujhe', 'chahiye'];
      const keywords = words.filter(w => !ignoreWords.includes(w));
      const query = keywords.join(' ');
      
      router.push(`/worker/search${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      return;
    }
    
    // Command: Post a Job
    if (speech.includes('post') || speech.includes('create') || speech.includes('hire') || speech.includes('give')) {
      router.push('/job-giver/post-job');
      return;
    }

    // Command: Dashboard / Home
    if (speech.includes('home') || speech.includes('dashboard') || speech.includes('profile')) {
      // Route based on role if possible, but default to worker dashboard for now
      router.push('/worker/dashboard');
      return;
    }

    // If no specific command matches, just do a general search
    router.push(`/worker/search?q=${encodeURIComponent(speech)}`);
  };

  const toggleVoice = () => {
    if (!isSupported) {
      setStatusMsg('Voice recognition not supported in this browser.');
      setShowTooltip(true);
      hideTooltipAfterDelay();
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        const langCode = LANG_MAP[language] || 'en-IN';
        recognitionRef.current.lang = langCode;
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
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
      <div className={`ml-4 ${isListening ? 'bg-white' : 'bg-gray-900'} px-4 py-3 rounded-2xl shadow-xl transition-all duration-300 ${showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
        <p className={`text-sm font-bold flex items-center gap-2 ${isListening ? 'text-gray-800' : 'text-white'}`}>
          {isListening && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
          {statusMsg}
        </p>
      </div>
    </div>
  );
}
