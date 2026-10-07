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

async function streamGemini(
  contents: Array<{ role?: string; parts: GeminiContentPart[] }>,
  systemInstruction?: string
): Promise<ReadableStream<Uint8Array>> {
  const keys = getGeminiApiKeys()
  if (keys.length === 0) {
    throw new Error('لم يتم العثور على مفتاح GEMINI_API_KEY في ملف .env.local')
  }

  let lastError: any = null
  const numKeys = keys.length
  const startIndex = keyRotationIndex % numKeys
  keyRotationIndex = (keyRotationIndex + 1) % numKeys

  for (let k = 0; k < numKeys; k++) {
    const keyIndex = (startIndex + k) % numKeys
    const apiKey = keys[keyIndex]

    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`

        const payload: Record<string, any> = {
          contents,
          generationConfig: {
            temperature: 0.4,
          },
        }

        if (systemInstruction) {
          payload.systemInstruction = {
            parts: [{ text: systemInstruction }],
          }
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => null)
          lastError = errData?.error?.message || `HTTP ${res.status}`
          if (res.status === 429 || lastError.includes('quota') || lastError.includes('rate')) {
            console.warn(`Key #${keyIndex + 1} reached limit, switching to next key...`)
            break
          }
          continue
        }

        if (!res.body) {
          continue
        }

        const textEncoder = new TextEncoder()
        const textDecoder = new TextDecoder()
        const reader = res.body.getReader()

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            let buffer = ''
            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += textDecoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                  const trimmed = line.trim()
                  if (!trimmed.startsWith('data:')) continue
                  const jsonStr = trimmed.slice(5).trim()
                  if (!jsonStr) continue
                  try {
                    const parsed = JSON.parse(jsonStr)
                    const textChunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
                    if (textChunk) {
                      controller.enqueue(textEncoder.encode(textChunk))
                    }
                  } catch {
                    // Ignore parse error on partial chunks
                  }
                }
              }

              if (buffer.trim().startsWith('data:')) {
                const jsonStr = buffer.trim().slice(5).trim()
                if (jsonStr) {
                  try {
                    const parsed = JSON.parse(jsonStr)
                    const textChunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
                    if (textChunk) {
                      controller.enqueue(textEncoder.encode(textChunk))
                    }
                  } catch {}
                }
              }

              controller.close()
            } catch (streamErr) {
              controller.error(streamErr)
            }
          },
        })

        return stream
      } catch (err: any) {
        lastError = err?.message || 'خطأ غير معروف في الاتصال بـ Gemini'
      }
    }
  }

  throw new Error(`تعذر الحصول على استجابة من الذكاء الاصطناعي: ${lastError || 'الخدمة غير متوفرة حالياً'}`)
}

