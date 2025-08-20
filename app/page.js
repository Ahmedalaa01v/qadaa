"use client"

import QadaTracker from '@/components/QadaTracker'
import ErrorBoundary from '@/components/ErrorBoundary'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from '@/components/ui/sonner'

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-6 py-8 max-w-7xl mx-auto w-full">
          <ErrorBoundary>
            <QadaTracker />
          </ErrorBoundary>
        </main>

        <Footer />
      </div>
      <Toaster />
    </ErrorBoundary>
  )
}
