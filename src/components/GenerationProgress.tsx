import React, { useEffect, useState } from 'react';
import { Sparkles, Layers, Cpu, Film, CheckCircle } from 'lucide-react';

interface GenerationProgressProps {
  onComplete: () => void;
  durationSeconds?: number;
}

const STAGES = [
  { id: 1, name: 'Keyframe Extraction & Semantic Analysis', icon: Layers, detail: 'Analyzing uploaded keyframe geometry and subject boundaries...' },
  { id: 2, name: 'Latent Motion Vector Calculation', icon: Cpu, detail: 'Synthesizing camera trajectory flow and depth displacement map...' },
  { id: 3, name: 'Neural Interpolation & Frame Synthesis', icon: Film, detail: 'Generating inter-frame temporal coherence and lighting optics...' },
  { id: 4, name: 'Color Grading & 4K Output Assembly', icon: Sparkles, detail: 'Applying volumetric film curves and compiling video master...' }
];

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  onComplete,
  durationSeconds = 6
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const totalDurationMs = durationSeconds * 1000;
    const intervalMs = 60;
    const increment = (intervalMs / totalDurationMs) * 100;

    const timer = setInterval(() => {
      setPercent((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }

        if (next > 75) setCurrentStage(3);
        else if (next > 45) setCurrentStage(2);
        else if (next > 20) setCurrentStage(1);
        else setCurrentStage(0);

        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [durationSeconds, onComplete]);

  return (
    <div className="w-full rounded-2xl border border-cyan-500/40 bg-slate-950 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 text-center space-y-6">
      {/* Neon Pulsing Orb */}
      <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping opacity-60" />
        <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-cyan-500 to-fuchsia-500 opacity-30 blur-md animate-pulse" />
        <div className="relative w-16 h-16 rounded-full bg-slate-900 border border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Film className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-100">
          Synthesizing Cinematic AI Video
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Executing multi-stage neural diffusion across keyframes and camera vectors
        </p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-cyan-400 font-semibold">{Math.round(percent)}% Complete</span>
          <span className="text-slate-500">Estimating: {Math.max(0, Math.round(((100 - percent) / 100) * durationSeconds))}s remaining</span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500 transition-all duration-100 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Generation Stages List */}
      <div className="max-w-lg mx-auto grid grid-cols-1 gap-2 text-left">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                isCurrent
                  ? 'border-cyan-400/60 bg-cyan-950/20 text-cyan-300 shadow-md'
                  : isDone
                  ? 'border-slate-800 bg-slate-900/40 text-slate-400'
                  : 'border-slate-900 bg-slate-950 text-slate-600 opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                    : isDone
                    ? 'bg-emerald-950/50 text-emerald-400'
                    : 'bg-slate-900 text-slate-600'
                }`}
              >
                {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold flex items-center justify-between">
                  <span>{stage.name}</span>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400">
                      Processing...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {stage.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
