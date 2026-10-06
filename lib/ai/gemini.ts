import type { QuizQuestion } from '@/features/ai/types'

const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
]

export interface PdfAttachment {
  name: string
  base64: string
}

interface SectionItem {
  id?: string
  title: string
  content: string
  sort_order?: number
  pdf_path?: string | null
}

interface LessonContextParams {
  lessonTitle: string
  subjectName?: string
  lessonIntro?: string | null
  sections: SectionItem[]
  pdfAttachments?: PdfAttachment[]
}

// Global rotation index for round-robin key balancing
let keyRotationIndex = 0

/**
 * Parses all available Gemini API keys from environment variables.
 * Supports comma-separated keys, newlines, or multiple keys.
 */
function getGeminiApiKeys(): string[] {
  const raw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || ''
  const initialKeys = raw
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter(Boolean)

  const finalKeys: string[] = []
  for (const k of initialKeys) {
    const matches = k.match(/(AQ\.[A-Za-z0-9_-]+|AIzaSy[A-Za-z0-9_-]+)/g)
    if (matches && matches.length > 1) {
      finalKeys.push(...matches)
    } else {
      finalKeys.push(k)
    }
  }

  return finalKeys
}

function buildLessonContextText({
  lessonTitle,
  subjectName,
  lessonIntro,
  sections,
  pdfAttachments,
}: LessonContextParams): string {
  const parts: string[] = []

  parts.push(`=== بيانات الدرس الأساسية ===`)
  parts.push(`عنوان الدرس: ${lessonTitle}`)
  if (subjectName) {
    parts.push(`المادة الدراسية: ${subjectName}`)
  }

  if (lessonIntro?.trim()) {
    parts.push(`\n=== مقدمة وتمهيد الدرس ===\n${lessonIntro.trim()}`)
  }

  if (sections && sections.length > 0) {
    parts.push(`\n=== أقسام ومحتوى تفاصيل الدرس ===`)
    sections.forEach((sec, idx) => {
      const order = sec.sort_order ?? idx + 1
      parts.push(`\n[القسم ${order}: ${sec.title}]\n${sec.content?.trim() || '(لا يوجد نص تفصيلي)'}`)
    })
  }

  if (pdfAttachments && pdfAttachments.length > 0) {
    parts.push(`\n=== ملفات PDF التعليمية المرفقة مع الدرس ===`)
    pdfAttachments.forEach((pdf, idx) => {
      parts.push(`- ملف مرفق ${idx + 1}: ${pdf.name} (تم تضمين محتواه بالكامل أدناه كبيانات رقمية للدرس)`)
    })
  }

  return parts.join('\n')
}

type GeminiContentPart = { text?: string; inlineData?: { mimeType: string; data: string } }

async function callGemini(
  contents: Array<{ role?: string; parts: GeminiContentPart[] }>,
  systemInstruction?: string,
  forceJson: boolean = false
): Promise<string> {
  const keys = getGeminiApiKeys()
  if (keys.length === 0) {
    throw new Error('لم يتم العثور على مفتاح GEMINI_API_KEY في ملف .env.local')
  }

  let lastError: any = null

  // Try each key in the pool starting from the round-robin index
  const numKeys = keys.length
  const startIndex = keyRotationIndex % numKeys
  keyRotationIndex = (keyRotationIndex + 1) % numKeys

  for (let k = 0; k < numKeys; k++) {
    const keyIndex = (startIndex + k) % numKeys
    const apiKey = keys[keyIndex]

    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

        const payload: Record<string, any> = {
          contents,
        }

        if (systemInstruction) {
          payload.systemInstruction = {
            parts: [{ text: systemInstruction }],
          }
        }

        if (forceJson) {
          payload.generationConfig = {
            responseMimeType: 'application/json',
            temperature: 0.2,
          }
        } else {
          payload.generationConfig = {
            temperature: 0.4,
          }
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok) {
          lastError = data?.error?.message || `HTTP ${res.status}`
          // If quota or rate limit exceeded on this key, break to the next key immediately!
          if (res.status === 429 || lastError.includes('quota') || lastError.includes('rate')) {
            console.warn(`Key #${keyIndex + 1} reached limit, switching to next key...`)
            break
          }
          continue
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text && typeof text === 'string') {
          return text
        }
      } catch (err: any) {
        lastError = err?.message || 'خطأ غير معروف في الاتصال بـ Gemini'
      }
    }
  }

  throw new Error(`تعذر الحصول على استجابة من الذكاء الاصطناعي: ${lastError || 'الخدمة غير متوفرة حالياً'}`)
}

