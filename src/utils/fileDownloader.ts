/**
 * Utilitas Terpadu & Tahan Kegagalan untuk Cetak dan Unduh Dokumen
 * Menangani lingkungan iFrame, pembatasan sandbox browser, serta mencegah pemutusan URL blob prematur.
 */

import { escapeHtml } from './htmlEscape';

/**
 * Unduh blob secara aman dengan menjaga Object URL tetap aktif di memori
 * sampai browser selesai mengunduh (bukan langsung dihapus/revoked).
 */
export function safeDownloadBlob(blob: Blob, filename: string): boolean {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.setAttribute('download', filename);
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);

    // Memicu klik unduh
    link.click();

    // Jangan cabut URL seketika! Beri waktu 90 detik agar browser selesai mengunduh
    setTimeout(() => {
      try {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        URL.revokeObjectURL(url);
      } catch (err) {
        console.warn('Gagal membersihkan blob URL:', err);
      }
    }, 90000);

    return true;
  } catch (err) {
    console.error('safeDownloadBlob gagal:', err);
    return false;
  }
}

/**
 * Unduh konten teks/HTML/Doc ke berkas komputer pengguna
 */
export function safeDownloadTextFile(
  content: string,
  filename: string,
  mimeType = 'application/msword;charset=utf-8'
): boolean {
  try {
    // Sisipkan BOM UTF-8 (\ufeff) agar MS Word membaca aksen & karakter Indonesia dengan benar
    const blob = new Blob(['\ufeff' + content], { type: mimeType });
    const success = safeDownloadBlob(blob, filename);

    if (!success) {
      // Fallback menggunakan Data URI jika Blob URL dibatasi oleh sandbox iframe
      const encoded = encodeURIComponent(content);
      const dataUri = `data:${mimeType},${encoded}`;
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
      }, 5000);
      return true;
    }
    return true;
  } catch (err) {
    console.error('safeDownloadTextFile gagal:', err);
    return false;
  }
}

/**
 * Membuka jendela khusus pencetakan A4 yang bebas dari batas iframe
 * Dilengkapi tombol cetak manual jika dialog cetak otomatis terhambat oleh browser
 */
export function openPrintWindow(htmlContent: string, title = 'Cetak Dokumen Resmi', paperSize: 'A4' | 'F4' = 'A4'): Window | null {
  try {
    const printWindow = window.open('', '_blank', 'width=900,height=800,menubar=no,toolbar=no,location=no,status=no');
    
    if (!printWindow) {
      return null;
    }

    const safeTitle = escapeHtml(title);
    const pageSize = paperSize === 'F4' ? '215mm 330mm' : 'A4 portrait';
    const sheetWidth = paperSize === 'F4' ? '215mm' : '210mm';
    const sheetMinHeight = paperSize === 'F4' ? '330mm' : '297mm';

    // Ekstrak gaya khusus (<style>) dan konten <body> jika htmlContent adalah dokumen HTML lengkap
    let contentBody = htmlContent;
    let extractedStyles = '';

    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let styleMatch;
    while ((styleMatch = styleRegex.exec(htmlContent)) !== null) {
      extractedStyles += styleMatch[1] + '\n';
    }

    const bodyRegex = /<body[^>]*>([\s\S]*?)<\/body>/i;
    const bodyMatch = bodyRegex.exec(htmlContent);
    if (bodyMatch) {
      contentBody = bodyMatch[1];
    } else {
      // Bersihkan tag pembungkus luar jika ada
      contentBody = contentBody
        .replace(/<!DOCTYPE[^>]*>/gi, '')
        .replace(/<\/?html[^>]*>/gi, '')
        .replace(/<head[\s\S]*?<\/head>/gi, '')
        .replace(/<\/?body[^>]*>/gi, '');
    }

    const styledHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    @page {
      size: ${pageSize};
      margin: 12mm 12mm 12mm 12mm;
    }
    body {
      margin: 0;
      padding: 20px;
      background: #f1f5f9;
      font-family: Arial, Helvetica, 'Times New Roman', Times, sans-serif;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #1e293b;
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    }
    .toolbar button {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      transition: background 0.15s;
    }
    .toolbar button:hover {
      background: #4338ca;
    }
    .toolbar button.btn-close {
      background: #475569;
    }
    .toolbar button.btn-close:hover {
      background: #334155;
    }
    .sheet-wrapper {
      background: white;
      width: ${sheetWidth};
      min-height: auto;
      padding: 16mm 14mm;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      box-sizing: border-box;
      margin-bottom: 30px;
    }
    ${extractedStyles}
    @media print {
      body {
        background: white !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .toolbar {
        display: none !important;
      }
      .sheet-wrapper {
        width: 100% !important;
        min-height: auto !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
      }
      .page-break {
        page-break-before: always !important;
        break-before: page !important;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span><strong>${safeTitle}</strong> &mdash; Pratinjau Cetak Siap ${paperSize}</span>
    <button onclick="window.print()" title="Cetak ke Printer atau Simpan sebagai PDF">
      🖨️ Cetak / Simpan PDF
    </button>
    <button class="btn-close" onclick="window.close()">✕ Tutup Tab</button>
  </div>
  <div class="sheet-wrapper">
    ${contentBody}
  </div>

  <script>
    // Jalankan dialog cetak otomatis saat halaman termuat
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 400);
    });
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(styledHtml);
    printWindow.document.close();
    return printWindow;
  } catch (err) {
    console.error('Gagal membuka jendela cetak:', err);
    return null;
  }
}
