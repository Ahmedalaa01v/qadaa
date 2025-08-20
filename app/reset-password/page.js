"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Lock, Eye, EyeOff, Mail } from 'lucide-react'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/ui/loading-spinner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from '@/components/ui/sonner'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('checking') // 'checking' | 'form' | 'invalid'
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    let didSet = false

    // 1) Prefer event-driven approach per Supabase best practice
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        didSet = true
        setStatus('form')
      }
    })

    // 2) Fallback: check current session (user opened link and session already set)
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session && !didSet) {
          setStatus('form')
          return
        }
        // 3) Grace period to allow client to exchange/restore session
        setTimeout(() => {
          if (!didSet) setStatus('invalid')
        }, 1200)
      } catch {
        setStatus('invalid')
      }
    }

    init()

    return () => subscription?.unsubscribe()
  }, [])

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('يرجى إدخال كلمة المرور وتأكيدها')
      return
    }

    if (newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('كلمة المرور وتأكيدها غير متطابقتين')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      toast.success('تم تغيير كلمة المرور بنجاح')
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error) {
      toast.error('فشل في تغيير كلمة المرور')
      console.error('Reset password error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResendRecovery = async () => {
    if (!recoveryEmail) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      return
    }
    setResendLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      toast.success('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني')
    } catch (error) {
      toast.error('تعذر إرسال رابط إعادة التعيين')
      console.error('Resend recovery error:', error)
    } finally {
      setResendLoading(false)
    }
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <LoadingSpinner />
        </main>
        <Footer />
        <Toaster />
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">رابط غير صالح أو منتهي</h1>
              <p className="text-muted-foreground text-sm">يمكنك طلب رابط جديد لإعادة تعيين كلمة المرور</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="recoverEmail" className="text-sm font-medium">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <input
                    id="recoverEmail"
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                    className="w-full pr-10 pl-3 py-2 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-right"
                    disabled={resendLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleResendRecovery()}
                  />
                </div>
              </div>

              <Button onClick={handleResendRecovery} disabled={resendLoading} className="w-full gap-2">
                {resendLoading && <LoadingSpinner size="small" />}
                {resendLoading ? 'جارٍ الإرسال...' : 'إرسال رابط جديد'}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => router.push('/')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={resendLoading}
                >
                  العودة إلى الصفحة الرئيسية
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">إعادة تعيين كلمة المرور</h1>
            <p className="text-muted-foreground">أدخل كلمة المرور الجديدة</p>
          </div>

          <div className="space-y-4">
            {/* New Password Input */}
            <div className="space-y-1">
              <label htmlFor="newPassword" className="text-sm font-medium">كلمة المرور الجديدة</label>
              <div className="relative">
                <Lock className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                  className="w-full pr-10 pl-10 py-2 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-right"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className="w-full pr-10 pl-10 py-2 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-right"
                  disabled={loading}
                  onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full gap-2"
            >
              {loading && <LoadingSpinner size="small" />}
              {loading ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
            </Button>

            <div className="text-center">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                العودة إلى الصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  )
}
