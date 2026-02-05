import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-br from-teal-600 via-emerald-500 to-teal-700 text-white overflow-hidden shadow-lg rounded-b-3xl mb-6">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-4 animate-fade-in-up">
          <Sparkles size={16} className="text-yellow-300" />
          <span>Made for Prachi</span>
          <Heart size={14} className="text-pink-300 fill-pink-300" />
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight">
          NEET 2026 <br className="hidden md:block" /> Prep for Prachi
        </h1>
        
        <p className="text-teal-50 text-lg md:text-xl max-w-2xl font-light mb-8">
          Dedicated to your journey, your dreams, and your success. Let's make that white coat a reality!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button 
            onClick={() => document.getElementById('practice-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 bg-white text-teal-700 font-bold rounded-xl shadow-lg hover:bg-teal-50 transition transform hover:-translate-y-1 active:scale-95"
          >
            Start Practice
          </button>
          <button 
             onClick={() => document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' })}
             className="px-8 py-3 bg-teal-800/40 backdrop-blur-md text-white font-semibold rounded-xl border border-teal-400/30 hover:bg-teal-800/60 transition"
          >
            Check Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;