import { VideoModel, StylePreset, GeneratedVideo } from '../types';

export const AI_MODELS: VideoModel[] = [
  {
    id: 'stabilityai/stable-video-diffusion-img2vid-xt',
    name: 'Stable Video Diffusion XT',
    badge: 'Standard Industry',
    description: 'High temporal consistency and cinematic photorealism from single or multiple keyframe images.',
    recommendedDuration: '4s – 6s',
    speed: 'Balanced'
  },
  {
    id: 'Lightricks/LTX-Video',
    name: 'LTX-Video Ultra',
    badge: 'Fast Inference',
    description: 'Transformer-based spatial-temporal model with prompt alignment and high frame rates.',
    recommendedDuration: '5s – 8s',
    speed: 'Ultra Fast'
  },
  {
    id: 'tencent/HunyuanVideo',
    name: 'HunyuanVideo Cinema',
    badge: 'Cinema 4K Quality',
    description: 'State-of-the-art open diffusion model supporting complex camera physics and fine lighting.',
    recommendedDuration: '5s – 10s',
    speed: 'High Quality'
  },
  {
    id: 'THUDM/CogVideoX-5b',
    name: 'CogVideoX 5B Studio',
    badge: '3D Variational',
    description: 'Advanced 3D VAE compression for fluid motion, organic transitions, and dynamic depth.',
    recommendedDuration: '6s',
    speed: 'Balanced'
  }
];

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cinematic',
    name: 'Cinematic 8K',
    icon: 'Film',
    promptModifier: 'cinematic lighting, 35mm anamorphic lens, 8k resolution, photorealistic depth of field, blockbuster color grade',
    lighting: 'Volumetric natural rim light'
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    icon: 'Zap',
    promptModifier: 'cyberpunk aesthetic, vibrant neon cyan and magenta lights, rainy reflective asphalt, futuristic atmosphere, volumetric fog',
    lighting: 'Neon holographic glow'
  },
  {
    id: 'anime',
    name: 'Anime / Ghibli',
    icon: 'Sparkles',
    promptModifier: 'hand-drawn anime masterwork, Studio Ghibli inspired, vibrant painted colors, soft natural sunlight, emotive animation',
    lighting: 'Soft golden hour diffusion'
  },
  {
    id: 'scifi',
    name: 'Sci-Fi Dark Odyssey',
    icon: 'Compass',
    promptModifier: 'interstellar space cinematography, realistic NASA IMAX rendering, cosmic starlight, epic scale, deep space vacuum',
    lighting: 'Cold cosmic specular'
  },
  {
    id: 'nature',
    name: 'National Geographic',
    icon: 'Trees',
    promptModifier: 'ultra-realistic wildlife documentary, BBC Earth grade, slow-motion fluid physics, crystal clear focus, organic textures',
    lighting: 'High-noon natural daylight'
  },
  {
    id: 'vintage',
    name: 'Vintage 35mm Film',
    icon: 'Camera',
    promptModifier: 'authentic 1970s Kodachrome film stock, subtle organic film grain, warm nostalgic tones, vintage lens flares',
    lighting: 'Warm tungsten'
  }
];

export const SAMPLE_PACKS = [
  {
    id: 'pack-cyberpunk',
    title: 'Cyberpunk Metropolis Flight',
    description: 'Multi-layer neon cityscape with flying air-traffic and reflective rain.',
    url: '/src/assets/images/cyberpunk_neon_cityscape_1791439025025.jpg',
    prompt: 'Aerial drone flythrough between glowing neon skyscrapers in a rain-soaked futuristic metropolis, holographic billboards in cyan and violet, flying vehicles with motion blur, 8k cinema.',
    cameraMotion: 'Drone Flyby' as const,
    motionStrength: 8,
    duration: 5 as const,
    aspectRatio: '16:9' as const
  },
  {
    id: 'pack-samurai',
    title: 'Neon Cyber Samurai',
    description: 'High-contrast portrait of an armored warrior in an alleyway.',
    url: '/src/assets/images/futuristic_cyber_samurai_1791439040421.jpg',
    prompt: 'Slow-motion cinematic close-up of a cyber samurai warrior drawing a plasma katana, neon visor reflecting cyan city lights, rain droplets falling in ultra-slow motion.',
    cameraMotion: 'Zoom In' as const,
    motionStrength: 6,
    duration: 5 as const,
    aspectRatio: '16:9' as const
  },
  {
    id: 'pack-ocean',
    title: 'Bioluminescent Abyss',
    description: 'Deep-ocean creature gliding over glowing coral reef.',
    url: '/src/assets/images/deep_ocean_bioluminescent_1791439049346.jpg',
    prompt: 'Smooth camera drift following a bioluminescent manta creature gliding over glowing turquoise and violet coral reefs in deep underwater trench, floating plankton light sparks.',
    cameraMotion: 'Pan Right' as const,
    motionStrength: 7,
    duration: 8 as const,
    aspectRatio: '16:9' as const
  },
  {
    id: 'pack-space',
    title: 'Celestial Nebula Drift',
    description: 'Cosmic dust storm colliding with ringed exoplanet.',
    url: '/src/assets/images/celestial_space_nebula_1791439061139.jpg',
    prompt: 'Hypnotic slow-orbit camera traversing radiant magenta and stardust cosmic clouds, sparkling stellar nursery with glowing ringed planet slowly rotating.',
    cameraMotion: 'Orbit 360°' as const,
    motionStrength: 5,
    duration: 10 as const,
    aspectRatio: '16:9' as const
  }
];

