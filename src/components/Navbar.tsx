import React, { useState } from 'react';
import { Sun, Moon, LogIn, Cloud, Zap, Menu, X, Film, Compass } from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenRenderGuide: () => void;
  onScrollToSection: (sectionId: string) => void;
  dailyLimit: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenRenderGuide,
  onScrollToSection,
  dailyLimit
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const remainingCredits = currentUser
    ? Math.max(0, dailyLimit - currentUser.dailyGenerationsCount)
    : dailyLimit;

  const handleNavClick = (sectionId: string) => {
    onScrollToSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-slate-800/80 bg-slate-950/90 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Identity Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-cyan-500/40 p-1 sm:p-1.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
            onClick={() => handleNavClick('studio')}
          >
            <img src="/favicon-ai-video.svg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <button onClick={() => handleNavClick('studio')} className="text-left flex flex-col justify-center min-w-0">
            <span className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400 bg-clip-text text-transparent truncate">
              FreeVideoAIMaker
            </span>
          </button>
        </div>

        {/* Links - strictly client context only */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300 shrink-0">
          <button onClick={() => handleNavClick('studio')} className="hover:text-cyan-400 transition-colors whitespace-nowrap">
            Video Creator
          </button>
          <button onClick={() => handleNavClick('showcase')} className="hover:text-cyan-400 transition-colors whitespace-nowrap">
            Showcase Gallery
          </button>
          <button onClick={() => handleNavClick('features')} className="hover:text-cyan-400 transition-colors whitespace-nowrap">
            Camera & Motion
          </button>
          <button onClick={() => onOpenRenderGuide()} className="hover:text-fuchsia-400 transition-colors whitespace-nowrap flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-fuchsia-400" />
            <span>Render Deploy</span>
          </button>
        </nav>

        {/* User Credits Verification Grid Area */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-xs font-mono font-semibold">
                <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400 shrink-0" />
                <span>{remainingCredits} / {dailyLimit} Left</span>
              </div>
              <button onClick={onLogout} className="px-2 py-1 rounded-md text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors">
                Log Out
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap">
              <span>Sign In</span>
            </button>
          )}

          <button onClick={onToggleDarkMode} className="p-1.5 sm:p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-cyan-400 transition-colors">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1.5 sm:p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-cyan-400 transition-colors">
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
