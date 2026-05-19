'use client';

import React, { useState, useEffect } from 'react';
import { IndiaMapPaths } from './IndiaMapPaths';
import { motion, AnimatePresence } from 'framer-motion';

interface IndiaMapBackgroundProps {
  activeStateName?: string;
}

export default function IndiaMapBackground({ activeStateName }: IndiaMapBackgroundProps) {
  const [randomHighlight, setRandomHighlight] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Don't trigger on input fields to prevent distraction while typing
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      
      const states = IndiaMapPaths.locations;
      const randomState = states[Math.floor(Math.random() * states.length)];
      setRandomHighlight(randomState.name);
      
      setTimeout(() => setRandomHighlight(null), 3000);
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const highlightedStateName = activeStateName || randomHighlight;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
      {/* Heavy blur overlay to keep content readable */}
      <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-2xl z-10 pointer-events-none"></div>
      
      <svg 
        viewBox={IndiaMapPaths.viewBox} 
        className="w-full h-[150vh] object-cover scale-[1.3] md:scale-[1.1] opacity-70 blur-[4px] dark:opacity-40"
        preserveAspectRatio="xMidYMid meet"
      >
        {IndiaMapPaths.locations.map((location: any) => {
          const isHighlighted = highlightedStateName && 
            location.name.toLowerCase().includes(highlightedStateName.toLowerCase());
          
          return (
            <motion.path
              key={location.id}
              d={location.path}
              id={location.id}
              initial={{ fill: '#e2e8f0', stroke: '#cbd5e1' }}
              animate={{ 
                fill: isHighlighted ? '#f97316' : '#e2e8f0', // Vibrant orange
                stroke: isHighlighted ? '#ea580c' : '#cbd5e1',
                scale: isHighlighted ? 1.02 : 1,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* Large blurred state name text overlay */}
      <AnimatePresence>
        {highlightedStateName && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <h2 className="text-[10vw] md:text-[8vw] font-black text-orange-500/20 dark:text-orange-400/10 uppercase tracking-widest blur-[6px] text-center select-none">
              {highlightedStateName}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
