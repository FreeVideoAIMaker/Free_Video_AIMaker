import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Sparkles, Heart, Compass, CheckCircle2, Play, Pause, RotateCcw } from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoModalProps {
  video: GeneratedVideo | null;
  onClose: () => void;
  onRemix: (video: GeneratedVideo) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose, onRemix }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [progressTime, setProgressTime] = useState(0);

  useEffect(() => {
    if (!video) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();
    const duration = video.duration || 5;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = video.thumbnailUrl;

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = (elapsed % duration) / duration;
      setProgressTime(progress * duration);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (img.complete) {
        ctx.save();
        // Camera dynamic zoom / pan effect for playback demo
        let scale = 1.05 + 0.1 * Math.sin(progress * Math.PI);
        let transX = (progress - 0.5) * 30;
        let transY = Math.sin(progress * Math.PI * 2) * 15;

        if (video.cameraMotion === 'Zoom In') {
          scale = 1.0 + 0.18 * progress;
        } else if (video.cameraMotion === 'Pan Right') {
          transX = (0.5 - progress) * 60;
        } else if (video.cameraMotion === 'Drone Flyby') {
          scale = 1.02 + 0.2 * progress;
          transY = (0.5 - progress) * 40;
        }

        ctx.translate(w / 2 + transX, h / 2 + transY);
        ctx.scale(scale, scale);
        ctx.translate(-w / 2, -h / 2);

        ctx.drawImage(img, 0, 0, w, h);

        // Volumetric lighting pulse
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, 'rgba(0, 245, 212, 0.05)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(168, 85, 247, 0.06)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    img.onload = () => {
      animId = requestAnimationFrame(render);
    };

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [video, isPlaying]);

  if (!video) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${video.title.toLowerCase().replace(/\s+/g, '-')}.webm`;
        a.click();
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      };

      recorder.start();
      setTimeout(() => recorder.stop(), video.duration * 1000);
    } catch {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${video.title}.png`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">{video.title}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
              {video.model}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Video Stage */}
        <div className="relative bg-black flex items-center justify-center aspect-video overflow-hidden">
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="w-full h-full object-contain"
          />

          {/* Scrubber overlay */}
          <div className="absolute bottom-3 inset-x-4 bg-slate-950/70 backdrop-blur-md rounded-lg p-2 border border-slate-800/80 flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-cyan-400 hover:text-cyan-300"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-400"
                style={{ width: `${(progressTime / video.duration) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {progressTime.toFixed(1)}s / {video.duration}s
            </span>
          </div>
        </div>

        {/* Modal Info & Actions */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Motion: {video.cameraMotion}</span>
                <span>·</span>
                <span>Aspect: {video.aspectRatio}</span>
                <span>·</span>
                <span>Keyframes: {video.keyframesCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onRemix(video);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Remix in Creator Studio</span>
              </button>
            </div>
          </div>

          {/* Prompt card */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Exact Generation Prompt
            </span>
            <p className="text-xs text-slate-200 mt-1 italic">
              "{video.prompt}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
