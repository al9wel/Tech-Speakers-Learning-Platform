import { useState, useMemo } from 'react';
import { FileText, Download, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { downloadFile } from '@/lib/fileDownload';

type FilePreviewProps = {
  url: string;
  fileName: string;
  contentType?: string;
  onClose?: () => void;
};

const MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'video/ogg',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  txt: 'text/plain',
  html: 'text/html',
  csv: 'text/csv',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
};

function getExtensionFromUrl(url: string): string {
  try {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const lastSegment = cleanUrl.split('/').pop() || '';
    const ext = lastSegment.split('.').pop()?.toLowerCase() || '';
    if (ext && MIME_MAP[ext]) return ext;
    const dashParts = lastSegment.split('-');
    for (let i = dashParts.length - 1; i >= 0; i--) {
      const candidate = dashParts[i].split('.').pop()?.toLowerCase() || '';
      if (candidate && MIME_MAP[candidate]) return candidate;
    }
    return ext;
  } catch {
    return '';
  }
}

function getExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return ext && ext !== fileName ? ext : '';
}

function getMimeType(fileName: string, url: string, contentType?: string): string {
  if (contentType) return contentType;
  const nameExt = getExtension(fileName);
  if (nameExt && MIME_MAP[nameExt]) return MIME_MAP[nameExt];
  const urlExt = getExtensionFromUrl(url);
  if (urlExt && MIME_MAP[urlExt]) return MIME_MAP[urlExt];
  return 'application/octet-stream';
}

function isImage(mime: string): boolean {
  return mime.startsWith('image/') && mime !== 'image/svg+xml';
}

function isPdf(mime: string): boolean {
  return mime === 'application/pdf';
}

function isVideo(mime: string): boolean {
  return mime.startsWith('video/');
}

function isAudio(mime: string): boolean {
  return mime.startsWith('audio/');
}

function DownloadButton({ url, fileName }: { url: string; fileName: string }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const handleDownload = async () => {
    setDownloadError(false);
    const result = await downloadFile(url, fileName, setDownloading);
    if (!result.ok) setDownloadError(true);
  };

  return (
    <div className="flex flex-col items-center gap-2">
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
            تحميل
          </>
        )}
      </button>
      {downloadError && (
        <p className="text-xs text-red-600">تعذر تحميل الملف، حاول مرة أخرى.</p>
      )}
    </div>
  );
}

function ErrorState({ url, fileName, onRetry }: { url: string; fileName: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <AlertCircle className="w-10 h-10 text-red-500" />
      <p className="text-sm text-ink-600 text-center">تعذر معاينة الملف.</p>
      <div className="flex gap-2">
        <button onClick={onRetry} className="btn-outline text-sm">
          <RefreshCw className="w-4 h-4" />
          إعادة المحاولة
        </button>
        <DownloadButton url={url} fileName={fileName} />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 text-gold animate-spin" />
      <p className="text-sm text-ink-500">جارٍ تحميل المعاينة...</p>
    </div>
  );
}

export default function FilePreview({ url, fileName, contentType }: FilePreviewProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const mime = useMemo(() => getMimeType(fileName, url, contentType), [fileName, url, contentType]);

  if (error) {
    return <ErrorState url={url} fileName={fileName} onRetry={() => { setError(false); setLoading(true); }} />;
  }

  if (loading && !isImage(mime) && !isPdf(mime) && !isVideo(mime) && !isAudio(mime)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center">
          <FileText className="w-8 h-8 text-ink-400" />
        </div>
        <p className="text-sm text-ink-600 text-center max-w-sm">
          لا يمكن معاينة هذا النوع من الملفات مباشرة.
        </p>
        <p className="text-xs text-ink-400 font-mono" dir="ltr">{fileName}</p>
        <DownloadButton url={url} fileName={fileName} />
      </div>
    );
  }

  if (isImage(mime)) {
    return (
      <div className="flex items-center justify-center bg-ink-50 rounded-xl overflow-hidden min-h-[200px]">
        {loading && <LoadingState />}
        <img
          src={url}
          alt={fileName}
          className={`max-w-full max-h-[60vh] object-contain ${loading ? 'hidden' : ''}`}
          onLoad={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
        />
      </div>
    );
  }

  if (isPdf(mime)) {
    return (
      <div className="w-full">
        {loading && (
          <div className="rounded-xl overflow-hidden">
            <LoadingState />
          </div>
        )}
        <iframe
          src={`${url}#view=FitH`}
          title={fileName}
          className={`w-full rounded-xl bg-white border border-ink-100 ${loading ? 'hidden' : ''}`}
          style={{ height: '65vh', minHeight: '400px' }}
          onLoad={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
        />
        {!loading && (
          <p className="text-xs text-ink-400 mt-2 text-center">
            إذا لم يظهر الملف، يمكنك تحميله مباشرة.
          </p>
        )}
      </div>
    );
  }

  if (isVideo(mime)) {
    return (
      <div className="w-full">
        {loading && <LoadingState />}
        <video
          src={url}
          controls
          autoPlay={false}
          className={`w-full max-h-[60vh] rounded-xl bg-black ${loading ? 'hidden' : ''}`}
          onLoadedData={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
        />
      </div>
    );
  }

  if (isAudio(mime)) {
    return (
      <div className="w-full flex flex-col items-center gap-3 py-8">
        <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center">
          <FileText className="w-8 h-8 text-gold-dark" />
        </div>
        <p className="text-sm text-ink-600 text-center">{fileName}</p>
        <audio
          src={url}
          controls
          className="w-full max-w-md"
          onLoadedData={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center">
        <FileText className="w-8 h-8 text-ink-400" />
      </div>
      <p className="text-sm text-ink-600 text-center max-w-sm">
        لا يمكن معاينة هذا النوع من الملفات مباشرة.
      </p>
      <p className="text-xs text-ink-400 font-mono" dir="ltr">{fileName}</p>
      <DownloadButton url={url} fileName={fileName} />
    </div>
  );
}
