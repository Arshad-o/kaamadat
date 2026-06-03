"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const { language } = useLanguage();

  // Only render on user pages, NOT admin pages
  if (pathname?.includes('/admin')) {
    return null;
  }

  const recognitionRef = useRef<any>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setStatusMsg('Listening...');
          setShowTooltip(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (interimTranscript) {
            setStatusMsg(`Heard: "${interimTranscript}..."`);
          } else if (finalTranscript) {
            setStatusMsg(`Processing: "${finalTranscript}"`);
            handleCommand(finalTranscript);
            // Stop after processing a final command
            setIsListening(false);
            recognitionRef.current?.stop();
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === 'no-speech') {
            setStatusMsg('No speech detected.');
          } else if (event.error === 'aborted') {
            setStatusMsg('Voice search stopped.');
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

    // Command: Open Loyalty Card in any way
    if (
      speech.includes('card') ||
      speech.includes('loyalty') ||
      speech.includes('badge') ||
      speech.includes('membership') ||
      speech.includes('digital card') ||
      speech.includes('profile card') ||
      speech.includes('show card') ||
      speech.includes('open card')
    ) {
      window.dispatchEvent(new Event('open-loyalty-card'));
      setStatusMsg('Opening Loyalty Card... 🏅');
      return;
    }

    // Command: Login page — check FIRST before job search swallows it
    if (speech.includes('part-time login') || speech.includes('part time login') || speech.includes('student login')) {
      router.push('/part-time-login');
      return;
    }

    if (
      speech.includes('open login') ||
      speech.includes('login') ||
      speech.includes('log in') ||
      speech.includes('sign in') ||
      speech.includes('lॉgin') ||
      speech.includes('लॉगिन')
    ) {
      router.push('/login');
      return;
    }

    // Command: Register / Sign up
    if (
      speech.includes('register') ||
      speech.includes('sign up') ||
      speech.includes('signup') ||
      speech.includes('new account') ||
      speech.includes('worker register') ||
      speech.includes('job giver register')
    ) {
      if (speech.includes('giver') || speech.includes('employer') || speech.includes('hire')) {
        router.push('/job-giver/register');
      } else {
        router.push('/worker/register');
      }
      return;
    }

    // Command: Go to main / home page
    if (
      speech.includes('home') ||
      speech.includes('main page') ||
      speech.includes('go back') ||
      speech.includes('start')
    ) {
      router.push('/');
      return;
    }

    // Command: Dashboard
    if (speech.includes('dashboard') || speech.includes('profile')) {
      router.push('/worker/dashboard');
      return;
    }

    // Command: Post a Job
    if (
      speech.includes('post') ||
      speech.includes('create') ||
      speech.includes('hire') ||
      (speech.includes('give') && speech.includes('job'))
    ) {
      router.push('/job-giver/post-job');
      return;
    }

    // Command: Search Jobs — kept LAST so it doesn't catch login/register commands
    if (
      speech.includes('search') ||
      speech.includes('find') ||
      speech.includes('show') ||
      speech.includes('kam') ||
      speech.includes('kaam') ||
      (speech.includes('job') && !speech.includes('login'))
    ) {
      const words = speech.replace(/[.,?!]/g, '').split(' ');
      const ignoreWords = ['search', 'find', 'for', 'a', 'an', 'the', 'job', 'jobs', 'show', 'me', 'kam', 'kaam', 'mujhe', 'chahiye'];
      const keywords = words.filter(w => !ignoreWords.includes(w));
      const query = keywords.join(' ');
      router.push(`/worker/search${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      return;
    }

    // Fallback: show status, don't navigate anywhere
    setStatusMsg(`Command not recognized: "${speech}"`);
  };

  const toggleVoice = () => {
    if (!isSupported) {
      setStatusMsg('Voice recognition not supported in this browser.');
      setShowTooltip(true);
      hideTooltipAfterDelay();
      return;
    }

    if (isListening) {
      recognitionRef.current?.abort();
      setIsListening(false);
      setStatusMsg('Voice search stopped.');
      hideTooltipAfterDelay();
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
    <div className="fixed bottom-6 left-4 md:left-8 z-[100] flex items-center">
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
