import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow phone & local network devices to access local development files
  allowedDevOrigins: ['10.15.138.123', '10.15.138.123:3000', 'localhost:3000'],

  // Explicitly tell Turbopack your app directory root to clear the workspace lockfile warning
  turbopack: {
    root: __dirname,
  },

  images: {
    remotePatterns: [
      // Allow Google profile photos
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Allow common food image CDNs (for menu item imageUrls)
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Allow SVG files via next/image
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Ensure server-only modules don't leak into client bundle
  serverExternalPackages: ['@aws-sdk/client-dynamodb', '@aws-sdk/lib-dynamodb'],
};

export default nextConfig;
