import React, { useRef, useState } from 'react';
import { UploadCloud, X, ArrowLeft, ArrowRight, Image as ImageIcon, Sparkles, Layers, Info } from 'lucide-react';
import { UploadedImage, ImageRole } from '../types';
import { SAMPLE_PACKS } from '../data/mockData';

interface MultiImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  onSelectSamplePack?: (pack: typeof SAMPLE_PACKS[0]) => void;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images,
  onImagesChange,
  onSelectSamplePack
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: UploadedImage[] = [];
    const filesArray = Array.from(files);

    filesArray.forEach((file, index) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // Determine initial role based on order
          let role: ImageRole = 'keyframe';
          const totalAfter = images.length + newImages.length;
          if (totalAfter === 0) role = 'start';

          newImages.push({
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            url: result,
            role,
            timestamp: Date.now()
          });

          if (newImages.length === filesArray.length) {
            onImagesChange([...images, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    onImagesChange(updated);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    onImagesChange(copy);
  };

  const updateRole = (id: string, role: ImageRole) => {
    const updated = images.map((img) => (img.id === id ? { ...img, role } : img));
    onImagesChange(updated);
  };

  const loadSample = (sample: typeof SAMPLE_PACKS[0]) => {
    const newImg: UploadedImage = {
      id: `sample-${Date.now()}`,
      name: sample.title,
      url: sample.url,
      role: 'start'
    };
    onImagesChange([newImg]);
    if (onSelectSamplePack) {
      onSelectSamplePack(sample);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header and status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
            Image Sequences & Keyframes
          </h3>
          <span className="text-xs text-slate-400 font-normal">
            ({images.length} {images.length === 1 ? 'image' : 'images'} loaded)
          </span>
        </div>

        {/* Quick demo presets buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Demos:
          </span>
          {SAMPLE_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => loadSample(pack)}
              className="text-[11px] px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors whitespace-nowrap shrink-0"
            >
              {pack.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 scale-[0.99]'
            : 'border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:scale-105 group-hover:border-cyan-500/40 transition-all shadow-lg">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-200">
              <span className="text-cyan-400 font-semibold underline underline-offset-2">
                Click to browse
              </span>{' '}
              or drag & drop multiple images
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PNG, JPG, WebP, AVIF up to 25MB each. Upload 2+ images for morphing & camera transitions.
            </p>
          </div>
        </div>
      </div>

      {/* Render uploaded image cards */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="group relative rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 transition-all hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-950/20"
              >
                {/* Thumbnail Preview */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800 mb-2">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-300">
                    Frame #{index + 1}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(img.id);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/70 hover:bg-rose-900 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Role and sequencing controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-400 truncate max-w-[140px]">
                      {img.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveImage(index, 'left')}
                        disabled={index === 0}
                        className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move Earlier"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveImage(index, 'right')}
                        disabled={index === images.length - 1}
                        className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move Later"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Frame Role Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Role:
                    </span>
                    <select
                      value={img.role}
                      onChange={(e) => updateRole(img.id, e.target.value as ImageRole)}
                      className="w-full text-[11px] bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="start">Start Keyframe (0.0s)</option>
                      <option value="keyframe">Transition Keyframe</option>
                      <option value="end">End Keyframe</option>
                      <option value="style_ref">Style Reference Only</option>
                      <option value="motion_guide">Motion Trajectory Guide</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Educational notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300">
            <Info className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>
              <strong>Multi-Image AI Synthesis:</strong> Uploading both a <em>Start Frame</em> and an <em>End Frame</em> enables automated neural interpolation for seamless camera pans and dynamic transformations.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
