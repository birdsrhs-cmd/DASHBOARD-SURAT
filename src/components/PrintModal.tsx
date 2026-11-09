import React, { useState, useEffect } from 'react';
import {
  Printer,
  FileDown,
  ExternalLink,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Download,
  HelpCircle,
} from 'lucide-react';
import { isIframeEnvironment, downloadElementAsPdf, triggerBrowserPrint } from '../utils/printUtils';
import { openPrintWindow } from '../utils/fileDownloader';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'phk' | 'disnaker' | 'late-permit' | 'bpjs-amalgamasi';
  documentTitle: string;
  targetElementId: string;
  defaultFilename: string;
  onDownloadDoc: () => void;
  getPrintableHtml: () => string;
  onShowToast: (message: string) => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  documentType,
  documentTitle,
  targetElementId,
  defaultFilename,
  onDownloadDoc,
  getPrintableHtml,
  onShowToast,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [inIframe, setInIframe] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);
  const [lastDownloadedPdfName, setLastDownloadedPdfName] = useState<string>('');
  const [popoverBlocked, setPopoverBlocked] = useState(false);
  const [directPrintUrl, setDirectPrintUrl] = useState<string | null>(null);

  useEffect(() => {
    setInIframe(isIframeEnvironment());
    setPdfDownloadUrl(null);
    setPopoverBlocked(false);
  }, [isOpen]);

  // Cabut Object URL lama agar tidak menumpuk di memori
  useEffect(() => {
    return () => {
      if (pdfDownloadUrl) URL.revokeObjectURL(pdfDownloadUrl);
    };
  }, [pdfDownloadUrl]);

  useEffect(() => {
    return () => {
      if (directPrintUrl) URL.revokeObjectURL(directPrintUrl);
    };
  }, [directPrintUrl]);

  if (!isOpen) return null;

  // 1. Rekomendasi Utama: Buka Halaman Cetak Siap A4/F4 di Tab Baru
  const handleOpenPrintWindow = () => {
    try {
      const htmlContent = getPrintableHtml();
      const paperSize = documentType === 'disnaker' ? 'F4' : 'A4';
      const printWin = openPrintWindow(htmlContent, documentTitle, paperSize);

      if (printWin) {
        onShowToast(`Jendela cetak ${paperSize} berhasil dibuka di tab baru.`);
        setPopoverBlocked(false);
      } else {
        // Pop-up diblokir oleh browser
        setPopoverBlocked(true);
        // Buat blob URL langsung untuk tautan klik manual
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        setDirectPrintUrl(url);
        onShowToast('Pop-up browser terblokir. Gunakan tombol tautan langsung di bawah.');
      }
    } catch (err) {
      console.error('Gagal membuka jendela cetak:', err);
      onShowToast('Gagal memproses tampilan cetak. Gunakan opsi Cetak Halaman atau Unduh Word.');
    }
  };

  // 2. Cetak Langsung Browser (Ctrl + P)
  const handleDirectPrint = () => {
    onClose();
    setTimeout(() => {
      triggerBrowserPrint();
      onShowToast('Perintah cetak browser dipanggil (Ctrl + P).');
    }, 150);
  };

  // 3. Unduh Berkas PDF (.pdf) Otomatis
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    setPdfDownloadUrl(null);
    try {
      const cleanName = defaultFilename.endsWith('.pdf') ? defaultFilename : `${defaultFilename}.pdf`;
      const pdfBlob = await downloadElementAsPdf(targetElementId, defaultFilename);
      const url = URL.createObjectURL(pdfBlob);
      setPdfDownloadUrl(url);
      setLastDownloadedPdfName(cleanName);
      onShowToast(`Berkas PDF "${cleanName}" berhasil diproses dan diunduh.`);
    } catch (err) {
      console.error('PDF generation error:', err);
      onShowToast('Gagal memproses PDF via canvas. Silakan gunakan tombol "Buka & Cetak di Tab Baru" atau "Unduh Word".');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // 4. Unduh Dokumen Word (.doc)
  const handleDownloadWord = () => {
    onDownloadDoc();
    onShowToast('Berkas Microsoft Word (.doc) berhasil diunduh ke komputer Anda.');
  };

  // 5. Buka Tab Baru Aplikasi Penuh
  const handleOpenNewAppTab = () => {
    try {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
      onShowToast('Aplikasi dibuka di tab baru.');
    } catch (err) {
      console.error('Open window blocked:', err);
      onShowToast('Pop-up terblokir. Buka URL aplikasi di tab peramban baru.');
    }
  };

  const getDocTypeLabel = () => {
    switch (documentType) {
      case 'phk':
        return 'Surat Pemberitahuan PHK (PP 35/2021)';
      case 'disnaker':
        return 'Surat Laporan PHK Disnaker Resmi';
      case 'late-permit':
        return 'Formulir Surat Izin Masuk Terlambat';
      case 'bpjs-amalgamasi':
        return 'Formulir Permintaan Penggabungan Saldo BPJS (FM/KC/01/02/005)';
      default:
        return 'Dokumen Resmi HRD';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs no-print animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="print-options-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col"
      >
        {/* Header Modal */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Printer className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Cetak & Unduh Dokumen Resmi</h3>
              <p className="text-xs text-indigo-200 mt-0.5">{getDocTypeLabel()}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Opsi */}
        <div className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {/* Banner Bantuan jika iframe terdeteksi */}
          {inIframe && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-semibold block text-amber-950">
                  Tips Pencetakan & Pengunduhan:
                </strong>
                Gunakan <strong>Pilihan 1 (Cetak di Tab Baru)</strong> untuk hasil cetak dokumen paling rapi dan jernih, atau <strong>Unduh Word (.doc)</strong> untuk berkas fisik yang dapat langsung diedit di komputer.
              </div>
            </div>
          )}

          {/* OPSI 1: Buka & Cetak di Tab Baru (Paling Direkomendasikan) */}
          <div className="p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3 min-w-0">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    1. Buka & Cetak di Tab Baru
                  </h4>
                  <span className="text-3xs font-bold uppercase tracking-wider px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                    Rekomendasi
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-normal">
                  Membuka tampilan dokumen bersih di tab baru dengan dialog cetak otomatis. Anda dapat langsung memilih printer atau <strong>Simpan sebagai PDF</strong> kualitas tinggi.
                </p>
              </div>
            </div>
            <button
              type="button"
              id="modal-btn-open-print-win"
              onClick={handleOpenPrintWindow}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka & Cetak</span>
            </button>
          </div>

          {/* Fallback Tautan Langsung jika browser memblokir pop-up */}
          {popoverBlocked && directPrintUrl && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
              <span className="font-medium">Tautan alternatif dokumen:</span>
              <a
                href={directPrintUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center space-x-1"
              >
                <span>Buka Dokumen Cetak</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* OPSI 2: Unduh Dokumen Word (.doc) */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50/70 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3 min-w-0">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    2. Unduh Dokumen Word (.doc)
                  </h4>
                  <span className="text-3xs font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                    Bisa Diedit
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-normal">
                  Format resmi Microsoft Word / LibreOffice dengan kop surat, tabel kompensasi, dan kolom tanda tangan lengkap.
                </p>
              </div>
            </div>
            <button
              type="button"
              id="modal-btn-download-word"
              onClick={handleDownloadWord}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Word</span>
            </button>
          </div>

          {/* OPSI 3: Unduh Berkas PDF Langsung (.pdf) */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3 min-w-0">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  3. Unduh Berkas PDF (.pdf)
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-normal">
                  Konversi lembar dokumen pratinjau menjadi berkas PDF siap kirim tanpa membuka aplikasi lain.
                </p>
              </div>
            </div>
            <button
              type="button"
              id="modal-btn-download-pdf"
              disabled={isDownloadingPdf}
              onClick={handleDownloadPdf}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 shrink-0"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Unduh PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Tautan Tambahan jika PDF berhasil diproses */}
          {pdfDownloadUrl && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
              <span className="font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>PDF Siap ({lastDownloadedPdfName})</span>
              </span>
              <a
                href={pdfDownloadUrl}
                download={lastDownloadedPdfName}
                className="px-3 py-1 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition flex items-center space-x-1"
              >
                <span>Unduh Ulang</span>
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* OPSI 4: Cetak Layar Saat Ini (Ctrl + P) */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 transition flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 min-w-0">
              <Printer className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="text-xs text-slate-600">
                <strong className="text-slate-800 font-semibold block">Cetak Halaman Aplikasi Langsung (Ctrl + P)</strong>
                Mencetak tampilan halaman saat ini menggunakan dialog bawaan peramban.
              </div>
            </div>
            <button
              type="button"
              id="modal-btn-page-print"
              onClick={handleDirectPrint}
              className="px-3 py-1.5 border border-slate-300 hover:bg-white text-slate-700 text-xs font-medium rounded-lg transition flex items-center space-x-1 shrink-0"
            >
              <span>Cetak Layar</span>
            </button>
          </div>

          {/* OPSI 5: Buka Tab Penuh */}
          {inIframe && (
            <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs text-slate-600">
              <span>Buka aplikasi di tab baru browser bebas frame:</span>
              <button
                type="button"
                onClick={handleOpenNewAppTab}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
              >
                <span>Buka Tab Baru</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-2xs text-slate-500">
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Format Resmi Terverifikasi Regulasi Ketenagakerjaan RI</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-slate-600 hover:text-slate-900 font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
