import { IBM_Plex_Sans_Arabic, Aref_Ruqaa } from "next/font/google";
import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: 'swap',
  preload: true,
});

const arefRuqaa = Aref_Ruqaa({
  variable: "--font-aref-ruqaa",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: 'swap',
  preload: true,
});



export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "قضاء الصلوات - Qada Prayer Tracker",
  description: "Track and manage your missed prayers (Qada Salah) with ease. Stay organized in making up your missed daily prayers.",
  keywords: "qada, prayer tracker, salah, missed prayers, islamic app, قضاء الصلوات, تتبع الصلوات, الصلاة",
  authors: [{ name: "Qada Tracker Team" }],
  creator: "Qada Tracker",
  publisher: "Qada Tracker",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'قضاء الصلوات',
    title: 'قضاء الصلوات - Qada Prayer Tracker',
    description: 'Track and manage your missed prayers (Qada Salah) with ease. Stay organized in making up your missed daily prayers.',
    images: [
      {
        url: '/logo/logo.png',
        width: 512,
        height: 512,
        alt: 'قضاء الصلوات - Qada Prayer Tracker',
      },
      {
        url: '/logo/logo.svg',
        width: 512,
        height: 512,
        alt: 'قضاء الصلوات - Qada Prayer Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'قضاء الصلوات - Qada Prayer Tracker',
    description: 'Track and manage your missed prayers (Qada Salah) with ease. Stay organized in making up your missed daily prayers.',
    images: ['/logo/logo.png'],
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  category: 'lifestyle',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'قضاء الصلوات',
  },
  formatDetection: {
    telephone: false,
  },
  // Favicon and icons
  icons: {
    icon: [
      // Primary scalable favicon (SVG)
      { url: '/logo/logo.svg', type: 'image/svg+xml' },
      // Fallback PNG/ICO favicons for legacy browsers
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/logo/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/logo/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/logo/logo.svg',
        color: '#3ecf8e',
      },
    ],
  },
};

// Separate viewport export (Next.js 14+ requirement)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#3ecf8e',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="dark" style={{ direction: 'rtl' }}>
      <head>
        {/* Essential favicon links for maximum compatibility (2024 best practices) */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo/logo.svg" type="image/svg+xml" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        
        {/* Apple/Android icons using new logo */}
        <link rel="apple-touch-icon" href="/logo/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo/logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo/logo.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/logo/logo.png" />
        
        {/* Windows tiles */}
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="msapplication-TileColor" content="#3ecf8e" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Security Headers via Meta Tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        
        {/* Theme Color for mobile browsers */}
        <meta name="theme-color" content="#3ecf8e" />
        <meta name="msapplication-navbutton-color" content="#3ecf8e" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Apple Web App specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="قضاء الصلوات" />
        
        {/* Additional PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="قضاء الصلوات" />
      </head>
      <body
        className={`${ibmPlexSansArabic.variable} ${arefRuqaa.variable} font-sans antialiased bg-background text-foreground`}
        style={{ direction: 'rtl', textAlign: 'right' }}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
