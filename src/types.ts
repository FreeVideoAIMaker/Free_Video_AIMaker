export type ImageRole = 'start' | 'keyframe' | 'end' | 'style_ref' | 'motion_guide';

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  role: ImageRole;
  aspectRatio?: string;
  timestamp?: number;
}

export type CameraMotion =
  | 'Pan Left'
  | 'Pan Right'
  | 'Tilt Up'
  | 'Tilt Down'
  | 'Zoom In'
  | 'Zoom Out'
  | 'Orbit 360°'
  | 'Drone Flyby'
  | 'FPV Roll'
  | 'Static Cinematic';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type VideoDuration = 3 | 5 | 8 | 10;
export type VideoFps = 24 | 30 | 60;

export type VideoModelId =
  | 'stabilityai/stable-video-diffusion-img2vid-xt'
  | 'Lightricks/LTX-Video'
  | 'tencent/HunyuanVideo'
  | 'THUDM/CogVideoX-5b';

export interface VideoModel {
  id: VideoModelId;
  name: string;
  badge: string;
  description: string;
  recommendedDuration: string;
  speed: 'Ultra Fast' | 'Balanced' | 'High Quality';
}

export interface StylePreset {
  id: string;
  name: string;
  icon: string;
  promptModifier: string;
  lighting: string;
}

export interface VideoSettings {
  prompt: string;
  negativePrompt: string;
  cameraMotion: CameraMotion;
  motionStrength: number;
  duration: VideoDuration;
  aspectRatio: AspectRatio;
  fps: VideoFps;
  model: VideoModelId;
  stylePreset: string;
  seed: number;
  isPrivate?: boolean; // Customer option: keep video private (hide from showcase)
}

export interface GeneratedVideo {
  id: string;
  title: string;
  prompt: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  aspectRatio: AspectRatio;
  date: string;
  model: string;
  cameraMotion: CameraMotion;
  likes: number;
  tags: string[];
  keyframesCount: number;
  expiresAt?: number;
  isPrivate?: boolean;
}

export interface AdUnitConfig {
  enabled: boolean;
  client: string;
  slotId: string;
  showMockPreview: boolean;
}

// User & Authentication Types
export interface UserAccount {
  id: string;
  name: string;
  email: string;
  maskedEmail: string;
  passwordHash: string;
  createdAt: string;
  dailyGenerationsCount: number;
  lastGenerationDate: string;
  totalGenerations: number;
  isBanned: boolean;
  role: 'user' | 'admin';
}

// Safety & Moderation Types
export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
  category?: 'political' | 'nsfw' | 'violence' | 'hate' | 'illegal' | 'none';
  flaggedKeywords?: string[];
}

// Audit Log for Admin Security
export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  prompt: string;
  model: string;
  status: 'ALLOWED' | 'BLOCKED';
  reason?: string;
  ipAddress?: string;
}

// Admin Timeline Analytics
export interface DailyMetric {
  date: string;
  visitors: number;
  generations: number;
  blockedRequests: number;
}

// Theme Color Palette Config
export interface SiteThemeColors {
  primaryAccent: string; // e.g. #00f5d4
  secondaryAccent: string; // e.g. #a855f7
  lightModeTextColor: string; // e.g. #0f172a
  lightModeBgColor: string; // e.g. #f8fafc
  darkModeBgColor: string; // e.g. #070b14
}

// Customizable Content & Section CMS Config
export interface SiteContentConfig {
  siteName: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  announcementText: string;
  showAnnouncement: boolean;
  showHeroFeatures: boolean;
  showShowcaseGallery: boolean;
  showFeaturesSection: boolean;
  showAdsLeaderboard: boolean;
  showAdsSidebar: boolean;
  generateButtonText: string;
}

// Global Site Configuration controlled exclusively by Admin
export interface SiteAdminSettings {
  hfToken: string;
  mongoDbUri: string;
  mongoDbStatus: 'connected' | 'disconnected' | 'testing';
  dailyLimitPerUser: number;
  watermarkEnabled: boolean;
  retentionHours: number;
  maintenanceMode: boolean;
  themeColors: SiteThemeColors;
  siteContent: SiteContentConfig;
  adsConfig: AdUnitConfig;
}