/**
 * Smart Lesson Tutor Chat
 * Strictly bounded to the lesson content and any attached PDF summaries.
 */
export async function generateLessonChatAnswer({
  lessonTitle,
  subjectName,
  lessonIntro,
  sections,
  pdfAttachments,
  messages,
}: LessonContextParams & {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}): Promise<string> {
  const lessonContext = buildLessonContextText({
    lessonTitle,
    subjectName,
    lessonIntro,
    sections,
    pdfAttachments,
  })

  const hasPdfs = pdfAttachments && pdfAttachments.length > 0

  const systemInstruction = `أنت "المعلم الذكي" الودود والمتخصص في منصة "Tech Speakers" التعليمية.
مهمتك السامية: مساعدة الطالب في فهم واستيعاب هذا الدرس التعليمي فقط:
عنوان الدرس: "${lessonTitle}" ${subjectName ? `(مادة ${subjectName})` : ''}.

القواعد الصارمة والواجب اتباعها حرفياً:
1. التزام تام بمحتوى الدرس والمرفقات: اعتمد بنسبة 100% على محتوى الدرس وسياقه الموضح في مرجع الدرس أدناه${hasPdfs ? ' بالإضافة إلى محتوى ملفات الـ PDF المرفقة مع الدرس' : ''}.
2. رفض الاستفسارات الخارجية بلباقة وتشجيع: إذا سألك الطالب عن أي موضوع عام أو مادة أخرى أو مسألة غير موجودة في هذا الدرس أو ملفات الـ PDF المرفقة معه، اعتذر له بلباقة وأسلوب تربوي مشجع، مثلاً: "عذراً يا بطل! أنا المعلم الذكي المخصص لدرس [${lessonTitle}] ومرفقاته فقط لمساعدتك على إتقانه والتفوق فيه. هل لديك أي سؤال حول أفكار ومفاهيم هذا الدرس؟".
3. أسلوب الشرح: استخدم أسلوباً تعليمياً مشوقاً وسهلاً باللغة العربية الفصحى المبسطة، ونظم الإجابة في نقاط واضحة أو فقرات قصيرة سهلة القراءة.
4. التبسيط والأمثلة: إذا طلب الطالب شرحاً مبسطاً أو أمثلة لمفهوم مذكور في الدرس أو الـ PDF، بسّطه له بذكاء مع ربطه دائماً بمحتوى الدرس.

--- مرجع محتوى الدرس المعتمد ---
${lessonContext}`

  // Format previous conversation messages
  const contents = messages.map((m, index) => {
    const parts: GeminiContentPart[] = [{ text: m.content }]

    // Attach PDFs to the very first user message to ground the model
    if (index === 0 && m.role === 'user' && hasPdfs) {
      pdfAttachments.forEach((pdf) => {
        parts.unshift({
          inlineData: {
            mimeType: 'application/pdf',
            data: pdf.base64,
          },
        })
      })
    }

    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts,
    }
  })

  // If there are PDFs and no previous messages had them
  if (hasPdfs && contents.length > 0 && !contents[0].parts.some((p) => p.inlineData)) {
    pdfAttachments.forEach((pdf) => {
      contents[0].parts.unshift({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdf.base64,
        },
      })
    })
  }

  return await callGemini(contents, systemInstruction)
}

/**
 * Smart Lesson Summary
 * Creates a structured revision summary of the lesson and attached PDFs.
 */
