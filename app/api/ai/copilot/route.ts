import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePlatformCopilotAnswer } from '@/lib/ai/gemini'
import type { CopilotRequest, CopilotResponse } from '@/features/ai/types'

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'يرجى تسجيل الدخول لاستخدام المساعد الذكي.' },
        { status: 401 }
      )
    }

    // 2. Fetch user profile for role and name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .maybeSingle()

    // 3. Parse request
    const body: CopilotRequest = await req.json()
    const { messages, currentPath } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'المحادثة لا تحتوي على أية رسائل صالحة.' },
        { status: 400 }
      )
    }

    // 4. Generate Copilot Guidance Response
    const reply = await generatePlatformCopilotAnswer({
      userRole: profile?.role || 'student',
      userName: profile?.full_name || null,
      currentPath: currentPath || '/',
      messages,
    })

    const responseData: CopilotResponse = {
      success: true,
      reply,
    }

    return NextResponse.json(responseData)
  } catch (err: any) {
    console.error('AI Copilot Error:', err)
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'حدث خطأ أثناء معالجة طلب الموجه الذكي.',
      },
      { status: 500 }
    )
  }
}
