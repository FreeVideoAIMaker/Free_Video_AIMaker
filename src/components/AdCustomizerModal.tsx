import React, { useState } from 'react';
import { X, DollarSign, Sliders, CheckCircle2, Info } from 'lucide-react';
import { AdUnitConfig } from '../types';

interface AdCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdUnitConfig;
  onSaveConfig: (config: AdUnitConfig) => void;
}

export const AdCustomizerModal: React.FC<AdCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [client, setClient] = useState(config.client);
  const [slotId, setSlotId] = useState(config.slotId);
  const [enabled, setEnabled] = useState(config.enabled);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      ...config,
      client: client.trim(),
      slotId: slotId.trim(),
      enabled
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-slate-950 overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Ad Network & Monetization Slots
              </h3>
              <p className="text-xs text-slate-400">
                Configure non-intrusive Google AdSense or sponsor banners
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm text-slate-300">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-100">Display Advertisements</span>
              <p className="text-[11px] text-slate-400">
                Show non-obtrusive banner slots in layout
              </p>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Google AdSense Publisher ID
            </label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="ca-pub-1234567890123456"
              className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Default Ad Slot ID
            </label>
            <input
              type="text"
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              placeholder="9876543210"
              className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Ad units are positioned strategically in high-CTR, non-intrusive areas (top leaderboard below hero, generator sidebar, and showcase in-feed) so your users enjoy a seamless creative experience.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold shadow-md shadow-cyan-500/20"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
