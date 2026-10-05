import { useState } from 'react';
import { type Resource, type ResourceType, resourceTypeLabels, subjects } from '@/data/sampleData';
import { SubjectIcon } from '@/components/SubjectIcon';
import FilePreview from '@/components/FilePreview';
import { downloadFile } from '@/lib/fileDownload';
import { FileText, Presentation, File, Video, BookText, Image, ArrowLeft, X, Download, Loader2, Link as LinkIcon } from 'lucide-react';

const typeIcons: Record<ResourceType, typeof FileText> = {
  lesson: BookText,
  summary: FileText,
  presentation: Presentation,
  file: File,
  video: Video,
  image: Image,
  pdf: FileText,
  link: LinkIcon,
};

const sourceLabels: Record<string, { label: string; className: string }> = {
  official: { label: 'محتوى رسمي', className: 'bg-gold/10 text-gold-dark' },
  teacher: { label: 'محتوى المعلم', className: 'bg-sage-50 text-sage-dark' },
  contribution: { label: 'مساهمة', className: 'bg-ink-50 text-ink-500' },
};

export default function ResourceCard({ resource }: { resource: Resource }) {
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const TypeIcon = typeIcons[resource.type];
  const subject = subjects.find((s) => s.id === resource.subjectId);
  const sourceInfo = sourceLabels[resource.source || 'official'] || sourceLabels.official;

  const realFileName = resource.fileUrl ? getFileNameFromUrl(resource.fileUrl, resource.title) : resource.title;

  const handleDownload = async () => {
    setDownloadError(false);
    if (!resource.fileUrl) return;
    const result = await downloadFile(resource.fileUrl, realFileName, setDownloading);
    if (!result.ok) setDownloadError(true);
  };

  return (
    <>
      <div className="card-hover p-5 flex flex-col gap-3 group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center text-ink-600 shrink-0">
              <SubjectIcon name={subject?.icon || 'BookOpen'} className="w-5 h-5" />
            </div>
            <span className="chip bg-ink-50 text-ink-600 text-xs">
              <TypeIcon className="w-3.5 h-3.5" />
              {resourceTypeLabels[resource.type]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {resource.source && resource.source !== 'official' && (
              <span className={`chip text-xs ${sourceInfo.className}`}>{sourceInfo.label}</span>
            )}
            <span className="text-xs text-ink-400">{formatDate(resource.date)}</span>
          </div>
        </div>

        <div>
          <h3 className="font-heading font-bold text-ink-900 text-lg leading-snug group-hover:text-ink-700 transition-colors">
            {resource.title}
          </h3>
          <p className="text-sm text-ink-500 mt-0.5">{resource.lesson} — {resource.subjectName}</p>
        </div>

        <p className="text-sm text-ink-600 leading-relaxed line-clamp-2">{resource.description}</p>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-ink-100/60">
          <span className="text-xs text-ink-500">إعداد: {resource.author}</span>
          <button
            onClick={() => setShowPreview(true)}
            className="btn-ghost text-sm text-gold-dark hover:bg-gold/10"
          >
            عرض المحتوى
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 bg-ink-900/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="card p-6 max-w-2xl w-full animate-scale-in max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-ink-900 text-lg truncate">{resource.title}</h3>
                <p className="text-sm text-ink-500 mt-0.5">{resource.lesson} — {resource.subjectName}</p>
              </div>
              <button onClick={() => setShowPreview(false)} className="btn-ghost p-1 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-ink-600 leading-relaxed">{resource.description}</p>
              <p className="text-xs text-ink-400 mt-2">إعداد: {resource.author}</p>
            </div>

            {resource.fileUrl ? (
              resource.type === 'link' ? (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center">
                    <LinkIcon className="w-7 h-7 text-gold-dark" />
                  </div>
                  <p className="text-sm text-ink-500 text-center">هذا المحتوى عبارة عن رابط خارجي.</p>
                  <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                    <LinkIcon className="w-4 h-4" />
                    فتح الرابط
                  </a>
                </div>
              ) : (
                <div className="mb-4">
                  {resource.thumbnailUrl && resource.type !== 'pdf' && resource.type !== 'video' && (
                    <img src={resource.thumbnailUrl} alt={resource.title} className="rounded-xl max-h-48 object-cover mb-3" />
                  )}
                  <FilePreview url={resource.fileUrl} fileName={getFileNameFromUrl(resource.fileUrl, resource.title)} />
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-ink-50 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-ink-400" />
                </div>
                <p className="text-sm text-ink-500 text-center">لا يوجد ملف مرفق لهذا المحتوى.</p>
              </div>
            )}

            {resource.fileUrl && resource.type !== 'link' && (
              <div className="flex flex-col items-end gap-1 pt-2 border-t border-ink-50">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      تحميل الملف
                    </>
                  )}
                </button>
                {downloadError && (
                  <p className="text-xs text-red-600">تعذر تحميل الملف، حاول مرة أخرى.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ar', { day: 'numeric', month: 'short' });
}

function getFileNameFromUrl(url: string, fallback: string): string {
  try {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const lastSegment = decodeURIComponent(cleanUrl.split('/').pop() || '');
    if (lastSegment && lastSegment.includes('.')) {
      const parts = lastSegment.split('-');
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart.includes('.')) return lastPart;
      return lastSegment;
    }
  } catch {
    // ignore
  }
  return fallback;
}
