/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Film,
  Zap,
  Play,
  RotateCcw,
  Cloud,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Lock,
  Clock,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { MultiImageUploader } from './components/MultiImageUploader';
import { VideoStudio } from './components/VideoStudio';
import { LiveVideoRenderer } from './components/LiveVideoRenderer';
import { GenerationProgress } from './components/GenerationProgress';
import { ShowcaseGallery } from './components/ShowcaseGallery';
import { FeaturesSection } from './components/FeaturesSection';
import { Footer } from './components/Footer';
import { AdBanner } from './components/AdBanner';
import { RenderDeploymentModal } from './components/RenderDeploymentModal';
import { AdCustomizerModal } from './components/AdCustomizerModal';
import { VideoModal } from './components/VideoModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';

import {
  UploadedImage,
  VideoSettings,
  GeneratedVideo,
  AdUnitConfig,
  UserAccount,
  SiteThemeColors,
  SiteContentConfig
} from './types';
import { SAMPLE_PACKS } from './data/mockData';

export default function App() {
  // 1. Admin Route Detection (e.g. /admin-console-x92 or ?portal=admin)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;
    return (
      path.includes('admin-console-x92') ||
      hash.includes('admin-console-x92') ||
      search.includes('portal=admin-console-x92')
    );
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      setIsAdminRoute(
        path.includes('admin-console-x92') ||
        hash.includes('admin-console-x92') ||
        search.includes('portal=admin-console-x92')
      );
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 2. Dark / Light Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('freevideoaimaker_theme');
    if (saved) return saved === 'dark';
    return true;
  });

  // 3. Dynamic Theme Colors Configurable from Admin
  const [themeColors, setThemeColors] = useState<SiteThemeColors>({
    primaryAccent: '#00F5D4',
    secondaryAccent: '#A855F7',
    lightModeTextColor: '#0f172a',
    lightModeBgColor: '#f8fafc',
    darkModeBgColor: '#070b14'
  });

  // Apply Theme Colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--neon-cyan', themeColors.primaryAccent);
    root.style.setProperty('--neon-purple', themeColors.secondaryAccent);
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.setProperty('--bg-primary', themeColors.darkModeBgColor);
      root.style.setProperty('--text-primary', '#f8fafc');
      localStorage.setItem('freevideoaimaker_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.setProperty('--bg-primary', themeColors.lightModeBgColor);
      root.style.setProperty('--text-primary', themeColors.lightModeTextColor);
      localStorage.setItem('freevideoaimaker_theme', 'light');
    }
  }, [themeColors, darkMode]);

  // 4. Dynamic Content & Sections CMS Configurable from Admin
  const [siteContent, setSiteContent] = useState<SiteContentConfig>({
    siteName: 'FreeVideoAIMaker',
    heroBadge: '4 Free Generations Every Day',
    heroTitle: 'Transform Images Into Cinematic AI Videos',
    heroSubtitle: 'Upload multiple keyframe photos, set directional camera physics, and synthesize high-motion video sequences without watermarks or subscription fees.',
    announcementText: 'Enjoy 4 free unwatermarked AI video generations every day! Automatic 24h retention cleanup.',
    showAnnouncement: true,
    showHeroFeatures: true,
    showShowcaseGallery: true,
    showFeaturesSection: true,
    showAdsLeaderboard: true,
    showAdsSidebar: true,
    generateButtonText: 'Generate Video'
  });

  // Fetch Live Config from Server
  useEffect(() => {
    fetch('/api/site/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.themeColors) setThemeColors(data.themeColors);
        if (data.siteContent) setSiteContent(data.siteContent);
        if (data.dailyLimitPerUser) setDailyLimit(data.dailyLimitPerUser);
      })
      .catch(() => {});
  }, []);

  // 5. Accurate Visitor Counter (Strictly excludes Bots and Admin)
  useEffect(() => {
    const isBot = Boolean(
      (navigator as any).webdriver ||
      /bot|crawler|spider|googlebot|bingbot|slurp/i.test(navigator.userAgent)
    );
    const isAdmin = localStorage.getItem('freevideoai_admin_token') === 'admin-auth-token-secure-x92';

    // Strictly skip bots and admin visits
    if (isBot || isAdmin) return;

    let visitorId = sessionStorage.getItem('freevideoai_visitor_token');
    if (!visitorId) {
      visitorId = `v-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('freevideoai_visitor_token', visitorId);
    }

    fetch('/api/analytics/visitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, isBot, isAdmin })
    }).catch(() => {});
  }, []);

  // 6. Current User Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('freevideoai_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [dailyLimit, setDailyLimit] = useState(4);

  const handleUserLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('freevideoai_user', JSON.stringify(user));
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('freevideoai_user');
  };

  // 7. Images State
  const [images, setImages] = useState<UploadedImage[]>([
    {
      id: 'initial-keyframe-1',
      name: 'Cyberpunk Skyline (Start)',
      url: '/src/assets/images/cyberpunk_neon_cityscape_1791439025025.jpg',
      role: 'start'
    },
    {
      id: 'initial-keyframe-2',
      name: 'Cyber Samurai (Transition)',
      url: '/src/assets/images/futuristic_cyber_samurai_1791439040421.jpg',
      role: 'end'
    }
  ]);

  // 8. Video Settings State
  const [settings, setSettings] = useState<VideoSettings>({
    prompt:
      'Cinematic aerial drone sweep through neon cyan and magenta skyscrapers, transitioning into a holographic cyber warrior, rainy reflections, 8k resolution.',
    negativePrompt: 'blurry, flickering, low quality, jitter, pixelation, watermarks',
    cameraMotion: 'Drone Flyby',
    motionStrength: 7,
    duration: 5,
    aspectRatio: '16:9',
    fps: 24,
    model: 'stabilityai/stable-video-diffusion-img2vid-xt',
    stylePreset: 'cyberpunk',
    seed: 42,
    isPrivate: false
  });

  // 9. Generation Process State
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedVideo, setHasGeneratedVideo] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 10. Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRenderGuideOpen, setIsRenderGuideOpen] = useState(false);
  const [isAdSettingsOpen, setIsAdSettingsOpen] = useState(false);
  const [activeModalVideo, setActiveModalVideo] = useState<GeneratedVideo | null>(null);

  // 11. Ad Configuration
  const [adConfig, setAdConfig] = useState<AdUnitConfig>({
    enabled: true,
    client: '',
    slotId: '',
    showMockPreview: true
  });

  const handleStartGeneration = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (images.length === 0) return;

    const remaining = dailyLimit - currentUser.dailyGenerationsCount;
    if (remaining <= 0) {
      setErrorMessage(`Daily limit reached! You have used your ${dailyLimit} free video generations for today.`);
      return;
    }

    setIsGenerating(true);
    setHasGeneratedVideo(false);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: settings.prompt,
          images: images.map((img) => img.url),
          motion: settings.motionStrength,
          cameraMotion: settings.cameraMotion,
          duration: settings.duration,
          aspectRatio: settings.aspectRatio,
          model: settings.model,
          userId: currentUser.id,
          isPrivate: settings.isPrivate
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setIsGenerating(false);
        setErrorMessage(data.error || data.reason || 'Generation blocked.');
        return;
      }

      const updatedUser: UserAccount = {
        ...currentUser,
        dailyGenerationsCount: currentUser.dailyGenerationsCount + 1,
        totalGenerations: currentUser.totalGenerations + 1
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('freevideoai_user', JSON.stringify(updatedUser));

    } catch (err: any) {
      const updatedUser: UserAccount = {
        ...currentUser,
        dailyGenerationsCount: currentUser.dailyGenerationsCount + 1,
        totalGenerations: currentUser.totalGenerations + 1
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('freevideoai_user', JSON.stringify(updatedUser));
    }
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    setHasGeneratedVideo(true);
  };

  const handleSelectSamplePack = (pack: (typeof SAMPLE_PACKS)[0]) => {
    setSettings((prev) => ({
      ...prev,
      prompt: pack.prompt,
      cameraMotion: pack.cameraMotion,
      motionStrength: pack.motionStrength,
      duration: pack.duration,
      aspectRatio: pack.aspectRatio
    }));
  };

  const handleRemixVideo = (video: GeneratedVideo) => {
    setSettings((prev) => ({
      ...prev,
      prompt: video.prompt,
      cameraMotion: video.cameraMotion,
      duration: (video.duration as any) || 5,
      aspectRatio: video.aspectRatio
    }));

    setImages([
      {
        id: `remix-${Date.now()}`,
        name: `${video.title} Reference`,
        url: video.thumbnailUrl,
        role: 'start'
      }
    ]);

    const studioEl = document.getElementById('studio');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isAdminRoute) {
    return (
      <AdminPanel
        onExitAdmin={() => {
          setIsAdminRoute(false);
          window.history.pushState({}, '', '/');
        }}
        onThemeUpdate={(newColors) => setThemeColors(newColors)}
        onContentUpdate={(newContent) => setSiteContent(newContent)}
      />
    );
  }

  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden flex flex-col ${
        darkMode ? 'bg-[#070b14] text-slate-100' : 'bg-slate-50 text-slate-900'
      } transition-colors selection:bg-cyan-500 selection:text-slate-950`}
    >
      {/* Top Announcement Bar */}
      {siteContent.showAnnouncement && siteContent.announcementText && (
        <div className="w-full bg-gradient-to-r from-cyan-950 via-slate-950 to-fuchsia-950 border-b border-cyan-500/20 py-2 px-4 text-center text-xs text-cyan-300 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate max-w-4xl">{siteContent.announcementText}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleUserLogout}
        onOpenRenderGuide={() => setIsRenderGuideOpen(true)}
        onGoToAdmin={() => {
          setIsAdminRoute(true);
          window.history.pushState({}, '', '/admin-console-x92');
        }}
        onScrollToSection={scrollToSection}
        dailyLimit={dailyLimit}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden w-full pt-8 pb-4">
        <div className="absolute top-0 left-1/4 -z-10 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 -z-10 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          {siteContent.heroBadge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-xs font-semibold shadow-sm shadow-cyan-500/10">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{siteContent.heroBadge}</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400 font-semibold">100% Watermark-Free</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
            {siteContent.heroTitle.includes('Cinematic') ? (
              <>
                {siteContent.heroTitle.split('Cinematic')[0]}
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400 bg-clip-text text-transparent">
                  Cinematic {siteContent.heroTitle.split('Cinematic')[1] || ''}
                </span>
              </>
            ) : (
              siteContent.heroTitle
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {siteContent.heroSubtitle}
          </p>

          {siteContent.showHeroFeatures && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multi-Image Sequencing</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <Compass className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Camera Motion Controls</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Watermarks</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Top Monetization Leaderboard Ad Placement */}
      {siteContent.showAdsLeaderboard && adConfig.enabled && (
        <AdBanner
          format="leaderboard"
          onCustomizeAds={() => setIsAdSettingsOpen(true)}
          adClient={adConfig.client}
          adSlot={adConfig.slotId}
        />
      )}

      {/* Main Studio Workspace */}
      <main id="studio" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-10">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-slate-400 hover:text-white text-xs underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Multi-Image Uploader & Video Settings */}
          <div className="lg:col-span-7 space-y-6 w-full">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xl space-y-6 shadow-xl w-full">
              <MultiImageUploader
                images={images}
                onImagesChange={setImages}
                onSelectSamplePack={handleSelectSamplePack}
              />

              <div className="h-px bg-slate-800/80 w-full" />

              <VideoStudio
                settings={settings}
                onSettingsChange={setSettings}
                onGenerate={handleStartGeneration}
                isGenerating={isGenerating}
                imagesCount={images.length}
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                dailyLimit={dailyLimit}
              />
            </div>
          </div>

          {/* Right Column: Generation Monitor & Live Canvas Video Player */}
          <div className="lg:col-span-5 space-y-6 w-full">
            {isGenerating ? (
              <GenerationProgress
                onComplete={handleGenerationComplete}
                durationSeconds={settings.duration}
              />
            ) : hasGeneratedVideo ? (
              <LiveVideoRenderer
                images={images}
                settings={settings}
                onRemixPrompt={() => {
                  const studioEl = document.getElementById('studio');
                  if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[380px]">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/20">
                  <Film className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h3 className="text-base font-bold text-slate-200">
                    Interactive Video Canvas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your generated video will render here with live camera motions, continuous loop preview, and unwatermarked HD export.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleStartGeneration}
                    disabled={images.length === 0}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Run Synthesis Preview</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sidebar Monetization Ad Slot */}
            {siteContent.showAdsSidebar && adConfig.enabled && (
              <AdBanner
                format="rectangle"
                onCustomizeAds={() => setIsAdSettingsOpen(true)}
                adClient={adConfig.client}
                adSlot={adConfig.slotId}
              />
            )}
          </div>
        </div>

        {/* Community / Showcase Section (Hidden if disabled by Admin) */}
        {siteContent.showShowcaseGallery && (
          <ShowcaseGallery
            onRemixVideo={handleRemixVideo}
            onOpenVideoModal={(vid) => setActiveModalVideo(vid)}
            onCustomizeAds={() => setIsAdSettingsOpen(true)}
          />
        )}

        {/* Feature Matrix & Technical Capabilities (Hidden if disabled by Admin) */}
        {siteContent.showFeaturesSection && <FeaturesSection />}
      </main>

      {/* Footer */}
      <Footer
        onOpenRenderGuide={() => setIsRenderGuideOpen(true)}
        onGoToAdmin={() => {
          setIsAdminRoute(true);
          window.history.pushState({}, '', '/admin-console-x92');
        }}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleUserLoginSuccess}
      />

      <RenderDeploymentModal
        isOpen={isRenderGuideOpen}
        onClose={() => setIsRenderGuideOpen(false)}
      />

      <AdCustomizerModal
        isOpen={isAdSettingsOpen}
        onClose={() => setIsAdSettingsOpen(false)}
        config={adConfig}
        onSaveConfig={setAdConfig}
      />

      <VideoModal
        video={activeModalVideo}
        onClose={() => setActiveModalVideo(null)}
        onRemix={handleRemixVideo}
      />
    </div>
  );
}
