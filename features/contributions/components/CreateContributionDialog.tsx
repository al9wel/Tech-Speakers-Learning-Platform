'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  X,
  Upload,
  Image as ImageIcon,
  FileText,
  Video,
  Trash2,
  Loader2,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  contributionFormSchema,
  type ContributionFormValues,
} from '../schemas/contribution.schema'
import { createContributionAction } from '../server/actions'
import type { ContributionItem } from '../types'

const BUCKET_NAME = 'lesson-media'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

interface SubjectOption {
  id: string
  name: string
}

interface CreateContributionDialogProps {
  isOpen: boolean
  onClose: () => void
  subjects: SubjectOption[]
  currentUserId: string
  onContributionCreated: (newContribution: ContributionItem) => void
}

export function CreateContributionDialog({
  isOpen,
  onClose,
  subjects,
  currentUserId,
  onContributionCreated,
}: CreateContributionDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [pdfFileName, setPdfFileName] = useState<string | null>(null)
  const [videoFileName, setVideoFileName] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: {
      subject_id: subjects[0]?.id || '',
      title: '',
      content: '',
      image_path: null,
      pdf_path: null,
      video_path: null,
    },
  })

  const watchedImagePath = watch('image_path')
  const watchedPdfPath = watch('pdf_path')
  const watchedVideoPath = watch('video_path')

  if (!isOpen) return null

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'pdf' | 'video'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'image') {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error('صيغة الصورة غير مدعومة (يرجى رفع JPG أو PNG أو WebP)')
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
        toast.error('حجم الملف يجب ألا يتجاوز 10 ميجابايت')
        return
      }
    } else if (type === 'video') {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        toast.error('صيغة الفيديو غير مدعومة (يرجى رفع MP4 أو WebM أو QuickTime)')
        return
      }
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error('حجم الفيديو يجب ألا يتجاوز 20 ميجابايت')
        return
      }
    }

    setUploadingMedia(true)
    try {
      const supabase = createClient()
      const ext =
        type === 'image'
          ? file.name.split('.').pop() || 'png'
          : type === 'pdf'
          ? 'pdf'
          : file.name.split('.').pop() || 'mp4'
      const storagePath = `${currentUserId}/contributions/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error('تعذر رفع الملف، يرجى المحاولة ثانية')
        return
      }

      if (type === 'image') {
        setValue('image_path', storagePath)
        setValue('pdf_path', null)
        setValue('video_path', null)
        setPdfFileName(null)
        setVideoFileName(null)
        setPreviewVideo(null)
        setPreviewImage(URL.createObjectURL(file))
      } else if (type === 'pdf') {
        setValue('pdf_path', storagePath)
        setValue('image_path', null)
        setValue('video_path', null)
        setPreviewImage(null)
        setPreviewVideo(null)
        setVideoFileName(null)
        setPdfFileName(file.name)
      } else if (type === 'video') {
        setValue('video_path', storagePath)
        setValue('image_path', null)
        setValue('pdf_path', null)
        setPreviewImage(null)
        setPdfFileName(null)
        setVideoFileName(file.name)
        setPreviewVideo(URL.createObjectURL(file))
      }

      toast.success('تم رفع الملف بنجاح')
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ أثناء رفع الملف')
    } finally {
      setUploadingMedia(false)
      e.target.value = ''
    }
  }

  const removeMedia = () => {
    setValue('image_path', null)
    setValue('pdf_path', null)
    setValue('video_path', null)
    setPreviewImage(null)
    setPreviewVideo(null)
    setPdfFileName(null)
    setVideoFileName(null)
  }

  const onSubmit = async (values: ContributionFormValues) => {
    setSubmitting(true)
    try {
      const res = await createContributionAction(values)
      if (res.success && res.contribution) {
        toast.success(res.message || 'تم نشر المساهمة بنجاح')
        onContributionCreated(res.contribution)
        reset()
        removeMedia()
        onClose()
      } else {
        toast.error(res.message || 'تعذر نشر المساهمة')
      }
    } catch {
      toast.error('حدث خطأ أثناء نشر المساهمة')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-bg-surface rounded-lg max-w-lg w-full border border-border-base shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-border-base flex items-center justify-between bg-bg-alt/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-ink-primary text-lg">مشاركة مساهمة جديدة</h3>
              <p className="text-xs text-ink-muted">شارك زملاءك ملخصاً، مشروعاً، أو حلاً متميزاً</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink-primary hover:bg-bg-alt rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Subject selection */}
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1.5">
              المادة الدراسية التابعة لها المساهمة <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register('subject_id')}
                className={`w-full px-3 py-2 rounded-md border text-sm text-ink-primary bg-bg-surface focus:outline-none focus:border-accent appearance-none cursor-pointer transition-all ${
                  errors.subject_id ? 'border-error bg-error-bg/20' : 'border-border-base focus:border-accent'
                }`}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            {errors.subject_id && (
              <p className="text-xs text-error mt-1">{errors.subject_id.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1.5">
              عنوان المساهمة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: خريطة ذهنية لقوانين نيوتن في الحركة"
              {...register('title')}
              className={`w-full px-3 py-2 rounded-md border text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent transition-all ${
                errors.title ? 'border-error bg-error-bg/20' : 'border-border-base focus:border-accent'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-error mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1.5">
              شرح وتفاصيل المساهمة <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="اكتب شرحاً مفصلاً للمساهمة وأهم النقاط التي تغطيها..."
              {...register('content')}
              className={`w-full px-3 py-2.5 rounded-md border text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent resize-none transition-all ${
                errors.content ? 'border-error bg-error-bg/20' : 'border-border-base focus:border-accent'
              }`}
            />
            {errors.content && (
              <p className="text-xs text-error mt-1">{errors.content.message}</p>
            )}
          </div>

          {/* Media Attachment (Image, PDF, or Video) */}
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1.5">
              إرفاق وسائط أو ملف (اختياري)
            </label>

            {previewImage || previewVideo || pdfFileName || videoFileName || watchedImagePath || watchedPdfPath || watchedVideoPath ? (
              <div className="p-3.5 rounded-md border border-accent/25 bg-accent-bg/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 truncate">
                  {previewImage || watchedImagePath ? (
                    <div className="w-10 h-10 rounded-md bg-accent-bg flex items-center justify-center shrink-0 overflow-hidden border border-accent/20">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="معاينة"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-accent" />
                      )}
                    </div>
                  ) : previewVideo || watchedVideoPath ? (
                    <div className="w-10 h-10 rounded-md bg-accent-bg text-accent flex items-center justify-center shrink-0 overflow-hidden border border-accent/20">
                      {previewVideo ? (
                        <video
                          src={previewVideo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="w-5 h-5" />
                      )}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-error-bg text-error flex items-center justify-center shrink-0 border border-error/20">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-semibold text-ink-primary truncate">
                      {videoFileName
                        ? videoFileName
                        : pdfFileName
                        ? pdfFileName
                        : previewVideo || watchedVideoPath
                        ? 'مقطع فيديو مرفق'
                        : 'تم إرفاق صورة للمساهمة'}
                    </p>
                    <p className="text-[11px] text-success font-medium">تم تجهيز الملف للنشر</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeMedia}
                  className="p-1.5 text-ink-muted hover:text-error hover:bg-error-bg rounded-md transition-colors shrink-0 cursor-pointer"
                  title="إزالة المرفق"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {/* Upload Image button */}
                <label className="flex flex-col items-center justify-center p-3 rounded-md border border-dashed border-border-base hover:border-accent bg-bg-alt/50 hover:bg-accent-bg/40 cursor-pointer transition-all text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    disabled={uploadingMedia}
                    className="sr-only"
                  />
                  <div className="w-7 h-7 rounded-md bg-bg-surface group-hover:bg-accent group-hover:text-white text-ink-secondary flex items-center justify-center mb-1 shadow-2xs transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-ink-primary group-hover:text-accent truncate w-full">
                    صورة
                  </span>
                  <span className="text-[10px] text-ink-muted truncate w-full">حتى 5MB</span>
                </label>

                {/* Upload PDF button */}
                <label className="flex flex-col items-center justify-center p-3 rounded-md border border-dashed border-border-base hover:border-accent bg-bg-alt/50 hover:bg-accent-bg/40 cursor-pointer transition-all text-center group">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload(e, 'pdf')}
                    disabled={uploadingMedia}
                    className="sr-only"
                  />
                  <div className="w-7 h-7 rounded-md bg-bg-surface group-hover:bg-accent group-hover:text-white text-ink-secondary flex items-center justify-center mb-1 shadow-2xs transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-ink-primary group-hover:text-accent truncate w-full">
                    مستند PDF
                  </span>
                  <span className="text-[10px] text-ink-muted truncate w-full">حتى 10MB</span>
                </label>

                {/* Upload Video button */}
                <label className="flex flex-col items-center justify-center p-3 rounded-md border border-dashed border-border-base hover:border-accent bg-bg-alt/50 hover:bg-accent-bg/40 cursor-pointer transition-all text-center group">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    disabled={uploadingMedia}
                    className="sr-only"
                  />
                  <div className="w-7 h-7 rounded-md bg-bg-surface group-hover:bg-accent group-hover:text-white text-ink-secondary flex items-center justify-center mb-1 shadow-2xs transition-colors">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-ink-primary group-hover:text-accent truncate w-full">
                    مقطع فيديو
                  </span>
                  <span className="text-[10px] text-ink-muted truncate w-full">حتى 20MB</span>
                </label>
              </div>
            )}

            {uploadingMedia && (
              <div className="flex items-center gap-2 mt-2 text-xs text-accent font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جارٍ رفع المرفق إلى السحابة...</span>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border-base">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || uploadingMedia}
              className="btn-outline text-xs sm:text-sm py-2 px-3.5"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingMedia}
              className="btn-primary text-xs sm:text-sm py-2 px-4 shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ النشر...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>نشر المساهمة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
