'use client'

import { useState } from 'react'
import Image from 'next/image'
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
      <div className="bg-white rounded-3xl border border-ink-100 p-5 sm:p-6 shadow-2xs hover:shadow-soft transition-all duration-200 flex flex-col justify-between group">
        <div>
          {/* Header: Subject + Author Info + Date */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-ink-100/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-ink-900 truncate">
                    {authorName}
                  </span>
                  {contribution.student_id === currentUserId && (
                    <span className="px-2 py-0.5 rounded-md bg-gold/15 text-gold text-[10px] font-bold shrink-0">
                      مساهمتك
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-400 mt-0.5 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-ink-300" />
                    {formatDate(contribution.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-parchment text-ink-700 text-xs font-bold border border-ink-200/60">
                <BookOpen className="w-3 h-3 text-gold" />
                <span>{subjectName}</span>
              </span>

              {canDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-ink-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="حذف المساهمة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Title & Content */}
          <div className="mt-4 space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-ink-900 leading-snug">
              {contribution.title}
            </h3>
            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed whitespace-pre-line font-normal">
              {contribution.content}
            </p>
          </div>
        </div>

        {/* Media Attachments */}
        {(contribution.imageUrl || contribution.pdfUrl || contribution.videoUrl) && (
          <div className="mt-5 pt-4 border-t border-ink-100/70 space-y-3">
            {contribution.videoUrl && (
              <div className="rounded-2xl overflow-hidden border border-ink-200/80 bg-ink-950 shadow-inner">
                <video
                  src={contribution.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full max-h-72 object-contain bg-black"
                />
              </div>
            )}

            {contribution.imageUrl && (
              <div
                onClick={() => setShowImageModal(true)}
                className="relative rounded-2xl overflow-hidden border border-ink-100 bg-ink-50/50 group/img max-h-56 cursor-pointer"
              >
                <Image
                  src={contribution.imageUrl}
                  alt={contribution.title}
                  width={600}
                  height={300}
                  loading="lazy"
                  className="w-full h-48 sm:h-52 object-cover transition-transform duration-300 group-hover/img:scale-105 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowImageModal(true)
                  }}
                  className="absolute inset-0 bg-ink-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold backdrop-blur-2xs cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>عرض الصورة بالحجم الكامل</span>
                </button>
              </div>
            )}

            {contribution.pdfUrl && (
              <a
                href={contribution.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between w-full p-3 rounded-2xl bg-red-50/60 border border-red-200/60 hover:bg-red-100/60 transition-colors group/pdf cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate text-right">
                    <span className="block text-xs font-bold text-red-950 truncate">
                      المستند المرفق (PDF)
                    </span>
                    <span className="text-[11px] text-red-700 font-medium">
                      انقر للمعاينة والتحميل
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-red-600 shrink-0 group-hover/pdf:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Full Image Modal */}
      {showImageModal && contribution.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 left-4 z-10 p-2 rounded-full bg-ink-900/70 text-white hover:bg-ink-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <Image
              src={contribution.imageUrl}
              alt={contribution.title}
              width={1200}
              height={800}
              loading="lazy"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-ink-100 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-ink-900">حذف المساهمة</h4>
              <p className="text-xs text-ink-500">
                هل أنت متأكد من حذف هذه المساهمة؟ سيتم حذف المرفقات أيضاً ولن يعود بإمكان الطلاب رؤيتها.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-600 hover:bg-ink-100"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
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
