import { useState, useEffect } from 'react';

export type AspectRatioType = '16:9' | '9:16' | '1:1' | '4:5' | '4:3' | '21:9' | 'unknown';

interface AspectRatioInfo {
  ratio: AspectRatioType;
  className: string;
  numericRatio: number;
}

const ASPECT_RATIOS: { type: AspectRatioType; value: number; threshold: number }[] = [
  { type: '21:9', value: 21 / 9, threshold: 0.15 },   // 2.33 - Ultra-wide
  { type: '16:9', value: 16 / 9, threshold: 0.15 },   // 1.78 - Landscape
  { type: '4:3', value: 4 / 3, threshold: 0.1 },      // 1.33 - Classic
  { type: '1:1', value: 1, threshold: 0.1 },          // 1.00 - Square
  { type: '4:5', value: 4 / 5, threshold: 0.1 },      // 0.80 - Portrait Instagram
  { type: '9:16', value: 9 / 16, threshold: 0.15 },   // 0.56 - Stories/Reels
];

const RATIO_CLASSES: Record<AspectRatioType, string> = {
  '21:9': 'aspect-[21/9]',
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
  '9:16': 'aspect-[9/16]',
  'unknown': 'aspect-[4/3]',
};

export function detectAspectRatio(width: number, height: number): AspectRatioInfo {
  const imageRatio = width / height;
  
  // Find the closest matching aspect ratio
  let bestMatch: AspectRatioType = 'unknown';
  let smallestDiff = Infinity;
  
  for (const { type, value, threshold } of ASPECT_RATIOS) {
    const diff = Math.abs(imageRatio - value);
    if (diff < smallestDiff && diff <= threshold * value) {
      smallestDiff = diff;
      bestMatch = type;
    }
  }
  
  // If no close match found, pick the closest one anyway
  if (bestMatch === 'unknown') {
    for (const { type, value } of ASPECT_RATIOS) {
      const diff = Math.abs(imageRatio - value);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        bestMatch = type;
      }
    }
  }
  
  return {
    ratio: bestMatch,
    className: RATIO_CLASSES[bestMatch],
    numericRatio: imageRatio,
  };
}

export function useImageAspectRatio(imageUrl: string | undefined): AspectRatioInfo & { loading: boolean } {
  const [info, setInfo] = useState<AspectRatioInfo>({
    ratio: 'unknown',
    className: RATIO_CLASSES['unknown'],
    numericRatio: 4 / 3,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const img = new Image();
    
    img.onload = () => {
      const detected = detectAspectRatio(img.naturalWidth, img.naturalHeight);
      setInfo(detected);
      setLoading(false);
    };
    
    img.onerror = () => {
      setLoading(false);
    };
    
    img.src = imageUrl;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return { ...info, loading };
}

export function getAspectRatioLabel(ratio: AspectRatioType): string {
  const labels: Record<AspectRatioType, string> = {
    '21:9': 'Ultra-wide',
    '16:9': 'Landscape',
    '4:3': 'Classic',
    '1:1': 'Square',
    '4:5': 'Portrait',
    '9:16': 'Stories',
    'unknown': 'Custom',
  };
  return labels[ratio];
}
