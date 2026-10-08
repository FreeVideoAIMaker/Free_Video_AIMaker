import React from 'react';
import { Camera, Layers, Zap, Download, Compass, ShieldCheck, Sparkles, Video } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Layers,
      title: 'Multi-Image Keyframing',
      description: 'Upload multiple sequential images to guide camera paths, scene morphing, and complex storytelling transitions.'
    },
    {
      icon: Compass,
      title: 'Cinematic Camera Physics',
      description: 'Full directional control: Pan, Tilt, Dolly Zoom, 360° Orbit, FPV rolls, and high-altitude drone flybys.'
    },
    {
      icon: Zap,
      title: 'Real-Time Neural Diffusion',
      description: 'Powered by open-source video models including Stable Video Diffusion XT, LTX-Video, and HunyuanVideo.'
    },
    {
      icon: Download,
      title: 'Unwatermarked HD Exports',
      description: 'Download crisp WebM and MP4 videos directly to your device ready for YouTube, TikTok, Reels, and film production.'
    },
    {
      icon: Camera,
      title: 'Dynamic Aspect Ratios',
      description: 'Generate in 16:9 widescreen cinema, 9:16 mobile vertical, 1:1 social square, and 4:3 vintage formats.'
    },
    {
      icon: ShieldCheck,
      title: 'Hugging Face API Native',
      description: 'Direct server-side Hugging Face router integration with token protection against automated secret revoking.'
    }
  ];

  return (
    <section id="features" className="w-full py-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>State of the Art Synthesis</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Professional AI Video Production Without Limits
          </h2>
          <p className="text-sm text-slate-400">
            Everything you need to turn static images and textual concepts into high-motion cinematic sequences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-950/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 group-hover:border-cyan-500/40 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
