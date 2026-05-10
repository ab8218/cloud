import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, LogOut, User as UserIcon, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../lib/firebase';
import { motion } from 'motion/react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-paper text-ink font-sans selection:bg-accent selection:text-white overflow-x-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 border-r border-ink/10 flex-col p-8 sticky top-0 h-screen shrink-0 bg-paper">
        <div className="mb-12 cursor-pointer group" onClick={() => navigate('/')}>
          <h1 className="text-xs font-bold tracking-[0.2em] uppercase opacity-40 group-hover:opacity-100 transition-opacity">Travel Ledger</h1>
          <p className="text-3xl font-serif italic mt-1 leading-none">System</p>
        </div>
        
        <nav className="flex-1 space-y-10 py-6 overflow-y-auto custom-scrollbar">
          <div 
            onClick={() => navigate('/')}
            className="group cursor-pointer"
          >
            <span className="text-[10px] font-mono opacity-30 block mb-1 group-hover:text-accent group-hover:opacity-100 italic">01 —</span>
            <h2 className="text-2xl font-black tracking-tighter group-hover:text-accent transition-colors uppercase">All Trips</h2>
            <p className="text-[10px] uppercase tracking-widest mt-1 opacity-50">Overview</p>
          </div>
          
          <div className="pt-10 opacity-20 hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-mono block mb-4 uppercase tracking-[0.2em] font-bold">Preferences</span>
            <div className="space-y-4">
               <button onClick={logout} className="block text-sm font-bold uppercase tracking-widest hover:text-red-500 transition-colors">Sign Out —</button>
            </div>
          </div>
        </nav>

        {user && (
          <div className="mt-auto pt-8 border-t border-ink/5">
            <div className="flex items-center gap-3">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                className="w-10 h-10 border border-ink/10 grayscale hover:grayscale-0 transition-all cursor-pointer"
                alt="Profile"
              />
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-widest truncate">{user.displayName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[9px] font-mono opacity-50 uppercase tracking-tighter">Firebase Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-paper border-b border-ink/5 p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2" onClick={() => navigate('/')}>
             <span className="font-black text-xl tracking-tighter uppercase">Travel Ledger</span>
          </div>
          {user && (
             <button onClick={logout} className="p-2 text-ink/40 hover:text-ink transition-colors">
               <LogOut size={18} />
             </button>
          )}
        </header>

        <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-[1440px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {children}
          </motion.div>
        </main>

        <footer className="py-12 px-12 border-t border-ink/5 flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.2em] opacity-30 mt-auto">
          <span>© 2026 TL_SYS_V1</span>
          <span className="hidden sm:inline">Encrypted Cloud Workspace</span>
        </footer>
      </div>

      {/* Right Rail Aesthetic */}
      <aside className="hidden xl:flex w-16 border-l border-ink/10 flex-col items-center py-12 bg-paper sticky top-0 h-screen shrink-0">
        <div className="h-full w-px bg-ink/5 flex items-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap bg-paper py-8 px-2 text-[9px] uppercase tracking-[0.5em] font-bold opacity-30">
            Admin Console Enabled —
          </div>
        </div>
      </aside>
    </div>
  );
};
