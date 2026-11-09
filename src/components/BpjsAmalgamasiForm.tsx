import React, { useState } from 'react';
import {
  Building2,
  User,
  Calendar,
  CreditCard,
  Briefcase,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Building,
  Save,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { BpjsAmalgamationData, CompanyProfile } from '../types';

interface BpjsAmalgamasiFormProps {
  data: BpjsAmalgamationData;
  onChange: (data: BpjsAmalgamationData) => void;
  activeCompany?: CompanyProfile;
  onSave?: () => void;
}

export const BpjsAmalgamasiForm: React.FC<BpjsAmalgamasiFormProps> = ({
  data,
  onChange,
  activeCompany,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'perusahaan' | 'karyawan' | 'riwayat' | 'pengesahan' | 'berkas'>('perusahaan');

  const updateField = <K extends keyof BpjsAmalgamationData>(
    field: K,
    value: BpjsAmalgamationData[K]
  ) => {
    onChange({
      ...data,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  // Auto-fill from active company
  const handleApplyCompany = () => {
    if (!activeCompany) return;
    onChange({
      ...data,
      companyName: activeCompany.name,
      submitterCompany: activeCompany.name,
      updatedAt: new Date().toISOString(),
    });
  };

  // Work History Handlers
  const handleAddWorkHistory = () => {
    const nextIndex = (data.workHistories?.length || 0) + 1;
    const newHistories = [
      ...(data.workHistories || []),
      `PT PERUSAHAAN SEBELUMNYA ${nextIndex} (Masa Kerja: .... s/d ....) - KPJ: ....`,
    ];
    updateField('workHistories', newHistories);
  };

  const handleUpdateWorkHistory = (index: number, val: string) => {
    const updated = [...(data.workHistories || [])];
    updated[index] = val;
    updateField('workHistories', updated);
  };

  const handleRemoveWorkHistory = (index: number) => {
    const updated = (data.workHistories || []).filter((_, i) => i !== index);
    updateField('workHistories', updated);
  };

  // Checklist handler
  const handleToggleChecklist = (key: keyof NonNullable<BpjsAmalgamationData['attachmentsChecklist']>) => {
    const currentChecklist = data.attachmentsChecklist || {
      formAmalgamasi: true,
      oldKpjCopy: true,
      newKpjOriginal: true,
      workReferenceLetters: true,
      ktpCopy: true,
      kkCopy: true,
      bankBookCopy: false,
    };
    updateField('attachmentsChecklist', {
      ...currentChecklist,
      [key]: !currentChecklist[key],
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Form Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shadow-2xs shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Formulir Penggabungan Saldo (Amalgamasi)
            </h2>
            <span className="text-3xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              BPJS Ketenagakerjaan
            </span>
          </div>
          <p className="text-2xs text-slate-500 mt-0.5">
            Dokumen baku FM/KC/01/02/005 untuk penggabungan kartu KPJ lama ke kartu baru
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 flex space-x-2 overflow-x-auto shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('perusahaan')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'perusahaan'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>1 & 2. Perusahaan & NPP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('karyawan')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'karyawan'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>3. Data Tenaga Kerja</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('riwayat')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'riwayat'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>4. Riwayat Pekerjaan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pengesahan')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'pengesahan'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Pengesahan & TTD</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('berkas')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'berkas'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Checklist Syarat</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: PERUSAHAAN & NPP */}
        {activeTab === 'perusahaan' && (
          <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Identitas Perusahaan & Nomor NPP</h3>
                <p className="text-2xs text-slate-500">
                  Data perusahaan pemberi kerja saat ini tempat pekerja terdaftar aktif
                </p>
              </div>

              {activeCompany && (
                <button
                  type="button"
                  onClick={handleApplyCompany}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Isi dari PT Aktif ({activeCompany.name.split(' ')[1] || 'PT'})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Nama Perusahaan (Pemberi Kerja Saat Ini) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="Misal: PT NAMA PERUSAHAAN"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. N.P.P (Nomor Pendaftaran Perusahaan) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.companyNpp}
                  onChange={(e) => updateField('companyNpp', e.target.value)}
                  placeholder="Misal: JA09283741 / 12345678"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-3xs text-slate-400 mt-1">
                  Nomor Pendaftaran Perusahaan dari sertifikat kepesertaan BPJS Ketenagakerjaan
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Dikeluarkan Formulir
                </label>
                <input
                  type="date"
                  value={data.issueDate}
                  onChange={(e) => updateField('issueDate', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:col-span-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-2xs font-semibold text-slate-500 mb-1">
                    No Dokumen Baku
                  </label>
                  <input
                    type="text"
                    value={data.documentNumber}
                    onChange={(e) => updateField('documentNumber', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-500 mb-1">
                    No. Revisi
                  </label>
                  <input
                    type="text"
                    value={data.revisionNumber}
                    onChange={(e) => updateField('revisionNumber', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DATA TENAGA KERJA */}
        {activeTab === 'karyawan' && (
          <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">3. Data Tenaga Kerja & Nomor Kartu KPJ</h3>
              <p className="text-2xs text-slate-500">
                Informasi identitas pekerja dan nomor kartu kepesertaan yang akan digabungkan
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3.1. Nama Tenaga Kerja <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.employeeName}
                  onChange={(e) => updateField('employeeName', e.target.value)}
                  placeholder="Misal: BAMBANG HERMAWAN, S.T."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3.2 Tempat Lahir
                </label>
                <input
                  type="text"
                  value={data.birthPlace}
                  onChange={(e) => updateField('birthPlace', e.target.value)}
                  placeholder="Misal: Jakarta / Surabaya"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3.2 Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={data.birthDate}
                  onChange={(e) => updateField('birthDate', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl sm:col-span-2">
                <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs mb-1">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>3.3. No Kartu Peserta Lama (Fotokopi)</span>
                </div>
                <input
                  type="text"
                  value={data.oldKpjNumber}
                  onChange={(e) => updateField('oldKpjNumber', e.target.value)}
                  placeholder="Misal: 14018294719 (PT Sumber Makmur Sejahtera)"
                  className="w-full px-3 py-2 text-xs font-mono border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
                <p className="text-3xs text-amber-700 mt-1">
                  Nomor KPJ kepesertaan sebelumnya yang ingin saldonya dipindahkan / digabungkan
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl sm:col-span-2">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs mb-1">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>3.4. No Kartu Peserta Baru (Asli Terlampir)</span>
                </div>
                <input
                  type="text"
                  value={data.newKpjNumber}
                  onChange={(e) => updateField('newKpjNumber', e.target.value)}
                  placeholder="Misal: 22091823019"
                  className="w-full px-3 py-2 text-xs font-mono border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-bold"
                />
                <p className="text-3xs text-emerald-700 mt-1">
                  Nomor KPJ kepesertaan aktif saat ini tempat saldo akan ditampung / digabungkan
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RIWAYAT PEKERJAAN */}
        {activeTab === 'riwayat' && (
          <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">4. Riwayat Pekerjaan</h3>
                <p className="text-2xs text-slate-500">
                  Daftar perusahaan sebelumnya tempat pekerja bekerja (referensi kerja / parklaring terlampir)
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddWorkHistory}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tambah Riwayat</span>
              </button>
            </div>

            <div className="space-y-3">
              {data.workHistories && data.workHistories.length > 0 ? (
                data.workHistories.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-6 text-xs font-bold text-slate-500 text-center shrink-0">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleUpdateWorkHistory(idx, e.target.value)}
                      placeholder="Nama PT, periode kerja, dan nomor parklaring / KPJ..."
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveWorkHistory(idx)}
                      title="Hapus Baris"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Belum ada riwayat pekerjaan yang ditambahkan. Klik "Tambah Riwayat" di atas.
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-2xs text-slate-600">
              <strong>Tips HR:</strong> Cantumkan nama PT lengkap, masa kerja (tahun awal s/d akhir), dan nomor surat parklaring jika ada untuk mempermudah verifikasi petugas BPJS Ketenagakerjaan.
            </div>
          </div>
        )}

        {/* TAB 4: PENGESAHAN & PENERIMA */}
        {activeTab === 'pengesahan' && (
          <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Kolom Pengesahan & Penyerahan Formulir</h3>
              <p className="text-2xs text-slate-500">
                Pihak yang menyerahkan formulir (karyawan/atasan) dan penerima di loket BPJS Ketenagakerjaan
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Kolom Kiri: Penyerah */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Diserahkan oleh (Karyawan / Atasan)</span>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">
                    Nama Penyerah
                  </label>
                  <input
                    type="text"
                    value={data.submitterName}
                    onChange={(e) => updateField('submitterName', e.target.value)}
                    placeholder="Nama terang penandatangan"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">
                    Status Penyerah
                  </label>
                  <select
                    value={data.submitterRole}
                    onChange={(e) => updateField('submitterRole', e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="karyawan">Karyawan (Pekerja Bersangkutan)</option>
                    <option value="atasan">Atasan Langsung</option>
                    <option value="hrd">HRD / Perwakilan Perusahaan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">
                    Tanggal Penyerahan
                  </label>
                  <input
                    type="date"
                    value={data.submissionDate}
                    onChange={(e) => updateField('submissionDate', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Kolom Kanan: Penerima BPJS */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Diterima oleh (Customer Service BPJS)</span>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">
                    Nama Petugas Customer Service (Opsional)
                  </label>
                  <input
                    type="text"
                    value={data.csName || ''}
                    onChange={(e) => updateField('csName', e.target.value)}
                    placeholder="Kosongkan jika ditandatangani saat di loket BPJS"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">
                    Kantor Cabang BPJS Ketenagakerjaan
                  </label>
                  <input
                    type="text"
                    value={data.branchOffice || ''}
                    onChange={(e) => updateField('branchOffice', e.target.value)}
                    placeholder="Misal: Kantor Cabang Jakarta Sudirman"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">
                    Tanggal Diterima Loket
                  </label>
                  <input
                    type="date"
                    value={data.receiptDate || ''}
                    onChange={(e) => updateField('receiptDate', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CHECKLIST SYARAT BERKAS */}
        {activeTab === 'berkas' && (
          <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Checklist Berkas Amalgamasi BPJS</h3>
              <p className="text-2xs text-slate-500">
                Verifikasi dokumen kelengkapan sebelum berkas diserahkan ke kantor cabang BPJS Ketenagakerjaan
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: 'formAmalgamasi' as const,
                  label: 'Formulir Permintaan Penggabungan Saldo (Asli & Ditandatangani)',
                  desc: 'Dokumen ini dicetak pada kertas A4.',
                },
                {
                  key: 'newKpjOriginal' as const,
                  label: 'Kartu Peserta BPJS Ketenagakerjaan (KPJ) Baru (Asli Terlampir)',
                  desc: 'Kartu fisik asli atau kartu digital dari aplikasi JMO.',
                },
                {
                  key: 'oldKpjCopy' as const,
                  label: 'Kartu Peserta BPJS Ketenagakerjaan (KPJ) Lama (Fotokopi)',
                  desc: 'Fotokopi nomor KPJ lama yang saldonya ingin digabungkan.',
                },
                {
                  key: 'workReferenceLetters' as const,
                  label: 'Surat Pengalaman Kerja / Parklaring Asli dari Perusahaan Sebelumnya',
                  desc: 'Sebagai bukti bahwa hubungan kerja di perusahaan lama telah berakhir.',
                },
                {
                  key: 'ktpCopy' as const,
                  label: 'Fotokopi KTP Elektronik (e-KTP) Pemohon',
                  desc: 'Untuk validasi data NIK Kependudukan.',
                },
                {
                  key: 'kkCopy' as const,
                  label: 'Fotokopi Kartu Keluarga (KK)',
                  desc: 'Untuk verifikasi kesesuaian data keluarga jika diperlukan.',
                },
                {
                  key: 'bankBookCopy' as const,
                  label: 'Fotokopi Buku Tabungan Karyawan (Opsional)',
                  desc: 'Disiapkan apabila ada permintaan verifikasi rekening aktif.',
                },
              ].map((item) => {
                const checked = data.attachmentsChecklist?.[item.key] ?? false;
                return (
                  <label
                    key={item.key}
                    onClick={() => handleToggleChecklist(item.key)}
                    className={`flex items-start space-x-3 p-3 rounded-xl border transition cursor-pointer ${
                      checked
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="flex-1 text-xs">
                      <span className={`font-semibold ${checked ? 'text-emerald-950' : 'text-slate-800'}`}>
                        {item.label}
                      </span>
                      <p className="text-2xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
