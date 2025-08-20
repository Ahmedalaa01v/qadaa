import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  const next = url.searchParams.get('next') || '/reset-password'

  const redirectUrl = new URL(request.url)
  redirectUrl.pathname = next
  redirectUrl.search = ''

  if (token_hash && type) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If verification fails, still send user to reset page where the UI handles invalid state
  return NextResponse.redirect(redirectUrl)
}


