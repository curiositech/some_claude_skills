import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Static export for Cloudflare Pages
  output: 'export',

  // Image optimization - use unoptimized for static export
  images: {
    unoptimized: true,
  },

  // Trailing slashes for static hosting
  trailingSlash: true,
};

export default nextConfig;
