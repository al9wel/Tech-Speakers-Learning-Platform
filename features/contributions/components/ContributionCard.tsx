'use client'

import { useState } from 'react'
import {
  User,
  Calendar,
  BookOpen,
  FileText,
  Trash2,
  ExternalLink,
  ZoomIn,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { ContributionItem } from '../types'

interface ContributionCardProps {
  contribution: ContributionItem
  currentUserId: string
  isSupervisorOrAdmin: boolean
  onDelete: (id: string) => Promise<void>
}

export function ContributionCard({
  contribution,
  currentUserId,
  isSupervisorOrAdmin,
  onDelete,
}: ContributionCardProps) {
  const [showImageModal, setShowImageModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const canDelete =
    contribution.student_id === currentUserId || isSupervisorOrAdmin

  const authorName = contribution.student?.full_name || 'طالب مسجل'
  const subjectName = contribution.subject?.name || 'مادة دراسية'

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

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(contribution.id)
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="border border-border-base rounded-lg bg-bg-surface p-4 sm:p-5 hover:border-[#c8c4bc] hover:shadow-[0_2px_8px_rgba(28,27,25,0.04)] transition-all duration-150 flex flex-col justify-between group">
        <div>
          {/* Header: Subject + Author Info + Date */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-bg-alt text-ink-primary border border-border-subtle flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4 text-ink-muted" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-xs sm:text-sm text-ink-primary truncate">
                    {authorName}
                  </span>
                  {contribution.student_id === currentUserId && (
                    <span className="chip text-[10px] text-accent border-accent/20 bg-accent-bg py-0 px-1.5 font-medium">
                      مساهمتك
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-ink-muted mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-ink-muted" />
                    {formatDate(contribution.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="chip text-[11px]">
                <BookOpen className="w-3 h-3 text-accent inline ml-1" />
                <span>{subjectName}</span>
              </span>

              {canDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1 text-ink-muted hover:text-error hover:bg-error-bg/60 rounded transition-colors cursor-pointer"
                  title="حذف المساهمة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Title & Content */}
          <div className="mt-3.5 space-y-1.5">
            <h3 className="font-serif font-bold text-base text-ink-primary leading-snug">
              {contribution.title}
            </h3>
            <p className="text-xs sm:text-sm text-ink-primary leading-relaxed whitespace-pre-line font-normal">
              {contribution.content}
            </p>
          </div>
        </div>

        {/* Media Attachments */}
        {(contribution.imageUrl || contribution.pdfUrl || contribution.videoUrl) && (
          <div className="mt-4 pt-3.5 border-t border-border-subtle space-y-2.5">
            {contribution.videoUrl && (
              <div className="rounded-md overflow-hidden border border-border-base bg-black">
                <video
                  src={contribution.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full max-h-64 object-contain bg-black"
                />
              </div>
            )}

            {contribution.imageUrl && (
              <div
                onClick={() => setShowImageModal(true)}
                className="relative rounded-md overflow-hidden border border-border-base bg-bg-alt group/img max-h-52 cursor-pointer"
              >
                <img
                  src={contribution.imageUrl}
                  alt={contribution.title}
                  className="w-full h-44 sm:h-48 object-cover transition-transform duration-300 group-hover/img:scale-102 cursor-pointer"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowImageModal(true)
                  }}
                  className="absolute inset-0 bg-ink-primary/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium backdrop-blur-2xs cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>عرض بالحجم الكامل</span>
                </button>
              </div>
            )}

            {contribution.pdfUrl && (
              <a
                href={contribution.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between w-full p-2.5 rounded-md bg-bg-alt/50 border border-border-base hover:bg-bg-alt transition-colors group/pdf cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-7 h-7 rounded-md bg-error-bg text-error flex items-center justify-center shrink-0 border border-error/20">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate text-right">
                    <span className="block text-xs font-medium text-ink-primary truncate">
                      المستند المرفق (PDF)
                    </span>
                    <span className="text-[10px] text-ink-muted">
                      انقر للمعاينة والتحميل
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-ink-muted shrink-0" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Full Image Modal */}
      {showImageModal && contribution.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-bg-surface rounded-lg overflow-hidden border border-border-base shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-3 left-3 z-10 p-1.5 rounded-md bg-ink-primary/70 text-white hover:bg-ink-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={contribution.imageUrl}
              alt={contribution.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-md"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-xs">
          <div className="bg-bg-surface rounded-lg max-w-sm w-full p-5 text-center space-y-3.5 border border-border-base shadow-xl">
            <div className="w-10 h-10 rounded-full bg-error-bg text-error flex items-center justify-center mx-auto border border-error/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-base text-ink-primary">حذف المساهمة</h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                هل أنت متأكد من حذف هذه المساهمة؟ سيتم حذف المرفقات أيضاً ولن يعود بإمكان الطلاب رؤيتها.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="btn-outline text-xs py-1.5 px-3"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-primary text-xs py-1.5 px-3 bg-error text-white hover:bg-error-dark"
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
