import { VideoModel, StylePreset, GeneratedVideo } from '../types';

export const AI_MODELS: VideoModel[] = [
  {
    id: 'stabilityai/stable-video-diffusion-img2vid-xt',
    name: 'Stable Video Diffusion XT',
    badge: 'Standard Industry',
    description: 'High temporal consistency and cinematic photorealism from single or multiple keyframe images.',
    recommendedDuration: '4s - 6s',
    speed: 'Balanced'
  },
  {
    id: 'Lightricks/LTX-Video',
    name: 'LTX-Video Ultra',
    badge: 'Fast Inference',
    description: 'Transformer-based spatial-temporal model with prompt alignment and high frame rates.',
    recommendedDuration: '5s - 8s',
    speed: 'Ultra Fast'
  }
];

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cinematic',
    name: 'Cinematic 8K',
    icon: 'Film',
    promptModifier: 'cinematic lighting, 35mm anamorphic lens, 8k resolution, photorealistic depth of field',
    lighting: 'Volumetric rim light'
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    icon: 'Zap',
    promptModifier: 'cyberpunk aesthetic, vibrant neon cyan and magenta lights, rainy reflective asphalt',
    lighting: 'Neon holographic glow'
  }
];

export const SAMPLE_PACKS = [
  {
    id: 'pack-cyberpunk',
    title: 'Cyberpunk Metropolis Flight',
    description: 'Multi-layer neon cityscape with flying air-traffic and reflective rain.',
    url: '/images/cyberpunk_neon_cityscape_1791439025025.jpg',
    prompt: 'Aerial drone flythrough between glowing neon skyscrapers in a rain-soaked futuristic metropolis.',
    cameraMotion: 'Drone Flyby' as const,
    motionStrength: 8,
    duration: 5 as const,
    aspectRatio: '16:9' as const
  },
  {
    id: 'pack-samurai',
    title: 'Neon Cyber Samurai',
    description: 'High-contrast portrait of an armored warrior in an alleyway.',
    url: '/images/futuristic_cyber_samurai_1791439040421.jpg',
    prompt: 'Slow-motion cinematic close-up of a cyber samurai warrior drawing a plasma katana.',
    cameraMotion: 'Zoom In' as const,
    motionStrength: 6,
    duration: 5 as const,
    aspectRatio: '16:9' as const
  }
];

export const SHOWCASE_VIDEOS: GeneratedVideo[] = [
  {
    id: 'video-1',
    title: 'Neo-Tokyo Midnight Glide',
    prompt: 'Drone sweep across high-altitude neon highways, cyan glowing signage.',
    videoUrl: '/images/cyberpunk_neon_cityscape_1791439025025.jpg',
    thumbnailUrl: '/images/cyberpunk_neon_cityscape_1791439025025.jpg',
    duration: 5,
    aspectRatio: '16:9',
    date: 'March 2026',
    model: 'LTX-Video Ultra',
    cameraMotion: 'Drone Flyby',
    likes: 1420,
    tags: ['Cyberpunk', 'Night'],
    keyframesCount: 3
  }
];
