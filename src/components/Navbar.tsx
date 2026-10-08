import React, { useState } from 'react';
import { Sun, Moon, LogIn, User, Cloud, ExternalLink, Zap, Menu, X, Film, Compass } from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenRenderGuide: () => void;
  onGoToAdmin: () => void;
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
  onGoToAdmin,
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
        {/* Zone 1: Brand Identity (Fluid & responsive) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-cyan-500/40 p-1 sm:p-1.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
            onClick={() => handleNavClick('studio')}
            title="FreeVideoAIMaker Home"
          >
            <img
              src="/favicon-ai-video.svg"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <button
            onClick={() => handleNavClick('studio')}
            className="text-left flex flex-col justify-center min-w-0"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400 bg-clip-text text-transparent truncate">
                FreeVideoAI<span className="inline">Maker</span>
              </span>
              <span className="hidden md:inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-400 bg-cyan-950/30 font-medium whitespace-nowrap">
                Free
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300 shrink-0">
          <button
            onClick={() => handleNavClick('studio')}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap"
          >
            Video Creator
          </button>
          <button
            onClick={() => handleNavClick('showcase')}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap"
          >
            Showcase Gallery
          </button>
          <button
            onClick={() => handleNavClick('features')}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap"
          >
            Camera & Motion
          </button>
          <button
            onClick={() => {
              onOpenRenderGuide();
              setMobileMenuOpen(false);
            }}
            className="hover:text-fuchsia-400 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Cloud className="w-4 h-4 text-fuchsia-400" />
            <span>Render Deploy</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Mobile Toggle (Never overflow / wrap gracefully) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* User Status / Daily Quota Badge */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-xs font-mono font-semibold"
                title={`${remainingCredits} of ${dailyLimit} free generations left today`}
              >
                <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400 shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  {remainingCredits} <span className="hidden sm:inline">/ {dailyLimit} Left</span>
                </span>
              </div>

              <button
                onClick={onLogout}
                className="px-2 py-1 rounded-md text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors whitespace-nowrap"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>Sign In</span>
              <span className="hidden sm:inline font-normal text-[11px]">(4 Free)</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Neon Theme'}
            className="p-1.5 sm:p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition-colors shrink-0"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Navigation Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-cyan-400 transition-colors shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Drops down smoothly when hamburger is clicked) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 py-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              onClick={() => handleNavClick('studio')}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 text-left hover:border-cyan-500/40 hover:text-cyan-400 transition-colors flex items-center gap-2"
            >
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>Video Creator</span>
            </button>
            <button
              onClick={() => handleNavClick('showcase')}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 text-left hover:border-cyan-500/40 hover:text-cyan-400 transition-colors flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Showcase</span>
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 text-left hover:border-cyan-500/40 hover:text-cyan-400 transition-colors flex items-center gap-2"
            >
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>Camera Physics</span>
            </button>
            <button
              onClick={() => {
                onOpenRenderGuide();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 text-left hover:border-fuchsia-500/40 hover:text-fuchsia-400 transition-colors flex items-center gap-2"
            >
              <Cloud className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Render Deploy</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
