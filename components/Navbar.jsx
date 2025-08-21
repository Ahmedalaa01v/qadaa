"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { BarChart3 } from 'lucide-react'
import { supabase, validateUser } from '@/lib/supabase'
import Settings from '@/components/Settings'
import AccountDialog from '@/components/AccountDialog'
import dynamic from 'next/dynamic'
import LoadingSpinner from '@/components/ui/loading-spinner'

const Progress = dynamic(() => import('@/components/Progress'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-6">
      <LoadingSpinner />
    </div>
  )
})
import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Navbar() {
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)
  const [user, setUser] = useState(null)
  const prevUserRef = useRef(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await validateUser()
        setUser(currentUser)
        prevUserRef.current = currentUser
      } catch (error) {
        setUser(null)
        prevUserRef.current = null
      }
    }

    getUser()

    // Listen for auth changes
    // One-time reload guard
    const RELOAD_FLAG = 'auth:reloaded'

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Update local state
      setUser(session?.user || null)

      if (typeof window === 'undefined') return

      // Clear the reload flag on sign-out only
      if (event === 'SIGNED_OUT') {
        try { sessionStorage.removeItem(RELOAD_FLAG) } catch {}
      }

      const hasSession = Boolean(session?.user)
      const prevUser = prevUserRef.current
      const isAuthTransitionToSignedIn = (event === 'SIGNED_IN' || event === 'SIGNED_UP') && hasSession && !prevUser

      if (isAuthTransitionToSignedIn) {
        try {
          const alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === '1'
          if (!alreadyReloaded) {
            sessionStorage.setItem(RELOAD_FLAG, '1')
            setTimeout(() => window.location.reload(), 50)
          }
        } catch {}
      }

      // Update previous user reference after handling logic
      prevUserRef.current = session?.user || null
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="w-full p-6 flex items-center justify-between">
      <h1 className="text-lg sm:text-xl font-arabic font-normal tracking-wide" style={{ color: '#A0A0A0' }}>
        <Link href="/" className="no-underline">قضاء الصلوات</Link>
      </h1>
      <div className="flex items-center gap-3">
        {user && (
          <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                متابعة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0">
              <div className="p-6 pb-0">
                <DialogHeader>
                  <DialogTitle>متابعة التقدم</DialogTitle>
                  <DialogDescription>
                    تابع تقدمك في قضاء الصلوات الفائتة
                  </DialogDescription>
                </DialogHeader>
              </div>
              <ScrollArea className="max-h-[70vh]">
                <div className="p-6 pt-3">
                  <Progress />
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
        <Settings />
        <AccountDialog />
      </div>
    </header>
  )
}
