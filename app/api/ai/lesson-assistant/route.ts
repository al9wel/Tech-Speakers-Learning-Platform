import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  streamLessonChatAnswer,
  streamLessonSummary,
  generateLessonQuiz,
  type PdfAttachment,
} from '@/lib/ai/gemini'
import type { AiAssistantRequest, AiAssistantResponse } from '@/features/ai/types'

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
        { success: false, error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول أولاً.' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body: AiAssistantRequest = await req.json()
    const { mode, lessonTitle, subjectName, lessonIntro, sections, messages } = body

    if (!lessonTitle) {
      return NextResponse.json(
        { success: false, error: 'بيانات الدرس غير مكتملة (عنوان الدرس مطلوب)' },
        { status: 400 }
      )
    }

    // 3. Download attached PDF files if any (ignore images and videos)
    const pdfAttachments: PdfAttachment[] = []
    if (sections && sections.length > 0) {
      await Promise.all(
        sections.map(async (sec) => {
          if (!sec.pdf_path) return

          // Double check it's actually a PDF file
          const isPdf = sec.pdf_path.toLowerCase().endsWith('.pdf')
          if (!isPdf) return

          try {
            const { data: fileBlob, error: downloadError } = await supabase.storage
              .from('lesson-media')
              .download(sec.pdf_path)

            if (!downloadError && fileBlob) {
              const arrayBuffer = await fileBlob.arrayBuffer()
              const base64 = Buffer.from(arrayBuffer).toString('base64')
              const fileName = sec.pdf_path.split('/').pop() || `${sec.title || 'ملف'}.pdf`

              pdfAttachments.push({
                name: fileName,
                base64,
              })
            }
          } catch (err) {
            console.warn(`Could not load attached PDF ${sec.pdf_path}:`, err)
          }
        })
      )
    }

    // 4. Handle different modes
    if (mode === 'chat') {
      if (!messages || messages.length === 0) {
        return NextResponse.json(
          { success: false, error: 'لا توجد رسائل موجهة للمساعد' },
          { status: 400 }
        )
      }

      const stream = await streamLessonChatAnswer({
        lessonTitle,
        subjectName,
        lessonIntro,
        sections: sections || [],
        pdfAttachments,
        messages,
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        },
      })
    }

    if (mode === 'summary') {
      const stream = await streamLessonSummary({
        lessonTitle,
        subjectName,
        lessonIntro,
        sections: sections || [],
        pdfAttachments,
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        },
      })
    }

    if (mode === 'quiz') {
      const quiz = await generateLessonQuiz({
        lessonTitle,
        subjectName,
        lessonIntro,
        sections: sections || [],
        pdfAttachments,
      })

      const resData: AiAssistantResponse = {
        success: true,
        mode: 'quiz',
        quiz,
      }
      return NextResponse.json(resData)
    }

    return NextResponse.json(
      { success: false, error: 'وضع المساعد غير مدعوم' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('API Error in /api/ai/lesson-assistant:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'حدث خطأ أثناء معالجة طلب الذكاء الاصطناعي',
      },
      { status: 500 }
    )
  }
}
