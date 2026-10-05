import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'files';

type DownloadResult = { ok: true } | { ok: false; error: string };

function extractStoragePath(url: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.slice(idx + marker.length));
  } catch {
    return null;
  }
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export async function downloadFile(
  fileUrl: string,
  fileName: string,
  setLoading?: (loading: boolean) => void
): Promise<DownloadResult> {
  setLoading?.(true);
  try {
    const storagePath = extractStoragePath(fileUrl);

    if (storagePath) {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(storagePath);

      if (!error && data) {
        triggerBlobDownload(data, fileName);
        return { ok: true };
      }
      console.error('Storage download error:', error);
    }

    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    triggerBlobDownload(blob, fileName);
    return { ok: true };
  } catch (err) {
    console.error('File download error:', err);
    return { ok: false, error: 'تعذر تحميل الملف، حاول مرة أخرى.' };
  } finally {
    setLoading?.(false);
  }
}
