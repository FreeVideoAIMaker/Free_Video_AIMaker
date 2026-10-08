import React, { useState } from 'react';
import {
  Wand2,
  Video,
  Settings2,
  Sliders,
  Maximize2,
  Clock,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  Compass,
  Film,
  Lock,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import {
  VideoSettings,
  CameraMotion,
  AspectRatio,
  VideoDuration,
  UserAccount
} from '../types';
import { AI_MODELS, STYLE_PRESETS } from '../data/mockData';
import { evaluatePromptSafety } from '../utils/safetyModeration';

interface VideoStudioProps {
  settings: VideoSettings;
  onSettingsChange: (settings: VideoSettings) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  imagesCount: number;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  dailyLimit: number;
}

const CAMERA_MOTIONS: { name: CameraMotion; desc: string; icon: string }[] = [
  { name: 'Pan Right', desc: 'Horizontal slide right', icon: '→' },
  { name: 'Pan Left', desc: 'Horizontal slide left', icon: '←' },
  { name: 'Zoom In', desc: 'Dolly forward lens', icon: '⊕' },
  { name: 'Zoom Out', desc: 'Wide angle pull back', icon: '⊖' },
  { name: 'Orbit 360°', desc: 'Revolution around subject', icon: '↺' },
  { name: 'Drone Flyby', desc: 'Dynamic aerial sweep', icon: '✈' },
  { name: 'Tilt Up', desc: 'Ascending vertical view', icon: '↑' },
  { name: 'Tilt Down', desc: 'Descending crane drop', icon: '↓' },
  { name: 'FPV Roll', desc: 'Cinematic acrobatic spin', icon: '⚡' },
  { name: 'Static Cinematic', desc: 'Locked tripod stillness', icon: '▣' }
];

export const VideoStudio: React.FC<VideoStudioProps> = ({
  settings,
  onSettingsChange,
  onGenerate,
  isGenerating,
  imagesCount,
  currentUser,
  onOpenAuth,
  dailyLimit
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [safetyViolation, setSafetyViolation] = useState<string | null>(null);

  const remainingQuota = currentUser
    ? Math.max(0, dailyLimit - currentUser.dailyGenerationsCount)
    : dailyLimit;

  const handleEnhancePrompt = () => {
    setIsEnhancingPrompt(true);
    setTimeout(() => {
      const selectedStyle = STYLE_PRESETS.find((s) => s.id === settings.stylePreset);
      const styleModifier = selectedStyle
        ? selectedStyle.promptModifier
        : 'cinematic lighting, 8k hyper-detail, smooth anamorphic depth of field';

      let enhanced = settings.prompt.trim();
      if (!enhanced) {
        enhanced = 'Epic cinematic tracking shot through a visually stunning environment';
      }

      enhanced = `${enhanced}, ${styleModifier}, camera motion ${settings.cameraMotion.toLowerCase()}, ultra-fluid motion vector, photorealistic render.`;
      
      onSettingsChange({
        ...settings,
        prompt: enhanced
      });
      setIsEnhancingPrompt(false);
    }, 450);
  };

  const handleGenerateClick = () => {
    // 1. Check if user is signed in
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    // 2. Check daily quota
    if (remainingQuota <= 0) {
      return;
    }

    // 3. Check Safety Moderation
    const safety = evaluatePromptSafety(settings.prompt);
    if (!safety.isSafe) {
      setSafetyViolation(safety.reason || 'Prompt violates community safety rules.');
      return;
    }

    setSafetyViolation(null);
    onGenerate();
  };

  const getMotionIntensityLabel = (val: number) => {
    if (val <= 2) return 'Subtle Micro-Motion';
    if (val <= 4) return 'Gentle Natural Drift';
    if (val <= 6) return 'Balanced Cinematic Flow';
    if (val <= 8) return 'High Kinetic Dynamics';
    return 'Hyper-Speed Action';
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Prompt Input Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-1.5 uppercase">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Creative Prompt & Motion Script</span>
          </label>
          <button
            onClick={handleEnhancePrompt}
            disabled={isEnhancingPrompt}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-500/60 transition-all disabled:opacity-50"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isEnhancingPrompt ? 'animate-spin' : ''}`} />
            <span>{isEnhancingPrompt ? 'Director Enhancing...' : 'AI Director Enhancer'}</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            value={settings.prompt}
            onChange={(e) => {
              onSettingsChange({ ...settings, prompt: e.target.value });
              if (safetyViolation) setSafetyViolation(null);
            }}
            placeholder="Describe the action, environment, lighting, and camera behavior (e.g., 'Cinematic camera tracks forward as rain drops reflect neon holographic signs in a futuristic street...')"
            rows={4}
            className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-y"
          />
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
            <span>Watermark-free video will be synthesized from your prompt and keyframes.</span>
            <span>{settings.prompt.length} characters</span>
          </div>
        </div>

        {/* Safety Warning */}
        {safetyViolation && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <div>
              <strong>Safety Block:</strong> {safetyViolation}
            </div>
          </div>
        )}
      </div>

      {/* 2. Visual Style Presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-wide text-slate-300 uppercase flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cinematic Visual Style</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STYLE_PRESETS.map((style) => {
            const isSelected = settings.stylePreset === style.id;
            return (
              <button
                key={style.id}
                onClick={() => onSettingsChange({ ...settings, stylePreset: style.id })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-sm shadow-cyan-500/30'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <span className="text-xs font-medium">{style.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-full">
                  {style.lighting}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Camera Motion & Trajectory */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold tracking-wide text-slate-300 uppercase flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Camera Motion & Angles</span>
          </label>
          <span className="text-xs text-fuchsia-400 font-mono">
            Selected: {settings.cameraMotion}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CAMERA_MOTIONS.map((motion) => {
            const active = settings.cameraMotion === motion.name;
            return (
              <button
                key={motion.name}
                onClick={() => onSettingsChange({ ...settings, cameraMotion: motion.name })}
                className={`p-2 rounded-xl border text-left transition-all ${
                  active
                    ? 'border-fuchsia-400 bg-fuchsia-950/30 text-fuchsia-200 shadow-sm shadow-fuchsia-500/20'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{motion.name}</span>
                  <span className="text-xs font-mono text-cyan-400">{motion.icon}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{motion.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Motion Strength Slider & Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Motion Intensity
            </span>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              {settings.motionStrength} / 10
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={settings.motionStrength}
            onChange={(e) =>
              onSettingsChange({ ...settings, motionStrength: Number(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-[11px] text-slate-400">
            {getMotionIntensityLabel(settings.motionStrength)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Duration
            </span>
            <span className="text-xs font-mono text-cyan-400">
              {settings.duration} Seconds
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {([3, 5, 8, 10] as VideoDuration[]).map((dur) => (
              <button
                key={dur}
                onClick={() => onSettingsChange({ ...settings, duration: dur })}
                className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  settings.duration === dur
                    ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
          <div className="text-[11px] text-slate-400">
            {settings.duration * settings.fps} frames total @ {settings.fps}fps
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" /> Aspect Ratio
            </span>
            <span className="text-xs font-mono text-cyan-400">
              {settings.aspectRatio}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(['16:9', '9:16', '1:1', '4:3'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => onSettingsChange({ ...settings, aspectRatio: ratio })}
                className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  settings.aspectRatio === ratio
                    ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-slate-400">
            {settings.aspectRatio === '16:9'
              ? 'YouTube Cinema'
              : settings.aspectRatio === '9:16'
              ? 'TikTok & Reels Vertical'
              : settings.aspectRatio === '1:1'
              ? 'Instagram Square'
              : 'Classic 4:3 TV'}
          </div>
        </div>
      </div>

      {/* 5. AI Engine Selection & Advanced Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>AI Model & Synthesis Parameters</span>
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <span className="text-xs text-slate-500">
            Active: {AI_MODELS.find((m) => m.id === settings.model)?.name}
          </span>
        </div>

        {showAdvanced && (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">
                AI Video Diffusion Engine
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AI_MODELS.map((model) => {
                  const active = settings.model === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => onSettingsChange({ ...settings, model: model.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        active
                          ? 'border-cyan-400 bg-cyan-950/40 text-slate-100'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-200">
                          {model.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                          {model.speed}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{model.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Negative Prompt (Artifact Suppression)
              </label>
              <input
                type="text"
                value={settings.negativePrompt}
                onChange={(e) =>
                  onSettingsChange({ ...settings, negativePrompt: e.target.value })
                }
                placeholder="blurry, jitter, flickering, distortion, low frame rate, watermarks, bad anatomy"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Customer Video Privacy Setting (Public vs Private) */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">Video Privacy & Visibility</span>
            <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
              settings.isPrivate
                ? 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-500/30'
                : 'bg-cyan-950 text-cyan-300 border-cyan-500/30'
            }`}>
              {settings.isPrivate ? 'Private (Confidential)' : 'Public (Community Showcase)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {settings.isPrivate
              ? 'Your video is confidential and will NOT be shown in the public showcase gallery.'
              : 'Your video can appear in the community showcase gallery for other creators to discover.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onSettingsChange({ ...settings, isPrivate: false })}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              !settings.isPrivate
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Public</span>
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ ...settings, isPrivate: true })}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              settings.isPrivate
                ? 'bg-fuchsia-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Private</span>
          </button>
        </div>
      </div>

      {/* 6. Primary Generate CTA Action */}
      <div className="pt-2 space-y-2">
        <button
          onClick={handleGenerateClick}
          disabled={Boolean(isGenerating || imagesCount === 0 || (currentUser && remainingQuota <= 0))}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
            imagesCount === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : currentUser && remainingQuota <= 0
              ? 'bg-rose-950/40 text-rose-300 border border-rose-500/40 cursor-not-allowed'
              : isGenerating
              ? 'bg-slate-800 text-cyan-400 border border-cyan-500/50 cursor-wait'
              : 'bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500 hover:from-cyan-300 hover:to-fuchsia-400 text-slate-950 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.008]'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Generating AI Video (Processing Keyframes)...</span>
            </>
          ) : !currentUser ? (
            <>
              <Lock className="w-5 h-5 text-slate-950" />
              <span>Sign In to Generate (4 Free Daily Credits)</span>
            </>
          ) : remainingQuota <= 0 ? (
            <>
              <Clock className="w-5 h-5 text-rose-300" />
              <span>Daily Limit Reached (4/4 Used Today • Resets at Midnight)</span>
            </>
          ) : (
            <>
              <Video className="w-5 h-5 text-slate-950" />
              <span>
                {imagesCount === 0
                  ? 'Upload At Least 1 Image Above to Generate Video'
                  : `Generate ${settings.duration}s Cinematic AI Video (${remainingQuota} Left Today)`}
              </span>
              <Zap className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>

        {/* Feature Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Watermark-Free Export
          </span>
          <span>·</span>
          <span>4 Free Generations / Day</span>
          <span>·</span>
          <span>24-Hour Cloud Retention</span>
        </div>
      </div>
    </div>
  );
};
