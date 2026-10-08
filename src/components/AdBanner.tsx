import React from 'react';
import { Layers } from 'lucide-react';

interface AdBannerProps {
  format: 'leaderboard' | 'rectangle' | 'in-feed';
  onCustomizeAds?: () => void;
  adClient?: string;
  adSlot?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ format }) => {
  if (format === 'leaderboard') {
    return (
      <div className="w-full max-w-5xl mx-auto my-6 px-4">
        <div className="w-full h-24 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 flex items-center justify-center">
          <div className="text-center text-slate-600 font-mono text-xs flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>[ Ad Workspace Space ID: Leaderboard Slot ]</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[320px] mx-auto my-4">
      <div className="w-full h-64 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 flex items-center justify-center p-4">
        <div className="text-center text-slate-600 font-mono text-xs flex flex-col items-center gap-1">
          <Layers className="w-5 h-5 text-slate-700" />
          <span>[ Ad Workspace ]</span>
          <span className="text-[10px] text-slate-700">300 x 250 Box</span>
        </div>
      </div>
    </div>
  );
};
