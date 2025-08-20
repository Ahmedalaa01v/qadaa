export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ruling'],
        disallow: ['/api/', '/_next/', '/admin/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl.replace(/\/$/, '')
  }
}


