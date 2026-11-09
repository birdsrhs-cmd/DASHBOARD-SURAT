import React, { useState } from 'react';
import {
  FileText,
  Building2,
  User,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { CompanyProfile, DisnakerReportData, LetterData } from '../types';
import { DISNAKER_ATTACHMENTS_DEFAULT, DEFAULT_COMPANY } from '../data/presets';
import { formatIndonesianDate, formatIndonesianDateWithDay, toRomanMonth } from '../utils/dateUtils';

interface DisnakerLetterFormProps {
  report: DisnakerReportData;
  onChange?: (updated: Partial<DisnakerReportData>) => void;
  onUpdateReport?: (updated: Partial<DisnakerReportData>) => void;
  activeCompany?: CompanyProfile;
  company?: CompanyProfile;
  companies?: CompanyProfile[];
  onSelectCompany?: (id: string) => void;
  onOpenCompanyModal?: () => void;
  onOpenLogoModal?: () => void;
  activeLetter?: LetterData;
  onImportFromLetter?: () => void;
  onResetToDefault?: () => void;
  onResetReport?: () => void;
}

const COMMON_DISNAKER_OFFICES = [
  'Kepala Suku Dinas Tenaga Kerja, Transmigrasi, dan Energi',
  'Kepala Dinas Tenaga Kerja dan Transmigrasi',
  'Kepala Dinas Tenaga Kerja',
  'Kepala Dinas Perindustrian dan Tenaga Kerja',
];

const COMMON_CITIES = [
  'Kota Administrasi Jakarta Selatan',
  'Kota Administrasi Jakarta Pusat',
  'Kota Administrasi Jakarta Barat',
  'Kota Administrasi Jakarta Utara',
  'Kota Administrasi Jakarta Timur',
  'Kota Surabaya',
  'Kota Bandung',
  'Kota Semarang',
  'Kota Medan',
  'Kabupaten Bekasi',
  'Kota Tangerang',
];

const REASON_TEMPLATES = [
  { label: 'Efisiensi Perusahaan', text: 'Efisiensi perusahaan demi mencegah kerugian operasional berkelanjutan' },
  { label: 'Berakhirnya Perjanjian Kerja', text: 'Berakhirnya jangka waktu Perjanjian Kerja Waktu Tertentu (PKWT)' },
  { label: 'Rasionalisasi / Restrukturisasi', text: 'Restrukturisasi organisasi dan peleburan unit kerja operasional' },
  { label: 'Pelanggaran Disiplin', text: 'Pelanggaran ketentuan perjanjian kerja / peraturan perusahaan setelah SP3' },
  { label: 'Penutupan Perusahaan / Force Majeure', text: 'Penutupan unit usaha disebabkan keadaan memaksa (force majeure)' },
];

export const DisnakerLetterForm: React.FC<DisnakerLetterFormProps> = ({
  report,
  onChange,
  onUpdateReport,
  activeCompany,
  company,
  companies = [],
  onSelectCompany,
  onOpenCompanyModal,
  onOpenLogoModal,
  activeLetter,
  onImportFromLetter,
  onResetToDefault,
  onResetReport,
}) => {
  const [newAttachment, setNewAttachment] = useState('');

  const effectiveCompany = activeCompany || company || DEFAULT_COMPANY;
  const updateReport = (updated: Partial<DisnakerReportData>) => {
    if (onChange) onChange(updated);
    if (onUpdateReport) onUpdateReport(updated);
  };
  const handleReset = onResetToDefault || onResetReport;
  const handleOpenCompany = onOpenCompanyModal || onOpenLogoModal;

  // Helper generate nomor surat otomatis baku: [No]/HRD/[Bulan-Romawi]/[Tahun]
  const handleAutoGenerateNumber = () => {
    const today = new Date();
    const romanMonth = toRomanMonth(today.getMonth() + 1);
    const year = today.getFullYear();
    const randomSeq = String(Math.floor(Math.random() * 900) + 100);
    const autoNumber = `${randomSeq}/HRD-DISNAKER/${romanMonth}/${year}`;
    updateReport({ letterNumber: autoNumber });
  };

  const handleAddAttachment = () => {
    if (!newAttachment.trim()) return;
    const current = report.attachmentItems || [];
    updateReport({ attachmentItems: [...current, newAttachment.trim()] });
    setNewAttachment('');
  };

  const handleRemoveAttachment = (index: number) => {
    const current = report.attachmentItems || [];
    updateReport({ attachmentItems: current.filter((_, idx) => idx !== index) });
  };

  const handleResetAttachments = () => {
    updateReport({ attachmentItems: [...DISNAKER_ATTACHMENTS_DEFAULT] });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Top Banner / Sync Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Laporan PHK ke Disnaker (Suku Dinas)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Surat pemberitahuan resmi pemutusan hubungan kerja untuk keperluan verifikasi Disnaker dan klaim JKP BPJS Ketenagakerjaan.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {activeLetter && (
              <button
                type="button"
                onClick={onImportFromLetter}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition"
                title="Muat data pekerja dan alasan dari surat PHK aktif"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tarik Data dari Surat PHK</span>
              </button>
            )}

            {handleReset && (
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
                title="Reset formulir ke bawaan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Company Active Notice */}
        <div className="mt-3.5 flex items-center justify-between bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 px-3.5 text-xs">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              {effectiveCompany?.logoUrl ? (
                <img src={effectiveCompany.logoUrl} alt="" className="w-5 h-5 object-contain rounded" />
              ) : (
                <Building2 className="w-4 h-4" />
              )}
            </div>
            <div className="truncate">
              <span className="text-2xs uppercase tracking-wider font-bold text-slate-400 block">
                Entitas Perusahaan Penerbit:
              </span>
              <span className="font-bold text-slate-800 truncate block">
                {effectiveCompany?.name || 'Perusahaan'}
              </span>
            </div>
          </div>

          {handleOpenCompany && (
            <button
              type="button"
              onClick={handleOpenCompany}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline shrink-0 ml-3"
            >
              Ganti / Edit PT
            </button>
          )}
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
        {/* BAGIAN 1: NOMOR & TUJUAN INSTANSI */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              1. Tata Naskah & Instansi Disnaker Tujuan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Nomor Surat */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nomor Surat <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateNumber}
                  className="text-3xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Format Otomatis ([No]/HRD/[Bulan]/[Tahun])</span>
                </button>
              </div>
              <input
                type="text"
                value={report.letterNumber}
                onChange={(e) => updateReport({ letterNumber: e.target.value })}
                placeholder="Contoh: 001/HRD/IX/2026"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {/* Lampiran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lampiran
              </label>
              <input
                type="text"
                value={report.attachments}
                onChange={(e) => updateReport({ attachments: e.target.value })}
                placeholder="1 (satu) Berkas"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Perihal */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perihal Surat
              </label>
              <input
                type="text"
                value={report.subject}
                onChange={(e) => updateReport({ subject: e.target.value })}
                placeholder="Laporan Pemutusan Hubungan Kerja (PHK)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Instansi Tujuan */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instansi Tujuan (Kepada Yth.)
              </label>
              <input
                type="text"
                value={report.targetOffice}
                onChange={(e) => updateReport({ targetOffice: e.target.value })}
                placeholder="Kepala Suku Dinas Tenaga Kerja, Transmigrasi, dan Energi"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {COMMON_DISNAKER_OFFICES.slice(0, 2).map((office, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateReport({ targetOffice: office })}
                    className="text-3xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                  >
                    {office}
                  </button>
                ))}
              </div>
            </div>

            {/* Kota Administrasi / Wilayah Sesuai Domisili */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kota / Wilayah Domisili
              </label>
              <input
                type="text"
                value={report.targetCity}
                onChange={(e) => updateReport({ targetCity: e.target.value })}
                placeholder="Contoh: Kota Administrasi Jakarta Selatan"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['Jakarta Selatan', 'Jakarta Pusat', 'Surabaya', 'Bandung'].map((city, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateReport({ targetCity: city.startsWith('Jakarta') ? `Kota Administrasi ${city}` : `Kota ${city}` })}
                    className="text-3xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: IDENTITAS PEKERJA */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                2. Identitas Pekerja yang Dilaporkan
              </h3>
            </div>
            {activeLetter && (
              <span className="text-3xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                Pekerja: {activeLetter.employeeName}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Pekerja */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Pekerja <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={report.employeeName}
                onChange={(e) => updateReport({ employeeName: e.target.value })}
                placeholder="Nama Karyawan beserta Gelar"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* NIK / NIP */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIK / NIP Karyawan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={report.employeeId}
                onChange={(e) => updateReport({ employeeId: e.target.value })}
                placeholder="Nomor Induk Karyawan / KTP"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {/* Jabatan / Bagian */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan / Bagian (Posisi Terakhir)
              </label>
              <input
                type="text"
                value={report.employeePosition}
                onChange={(e) => updateReport({ employeePosition: e.target.value })}
                placeholder="Misal: Senior Operations Supervisor / Operasional"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Tanggal Efektif PHK */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Efektif PHK <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={report.effectiveDate}
                onChange={(e) => updateReport({ effectiveDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <p className="text-3xs text-slate-500 mt-1">
                Format surat resmi: <strong className="text-slate-800">{formatIndonesianDateWithDay(report.effectiveDate)}</strong>
              </p>
            </div>

            {/* Alasan PHK */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan Pemutusan Hubungan Kerja (PHK) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={report.phkReason}
                onChange={(e) => updateReport({ phkReason: e.target.value })}
                placeholder="Contoh: Efisiensi perusahaan demi mencegah kerugian berkelanjutan..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-3xs text-slate-400 self-center mr-1 font-medium">Contoh Cepat:</span>
                {REASON_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateReport({ phkReason: tmpl.text })}
                    className="text-3xs px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 3: KELENGKAPAN ADMINISTRASI (JKP) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                3. Berkas Lampiran (Termasuk Program JKP)
              </h3>
            </div>
            <button
              type="button"
              onClick={handleResetAttachments}
              className="text-3xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Reset 3 Berkas Standar
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Daftar berkas yang disertakan bersama surat laporan untuk verifikasi Dinas Tenaga Kerja dan administrasi pencairan program Jaminan Kehilangan Pekerjaan (JKP):
          </p>

          <div className="space-y-2">
            {(report.attachmentItems || []).map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-3xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updated = [...(report.attachmentItems || [])];
                    updated[index] = e.target.value;
                    updateReport({ attachmentItems: updated });
                  }}
                  className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(index)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                  title="Hapus berkas ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add item */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="text"
              value={newAttachment}
              onChange={(e) => setNewAttachment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAttachment())}
              placeholder="Tambah berkas lampiran lain (misal: Fotokopi KTP / BPJS Ketenagakerjaan)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddAttachment}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shrink-0 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* BAGIAN 4: PENANDATANGAN & TANGGAL SURAT */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              4. Tanggal Surat & Pejabat Penandatangan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kota Surat */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kota Pembuatan Surat
              </label>
              <input
                type="text"
                value={report.city}
                onChange={(e) => updateReport({ city: e.target.value })}
                placeholder="Jakarta Selatan"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Tanggal Surat */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Surat
              </label>
              <input
                type="date"
                value={report.letterDate}
                onChange={(e) => updateReport({ letterDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <p className="text-3xs text-slate-500 mt-1">
                Format: <span className="font-semibold text-slate-700">{formatIndonesianDate(report.letterDate)}</span>
              </p>
            </div>

            {/* Nama Penandatangan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pimpinan / HRD Manager
              </label>
              <input
                type="text"
                value={report.signatoryName}
                onChange={(e) => updateReport({ signatoryName: e.target.value })}
                placeholder="Nama Penandatangan Resmi"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Jabatan Penandatangan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan Penandatangan
              </label>
              <input
                type="text"
                value={report.signatoryPosition}
                onChange={(e) => updateReport({ signatoryPosition: e.target.value })}
                placeholder="Human Resources & General Affairs Manager"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
