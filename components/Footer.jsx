"use client"

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full p-6 text-sm border-t border-border/10 mt-auto" style={{ color: '#A0A0A0' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="leading-relaxed">"اللهم أعني على ذكرك وشكرك وحسن عبادتك"</p>
        <nav className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Link 
            href="/ruling" 
            className="underline hover:text-foreground transition-colors"
          >
            حكم قضاء الصلوات الفائتة
          </Link>
          <a
            href="https://github.com/Ahmedalaa01v/qadaa"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            مفتوح المصدر
          </a>
        </nav>
      </div>
    </footer>
  )
}
