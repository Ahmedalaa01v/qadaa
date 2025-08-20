import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  const nextParamRaw = url.searchParams.get('next') || '/reset-password'
  let nextPath = '/reset-password'
  try {
    const decoded = decodeURIComponent(nextParamRaw)
    if (decoded.startsWith('/')) {
      nextPath = decoded
    }
    // Ignore absolute URLs to avoid malformed paths like "/https:/..." and open redirects
  } catch {
    // keep default
  }

  const redirectUrl = new URL(request.url)
  redirectUrl.pathname = nextPath
  redirectUrl.search = ''

  if (token_hash && type) {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      redirectUrl.searchParams.set('verified', '1')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If verification fails, still send user to reset page where the UI handles invalid state
  return NextResponse.redirect(redirectUrl)
}


