import React, { useState } from 'react';
import {
  Printer,
  FileDown,
  Copy,
  Check,
  Building2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { CompanyProfile, DisnakerReportData } from '../types';
import { DEFAULT_COMPANY } from '../data/presets';
import { formatIndonesianDate, formatIndonesianDateWithDay } from '../utils/dateUtils';
import { downloadDisnakerWordDocument, generateDisnakerPlainText } from '../utils/exportDoc';

interface DisnakerLetterPreviewProps {
  report: DisnakerReportData;
  company?: CompanyProfile;
  onPrint?: () => void;
  onDownloadDoc?: () => void;
  onCopyText?: () => void;
  onOpenLogoModal?: () => void;
  copied?: boolean;
}

export const DisnakerLetterPreview: React.FC<DisnakerLetterPreviewProps> = ({
  report,
  company,
  onPrint,
  onDownloadDoc,
  onCopyText,
  onOpenLogoModal,
  copied = false,
}) => {
  const safeCompany = company || DEFAULT_COMPANY;
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [localCopied, setLocalCopied] = useState<boolean>(false);

  const handleCopy = () => {
    if (onCopyText) {
      onCopyText();
    } else {
      const text = generateDisnakerPlainText(report, safeCompany);
      navigator.clipboard.writeText(text);
      setLocalCopied(true);
      setTimeout(() => setLocalCopied(false), 2000);
    }
  };

  const handleDownloadDoc = () => {
    if (onDownloadDoc) {
      onDownloadDoc();
    } else {
      downloadDisnakerWordDocument(report, safeCompany);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const effectiveDateWithDay = formatIndonesianDateWithDay(report.effectiveDate);
  const dateFormatted = formatIndonesianDate(report.letterDate);

  // Border kop surat
  const getKopBorderStyle = () => {
    switch (safeCompany.kopBorder) {
      case 'bold':
        return 'border-b-2 border-slate-900';
      case 'single':
        return 'border-b border-slate-900';
      case 'none':
        return '';
      case 'double':
      default:
        return 'border-b-[3px] border-double border-slate-900';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Action Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xs no-print shrink-0 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Format Resmi Disnaker & JKP</span>
          </span>
          <span className="text-2xs text-slate-400 hidden sm:inline">
            Pratinjau Kertas F4/Folio (Pelaporan Resmi)
          </span>
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Zoom controls */}
          <div className="hidden lg:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-slate-600 mr-2">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(70, prev - 10))}
              className="p-1 hover:bg-white rounded text-slate-700 transition"
              title="Perkecil Tampilan"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-2xs font-mono font-medium text-slate-600">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(130, prev + 10))}
              className="p-1 hover:bg-white rounded text-slate-700 transition"
              title="Perbesar Tampilan"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Copy Text */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
            title="Salin isi surat ke clipboard"
          >
            {copied || localCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salin Teks</span>
              </>
            )}
          </button>

          {/* Export Word */}
          <button
            type="button"
            onClick={handleDownloadDoc}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
            title="Ekspor ke Microsoft Word (.doc)"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Word (.doc)</span>
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
            title="Cetak atau Simpan sebagai PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* F4 Sheet Container */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        <div
          id="disnaker-print-area"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="w-full max-w-[215mm] min-h-[330mm] bg-white text-black shadow-xl rounded-sm p-[20mm] sm:p-[24mm] font-serif text-[11.5pt] leading-relaxed transition-transform duration-150 print:p-0 print:shadow-none print:m-0 print:w-full print:max-w-none print:transform-none"
        >
          {/* KOP SURAT */}
          <div className={`pb-3 mb-5 ${getKopBorderStyle()}`}>
            {safeCompany.kopAlignment === 'left' ? (
              /* Layout Rata Kiri Modern */
              <div className="flex items-center space-x-4">
                {safeCompany.showLogo !== false && safeCompany.logoUrl && (
                  <div
                    className={`shrink-0 ${onOpenLogoModal ? 'cursor-pointer hover:opacity-80 transition' : ''}`}
                    onClick={onOpenLogoModal}
                    title={onOpenLogoModal ? 'Klik untuk mengubah logo kop surat' : undefined}
                  >
                    <img
                      src={safeCompany.logoUrl}
                      alt={safeCompany.name}
                      style={{ height: `${safeCompany.logoSize || 64}px` }}
                      className={`object-contain ${
                        safeCompany.logoShape === 'circle'
                          ? 'rounded-full'
                          : safeCompany.logoShape === 'rounded'
                          ? 'rounded-lg'
                          : safeCompany.logoShape === 'bordered'
                          ? 'border border-slate-300 p-1 rounded'
                          : ''
                      }`}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight uppercase text-slate-900 leading-tight">
                    {safeCompany.name}
                  </h2>
                  {safeCompany.subName && (
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                      {safeCompany.subName}
                    </p>
                  )}
                  <p className="text-2xs sm:text-xs text-slate-600 mt-1 leading-snug">
                    {[safeCompany.address, safeCompany.city].filter(Boolean).join(', ')}
                    {safeCompany.postalCode && ` ${safeCompany.postalCode}`}
                    <br />
                    <span>Telp: {safeCompany.phone}</span>
                    {safeCompany.email && <span> • Email: {safeCompany.email}</span>}
                    {safeCompany.website && <span> • Web: {safeCompany.website}</span>}
                  </p>
                </div>
              </div>
            ) : (
              /* Layout Simetris Tengah Baku (Tata Naskah Dinas) */
              <div className="flex items-center justify-between">
                {/* Kolom Kiri: Logo */}
                <div
                  style={{
                    width: safeCompany.showLogo !== false && safeCompany.logoUrl ? `${Math.max((safeCompany.logoSize || 64) + 16, 80)}px` : '0px',
                    minWidth: safeCompany.showLogo !== false && safeCompany.logoUrl ? `${Math.max((safeCompany.logoSize || 64) + 16, 80)}px` : '0px',
                  }}
                  className="shrink-0 flex items-center justify-start"
                >
                  {safeCompany.showLogo !== false && safeCompany.logoUrl && (
                    <div
                      className={`shrink-0 ${onOpenLogoModal ? 'cursor-pointer hover:opacity-80 transition' : ''}`}
                      onClick={onOpenLogoModal}
                      title={onOpenLogoModal ? 'Klik untuk mengubah logo kop surat' : undefined}
                    >
                      <img
                        src={safeCompany.logoUrl}
                        alt={safeCompany.name}
                        style={{ height: `${safeCompany.logoSize || 64}px` }}
                        className={`object-contain ${
                          safeCompany.logoShape === 'circle'
                            ? 'rounded-full'
                            : safeCompany.logoShape === 'rounded'
                            ? 'rounded-lg'
                            : safeCompany.logoShape === 'bordered'
                            ? 'border border-slate-300 p-1 rounded'
                            : ''
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Kolom Tengah: Identitas Perusahaan (100% Simetris di Titik Tengah Kertas) */}
                <div className="flex-1 min-w-0 text-center px-2">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight uppercase text-slate-900 leading-tight font-serif">
                    {safeCompany.name}
                  </h2>
                  {safeCompany.subName && (
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5 font-sans">
                      {safeCompany.subName}
                    </p>
                  )}
                  <p className="text-2xs sm:text-xs text-slate-600 mt-1 leading-snug font-sans">
                    {[safeCompany.address, safeCompany.city].filter(Boolean).join(', ')}
                    {safeCompany.postalCode && ` ${safeCompany.postalCode}`}
                    <br />
                    <span>Telp: {safeCompany.phone}</span>
                    {safeCompany.email && <span> • Email: {safeCompany.email}</span>}
                    {safeCompany.website && <span> • Web: {safeCompany.website}</span>}
                  </p>
                </div>

                {/* Kolom Kanan: Penyeimbang Simetris Presisi (Lebar Persis Sama dengan Kolom Kiri) */}
                <div
                  style={{
                    width: safeCompany.showLogo !== false && safeCompany.logoUrl ? `${Math.max((safeCompany.logoSize || 64) + 16, 80)}px` : '0px',
                    minWidth: safeCompany.showLogo !== false && safeCompany.logoUrl ? `${Math.max((safeCompany.logoSize || 64) + 16, 80)}px` : '0px',
                  }}
                  className="shrink-0 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>

          {/* NOMOR & PERIHAL */}
          <div className="grid grid-cols-[85px_15px_1fr] text-[11.5pt] gap-y-0.5 mb-5">
            <div>Nomor</div>
            <div>:</div>
            <div className="font-semibold">{report.letterNumber || '-'}</div>

            <div>Lampiran</div>
            <div>:</div>
            <div>{report.attachments || '1 (satu) Berkas'}</div>

            <div>Perihal</div>
            <div>:</div>
            <div className="font-bold underline">
              {report.subject || 'Laporan Pemutusan Hubungan Kerja (PHK)'}
            </div>
          </div>

          {/* KEPADA YTH */}
          <div className="mb-5 text-[11.5pt]">
            <div>Kepada Yth.</div>
            <div className="font-bold">
              {report.targetOffice || 'Kepala Suku Dinas Tenaga Kerja, Transmigrasi, dan Energi'}
            </div>
            {report.targetCity && <div>{report.targetCity}</div>}
            <div>di Tempat</div>
          </div>

          {/* DENGAN HORMAT */}
          <div className="mb-3 text-[11.5pt]">Dengan hormat,</div>

          {/* PARAGRAF PEMBUKA */}
          <p className="text-justify indent-8 mb-4 text-[11.5pt] leading-relaxed">
            Sehubungan dengan adanya Pemutusan Hubungan Kerja (PHK) terhadap karyawan di perusahaan kami,
            maka bersama surat ini kami bermaksud melaporkan pelaksanaan PHK tersebut sesuai dengan ketentuan
            perundang-undangan yang berlaku.
          </p>

          {/* IDENTITAS PEKERJA */}
          <div className="mb-2 text-[11.5pt]">
            Adapun identitas pekerja yang mengalami Pemutusan Hubungan Kerja adalah sebagai berikut:
          </div>

          <div className="grid grid-cols-[180px_15px_1fr] text-[11.5pt] gap-y-1.5 ml-4 sm:ml-6 mb-4">
            <div className="text-slate-700">Nama Pekerja</div>
            <div>:</div>
            <div className="font-bold text-slate-900">{report.employeeName || '-'}</div>

            <div className="text-slate-700">NIK / NIP</div>
            <div>:</div>
            <div>{report.employeeId || '-'}</div>

            <div className="text-slate-700">Jabatan / Bagian</div>
            <div>:</div>
            <div>{report.employeePosition || '-'}</div>

            <div className="text-slate-700">Tanggal Efektif PHK</div>
            <div>:</div>
            <div className="font-bold text-slate-900">{effectiveDateWithDay}</div>

            <div className="text-slate-700">Alasan PHK</div>
            <div>:</div>
            <div className="text-justify">{report.phkReason || '-'}</div>
          </div>

          {/* KELENGKAPAN ADMINISTRASI */}
          <p className="mb-2 text-[11.5pt]">
            Sebagai bahan pertimbangan dan kelengkapan administrasi (termasuk keperluan program Jaminan Kehilangan Pekerjaan / JKP), bersama surat ini kami lampirkan:
          </p>

          <ol className="list-decimal list-outside ml-9 mb-4 space-y-1 text-[11.5pt]">
            {(report.attachmentItems && report.attachmentItems.length > 0
              ? report.attachmentItems
              : [
                  'Salinan Surat Pemberitahuan PHK kepada Pekerja.',
                  'Bukti kesepakatan / Perjanjian Bersama (PB) / Tanggapan pekerja.',
                  'Data pendukung lainnya.',
                ]
            ).map((item, idx) => (
              <li key={idx} className="pl-1">
                {item}
              </li>
            ))}
          </ol>

          {/* PARAGRAF PENUTUP */}
          <p className="text-justify indent-8 mb-8 text-[11.5pt] leading-relaxed">
            Demikian laporan ini kami sampaikan agar tercatat dan menjadi periksa adanya. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.
          </p>

          {/* TANDA TANGAN */}
          <div className="flex justify-end mt-6">
            <div className="w-72 text-left text-[11.5pt]">
              <div>
                {report.city || safeCompany.city}, {dateFormatted}
              </div>
              <div className="mt-1">Hormat kami,</div>
              <div className="font-bold text-slate-900 uppercase mt-0.5">{safeCompany.name}</div>

              {/* Tanda tangan & stempel placeholder */}
              <div className="my-3 h-24 flex items-center justify-center border border-dashed border-slate-300 rounded bg-slate-50/50 text-xs text-slate-400 italic print:border-none print:bg-transparent print:text-transparent">
                (Tanda Tangan & Stempel Perusahaan)
              </div>

              <div className="font-bold underline text-slate-900">
                {report.signatoryName || '........................................'}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {report.signatoryPosition || 'Pimpinan / HRD Manager'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
