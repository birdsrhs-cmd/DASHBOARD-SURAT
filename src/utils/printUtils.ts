import html2pdf from 'html2pdf.js';
import { safeDownloadBlob } from './fileDownloader';

/**
 * Mendeteksi apakah aplikasi sedang dimuat di dalam iframe (seperti pada preview AI Studio)
 */
export function isIframeEnvironment(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Mengonversi elemen pratinjau DOM menjadi berkas PDF (.pdf) asli dan memicu pengunduhan
 */
export async function downloadElementAsPdf(
  elementId: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemen dokumen "${elementId}" tidak ditemukan.`);
  }

  // Gandakan elemen agar tidak mengganggu layout pratinjau utama
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.no-print').forEach((el) => el.remove());
  clone.style.transform = 'none';
  clone.style.width = '794px';
  clone.style.maxWidth = '794px';
  clone.style.minHeight = 'auto';
  clone.style.height = 'auto';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';
  clone.style.margin = '0 auto';
  clone.style.background = '#ffffff';

  // Container penampung di area aktif (top: 0, left: 0) dengan z-index di belakang layar
  // agar html2canvas dapat merender setiap pixel & font secara akurat
  const stage = document.createElement('div');
  stage.id = 'pdf-render-stage';
  stage.style.position = 'fixed';
  stage.style.top = '0';
  stage.style.left = '0';
  stage.style.width = '800px';
  stage.style.zIndex = '-9999';
  stage.style.opacity = '1';
  stage.style.pointerEvents = 'none';
  stage.style.backgroundColor = '#ffffff';
  stage.appendChild(clone);
  document.body.appendChild(stage);

  if (onProgress) onProgress(20);

  try {
    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    const opt = {
      margin: [10, 8, 10, 8] as [number, number, number, number],
      filename: cleanFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
      },
    };

    if (onProgress) onProgress(45);

    // Dapatkan Blob PDF secara langsung
    // @ts-ignore
    const pdfWorker = html2pdf().set(opt).from(clone);
    const pdfBlob: Blob = await pdfWorker.outputPdf('blob');

    if (onProgress) onProgress(80);

    // Unduh dengan penahan Object URL agar tidak dibatalkan browser
    safeDownloadBlob(pdfBlob, cleanFilename);

    if (onProgress) onProgress(100);
    return pdfBlob;
  } finally {
    if (stage.parentNode) {
      stage.parentNode.removeChild(stage);
    }
  }
}

/**
 * Mencetak dokumen secara langsung via browser
 */
export function triggerBrowserPrint(): void {
  try {
    window.print();
  } catch (err) {
    console.warn('Direct window.print() gagal:', err);
  }
}
