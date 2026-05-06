// CDN and static asset optimization for high traffic

export interface CDNConfig {
  baseUrl: string;
  regions: string[];
  cacheControl: string;
  compressionEnabled: boolean;
  imageOptimization: boolean;
}

export class CDNOptimizer {
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
  }

  // Generate CDN URL for static assets
  getAssetUrl(path: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  }): string {
    const baseUrl = this.config.baseUrl;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    let url = `${baseUrl}/${cleanPath}`;
    
    // Add image optimization parameters
    if (options && this.config.imageOptimization) {
      const params = new URLSearchParams();
      
      if (options.width) params.append('w', options.width.toString());
      if (options.height) params.append('h', options.height.toString());
      if (options.quality) params.append('q', options.quality.toString());
      if (options.format) params.append('f', options.format);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    return url;
  }

  // Generate cache control headers
  getCacheHeaders(assetType: 'static' | 'dynamic' | 'api'): Record<string, string> {
    switch (assetType) {
      case 'static':
        return {
          'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
          'Expires': new Date(Date.now() + 31536000 * 1000).toUTCString(),
        };
      case 'dynamic':
        return {
          'Cache-Control': 'public, max-age=3600, must-revalidate', // 1 hour
        };
      case 'api':
        return {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        };
      default:
        return {};
    }
  }

  // Get optimal image format based on browser support
  getOptimalImageFormat(userAgent?: string): 'webp' | 'avif' | 'jpg' | 'png' {
    if (!userAgent) return 'webp';
    
    // Check for AVIF support (Chrome 85+, Firefox 113+)
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      const chromeVersion = userAgent.match(/Chrome\/(\d+)/)?.[1];
      if (chromeVersion && parseInt(chromeVersion) >= 85) return 'avif';
    }
    
    // Check for WebP support (most modern browsers)
    if (userAgent.includes('Chrome') || userAgent.includes('Firefox') || 
        userAgent.includes('Safari') || userAgent.includes('Edge')) {
      return 'webp';
    }
    
    // Fallback to JPEG
    return 'jpg';
  }

  // Generate responsive image srcset
  generateSrcSet(basePath: string, widths: number[], format?: 'webp' | 'avif' | 'jpg' | 'png'): string {
    return widths
      .map(width => `${this.getAssetUrl(basePath, { width, format })} ${width}w`)
      .join(', ');
  }

  // Generate picture element for optimal image delivery
  generatePictureElement(
    basePath: string,
    alt: string,
    widths: number[],
    className?: string
  ): string {
    const webpSrcset = this.generateSrcSet(basePath, widths, 'webp');
    const avifSrcset = this.generateSrcSet(basePath, widths, 'avif');
    const jpgSrcset = this.generateSrcSet(basePath, widths, 'jpg');
    
    return `
      <picture>
        <source srcset="${avifSrcset}" type="image/avif">
        <source srcset="${webpSrcset}" type="image/webp">
        <img 
          src="${this.getAssetUrl(basePath, { width: widths[0] })}" 
          srcset="${jpgSrcset}"
          alt="${alt}"
          ${className ? `class="${className}"` : ''}
          loading="lazy"
          decoding="async"
        >
      </picture>
    `.trim();
  }
}

// CDN configuration for different environments
export const cdnConfigs = {
  development: {
    baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:3000',
    regions: ['us-east-1'],
    cacheControl: 'public, max-age=3600',
    compressionEnabled: true,
    imageOptimization: false,
  },
  staging: {
    baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://staging-cdn.makao.com',
    regions: ['us-east-1', 'eu-west-1'],
    cacheControl: 'public, max-age=3600',
    compressionEnabled: true,
    imageOptimization: true,
  },
  production: {
    baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.makao.com',
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'],
    cacheControl: 'public, max-age=31536000',
    compressionEnabled: true,
    imageOptimization: true,
  },
};

// Initialize CDN optimizer
const cdnConfig = cdnConfigs[process.env.NODE_ENV as keyof typeof cdnConfigs] || cdnConfigs.development;
export const cdn = new CDNOptimizer(cdnConfig);

// Helper functions for Next.js
export function getCDNAssetUrl(path: string, options?: Parameters<typeof cdn.getAssetUrl>[1]): string {
  return cdn.getAssetUrl(path, options);
}

export function getCacheHeaders(assetType: Parameters<typeof cdn.getCacheHeaders>[0]): Record<string, string> {
  return cdn.getCacheHeaders(assetType);
}

// Image optimization helpers
export function optimizeImageProps(
  src: string,
  alt: string,
  options?: {
    width?: number;
    height?: number;
    priority?: boolean;
    className?: string;
  }
) {
  const widths = [320, 640, 768, 1024, 1280, 1536];
  const optimalWidth = options?.width || widths[Math.floor(widths.length / 2)];
  
  return {
    src: getCDNAssetUrl(src, { width: optimalWidth }),
    srcSet: widths.map(w => `${getCDNAssetUrl(src, { width: w })} ${w}w`).join(', '),
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    alt,
    loading: options?.priority ? 'eager' : 'lazy',
    decoding: 'async',
    className: options?.className,
  };
}

// Critical CSS inlining helper
export function getCriticalCSS(): string {
  // In production, this would be generated by build tools
  return `
    body{font-family:system-ui,sans-serif;line-height:1.5}
    .container{max-width:1200px;margin:0 auto;padding:0 1rem}
    .btn{padding:0.5rem 1rem;border:none;border-radius:0.25rem;cursor:pointer}
    .btn-primary{background:#3b82f6;color:white}
  `.trim();
}

// Resource hints for performance
export function getResourceHints(): string {
  return `
    <link rel="dns-prefetch" href="${cdnConfig.baseUrl}">
    <link rel="preconnect" href="${cdnConfig.baseUrl}" crossorigin>
    <link rel="preload" href="${getCDNAssetUrl('/fonts/inter.woff2')}" as="font" type="font/woff2" crossorigin>
  `.trim();
}
