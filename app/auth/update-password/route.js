import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { password } = await request.json()

  if (!password || typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ error: 'invalid_password' }, { status: 400 })
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}


