import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    return NextResponse.json({ hasSession: false }, { status: 401 })
  }

  return NextResponse.json({ hasSession: true }, { status: 200 })
}


