import React, { useState } from 'react';
import { Play, Sparkles, Heart, Film, ArrowUpRight, Compass, Filter } from 'lucide-react';
import { GeneratedVideo } from '../types';
import { SHOWCASE_VIDEOS } from '../data/mockData';
import { AdBanner } from './AdBanner';

interface ShowcaseGalleryProps {
  onRemixVideo: (video: GeneratedVideo) => void;
  onOpenVideoModal: (video: GeneratedVideo) => void;
  onCustomizeAds?: () => void;
}

export const ShowcaseGallery: React.FC<ShowcaseGalleryProps> = ({
  onRemixVideo,
  onOpenVideoModal,
  onCustomizeAds
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likesState, setLikesState] = useState<Record<string, number>>({});
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Cyberpunk', 'Sci-Fi', 'Nature', 'Space'];

  const filteredVideos = SHOWCASE_VIDEOS.filter((video) => {
    if (video.isPrivate) return false;
    if (selectedCategory === 'All') return true;
    return video.tags.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase()));
  });

  const toggleLike = (id: string, initialLikes: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = userLiked[id];
    setUserLiked((prev) => ({ ...prev, [id]: !isLiked }));
    setLikesState((prev) => ({
      ...prev,
      [id]: (prev[id] ?? initialLikes) + (isLiked ? -1 : 1)
    }));
  };

  return (
    <section id="showcase" className="w-full space-y-6 pt-4">
      {/* Header and Category Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Film className="w-4 h-4" />
            <span>Community & Neural Masterworks</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">
            AI Generated Video Showcase
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Explore cinematic videos synthesized with FreeVideoAIMaker. Click any card to play or remix prompts.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm shadow-cyan-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Showcase Videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredVideos.map((video) => {
          const currentLikes = likesState[video.id] ?? video.likes;
          const isLiked = Boolean(userLiked[video.id]);

          return (
            <div
              key={video.id}
              onClick={() => onOpenVideoModal(video)}
              className="group cursor-pointer rounded-2xl border border-slate-800/90 bg-slate-900/60 overflow-hidden hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-950/20 transition-all flex flex-col"
            >
              {/* Thumbnail with hover motion effect */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Gradient Contrast Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Duration & Aspect Ratio Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/70 backdrop-blur-md text-cyan-300 border border-slate-800">
                    {video.duration}s · {video.aspectRatio}
                  </span>
                </div>

                {/* Center Play Button Overlay on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-xs">
                  <div className="w-12 h-12 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-400/40 transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  </div>
                </div>

                {/* Camera Motion pill */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[11px] font-medium text-slate-300">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span>{video.cameraMotion}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 italic">
                    "{video.prompt}"
                  </p>
                </div>

                {/* Footer metadata & Remix CTA */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => toggleLike(video.id, video.likes, e)}
                    className={`flex items-center gap-1 transition-colors ${
                      isLiked ? 'text-rose-400' : 'text-slate-400 hover:text-rose-400'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
                    <span className="text-[11px] font-mono">{currentLikes}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemixVideo(video);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/40 border border-slate-700 text-[11px] font-medium text-slate-300 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Remix Prompt</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Non-intrusive In-Feed Banner within showcase */}
      <AdBanner
        format="in-feed"
        onCustomizeAds={onCustomizeAds}
        className="mt-6"
      />
    </section>
  );
};
