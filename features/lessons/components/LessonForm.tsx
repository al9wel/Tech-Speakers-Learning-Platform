'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lessonFormSchema, type LessonFormValues } from '../schemas/lesson.schema'
import { createLessonAction, updateLessonAction } from '../server/actions'
import type { LessonItem, LessonSectionItem } from '../types'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen,
  ArrowRight,
  Plus,
  Trash2,
  UploadCloud,
  FileText,
  ImageIcon,
  Loader2,
  ChevronDown,
  Layers,
  FileCheck,
  Video,
} from 'lucide-react'
import { toast } from 'sonner'

const BUCKET_NAME = 'lesson-media'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

interface SubjectOption {
  id: string
  name: string
}

interface LessonFormProps {
  subjects: SubjectOption[]
  initialLesson?: LessonItem & { sections?: LessonSectionItem[] }
  currentUserId: string
}

interface SectionMediaState {
  previewUrl?: string | null
  previewVideoUrl?: string | null
  fileName?: string | null
  fileSize?: string | null
  isUploading?: boolean
}

export function LessonForm({ subjects, initialLesson, currentUserId }: LessonFormProps) {
  const router = useRouter()
  const isEdit = Boolean(initialLesson)
  const [formError, setFormError] = useState<string | null>(null)
  const [globalUploading, setGlobalUploading] = useState(false)

  // Track local preview/upload states per section index
  const [mediaStates, setMediaStates] = useState<Record<number, SectionMediaState>>(() => {
    const initialStates: Record<number, SectionMediaState> = {}
    if (initialLesson?.sections) {
      initialLesson.sections.forEach((sec, idx) => {
        initialStates[idx] = {
          previewUrl: sec.imageUrl || null,
          previewVideoUrl: sec.videoUrl || null,
          fileName: sec.video_path
            ? 'مقطع فيديو مرفق حالياً'
            : sec.pdf_path
            ? 'ملف PDF المرفق حالياً'
            : null,
          isUploading: false,
        }
      })
    }
    return initialStates
  })

  const lessonId = initialLesson?.id || crypto.randomUUID()

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      id: initialLesson?.id,
      subject_id: initialLesson?.subject_id || (subjects[0]?.id ?? ''),
      title: initialLesson?.title || '',
      explanation: initialLesson?.explanation || '',
      sort_order: initialLesson?.sort_order ?? 0,
      sections: initialLesson?.sections?.map((s, idx) => ({
        id: s.id,
        title: s.title,
        content: s.content,
        image_path: s.image_path,
        pdf_path: s.pdf_path,
        video_path: s.video_path,
        sort_order: s.sort_order ?? idx + 1,
      })) || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  })

  const watchedSections = watch('sections')

  // Handle direct file upload for a specific section
  const handleFileUpload = async (
    index: number,
    file: File,
    type: 'image' | 'pdf' | 'video'
  ) => {
    const supabase = createClient()
    const sectionId = watchedSections[index]?.id || crypto.randomUUID()

    if (type === 'image') {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error('نوع الصورة غير مدعوم (JPG, PNG, WebP)')
        return
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error('حجم الصورة يجب ألا يتجاوز 5 ميجابايت')
        return
      }
    } else if (type === 'pdf') {
      if (file.type !== 'application/pdf') {
        toast.error('يرجى اختيار ملف PDF صالح')
        return
      }
      if (file.size > MAX_PDF_SIZE) {
        toast.error('حجم ملف PDF يجب ألا يتجاوز 10 ميجابايت')
        return
      }
    } else if (type === 'video') {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        toast.error('صيغة الفيديو غير مدعومة (MP4, WebM, QuickTime)')
        return
      }
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error('حجم الفيديو يجب ألا يتجاوز 20 ميجابايت')
        return
      }
    }

    setMediaStates((prev) => ({
      ...prev,
      [index]: { ...prev[index], isUploading: true },
    }))
    setGlobalUploading(true)

    try {
      const ext =
        type === 'image'
          ? file.name.split('.').pop() || 'png'
          : type === 'pdf'
          ? 'pdf'
          : file.name.split('.').pop() || 'mp4'
      const storagePath = `${currentUserId}/lessons/${lessonId}/sections/${sectionId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        toast.error('تعذر رفع الملف إلى التخزين السحابي. يرجى المحاولة ثانية.')
        setMediaStates((prev) => ({
          ...prev,
          [index]: { ...prev[index], isUploading: false },
        }))
        return
      }

      if (type === 'image') {
        setValue(`sections.${index}.image_path`, storagePath)
        setValue(`sections.${index}.pdf_path`, null)
        setValue(`sections.${index}.video_path`, null)
        const objectUrl = URL.createObjectURL(file)
        setMediaStates((prev) => ({
          ...prev,
          [index]: {
            previewUrl: objectUrl,
            previewVideoUrl: null,
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            isUploading: false,
          },
        }))
      } else if (type === 'pdf') {
        setValue(`sections.${index}.pdf_path`, storagePath)
        setValue(`sections.${index}.image_path`, null)
        setValue(`sections.${index}.video_path`, null)
        setMediaStates((prev) => ({
          ...prev,
          [index]: {
            previewUrl: null,
            previewVideoUrl: null,
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            isUploading: false,
          },
        }))
      } else if (type === 'video') {
        setValue(`sections.${index}.video_path`, storagePath)
        setValue(`sections.${index}.image_path`, null)
        setValue(`sections.${index}.pdf_path`, null)
        const objectUrl = URL.createObjectURL(file)
        setMediaStates((prev) => ({
          ...prev,
          [index]: {
            previewUrl: null,
            previewVideoUrl: objectUrl,
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            isUploading: false,
          },
        }))
      }

      toast.success(
        type === 'image'
          ? 'تم رفع الصورة بنجاح'
          : type === 'pdf'
          ? 'تم رفع ملف PDF بنجاح'
          : 'تم رفع مقطع الفيديو بنجاح'
      )
    } catch {
      toast.error('حدث خطأ أثناء رفع الملف')
    } finally {
      setMediaStates((prev) => ({
        ...prev,
        [index]: { ...prev[index], isUploading: false },
      }))
      setGlobalUploading(false)
    }
  }

  const handleClearMedia = (index: number) => {
    setValue(`sections.${index}.image_path`, null)
    setValue(`sections.${index}.pdf_path`, null)
    setValue(`sections.${index}.video_path`, null)
    setMediaStates((prev) => ({
      ...prev,
      [index]: {
        previewUrl: null,
        previewVideoUrl: null,
        fileName: null,
        fileSize: null,
        isUploading: false,
      },
    }))
  }

  const onSubmit = async (data: LessonFormValues) => {
    setFormError(null)

    if (globalUploading) {
      toast.error('يرجى الانتظار حتى اكتمال رفع الملفات')
      return
    }

    try {
      if (isEdit && initialLesson) {
        const res = await updateLessonAction({
          id: initialLesson.id,
          subject_id: data.subject_id,
          title: data.title,
          explanation: data.explanation,
          sort_order: data.sort_order,
          sections: data.sections.map((s, idx) => ({
            id: s.id,
            title: s.title,
            content: s.content,
            image_path: s.image_path || null,
            pdf_path: s.pdf_path || null,
            video_path: s.video_path || null,
            sort_order: s.sort_order || idx + 1,
          })),
        })

        if (!res.success) {
          setFormError(res.message)
          toast.error(res.message)
        } else {
          toast.success(res.message)
          router.push('/teacher/lessons')
          router.refresh()
        }
      } else {
        const res = await createLessonAction({
          id: lessonId,
          subject_id: data.subject_id,
          title: data.title,
          explanation: data.explanation,
          sort_order: data.sort_order,
          sections: data.sections.map((s, idx) => ({
            id: s.id || crypto.randomUUID(),
            title: s.title,
            content: s.content,
            image_path: s.image_path || null,
            pdf_path: s.pdf_path || null,
            video_path: s.video_path || null,
            sort_order: s.sort_order || idx + 1,
          })),
        })

        if (!res.success) {
          setFormError(res.message)
          toast.error(res.message)
        } else {
          toast.success(res.message)
          router.push('/teacher/lessons')
          router.refresh()
        }
      }
    } catch {
      const msg = 'حدث خطأ غير متوقع أثناء حفظ الدرس'
      setFormError(msg)
      toast.error(msg)
    }
  }

  const isPending = isSubmitting || globalUploading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border-base">
        <div>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-ink-primary">
            {isEdit ? 'تعديل الدرس والأقسام' : 'إنشاء درس تعليمي جديد'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            اختر المادة الدراسية، واكتب الشرح التمهيدي، ثم أضف الأقسام مع الصور أو ملفات PDF
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <Link
            href="/teacher/lessons"
            className="px-3.5 py-1.5 rounded-md border border-border-base bg-bg-surface hover:bg-bg-alt text-xs sm:text-sm font-medium text-ink-secondary transition-colors"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-medium shadow-xs min-w-32 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{globalUploading ? 'جاري رفع الملفات...' : 'جاري الحفظ...'}</span>
              </>
            ) : (
              <span>{isEdit ? 'حفظ التعديلات' : 'نشر الدرس'}</span>
            )}
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
          {formError}
        </div>
      )}

      {/* Main Lesson Info Card */}
      <div className="bg-bg-surface border border-border-base rounded-lg p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="font-serif font-bold text-base text-ink-primary flex items-center gap-2 pb-2 border-b border-border-subtle">
          <BookOpen className="w-4.5 h-4.5 text-accent" />
          <span>المعلومات الأساسية للدرس</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject Selector */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink-primary mb-1.5">
              المادة الدراسية: <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register('subject_id')}
                disabled={isPending}
                className="w-full px-3 py-2 appearance-none rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors pr-3 pl-8"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-ink-muted/70 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.subject_id && (
              <p className="text-red-600 text-xs mt-1">{errors.subject_id.message}</p>
            )}
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1.5">
              ترتيب الدرس:
            </label>
            <input
              type="number"
              min="0"
              {...register('sort_order', { valueAsNumber: true })}
              disabled={isPending}
              className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="0"
            />
            {errors.sort_order && (
              <p className="text-red-600 text-xs mt-1">{errors.sort_order.message}</p>
            )}
          </div>
        </div>

        {/* Lesson Title */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1.5">
            عنوان الدرس: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="مثال: خصائص الجمع والضرب في الأعداد الطبيعية"
            {...register('title')}
            disabled={isPending}
            className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
          {errors.title && (
            <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Lesson Explanation / Intro */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1.5">
            الشرح التمهيدي للدرس: <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="اكتب مقدمة شاملة أو تلخيصاً لما سيتعلمه الطالب في هذا الدرس..."
            {...register('explanation')}
            disabled={isPending}
            className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-y leading-relaxed transition-colors"
          />
          {errors.explanation && (
            <p className="text-red-600 text-xs mt-1">{errors.explanation.message}</p>
          )}
        </div>
      </div>

      {/* Dynamic Sections Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-accent" />
            <h2 className="font-serif font-bold text-base sm:text-lg text-ink-primary">
              أقسام الدرس التفاعلية ({fields.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              append({
                id: crypto.randomUUID(),
                title: '',
                content: '',
                image_path: null,
                pdf_path: null,
                sort_order: fields.length + 1,
              })
            }
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-base bg-bg-surface hover:bg-bg-alt text-xs font-medium text-ink-secondary transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span>إضافة قسم جديد</span>
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="border border-dashed border-border-base rounded-lg p-8 sm:p-10 text-center bg-bg-surface space-y-2">
            <div className="w-10 h-10 rounded-md bg-bg-alt text-ink-muted flex items-center justify-center mx-auto mb-2 border border-border-subtle">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-ink-primary">
              لم تتم إضافة أي أقسام فرعية (اختياري)
            </h3>
            <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
              يمكنك الاكتفاء بعنوان الدرس وشرحه التمهيدي فقط، أو الضغط أدناه لإضافة أقسام فرعية تفاعلية تضم شروحات إضافية وصور وملفات PDF.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  append({
                    id: crypto.randomUUID(),
                    title: '',
                    content: '',
                    image_path: null,
                    pdf_path: null,
                    video_path: null,
                    sort_order: 1,
                  })
                }
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة قسم فرعي للدرس</span>
              </button>
            </div>
          </div>
        ) : (
          fields.map((field, index) => {
            const sectionState = mediaStates[index] || {}
            const currentImagePath = watchedSections[index]?.image_path
            const currentPdfPath = watchedSections[index]?.pdf_path
            const currentVideoPath = watchedSections[index]?.video_path
            const hasImage = Boolean(currentImagePath || sectionState.previewUrl)
            const hasPdf = Boolean(currentPdfPath)
            const hasVideo = Boolean(currentVideoPath || sectionState.previewVideoUrl)

            return (
              <div
                key={field.id}
                className="bg-bg-surface border border-border-base rounded-lg p-5 sm:p-6 shadow-xs relative space-y-4"
              >
                {/* Section Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-bg-alt text-ink-secondary text-xs font-bold flex items-center justify-center border border-border-subtle">
                      {index + 1}
                    </span>
                    <span className="font-serif font-bold text-sm text-ink-primary">
                      القسم رقم {index + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={isPending}
                    className="p-1 rounded-md text-red-600 hover:bg-red-50 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title="حذف هذا القسم"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف القسم</span>
                  </button>
                </div>

                {/* Section Title & Sort Order */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-ink-primary mb-1">
                      عنوان القسم: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: التعريف والخصائص الرياضية"
                      {...register(`sections.${index}.title`)}
                      disabled={isPending}
                      className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    />
                    {errors.sections?.[index]?.title && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.sections[index]?.title?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-primary mb-1">
                      ترتيب القسم:
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register(`sections.${index}.sort_order`, { valueAsNumber: true })}
                      disabled={isPending}
                      className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    />
                  </div>
                </div>

                {/* Section Content Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    محتوى القسم: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="اكتب المحتوى والشرح التفصيلي لهذا القسم..."
                    {...register(`sections.${index}.content`)}
                    disabled={isPending}
                    className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-y leading-relaxed transition-colors"
                  />
                  {errors.sections?.[index]?.content && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.sections[index]?.content?.message}
                    </p>
                  )}
                </div>

                {/* Section Media (Image, PDF, Video, or None) */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-ink-primary mb-2">
                    الملف المرفق بالقسم (صورة، مستند PDF، أو فيديو):
                  </label>

                  {sectionState.isUploading ? (
                    <div className="p-3 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center gap-2 text-accent text-xs font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري رفع الملف إلى التخزين السحابي...</span>
                    </div>
                  ) : hasVideo ? (
                    /* Video Attached Preview */
                    <div className="p-3 rounded-md bg-bg-alt/70 border border-border-subtle flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-black shrink-0 border border-border-base flex items-center justify-center">
                          {sectionState.previewVideoUrl ? (
                            <video
                              src={sectionState.previewVideoUrl}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Video className="w-5 h-5 text-amber" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-ink-primary">
                            {sectionState.fileName || 'مقطع فيديو مرفق'}
                          </p>
                          <p className="text-[11px] text-ink-muted">
                            {sectionState.fileSize || 'مخزن في السحابة'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClearMedia(index)}
                        disabled={isPending}
                        className="p-1 rounded-md text-ink-muted hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="إزالة الفيديو"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : hasImage ? (
                    /* Image Attached Preview */
                    <div className="p-3 rounded-md bg-bg-alt/70 border border-border-subtle flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-bg-surface shrink-0 border border-border-base flex items-center justify-center">
                          {sectionState.previewUrl ? (
                            <img
                              src={sectionState.previewUrl}
                              alt="معاينة"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-accent" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-ink-primary">
                            {sectionState.fileName || 'صورة توضيحية مرفقة'}
                          </p>
                          <p className="text-[11px] text-ink-muted">
                            {sectionState.fileSize || 'مخزنة في السحابة'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClearMedia(index)}
                        disabled={isPending}
                        className="p-1 rounded-md text-ink-muted hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="إزالة الصورة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : hasPdf ? (
                    /* PDF Attached Preview */
                    <div className="p-3 rounded-md bg-bg-alt/70 border border-border-subtle flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-red-100 text-red-700 shrink-0 flex items-center justify-center border border-red-200">
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-ink-primary">
                            {sectionState.fileName || 'ملف PDF المرفق'}
                          </p>
                          <p className="text-[11px] text-ink-muted">
                            {sectionState.fileSize || 'مستند متاح للطلاب'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClearMedia(index)}
                        disabled={isPending}
                        className="p-1 rounded-md text-ink-muted hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="إزالة ملف PDF"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* Upload Picker (Image, PDF, or Video) */
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Upload Image Option */}
                      <label className="border border-dashed border-border-base hover:border-accent rounded-md p-2.5 text-center cursor-pointer transition-colors bg-bg-alt/30 hover:bg-accent/5 flex items-center justify-center gap-2">
                        <ImageIcon className="w-4 h-4 text-accent shrink-0" />
                        <div className="text-right truncate">
                          <p className="text-xs font-medium text-ink-primary truncate">صورة توضيحية</p>
                          <p className="text-[10px] text-ink-muted">PNG, JPG (5MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          disabled={isPending}
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFileUpload(index, f, 'image')
                          }}
                        />
                      </label>

                      {/* Upload PDF Option */}
                      <label className="border border-dashed border-border-base hover:border-red-400 rounded-md p-2.5 text-center cursor-pointer transition-colors bg-bg-alt/30 hover:bg-red-50/40 flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4 text-red-600 shrink-0" />
                        <div className="text-right truncate">
                          <p className="text-xs font-medium text-ink-primary truncate">مستند PDF</p>
                          <p className="text-[10px] text-ink-muted">PDF فقط (10MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="application/pdf"
                          disabled={isPending}
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFileUpload(index, f, 'pdf')
                          }}
                        />
                      </label>

                      {/* Upload Video Option */}
                      <label className="border border-dashed border-border-base hover:border-accent rounded-md p-2.5 text-center cursor-pointer transition-colors bg-bg-alt/30 hover:bg-accent/5 flex items-center justify-center gap-2">
                        <Video className="w-4 h-4 text-accent shrink-0" />
                        <div className="text-right truncate">
                          <p className="text-xs font-medium text-ink-primary truncate">مقطع فيديو</p>
                          <p className="text-[10px] text-ink-muted">MP4, WebM (20MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime"
                          disabled={isPending}
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFileUpload(index, f, 'video')
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Add Another Section Button */}
        {fields.length > 0 && (
          <button
            type="button"
            onClick={() =>
              append({
                id: crypto.randomUUID(),
                title: '',
                content: '',
                image_path: null,
                pdf_path: null,
                video_path: null,
                sort_order: fields.length + 1,
              })
            }
            disabled={isPending}
            className="w-full py-2.5 border border-dashed border-border-base hover:border-accent rounded-md flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-ink-secondary hover:text-accent hover:bg-accent/5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة قسم جديد لهذا الدرس</span>
          </button>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-base">
        <Link
          href="/teacher/lessons"
          className="px-3.5 py-1.5 rounded-md border border-border-base bg-bg-surface hover:bg-bg-alt text-xs sm:text-sm font-medium text-ink-secondary transition-colors"
        >
          إلغاء
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-medium shadow-xs min-w-36 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <span>{isEdit ? 'حفظ كافة التعديلات' : 'نشر الدرس الآن'}</span>
          )}
        </button>
      </div>
    </form>
  )
}
