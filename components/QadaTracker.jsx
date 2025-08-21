"use client"

import React, { useState, useEffect, useCallback, memo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Check } from 'lucide-react'
import { supabase, validateUser } from '@/lib/supabase'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { toast } from 'sonner'

const PRAYER_NAMES = {
  fajr: 'الفجر',
  dhuhr: 'الظهر', 
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء'
}

const PRAYER_KEYS = ['fajr_completed', 'dhuhr_completed', 'asr_completed', 'maghrib_completed', 'isha_completed']

const QadaTracker = memo(function QadaTracker() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(null)
  const [progress, setProgress] = useState({})
  const [totalDays, setTotalDays] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isTabVisible, setIsTabVisible] = useState(true)
  const gridRef = useRef(null)
  const hasAutoScrolledRef = useRef(false)
  const [showAllDays, setShowAllDays] = useState(false)

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (isInitialized) return // Prevent re-initialization

    const loadUserData = async (userId) => {
      try {
        setLoading(true)
        
        // Load settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('qada_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (settingsError) {
          throw settingsError
        }

        setSettings(settingsData)

        if (settingsData) {
          let days = 0
          if (settingsData.number_of_days) {
            days = settingsData.number_of_days
          } else if (settingsData.start_date && settingsData.end_date) {
            const start = new Date(settingsData.start_date)
            const end = new Date(settingsData.end_date)
            days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
          }
          setTotalDays(days)

          // Load progress efficiently - only fetch what we need
          const { data: progressData, error: progressError } = await supabase
            .from('qada_progress')
            .select('day_number, fajr_completed, dhuhr_completed, asr_completed, maghrib_completed, isha_completed')
            .eq('user_id', userId)
            .lte('day_number', days) // Only load progress for valid days
            .order('day_number', { ascending: true })

          if (progressError) {
            throw progressError
          }

          // Convert array to object for O(1) lookup
          const progressMap = {}
          progressData?.forEach(day => {
            progressMap[day.day_number] = day
          })
          setProgress(progressMap)
        } else {
          setTotalDays(0)
          setProgress({})
        }
      } catch (error) {
        toast.error('فشل في تحميل البيانات')
        if (process.env.NODE_ENV === 'development') {
          console.error('Load user data error:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    const initializeUser = async () => {
      try {
        const user = await validateUser()
        setUser(user)
        
        if (user) {
          await loadUserData(user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        setUser(null)
        setLoading(false)
        toast.error('فشل في تحميل بيانات المستخدم')
        if (process.env.NODE_ENV === 'development') {
          console.error('QadaTracker get user error:', error)
        }
      } finally {
        setIsInitialized(true)
      }
    }

    initializeUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isInitialized || !isTabVisible) return // Only respond to auth changes after initialization and when tab is visible
      
      const currentUser = session?.user || null
      setUser(currentUser)
      
      if (currentUser) {
        await loadUserData(currentUser.id)
      } else {
        setSettings(null)
        setProgress({})
        setTotalDays(0)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isInitialized]) // Only run when isInitialized changes

  // Handle settings updates with debouncing
  useEffect(() => {
    if (!isInitialized || !user || !isTabVisible) return

    const handleSettingsUpdate = () => {
      // Only update if tab is visible
      if (!isTabVisible) return
      
      // Debounce to prevent multiple rapid calls
      const timeoutId = setTimeout(async () => {
        try {
          setLoading(true)
          
          // Load settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('qada_settings')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

          if (settingsError) {
            throw settingsError
          }

          setSettings(settingsData)

          if (settingsData) {
            let days = 0
            if (settingsData.number_of_days) {
              days = settingsData.number_of_days
            } else if (settingsData.start_date && settingsData.end_date) {
              const start = new Date(settingsData.start_date)
              const end = new Date(settingsData.end_date)
              days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
            }
            setTotalDays(days)

            // Load progress efficiently - only fetch what we need
            const { data: progressData, error: progressError } = await supabase
              .from('qada_progress')
              .select('day_number, fajr_completed, dhuhr_completed, asr_completed, maghrib_completed, isha_completed')
              .eq('user_id', user.id)
              .lte('day_number', days) // Only load progress for valid days
              .order('day_number', { ascending: true })

            if (progressError) {
              throw progressError
            }

            // Convert array to object for O(1) lookup
            const progressMap = {}
            progressData?.forEach(day => {
              progressMap[day.day_number] = day
            })
            setProgress(progressMap)
          } else {
            setTotalDays(0)
            setProgress({})
          }
        } catch (error) {
          toast.error('فشل في تحديث البيانات')
          if (process.env.NODE_ENV === 'development') {
            console.error('Settings update error:', error)
          }
        } finally {
          setLoading(false)
        }
      }, 300) // 300ms debounce

      return () => clearTimeout(timeoutId)
    }

    window.addEventListener('qada:settings-updated', handleSettingsUpdate)

    return () => {
      window.removeEventListener('qada:settings-updated', handleSettingsUpdate)
    }
  }, [user, isInitialized, isTabVisible]) // Include tab visibility in dependencies

  const togglePrayer = useCallback(async (dayNumber, prayerField) => {
    if (!user) return

    // Optimistic update for better UX
    const currentProgress = progress[dayNumber] || {}
    const newValue = !currentProgress[prayerField]
    
    // Update local state immediately
    setProgress(prev => ({
      ...prev,
      [dayNumber]: {
        ...prev[dayNumber],
        [prayerField]: newValue
      }
    }))

    try {
      // Update in database
      const { error } = await supabase
        .from('qada_progress')
        .upsert({
          user_id: user.id,
          day_number: dayNumber,
          [prayerField]: newValue,
          // Preserve other prayer values
          fajr_completed: prayerField === 'fajr_completed' ? newValue : (currentProgress.fajr_completed || false),
          dhuhr_completed: prayerField === 'dhuhr_completed' ? newValue : (currentProgress.dhuhr_completed || false),
          asr_completed: prayerField === 'asr_completed' ? newValue : (currentProgress.asr_completed || false),
          maghrib_completed: prayerField === 'maghrib_completed' ? newValue : (currentProgress.maghrib_completed || false),
          isha_completed: prayerField === 'isha_completed' ? newValue : (currentProgress.isha_completed || false),
        }, {
          onConflict: 'user_id,day_number',
          ignoreDuplicates: false
        })

      if (error) {
        // Revert optimistic update on error
        setProgress(prev => ({
          ...prev,
          [dayNumber]: {
            ...prev[dayNumber],
            [prayerField]: !newValue
          }
        }))
        throw error
      }
    } catch (error) {
      toast.error('فشل في تحديث الحالة')
      if (process.env.NODE_ENV === 'development') {
        console.error('Toggle prayer error:', error)
      }
    }
  }, [user, progress])

  const markDayComplete = useCallback(async (dayNumber) => {
    if (!user) return

    // Optimistic update
    setProgress(prev => ({
      ...prev,
      [dayNumber]: {
        ...prev[dayNumber],
        fajr_completed: true,
        dhuhr_completed: true,
        asr_completed: true,
        maghrib_completed: true,
        isha_completed: true,
      }
    }))

    try {
      // Mark all prayers as completed for this day
      const { error } = await supabase
        .from('qada_progress')
        .upsert({
          user_id: user.id,
          day_number: dayNumber,
          fajr_completed: true,
          dhuhr_completed: true,
          asr_completed: true,
          maghrib_completed: true,
          isha_completed: true,
        }, {
          onConflict: 'user_id,day_number',
          ignoreDuplicates: false
        })

      if (error) {
        // Revert optimistic update on error
        setProgress(prev => ({
          ...prev,
          [dayNumber]: prev[dayNumber] || {}
        }))
        throw error
      }
    } catch (error) {
      toast.error('فشل في تحديث اليوم')
      if (process.env.NODE_ENV === 'development') {
        console.error('Mark day complete error:', error)
      }
    }
  }, [user])

  const isDayComplete = useCallback((dayNumber) => {
    const dayProgress = progress[dayNumber]
    if (!dayProgress) return false
    return PRAYER_KEYS.every(key => dayProgress[key])
  }, [progress])

  const getPrayerStatus = useCallback((dayNumber, prayerField) => {
    return progress[dayNumber]?.[prayerField] || false
  }, [progress])

  // Find first incomplete day for auto-scroll
  const findFirstIncompleteDay = useCallback(() => {
    for (let dayNumber = 1; dayNumber <= totalDays; dayNumber++) {
      if (!isDayComplete(dayNumber)) {
        return dayNumber
      }
    }
    return null // All days complete
  }, [totalDays, isDayComplete])

  // Memoize the rendered days array to prevent unnecessary re-renders
  const renderedDays = React.useMemo(() => {
    const maxDays = showAllDays ? totalDays : Math.min(totalDays, 300)
    return Array.from({ length: maxDays }, (_, index) => {
      const dayNumber = index + 1
      const isComplete = isDayComplete(dayNumber)
      
      return (
        <div
          key={dayNumber}
          data-day={dayNumber}
          className={`p-4 rounded-lg border transition-all duration-200 ${
            isComplete 
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
              : 'bg-card border-border'
          }`}
        >
          {/* Day Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">
              اليوم {dayNumber}
            </h3>
            <Button
              size="sm"
              onClick={() => markDayComplete(dayNumber)}
              disabled={isComplete}
              className={`gap-1 text-xs px-2 py-1 h-7 ${isComplete ? 'bg-green-600 hover:bg-green-600' : ''}`}
            >
              <Check className="w-3 h-3" />
              {isComplete ? 'مكتمل' : 'تم'}
            </Button>
          </div>

          <Separator className="mb-3" />

          {/* Prayer Boxes */}
          <div className="grid grid-cols-5 gap-1.5">
            {PRAYER_KEYS.map((prayerField, index) => {
              const isCompleted = getPrayerStatus(dayNumber, prayerField)
              const prayerName = Object.values(PRAYER_NAMES)[index]
              
              return (
                <div
                  key={prayerField}
                  className="text-center space-y-1"
                >
                  <button
                    onClick={() => togglePrayer(dayNumber, prayerField)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      isCompleted
                        ? 'bg-green-500  border-green-600 text-white' 
                        : 'bg-muted border-border hover:border-primary/50'
                    }`}
                    title={`${prayerName} - ${isCompleted ? 'مكتملة' : 'غير مكتملة'}`}
                    aria-label={`${prayerName} - ${isCompleted ? 'مكتملة' : 'غير مكتملة'}`}
                  >
                    {isCompleted && <Check className="w-3 h-3 mx-auto" />}
                  </button>
                  <p className="text-xs text-muted-foreground truncate">{prayerName}</p>
                </div>
              )
            })}
          </div>

          
        </div>
      )
    })
  }, [totalDays, showAllDays, isDayComplete, getPrayerStatus, togglePrayer, markDayComplete])

  // Auto-scroll to first incomplete day only once per page load
  useEffect(() => {
    if (hasAutoScrolledRef.current) return
    if (!loading && totalDays > 0 && gridRef.current) {
      const firstIncompleteDay = findFirstIncompleteDay()
      if (firstIncompleteDay) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const dayElement = gridRef.current?.querySelector(`[data-day="${firstIncompleteDay}"]`)
          if (dayElement) {
            dayElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            })
          }
        }, 150)
      }
      hasAutoScrolledRef.current = true
    }
  }, [loading, totalDays, findFirstIncompleteDay])

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center space-y-4 py-20">
        <div className="" style={{ color: '#A1A1A1' }}>
          <h2 className="text-2xl font-semibold mb-2">مرحباً بك في تطبيق قضاء الصلوات</h2>
          <p>سجل دخولك لبدء تتبع قضاء الصلوات</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center space-y-4 py-20">
        <div className="text-muted-foreground">
          <h2 className="text-2xl font-semibold mb-2">لم يتم تكوين الإعدادات</h2>
          <p>يرجى تحديد فترة القضاء من خلال زر الإعدادات أعلاه</p>
        </div>
      </div>
    )
  }

  if (totalDays === 0) {
    return (
      <div className="text-center space-y-4 py-20">
        <div className="text-muted-foreground">
          <h2 className="text-2xl font-semibold mb-2">إعدادات غير صحيحة</h2>
          <p>يرجى مراجعة الإعدادات وتحديد فترة صحيحة</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Days Grid - Optimized virtual rendering for large datasets */}
      <div 
        ref={gridRef}
        className="grid gap-4"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
        }}
      >
        {renderedDays}
      </div>
      
      {totalDays > 300 && !showAllDays && (
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-3">
            عرض أول 300 يوم لتحسين الأداء
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAllDays(true)}
            className="gap-2"
          >
            عرض جميع الأيام ({totalDays})
          </Button>
        </div>
      )}
    </div>
  )
})

export default QadaTracker
