import React, { useState } from 'react';
import { signInWithEmailAndPassword } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate against specified hardcoded credentials first for UI feedback
    if (username.toLowerCase() !== 'admin' || password !== 'japan2026') {
      setError('身分驗證失敗：無效的系統代號或存取密碼。');
      return;
    }

    setLoading(true);
    try {
      // Map 'admin' to the internal Firebase email format
      await signInWithEmailAndPassword(auth, 'admin@travel-ledger.sys', password);
    } catch (err: any) {
      console.error(err);
      setError('連線失敗：請確保 Firebase 已建立管理員帳號 (admin@travel-ledger.sys)。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6 selection:bg-accent selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl w-full"
      >
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <ShieldCheck size={16} className="text-accent" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] opacity-40">System Core // Restricted Access</span>
            <div className="h-px flex-1 bg-ink/10" />
          </div>
          
          <h1 className="text-[14vw] md:text-[clamp(64px,10vw,140px)] font-black leading-[0.8] tracking-tighter uppercase mb-8">
            Travel<br/>
            <span className="text-accent italic font-serif lowercase tracking-normal">ledger.</span>
          </h1>
          
          <p className="text-sm md:text-base font-medium opacity-50 max-w-sm leading-relaxed border-l-2 border-accent pl-6">
            專為旅行家設計的純淨計帳系統。使用指定的系統代號與金鑰開啟您的雲端空間。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6">
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-3 ml-1 group-focus-within:text-accent group-focus-within:opacity-100 transition-all">Identity / 系統代號</label>
              <input 
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ADMIN"
                className="w-full bg-paper border-b-4 border-ink/10 px-0 py-5 font-black text-2xl uppercase tracking-widest focus:border-accent outline-none transition-all placeholder:opacity-5"
              />
            </div>
            
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-3 ml-1 group-focus-within:text-accent group-focus-within:opacity-100 transition-all">Access Key / 存取密鑰</label>
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-paper border-b-4 border-ink/10 px-0 py-5 font-black text-2xl uppercase tracking-widest focus:border-accent outline-none transition-all placeholder:opacity-5"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 text-red-600 text-[11px] font-bold uppercase tracking-widest"
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-paper py-8 px-12 font-black text-xs uppercase tracking-[0.4em] flex items-center justify-between hover:bg-accent transition-all active:scale-[0.98] group disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Workspace'}</span>
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </form>

        <div className="mt-20 pt-10 border-t border-ink/5 flex justify-between items-end opacity-20 hover:opacity-100 transition-opacity">
          <div className="text-[9px] font-mono uppercase tracking-[0.2em] leading-relaxed">
            TL_SYS_V1.2.0<br/>
            ENCRYPTED_ENTRY
          </div>
          <div className="text-right text-[9px] font-mono uppercase tracking-[0.2em] leading-relaxed">
            ADMIN_CONSOLE_ONLY<br/>
            JAPAN_FLIGHT_READY
          </div>
        </div>
      </motion.div>
    </div>
  );
};