export const SHOWCASE_VIDEOS: GeneratedVideo[] = [
  {
    id: 'video-1',
    title: 'Neo-Tokyo Midnight Glide',
    prompt: 'Drone sweep across high-altitude neon highways, cyan glowing signage and futuristic maglev trains passing underneath, wet optical reflections.',
    videoUrl: '/src/assets/images/cyberpunk_neon_cityscape_1791439025025.jpg',
    thumbnailUrl: '/src/assets/images/cyberpunk_neon_cityscape_1791439025025.jpg',
    duration: 5,
    aspectRatio: '16:9',
    date: 'March 2026',
    model: 'LTX-Video Ultra',
    cameraMotion: 'Drone Flyby',
    likes: 1420,
    tags: ['Cyberpunk', 'Cityscape', '4K Drone', 'Night'],
    keyframesCount: 3
  },
  {
    id: 'video-2',
    title: 'Ronin of the Grid',
    prompt: 'Slow cinematic dolly zoom on cybernetic samurai visor with neon cyan illumination, rain streaks on titanium armor plating, dramatic depth of field.',
    videoUrl: '/src/assets/images/futuristic_cyber_samurai_1791439040421.jpg',
    thumbnailUrl: '/src/assets/images/futuristic_cyber_samurai_1791439040421.jpg',
    duration: 5,
    aspectRatio: '16:9',
    date: 'March 2026',
    model: 'Stable Video Diffusion XT',
    cameraMotion: 'Zoom In',
    likes: 2190,
    tags: ['Action', 'Character', 'Sci-Fi', 'Slow Motion'],
    keyframesCount: 2
  },
  {
    id: 'video-3',
    title: 'Abyssal Bioluminescence',
    prompt: 'Deep sea exploration camera gliding beside glowing translucent creature with pulsing azure cilia, ethereal undersea reef illumination.',
    videoUrl: '/src/assets/images/deep_ocean_bioluminescent_1791439049346.jpg',
    thumbnailUrl: '/src/assets/images/deep_ocean_bioluminescent_1791439049346.jpg',
    duration: 8,
    aspectRatio: '16:9',
    date: 'March 2026',
    model: 'HunyuanVideo Cinema',
    cameraMotion: 'Pan Right',
    likes: 980,
    tags: ['Nature', 'Underwater', 'Documentary', 'Bioluminescence'],
    keyframesCount: 4
  },
  {
    id: 'video-4',
    title: 'Cosmic Stellar Genesis',
    prompt: 'Pan-celestial camera sweep through glowing violet gaseous nebula clouds into orbiting planetary ring with realistic cosmic dust particles.',
    videoUrl: '/src/assets/images/celestial_space_nebula_1791439061139.jpg',
    thumbnailUrl: '/src/assets/images/celestial_space_nebula_1791439061139.jpg',
    duration: 10,
    aspectRatio: '16:9',
    date: 'March 2026',
    model: 'CogVideoX 5B Studio',
    cameraMotion: 'Orbit 360°',
    likes: 1750,
    tags: ['Space', 'IMAX', 'Cosmic', 'Nebula'],
    keyframesCount: 2
  }
];
