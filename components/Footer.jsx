"use client"

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full p-6 flex items-center justify-between text-sm text-muted-foreground/60 border-t border-border/10 mt-auto">
      <span>"اللهم أعني على ذكرك وشكرك وحسن عبادتك"</span>
      <Link 
        href="/ruling" 
        className="underline hover:text-foreground transition-colors"
      >
        حكم قضاء الصلوات الفائتة
      </Link>
    </footer>
  )
}
