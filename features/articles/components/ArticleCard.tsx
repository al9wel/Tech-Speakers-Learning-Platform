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
          pill: 'bg-accent-bg text-accent border-accent/20',
          dot: 'bg-accent',
        }
      case 'مقال':
        return {
          pill: 'bg-paper-terracotta/10 text-paper-terracotta border-paper-terracotta/20',
          dot: 'bg-paper-terracotta',
        }
      case 'إعلان':
        return {
          pill: 'bg-bg-alt text-ink-primary border-border-base',
          dot: 'bg-ink-secondary',
        }
      case 'توجيه تربوي':
      default:
        return {
          pill: 'bg-accent-bg text-accent border-accent/20',
          dot: 'bg-accent',
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

  const isLead = isFeatured || variant === 'hero'

  return (
    <>
      {/* ========================================================
         COMPACT HORIZONTAL EDITORIAL ROW (مثل فهرس الدروس)
         Full width, compact height, clear highlight under text
         ======================================================== */}
      <article
        onClick={() => setShowReaderModal(true)}
        className={`p-3.5 sm:p-4.5 transition-colors group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-5 cursor-pointer select-none ${
          isLead
            ? 'bg-accent/6 hover:bg-accent/10 border-r-3 border-accent'
            : 'hover:bg-bg-alt/60'
        }`}
      >
        {/* Right side / Main content (RTL) */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Unboxed Compact Thumbnail (if present) */}
          {article.imageUrl && (
            <div
              className="w-20 h-16 sm:w-24 sm:h-18 rounded-md overflow-hidden bg-bg-alt border border-border-subtle shrink-0 self-center order-last sm:order-first group-hover:opacity-95 transition-opacity"
            >
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          )}

          {/* Text & Metadata */}
          <div className="min-w-0 flex-1 space-y-1">
            {/* Top Tag Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              {isLead && (
                <span className="chip bg-paper-terracotta/10 text-paper-terracotta border-paper-terracotta/20 text-[10px] font-semibold">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>الخبر الأبرز</span>
                </span>
              )}

              <span className={`chip text-[10px] font-semibold ${categoryStyle.pill}`}>
                {article.category || 'خبر'}
              </span>

              <span className="text-[11px] font-medium text-ink-secondary">
                أ. {authorName}
              </span>

              <span>·</span>

              <span className="text-[11px] text-ink-muted">
                {formatDate(article.created_at)}
              </span>

              {article.videoUrl && (
                <span className="chip text-[10px] text-ink-secondary">
                  <Video className="w-3 h-3 text-accent" />
                  <span>فيديو</span>
                </span>
              )}

              {article.pdfUrl && (
                <span className="chip text-[10px] text-ink-secondary">
                  <FileText className="w-3 h-3 text-red-600" />
                  <span>PDF</span>
                </span>
              )}
            </div>

            {/* Headline with High-Visibility Under-Highlight Marker */}
            <h3 className="font-serif font-bold text-base sm:text-[17px] text-ink-primary group-hover:text-accent transition-colors leading-snug">
              <span className="inline bg-accent/12 text-ink-primary px-1.5 py-0.5 rounded-xs border-b-2 border-accent/40 group-hover:bg-accent/20 group-hover:border-accent transition-colors">
                {article.title}
              </span>
            </h3>

            {/* Compact 1-line Excerpt */}
            <p className="text-xs text-ink-secondary line-clamp-1 leading-relaxed font-normal">
              {article.content}
            </p>
          </div>
        </div>

        {/* Left side: Action Links & Management (RTL) */}
        <div
          className="flex items-center gap-2 shrink-0 self-end sm:self-center"
          onClick={(e) => e.stopPropagation()}
        >
          {article.pdfUrl && (
            <a
              href={article.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-[11px] py-1 px-2.5 flex items-center gap-1"
              title="معاينة المستند المرفق"
            >
              <FileText className="w-3 h-3 text-red-600" />
              <span>PDF</span>
            </a>
          )}

          {canManage && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onEdit?.(article)}
                className="p-1 text-ink-muted hover:text-ink-primary hover:bg-bg-alt rounded transition-colors cursor-pointer"
                title="تعديل المنشور"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 text-ink-muted hover:text-error hover:bg-error-bg rounded transition-colors cursor-pointer"
                title="حذف المنشور"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowReaderModal(true)}
            className="text-xs font-semibold text-ink-muted group-hover:text-accent flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>قراءة</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </article>

      {/* Full Article Reader Modal (نافذة قراءة الخبر بالكامل) */}
      {showReaderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer overflow-y-auto"
          onClick={() => setShowReaderModal(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[92vh] bg-bg-surface rounded-lg overflow-hidden shadow-xl flex flex-col cursor-default border border-border-base"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Media (if image exists) */}
            {article.imageUrl && (
              <div className="relative h-56 sm:h-72 w-full shrink-0 overflow-hidden bg-ink-primary group/zoom">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
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
              className="absolute top-3 left-3 z-20 p-2 rounded-md bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer shadow-md"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-5 flex-1">
              {/* Category & Date Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${categoryStyle.pill}`}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{article.category || 'خبر'}</span>
                  </span>
                  {(isFeatured || variant === 'hero') && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-paper-terracotta/10 text-paper-terracotta border border-paper-terracotta/20">
                      <Sparkles className="w-3 h-3 text-paper-terracotta" />
                      <span>الخبر الأبرز</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-ink-muted font-normal">
                  <Calendar className="w-3 h-3 text-ink-muted/70" />
                  <span>{formatDate(article.created_at)}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-ink-primary leading-tight">
                {article.title}
              </h1>

              {/* Author Card */}
              <div className="flex items-center gap-3 p-3 rounded-md bg-bg-alt/70 border border-border-subtle">
                <div className="w-9 h-9 rounded-md bg-accent/15 text-accent flex items-center justify-center font-bold text-sm shrink-0 border border-accent/20">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-ink-primary">
                      {authorName}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-accent/10 text-accent text-[10px] font-medium">
                      مشرف تربوي
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-muted">
                    المركز الإعلامي والإشراف الأكاديمي
                  </span>
                </div>
              </div>

              {/* Full Content */}
              <div className="prose prose-sm max-w-none text-ink-primary text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                {article.content}
              </div>

              {/* Video Player (if available) */}
              {article.videoUrl && (
                <div className="rounded-md overflow-hidden border border-border-base bg-black shadow-inner">
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
                <div className="p-3.5 rounded-md bg-bg-alt/80 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-red-100 text-red-700 flex items-center justify-center shrink-0 border border-red-200">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-ink-primary">
                        مستند توضيحي مرفق (PDF)
                      </h4>
                      <p className="text-xs text-ink-muted">
                        يمكنك الاطلاع على التعميم أو النشرة كاملة أو تحميلها
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={article.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md bg-bg-surface border border-border-base text-ink-primary hover:bg-bg-alt font-medium text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>معاينة</span>
                    </a>
                    <a
                      href={article.pdfUrl}
                      download
                      className="px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white font-medium text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-bg-alt/40 border-t border-border-base flex items-center justify-between">
              <span className="text-xs text-ink-muted">
                {formatDate(article.created_at)}
              </span>
              <button
                type="button"
                onClick={() => setShowReaderModal(false)}
                className="px-4 py-1.5 rounded-md bg-bg-surface hover:bg-bg-alt text-ink-secondary border border-border-base text-xs font-medium transition-colors cursor-pointer"
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
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] bg-transparent rounded-lg overflow-hidden p-2 cursor-default flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 left-4 z-10 p-2 rounded-md bg-black/70 text-white hover:bg-black transition-colors cursor-pointer shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={article.imageUrl}
              alt={article.title}
              className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-xs">
          <div className="bg-bg-surface rounded-lg max-w-sm w-full p-5 text-center space-y-4 border border-border-base shadow-xl">
            <div className="w-10 h-10 rounded-md bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-ink-primary text-base">حذف المنشور</h4>
              <p className="text-xs text-ink-muted">
                هل أنت متأكد من حذف هذا الخبر/المقال؟ سيتم إزالته وحذف ملفاته المرفقة نهائياً.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium text-ink-secondary hover:bg-bg-alt border border-border-base transition-colors cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
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