function buildLessonChatPayload({
  lessonTitle,
  subjectName,
  lessonIntro,
  sections,
  pdfAttachments,
  messages,
}: LessonContextParams & {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}) {
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

  const contents = messages.map((m, index) => {
    const parts: GeminiContentPart[] = [{ text: m.content }]

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

  return { contents, systemInstruction }
}

/**
 * Smart Lesson Tutor Chat
 * Strictly bounded to the lesson content and any attached PDF summaries.
 */
export async function generateLessonChatAnswer(
  params: LessonContextParams & {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  }
): Promise<string> {
  const { contents, systemInstruction } = buildLessonChatPayload(params)
  return await callGemini(contents, systemInstruction)
}

/**
 * Streaming Smart Lesson Tutor Chat
 */
export async function streamLessonChatAnswer(
  params: LessonContextParams & {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  }
): Promise<ReadableStream<Uint8Array>> {
  const { contents, systemInstruction } = buildLessonChatPayload(params)
  return await streamGemini(contents, systemInstruction)
}

function buildLessonSummaryPayload(params: LessonContextParams) {
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
  return { contents, systemInstruction }
}

/**
 * Smart Lesson Summary
 * Creates a structured revision summary of the lesson and attached PDFs.
 */
export async function generateLessonSummary(params: LessonContextParams): Promise<string> {
  const { contents, systemInstruction } = buildLessonSummaryPayload(params)
  return await callGemini(contents, systemInstruction)
}

/**
 * Streaming Smart Lesson Summary
 */
export async function streamLessonSummary(params: LessonContextParams): Promise<ReadableStream<Uint8Array>> {
  const { contents, systemInstruction } = buildLessonSummaryPayload(params)
  return await streamGemini(contents, systemInstruction)
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

/**
 * Universal Platform AI Copilot
 * Guides all user roles across the platform with direct action links.
 */
function buildPlatformCopilotPayload({
  userRole,
  userName,
  currentPath,
  messages,
}: {
  userRole?: string | null
  userName?: string | null
  currentPath?: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}) {
  const roleNameMap: Record<string, string> = {
    student: 'طالب',
    teacher: 'معلم',
    admin: 'مدير النظام (مشرف عام)',
    supervisor: 'مشرف تربوي',
    counselor: 'مستشار نفسي وتربوي',
  }

  const roleTitle = roleNameMap[userRole || ''] || 'مستخدم'

  const systemInstruction = `أنت "الموجّه الذكي العام (AI Copilot)" لمنصة "Tech Speakers" التعليمية.
أنت تخاطب الآن: ${userName ? `${userName}` : 'أحد منسوبي المنصة'}، بصفته: "${roleTitle}".
الصفحة الحالية التي يتواجد فيها: ${currentPath || 'المنصة'}.

مهمتك:
مساعدة وتوجيه المستخدم خطوة بخطوة لكيفية استخدام أي شاشة أو ميزة في المنصة وفق دوره وصلاحياته، والإجابة عن أي استفسار حول كيفية إنجاز المهام.

--- دليل وخريطة أقسام المنصة وفق الصلاحيات والأدوار ---
1. حساب الطالب (student):
- لوحة تحكم الطالب (/student): الاطلاع على إحصائيات المواد وخطة المذاكرة الذكية.
- المواد والدروس (/student/subjects): تصفح المناهج، قراءة شروحات الدروس، المعلم الذكي، التلخيص الآلي، الكويزات التفاعلية، ومعاينة مرفقات الـ PDF.
- المستشار النفسي والتربوي (/student/counseling): إرسال استشارات خاصة ومغلقة بسرية تامة وتلقي توجيهات الدعم النفسي والتربوي.
- مساهمات الطلاب (/student/contributions): مشاركة ونشر إبداعات وملخصات ومشاريع الطالب مع زملائه والتفاعل معها.
- الأخبار والمقالات (/student/articles): متابعة القرارات الرسمية والمقالات الإثرائية والتوجيهات.
- صندوق المقترحات (/student/suggestions): إرسال مقترحات لتطوير المنصة والمتابعة حتى تنفيذها.
- الملف الشخصي (/student/profile): تحديث البيانات وتغيير كلمة المرور.

2. حساب المعلم (teacher):
- لوحة تحكم المعلم (/teacher): استعراض إحصائيات الدروس المنشورة وروابط الوصول السريع.
- قائمة دروسي (/teacher/lessons): استعراض وإدارة كافة الدروس التي أنشأها المعلم.
- إنشاء درس جديد (/teacher/lessons/new): صياغة العنوان، التمهيد، إضافة أقسام وشروحات، إرفاق مقاطع فيديو أو ملفات ملخصات PDF.
- استفسارات الطلاب (/teacher/questions): الإجابة عن أسئلة ومناقشات الطلاب المرتبطة بدروس المعلم.
- المقالات والأخبار (/teacher/articles): كتابة ونشر مقالات ومذكرات إثرائية.
- الملف الشخصي (/teacher/profile).

3. حساب المشرف التربوي (supervisor):
- لوحة تحكم المشرف (/supervisor): متابعة المناهج والتدقيق الأكاديمي.
- إدارة وتدقيق الدروس (/supervisor/lessons): استعراض كافة دروس المنصة والبحث فيها ومراجعة محتواها مع إمكانية التعديل والحذف.
- صندوق مقترحات الطلاب (/supervisor/suggestions): استعراض أفكار ومقترحات الطلاب وتحديث حالات معالجتها.
- مساهمات الطلاب (/supervisor/contributions): متابعة إبداعات ومشاريع الطلاب.
- المركز الإعلامي والمقالات (/supervisor/articles): نشر وتعديل الأخبار الرسمية والتوجيهات المعتمدة.
- الملف الشخصي (/supervisor/profile).

4. حساب المستشار النفسي والتربوي (counselor):
- مركز الاستشارات (/counselor): استقبال رسائل واستشارات الطلاب، الرد التوجيهي والنفسي بسرية تامة، ومراسلة أي طالب بالبحث عن اسمه.
- قائمة الطلاب (/counselor/students): استعراض ومتابعة الطلاب.
- المقالات التوجيهية (/counselor/articles): نشر مقالات إرشادية حول الصحة النفسية وتنظيم الوقت.
- الملف الشخصي (/counselor/profile).

5. حساب مدير النظام / الأدمن (admin):
- لوحة تحكم الإدارة (/admin): إحصائيات شاملة لكافة مستخدمي المنصة ومؤشرات النشاط.
- إدارة المستخدمين (/admin/users): استعراض كافة الحسابات وتعديل أدوارهم وصلاحياتهم.
- إدارة الطلاب (/admin/students): إضافة وتعديل وحذف حسابات الطلاب.
- إدارة المعلمين (/admin/teachers): إدارة حسابات المعلمين وتعيينهم.
- إدارة المشرفين (/admin/supervisors): إدارة المشرفين التربويين.
- إدارة المستشارين (/admin/counselors): إدارة المستشارين النفسيين.
- الملف الشخصي (/admin/profile).

قواعد الإجابة:
1. كن ودوداً ومشجعاً وواضحاً جداً واستخدم نقاطاً مرتبة باللغة العربية الفصحى.
2. وجه المستخدم بدقة للخطوات المطلوبة بما يتوافق مع دوره الحالي (${roleTitle}).
3. إذا تضمنت إجابتك إرشاداً لصفحة معينة، أضف رابط توجيه سريع في نهاية الرد بهذا الشكل الصريح:
[LINK: عنوان الزر | /المسار]
مثال: [LINK: الانتقال لإضافة درس جديد | /teacher/lessons/new]
أو: [LINK: فتح صندوق المقترحات | /student/suggestions]`

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  return { contents, systemInstruction }
}

export async function generatePlatformCopilotAnswer(params: {
  userRole?: string | null
  userName?: string | null
  currentPath?: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}): Promise<string> {
  const { contents, systemInstruction } = buildPlatformCopilotPayload(params)
  return await callGemini(contents, systemInstruction)
}

export async function streamPlatformCopilotAnswer(params: {
  userRole?: string | null
  userName?: string | null
  currentPath?: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}): Promise<ReadableStream<Uint8Array>> {
  const { contents, systemInstruction } = buildPlatformCopilotPayload(params)
  return await streamGemini(contents, systemInstruction)
}

export interface StudentLearningInsightsData {
  focusRecommendation: {
    subject: string
    reason: string
  }
  studyStrategy: string
  dailyChallenge: string
}

/**
 * AI Student Learning Advisor & Study Insights
 */
export async function generateStudentLearningInsights({
  studentName,
  subjects,
  lessonsCount,
}: {
  studentName?: string | null
  subjects: Array<{ name: string; lessonsCount?: number }>
  lessonsCount?: number
}): Promise<StudentLearningInsightsData> {
  const subjectsListText =
    subjects.length > 0
      ? subjects.map((s) => `- مادة "${s.name}" (تحتوي على ${s.lessonsCount ?? 1} درس)`).join('\n')
      : 'مواد دراسية عامة'

  const systemInstruction = `أنت "المستشار الأكاديمي الذكي (AI Study Advisor)" في منصة "Tech Speakers".
مهمتك: تحليل المقررات المتاحة للطالب ${studentName ? `"${studentName}"` : 'المثابر'}، وتقديم خطة مراجعة وتوصيات ذكية ومحفزة.

المقررات المتاحة في المنصة:
${subjectsListText}
إجمالي الدروس المتاحة: ${lessonsCount ?? 4} درس.

المطلوب: توليد تحليل تعليمي مخصص بتنسيق JSON حصرياً يحتوي على:
1. focusRecommendation: كائن يحتوي على:
   - subject: اسم إحدى المواد المتاحة الموصى بالتركيز عليها اليوم/هذا الأسبوع.
   - reason: جملتان تشرحان بأسلوب تربوي مشوق سبب أهمية البدء بهذه المادة.
2. studyStrategy: فقرة من 2-3 جمل تتضمن نصيحة دراسية فعالة ومبتكرة لاستغلال أدوات المنصة الذكية (مثل: سؤال المعلم الذكي داخل الدرس، استخدام التلخيص الفوري، وحل الكويز التفاعلي).
3. dailyChallenge: تحدي يومي محفز ومحدد ينجزه الطالب اليوم (مثال: إتقان درس محدد وحل كويز تفاعلي بنتيجة كاملة).

أخرج JSON فقط بالتنسيق التالي:
{
  "focusRecommendation": {
    "subject": "اسم المادة",
    "reason": "سبب التوصية..."
  },
  "studyStrategy": "استراتيجية المذاكرة...",
  "dailyChallenge": "نص التحدي اليومي..."
}`

  const contents = [
    {
      parts: [
        {
          text: 'حلل المواد وقدم التوصيات والخطة الدراسية الذكية للطالب.',
        },
      ],
    },
  ]

  const rawJson = await callGemini(contents, systemInstruction, true)

  try {
    const cleaned = rawJson
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    const parsed = JSON.parse(cleaned)
    if (parsed.focusRecommendation && parsed.studyStrategy && parsed.dailyChallenge) {
      return parsed
    }
  } catch (e) {
    console.error('Failed to parse Student Insights JSON:', e, rawJson)
  }

  // Fallback insights
  const primarySubject = subjects[0]?.name || 'علوم الحاسوب والذكاء الاصطناعي'
  return {
    focusRecommendation: {
      subject: primarySubject,
      reason: `تعتبر مادة "${primarySubject}" ركيزة أساسية في المنهج، والبدء بفهم مفاهيمها التأسيسية يمنحك انطلاقة قوية واستيعاباً أفضل لكافة الدروس اللاحقة.`,
    },
    studyStrategy:
      'اقرأ مقدمة الدرس بتمعن، ثم استخدم ميزة "المعلم الذكي" لطرح أي سؤال غامض، واختتم مذاكرتك بالضغط على "كويز تفاعلي" لترسيخ المعلومات فورياً في ذاكرتك.',
    dailyChallenge:
      `إنهاء أحد موضوعات مادة "${primarySubject}" واختبار فهمك عبر كويز المعلم الذكي والحصول على علامة كاملة!`,
  }
}
