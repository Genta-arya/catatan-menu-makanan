export type VideoPlatform = 'youtube' | 'tiktok' | 'instagram' | 'other';

export interface VideoInfo {
  platform: VideoPlatform;
  label: string;
  embedUrl?: string;
  originalUrl: string;
}

export function parseVideoUrl(url?: string): VideoInfo | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null;

  const trimmed = url.trim();

  // 1. YouTube Detection (Regular, Shorts, youtu.be)
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      platform: 'youtube',
      label: 'YouTube',
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      originalUrl: trimmed,
    };
  }

  // 2. TikTok Detection
  if (/tiktok\.com/i.test(trimmed)) {
    return {
      platform: 'tiktok',
      label: 'TikTok',
      originalUrl: trimmed,
    };
  }

  // 3. Instagram Detection
  if (/instagram\.com\/(reel|p|tv)\//i.test(trimmed) || /instagram\.com/i.test(trimmed)) {
    return {
      platform: 'instagram',
      label: 'Instagram',
      originalUrl: trimmed,
    };
  }

  // 4. Other video link
  if (/^https?:\/\//i.test(trimmed)) {
    return {
      platform: 'other',
      label: 'Video Link',
      originalUrl: trimmed,
    };
  }

  return null;
}
