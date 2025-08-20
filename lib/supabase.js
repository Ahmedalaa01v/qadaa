import { createClient } from '@supabase/supabase-js'

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Enhanced Supabase client configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // More secure auth flow
  },
  global: {
    headers: {
      'x-client-info': 'qaleel-daim@1.0.0',
      'Prefer': 'return=minimal', // Reduce response size
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 1, // Stricter rate limiting
      timeout: 10000, // 10 second timeout
    },
  },
})

// Input validation and sanitization
const validateUserId = (userId) => {
  if (!userId || typeof userId !== 'string' || userId.length < 36) {
    throw new Error('Invalid user ID format')
  }
  return userId.trim()
}

const validateDayNumber = (dayNumber) => {
  const day = parseInt(dayNumber)
  if (isNaN(day) || day < 1 || day > 36500) { // Max ~100 years
    throw new Error('Invalid day number')
  }
  return day
}

// Rate limiting for sensitive operations
const operationLimits = new Map()
const checkRateLimit = (operation, userId, maxPerMinute = 60) => {
  const key = `${operation}:${userId}`
  const now = Date.now()
  const minute = Math.floor(now / 60000)
  const currentKey = `${key}:${minute}`
  
  const count = operationLimits.get(currentKey) || 0
  if (count >= maxPerMinute) {
    throw new Error(`Rate limit exceeded for ${operation}`)
  }
  
  operationLimits.set(currentKey, count + 1)
  
  // Cleanup old entries
  setTimeout(() => {
    operationLimits.delete(currentKey)
  }, 120000) // Keep for 2 minutes
}

// Enhanced error logging function with better debugging
const logError = (context, error, additionalInfo = {}) => {
  const errorInfo = {
    context,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
    status: error.status,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Supabase Error:`, errorInfo)
  }
  
  // In production, you might want to send to error monitoring service
  // Example: Sentry.captureException(error, { tags: { context }, extra: errorInfo })
}

// Helper function to check if user is authenticated with better error handling
export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      logError('checkAuth', error)
      return null
    }
    return session
  } catch (error) {
    logError('checkAuth', error)
    return null
  }
}

// Helper function to get user qada settings
export const getUserSettings = async (userId, retryCount = 0) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Check authentication first
    const session = await checkAuth()
    if (!session) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('qada_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      logError('getUserSettings', error, { userId, retryCount })
      
      // Retry logic for specific errors
      if ((error.code === '406' || error.status === 406) && retryCount < 2) {
        console.warn(`Retrying getUserSettings (attempt ${retryCount + 1})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return getUserSettings(userId, retryCount + 1)
      }
      
      throw error
    }

    return data
  } catch (error) {
    logError('getUserSettings', error, { userId, retryCount })
    return null
  }
}

// Helper function to get user qada progress
export const getUserProgress = async (userId, retryCount = 0) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Check authentication first
    const session = await checkAuth()
    if (!session) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('qada_progress')
      .select('*')
      .eq('user_id', userId)
      .order('day_number', { ascending: true })

    if (error) {
      logError('getUserProgress', error, { userId, retryCount })
      
      // Retry logic for specific errors
      if ((error.code === '406' || error.status === 406) && retryCount < 2) {
        console.warn(`Retrying getUserProgress (attempt ${retryCount + 1})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return getUserProgress(userId, retryCount + 1)
      }
      
      throw error
    }

    return data || []
  } catch (error) {
    logError('getUserProgress', error, { userId, retryCount })
    return []
  }
}

// Helper function to upsert qada settings
export const upsertQadaSettings = async (userId, settings, retryCount = 0) => {
  try {
    if (!userId || !settings) {
      throw new Error('Invalid parameters for upsertQadaSettings')
    }

    // Check authentication first
    const session = await checkAuth()
    if (!session) {
      throw new Error('User not authenticated')
    }

    const settingsData = {
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('qada_settings')
      .upsert(settingsData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      logError('upsertQadaSettings', error, { userId, settings, retryCount })
      
      // Retry logic for specific errors
      if ((error.code === '406' || error.status === 406) && retryCount < 2) {
        console.warn(`Retrying upsertQadaSettings (attempt ${retryCount + 1})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return upsertQadaSettings(userId, settings, retryCount + 1)
      }
      
      throw error
    }

    return data
  } catch (error) {
    logError('upsertQadaSettings', error, { userId, settings, retryCount })
    return null
  }
}

// Helper function to upsert qada progress for a specific day
export const upsertQadaProgress = async (userId, dayNumber, progressData, retryCount = 0) => {
  try {
    // Validate inputs
    const validUserId = validateUserId(userId)
    const validDayNumber = validateDayNumber(dayNumber)
    
    if (!progressData || typeof progressData !== 'object') {
      throw new Error('Invalid progress data')
    }

    // Rate limiting
    checkRateLimit('upsertProgress', validUserId, 120) // 120 updates per minute max

    // Check authentication first
    const session = await checkAuth()
    if (!session) {
      throw new Error('User not authenticated')
    }

    const progressRecord = {
      user_id: validUserId,
      day_number: validDayNumber,
      ...progressData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('qada_progress')
      .upsert(progressRecord, {
        onConflict: 'user_id,day_number',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      logError('upsertQadaProgress', error, { userId, dayNumber, progressData, retryCount })
      
      // Retry logic for specific errors
      if ((error.code === '406' || error.status === 406) && retryCount < 2) {
        console.warn(`Retrying upsertQadaProgress (attempt ${retryCount + 1})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return upsertQadaProgress(userId, dayNumber, progressData, retryCount + 1)
      }
      
      throw error
    }

    return data
  } catch (error) {
    logError('upsertQadaProgress', error, { userId, dayNumber, progressData, retryCount })
    return null
  }
}

// Helper function to get qada statistics for a user
export const getQadaStats = async (userId, retryCount = 0) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Check authentication first
    const session = await checkAuth()
    if (!session) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .from('user_qada_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      logError('getQadaStats', error, { userId, retryCount })
      
      // Retry logic for specific errors
      if ((error.code === '406' || error.status === 406) && retryCount < 2) {
        console.warn(`Retrying getQadaStats (attempt ${retryCount + 1})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return getQadaStats(userId, retryCount + 1)
      }
      
      throw error
    }

    return data
  } catch (error) {
    logError('getQadaStats', error, { userId, retryCount })
    return null
  }
}

// Helper function to validate user authentication with better error handling
export const validateUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      // Handle the case where there's no session (logged out users)
      if (error.message?.includes('Auth session missing') || 
          error.message?.includes('session_missing') ||
          error.message?.includes('No session found')) {
        return null
      }
      logError('validateUser', error)
      throw error
    }
    
    return user
  } catch (error) {
    // Handle AuthSessionMissingError gracefully for logged out users
    if (error.message?.includes('Auth session missing') || 
        error.message?.includes('session_missing') ||
        error.message?.includes('No session found')) {
      return null
    }
    logError('validateUser', error)
    return null
  }
}

// Helper function for secure sign out - simplified based on Supabase docs
export const secureSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      logError('secureSignOut', error)
      throw error
    }
    
    return true
  } catch (error) {
    logError('secureSignOut', error)
    throw error // Re-throw the error instead of returning false
  }
}

// Debug function to test database connection
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('qada_settings')
      .select('count(*)', { count: 'exact', head: true })
    
    if (error) {
      logError('testDatabaseConnection', error)
      return { success: false, error }
    }
    
    console.log('Database connection successful')
    return { success: true, data }
  } catch (error) {
    logError('testDatabaseConnection', error)
    return { success: false, error }
  }
} 