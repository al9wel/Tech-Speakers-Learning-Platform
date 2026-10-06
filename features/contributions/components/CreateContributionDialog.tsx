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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-ink-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-ink-100 flex items-center justify-between bg-parchment/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ink-900 text-lg">مشاركة مساهمة جديدة</h3>
              <p className="text-xs text-ink-500 font-medium">شارك زملاءك ملخصاً، مشروعاً، أو حلاً متميزاً</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-ink-400 hover:text-ink-700 hover:bg-ink-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4.5 overflow-y-auto flex-1">
          {/* Subject selection */}
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">
              المادة الدراسية التابعة لها المساهمة <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register('subject_id')}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-ink-900 bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 appearance-none cursor-pointer transition-all ${
                  errors.subject_id ? 'border-red-400 bg-red-50/20' : 'border-ink-200 focus:border-gold'
                }`}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-400">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            {errors.subject_id && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.subject_id.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">
              عنوان المساهمة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: خريطة ذهنية لقوانين نيوتن في الحركة"
              {...register('title')}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all ${
                errors.title ? 'border-red-400 bg-red-50/20' : 'border-ink-200 focus:border-gold'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">
              شرح وتفاصيل المساهمة <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="اكتب شرحاً مفصلاً للمساهمة وأهم النقاط التي تغطيها..."
              {...register('content')}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none transition-all ${
                errors.content ? 'border-red-400 bg-red-50/20' : 'border-ink-200 focus:border-gold'
              }`}
            />
            {errors.content && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.content.message}</p>
            )}
          </div>

          {/* Media Attachment (Image, PDF, or Video) */}
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">
              إرفاق وسائط أو ملف (اختياري)
            </label>

            {previewImage || previewVideo || pdfFileName || videoFileName || watchedImagePath || watchedPdfPath || watchedVideoPath ? (
              <div className="p-3.5 rounded-xl border border-gold/30 bg-gold/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 truncate">
                  {previewImage || watchedImagePath ? (
                    <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center shrink-0 overflow-hidden">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="معاينة"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gold" />
                      )}
                    </div>
                  ) : previewVideo || watchedVideoPath ? (
                    <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 overflow-hidden">
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
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-bold text-ink-900 truncate">
                      {videoFileName
                        ? videoFileName
                        : pdfFileName
                        ? pdfFileName
                        : previewVideo || watchedVideoPath
                        ? 'مقطع فيديو مرفق'
                        : 'تم إرفاق صورة للمساهمة'}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium">تم تجهيز الملف للنشر</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeMedia}
                  className="p-1.5 text-ink-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                  title="إزالة المرفق"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {/* Upload Image button */}
                <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-ink-200 hover:border-gold bg-parchment/30 hover:bg-gold/5 cursor-pointer transition-all text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    disabled={uploadingMedia}
                    className="sr-only"
                  />
                  <div className="w-7 h-7 rounded-lg bg-white group-hover:bg-gold/15 text-ink-500 group-hover:text-gold flex items-center justify-center mb-1 shadow-2xs transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-ink-700 group-hover:text-gold truncate w-full">
                    صورة
                  </span>
                  <span className="text-[9px] text-ink-400 truncate w-full">حتى 5MB</span>
                </label>

                {/* Upload PDF button */}
                <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-ink-200 hover:border-gold bg-parchment/30 hover:bg-gold/5 cursor-pointer transition-all text-center group">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload(e, 'pdf')}
                    disabled={uploadingMedia}
                    className="sr-only"
                  />
                  <div className="w-7 h-7 rounded-lg bg-white group-hover:bg-gold/15 text-ink-500 group-hover:text-gold flex items-center justify-center mb-1 shadow-2xs transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-ink-700 group-hover:text-gold truncate w-full">
                    مستند PDF
                  </span>
                  <span className="text-[9px] text-ink-400 truncate w-full">حتى 10MB</span>
                </label>

                {/* Upload Video button */}
                <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-ink-200 hover:border-gold bg-parchment/30 hover:bg-gold/5 cursor-pointer transition-all text-center group">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    disabled={uploadingMedia}
                    className="sr-only"
                  />
                  <div className="w-7 h-7 rounded-lg bg-white group-hover:bg-gold/15 text-ink-500 group-hover:text-gold flex items-center justify-center mb-1 shadow-2xs transition-colors">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-ink-700 group-hover:text-gold truncate w-full">
                    مقطع فيديو
                  </span>
                  <span className="text-[9px] text-ink-400 truncate w-full">حتى 20MB</span>
                </label>
              </div>
            )}

            {uploadingMedia && (
              <div className="flex items-center gap-2 mt-2 text-xs text-gold font-bold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جارٍ رفع المرفق إلى السحابة...</span>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-ink-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || uploadingMedia}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-ink-600 hover:bg-ink-100 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingMedia}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gold hover:bg-gold-600 text-white shadow-soft transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
