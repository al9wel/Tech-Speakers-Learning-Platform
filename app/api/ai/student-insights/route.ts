import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateStudentLearningInsights } from '@/lib/ai/gemini'
import type { StudentInsightsResponse } from '@/features/ai/types'

export async function GET() {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'يرجى تسجيل الدخول للوصول إلى التحليلات الذكية.' },
        { status: 401 }
      )
    }

    // 2. Fetch student profile and subjects concurrently in parallel
    const [{ data: profile }, { data: rawSubjects }] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('subjects')
        .select('name, lessons(count)'),
    ])

    const subjects = (rawSubjects || []).map((s: any) => ({
      name: s.name as string,
      lessonsCount: Array.isArray(s.lessons) ? (s.lessons[0] as any)?.count ?? 0 : 0,
    }))

    const totalLessons = subjects.reduce((acc, s) => acc + s.lessonsCount, 0)

    // 4. Generate AI Learning Insights
    const insights = await generateStudentLearningInsights({
      studentName: profile?.full_name || null,
      subjects,
      lessonsCount: totalLessons,
    })

    const response: StudentInsightsResponse = {
      success: true,
      insights,
    }

    return NextResponse.json(response)
  } catch (err: any) {
    console.error('Student AI Insights Error:', err)
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'حدث خطأ أثناء إعداد التوصيات الأكاديمية.',
      },
      { status: 500 }
    )
  }
}
