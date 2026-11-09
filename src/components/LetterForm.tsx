import React, { useState } from 'react';
import {
  Building2,
  FileText,
  UserCheck,
  UserX,
  AlertTriangle,
  Coins,
  Settings2,
  Sparkles,
  Calendar,
  Info,
  Clock,
  CheckCircle2,
  RefreshCw,
  Share2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { CompanyProfile, LetterData, LetterStatus } from '../types';
import { REASON_PRESETS } from '../data/presets';
import { addWorkingDays, formatCurrencyIDR, formatIndonesianDate, getRemainingWorkingDays } from '../utils/dateUtils';
import { cleanAndFormatCompanyName, toTitleCaseCompanyName } from '../utils/formatCompany';

interface LetterFormProps {
  letter: LetterData;
  company: CompanyProfile;
  onUpdateLetter: (updated: Partial<LetterData>) => void;
  onUpdateCompany: (updated: Partial<CompanyProfile>) => void;
  onSaveToHistory: () => void;
  onOpenLogoModal?: () => void;
  companies?: CompanyProfile[];
  onSelectCompany?: (id: string) => void;
  onOpenCompanyModal?: () => void;
}

export const LetterForm: React.FC<LetterFormProps> = ({
  letter,
  company,
  onUpdateLetter,
  onUpdateCompany,
  onSaveToHistory,
  onOpenLogoModal,
  companies = [],
  onSelectCompany,
  onOpenCompanyModal,
}) => {
  const [activeTab, setActiveTab] = useState<'surat' | 'karyawan' | 'alasan' | 'hak' | 'perusahaan'>('surat');

  const FORM_TABS = [
    { id: 'surat' as const, label: 'Data Surat', icon: FileText, number: 1 },
    { id: 'karyawan' as const, label: 'Data Karyawan', icon: UserX, number: 2 },
    { id: 'alasan' as const, label: 'Alasan ("Bahwa")', icon: AlertTriangle, number: 3 },
    { id: 'hak' as const, label: 'Hak & Kompensasi', icon: Coins, number: 4 },
    { id: 'perusahaan' as const, label: 'Kop Surat', icon: Building2, number: 5 },
  ];

  const currentTabIndex = FORM_TABS.findIndex((t) => t.id === activeTab);
  const prevTab = currentTabIndex > 0 ? FORM_TABS[currentTabIndex - 1] : null;
  const nextTab = currentTabIndex < FORM_TABS.length - 1 ? FORM_TABS[currentTabIndex + 1] : null;
  const recommendedEffectiveDate = letter.letterDate ? addWorkingDays(letter.letterDate, 14) : '';

  // Hitung batas 5 hari kerja tanggapan jika ada receivedDate
  const responseDeadlineDate = letter.receivedDate ? addWorkingDays(letter.receivedDate, 5) : '';
  const remainingWorkingDays = responseDeadlineDate ? getRemainingWorkingDays(responseDeadlineDate) : null;

  // Handler ganti preset alasan
  const handleSelectPreset = (presetId: string) => {
    const preset = REASON_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onUpdateLetter({
        reasonPresetId: presetId,
        reasonText: preset.defaultText,
      });
    }
  };

  // Helper kalkulator otomatis pesangon PP 35/2021
  const handleCalculateStandardCompensation = () => {
    const salary = letter.compensation.baseSalary || 0;
    const years = letter.compensation.yearsOfService || 0;

    if (salary <= 0) return;

    // Ketentuan Uang Pesangon (Pasal 40 ayat 2 PP 35/2021)
    let upFactor = 1;
    if (years < 1) upFactor = 1;
    else if (years < 2) upFactor = 2;
    else if (years < 3) upFactor = 3;
    else if (years < 4) upFactor = 4;
    else if (years < 5) upFactor = 5;
    else if (years < 6) upFactor = 6;
    else if (years < 7) upFactor = 7;
    else if (years < 8) upFactor = 8;
    else upFactor = 9; // 8 tahun atau lebih = 9 bulan upah

    // Uang Penghargaan Masa Kerja (Pasal 40 ayat 3 PP 35/2021)
    let upmkFactor = 0;
    if (years < 3) upmkFactor = 0;
    else if (years < 6) upmkFactor = 2;
    else if (years < 9) upmkFactor = 3;
    else if (years < 12) upmkFactor = 4;
    else if (years < 15) upmkFactor = 5;
    else if (years < 18) upmkFactor = 6;
    else if (years < 21) upmkFactor = 7;
    else if (years < 24) upmkFactor = 8;
    else upmkFactor = 10;

    const severance = salary * upFactor;
    const serviceReward = salary * upmkFactor;
    const rightsComp = Math.round(salary * 0.5); // Perkiraan sisa cuti & hak lainnya

    onUpdateLetter({
      compensation: {
        ...letter.compensation,
        includeCompensation: true,
        severancePay: severance,
        serviceRewardPay: serviceReward,
        rightsCompensationPay: rightsComp,
        notes: `Kalkulasi otomatis berdasarkan masa kerja ${years} tahun (${upFactor}x gaji UP + ${upmkFactor}x gaji UPMK) sesuai Pasal 40 PP No. 35/2021.`,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header Form & Tabs */}
      <div className="border-b border-slate-200/80 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center space-x-2">
              <Settings2 className="w-4 h-4 text-indigo-600" />
              <span>Formulir Data Surat & Ketentuan</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Isi data surat resmi pemutusan hubungan kerja sesuai PP No. 35/2021
            </p>
          </div>
          <button
            type="button"
            onClick={onSaveToHistory}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center space-x-1.5 shadow-md shadow-indigo-200"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Simpan Draft</span>
          </button>
        </div>

        {/* Tab navigasi horizontal dengan indikator progres */}
        <div className="flex space-x-1 sm:space-x-1.5 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
          {FORM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50/80 border border-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Konten Tab */}
      <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-white">
        
        {/* TAB 1: DATA SURAT & PENANDATANGAN */}
        {activeTab === 'surat' && (
          <div className="space-y-5">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-indigo-950">Format Baku Surat Dinas:</span> Bagian ini mengatur Nomor Surat, Perihal, Tanggal Surat, dan Pejabat Penandatangan atas nama Perusahaan sesuai kaidah resmi.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Nomor Surat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={letter.letterNumber}
                  onChange={(e) => onUpdateLetter({ letterNumber: e.target.value })}
                  placeholder="Contoh: 042/HRD-PHK/VIII/2026"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Lampiran
                </label>
                <input
                  type="text"
                  value={letter.attachments}
                  onChange={(e) => onUpdateLetter({ attachments: e.target.value })}
                  placeholder="Contoh: - atau 1 Berkas"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Perihal
                </label>
                <input
                  type="text"
                  value={letter.subject}
                  onChange={(e) => onUpdateLetter({ subject: e.target.value })}
                  placeholder="Pemberitahuan Pemutusan Hubungan Kerja"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Kota Pembuatan Surat
                </label>
                <input
                  type="text"
                  value={letter.city}
                  onChange={(e) => onUpdateLetter({ city: e.target.value })}
                  placeholder="Jakarta"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tanggal Surat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={letter.letterDate}
                  onChange={(e) => onUpdateLetter({ letterDate: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status Dokumen
                </label>
                <select
                  value={letter.status}
                  onChange={(e) => onUpdateLetter({ status: e.target.value as LetterStatus })}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                >
                  <option value="draft">Draft (Konsep)</option>
                  <option value="terkirim">Terkirim (Menunggu Tanggapan)</option>
                  <option value="disetujui">Disetujui Karyawan</option>
                  <option value="ditolak">Ditolak Karyawan (Bipartit)</option>
                  <option value="selesai">Selesai (Hak Dibayarkan)</option>
                </select>
              </div>
            </div>

            {/* Pihak Pertama (Penandatangan Surat) */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pihak Pertama (Yang Bertanda Tangan di Bawah Ini)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Nama Penandatangan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={letter.signatoryName}
                    onChange={(e) => onUpdateLetter({ signatoryName: e.target.value })}
                    placeholder="Contoh: Dra. Hendrawati Kusuma, M.M."
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Jabatan Penandatangan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={letter.signatoryPosition}
                    onChange={(e) => onUpdateLetter({ signatoryPosition: e.target.value })}
                    placeholder="Contoh: HR Director / Head of People"
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Bertindak Untuk dan Atas Nama Perusahaan
                    </label>
                    {letter.signatoryCompany !== company.name && (
                      <button
                        type="button"
                        onClick={() => onUpdateLetter({ signatoryCompany: company.name })}
                        className="text-3xs text-indigo-600 hover:text-indigo-800 font-semibold underline transition-colors"
                      >
                        Samakan dengan Kop ({company.name})
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={letter.signatoryCompany}
                    onChange={(e) => onUpdateLetter({ signatoryCompany: e.target.value })}
                    placeholder={company.name}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-medium transition-all"
                  />
                  <p className="text-2xs text-slate-500 mt-1">
                    Nama badan hukum/perusahaan yang diwakili oleh penandatangan di dalam surat.
                  </p>
                </div>
              </div>
            </div>

            {/* Opsi Tanda Tangan & Format Meterai */}
            <div className="pt-2 space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2.5">
                <input
                  type="checkbox"
                  id="stampCheckbox"
                  checked={letter.includeStampPlaceholder}
                  onChange={(e) => onUpdateLetter({ includeStampPlaceholder: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="stampCheckbox" className="text-xs text-slate-800 font-bold cursor-pointer">
                  Sertakan Kotak Penempatan Meterai Rp 10.000 Resmi
                </label>
              </div>

              {letter.includeStampPlaceholder && (
                <div className="pl-6 space-y-3 pt-1 border-t border-slate-200/80">
                  <div>
                    <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Pilih Format / Jenis Meterai:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateLetter({ stampType: 'tempel' })}
                        className={`text-xs p-2.5 rounded-lg border text-left transition-all ${
                          (letter.stampType || 'tempel') === 'tempel'
                            ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-rose-600 font-bold text-xs">✦</span>
                          <span className="font-bold">Meterai Tempel Fisik</span>
                        </div>
                        <p className="text-3xs text-slate-500 mt-1 font-normal">
                          Format UU No. 10/2020. Ttd mengenai meterai & kertas.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => onUpdateLetter({ stampType: 'emeterai' })}
                        className={`text-xs p-2.5 rounded-lg border text-left transition-all ${
                          letter.stampType === 'emeterai'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-emerald-600 font-bold text-xs">▣</span>
                          <span className="font-bold">e-Meterai Digital (Peruri)</span>
                        </div>
                        <p className="text-3xs text-slate-500 mt-1 font-normal">
                          QR Code e-Meterai. Ttd bersebelahan tanpa menimpa.
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="employeeStampCheckbox"
                      checked={letter.includeEmployeeStampPlaceholder || false}
                      onChange={(e) => onUpdateLetter({ includeEmployeeStampPlaceholder: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="employeeStampCheckbox" className="text-2xs text-slate-700 font-medium cursor-pointer">
                      Sertakan juga kotak meterai pada lembar tanggapan & persetujuan pekerja (Halaman 3)
                    </label>
                  </div>

                  <p className="text-3xs text-slate-500 italic">
                    💡 Sesuai Pasal 7 UU No. 10 Tahun 2020 tentang Bea Meterai, tanda tangan dibubuhkan sebagian di atas meterai tempel dan sebagian di atas kertas surat.
                  </p>
                </div>
              )}
            </div>

            {/* Opsi Tembusan Surat (Tembusan Yth:) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="includeCarbonCopyCheckbox"
                    checked={letter.includeCarbonCopy !== false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onUpdateLetter({
                        includeCarbonCopy: checked,
                        ...((checked && (!letter.carbonCopy || letter.carbonCopy.length === 0)) ? {
                          carbonCopy: ['Direksi Perusahaan', 'Finance & Payroll Department', 'Arsip HRD'],
                          carbonCopyTitle: letter.carbonCopyTitle || 'Tembusan Yth:'
                        } : {})
                      });
                    }}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <div>
                    <label htmlFor="includeCarbonCopyCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer flex items-center space-x-1.5">
                      <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sertakan Tembusan Surat (Tembusan Yth:)</span>
                    </label>
                    <p className="text-2xs text-slate-500 mt-0.5">
                      Opsional: Centang untuk mencantumkan tembusan kepada Direksi, Payroll, Disnaker, atau Arsip di bagian bawah surat.
                    </p>
                  </div>
                </div>
                <span className={`text-2xs font-semibold px-2.5 py-0.5 rounded-full ${letter.includeCarbonCopy !== false ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-200 text-slate-600'}`}>
                  {letter.includeCarbonCopy !== false ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              {letter.includeCarbonCopy !== false && (
                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/25 space-y-3.5">
                  <div>
                    <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase tracking-wider">
                      Judul / Label Tembusan
                    </label>
                    <input
                      type="text"
                      value={letter.carbonCopyTitle ?? 'Tembusan Yth:'}
                      onChange={(e) => onUpdateLetter({ carbonCopyTitle: e.target.value })}
                      placeholder="Tembusan Yth:"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-2xs font-semibold text-slate-600 uppercase tracking-wider">
                        Daftar Pihak Tembusan
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = letter.carbonCopy || [];
                          onUpdateLetter({ carbonCopy: [...current, ''] });
                        }}
                        className="text-2xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah Baris</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(!letter.carbonCopy || letter.carbonCopy.length === 0) ? (
                        <div className="p-3 text-center text-xs text-slate-500 bg-white rounded-lg border border-dashed border-slate-200">
                          Belum ada pihak tembusan. Klik "Tambah Baris" atau pilih opsi cepat di bawah.
                        </div>
                      ) : (
                        letter.carbonCopy.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-slate-400 w-5 text-right shrink-0">
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const current = [...(letter.carbonCopy || [])];
                                current[idx] = e.target.value;
                                onUpdateLetter({ carbonCopy: current });
                              }}
                              placeholder="Contoh: Direksi Perusahaan / Finance & Payroll"
                              className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const current = (letter.carbonCopy || []).filter((_, i) => i !== idx);
                                onUpdateLetter({ carbonCopy: current });
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Hapus baris tembusan ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Preset Pilihan Cepat */}
                  <div className="pt-2 border-t border-indigo-100">
                    <span className="text-2xs font-medium text-slate-500 block mb-1.5">
                      Pilihan Cepat (klik untuk menambahkan):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Direksi Perusahaan',
                        'Finance & Payroll Department',
                        'Dinas Tenaga Kerja (Disnaker)',
                        'Serikat Pekerja / Serikat Buruh',
                        'Legal & Industrial Relations',
                        'Arsip HRD'
                      ].map((preset) => {
                        const isAlreadyAdded = (letter.carbonCopy || []).includes(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            disabled={isAlreadyAdded}
                            onClick={() => {
                              const current = letter.carbonCopy || [];
                              if (!current.includes(preset)) {
                                onUpdateLetter({ carbonCopy: [...current, preset] });
                              }
                            }}
                            className={`text-2xs px-2 py-1 rounded-md border transition-all ${
                              isAlreadyAdded
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
                            }`}
                          >
                            + {preset}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DATA KARYAWAN (PIHAK KEDUA) */}
        {activeTab === 'karyawan' && (
          <div className="space-y-5">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start space-x-2.5">
              <UserX className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-indigo-950">Pihak Kedua (Karyawan Terkait):</span> Sesuai klausul baku surat: <em>"Dengan ini memberitahukan kepada Saudara/Saudari: Nama, Jabatan, Unit Kerja/Divisi, Status PKWTT"</em>.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Nama Karyawan (Sdr/Sdri) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={letter.employeeName}
                  onChange={(e) =>
                    onUpdateLetter({
                      employeeName: e.target.value,
                      recipientName: e.target.value,
                    })
                  }
                  placeholder="Contoh: Bambang Sudarsono, S.T."
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Nomor Induk Karyawan (NIK)
                </label>
                <input
                  type="text"
                  value={letter.employeeId || ''}
                  onChange={(e) => onUpdateLetter({ employeeId: e.target.value })}
                  placeholder="Contoh: EMP-2019-084"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Jabatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={letter.employeePosition}
                  onChange={(e) => onUpdateLetter({ employeePosition: e.target.value })}
                  placeholder="Contoh: Senior Operations Supervisor"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Unit Kerja / Divisi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={letter.employeeDepartment}
                  onChange={(e) => onUpdateLetter({ employeeDepartment: e.target.value })}
                  placeholder="Contoh: Operasional & Logistik"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Informasi PKWTT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={letter.pkwttInfo}
                  onChange={(e) => onUpdateLetter({ pkwttInfo: e.target.value })}
                  placeholder="Contoh: Perjanjian Kerja No. 045/PKWTT/HRD/2019 tertanggal 15 Juli 2019"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
                <p className="text-2xs text-slate-400 mt-1">
                  Nomor surat perjanjian kerja waktu tidak tertentu (tetap) atau tanggal pengangkatan karyawan.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Alamat / Lokasi Penerima (Tujuan Surat)
                </label>
                <input
                  type="text"
                  value={letter.recipientAddress}
                  onChange={(e) => onUpdateLetter({ recipientAddress: e.target.value })}
                  placeholder="Contoh: Tempat / Di Tempat / Kantor Jakarta"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALASAN PEMUTUSAN ("BAHWA :") */}
        {activeTab === 'alasan' && (
          <div className="space-y-5">
            {/* Preset Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Template Alasan Resmi PP No. 35/2021</span>
                </span>
                <span className="text-2xs text-indigo-600 font-medium">Klik untuk isi otomatis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {REASON_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                      letter.reasonPresetId === preset.id
                        ? 'border-indigo-500 bg-indigo-50/80 shadow-2xs text-indigo-950 ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold">{preset.title}</div>
                    <div className="text-2xs text-slate-500 mt-1.5 flex items-center space-x-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      <span>{preset.legalBasis}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Isi Paragraf "Bahwa :" */}
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Isi Pernyataan Alasan ("Bahwa :") <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                value={letter.reasonText}
                onChange={(e) => onUpdateLetter({ reasonText: e.target.value })}
                placeholder="Tuliskan latar belakang, pertimbangan, dan alasan resmi pemutusan hubungan kerja..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white leading-relaxed resize-none transition-all"
              />
            </div>

            {/* Tanggal Efektif PHK & Aturan 14 Hari Kerja */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Tanggal Efektif Berlakunya PHK:</span>
                </label>
                {recommendedEffectiveDate && (
                  <button
                    type="button"
                    onClick={() => onUpdateLetter({ effectiveDate: recommendedEffectiveDate })}
                    className="text-2xs font-semibold text-indigo-600 hover:text-indigo-800 underline flex items-center space-x-1"
                  >
                    <span>Gunakan Rekomendasi (14 hari kerja)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="date"
                  value={letter.effectiveDate}
                  onChange={(e) => onUpdateLetter({ effectiveDate: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <div className="text-xs text-slate-700 flex items-center font-medium">
                  <span>
                    Efektif: <strong className="text-slate-900">{formatIndonesianDate(letter.effectiveDate)}</strong>
                  </span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-2xs text-indigo-900 leading-relaxed flex items-start space-x-2">
                <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Pasal 37 ayat (2) PP 35/2021:</strong> Pemberitahuan PHK disampaikan secara sah dan patut oleh Pengusaha kepada Pekerja paling lambat <strong>14 hari kerja</strong> sebelum PHK berlaku (atau 7 hari kerja dalam masa percobaan).
                </span>
              </div>
            </div>

            {/* Klausul Statutori Wajib PP 35/2021 */}
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Klausul Ketentuan Hukum Wajib (Pasal 37 jo. Pasal 38 PP 35/2021)
              </label>
              <textarea
                rows={3}
                value={letter.statutoryClause}
                onChange={(e) => onUpdateLetter({ statutoryClause: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white resize-none"
              />
              <p className="text-2xs text-slate-400 mt-1">
                *Teks wajib mengenai batas waktu 5 hari kerja tanggapan tertulis dari pekerja sejak menerima surat.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: HAK KOMPENSASI & LEMBAR TANGGAPAN */}
        {activeTab === 'hak' && (
          <div className="space-y-5">
            
            {/* Tracking Status Penerimaan & Batas 5 Hari Kerja */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Pelacakan Batas Tanggapan 5 Hari Kerja (Pasal 38 PP 35/2021)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tanggal Diterima Oleh Pekerja
                  </label>
                  <input
                    type="date"
                    value={letter.receivedDate || ''}
                    onChange={(e) => onUpdateLetter({ receivedDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Batas Waktu Tanggapan (Maks. 5 Hari Kerja)
                  </label>
                  <div className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      {responseDeadlineDate ? formatIndonesianDate(responseDeadlineDate) : '-'}
                    </span>
                    {remainingWorkingDays !== null && (
                      <span
                        className={`text-2xs font-bold px-2 py-0.5 rounded ${
                          remainingWorkingDays < 0
                            ? 'bg-rose-100 text-rose-800'
                            : remainingWorkingDays <= 2
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {remainingWorkingDays < 0
                          ? 'Batas Berakhir'
                          : `Sisa ${remainingWorkingDays} hari kerja`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {letter.receivedDate && (
                <p className="text-2xs text-slate-500">
                  Sesuai Pasal 38 PP 35/2021, jika dalam 5 hari kerja pekerja tidak memberikan tanggapan tertulis, maka pekerja dianggap menyetujui PHK dan pengusaha melaporkan ke instansi ketenagakerjaan.
                </p>
              )}
            </div>

            {/* Opsi Lembar Tanda Terima Cetak */}
            <div className="flex items-center space-x-2.5 pt-1">
              <input
                type="checkbox"
                id="receiptFormCheckbox"
                checked={letter.includeReceiptForm}
                onChange={(e) => onUpdateLetter({ includeReceiptForm: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="receiptFormCheckbox" className="text-xs text-slate-800 font-semibold cursor-pointer">
                Lampirkan Formulir Tanda Terima & Pernyataan Tanggapan Pekerja (Pasal 38)
              </label>
            </div>

            {/* Rincian Kompensasi & Hak Pekerja */}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    id="compensationCheckbox"
                    checked={letter.compensation.includeCompensation}
                    onChange={(e) =>
                      onUpdateLetter({
                        compensation: {
                          ...letter.compensation,
                          includeCompensation: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="compensationCheckbox" className="text-xs text-slate-800 font-semibold cursor-pointer">
                    Lampirkan Rincian Hak Kompensasi (Pesangon, UPMK, UPH)
                  </label>
                </div>

                {letter.compensation.includeCompensation && (
                  <button
                    type="button"
                    onClick={handleCalculateStandardCompensation}
                    className="text-2xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors flex items-center space-x-1.5"
                    title="Hitung otomatis standar PP 35/2021 berdasarkan masa kerja"
                  >
                    <RefreshCw className="w-3 h-3 text-indigo-600" />
                    <span>Hitung Otomatis PP 35</span>
                  </button>
                )}
              </div>

              {letter.compensation.includeCompensation && (
                <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                        Upah Pokok Terakhir (Rp)
                      </label>
                      <input
                        type="number"
                        value={letter.compensation.baseSalary || ''}
                        onChange={(e) =>
                          onUpdateLetter({
                            compensation: {
                              ...letter.compensation,
                              baseSalary: Number(e.target.value),
                            },
                          })
                        }
                        placeholder="10000000"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                        Masa Kerja (Tahun)
                      </label>
                      <input
                        type="number"
                        value={letter.compensation.yearsOfService || ''}
                        onChange={(e) =>
                          onUpdateLetter({
                            compensation: {
                              ...letter.compensation,
                              yearsOfService: Number(e.target.value),
                            },
                          })
                        }
                        placeholder="5"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                        Masa Kerja (Bulan)
                      </label>
                      <input
                        type="number"
                        value={letter.compensation.monthsOfService || ''}
                        onChange={(e) =>
                          onUpdateLetter({
                            compensation: {
                              ...letter.compensation,
                              monthsOfService: Number(e.target.value),
                            },
                          })
                        }
                        placeholder="3"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                        Uang Pesangon (UP)
                      </label>
                      <input
                        type="number"
                        value={letter.compensation.severancePay || ''}
                        onChange={(e) =>
                          onUpdateLetter({
                            compensation: {
                              ...letter.compensation,
                              severancePay: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                        Penghargaan Masa Kerja (UPMK)
                      </label>
                      <input
                        type="number"
                        value={letter.compensation.serviceRewardPay || ''}
                        onChange={(e) =>
                          onUpdateLetter({
                            compensation: {
                              ...letter.compensation,
                              serviceRewardPay: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                        Penggantian Hak (UPH)
                      </label>
                      <input
                        type="number"
                        value={letter.compensation.rightsCompensationPay || ''}
                        onChange={(e) =>
                          onUpdateLetter({
                            compensation: {
                              ...letter.compensation,
                              rightsCompensationPay: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between shadow-xs">
                    <span className="text-xs text-slate-300 font-medium">Total Estimasi Hak Kompensasi:</span>
                    <span className="text-indigo-400 font-bold text-sm sm:text-base">
                      {formatCurrencyIDR(
                        (letter.compensation.severancePay || 0) +
                          (letter.compensation.serviceRewardPay || 0) +
                          (letter.compensation.rightsCompensationPay || 0) +
                          (letter.compensation.otherAllowances || 0)
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: KOP SURAT & PROFIL PERUSAHAAN */}
        {activeTab === 'perusahaan' && (
          <div className="space-y-5">
            {/* Multi-PT Selector Bar */}
            {companies && companies.length > 0 && (
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold tracking-tight">Pilih Profil PT untuk Kop Surat:</span>
                  </div>
                  {onOpenCompanyModal && (
                    <button
                      type="button"
                      onClick={onOpenCompanyModal}
                      className="text-3xs font-bold text-indigo-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      Kelola Semua PT ↗
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {companies.map((c) => {
                    const isSelected = c.id === company.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onSelectCompany && onSelectCompany(c.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all flex items-center space-x-2.5 ${
                          isSelected
                            ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-xs'
                            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/10 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                          {c.logoUrl ? (
                            <img src={c.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <Building2 className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-2xs font-bold truncate leading-tight">{c.name}</p>
                          <p className="text-3xs text-slate-400 truncate">{c.city || 'Kop Resmi'}</p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start space-x-2.5">
              <Building2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-indigo-950">Kop Surat Resmi Badan Usaha:</span> Informasi kop surat akan dicantumkan di bagian atas lembar resmi lengkap dengan garis pembatas ganda standar surat dinas.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Nama Perusahaan (Badan Usaha) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateCompany({ name: cleanAndFormatCompanyName(company.name) })}
                      title="Ubah ke format resmi PUEBI: huruf kapital dan singkatan PT tanpa tanda titik"
                      className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-3xs font-semibold border border-indigo-200 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Format Baku (PUEBI/EYD)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateCompany({ name: toTitleCaseCompanyName(company.name) })}
                      title="Ubah ke format huruf kapital pada setiap awal kata"
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-3xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                    >
                      Title Case
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => onUpdateCompany({ name: e.target.value })}
                  placeholder="PT NAMA PERUSAHAAN"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-bold tracking-wide transition-all"
                />
                <div className="flex flex-wrap items-center justify-between gap-1 text-2xs text-slate-500 mt-1">
                  <span>Kaidah Baku: Singkatan PT ditulis tanpa titik (<strong>PT</strong>, bukan PT.) dan nama berhuruf kapital.</span>
                  {/\bPT\.\s*/i.test(company.name) && (
                    <span className="text-amber-600 font-medium">Terdapat titik pada 'PT.', klik 'Format Baku' untuk merapikan</span>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sub-nama / Divisi Pengirim
                </label>
                <input
                  type="text"
                  value={company.subName || ''}
                  onChange={(e) => onUpdateCompany({ subName: e.target.value })}
                  placeholder="Human Resources & General Affairs Department"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Alamat Kantor
                </label>
                <input
                  type="text"
                  value={company.address}
                  onChange={(e) => onUpdateCompany({ address: e.target.value })}
                  placeholder="Jl. Jend. Sudirman Kav. 52-53"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Kota Perusahaan
                </label>
                <input
                  type="text"
                  value={company.city}
                  onChange={(e) => onUpdateCompany({ city: e.target.value })}
                  placeholder="Jakarta Selatan"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={company.postalCode ?? ''}
                  onChange={(e) => onUpdateCompany({ postalCode: e.target.value })}
                  placeholder="12190"
                  maxLength={10}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  No. Telepon / Fax
                </label>
                <input
                  type="text"
                  value={company.phone}
                  onChange={(e) => onUpdateCompany({ phone: e.target.value })}
                  placeholder="(021) 5299-8800"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email Perusahaan
                </label>
                <input
                  type="email"
                  value={company.email}
                  onChange={(e) => onUpdateCompany({ email: e.target.value })}
                  placeholder="hrd@perusahaan.co.id"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Website Perusahaan
                </label>
                <input
                  type="text"
                  value={company.website || ''}
                  onChange={(e) => onUpdateCompany({ website: e.target.value })}
                  placeholder="www.perusahaan.co.id"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-slate-200">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-14 h-14 rounded-xl border border-slate-300 bg-white p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt="Logo"
                            className="max-h-full max-w-full object-contain rounded"
                          />
                        ) : (
                          <Building2 className="w-7 h-7 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-slate-900">Logo Resmi Perusahaan</h4>
                          <span
                            className={`text-3xs font-semibold px-2 py-0.5 rounded-full ${
                              company.showLogo !== false
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {company.showLogo !== false ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <p className="text-2xs text-slate-500 mt-0.5">
                          {company.logoUrl
                            ? 'Logo khusus aktif dan ditampilkan pada kop surat.'
                            : 'Menggunakan simbol korporat standar. Unggah atau pilih logo Anda.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {onOpenLogoModal && (
                        <button
                          type="button"
                          onClick={onOpenLogoModal}
                          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center space-x-1.5"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Menu Unggah / Ganti Logo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pengaturan Cepat: Ukuran, Bentuk, Garis Kop, & Tata Letak */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-200/70">
                    {/* Tata Letak Kop */}
                    <div>
                      <span className="block mb-1.5 text-2xs font-bold text-slate-700 uppercase">
                        Tata Letak Kop
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { l: 'Tengah (Simetris)', v: 'center' },
                          { l: 'Rata Kiri', v: 'left' },
                        ].map((item) => (
                          <button
                            key={item.v}
                            type="button"
                            onClick={() => onUpdateCompany({ kopAlignment: item.v as any })}
                            className={`py-1 px-1 text-2xs font-semibold rounded border transition-all ${
                              (company.kopAlignment || 'center') === item.v
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {item.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ukuran Logo */}
                    <div>
                      <span className="block mb-1.5 text-2xs font-bold text-slate-700 uppercase">
                        Ukuran Logo: {company.logoSize || 64}px
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { l: '48px', v: 48 },
                          { l: '64px', v: 64 },
                          { l: '80px', v: 80 },
                          { l: '96px', v: 96 },
                        ].map((item) => (
                          <button
                            key={item.v}
                            type="button"
                            onClick={() => onUpdateCompany({ logoSize: item.v })}
                            className={`py-1 text-2xs font-semibold rounded border transition-all ${
                              (company.logoSize || 64) === item.v
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {item.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gaya Bingkai */}
                    <div>
                      <span className="block mb-1.5 text-2xs font-bold text-slate-700 uppercase">
                        Bingkai Logo
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { l: 'Asli', v: 'original' },
                          { l: 'Bulat', v: 'circle' },
                          { l: 'Halus', v: 'rounded' },
                          { l: 'Kotak', v: 'bordered' },
                        ].map((item) => (
                          <button
                            key={item.v}
                            type="button"
                            onClick={() => onUpdateCompany({ logoShape: item.v as any })}
                            className={`py-1 text-2xs font-semibold rounded border transition-all ${
                              (company.logoShape || 'original') === item.v
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {item.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Garis Pembatas Kop */}
                    <div>
                      <span className="block mb-1.5 text-2xs font-bold text-slate-700 uppercase">
                        Garis Pembatas Kop
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { l: 'Ganda', v: 'double' },
                          { l: 'Tunggal', v: 'single' },
                          { l: 'Tebal', v: 'bold' },
                          { l: 'Tanpa', v: 'none' },
                        ].map((item) => (
                          <button
                            key={item.v}
                            type="button"
                            onClick={() => onUpdateCompany({ kopBorder: item.v as any })}
                            className={`py-1 text-2xs font-semibold rounded border transition-all ${
                              (company.kopBorder || 'double') === item.v
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {item.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showLogoCheckbox"
                        checked={company.showLogo !== false}
                        onChange={(e) => onUpdateCompany({ showLogo: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <label htmlFor="showLogoCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer">
                        Tampilkan lambang logo resmi di kop surat
                      </label>
                    </div>

                    {company.logoUrl && (
                      <button
                        type="button"
                        onClick={() => onUpdateCompany({ logoUrl: '' })}
                        className="text-2xs text-rose-600 hover:text-rose-800 font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus Logo Khusus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Tab Stepper Navigation */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between gap-2 no-print shrink-0">
          {prevTab ? (
            <button
              type="button"
              onClick={() => setActiveTab(prevTab.id)}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center space-x-1.5 shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
              <span>Sebelumnya: {prevTab.label}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="text-2xs font-semibold text-slate-400">
            Langkah {currentTabIndex + 1} dari {FORM_TABS.length}
          </div>

          {nextTab ? (
            <button
              type="button"
              onClick={() => setActiveTab(nextTab.id)}
              className="px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center space-x-1.5 shadow-xs"
            >
              <span>Lanjut: {nextTab.label}</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSaveToHistory}
              className="px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center space-x-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Simpan ke Arsip</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
