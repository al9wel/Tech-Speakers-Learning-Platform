'use client'

import { useState, useEffect } from 'react'
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
  Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  articleFormSchema,
  type ArticleFormValues,
} from '../schemas/article.schema'
import { createArticleAction, updateArticleAction } from '../server/actions'
import type { ArticleItem, ArticleCategory } from '../types'

const BUCKET_NAME = 'lesson-media'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

const CATEGORIES: ArticleCategory[] = ['خبر', 'مقال', 'إعلان', 'توجيه تربوي']

interface ArticleDialogProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: string
  initialArticle?: ArticleItem | null
  onArticleSaved: (article: ArticleItem) => void
}

export function ArticleDialog({
  isOpen,
  onClose,
  currentUserId,
  initialArticle,
  onArticleSaved,
}: ArticleDialogProps) {
  const isEdit = Boolean(initialArticle)
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
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: initialArticle?.title || '',
      content: initialArticle?.content || '',
      category: initialArticle?.category || 'خبر',
      image_path: initialArticle?.image_path || null,
      pdf_path: initialArticle?.pdf_path || null,
      video_path: initialArticle?.video_path || null,
    },
  })

  useEffect(() => {
    if (initialArticle) {
      reset({
        title: initialArticle.title,
        content: initialArticle.content,
        category: initialArticle.category || 'خبر',
        image_path: initialArticle.image_path || null,
        pdf_path: initialArticle.pdf_path || null,
        video_path: initialArticle.video_path || null,
      })
      setPreviewImage(initialArticle.imageUrl || null)
      setPreviewVideo(initialArticle.videoUrl || null)
      setPdfFileName(initialArticle.pdf_path ? 'ملف PDF المرفق حالياً' : null)
      setVideoFileName(initialArticle.video_path ? 'مقطع الفيديو المرفق حالياً' : null)
    } else {
      reset({
        title: '',
        content: '',
        category: 'خبر',
        image_path: null,
        pdf_path: null,
        video_path: null,
      })
      setPreviewImage(null)
      setPreviewVideo(null)
      setPdfFileName(null)
      setVideoFileName(null)
    }
  }, [initialArticle, reset])

  const watchedImagePath = watch('image_path')
  const watchedPdfPath = watch('pdf_path')
  const watchedVideoPath = watch('video_path')
  const watchedCategory = watch('category')

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
      const storagePath = `${currentUserId}/articles/${Date.now()}.${ext}`

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

  const onSubmit = async (values: ArticleFormValues) => {
    setSubmitting(true)
    try {
      if (isEdit && initialArticle) {
        const res = await updateArticleAction({
          id: initialArticle.id,
          ...values,
        })
        if (res.success && res.article) {
          toast.success(res.message || 'تم تحديث المنشور بنجاح')
          onArticleSaved(res.article)
          onClose()
        } else {
          toast.error(res.message || 'تعذر تحديث المنشور')
        }
      } else {
        const res = await createArticleAction(values)
        if (res.success && res.article) {
          toast.success(res.message || 'تم نشر المنشور بنجاح')
          onArticleSaved(res.article)
          reset()
          removeMedia()
          onClose()
        } else {
          toast.error(res.message || 'تعذر نشر المنشور')
        }
      }
    } catch {
      toast.error('حدث خطأ أثناء حفظ المنشور')
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
              {isEdit ? <Pencil className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-ink-900 text-lg">
                {isEdit ? 'تعديل المنشور' : 'نشر خبر أو مقال جديد'}
              </h3>
              <p className="text-xs text-ink-500 font-medium">
                {isEdit
                  ? 'قم بتحديث تفاصيل المنشور أو استبدال المرفقات'
                  : 'شارك الطلاب والمعلمين آخر الأخبار والمقالات والإعلانات التربوية'}
              </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4.5 overflow-y-auto flex-1">
          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">
              نوع المنشور <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    watchedCategory === cat
                      ? 'border-gold bg-gold/10 text-gold shadow-2xs'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={cat}
                    {...register('category')}
                    className="sr-only"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.category.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">
              عنوان المنشور <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: موعد انطلاق الاختبارات الشهرية وتوجيهات الاستعداد"
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
              نص وتفاصيل المنشور <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="اكتب نص الخبر أو المقال بالتفصيل لجميع منسوبي المنصة..."
              {...register('content')}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none transition-all ${
                errors.content ? 'border-red-400 bg-red-50/20' : 'border-ink-200 focus:border-gold'
              }`}
            />
            {errors.content && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.content.message}</p>
            )}
          </div>

          {/* Media Attachments */}
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">
              إرفاق وسائط أو مستند (اختياري)
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
                        : 'تم إرفاق صورة للمنشور'}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium">جاهز للنشر</p>
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
                {/* Upload Image Option */}
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

                {/* Upload PDF Option */}
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

                {/* Upload Video Option */}
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

          {/* Actions */}
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
                  <span>جارٍ الحفظ...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{isEdit ? 'تحديث المنشور' : 'نشر الآن'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
