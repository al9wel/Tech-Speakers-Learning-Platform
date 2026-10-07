'use client'

import { useState } from 'react'
import Image from 'next/image'
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-page">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ink-100">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">
            {isEdit ? 'تعديل الدرس والأقسام' : 'إنشاء درس تعليمي جديد'}
          </h1>
          <p className="text-sm text-ink-500">
            اختر المادة الدراسية، واكتب الشرح التمهيدي، ثم أضف الأقسام مع الصور أو ملفات PDF
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <Link
            href="/teacher/lessons"
            className="btn-outline text-sm"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary text-sm min-w-36 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{globalUploading ? 'جاري رفع الملفات...' : 'جاري الحفظ...'}</span>
              </>
            ) : (
              <span>{isEdit ? 'حفظ التعديلات' : 'نشر الدرس'}</span>
            )}
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {formError}
        </div>
      )}

      {/* Main Lesson Info Card */}
      <div className="card p-6 bg-white shadow-card border-ink-100 space-y-5">
        <h2 className="font-heading font-bold text-lg text-ink-900 flex items-center gap-2 pb-2 border-b border-ink-100">
          <BookOpen className="w-5 h-5 text-gold-dark" />
          <span>المعلومات الأساسية للدرس</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Subject Selector */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-ink-700 mb-1.5">
              المادة الدراسية: <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register('subject_id')}
                disabled={isPending}
                className="input-field text-sm appearance-none bg-cream/30 pr-4 pl-10"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.subject_id && (
              <p className="text-red-600 text-xs mt-1">{errors.subject_id.message}</p>
            )}
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">
              ترتيب الدرس:
            </label>
            <input
              type="number"
              min="0"
              {...register('sort_order', { valueAsNumber: true })}
              disabled={isPending}
              className="input-field text-sm bg-cream/30"
              placeholder="0"
            />
            {errors.sort_order && (
              <p className="text-red-600 text-xs mt-1">{errors.sort_order.message}</p>
            )}
          </div>
        </div>

        {/* Lesson Title */}
        <div>
          <label className="block text-xs font-bold text-ink-700 mb-1.5">
            عنوان الدرس: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="مثال: خصائص الجمع والضرب في الأعداد الطبيعية"
            {...register('title')}
            disabled={isPending}
            className="input-field text-sm"
          />
          {errors.title && (
            <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Lesson Explanation / Intro */}
        <div>
          <label className="block text-xs font-bold text-ink-700 mb-1.5">
            الشرح التمهيدي للدرس: <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="اكتب مقدمة شاملة أو تلخيصاً لما سيتعلمه الطالب في هذا الدرس..."
            {...register('explanation')}
            disabled={isPending}
            className="input-field text-sm resize-y leading-relaxed"
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
            <Layers className="w-5 h-5 text-gold-dark" />
            <h2 className="font-heading font-bold text-lg text-ink-900">
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
            className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5 hover:bg-gold/10 hover:border-gold"
          >
            <Plus className="w-4 h-4 text-gold-dark" />
            <span>إضافة قسم جديد</span>
          </button>
        </div>
        {fields.length === 0 ? (
          <div className="card p-8 bg-cream/20 border-dashed border-2 border-ink-200/80 text-center rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-ink-100/70 text-ink-500 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6 text-gold-dark" />
            </div>
            <h3 className="font-heading font-bold text-sm text-ink-800 mb-1">
              لم تتم إضافة أي أقسام فرعية (اختياري)
            </h3>
            <p className="text-xs text-ink-500 max-w-md mx-auto mb-4 leading-relaxed">
              يمكنك الاكتفاء بعنوان الدرس وشرحه التمهيدي فقط، أو الضغط أدناه لإضافة أقسام فرعية تفاعلية تضم شروحات إضافية وصور وملفات PDF.
            </p>
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
              className="btn-outline text-xs py-2 px-4 inline-flex items-center gap-2 hover:bg-gold/10 hover:border-gold cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gold-dark" />
              <span>إضافة قسم فرعي للدرس</span>
            </button>
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
              className="card p-6 bg-white shadow-card border-ink-100/90 relative space-y-4"
            >
              {/* Section Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-ink-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-ink-100 text-ink-800 text-xs font-heading font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="font-heading font-bold text-sm text-ink-800">
                    القسم رقم {index + 1}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition text-xs flex items-center gap-1 cursor-pointer"
                  title="حذف هذا القسم"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف القسم</span>
                </button>
              </div>

              {/* Section Title & Sort Order */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-ink-700 mb-1">
                    عنوان القسم: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: التعريف والخصائص الرياضية"
                    {...register(`sections.${index}.title`)}
                    disabled={isPending}
                    className="input-field text-sm"
                  />
                  {errors.sections?.[index]?.title && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.sections[index]?.title?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1">
                    ترتيب القسم:
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register(`sections.${index}.sort_order`, { valueAsNumber: true })}
                    disabled={isPending}
                    className="input-field text-sm bg-cream/30"
                  />
                </div>
              </div>

              {/* Section Content Textarea */}
              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1">
                  محتوى القسم: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="اكتب المحتوى والشرح التفصيلي لهذا القسم..."
                  {...register(`sections.${index}.content`)}
                  disabled={isPending}
                  className="input-field text-sm resize-y leading-relaxed"
                />
                {errors.sections?.[index]?.content && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.sections[index]?.content?.message}
                  </p>
                )}
              </div>

              {/* Section Media (Image, PDF, Video, or None) */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-ink-700 mb-2">
                  الملف المرفق بالقسم (صورة، مستند PDF، أو فيديو):
                </label>

                {sectionState.isUploading ? (
                  <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center gap-2 text-gold-dark text-xs font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري رفع الملف إلى التخزين السحابي...</span>
                  </div>
                ) : hasVideo ? (
                  /* Video Attached Preview */
                  <div className="p-3 rounded-2xl bg-cream/30 border border-ink-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-ink-950 shrink-0 border border-ink-100 flex items-center justify-center">
                        {sectionState.previewVideoUrl ? (
                          <video
                            src={sectionState.previewVideoUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Video className="w-6 h-6 text-gold" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink-900">
                          {sectionState.fileName || 'مقطع فيديو مرفق'}
                        </p>
                        <p className="text-[11px] text-ink-500">
                          {sectionState.fileSize || 'مخزن في السحابة'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClearMedia(index)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="إزالة الفيديو"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : hasImage ? (
                  /* Image Attached Preview */
                  <div className="p-3 rounded-2xl bg-cream/30 border border-ink-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-ink-100 shrink-0 border border-ink-100 flex items-center justify-center">
                        {sectionState.previewUrl ? (
                          <Image
                            src={sectionState.previewUrl}
                            alt="معاينة"
                            width={56}
                            height={56}
                            loading="lazy"
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gold-dark" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink-900">
                          {sectionState.fileName || 'صورة توضيحية مرفقة'}
                        </p>
                        <p className="text-[11px] text-ink-500">
                          {sectionState.fileSize || 'مخزنة في السحابة'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClearMedia(index)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="إزالة الصورة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : hasPdf ? (
                  /* PDF Attached Preview */
                  <div className="p-3 rounded-2xl bg-cream/30 border border-ink-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 shrink-0 flex items-center justify-center border border-red-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink-900">
                          {sectionState.fileName || 'ملف PDF المرفق'}
                        </p>
                        <p className="text-[11px] text-ink-500">
                          {sectionState.fileSize || 'مستند متاح للطلاب'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClearMedia(index)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="إزالة ملف PDF"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Upload Picker (Image, PDF, or Video) */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Upload Image Option */}
                    <label className="border border-dashed border-ink-200 hover:border-gold rounded-xl p-3 text-center cursor-pointer transition-colors bg-cream/15 hover:bg-cream/35 flex items-center justify-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gold-dark shrink-0" />
                      <div className="text-right truncate">
                        <p className="text-xs font-bold text-ink-800 truncate">صورة توضيحية</p>
                        <p className="text-[10px] text-ink-400">PNG, JPG (5MB)</p>
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
                    <label className="border border-dashed border-ink-200 hover:border-red-300 rounded-xl p-3 text-center cursor-pointer transition-colors bg-cream/15 hover:bg-red-50/30 flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4 text-red-600 shrink-0" />
                      <div className="text-right truncate">
                        <p className="text-xs font-bold text-ink-800 truncate">مستند PDF</p>
                        <p className="text-[10px] text-ink-400">PDF فقط (10MB)</p>
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
                    <label className="border border-dashed border-ink-200 hover:border-gold rounded-xl p-3 text-center cursor-pointer transition-colors bg-cream/15 hover:bg-gold/10 flex items-center justify-center gap-2">
                      <Video className="w-4 h-4 text-gold-dark shrink-0" />
                      <div className="text-right truncate">
                        <p className="text-xs font-bold text-ink-800 truncate">مقطع فيديو</p>
                        <p className="text-[10px] text-ink-400">MP4, WebM (20MB)</p>
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
        }))}

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
            className="w-full py-3.5 border-2 border-dashed border-ink-200 hover:border-gold rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-ink-700 hover:text-gold-dark hover:bg-gold/5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة قسم جديد لهذا الدرس</span>
          </button>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-ink-100">
        <Link href="/teacher/lessons" className="btn-outline text-sm">
          إلغاء
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary text-sm min-w-40 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
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
