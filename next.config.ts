import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Force all routes to be dynamic to avoid serialization errors
  trailingSlash: true,
  images: {
    // Optimize images for better performance
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    forceSwcTransforms: true,
    // Optimize bundle size
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@heroicons/react']
  },
  // Force all pages to be dynamically rendered
  generateEtags: false,
  // Disable trailing slash redirects during build
  skipTrailingSlashRedirect: true,
  // Enable compression
  compress: true,
  // Optimize build output
  swcMinify: true,
};

export default nextConfig;
