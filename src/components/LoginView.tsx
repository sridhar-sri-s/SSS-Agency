import React, { useState } from 'react';
import { LogIn, KeyRound, User, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TeamMember } from '../types';

interface LoginViewProps {
  onLogin: (member: TeamMember) => void;
  usersPool: TeamMember[];
}

export default function LoginView({ onLogin, usersPool }: LoginViewProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      setErrorMsg('Please enter both User ID and Password.');
      return;
    }

    const foundUser = usersPool.find(u => 
      u.userId?.toLowerCase() === userId.trim().toLowerCase() && 
      u.password === password
    );

    if (!foundUser) {
      setErrorMsg('Invalid User ID or Password.');
      return;
    }

    setIsLoggingIn(true);
    setErrorMsg(null);
    setTimeout(() => {
      onLogin(foundUser);
      setIsLoggingIn(false);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F5F7] p-4 font-sans select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#D2D2D7] shadow-xl overflow-hidden p-8">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-[#0071E3] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md mb-4">
            D
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">DistriFlow Pro</h1>
          <p className="text-xs text-[#86868B] uppercase tracking-widest font-semibold mt-1">Access Gateway</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider pl-1 block">User ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} className="text-[#86868B]" />
              </div>
              <input
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Enter your User ID"
                className="w-full text-sm font-medium text-[#1D1D1F] bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider pl-1 block">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound size={16} className="text-[#86868B]" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="••••••••"
                className="w-full text-sm font-medium text-[#1D1D1F] bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] transition-all"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-200 flex items-start gap-2.5"
              >
                <ShieldAlert size={15} className="text-red-500 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed font-semibold">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoggingIn || !userId || !password}
            className={`w-full py-3 mt-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
              userId && password
                ? 'bg-[#0071E3] hover:bg-[#0066CC] text-white cursor-pointer active:scale-[0.98]' 
                : 'bg-[#EDEDF0] text-[#86868B] cursor-not-allowed border border-[#D2D2D7]'
            }`}
          >
            {isLoggingIn ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <span>Sign In Securely</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-[#D2D2D7] text-[10px] text-center text-[#86868B] flex flex-col gap-1 items-center justify-center">
          <p>Demo: Use ID: <strong>admin</strong> and Password: <strong>password123</strong></p>
          <p>Others check original IDs and <strong>1234</strong></p>
        </div>
      </div>
    </div>
  );
}