export async function generateLessonSummary(params: LessonContextParams): Promise<string> {
  const lessonContext = buildLessonContextText(params)
  const hasPdfs = params.pdfAttachments && params.pdfAttachments.length > 0

  const systemInstruction = `أنت خبير تلخيص المناهج والمحتوى التعليمي في منصة "Tech Speakers".
مهمتك: تقديم ملخص ذكي، جذاب، وشامل لدرس "${params.lessonTitle}" اعتماداً حصرياً على المحتوى المرفق${hasPdfs ? ' وملفات الـ PDF التعليمية المرفقة' : ''}.

الهيكل المطلوب للملخص:
1. 📌 **الفكرة الرئيسية للدرس**: فقرة قصيرة تلخص جوهر الدرس.
2. 💡 **أبرز المفاهيم والنقاط الجوهرية**: قائمة بنقاط واضحة ومحددة تشمل ما ورد في نص الدرس وملفات الـ PDF المرفقة.
3. ⚡ **خلاصة سريعة للاستذكار**: جملتان أو نصائح مركزة تساعد الطالب في المراجعة السريعة قبل الاختبار.

اكتب بلغة عربية فصيحة وأسلوب مشجع واستخدم التنسيق الجذاب بنقاط واضحة.`

  const parts: GeminiContentPart[] = [
    {
      text: `يرجى تلخيص محتوى هذا الدرس وملفاته المرفقة وفق الإرشادات:\n\n${lessonContext}`,
    },
  ]

  if (hasPdfs) {
    params.pdfAttachments!.forEach((pdf) => {
      parts.unshift({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdf.base64,
        },
      })
    })
  }

  const contents = [{ parts }]

  return await callGemini(contents, systemInstruction)
}

/**
 * Smart Interactive Quiz Generator
 * Generates 3-4 multiple choice questions directly from the lesson and attached PDFs.
 */
export async function generateLessonQuiz(params: LessonContextParams): Promise<QuizQuestion[]> {
  const lessonContext = buildLessonContextText(params)
  const hasPdfs = params.pdfAttachments && params.pdfAttachments.length > 0

  const systemInstruction = `أنت خبير تصميم الاختبارات والتقييمات التعليمية.
مهمتك: توليد اختبار تفاعلي قصير من 3 إلى 4 أسئلة اختيار من متعدد (Multiple Choice Questions) مستخلصة تماماً من محتوى درس "${params.lessonTitle}"${hasPdfs ? ' وملفات الـ PDF المرفقة معه' : ''}.

المتطلبات الدقيقة لكل سؤال:
- السؤال يجب أن يقيس فهماً حقيقياً لأحد مفاهيم الدرس أو الـ PDF المرفق.
- توفير 4 خيارات إجابة واضحة ومقنعة (نصوص فقط).
- تحديد رقم الإجابة الصحيحة (فهرس من 0 إلى 3).
- تقديم شرح تعليمي موجز ومقنع يبين سبب صحة هذه الإجابة تحديداً.

يجب أن يكون الإخراج مصفوفة JSON صالحة فقط بالتنسيق التالي:
[
  {
    "id": "q1",
    "question": "نص السؤال هنا؟",
    "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
    "correctAnswer": 0,
    "explanation": "شرح لسبب صحة الخيار..."
  }
]`

  const parts: GeminiContentPart[] = [
    {
      text: `قم بإنشاء اختبار تفاعلي من محتوى هذا الدرس والمرفقات:\n\n${lessonContext}`,
    },
  ]

  if (hasPdfs) {
    params.pdfAttachments!.forEach((pdf) => {
      parts.unshift({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdf.base64,
        },
      })
    })
  }

  const contents = [{ parts }]

  const rawJson = await callGemini(contents, systemInstruction, true)

  try {
    const cleaned = rawJson
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, index) => ({
        id: item.id || `q_${index + 1}`,
        question: item.question || `سؤال ${index + 1}`,
        options: Array.isArray(item.options) ? item.options : [],
        correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0,
        explanation: item.explanation || 'إجابة صحيحة وفق محتوى الدرس.',
      }))
    }
  } catch (err) {
    console.error('Failed to parse Quiz JSON from Gemini:', err, rawJson)
  }

  return [
    {
      id: 'q1',
      question: `ما الفكرة الأساسية التي يدور حولها درس "${params.lessonTitle}"؟`,
      options: [
        `المفاهيم الأساسية المشروحة في الدرس`,
        `موضوعات عامة غير مرتبطة بمحتوى الدرس`,
        `معلومات تاريخية غير مذكورة`,
        `لا شيء مما سبق`,
      ],
      correctAnswer: 0,
      explanation: `الدرس يركز بشكل أساسي على شرح المفاهيم الخاصة بـ "${params.lessonTitle}".`,
    },
  ]
}
