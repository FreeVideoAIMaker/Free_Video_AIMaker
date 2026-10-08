import React from 'react';
import { Sparkles, Sliders } from 'lucide-react';

interface AdBannerProps {
  format: 'leaderboard' | 'rectangle' | 'in-feed';
  onCustomizeAds?: () => void;
  className?: string;
  adClient?: string;
  adSlot?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  format,
  onCustomizeAds,
  className = '',
  adClient,
  adSlot
}) => {
  // If real AdSense credentials are provided, render official container
  const isRealConfigured = Boolean(adClient && adSlot);

  if (isRealConfigured) {
    return (
      <div className={`my-4 flex flex-col items-center justify-center ${className}`}>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
          Advertisement
        </span>
        <div className="overflow-hidden border border-slate-800 rounded-lg bg-slate-900/50 p-1">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format={format === 'leaderboard' ? 'horizontal' : 'auto'}
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // Polished, non-intrusive sponsor / ad placeholder compliant with IAB formats
  if (format === 'leaderboard') {
    return (
      <div className={`w-full max-w-5xl mx-auto my-6 px-4 ${className}`}>
        <div className="relative group overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 p-3 sm:p-4 transition-all hover:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                    Sponsor / Ad
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    Cloud GPU Instances for Video AI Generation
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-throughput H100 & RTX 4090 clusters with instant API deployment.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onCustomizeAds}
                title="Configure Google AdSense slot ID"
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors px-2 py-1"
              >
                <Sliders className="w-3 h-3" />
                <span className="hidden md:inline">Ad Slot Settings</span>
              </button>
              <a
                href="#studio"
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (format === 'rectangle') {
    return (
      <div className={`w-full max-w-[320px] mx-auto rounded-xl border border-slate-800 bg-slate-900/80 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium tracking-wider uppercase text-slate-500">
            Advertisement (300×250)
          </span>
          {onCustomizeAds && (
            <button
              onClick={onCustomizeAds}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Configure Ad Unit"
            >
              <Sliders className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="h-44 rounded-lg bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-fuchsia-950/60 border border-fuchsia-500/30 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
          </div>
          <span className="text-xs font-semibold text-slate-200">
            Render Cloud Hosting
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            Deploy full-stack AI web applications in seconds with zero maintenance.
          </p>
          <span className="mt-3 text-[10px] font-medium text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
            Free Tier Available
          </span>
        </div>
      </div>
    );
  }

  // in-feed banner
  return (
    <div className={`w-full my-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-[10px] tracking-wider uppercase text-slate-500 font-medium">
          Sponsored
        </span>
        <span className="text-xs text-slate-300">
          Supercharge your AI production with specialized GPU inference infrastructure.
        </span>
      </div>
      {onCustomizeAds && (
        <button
          onClick={onCustomizeAds}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          Setup AdSense
        </button>
      )}
    </div>
  );
};
