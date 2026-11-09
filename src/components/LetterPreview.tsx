import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Building,
  FileCheck,
  Image as ImageIcon,
  Expand,
  FileText,
  ShieldCheck,
  ChevronRight,
  Stamp,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { CompanyProfile, LetterData } from '../types';
import { DEFAULT_COMPANY } from '../data/presets';
import { formatCurrencyIDR, formatIndonesianDate } from '../utils/dateUtils';
import { MeteraiBox } from './MeteraiBox';

interface LetterPreviewProps {
  letter: LetterData;
  company?: CompanyProfile;
  onPrint: () => void;
  onDownloadDoc: () => void;
  onCopyText: () => void;
  copied: boolean;
  onOpenLogoModal?: () => void;
}

export const LetterPreview: React.FC<LetterPreviewProps> = ({
  letter,
  company: propCompany,
  onPrint,
  onDownloadDoc,
  onCopyText,
  copied,
  onOpenLogoModal,
}) => {
  const company = propCompany || DEFAULT_COMPANY;
  const [zoom, setZoom] = useState<number>(85);
  const [activePageTab, setActivePageTab] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetContainerRef = useRef<HTMLDivElement>(null);
  const [naturalHeight, setNaturalHeight] = useState<number>(1200);

  // Perhitungan auto-fit ke lebar kontainer
  const handleFitWidth = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    // Berikan ruang padding 40px di sekeliling kertas
    const availableWidth = Math.max(280, containerWidth - 48);
    const calculated = Math.min(120, Math.max(40, Math.floor((availableWidth / 794) * 100)));
    setZoom(calculated);
  };

  // Auto-fit saat pertama render dan saat resize jendela
  useEffect(() => {
    handleFitWidth();

    const handleResize = () => {
      handleFitWidth();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hitung tinggi alami dari isi dokumen untuk container scaling
  useEffect(() => {
    if (!sheetContainerRef.current) return;
    const updateHeight = () => {
      if (sheetContainerRef.current) {
        setNaturalHeight(sheetContainerRef.current.scrollHeight || 1200);
      }
    };
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(sheetContainerRef.current);
    return () => observer.disconnect();
  }, [letter, company]);

  const totalComp =
    (letter.compensation.severancePay || 0) +
    (letter.compensation.serviceRewardPay || 0) +
    (letter.compensation.rightsCompensationPay || 0) +
    (letter.compensation.otherAllowances || 0);

  const hasPage2 = Boolean(letter.compensation.includeCompensation);
  const hasPage3 = Boolean(letter.includeReceiptForm);
  const totalPages = 1 + (hasPage2 ? 1 : 0) + (hasPage3 ? 1 : 0);

  // Scroll halus ke halaman yang dipilih
  const scrollToPage = (pageNumber: number) => {
    setActivePageTab(pageNumber);
    const targetElement = document.getElementById(`doc-page-${pageNumber}`);
    if (targetElement && containerRef.current) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getStatusBadge = () => {
    switch (letter.status) {
      case 'draft':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs sm:text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
      case 'terkirim':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs sm:text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Terkirim</span>;
      case 'disetujui':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Disetujui</span>;
      case 'ditolak':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs sm:text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Bipartit</span>;
      case 'selesai':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs sm:text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Selesai</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-200/80 rounded-2xl border border-slate-300/70 overflow-hidden shadow-xs">
      
      {/* Top Toolbar Pratinjau Dokumen */}
      <div className="bg-white border-b border-slate-200/90 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 no-print z-20 shrink-0 shadow-2xs">
        
        {/* Sisi Kiri: Info Halaman & Status */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-xs uppercase tracking-wider">
            <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline">Pratinjau A4</span>
          </div>
          {getStatusBadge()}
          <span className="text-3xs sm:text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {totalPages} Halaman
          </span>
        </div>

        {/* Tengah: Navigasi Cepat Antar Halaman */}
        <div className="flex items-center space-x-1 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200 text-3xs sm:text-xs font-medium">
          <button
            type="button"
            onClick={() => scrollToPage(1)}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
              activePageTab === 1
                ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Hal 1: Surat</span>
          </button>
          
          {hasPage2 && (
            <button
              type="button"
              onClick={() => scrollToPage(2)}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                activePageTab === 2
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Hal 2: Rincian</span>
            </button>
          )}

          {hasPage3 && (
            <button
              type="button"
              onClick={() => scrollToPage(hasPage2 ? 3 : 2)}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                activePageTab === (hasPage2 ? 3 : 2)
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Hal {hasPage2 ? '3' : '2'}: Tanda Terima</span>
            </button>
          )}
        </div>

        {/* Sisi Kanan: Kontrol Zoom & Tindakan Cepat */}
        <div className="flex items-center space-x-1.5">
          {/* Kontrol Zoom */}
          <div className="flex items-center space-x-0.5 bg-slate-100 rounded-lg p-0.5 text-xs border border-slate-200">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(40, prev - 10))}
              className="p-1 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title="Perkecil (-10%)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 font-semibold text-slate-700 min-w-[36px] text-center text-3xs sm:text-xs">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(130, prev + 10))}
              className="p-1 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title="Perbesar (+10%)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFitWidth}
              className="px-1.5 py-0.5 rounded-md hover:bg-white text-indigo-700 font-bold text-3xs transition-colors flex items-center space-x-0.5"
              title="Paskan Lebar Layar (Auto-Fit)"
            >
              <Expand className="w-3 h-3 text-indigo-600" />
              <span className="hidden xl:inline">Paskan</span>
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="p-1 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title="Ukuran Asli 100%"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tombol Salin */}
          <button
            type="button"
            onClick={onCopyText}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all flex items-center space-x-1 shadow-2xs"
            title="Salin Teks Lengkap Dokumen"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden xl:inline">{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          {/* Tombol Unduh Word */}
          <button
            type="button"
            onClick={onDownloadDoc}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all flex items-center space-x-1 shadow-2xs"
            title="Unduh Dokumen Format Microsoft Word (.doc)"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xl:inline">Word</span>
          </button>

          {/* Tombol Cetak / PDF */}
          <button
            type="button"
            onClick={onPrint}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center space-x-1.5 shadow-xs"
            title="Cetak Fisik atau Simpan sebagai PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak/PDF</span>
          </button>
        </div>
      </div>

      {/* Sheet Container: Meja Kerja Virtual dengan Kertas A4 Otentik */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex justify-center items-start bg-slate-200/80"
      >
        <div
          style={{
            width: `${Math.round(794 * (zoom / 100))}px`,
            minHeight: `${Math.round(naturalHeight * (zoom / 100))}px`,
          }}
          className="relative transition-all duration-100 ease-out flex flex-col items-center print:w-full print:min-h-0 print:block print:m-0 print:p-0 print-preview-container"
        >
          <div
            ref={sheetContainerRef}
            id="printable-letter"
            style={{
              width: '794px',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
            className="flex flex-col space-y-8 print:w-full print:space-y-0 print:m-0 print:p-0"
          >

            {/* =======================================================
                HALAMAN 1: SURAT PEMBERITAHUAN UTAMA
            ======================================================= */}
            <div
              id="doc-page-1"
              className="a4-sheet bg-white text-slate-900 shadow-xl border border-slate-300/80 rounded-xs p-10 sm:p-14 text-[13.5px] leading-relaxed font-serif relative flex flex-col justify-between"
              style={{ minHeight: '1123px' }}
            >
              <div>
                {/* Lencana Layar Halaman 1 */}
                <div className="no-print -mt-6 -mx-10 sm:-mx-14 mb-6 bg-slate-50 border-b border-slate-200/80 px-4 py-1.5 flex items-center justify-between text-3xs font-sans text-slate-500">
                  <span className="font-semibold text-indigo-700 flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>Halaman 1 dari {totalPages} — Surat Pemberitahuan Utama</span>
                  </span>
                  <span>Standar A4 (210 × 297 mm)</span>
                </div>

                {/* KOP SURAT RESMI */}
                <div className="mb-4 relative group/kop">
                  {company.kopAlignment === 'left' ? (
                    /* Layout Rata Kiri Modern */
                    <div className="flex items-center space-x-4">
                      {company.showLogo !== false && company.logoUrl && (
                        <div
                          style={{
                            minWidth: `${Math.max(company.logoSize || 64, 60)}px`,
                            maxWidth: `${Math.max((company.logoSize || 64) * 2, 120)}px`,
                          }}
                          className="relative group shrink-0 flex items-center justify-center"
                        >
                          <div
                            style={{
                              maxHeight: `${company.logoSize || 64}px`,
                              maxWidth: '100%',
                            }}
                            className={`flex items-center justify-center transition-all ${
                              company.logoShape === 'circle'
                                ? 'w-16 h-16 rounded-full overflow-hidden border border-slate-300 bg-white p-1'
                                : company.logoShape === 'bordered'
                                ? 'rounded-lg border-2 border-slate-300 bg-white p-1.5 shadow-xs'
                                : company.logoShape === 'rounded'
                                ? 'rounded-xl border border-slate-200 bg-slate-50/50 p-1'
                                : 'bg-transparent'
                            }`}
                          >
                            <img
                              src={company.logoUrl}
                              alt="Logo Perusahaan"
                              style={{
                                maxHeight: `${company.logoSize || 64}px`,
                                maxWidth: '100%',
                              }}
                              className="object-contain"
                            />
                          </div>

                          {onOpenLogoModal && (
                            <button
                              type="button"
                              onClick={onOpenLogoModal}
                              title="Edit Logo Perusahaan"
                              className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity no-print z-10"
                            >
                              <ImageIcon className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}

                      <div className="text-left flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-950 font-serif leading-tight">
                          {company.name}
                        </h2>
                        {company.subName && (
                          <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-800 font-sans mt-0.5 uppercase">
                            {company.subName}
                          </p>
                        )}
                        <p className="text-xs text-slate-700 font-sans mt-1 leading-snug">
                          {[company.address, company.city].filter(Boolean).join(', ')}{company.postalCode ? ` ${company.postalCode}` : ''}
                        </p>
                        <p className="text-2xs sm:text-xs text-slate-600 font-sans leading-snug mt-0.5">
                          Telp: {company.phone} | Email: {company.email} {company.website ? `| Web: ${company.website}` : ''}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Layout Simetris Tengah Klasik (Baku Tata Naskah Indonesia) */
                    <div className="flex items-center justify-between">
                      {/* Kolom Kiri: Logo Resmi (Lebar Terukur Presisi) */}
                      <div
                        style={{
                          width: company.showLogo !== false && company.logoUrl ? `${Math.max((company.logoSize || 64) + 16, 80)}px` : '0px',
                          minWidth: company.showLogo !== false && company.logoUrl ? `${Math.max((company.logoSize || 64) + 16, 80)}px` : '0px',
                        }}
                        className="shrink-0 flex items-center justify-start relative group"
                      >
                        {company.showLogo !== false && company.logoUrl && (
                          <>
                            <div
                              style={{
                                maxHeight: `${company.logoSize || 64}px`,
                                maxWidth: '100%',
                              }}
                              className={`flex items-center justify-center transition-all ${
                                company.logoShape === 'circle'
                                  ? 'w-16 h-16 rounded-full overflow-hidden border border-slate-300 bg-white p-1'
                                  : company.logoShape === 'bordered'
                                  ? 'rounded-lg border-2 border-slate-300 bg-white p-1.5 shadow-xs'
                                  : company.logoShape === 'rounded'
                                  ? 'rounded-xl border border-slate-200 bg-slate-50/50 p-1'
                                  : 'bg-transparent'
                              }`}
                            >
                              <img
                                src={company.logoUrl}
                                alt="Logo Perusahaan"
                                style={{
                                  maxHeight: `${company.logoSize || 64}px`,
                                  maxWidth: '100%',
                                }}
                                className="object-contain"
                              />
                            </div>

                            {/* Tombol Cepat Edit Logo */}
                            {onOpenLogoModal && (
                              <button
                                type="button"
                                onClick={onOpenLogoModal}
                                title="Edit Logo Perusahaan"
                                className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity no-print z-10"
                              >
                                <ImageIcon className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Kolom Tengah: Identitas Perusahaan (100% Simetris Presisi di Titik Tengah Kertas A4) */}
                      <div className="text-center flex-1 min-w-0 px-2">
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-950 font-serif leading-tight">
                          {company.name}
                        </h2>
                        {company.subName && (
                          <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-800 font-sans mt-0.5 uppercase">
                            {company.subName}
                          </p>
                        )}
                        <p className="text-xs text-slate-700 font-sans mt-1 leading-snug">
                          {[company.address, company.city].filter(Boolean).join(', ')}{company.postalCode ? ` ${company.postalCode}` : ''}
                        </p>
                        <p className="text-2xs sm:text-xs text-slate-600 font-sans leading-snug mt-0.5">
                          Telp: {company.phone} | Email: {company.email} {company.website ? `| Web: ${company.website}` : ''}
                        </p>
                      </div>

                      {/* Kolom Kanan: Penyeimbang Simetris Presisi (Lebar Persis Sama dengan Kolom Kiri) */}
                      <div
                        style={{
                          width: company.showLogo !== false && company.logoUrl ? `${Math.max((company.logoSize || 64) + 16, 80)}px` : '0px',
                          minWidth: company.showLogo !== false && company.logoUrl ? `${Math.max((company.logoSize || 64) + 16, 80)}px` : '0px',
                        }}
                        className="shrink-0 pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  {/* GARIS PEMBATAS KOP SURAT STANDAR DINAS */}
                  {company.kopBorder === 'single' ? (
                    <div className="mt-3 mb-5 border-b-[2px] border-slate-950" />
                  ) : company.kopBorder === 'bold' ? (
                    <div className="mt-3 mb-5 border-b-[3.5px] border-slate-950" />
                  ) : company.kopBorder === 'none' ? (
                    <div className="mt-3 mb-4" />
                  ) : (
                    /* Garis Ganda Klasik: Tebal + Celah + Tipis */
                    <div className="mt-3 mb-5 space-y-[2px]" aria-hidden="true">
                      <div className="h-[2.5px] bg-slate-950 w-full"></div>
                      <div className="h-[0.75px] bg-slate-950 w-full"></div>
                    </div>
                  )}
                </div>

                {/* JUDUL & NOMOR SURAT */}
                <div className="text-center my-5">
                  <h3 className="text-base sm:text-lg font-bold underline uppercase tracking-wide text-slate-950">
                    SURAT PEMBERITAHUAN PEMUTUSAN HUBUNGAN KERJA
                  </h3>
                  <p className="text-xs sm:text-sm font-sans mt-1 text-slate-800">
                    Nomor : {letter.letterNumber || '-'}
                  </p>
                </div>

                {/* META SURAT */}
                <div className="mb-4">
                  <table className="w-full text-xs sm:text-sm">
                    <tbody>
                      <tr>
                        <td className="w-24 align-top py-0.5 text-slate-800">Lampiran</td>
                        <td className="w-4 align-top py-0.5 text-center">:</td>
                        <td className="align-top py-0.5 text-slate-900">{letter.attachments || '-'}</td>
                      </tr>
                      <tr>
                        <td className="w-24 align-top py-0.5 text-slate-800">Perihal</td>
                        <td className="w-4 align-top py-0.5 text-center">:</td>
                        <td className="align-top py-0.5 font-bold text-slate-950">
                          {letter.subject || 'Pemberitahuan Pemutusan Hubungan Kerja'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* TUJUAN SURAT (KEPADA YTH) */}
                <div className="mb-5 text-xs sm:text-sm">
                  <p className="text-slate-800">Kepada Yth.</p>
                  <p className="font-bold text-slate-950">
                    Sdr/Sdri {letter.recipientName || letter.employeeName || '........................................'}
                  </p>
                  <p className="text-slate-800">
                    di {letter.recipientAddress || 'Tempat'}
                  </p>
                </div>

                {/* TEKS PEMBUKA */}
                <p className="mb-2.5 text-xs sm:text-sm text-justify">
                  Dengan hormat,
                </p>
                <p className="mb-2 text-xs sm:text-sm text-justify">
                  Yang bertanda tangan di bawah ini:
                </p>

                {/* PIHAK PERTAMA (PEMBERI KERJA) */}
                <div className="mb-3.5 ml-2 sm:ml-4">
                  <table className="w-full text-xs sm:text-sm">
                    <tbody>
                      <tr>
                        <td className="w-44 sm:w-52 align-top py-0.5 text-slate-800">Nama</td>
                        <td className="w-4 align-top py-0.5 text-center">:</td>
                        <td className="align-top py-0.5 font-bold text-slate-950">
                          {letter.signatoryName || '........................................'}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-44 sm:w-52 align-top py-0.5 text-slate-800">Jabatan</td>
                        <td className="w-4 align-top py-0.5 text-center">:</td>
                        <td className="align-top py-0.5 text-slate-900">
                          {letter.signatoryPosition || '........................................'}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-44 sm:w-52 align-top py-0.5 text-slate-800">Bertindak untuk dan atas nama</td>
                        <td className="w-4 align-top py-0.5 text-center">:</td>
                        <td className="align-top py-0.5 font-bold text-slate-950 uppercase tracking-wide">
                          {letter.signatoryCompany || company.name}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="mb-2 text-xs sm:text-sm text-justify">
                  Dengan ini memberitahukan kepada Saudara/Saudari:
                </p>

                {/* PIHAK KEDUA (PEKERJA) */}
                <div className="mb-4 ml-2 sm:ml-4">
                  <table className="w-full text-xs sm:text-sm">
                    <tbody>
                      <tr>
                        <td className="w-44 sm:w-52 align-top py-0.5 text-slate-800">Nama</td>
                        <td className="w-4 align-top py-0.5 text-center">:</td>
                        <td className="align-top py-0.5 font-bold text-slate-950">
                          {letter.employeeName || '........................................'}
                        </td>
                      </tr>
                      {letter.employeeId && (
                        <tr>
                          <td className="w-44 sm:w-52 align-top py-0.5 text-slate-800">Nomor Induk Karyawan (NIK)</td>
                          <td className="w-4 align-top py-0.5 text-center">:</td>
                          <td className="align-top py-0.5 text-slate-900">{letter.employeeId}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="w-44 sm:w-52 align-top py-0.5 text-slate-800">Jabatan</td>
                        <td className="w-4 align-top py-0.5 text-center">:</td>
                        <td className="align-top py-0.5 text-slate-900">
                          {letter.employeePosition || '........................................'}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-44 sm:w-52 align-top py-0.5 text-slate-800">Unit Kerja/Divisi</td>
                        <td className="w-4 align-top py-0.5 text-center">:</td>
                        <td className="align-top py-0.5 text-slate-900">
                          {letter.employeeDepartment || '........................................'}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-44 sm:w-52 align-top py-0.5 text-slate-800">Status Hubungan Kerja</td>
                        <td className="w-4 align-top py-0.5 text-center">:</td>
                        <td className="align-top py-0.5 text-slate-900">
                          {letter.pkwttInfo || 'PKWTT (Karyawan Tetap)'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* PARAGRAF ALASAN ("BAHWA :") */}
                <div className="mb-3.5">
                  <p className="font-bold text-xs sm:text-sm text-slate-950 mb-1">
                    Bahwa :
                  </p>
                  <p className="text-xs sm:text-sm text-justify leading-relaxed pl-2 sm:pl-4 text-slate-900">
                    {letter.reasonText || '................................................................................................................................................................................................................................................................'}
                  </p>
                </div>

                {/* TANGGAL EFEKTIF */}
                {letter.effectiveDate && (
                  <p className="mb-3 text-xs sm:text-sm text-justify leading-relaxed text-slate-900">
                    Berdasarkan pertimbangan tersebut di atas, Pemutusan Hubungan Kerja (PHK) terhadap Saudara/Saudari dinyatakan efektif berlaku terhitung sejak tanggal{' '}
                    <strong className="text-slate-950">{formatIndonesianDate(letter.effectiveDate)}</strong>.
                  </p>
                )}

                {/* KLAUSUL STATUTORI PP NO. 35/2021 */}
                <div className="mb-4 p-3 bg-slate-50/80 border-l-3 border-indigo-600 rounded-r text-xs sm:text-sm text-justify leading-relaxed text-slate-900 font-sans">
                  {letter.statutoryClause}
                </div>

                <p className="mb-4 text-xs sm:text-sm text-justify text-slate-900">
                  Atas perhatian dan kerja sama Saudara/Saudari selama ini, kami ucapkan terima kasih.
                </p>

                {/* TANDA TANGAN PENANDATANGAN RESMI */}
                <div className="mt-6 flex justify-end">
                  <div className="text-center w-64 sm:w-72">
                    <p className="text-xs sm:text-sm text-slate-800 font-sans">
                      {letter.city || company.city}, {formatIndonesianDate(letter.letterDate)}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-950 font-serif mt-1 uppercase tracking-wide">
                      {letter.signatoryCompany || company.name}
                    </p>

                    {/* Box Meterai atau Ruang TTD */}
                    {letter.includeStampPlaceholder ? (
                      <div className="my-2.5 flex flex-col items-center justify-center">
                        <MeteraiBox type={letter.stampType || 'tempel'} />
                      </div>
                    ) : (
                      <div className="h-14"></div>
                    )}

                    <p className="text-xs sm:text-sm font-bold underline text-slate-950 font-serif">
                      {letter.signatoryName || '( ........................................ )'}
                    </p>
                    <p className="text-2xs sm:text-xs text-slate-700 font-sans mt-0.5">
                      {letter.signatoryPosition || 'HR & General Affairs'}
                    </p>
                  </div>
                </div>

                {/* TEMBUSAN (CARBON COPY) */}
                {letter.includeCarbonCopy !== false && letter.carbonCopy && letter.carbonCopy.filter(c => c.trim()).length > 0 && (
                  <div className="mt-6 pt-3 border-t border-slate-200 text-2xs sm:text-xs text-slate-700 font-sans">
                    <p className="font-semibold text-slate-900">{letter.carbonCopyTitle || 'Tembusan Yth:'}</p>
                    <ol className="list-decimal list-inside mt-0.5 space-y-0.5">
                      {letter.carbonCopy
                        .filter((cc) => cc.trim())
                        .map((cc, i) => (
                          <li key={i}>{cc}</li>
                        ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* FOOTER HALAMAN 1 */}
              <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-3xs text-slate-400 font-sans">
                <span>Surat Pemberitahuan PHK Sesuai PP No. 35 Tahun 2021</span>
                <span>Halaman 1 dari {totalPages}</span>
              </div>
            </div>

            {/* =======================================================
                HALAMAN 2: LAMPIRAN RINCIAN HAK PEKERJA
            ======================================================= */}
            {hasPage2 && (
              <div
                id="doc-page-2"
                className="a4-sheet bg-white text-slate-900 shadow-xl border border-slate-300/80 rounded-xs p-10 sm:p-14 text-[13.5px] leading-relaxed font-serif relative flex flex-col justify-between"
                style={{ minHeight: '1123px' }}
              >
                <div>
                  {/* Lencana Layar Halaman 2 */}
                  <div className="no-print -mt-6 -mx-10 sm:-mx-14 mb-6 bg-slate-50 border-b border-slate-200/80 px-4 py-1.5 flex items-center justify-between text-3xs font-sans text-slate-500">
                    <span className="font-semibold text-indigo-700 flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>Halaman 2 dari {totalPages} — Lampiran Rincian Hak Kompensasi</span>
                    </span>
                    <span>Standar A4 (210 × 297 mm)</span>
                  </div>

                  {/* HEADER LAMPIRAN */}
                  <div className="text-center mb-6 border-b border-slate-200 pb-3">
                    <p className="text-2xs font-bold text-indigo-700 uppercase tracking-widest font-sans mb-1">
                      {company.name}
                    </p>
                    <p className="text-xs font-bold text-slate-700 font-sans tracking-wide uppercase">
                      LAMPIRAN SURAT PEMBERITAHUAN PHK NOMOR: {letter.letterNumber || '-'}
                    </p>
                    <h4 className="text-sm sm:text-base font-bold underline uppercase text-slate-950 mt-1">
                      RINCIAN ESTIMASI HAK KOMPENSASI PEMUTUSAN HUBUNGAN KERJA
                    </h4>
                    <p className="text-2xs sm:text-xs text-slate-600 font-sans mt-0.5">
                      Berdasarkan Ketentuan Pasal 40 s.d. Pasal 59 Peraturan Pemerintah RI No. 35 Tahun 2021
                    </p>
                  </div>

                  {/* DATA PROFIL PEKERJA */}
                  <div className="mb-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 font-sans text-xs sm:text-sm">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <span className="text-slate-600">Nama Pekerja:</span>{' '}
                        <strong className="text-slate-900">{letter.employeeName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-600">Masa Kerja:</span>{' '}
                        <strong className="text-slate-900">
                          {letter.compensation.yearsOfService} Tahun {letter.compensation.monthsOfService} Bulan
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-600">Jabatan & Dept:</span>{' '}
                        <span className="text-slate-900">{letter.employeePosition} ({letter.employeeDepartment})</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Upah Terakhir:</span>{' '}
                        <strong className="text-slate-900">
                          {formatCurrencyIDR(letter.compensation.baseSalary)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* TABEL RINCIAN KOMPENSASI RESMI */}
                  <table className="w-full border-collapse border border-slate-300 font-sans text-xs sm:text-sm mb-4">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 p-2 text-center w-10">No</th>
                        <th className="border border-slate-300 p-2 text-left">Komponen Hak Pekerja</th>
                        <th className="border border-slate-300 p-2 text-right w-44">Jumlah Nominal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">1</td>
                        <td className="border border-slate-300 p-2">
                          <div className="font-semibold text-slate-900">Uang Pesangon (UP)</div>
                          <div className="text-2xs text-slate-500">Ketentuan masa kerja Pasal 40 ayat (2) PP 35/2021</div>
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-medium text-slate-900">
                          {formatCurrencyIDR(letter.compensation.severancePay)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">2</td>
                        <td className="border border-slate-300 p-2">
                          <div className="font-semibold text-slate-900">Uang Penghargaan Masa Kerja (UPMK)</div>
                          <div className="text-2xs text-slate-500">Ketentuan masa kerja Pasal 40 ayat (3) PP 35/2021</div>
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-medium text-slate-900">
                          {formatCurrencyIDR(letter.compensation.serviceRewardPay)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">3</td>
                        <td className="border border-slate-300 p-2">
                          <div className="font-semibold text-slate-900">Uang Penggantian Hak (UPH)</div>
                          <div className="text-2xs text-slate-500">Sisa hak cuti tahunan belum gugur & ongkos pemulangan (Pasal 40 ayat 4)</div>
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-medium text-slate-900">
                          {formatCurrencyIDR(letter.compensation.rightsCompensationPay)}
                        </td>
                      </tr>
                      {letter.compensation.otherAllowances ? (
                        <tr>
                          <td className="border border-slate-300 p-2 text-center">4</td>
                          <td className="border border-slate-300 p-2 font-semibold text-slate-900">
                            Tunjangan Tambahan / Kebijakan Perusahaan
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-medium text-slate-900">
                            {formatCurrencyIDR(letter.compensation.otherAllowances)}
                          </td>
                        </tr>
                      ) : null}
                      <tr className="bg-slate-100/80 font-bold">
                        <td colSpan={2} className="border border-slate-300 p-2.5 text-right text-slate-900">
                          TOTAL ESTIMASI HAK KOMPENSASI (BRUTO):
                        </td>
                        <td className="border border-slate-300 p-2.5 text-right text-indigo-900 text-sm">
                          {formatCurrencyIDR(totalComp)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {letter.compensation.notes && (
                    <p className="text-2xs text-slate-600 font-sans italic mb-4">
                      Catatan Perhitungan: {letter.compensation.notes}
                    </p>
                  )}

                  {/* KETENTUAN PEMBAYARAN */}
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 font-sans text-xs text-slate-700 mb-6">
                    <p className="font-semibold text-slate-900 mb-1">Mekanisme Pembayaran Hak Kompensasi:</p>
                    <p className="text-justify leading-relaxed text-2xs sm:text-xs">
                      Pembayaran hak kompensasi akan ditransfer ke rekening resmi pekerja setelah ditandatanganinya Berita Acara Kesepakatan Bersama (Bipartit) atau Lembar Persetujuan PHK secara lengkap.
                    </p>
                  </div>

                  {/* TANDA TANGAN LAMPIRAN GANDA */}
                  <div className="grid grid-cols-2 gap-4 text-center text-xs font-sans mt-8">
                    <div>
                      <p className="text-slate-700">Dihitung & Disiapkan oleh:</p>
                      <p className="font-bold text-slate-950 uppercase text-3xs sm:text-2xs">{company.name}</p>
                      <p className="text-2xs text-slate-600">Human Resources Department</p>
                      <div className="h-14"></div>
                      <p className="underline font-bold text-slate-900">{letter.signatoryName || 'HR Manager'}</p>
                    </div>
                    <div>
                      <p className="text-slate-700">Diterima & Diperiksa oleh:</p>
                      <p className="font-semibold text-slate-900">Pekerja Bersangkutan</p>
                      <div className="h-16"></div>
                      <p className="underline font-bold text-slate-900">{letter.employeeName}</p>
                    </div>
                  </div>
                </div>

                {/* FOOTER HALAMAN 2 */}
                <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-3xs text-slate-400 font-sans">
                  <span>Lampiran Hak Kompensasi PP No. 35 Tahun 2021</span>
                  <span>Halaman 2 dari {totalPages}</span>
                </div>
              </div>
            )}

            {/* =======================================================
                HALAMAN 3: LEMBAR TANDA TERIMA & PERNYATAAN TANGGAPAN
            ======================================================= */}
            {hasPage3 && (
              <div
                id="doc-page-3"
                className="a4-sheet bg-white text-slate-900 shadow-xl border border-slate-300/80 rounded-xs p-10 sm:p-14 text-[13.5px] leading-relaxed font-sans relative flex flex-col justify-between"
                style={{ minHeight: '1123px' }}
              >
                <div>
                  {/* Lencana Layar Halaman 3 */}
                  <div className="no-print -mt-6 -mx-10 sm:-mx-14 mb-6 bg-slate-50 border-b border-slate-200/80 px-4 py-1.5 flex items-center justify-between text-3xs font-sans text-slate-500">
                    <span className="font-semibold text-indigo-700 flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>Halaman {totalPages} dari {totalPages} — Lembar Tanda Terima & Tanggapan</span>
                    </span>
                    <span>Standar A4 (210 × 297 mm)</span>
                  </div>

                  {/* JUDUL LEMBAR TANDA TERIMA */}
                  <div className="text-center mb-6">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      LEMBAR TANDA TERIMA & PERNYATAAN TANGGAPAN PEKERJA
                    </p>
                    <h4 className="text-sm sm:text-base font-bold underline uppercase text-slate-950 mt-1">
                      SURAT PEMBERITAHUAN PHK (PASAL 38 & 39 PP 35/2021)
                    </h4>
                    <p className="text-2xs text-slate-600 mt-0.5">
                      Wajib dikembalikan kepada Manajemen HRD paling lambat 5 (lima) hari kerja sejak diterimanya surat
                    </p>
                  </div>

                  <p className="mb-2 text-xs sm:text-sm">Saya yang bertanda tangan di bawah ini:</p>
                  <div className="ml-4 mb-4 text-xs sm:text-sm">
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="w-44 py-0.5 text-slate-700">Nama Pekerja</td>
                          <td className="w-4 py-0.5 text-center">:</td>
                          <td className="py-0.5 font-bold text-slate-950">{letter.employeeName}</td>
                        </tr>
                        <tr>
                          <td className="w-44 py-0.5 text-slate-700">Jabatan / Divisi</td>
                          <td className="w-4 py-0.5 text-center">:</td>
                          <td className="py-0.5 text-slate-900">
                            {letter.employeePosition} / {letter.employeeDepartment}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="mb-2 text-xs sm:text-sm text-justify">
                    Menyatakan telah menerima secara langsung naskah Surat Pemberitahuan Pemutusan Hubungan Kerja Nomor:{' '}
                    <strong>{letter.letterNumber || '-'}</strong> dari Pihak Manajemen{' '}
                    <strong className="uppercase">{company.name}</strong> pada:
                  </p>

                  <div className="ml-4 mb-4 text-xs sm:text-sm">
                    <table>
                      <tbody>
                        <tr>
                          <td className="w-40 py-0.5 text-slate-700">Hari / Tanggal Diterima</td>
                          <td className="w-4 py-0.5 text-center">:</td>
                          <td className="py-0.5 text-slate-900">...........................................................................</td>
                        </tr>
                        <tr>
                          <td className="w-40 py-0.5 text-slate-700">Pukul / Jam</td>
                          <td className="w-4 py-0.5 text-center">:</td>
                          <td className="py-0.5 text-slate-900">...........................................................................</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* KOTAK PERNYATAAN PILIHAN SIKAP PEKERJA */}
                  <div className="border border-slate-300 rounded-lg p-3.5 mb-6 bg-slate-50/60">
                    <p className="font-bold text-slate-900 mb-2.5 text-xs sm:text-sm">
                      PERNYATAAN TANGGAPAN RESMI PEKERJA (Beri tanda centang salah satu):
                    </p>

                    <div className="space-y-3.5 pl-2">
                      <div className="flex items-start space-x-2.5">
                        <div className="w-4 h-4 border-2 border-slate-600 rounded-sm mt-0.5 shrink-0 bg-white"></div>
                        <div>
                          <span className="font-bold text-slate-950 text-xs sm:text-sm">MENYETUJUI / MENERIMA PHK</span>
                          <p className="text-2xs sm:text-xs text-slate-700 leading-relaxed mt-0.5">
                            Saya menyetujui Pemutusan Hubungan Kerja ini serta menerima rincian perhitungan hak kompensasi yang diberikan sesuai regulasi ketenagakerjaan yang berlaku.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2.5">
                        <div className="w-4 h-4 border-2 border-slate-600 rounded-sm mt-0.5 shrink-0 bg-white"></div>
                        <div>
                          <span className="font-bold text-slate-950 text-xs sm:text-sm">MENOLAK PHK & MEMINTA PERUNDINGAN BIPARTIT</span>
                          <p className="text-2xs sm:text-xs text-slate-700 leading-relaxed mt-0.5">
                            Saya menolak Pemutusan Hubungan Kerja ini dan menyampaikan alasan penolakan secara tertulis untuk diproses melalui perundingan bipartit sebagaimana diatur dalam Pasal 38 jo. Pasal 39 PP No. 35 Tahun 2021.
                          </p>
                          <div className="mt-1.5 text-2xs text-slate-500">
                            Alasan singkat penolakan: .................................................................................................................................................
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TANDA TANGAN PENYERAHAN & PENERIMAAN */}
                  <div className="grid grid-cols-2 gap-4 text-center text-xs mt-6">
                    <div>
                      <p className="text-slate-700 font-medium">Yang Menyerahkan (HRD):</p>
                      <p className="font-bold text-slate-950 uppercase text-3xs sm:text-2xs">{company.name}</p>
                      <div className="h-14"></div>
                      <p className="underline font-bold text-slate-900">
                        ( ................................................... )
                      </p>
                      <p className="text-2xs text-slate-500 mt-0.5">Tgl: ...........................................</p>
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">Yang Menerima & Menyatakan:</p>
                      {letter.includeEmployeeStampPlaceholder ? (
                        <div className="my-2 flex justify-center">
                          <MeteraiBox type={letter.stampType || 'tempel'} compact />
                        </div>
                      ) : (
                        <div className="h-16"></div>
                      )}
                      <p className="underline font-bold text-slate-900">
                        ( {letter.employeeName} )
                      </p>
                      <p className="text-2xs text-slate-500 mt-0.5">Tgl: ...........................................</p>
                    </div>
                  </div>
                </div>

                {/* FOOTER HALAMAN 3 */}
                <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-3xs text-slate-400 font-sans">
                  <span>Lembar Tanda Terima Resmi PP No. 35 Tahun 2021</span>
                  <span>Halaman {totalPages} dari {totalPages}</span>
                </div>
              </div>
            )}

            {/* Lencana Kepatuhan Hukum Dokumen */}
            <div className="no-print mt-6 mb-4 flex flex-wrap items-center justify-between gap-2 text-3xs text-slate-500 font-sans bg-white/80 backdrop-blur-xs py-2 px-4 rounded-xl border border-slate-300/80 shadow-2xs">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium text-slate-700">Terverifikasi Sesuai Tata Naskah PP RI No. 35 Tahun 2021</span>
              </span>
              <span className="text-slate-400">Dimensi Cetak Kertas Standar A4 (210 × 297 mm)</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
