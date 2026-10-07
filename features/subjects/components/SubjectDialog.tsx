'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { subjectFormSchema, type SubjectFormValues } from '../schemas/subject.schema'
import { createSubjectAction, updateSubjectAction } from '../server/actions'
import type { SubjectItem } from '../types'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen,
  Pencil,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const BUCKET_NAME = 'lesson-media'
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface SubjectDialogProps {
  subject?: SubjectItem // If provided, mode is EDIT. Otherwise CREATE.
  trigger?: React.ReactNode
  currentUserId?: string
}

function getFileExtension(file: File): string {
  const parts = file.name.split('.')
  if (parts.length > 1) {
    const ext = parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (ext) return ext
  }
  if (file.type === 'image/jpeg') return 'jpg'
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  if (file.type === 'image/gif') return 'gif'
  return 'png'
}

export function SubjectDialog({ subject, trigger, currentUserId }: SubjectDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(subject?.imageUrl || null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEdit = Boolean(subject)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      id: subject?.id,
      name: subject?.name || '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        id: subject?.id,
        name: subject?.name || '',
      })
      setSelectedFile(null)
      setPreviewUrl(subject?.imageUrl || null)
      setRemoveExistingImage(false)
      setServerError(null)
      setServerSuccess(null)
      setIsUploading(false)
    }
  }, [open, subject, reset])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP, GIF)')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('حجم الصورة كبير جداً، الحد الأقصى المسموح به هو 5 ميجابايت')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFile(file)
    setRemoveExistingImage(false)
    setServerError(null)
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setRemoveExistingImage(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isPending = isSubmitting || isUploading

  const onSubmit = async (data: SubjectFormValues) => {
    setServerError(null)
    setServerSuccess(null)

    const supabase = createClient()

    // Retrieve active teacher user id
    let userId = currentUserId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      userId = user?.id
    }

    if (!userId) {
      const msg = 'جلسة المستخدم منتهية. يرجى تسجيل الدخول مجدداً.'
      setServerError(msg)
      toast.error(msg)
      return
    }

    // Determine subject UUID
    const subjectId = isEdit && subject ? subject.id : crypto.randomUUID()
    let uploadedStoragePath: string | null = null

    // 1. Direct browser upload to Supabase Storage if a new file was selected
    if (selectedFile) {
      setIsUploading(true)
      try {
        const ext = getFileExtension(selectedFile)
        const fileName = `${Date.now()}.${ext}`
        const storagePath = `${userId}/subjects/${subjectId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, selectedFile, {
            contentType: selectedFile.type,
            upsert: false,
          })

        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          setIsUploading(false)
          const errorMsg = uploadError.message || 'تعذر رفع الصورة إلى التخزين السحابي. يرجى التأكد من اتصالك والمحاولة ثانية.'
          setServerError(errorMsg)
          toast.error(errorMsg)
          return
        }

        uploadedStoragePath = storagePath
      } catch (err: any) {
        console.error('Catch storage upload error:', err)
        setIsUploading(false)
        const errorMsg = err?.message || 'حدث خطأ أثناء رفع الصورة. يرجى إعادة المحاولة.'
        setServerError(errorMsg)
        toast.error(errorMsg)
        return
      } finally {
        setIsUploading(false)
      }
    }

    // 2. Submit serializable data ONLY to Server Action (never binary File)
    try {
      if (isEdit && subject) {
        const res = await updateSubjectAction({
          id: subject.id,
          name: data.name,
          image_path: uploadedStoragePath ?? undefined,
          remove_image: removeExistingImage,
        })

        if (!res.success) {
          // If server update failed, cleanup any newly uploaded storage file
          if (uploadedStoragePath) {
            await supabase.storage.from(BUCKET_NAME).remove([uploadedStoragePath])
          }
          setServerError(res.message)
          toast.error(res.message)
        } else {
          setServerSuccess(res.message)
          toast.success(res.message)
          router.refresh()
          setTimeout(() => {
            setOpen(false)
          }, 600)
        }
      } else {
        const res = await createSubjectAction({
          id: subjectId,
          name: data.name,
          image_path: uploadedStoragePath ?? null,
        })

        if (!res.success) {
          // If server insert failed, cleanup any newly uploaded storage file
          if (uploadedStoragePath) {
            await supabase.storage.from(BUCKET_NAME).remove([uploadedStoragePath])
          }
          setServerError(res.message)
          toast.error(res.message)
        } else {
          setServerSuccess(res.message)
          toast.success(res.message)
          router.refresh()
          setTimeout(() => {
            setOpen(false)
          }, 600)
        }
      }
    } catch (err: any) {
      if (uploadedStoragePath) {
        await supabase.storage.from(BUCKET_NAME).remove([uploadedStoragePath])
      }
      const errorMsg = 'حدث خطأ غير متوقع أثناء معالجة الطلب.'
      setServerError(errorMsg)
      toast.error(errorMsg)
    }
  }

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="inline-block cursor-pointer">
          {trigger}
        </span>
      ) : isEdit ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 hover:bg-gold/10 hover:border-gold"
        >
          <Pencil className="w-3.5 h-3.5 text-gold-dark" />
          <span>تعديل</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مادة جديدة</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-900/50 backdrop-blur-xs animate-page overflow-y-auto">
          <div className="card w-full max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-white shadow-card-hover border-ink-200 animate-scale-in my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-ink-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center">
                  {isEdit ? <Pencil className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-ink-900">
                    {isEdit ? 'تعديل بيانات المادة الدراسية' : 'إضافة مادة دراسية جديدة'}
                  </h3>
                  <p className="text-xs text-ink-500">
                    {isEdit ? subject?.name : 'أدخل بيانات المادة وصورتها التوضيحية'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Messages */}
            {serverError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{serverError}</span>
              </div>
            )}

            {serverSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-sage-50 border border-sage-100 text-sage-dark text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-sage-dark" />
                <span>{serverSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1.5">
                  اسم المادة الدراسية: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: الرياضيات، اللغة العربية، الفيزياء..."
                  disabled={isPending}
                  {...register('name')}
                  className="input-field text-sm disabled:opacity-60"
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Subject Image Field */}
              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1.5">
                  صورة غلاف المادة (اختياري):
                </label>

                {previewUrl ? (
                  <div className="relative rounded-2xl border border-ink-200 p-2.5 bg-cream/30 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-ink-100 shrink-0 border border-ink-100 flex items-center justify-center">
                      <Image
                        src={previewUrl}
                        alt="معاينة المادة"
                        width={64}
                        height={64}
                        loading="lazy"
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink-900 truncate">
                        {selectedFile ? selectedFile.name : 'الصورة الحالية للمادة'}
                      </p>
                      <p className="text-[11px] text-ink-500">
                        {selectedFile
                          ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} ميجابايت`
                          : 'مخزنة في السحابة'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-ink-500 hover:text-ink-800 hover:bg-ink-100 transition disabled:opacity-40"
                        title="تغيير الصورة"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition disabled:opacity-40"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (!isPending) fileInputRef.current?.click()
                    }}
                    className={`border-2 border-dashed border-ink-200 hover:border-gold rounded-2xl p-5 text-center cursor-pointer transition-colors bg-cream/20 hover:bg-cream/40 ${
                      isPending ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <UploadCloud className="w-8 h-8 text-ink-400 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-ink-800">
                      اضغط لاختيار صورة للمادة
                    </p>
                    <p className="text-[11px] text-ink-500 mt-0.5">
                      PNG أو JPG أو WebP (بحد أقصى 5 ميجابايت)
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                  disabled={isPending}
                  className="hidden"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 mt-6 border-t border-ink-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="btn-outline text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary text-sm min-w-32 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري رفع الصورة...</span>
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>{isEdit ? 'حفظ التعديلات' : 'إضافة المادة'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
