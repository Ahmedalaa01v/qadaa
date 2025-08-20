"use client"

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await validateUser()
        setUser(currentUser)
      } catch (error) {
        setUser(null)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      // Only refresh on explicit auth events, not session recovery
      if ((event === 'SIGNED_IN' || event === 'SIGNED_OUT') && !document.hidden) {
        if (typeof window !== 'undefined') {
          // Small delay to prevent race conditions
          setTimeout(() => {
            window.location.reload()
          }, 100)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="w-full p-6 flex items-center justify-between">
      <h1 className="text-xl font-arabic font-normal text-muted-foreground/80 tracking-wide">
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
