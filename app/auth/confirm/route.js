import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const rawType = requestUrl.searchParams.get('type') || ''
  const type = rawType.toLowerCase()
  const nextParamRaw = requestUrl.searchParams.get('next') || ''

  // Determine safe redirect target
  let redirectPathname = '/'
  const initialParams = new URLSearchParams()

  if (nextParamRaw) {
    try {
      const decoded = decodeURIComponent(nextParamRaw)
      if (decoded.startsWith('/')) {
        // Parse next to extract pathname and query separately
        const parsed = new URL(decoded, requestUrl.origin)
        redirectPathname = parsed.pathname
        parsed.searchParams.forEach((value, key) => initialParams.set(key, value))
      }
      // Ignore absolute URLs to avoid malformed paths like "/https:/..." and open redirects
    } catch {
      // Keep defaults if decode/parse fails
    }
  } else {
    // Fallbacks based on verification type
    switch (type) {
      case 'recovery':
        redirectPathname = '/reset-password'
        break
      case 'email_change':
        redirectPathname = '/'
        initialParams.set('email_change', '1')
        break
      default:
        // signup/email/invite/magiclink → home
        redirectPathname = '/'
        break
    }
  }

  const redirectUrl = new URL(request.url)
  redirectUrl.pathname = redirectPathname
  redirectUrl.search = initialParams.toString()

  // Map legacy/templated types to Supabase verifyOtp accepted values
  // Supabase accepts: 'signup' | 'invite' | 'recovery' | 'magiclink' | 'email_change'
  const verifyType = type === 'email' || type === '' ? 'signup' : type

  if (tokenHash && verifyType) {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { error } = await supabase.auth.verifyOtp({ type: verifyType, token_hash: tokenHash })

    if (!error) {
      redirectUrl.searchParams.set('verified', '1')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If verification fails, still send user to the computed destination where UI handles invalid state
  return NextResponse.redirect(redirectUrl)
}


