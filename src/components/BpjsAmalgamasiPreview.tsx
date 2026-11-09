import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  FileDown,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Expand,
  RotateCcw,
  CheckCircle2,
  Paperclip,
  Share2
} from 'lucide-react';
import { BpjsAmalgamationData } from '../types';
import { formatIndonesianDate } from '../utils/dateUtils';
import { downloadBpjsAmalgamationDoc } from '../utils/exportBpjsDoc';
import { BPJS_REQUIREMENTS_INFO } from '../data/bpjsPresets';

interface BpjsAmalgamasiPreviewProps {
  data: BpjsAmalgamationData;
  onPrint: () => void;
  onCopyText: () => void;
  copied: boolean;
}

export const BpjsAmalgamasiPreview: React.FC<BpjsAmalgamasiPreviewProps> = ({
  data,
  onPrint,
  onCopyText,
  copied,
}) => {
  const [zoom, setZoom] = useState<number>(85);
  const [showChecklistModal, setShowChecklistModal] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetContainerRef = useRef<HTMLDivElement>(null);
  const [naturalHeight, setNaturalHeight] = useState<number>(1050);

  // Perhitungan auto-fit lebar ke viewport kontainer
  const handleFitWidth = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const availableWidth = Math.max(280, containerWidth - 48);
    const calculated = Math.min(115, Math.max(45, Math.floor((availableWidth / 794) * 100)));
    setZoom(calculated);
  };

  useEffect(() => {
    handleFitWidth();
    const handleResize = () => handleFitWidth();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update tinggi alami saat data berubah
  useEffect(() => {
    if (!sheetContainerRef.current) return;
    const updateHeight = () => {
      if (sheetContainerRef.current) {
        setNaturalHeight(sheetContainerRef.current.scrollHeight || 1050);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(sheetContainerRef.current);
    return () => observer.disconnect();
  }, [data]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 140));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 45));
  const handleResetZoom = () => setZoom(100);

  const formattedIssueDate = formatIndonesianDate(data.issueDate);
  const formattedBirthDate = data.birthDate ? formatIndonesianDate(data.birthDate) : '-';
  const formattedSubDate = formatIndonesianDate(data.submissionDate);
  const formattedReceiptDate = data.receiptDate ? formatIndonesianDate(data.receiptDate) : '';

  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-200/80 rounded-2xl border border-slate-300/70 overflow-hidden shadow-xs">
      {/* Top Toolbar Pratinjau Form */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-2xs shrink-0 no-print flex-wrap">
        {/* Kiri: Identitas Dokumen */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            BPJS Ketenagakerjaan
          </span>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline">
            Form Amalgamasi Saldo JHT (A4)
          </span>
        </div>

        {/* Tengah: Kontrol Zoom Lengkap */}
        <div className="flex items-center space-x-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Perkecil (-10%)"
            className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1 font-semibold text-slate-700 min-w-[36px] text-center text-3xs sm:text-xs">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Perbesar (+10%)"
            className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleFitWidth}
            className="px-1.5 py-0.5 rounded hover:bg-white text-emerald-700 font-bold text-3xs transition-colors flex items-center space-x-0.5"
            title="Paskan Lebar Layar (Auto-Fit)"
          >
            <Expand className="w-3 h-3 text-emerald-600" />
            <span className="hidden xl:inline">Paskan</span>
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
            title="Ukuran Asli 100%"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Kanan: Aksi Dokumen */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            type="button"
            onClick={() => setShowChecklistModal(true)}
            title="Lihat Syarat Berkas Amalgamasi BPJS"
            className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
          >
            <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Syarat Berkas</span>
          </button>

          <button
            type="button"
            onClick={onCopyText}
            title="Salin Teks Formulir"
            className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          <button
            type="button"
            onClick={() => downloadBpjsAmalgamationDoc(data)}
            title="Unduh Dokumen Format Microsoft Word (.doc)"
            className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Word</span>
          </button>

          {/* Tombol Cetak Cepat Langsung */}
          <button
            type="button"
            onClick={handleDirectPrint}
            title="Cetak Cepat Langsung (Ctrl + P)"
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span>Cepat</span>
          </button>

          {/* Tombol Buka Opsi Cetak & PDF Modal */}
          <button
            type="button"
            onClick={onPrint}
            title="Opsi Cetak Lengkap & Simpan PDF"
            className="flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Document Viewer Canvas */}
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
            id="printable-bpjs-amalgamasi"
            style={{
              width: '794px',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
            className="bpjs-sheet bg-white text-black p-8 sm:p-10 shadow-xl border border-slate-300 rounded-xs font-sans relative flex flex-col justify-between print:w-full print:p-0 print:border-none print:shadow-none print:m-0"
          >
            <div>
              {/* TABEL UTAMA FORMULIR KOP & KONTEN */}
              <div className="border-[1.5px] border-black">
                {/* HEADER ATAS 3 KOLOM */}
                <div className="grid grid-cols-12 border-b-[1.5px] border-black">
                  {/* Kolom 1: LOGO BPJS KETENAGAKERJAAN */}
                  <div className="col-span-4 p-3 flex items-center justify-center border-r-[1.5px] border-black">
                    <div className="flex items-center space-x-2">
                      {/* SVG Logo Resmi BPJS Ketenagakerjaan */}
                      <svg width="42" height="38" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                        <path d="M12 50 C12 25, 38 12, 65 15 C55 35, 40 55, 12 50 Z" fill="#22c55e" />
                        <path d="M35 55 C35 35, 55 24, 78 28 C70 45, 55 62, 35 55 Z" fill="#16a34a" />
                        <path d="M15 62 C35 55, 60 58, 88 42 C78 65, 50 78, 15 62 Z" fill="#0284c7" />
                        <path d="M25 72 C42 66, 68 68, 92 56 C80 80, 52 88, 25 72 Z" fill="#0369a1" />
                      </svg>
                      <div className="leading-tight">
                        <div className="font-black text-lg text-sky-600 tracking-tight leading-none">
                          BPJS
                        </div>
                        <div className="font-bold text-[10px] text-green-700 tracking-tight mt-0.5">
                          Ketenagakerjaan
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kolom 2: NOMOR DOKUMEN & REVISI */}
                  <div className="col-span-4 flex flex-col justify-between border-r-[1.5px] border-black text-center text-xs">
                    <div className="font-bold tracking-wider py-1.5 text-sm uppercase">
                      FORMULIR
                    </div>
                    <div className="border-t border-black text-left px-2 py-1 text-[11px] leading-tight space-y-0.5">
                      <div>No Dokumen : {data.documentNumber || 'FM/KC/01/02/005'}</div>
                      <div>No. Revisi &nbsp;&nbsp;: {data.revisionNumber || '1'}</div>
                    </div>
                  </div>

                  {/* Kolom 3: JUDUL FORMULIR (GRAY BOX) */}
                  <div className="col-span-4 bg-slate-300 flex items-center justify-center p-2 text-center" style={{ backgroundColor: '#d1d5db' }}>
                    <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide leading-snug text-black">
                      PERMINTAAN PENGGABUNGAN SALDO
                    </h3>
                  </div>
                </div>

                {/* SUB-HEADER: HALAMAN & TANGGAL DIKELUARKAN */}
                <div className="grid grid-cols-12 border-b border-black text-[11px] leading-tight font-medium">
                  <div className="col-span-4 px-2 py-1 border-r-[1.5px] border-black">
                    Halaman 1 dari 1
                  </div>
                  <div className="col-span-8 px-2 py-1">
                    Tanggal dikeluarkan: {formattedIssueDate}
                  </div>
                </div>

                {/* BARIS 1: NAMA PERUSAHAAN */}
                <div className="grid grid-cols-12 border-b border-black text-xs leading-normal">
                  <div className="col-span-1 p-2 text-center font-bold border-r border-black flex items-center justify-center">
                    1
                  </div>
                  <div className="col-span-4 p-2 font-medium border-r border-black flex items-center">
                    Nama Perusahaan
                  </div>
                  <div className="col-span-7 p-2 font-bold flex items-center">
                    : {data.companyName || '-'}
                  </div>
                </div>

                {/* BARIS 2: N.P.P */}
                <div className="grid grid-cols-12 border-b border-black text-xs leading-normal">
                  <div className="col-span-1 p-2 text-center font-bold border-r border-black flex items-center justify-center">
                    2
                  </div>
                  <div className="col-span-4 p-2 font-medium border-r border-black flex items-center">
                    N.P.P
                  </div>
                  <div className="col-span-7 p-2 font-mono text-xs flex items-center">
                    : {data.companyNpp || '-'}
                  </div>
                </div>

                {/* BARIS 3: DATA TENAGA KERJA */}
                <div className="grid grid-cols-12 border-b border-black text-xs leading-normal">
                  <div className="col-span-1 p-2 text-center font-bold border-r border-black pt-2">
                    3
                  </div>
                  <div className="col-span-11">
                    {/* 3. Data Tenaga Kerja Header */}
                    <div className="grid grid-cols-11 border-b border-black">
                      <div className="col-span-4 p-2 font-medium border-r border-black">
                        Data Tenaga Kerja
                      </div>
                      <div className="col-span-7 p-2">
                        :
                      </div>
                    </div>

                    {/* 3.1. Nama Tenaga Kerja */}
                    <div className="grid grid-cols-11 border-b border-black">
                      <div className="col-span-4 p-2 font-medium border-r border-black pl-4">
                        3.1. Nama Tenaga Kerja
                      </div>
                      <div className="col-span-7 p-2 font-semibold">
                        : {data.employeeName || '-'}
                      </div>
                    </div>

                    {/* 3.2 Tempat Tanggal Lahir */}
                    <div className="grid grid-cols-11 border-b border-black">
                      <div className="col-span-4 p-2 font-medium border-r border-black pl-4">
                        3.2 Tempat Tanggal Lahir
                      </div>
                      <div className="col-span-7 p-2">
                        : {data.birthPlace ? `${data.birthPlace}, ` : ''}{formattedBirthDate}
                      </div>
                    </div>

                    {/* 3.3. No Kartu Peserta lama (fotokopi) */}
                    <div className="grid grid-cols-11 border-b border-black">
                      <div className="col-span-4 p-2 font-medium border-r border-black pl-4">
                        3.3. No Kartu Peserta lama (fotokopi)
                      </div>
                      <div className="col-span-7 p-2 font-mono text-xs">
                        : {data.oldKpjNumber || '-'}
                      </div>
                    </div>

                    {/* 3.4. No Kartu Peserta baru (asli terlampir) */}
                    <div className="grid grid-cols-11">
                      <div className="col-span-4 p-2 font-medium border-r border-black pl-4">
                        3.4. No Kartu Peserta baru (asli terlampir)
                      </div>
                      <div className="col-span-7 p-2 font-mono text-xs font-bold">
                        : {data.newKpjNumber || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BARIS 4: RIWAYAT PEKERJAAN */}
                <div className="grid grid-cols-12 text-xs leading-normal">
                  <div className="col-span-1 p-2 text-center font-bold border-r border-black pt-2">
                    4
                  </div>
                  <div className="col-span-4 p-2 font-medium border-r border-black pt-2">
                    <div>Riwayat Pekerjaan</div>
                    <div className="text-[11px] italic text-slate-600">
                      (Referensi kerja terlampir)
                    </div>
                  </div>
                  <div className="col-span-7 p-0 flex flex-col">
                    {data.workHistories && data.workHistories.length > 0 ? (
                      data.workHistories.map((hist, idx) => (
                        <div
                          key={idx}
                          className={`p-2 ${
                            idx < (data.workHistories?.length ?? 0) - 1 ? 'border-b border-black' : ''
                          }`}
                        >
                          <span className="font-semibold">{idx + 1}.</span> {hist}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 italic text-slate-500">
                        1. Belum ada riwayat pekerjaan ditambahkan
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TABEL PENGESAHAN / TANDA TANGAN 2 KOLOM */}
              <div className="mt-8 border-[1.5px] border-black grid grid-cols-2 text-xs break-inside-avoid">
                {/* Kolom Kiri: Diserahkan oleh */}
                <div className="p-4 border-r-[1.5px] border-black flex flex-col justify-between min-h-[140px] text-center">
                  <div>
                    <div className="font-bold">Diserahkan oleh :</div>
                    <div className="text-[11px] text-slate-700">(Nama dan Perusahaan)</div>
                  </div>

                  <div className="my-5">
                    <div className="font-bold underline text-sm">
                      {data.submitterName || '...................................................'}
                    </div>
                    <div className="text-[11px] text-slate-700 mt-0.5">
                      {data.submitterRole === 'karyawan' ? 'Karyawan' : data.submitterRole === 'atasan' ? 'Atasan Langsung' : 'HRD Perusahaan'} / atasan
                    </div>
                  </div>

                  <div className="text-left text-[11px] border-t border-slate-300 pt-1">
                    Tanggal : {formattedSubDate}
                  </div>
                </div>

                {/* Kolom Kanan: Diterima oleh */}
                <div className="p-4 flex flex-col justify-between min-h-[140px] text-center">
                  <div>
                    <div className="font-bold">Diterima oleh :</div>
                    <div className="text-[11px] text-slate-700">( Nama Customer Service)</div>
                  </div>

                  <div className="my-5">
                    <div className="font-bold underline text-sm">
                      {data.csName || '...................................................'}
                    </div>
                    <div className="text-[11px] text-slate-700 mt-0.5">
                      Pihak Jamsostek
                    </div>
                  </div>

                  <div className="text-left text-[11px] border-t border-slate-300 pt-1">
                    Tanggal : {formattedReceiptDate || '...................................................'}
                  </div>
                </div>
              </div>
            </div>

            {/* Footnote Dokumen Resmi */}
            <div className="mt-6 flex items-center justify-between text-[10px] text-slate-400 no-print">
              <span>Formulir Baku Amalgamasi BPJS Ketenagakerjaan (Format Faks/Asli)</span>
              <span>{data.documentNumber || 'FM/KC/01/02/005'} - Revisi {data.revisionNumber || '1'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Checklist Berkas Persyaratan */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Syarat Berkas Amalgamasi BPJS
                  </h3>
                  <p className="text-2xs text-slate-500">
                    Kelengkapan dokumen wajib saat diserahkan ke kantor cabang BPJS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChecklistModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {BPJS_REQUIREMENTS_INFO.map((req, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3 text-xs"
                >
                  <div className="mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{req.title}</span>
                      {req.required && (
                        <span className="text-3xs bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                          Wajib
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-2xs mt-0.5">{req.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowChecklistModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
