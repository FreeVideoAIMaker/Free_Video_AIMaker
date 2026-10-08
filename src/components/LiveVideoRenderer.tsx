import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Maximize2,
  Volume2,
  VolumeX,
  Sparkles,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { UploadedImage, VideoSettings } from '../types';

interface LiveVideoRendererProps {
  images: UploadedImage[];
  settings: VideoSettings;
  onDownloadStarted?: () => void;
  onRemixPrompt?: () => void;
}

export const LiveVideoRenderer: React.FC<LiveVideoRendererProps> = ({
  images,
  settings,
  onRemixPrompt
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Cached Image elements
  const loadedImagesRef = useRef<HTMLImageElement[]>([]);
  const duration = settings.duration;

  // Load all images into memory
  useEffect(() => {
    let active = true;
    const loaded: HTMLImageElement[] = [];

    images.forEach((imgObj) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imgObj.url;
      img.onload = () => {
        if (active) {
          loaded.push(img);
        }
      };
    });

    loadedImagesRef.current = loaded;
    return () => {
      active = false;
    };
  }, [images]);

  // Main rendering animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const renderFrame = (now: number) => {
      if (!isPlaying) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      const elapsed = ((now - startTime) / 1000) * playbackSpeed;
      const progress = (elapsed % duration) / duration;
      setCurrentTime(progress * duration);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Determine active image and transition
      const imgElements = loadedImagesRef.current;
      if (imgElements.length > 0) {
        // Multi-image crossfade interpolation calculation
        const numImgs = imgElements.length;
        const exactIndex = progress * numImgs;
        const primaryIdx = Math.min(Math.floor(exactIndex), numImgs - 1);
        const nextIdx = (primaryIdx + 1) % numImgs;
        const segmentProgress = exactIndex - Math.floor(exactIndex);

        const img1 = imgElements[primaryIdx];
        const img2 = imgElements[nextIdx];

        ctx.save();

        // Apply camera motion matrix based on user settings
        const intensity = (settings.motionStrength / 10) * 0.15;
        let scale = 1.0;
        let translateX = 0;
        let translateY = 0;
        let rotate = 0;

        switch (settings.cameraMotion) {
          case 'Pan Right':
            translateX = -width * intensity * (progress - 0.5);
            break;
          case 'Pan Left':
            translateX = width * intensity * (progress - 0.5);
            break;
          case 'Zoom In':
            scale = 1.0 + intensity * 2 * progress;
            break;
          case 'Zoom Out':
            scale = 1.0 + intensity * 2 * (1 - progress);
            break;
          case 'Tilt Up':
            translateY = height * intensity * (progress - 0.5);
            break;
          case 'Tilt Down':
            translateY = -height * intensity * (progress - 0.5);
            break;
          case 'Orbit 360°':
            translateX = Math.sin(progress * Math.PI * 2) * width * intensity * 0.5;
            translateY = Math.cos(progress * Math.PI * 2) * height * intensity * 0.25;
            scale = 1.05 + Math.sin(progress * Math.PI * 4) * 0.04;
            break;
          case 'Drone Flyby':
            scale = 1.0 + intensity * 2.2 * progress;
            translateX = Math.sin(progress * Math.PI) * width * intensity * 0.6;
            translateY = -height * intensity * 0.3 * progress;
            break;
          case 'FPV Roll':
            rotate = Math.sin(progress * Math.PI * 2) * 0.08 * (settings.motionStrength / 5);
            scale = 1.08 + Math.cos(progress * Math.PI * 2) * 0.05;
            break;
          case 'Static Cinematic':
          default:
            scale = 1.02 + Math.sin(progress * Math.PI * 2) * 0.01;
            break;
        }

        ctx.translate(width / 2 + translateX, height / 2 + translateY);
        if (rotate !== 0) ctx.rotate(rotate);
        ctx.scale(scale, scale);
        ctx.translate(-width / 2, -height / 2);

        // Draw primary image
        if (img1 && img1.complete) {
          ctx.drawImage(img1, 0, 0, width, height);
        }

        // Draw transition image if multi-image sequence
        if (numImgs > 1 && img2 && img2.complete && segmentProgress > 0.6) {
          const fadeAlpha = (segmentProgress - 0.6) / 0.4;
          ctx.globalAlpha = fadeAlpha;
          ctx.drawImage(img2, 0, 0, width, height);
          ctx.globalAlpha = 1.0;
        }

        // Cinematic Film Lighting & Particle Overlay
        const lightPulse = Math.sin(progress * Math.PI * 6) * 0.08;
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, `rgba(0, 245, 212, ${0.04 + lightPulse})`);
        grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, `rgba(168, 85, 247, ${0.05 + lightPulse})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Subtle cinematic vignette
        const vignette = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.3,
          width / 2,
          height / 2,
          width * 0.7
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animationFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, settings, duration, playbackSpeed]);

  // Video download functionality using MediaRecorder directly from canvas
  const handleDownloadVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      const stream = canvas.captureStream(30); // 30 FPS stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const recordedChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `FreeVideoAIMaker-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          setIsRecording(false);
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 3000);
        }, 100);
      };

      // Record for full duration
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, duration * 1000);
    } catch (err) {
      console.warn('Canvas recording fallback:', err);
      // Fallback: take a high-res snapshot
      const imageURL = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imageURL;
      a.download = `FreeVideoAIMaker-frame-${Date.now()}.png`;
      a.click();
      setIsRecording(false);
    }
  };

  const getCanvasDimensions = () => {
    switch (settings.aspectRatio) {
      case '9:16':
        return { width: 720, height: 1280, aspectClass: 'aspect-[9/16] max-h-[580px]' };
      case '1:1':
        return { width: 1080, height: 1080, aspectClass: 'aspect-square max-h-[500px]' };
      case '4:3':
        return { width: 1024, height: 768, aspectClass: 'aspect-[4/3] max-h-[460px]' };
      case '16:9':
      default:
        return { width: 1280, height: 720, aspectClass: 'aspect-video max-h-[480px]' };
    }
  };

  const dimensions = getCanvasDimensions();

  return (
    <div className="w-full rounded-2xl border border-cyan-500/30 bg-slate-950 p-4 shadow-2xl shadow-cyan-950/40 space-y-4">
      {/* Top Video Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>Live AI Generated Video</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              {settings.aspectRatio} · {settings.cameraMotion} · {settings.duration}s
            </span>
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {downloadSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Video Downloaded!
            </span>
          )}

          <button
            onClick={handleDownloadVideo}
            disabled={isRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isRecording ? 'Encoding Video...' : 'Download HD Video'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative mx-auto rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800/80">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className={`w-full ${dimensions.aspectClass} object-contain`}
        />

        {/* Video Overlay Watermark/Brand (discreet & professional) */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-md border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
          <Camera className="w-3 h-3 text-cyan-400" />
          <span>{settings.cameraMotion}</span>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-3 right-3 bg-rose-950/90 border border-rose-500 text-rose-300 px-2.5 py-1 rounded-md text-xs font-mono flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Capturing Frames...</span>
          </div>
        )}
      </div>

      {/* Custom Video Controls Bar */}
      <div className="space-y-2 bg-slate-900/60 rounded-xl p-3 border border-slate-800">
        {/* Scrubber Bar */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
            {currentTime.toFixed(1)}s
          </span>
          <div className="flex-1 relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 w-10">
            {duration.toFixed(1)}s
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(true);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Replay from start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 ml-2 text-xs">
              {[0.5, 1, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                    playbackSpeed === speed
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRemixPrompt && (
              <button
                onClick={onRemixPrompt}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors px-2 py-1"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Remix</span>
              </button>
            )}

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-slate-400 hover:text-slate-200"
              title={isMuted ? 'Muted' : 'Unmuted'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Generation Prompt Details Bar */}
      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-semibold text-slate-300">Prompt Used:</span>
          <span className="font-mono text-cyan-400">{settings.model.split('/')[1] || settings.model}</span>
        </div>
        <p className="text-slate-300 italic">"{settings.prompt}"</p>
      </div>
    </div>
  );
};
