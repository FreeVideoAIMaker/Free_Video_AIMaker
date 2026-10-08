import React from 'react';
import { Cloud, ShieldCheck, Lock, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenRenderGuide: () => void;
  onGoToAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenRenderGuide,
  onGoToAdmin
}) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-xs py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-cyan-500/40 p-1 flex items-center justify-center">
                <img
                  src="/favicon-ai-video.svg"
                  alt="FreeVideoAIMaker Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-base font-bold text-slate-100 tracking-tight">
                FreeVideoAIMaker
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Free AI video studio transforming multi-image sequences into cinematic videos. Watermark-free, safe community guidelines, and 4 free generations refreshed every 24 hours.
            </p>
          </div>

          {/* Col 2: Studio Tools */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              AI Generation
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <a href="#studio" className="hover:text-cyan-400 transition-colors">
                  Multi-Image Keyframe Studio
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-cyan-400 transition-colors">
                  Community Video Showcase
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-cyan-400 transition-colors">
                  Camera Motion Physics
                </a>
              </li>
              <li>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3" /> Unwatermarked Video Output
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Free Hosting & Deployment */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Deployment & Cloud
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={onOpenRenderGuide}
                  className="hover:text-fuchsia-400 transition-colors flex items-center gap-1 text-left"
                >
                  <Cloud className="w-3 h-3 text-fuchsia-400" />
                  <span>Deploy Free on Render.com</span>
                </button>
              </li>
              <li>
                <a
                  href="https://mongodb.com/atlas"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <span>MongoDB Atlas Persistence</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <span className="text-slate-500">
                  Node.js Express + MongoDB Ready
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: SEO Keywords & Tags */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Keywords & Discoverability
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Free AI Video Maker',
                'Image to Video AI',
                'Watermark-Free Video AI',
                '4 Daily Free Videos',
                'Stable Video Diffusion',
                'Text to Video AI',
                'Keyframe Interpolation',
                '4K Cinematic Diffusion'
              ].map((kw) => (
                <span
                  key={kw}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar with Admin access */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FreeVideoAIMaker. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>High Performance Node.js & Vite</span>
            <span>·</span>
            <span>Zero Watermarks</span>
            <span>·</span>
            <span>24h Retention Purge</span>
            <span>·</span>
            {/* Secret discreet admin access */}
            <button
              onClick={onGoToAdmin}
              className="text-slate-600 hover:text-cyan-400 transition-colors flex items-center gap-1"
              title="Admin Console (/admin-console-x92)"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
