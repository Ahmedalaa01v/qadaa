"use client"

import { useState, useEffect, useRef } from 'react'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { User, LogOut, Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react'
import { supabase, validateUser, secureSignOut } from '@/lib/supabase'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

export default function AccountDialog() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [signInAttempts, setSignInAttempts] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const prevUserRef = useRef(null)
  const isInitializedRef = useRef(false)
  const [showEmailSentAlert, setShowEmailSentAlert] = useState(false)
  const [authMode, setAuthMode] = useState('signIn') // 'signIn' | 'signUp'
  const [canResendConfirmation, setCanResendConfirmation] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    if (isInitialized) return
    
    // Get current user with validation
    const getUser = async () => {
      try {
        const user = await validateUser()
        setUser(user)
        prevUserRef.current = user
      } catch (error) {
        // Handle auth errors gracefully
        setUser(null)
        prevUserRef.current = null
        if (process.env.NODE_ENV === 'development') {
          console.error('Get user error:', error)
        }
      } finally {
        setIsInitialized(true)
        isInitializedRef.current = true
      }
    }

    getUser()

    // Listen for auth changes (use refs to avoid stale closures)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user || null

      // If not initialized yet, just sync ref and bail
      if (!isInitializedRef.current) {
        prevUserRef.current = nextUser
        return
      }

      const prevUser = prevUserRef.current
      setUser(nextUser)

      // Close dialog and reset form on successful login
      if (event === 'SIGNED_IN' && !prevUser && nextUser) {
        setOpen(false)
        resetForm()
        // Page refresh is handled by Navbar component
      }

      if (event === 'SIGNED_OUT') {
        resetForm()
        prevUserRef.current = null
      }

      // Update prev user ref
      prevUserRef.current = nextUser
    })

    return () => subscription.unsubscribe()
  }, [isInitialized])

  const handleAuth = async () => {
    // Rate limiting: max 3 attempts per minute
    if (signInAttempts >= 3) {
      toast.error('تم تجاوز الحد الأقصى لمحاولات المصادقة. حاول مرة أخرى لاحقاً')
      return
    }

    if (!email || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    setShowEmailSentAlert(false)
    setCanResendConfirmation(false)

    try {
      if (authMode === 'signIn') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password
        })

        if (signInError) {
          if (signInError.message?.toLowerCase().includes('email not confirmed')) {
            toast.error('يرجى تأكيد بريدك الإلكتروني أولاً')
            setCanResendConfirmation(true)
            setSignInAttempts(prev => prev + 1)
            return
          }

          if (signInError.message?.toLowerCase().includes('invalid login credentials')) {
            toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
            setSignInAttempts(prev => prev + 1)
            return
          }

          if (signInError.message?.toLowerCase().includes('too many requests')) {
            toast.error('تم تجاوز الحد الأقصى للطلبات. حاول لاحقاً')
            return
          }

          throw signInError
        }
        // Success path handled by onAuthStateChange
        return
      }

      // Sign Up mode
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
        }
      })

      if (signUpError) {
        if (signUpError.message?.toLowerCase().includes('user already registered')) {
          toast.error('لديك حساب بالفعل. استخدم تسجيل الدخول')
          setAuthMode('signIn')
          // If user is registered but cannot log in, allow resend confirmation
          setCanResendConfirmation(true)
          return
        }

        if (signUpError.message?.toLowerCase().includes('unable to validate email address')) {
          toast.error('البريد الإلكتروني الذي أدخلته غير صالح')
          return
        }

        throw signUpError
      }

      // New user: show confirmation alert
      if (signUpData?.user && !signUpData.session) {
        setShowEmailSentAlert(true)
        return
      }
    } catch (error) {
      let errorMessage = 'حدث خطأ أثناء المصادقة. حاول مرة أخرى'
      if (error?.message?.includes('Password should be at least 6 characters')) {
        errorMessage = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      } else if (error?.message?.includes('Unable to validate email address')) {
        errorMessage = 'البريد الإلكتروني الذي أدخلته غير صالح'
      }

      toast.error(errorMessage)

      if (process.env.NODE_ENV === 'development') {
        console.error('Auth error:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('يرجى إدخال بريدك الإلكتروني أولاً')
      return
    }

    setResendLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      })
      if (error) throw error
      setShowEmailSentAlert(true)
      setCanResendConfirmation(false)
      toast.success('تم إرسال رابط التأكيد مرة أخرى')
    } catch (error) {
      toast.error('تعذر إرسال رابط التأكيد')
      if (process.env.NODE_ENV === 'development') {
        console.error('Resend confirmation error:', error)
      }
    } finally {
      setResendLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setSignInAttempts(0)
    setShowForgotPassword(false)
    setResetEmail('')
    setShowEmailSentAlert(false)
    setAuthMode('signIn')
    setCanResendConfirmation(false)
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      return
    }

    setResetLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
      })

      if (error) {
        throw error
      }

      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
      setShowForgotPassword(false)
      setResetEmail('')
    } catch (error) {
      toast.error('فشل في إرسال رابط إعادة تعيين كلمة المرور')
      if (process.env.NODE_ENV === 'development') {
        console.error('Reset password error:', error)
      }
    } finally {
      setResetLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      // Clear session on server and client
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) throw error

      // Close and reset UI state
      setOpen(false)
      resetForm()

      // Force session re-check without full reload to avoid double-clicks
      await supabase.auth.getSession()
      // Soft refresh for safety
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 50)
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج')
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign out error:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="flex flex-col gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="الملف الشخصي" 
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm truncate" title={user.user_metadata?.full_name}>
                  {user.user_metadata?.full_name}
                </p>
                <p className="text-xs text-muted-foreground truncate" title={user.email}>
                  {user.email}
                </p>
              </div>
            </div>
            

            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
              disabled={loading}
              className={`gap-2 ${loading ? 'pointer-events-none opacity-70' : ''}`}
            >
              {loading ? <LoadingSpinner size="small" /> : <LogOut className="w-4 h-4" />}
              {loading ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        resetForm()
      }
    }}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="w-4 h-4" />
          الحساب
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex flex-col gap-4">
          {!showForgotPassword ? (
            <>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{authMode === 'signIn' ? 'تسجيل الدخول' : 'إنشاء حساب'}</h3>
                <p className="text-sm text-muted-foreground">
                  {authMode === 'signUp' ? 'أدخل بريدك وكلمة المرور لإنشاء حساب جديد' : ''}
                </p>
              </div>

              <div className="space-y-3">
                {/* Email Input */}
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="أدخل بريدك الإلكتروني"
                      className="w-full pr-10 pl-3 py-2 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-right"
                      disabled={loading}
                      onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label htmlFor="password" className="text-sm font-medium">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                      className="w-full pr-10 pl-10 py-2 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-right"
                      disabled={loading}
                      onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
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
              </div>

              {/* Email Sent Alert (also used for forgot-password mobile UX) */}
              {showEmailSentAlert && (
                <Alert className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-800">
                  <AlertTitle className="text-yellow-800 dark:text-yellow-400 font-medium">
                    تحقق من بريدك الإلكتروني
                  </AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                    قم بفتح البريد الوارد واضغط على الرابط لإكمال العملية.
                  </AlertDescription>
                </Alert>
              )}

              {/* Resend Confirmation CTA when needed */}
              {canResendConfirmation && (
                <div className="flex items-center justify-between rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3">
                  <span className="text-xs text-amber-800 dark:text-amber-300">بريدك غير مؤكد. هل تريد إعادة إرسال رابط التأكيد؟</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    className="gap-2"
                  >
                    {resendLoading && <LoadingSpinner size="small" />}
                    إرسال مجدداً
                  </Button>
                </div>
              )}

              {/* Action Button */}
              <Button 
                onClick={handleAuth}
                disabled={loading || signInAttempts >= 3}
                className="w-full gap-2"
                size="sm"
              >
                {loading && <LoadingSpinner size="small" />}
                {loading ? (
                  'جاري المعالجة...'
                ) : signInAttempts >= 3 ? (
                  'حاول لاحقاً'
                ) : authMode === 'signIn' ? (
                  'تسجيل الدخول'
                ) : (
                  'إنشاء حساب'
                )}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                {authMode === 'signIn' ? (
                  <button
                    onClick={() => { setAuthMode('signUp'); setShowEmailSentAlert(false); setCanResendConfirmation(false) }}
                    className="text-primary hover:underline transition-colors"
                    disabled={loading}
                  >
                    لا تملك حساباً؟ أنشئ حساباً
                  </button>
                ) : (
                  <button
                    onClick={() => { setAuthMode('signIn'); setShowEmailSentAlert(false); setCanResendConfirmation(false) }}
                    className="text-primary hover:underline transition-colors"
                    disabled={loading}
                  >
                    لديك حساب؟ سجّل الدخول
                  </button>
                )}
              </div>
              
              {/* Forgot Password Link (only for sign-in mode) */}
              {authMode === 'signIn' && (
                <div className="text-center">
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-primary hover:underline transition-colors"
                    disabled={loading}
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
              )}

              {signInAttempts > 0 && signInAttempts < 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  المحاولات المتبقية: {3 - signInAttempts}
                </p>
              )}
            </>
          ) : (
            <>
              {/* Forgot Password Form */}
              <div className="text-center">
                <h3 className="text-lg font-semibold">إعادة تعيين كلمة المرور</h3>
                <p className="text-sm text-muted-foreground">أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="resetEmail" className="text-sm font-medium">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="أدخل بريدك الإلكتروني"
                      className="w-full pr-10 pl-3 py-2 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-right"
                      disabled={resetLoading}
                      onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword()}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1"
                  size="sm"
                  disabled={resetLoading}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={async () => {
                    await handleForgotPassword()
                    setShowEmailSentAlert(true)
                  }}
                  disabled={resetLoading}
                  className="flex-1 gap-2"
                  size="sm"
                >
                  {resetLoading && <LoadingSpinner size="small" />}
                  {resetLoading ? 'جاري الإرسال...' : 'إرسال'}
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}