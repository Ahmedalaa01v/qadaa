import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'حكم قضاء الصلوات الفائتة - دليل شامل للأحكام الشرعية | قضاء الصلوات',
  description: 'دليل شامل لحكم قضاء الصلوات الفائتة حسب المذاهب الأربعة. تعرف على آراء العلماء، كيفية القضاء، والترتيب الصحيح. ابدأ رحلة قضاء صلواتك اليوم.',
  keywords: 'قضاء الصلوات, الصلوات الفائتة, حكم القضاء, المذاهب الأربعة, الفقه الإسلامي, صلاة القضاء',
  openGraph: {
    title: 'حكم قضاء الصلوات الفائتة - دليل شامل للأحكام الشرعية',
    description: 'دليل شامل لحكم قضاء الصلوات الفائتة حسب المذاهب الأربعة. تعرف على آراء العلماء وكيفية القضاء الصحيح.',
    url: '/ruling',
    siteName: 'قضاء الصلوات',
    locale: 'ar_SA',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حكم قضاء الصلوات الفائتة - دليل شامل',
    description: 'دليل شامل لحكم قضاء الصلوات الفائتة حسب المذاهب الأربعة',
  },
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
  alternates: {
    canonical: '/ruling',
  },
}

export default function RulingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "حكم قضاء الصلوات الفائتة",
    "description": "دليل شامل لحكم قضاء الصلوات الفائتة حسب المذاهب الأربعة والأحكام الشرعية",
    "author": {
      "@type": "Organization",
      "name": "قضاء الصلوات"
    },
    "publisher": {
      "@type": "Organization",
      "name": "قضاء الصلوات"
    },
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString(),
    "inLanguage": "ar",
    "articleSection": "الفقه الإسلامي",
    "keywords": ["قضاء الصلوات", "الصلوات الفائتة", "حكم القضاء", "المذاهب الأربعة"],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "/ruling"
    }
  }

  return (
    <ErrorBoundary>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
          <article dir="rtl" className="space-y-6" itemScope itemType="https://schema.org/Article">
            <meta itemProp="headline" content="حكم قضاء الصلوات الفائتة" />
            <meta itemProp="description" content="دليل شامل لحكم قضاء الصلوات الفائتة حسب المذاهب الأربعة" />
            <meta itemProp="inLanguage" content="ar" />
            <h2>✅ حكم قضاء الصلوات الفائتة</h2>
            <ul>
              <li>
                <strong>اتفاق جمهور العلماء (المالكية، الشافعية، الحنابلة):</strong>
                الصلاة لا تسقط، ومن فاتته صلاة بعذر (نوم أو نسيان) أو بغير عذر (تقصير)
                <strong> يجب عليه قضاؤها </strong>
                متى تذكرها.
              </li>
              <li>
                <strong>الحنفية:</strong> نفس الحكم، القضاء واجب فورًا.
              </li>
              <li>
                <strong>قول بعض أهل العلم (ابن تيمية وابن حزم):</strong>
                إذا فاتت عمدًا بلا عذر فلا يُقضى بل يكثر من النوافل والتوبة. لكن الرأي الراجح والمعمول به عند جمهور الأمة:
                <strong> القضاء واجب</strong>.
              </li>
            </ul>

            <hr />

            <h2>⏳ وقت قضاء الصلاة</h2>
            <ul>
              <li>
                إذا تذكرت الصلاة أو استيقظت من النوم ← تصليها
                <strong> مباشرةً</strong>.
              </li>
              <li>
                لو كان عندك صلوات كثيرة فائتة ← تقضيها على قدر استطاعتك حتى تُبرئ ذمتك.
              </li>
            </ul>

            <hr />

            <h2>🕌 كيفية القضاء</h2>
            <ol>
              <li>
                <strong>النية:</strong> تنوي في قلبك الصلاة التي تقضيها (مثلاً: &quot;أصلي فرض الظهر قضاءً&quot;).
              </li>
              <li>
                <strong>الترتيب:</strong> الأفضل أن تقضي بالترتيب (فجر ← ظهر ← عصر...)، لكن لو خفت خروج وقت الحاضرة، قدّم الصلاة الحاضرة ثم كمل القضاء.
              </li>
              <li>
                <strong>الكثرة:</strong> لو عليك صلوات كثيرة (سنوات) ← اجعل لنفسك نظام:
                <ul>
                  <li>مع كل صلاة حاضرة، صلِّ معها صلاة فائتة.</li>
                  <li>أو خصص وقت ثابت كل يوم لقضاء عدة صلوات.</li>
                  <li>الهدف: <strong>تستمر حتى تنتهي</strong>.</li>
                </ul>
              </li>
            </ol>

            <hr />

            <h2>🙌 نصيحة عملية</h2>
            <ul>
              <li>لا تيأس لو عليك صلوات كثيرة. خذها خطوة خطوة.</li>
              <li>الأهم تبدأ وما توقفش.</li>
              <li>
                استعن بدعاء النبي ﷺ: <strong>&quot;اللهم أعني على ذكرك وشكرك وحسن عبادتك&quot;</strong>.
              </li>
            </ul>

            {/* Call to Action - Semi-transparent Green Card (Responsive) */}
            <div className="mt-10 p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-white text-sm sm:text-base font-medium text-right flex-1 m-0 leading-relaxed">
                  مستعد تبدأ؟ تتبع قضاء صلواتك بسهولة الآن
                </p>
                <Link href="/" className="shrink-0">
                  <Button
                    size="sm"
                    className="gap-2 bg-white text-black hover:bg-white/90 font-medium shadow-sm transition-all duration-200"
                    aria-label="ابدأ تتبع قضاء الصلوات"
                  >
                    ابدأ التتبع
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        </main>

        <Footer />
      </div>
      <Toaster />
    </ErrorBoundary>
  )
}

// <-   →   