"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase, validateUser } from '@/lib/supabase'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { Progress as UIProgress} from '@/components/ui/progress'

export default function Progress() {
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState(null)
  const [progress, setProgress] = useState({})
  const [totalDays, setTotalDays] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const loadData = useCallback(async () => {
    if (isInitialized) return // Prevent re-initialization
    
    try {
      setLoading(true)
      const user = await validateUser()
      setUser(user)
      
      if (!user) {
        setLoading(false)
        setIsInitialized(true)
        return
      }

      // Load settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('qada_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (settingsError) throw settingsError

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

        // Load progress
        const { data: progressData, error: progressError } = await supabase
          .from('qada_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('day_number', { ascending: true })

        if (progressError) throw progressError

        // Convert array to object for easier lookup
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
      toast.error('فشل في تحميل بيانات التقدم')
      console.error('Progress load error:', error)
    } finally {
      setLoading(false)
      setIsInitialized(true)
    }
  }, [isInitialized])

  useEffect(() => {
    loadData()

    // Listen for auth changes only after initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isInitialized) return
      
      if (session?.user) {
        // Don't reload data automatically to prevent loops
        setUser(session.user)
      } else {
        setUser(null)
        setSettings(null)
        setProgress({})
        setTotalDays(0)
        setLoading(false)
      }
    })

    // Listen for settings updates with debouncing
    const handleSettingsUpdate = () => {
      if (!isInitialized) return
      
      const timeoutId = setTimeout(() => {
        setIsInitialized(false) // Reset to allow reload
        loadData()
      }, 300)
      
      return () => clearTimeout(timeoutId)
    }
    
    window.addEventListener('qada:settings-updated', handleSettingsUpdate)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('qada:settings-updated', handleSettingsUpdate)
    }
  }, [loadData, isInitialized])

  const isDayComplete = (dayNumber) => {
    const dayProgress = progress[dayNumber]
    if (!dayProgress) return false
    return ['fajr_completed', 'dhuhr_completed', 'asr_completed', 'maghrib_completed', 'isha_completed']
      .every(key => dayProgress[key])
  }

  const getCompletedDays = () => {
    return Object.keys(progress).filter(day => isDayComplete(day)).length
  }

  const getCompletedPrayers = () => {
    return Object.values(progress).reduce((total, day) => {
      return total + ['fajr_completed', 'dhuhr_completed', 'asr_completed', 'maghrib_completed', 'isha_completed']
        .filter(key => day[key]).length
    }, 0)
  }

  const getTotalPrayers = () => totalDays * 5

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center text-muted-foreground">
        <p>سجل دخولك لرؤية التقدم</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center text-muted-foreground">
        <p>لم يتم تكوين الإعدادات بعد</p>
        <p className="text-xs mt-1">يرجى تحديد فترة القضاء من الإعدادات</p>
      </div>
    )
  }

  const completedDays = getCompletedDays()
  const completedPrayers = getCompletedPrayers()
  const totalPrayers = getTotalPrayers()
  const dayCompletionPercentage = totalDays > 0 ? (completedDays / totalDays) * 100 : 0
  const prayerCompletionPercentage = totalPrayers > 0 ? (completedPrayers / totalPrayers) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary */}
      <div className="text-center space-y-3">
        <h3 className="text-xl font-semibold">تقدم القضاء</h3>
        
        {/* Days Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>الأيام المكتملة</span>
            <span>{completedDays} من {totalDays}</span>
          </div>
          <UIProgress 
            value={dayCompletionPercentage} 
            className="h-3 bg-muted [&>div]:bg-green-500" 
          />
          <p className="text-xs text-muted-foreground">
            {dayCompletionPercentage.toFixed(1)}% من الأيام مكتملة
          </p>
        </div>

        {/* Prayers Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>الصلوات المكتملة</span>
            <span>{completedPrayers} من {totalPrayers}</span>
          </div>
          <UIProgress 
            value={prayerCompletionPercentage} 
            className="h-3 bg-muted [&>div]:bg-green-600" 
          />
          <p className="text-xs text-muted-foreground">
            {prayerCompletionPercentage.toFixed(1)}% من الصلوات مكتملة
          </p>
        </div>
      </div>

      {/* Settings Info */}
      <div className="bg-muted/30 p-4 rounded-lg space-y-2">
        <h4 className="font-medium">إعدادات القضاء الحالية</h4>
        {settings.number_of_days ? (
          <p className="text-sm text-muted-foreground">
            عدد الأيام: <span className="font-medium">{settings.number_of_days} يوماً</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            الفترة: من <span className="font-medium">{settings.start_date}</span> إلى <span className="font-medium">{settings.end_date}</span>
          </p>
        )}
      </div>

      {/* Prayer Breakdown */}
      <div className="space-y-3">
        <h4 className="font-medium">تفصيل الصلوات</h4>
        <div className="grid grid-cols-1 gap-2 text-sm">
          {[
            { key: 'fajr_completed', name: 'الفجر' },
            { key: 'dhuhr_completed', name: 'الظهر' },
            { key: 'asr_completed', name: 'العصر' },
            { key: 'maghrib_completed', name: 'المغرب' },
            { key: 'isha_completed', name: 'العشاء' }
          ].map(prayer => {
            const completed = Object.values(progress).filter(day => day[prayer.key]).length
            const percentage = totalDays > 0 ? (completed / totalDays) * 100 : 0
            
            return (
              <div key={prayer.key} className="flex items-center justify-between">
                <span>{prayer.name}</span>
                <div className="flex items-center gap-2 flex-1 max-w-32">
                  <UIProgress 
                    value={percentage} 
                    className="flex-1 h-2 bg-muted [&>div]:bg-green-400" 
                  />
                  <span className="text-xs text-muted-foreground min-w-12">
                    {completed}/{totalDays}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
