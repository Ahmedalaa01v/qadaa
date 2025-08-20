"use client"

import { useState, useEffect, useRef } from 'react'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Settings as SettingsIcon, AlertCircle, Save } from 'lucide-react'
import { supabase, validateUser } from '@/lib/supabase'
import { format } from 'date-fns'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingSettings, setPendingSettings] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Form state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [numberOfDays, setNumberOfDays] = useState('')
  
  // Current settings
  const [currentSettings, setCurrentSettings] = useState(null)
  const endDateRef = useRef(null)

  useEffect(() => {
    if (isInitialized) return
    
    const getUser = async () => {
      try {
        const user = await validateUser()
        setUser(user)
        
        if (user) {
          await loadUserSettings(user.id)
        }
      } catch (error) {
        setUser(null)
        if (process.env.NODE_ENV === 'development') {
          console.error('Settings get user error:', error)
        }
      } finally {
        setIsInitialized(true)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isInitialized) return
      
      const currentUser = session?.user || null
      setUser(currentUser)
      
      if (currentUser) {
        await loadUserSettings(currentUser.id)
      } else {
        setCurrentSettings(null)
        resetForm()
      }
    })

    return () => subscription.unsubscribe()
  }, [isInitialized])

  const loadUserSettings = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('qada_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        throw error
      }

      setCurrentSettings(data)
      
      if (data) {
        if (data.number_of_days) {
          setNumberOfDays(data.number_of_days.toString())
        } else {
          setNumberOfDays('')
        }
        setStartDate(data.start_date || '')
        setEndDate(data.end_date || '')
      } else {
        resetForm()
      }
    } catch (error) {
      let errorMessage = 'فشل في تحميل الإعدادات'
      
      if (error.message?.includes('relation "qada_settings" does not exist')) {
        errorMessage = 'قاعدة البيانات غير مهيأة. يرجى تشغيل schema.sql في Supabase أولاً'
      } else if (error.message) {
        errorMessage = `خطأ في تحميل الإعدادات: ${error.message}`
      }
      
      toast.error(errorMessage)
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Load settings error:', error)
        console.error('Full error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
      }
    }
  }

  const resetForm = () => {
    setStartDate('')
    setEndDate('')
    setNumberOfDays('')
  }

  const validateForm = () => {
    const hasDateRange = startDate && endDate && startDate.trim() !== '' && endDate.trim() !== ''
    const hasNumberOfDays = numberOfDays && numberOfDays.toString().trim() !== '' && parseInt(numberOfDays) > 0
    
    // Debug validation
    if (process.env.NODE_ENV === 'development') {
      console.log('Validation check:', { 
        startDate, 
        endDate, 
        numberOfDays, 
        hasDateRange, 
        hasNumberOfDays 
      })
    }
    
        // Must have either date range OR number of days, but not both
    if (!hasDateRange && !hasNumberOfDays) {
      toast.error('يرجى إدخال فترة زمنية أو عدد الأيام')
      return false
    }

    if (hasDateRange && hasNumberOfDays) {
      toast.error('يرجى اختيار إما الفترة الزمنية أو عدد الأيام، وليس كلاهما')
      return false
    }

    if (hasDateRange) {
      if (new Date(startDate) >= new Date(endDate)) {
        toast.error('تاريخ البداية يجب أن يكون قبل تاريخ النهاية')
        return false
      }
    }

    if (hasNumberOfDays) {
      const numDays = parseInt(numberOfDays)
      if (isNaN(numDays) || numDays <= 0) {
        toast.error('يرجى إدخال عدد صحيح من الأيام')
        return false
      }
      if (numDays > 365 * 100) { // Max 100 years
        toast.error('عدد الأيام كبير جداً')
        return false
      }
    }
    
    return true
  }

  const handleSave = async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }

    if (!validateForm()) {
      return
    }

    // Snapshot current choices so confirm uses stable values
    const hasDateRange = startDate && endDate && startDate.trim() !== '' && endDate.trim() !== ''
    const hasNumberOfDays = numberOfDays && numberOfDays.toString().trim() !== '' && parseInt(numberOfDays) > 0

    let snapshot = null
    if (hasNumberOfDays) {
      snapshot = {
        mode: 'days',
        number_of_days: parseInt(numberOfDays, 10)
      }
    } else if (hasDateRange) {
      snapshot = {
        mode: 'range',
        start_date: startDate,
        end_date: endDate
      }
    } else {
      toast.error('يجب إدخال إما الفترة الزمنية أو عدد الأيام')
      return
    }

    // First-time setup: skip confirm dialog
    if (!currentSettings) {
      await confirmSave(snapshot)
      return
    }

    // Otherwise, show confirm dialog
    setPendingSettings(snapshot)
    setShowConfirmDialog(true)
  }

  const confirmSave = async (snapshot) => {
    setLoading(true)
    setShowConfirmDialog(false)
    
    try {
      const used = snapshot || pendingSettings
      if (!used) {
        throw new Error('لا توجد بيانات محفوظة للتأكيد')
      }

      // Build payload from snapshot
      const settingsData = used.mode === 'days'
        ? {
            user_id: user.id,
            number_of_days: used.number_of_days,
            start_date: null,
            end_date: null
          }
        : {
            user_id: user.id,
            start_date: used.start_date,
            end_date: used.end_date,
            number_of_days: null
          }

      // Debug: log what we're sending to the database
      if (process.env.NODE_ENV === 'development') {
        console.log('Settings data being sent:', settingsData)
      }

      const { data, error } = await supabase
        .from('qada_settings')
        .upsert(settingsData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()

      if (error) {
        console.error('Detailed Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      toast.success('تم حفظ الإعدادات بنجاح')
      await loadUserSettings(user.id)
      
      // Notify other components to reload
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('qada:settings-updated'))
      }
      
      // Close popover after successful save
      setTimeout(() => {
        setOpen(false)
      }, 1000)
    } catch (error) {
      let errorMessage = 'فشل في حفظ الإعدادات'
      
      // Provide specific error messages based on error type
      if (error.message?.includes('relation "qada_settings" does not exist')) {
        errorMessage = 'قاعدة البيانات غير مهيأة. يرجى تشغيل schema.sql في Supabase أولاً'
      } else if (error.message?.includes('permission denied')) {
        errorMessage = 'ليس لديك صلاحية للوصول لقاعدة البيانات'
      } else if (error.message?.includes('JWT expired')) {
        errorMessage = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى'
      } else if (error.message?.includes('invalid input syntax for type date')) {
        errorMessage = 'تاريخ غير صحيح. يرجى التأكد من صحة التواريخ المدخلة'
      } else if (error.message?.includes('violates check constraint "check_date_or_days"')) {
        errorMessage = 'يجب إدخال إما الفترة الزمنية (تاريخ البداية والنهاية) أو عدد الأيام، وليس كلاهما أو لا شيء'
      } else if (error.message) {
                errorMessage = `خطأ: ${error.message}`
      }

      toast.error(errorMessage)
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Save settings error:', error)
        console.error('Full error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          stack: error.stack
        })
      }
    } finally {
      setLoading(false)
      setPendingSettings(null)
    }
  }

  // Don't show settings if user is not logged in
  if (!user) {
    return null
  }

  return (
    <>
      <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          // Reset form to current settings when closing
          if (currentSettings) {
            if (currentSettings.number_of_days) {
              setNumberOfDays(currentSettings.number_of_days.toString())
            } else {
              setNumberOfDays('')
            }
            setStartDate(currentSettings.start_date || '')
            setEndDate(currentSettings.end_date || '')
          } else {
            resetForm()
          }
        }
      }}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SettingsIcon className="w-4 h-4" />
            الإعدادات
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="end">
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">إعدادات القضاء</h3>
              <p className="text-sm text-muted-foreground">حدد فترة الصلوات المطلوب قضاؤها</p>
              <p className="text-xs text-muted-foreground/70 mt-1">اختر إما الفترة الزمنية أو عدد الأيام</p>
            </div>



            <div className="space-y-4">
              {/* Date Range Fields */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="startDate" className="text-sm font-medium">تاريخ البداية</label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      setStartDate(value)
                      if (value && numberOfDays) {
                        setNumberOfDays('')
                      }
                    }}
                    onInput={(e) => {
                      // If user selects from date picker, the inputType is often 'insertReplacementText'
                      // In that case, we can safely auto-focus the end date immediately.
                      try {
                        const inputType = e.nativeEvent?.inputType
                        const value = e.currentTarget.value.trim()
                        if (
                          inputType === 'insertReplacementText' &&
                          /^\d{4}-\d{2}-\d{2}$/.test(value) &&
                          parseInt(value.slice(0, 4), 10) >= 1000 &&
                          endDateRef.current
                        ) {
                          setTimeout(() => endDateRef.current?.focus(), 0)
                        }
                      } catch {}
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.trim()
                      // Move focus only after the user finishes entering a full date
                      if (/^\d{4}-\d{2}-\d{2}$/.test(value) && endDateRef.current) {
                        setTimeout(() => endDateRef.current?.focus(), 0)
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="endDate" className="text-sm font-medium">تاريخ النهاية</label>
                  <input
                    id="endDate"
                    type="date"
                    ref={endDateRef}
                    value={endDate}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      setEndDate(value)
                      if (value && numberOfDays) {
                        setNumberOfDays('')
                      }
                      
                    }}
                    min={startDate}
                    className="w-full px-3 py-2 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Separator with "Or" */}
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-popover px-3 py-1 text-sm text-muted-foreground border border-border rounded-md">أو</span>
                </div>
              </div>

              {/* Number of Days Field */}
              <div className="space-y-1">
                <label htmlFor="numberOfDays" className="text-sm font-medium">عدد الأيام</label>
                <input
                  id="numberOfDays"
                  type="number"
                  min="1"
                  max="3650"
                  value={numberOfDays}
                  onChange={(e) => {
                    const value = e.target.value.trim()
                    setNumberOfDays(value)
                    if (value && (startDate || endDate)) {
                      setStartDate('')
                      setEndDate('')
                    }
                    
                  }}
                  placeholder="أدخل عدد الأيام"
                  className="w-full px-3 py-2 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-right"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">مثال: 30 يوماً</p>
              </div>
            </div>

            {/* Current settings display */}
            {currentSettings && (
              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                <p className="font-medium">الإعدادات الحالية:</p>
                {currentSettings.number_of_days ? (
                  <p>{currentSettings.number_of_days} يوماً</p>
                ) : (
                  <p>من {currentSettings.start_date} إلى {currentSettings.end_date}</p>
                )}
              </div>
            )}

            <Button 
              onClick={handleSave}
              disabled={loading}
              className="w-full gap-2"
              size="sm"
            >
              {loading ? <LoadingSpinner size="small" /> : <Save className="w-4 h-4" />}
              {loading ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حفظ الإعدادات</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حفظ هذه الإعدادات؟
            </DialogDescription>
          </DialogHeader>
          
          {/* Settings Preview */}
          {(() => {
            if (!pendingSettings) return null

            if (pendingSettings.mode === 'days') {
              return (
                <div className="mt-2 p-3 bg-muted rounded text-sm">
                  <strong>عدد الأيام:</strong> {pendingSettings.number_of_days} يوماً
                </div>
              )
            }

            try {
              const startDateObj = new Date(pendingSettings.start_date)
              const endDateObj = new Date(pendingSettings.end_date)
              if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
                return (
                  <div className="mt-2 p-3 bg-muted rounded text-sm">
                    <strong>الفترة:</strong> من {format(startDateObj, 'dd/MM/yyyy')} إلى {format(endDateObj, 'dd/MM/yyyy')}
                  </div>
                )
              }
            } catch (error) {
              console.error('Date formatting error:', error)
            }

            return null
          })()}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={() => confirmSave()} disabled={loading} className="gap-2">
              {loading && <LoadingSpinner size="small" />}
              {loading ? 'جارٍ الحفظ...' : 'تأكيد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

