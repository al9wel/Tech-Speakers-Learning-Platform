'use client'

import { useState } from 'react'
import {
  User,
  Calendar,
  Tag,
  FileText,
  Trash2,
  Pencil,
  ExternalLink,
  ZoomIn,
  X,
  AlertCircle,
  Loader2,
  FileDown,
  Sparkles,
  ArrowLeft,
  Video,
} from 'lucide-react'
import type { ArticleItem } from '../types'

export type ArticleCardVariant = 'hero' | 'wide' | 'compact' | 'standard'

interface ArticleCardProps {
  article: ArticleItem
  variant?: ArticleCardVariant
  isFeatured?: boolean
  canManage?: boolean
  onEdit?: (article: ArticleItem) => void
  onDelete?: (id: string) => Promise<void>
}

export function ArticleCard({
  article,
  variant = 'standard',
  isFeatured = false,
  canManage = false,
  onEdit,
  onDelete,
}: ArticleCardProps) {
  const [showImageModal, setShowImageModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showReaderModal, setShowReaderModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const authorName = article.author?.full_name || 'المشرف التربوي'

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'خبر':
        return {
          pill: 'bg-black/40 text-sky-200 border-white/15 backdrop-blur-xs',
          dot: 'bg-sky-400',
        }
      case 'مقال':
        return {
          pill: 'bg-black/40 text-emerald-200 border-white/15 backdrop-blur-xs',
          dot: 'bg-emerald-400',
        }
      case 'إعلان':
        return {
          pill: 'bg-black/40 text-amber-200 border-white/15 backdrop-blur-xs',
          dot: 'bg-amber-400',
        }
      case 'توجيه تربوي':
      default:
        return {
          pill: 'bg-black/40 text-purple-200 border-white/15 backdrop-blur-xs',
          dot: 'bg-purple-400',
        }
    }
  }

  const categoryStyle = getCategoryStyles(article.category)

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(article.id)
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  // Dynamic height based on card variant
  const getMinHeightClass = () => {
    switch (variant) {
      case 'hero':
        return 'min-h-[460px] sm:min-h-[500px]'
      case 'wide':
        return 'min-h-[400px] sm:min-h-[440px]'
      case 'compact':
        return 'min-h-[400px] sm:min-h-[440px]'
      case 'standard':
      default:
        return 'min-h-[380px] sm:min-h-[400px]'
    }
  }

  return (
    <>
      {/* Editorial News Card */}
      <article
        onClick={() => setShowReaderModal(true)}
        className={`group relative rounded-3xl overflow-hidden border border-white/15 shadow-soft hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer select-none p-4 sm:p-6 ${getMinHeightClass()}`}
      >
        {/* Background Layers */}
        {article.imageUrl ? (
          <>
            <img
              src={article.imageUrl}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle Natural Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none transition-opacity duration-300" />
          </>
        ) : (
          <>
            {/* Rich Editorial Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#241a14] via-[#35261d] to-[#18110d]" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-sage/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          </>
        )}

        {/* Top Header Row (Badges & Management Actions) */}
        <div className="relative z-10 flex items-start justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {(isFeatured || variant === 'hero') && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-gold to-gold-600 text-white shadow-md backdrop-blur-xs border border-gold-300/40 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>الخبر الأبرز</span>
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs border shadow-sm ${categoryStyle.pill}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dot}`} />
              <span>{article.category || 'خبر'}</span>
            </span>

            {article.videoUrl && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-xs bg-black/40 text-amber-200 border border-white/15 shadow-sm">
                <Video className="w-3 h-3 text-amber-300" />
                <span>مقطع فيديو</span>
              </span>
            )}

            {article.pdfUrl && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-xs bg-black/40 text-red-200 border border-white/15 shadow-sm">
                <FileText className="w-3 h-3 text-red-300" />
                <span>مرفق مستند</span>
              </span>
            )}
          </div>

          {/* Quick Management Buttons */}
          {canManage && (
            <div
              className="flex items-center gap-1 backdrop-blur-xs bg-black/40 rounded-2xl p-1 border border-white/15 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onEdit?.(article)}
                className="p-1.5 text-white/80 hover:text-gold-300 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                title="تعديل المنشور"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-white/80 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all cursor-pointer"
                title="حذف المنشور"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Content Area: Subtle Frosted Glass Veil */}
        <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-black/25 backdrop-blur-xs border border-white/10 shadow-sm space-y-3 mt-auto transition-colors duration-300 group-hover:bg-black/35">
          {/* Metadata Row: Author & Date */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-ink-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gold/25 border border-gold/40 text-gold-200 flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
                <User className="w-3 h-3" />
              </div>
              <span className="font-bold text-white text-xs truncate max-w-[120px] sm:max-w-[160px]">
                {authorName}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-gold-200 text-[10px] font-bold">
                مشرف
              </span>
            </div>

            <span className="text-white/30 hidden sm:inline">•</span>

            <div className="flex items-center gap-1 text-[11px] text-ink-300 font-medium">
              <Calendar className="w-3 h-3 text-gold-300" />
              <span>{formatDate(article.created_at)}</span>
            </div>
          </div>

          {/* Headline */}
          <h2
            className={`font-black text-white leading-tight drop-shadow-sm group-hover:text-gold-200 transition-colors ${
              variant === 'hero'
                ? 'text-xl sm:text-2xl md:text-3xl line-clamp-2 sm:line-clamp-3'
                : variant === 'wide'
                ? 'text-lg sm:text-xl md:text-2xl line-clamp-2'
                : variant === 'compact'
                ? 'text-base sm:text-lg line-clamp-2'
                : 'text-lg sm:text-xl line-clamp-2'
            }`}
          >
            {article.title}
          </h2>

          {/* Excerpt */}
          <p
            className={`text-ink-100/90 leading-relaxed font-normal ${
              variant === 'hero'
                ? 'text-xs sm:text-sm md:text-base line-clamp-3'
                : variant === 'compact'
                ? 'text-xs text-ink-100/80 line-clamp-2'
                : 'text-xs sm:text-sm line-clamp-2'
            }`}
          >
            {article.content}
          </p>

          {/* Bottom Action Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
            <span className="inline-flex items-center gap-1.5 text-gold-300 group-hover:text-gold-200 font-bold transition-all">
              <span>قراءة التفاصيل</span>
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            </span>

            {/* Direct Media Links */}
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {article.imageUrl && (
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 transition-colors cursor-pointer"
                  title="تكبير الصورة"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              )}

              {article.pdfUrl && (
                <a
                  href={article.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                  title="معاينة الملف المرفق"
                >
                  <FileText className="w-3 h-3" />
                  <span>PDF</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Full Article Reader Modal (نافذة قراءة الخبر بالكامل) */}
      {showReaderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer overflow-y-auto"
          onClick={() => setShowReaderModal(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col cursor-default border border-ink-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Media (if image exists) */}
            {article.imageUrl && (
              <div className="relative h-56 sm:h-72 w-full shrink-0 overflow-hidden bg-ink-900 group/zoom">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-xs transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>عرض الصورة الأصلية</span>
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowReaderModal(false)}
              className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer shadow-md"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              {/* Category & Date Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${categoryStyle.pill}`}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{article.category || 'خبر'}</span>
                  </span>
                  {(isFeatured || variant === 'hero') && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold text-white">
                      <Sparkles className="w-3 h-3" />
                      <span>الخبر الأبرز</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-ink-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-ink-400" />
                  <span>{formatDate(article.created_at)}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-ink-900 leading-tight">
                {article.title}
              </h1>

              {/* Author Card */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-parchment/60 border border-ink-100">
                <div className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-sm shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-ink-900">
                      {authorName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-gold/15 text-gold text-[10px] font-bold">
                      مشرف تربوي
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-400">
                    المركز الإعلامي والإشراف الأكاديمي
                  </span>
                </div>
              </div>

              {/* Full Content */}
              <div className="prose prose-sm max-w-none text-ink-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                {article.content}
              </div>

              {/* Video Player (if available) */}
              {article.videoUrl && (
                <div className="rounded-2xl overflow-hidden border border-ink-200/80 bg-ink-950 shadow-inner">
                  <video
                    src={article.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-h-96 object-contain bg-black mx-auto"
                  />
                </div>
              )}

              {/* PDF Attachment (if available) */}
              {article.pdfUrl && (
                <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-950">
                        مستند توضيحي مرفق (PDF)
                      </h4>
                      <p className="text-xs text-red-700">
                        يمكنك الاطلاع على التعميم أو النشرة كاملة أو تحميلها
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={article.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 hover:bg-red-100 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>معاينة</span>
                    </a>
                    <a
                      href={article.pdfUrl}
                      download
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-ink-50/50 border-t border-ink-100 flex items-center justify-between">
              <span className="text-xs text-ink-400">
                منصة المتحدثون التقنيون التعليمية
              </span>
              <button
                type="button"
                onClick={() => setShowReaderModal(false)}
                className="px-5 py-2 rounded-xl bg-ink-900 hover:bg-ink-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Image Modal Lightbox */}
      {showImageModal && article.imageUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] bg-transparent rounded-3xl overflow-hidden p-2 cursor-default flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 left-4 z-10 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={article.imageUrl}
              alt={article.title}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-ink-100 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-ink-900">حذف المنشور</h4>
              <p className="text-xs text-ink-500">
                هل أنت متأكد من حذف هذا الخبر/المقال؟ سيتم إزالته وحذف ملفاته المرفقة نهائياً.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-600 hover:bg-ink-100 cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جارٍ الحذف...</span>
                  </>
                ) : (
                  <span>نعم، حذف</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
