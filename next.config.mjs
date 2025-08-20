/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable optimizeCss temporarily to fix build issues
  experimental: {
    // optimizeCss: true, // Disabled temporarily
  },
  
  // Environment validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Remove source maps in production
  productionBrowserSourceMaps: false,

  // PWA considerations
  async rewrites() {
    return [
      // Arabic pretty URL without encoding issues
      {
        source: '/حكم%20قضاء%20الصلوات%20الفائتة',
        destination: '/حكم قضاء الصلوات الفائتة'
      }
    ]
  },

  // Security headers
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              isProd
                ? "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in https://accounts.google.com https://oauth2.googleapis.com https://vitals.vercel-insights.com",
              "frame-src 'self' https://accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // Security headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
