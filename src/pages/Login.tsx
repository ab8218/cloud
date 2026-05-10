import React from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';
import { Plane, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6 selection:bg-accent selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-xl w-full"
      >
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-xs font-mono opacity-30 italic">LOGIN // SECURE_AUTH</span>
            <div className="h-px flex-1 bg-ink/10" />
          </div>
          
          <h1 className="text-[12vw] md:text-[clamp(64px,8vw,120px)] font-black leading-[0.85] tracking-tighter uppercase mb-6">
            Travel<br/><span className="text-accent italic font-serif lowercase tracking-normal">ledger</span>
          </h1>
          
          <p className="text-sm md:text-base font-medium opacity-60 max-w-sm leading-relaxed">
            Professional expense synchronization system powered by Firebase Cloud Architecture.
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={signInWithGoogle}
            className="w-full bg-ink text-paper py-6 px-10 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-between hover:bg-accent transition-all active:scale-[0.98] group"
          >
            <span>Enter Workspace via Google</span>
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>

          <div className="flex items-center justify-between text-[10px] font-mono opacity-30 uppercase tracking-widest pt-8 border-t border-ink/5">
            <span>v1.0.4 rdy</span>
            <span>asia-east1-cluster</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
