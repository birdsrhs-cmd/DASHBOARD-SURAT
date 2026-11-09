import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Trash2,
  Check,
  Building,
  Sparkles,
  Sliders,
  Maximize2
} from 'lucide-react';
import { CompanyProfile } from '../types';
import { DEFAULT_COMPANY } from '../data/presets';

interface EditLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: CompanyProfile;
  onUpdateCompany: (updated: Partial<CompanyProfile>) => void;
  onShowToast?: (message: string) => void;
}

// Koleksi template logo preset (SVG data URLs bersih dan profesional)
const PRESET_LOGOS = [
  {
    name: 'Corporate Emblem (Perisai Emas)',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Crect width='100' height='100' rx='20' fill='%231e293b'/%3E%3Cpath d='M50 20 L75 32 V52 C75 68 50 80 50 80 C50 80 25 68 25 52 V32 Z' fill='%23e2e8f0' stroke='%2338bdf8' stroke-width='3'/%3E%3Cpath d='M50 30 L65 40 V52 C65 63 50 71 50 71 C50 71 35 63 35 52 V40 Z' fill='%230284c7'/%3E%3Ccircle cx='50' cy='48' r='7' fill='%23ffffff'/%3E%3C/svg%3E",
  },
  {
    name: 'Modern Geometris (Indigo Cube)',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Crect width='100' height='100' rx='20' fill='%234338ca'/%3E%3Cpath d='M50 22 L76 37 V67 L50 82 L24 67 V37 Z' fill='none' stroke='%23ffffff' stroke-width='4'/%3E%3Cpath d='M50 22 V52 M76 37 L50 52 M24 37 L50 52 M50 52 V82' stroke='%23c7d2fe' stroke-width='3'/%3E%3Ccircle cx='50' cy='52' r='6' fill='%23a5b4fc'/%3E%3C/svg%3E",
  },
  {
    name: 'Nusantara Heritage (Monogram Merah Emas)',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Crect width='100' height='100' rx='20' fill='%23991b1b'/%3E%3Ccircle cx='50' cy='50' r='30' stroke='%23fef08a' stroke-width='3' stroke-dasharray='4 2'/%3E%3Ctext x='50' y='58' font-family='serif' font-size='26' font-weight='bold' fill='%23ffffff' text-anchor='middle'%3EPT%3C/text%3E%3C/svg%3E",
  },
  {
    name: 'Eco Green Growth (Daun Sinergi)',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Crect width='100' height='100' rx='20' fill='%23065f46'/%3E%3Cpath d='M30 70 C30 40 50 25 70 25 C70 55 50 70 30 70 Z' fill='%2334d399'/%3E%3Cpath d='M30 70 C45 60 55 45 70 25' stroke='%23ffffff' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E",
  },
];

export const EditLogoModal: React.FC<EditLogoModalProps> = ({
  isOpen,
  onClose,
  company,
  onUpdateCompany,
  onShowToast,
}) => {
  const effectiveCompany = company || DEFAULT_COMPANY;
  const [activeSourceTab, setActiveSourceTab] = useState<'upload' | 'url' | 'preset'>('upload');
  const [urlInput, setUrlInput] = useState(effectiveCompany.logoUrl || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync urlInput when company logo changes
  useEffect(() => {
    setUrlInput(effectiveCompany.logoUrl || '');
  }, [effectiveCompany.logoUrl]);

  if (!isOpen) return null;

  const currentSize = effectiveCompany.logoSize || 64;
  const currentShape = effectiveCompany.logoShape || 'rounded';
  const isLogoActive = effectiveCompany.showLogo !== false;

  // Konversi berkas yang diunggah menjadi Base64 DataURL
  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file maksimal 3 MB agar dokumen tetap ringan.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onUpdateCompany({
          logoUrl: dataUrl,
          showLogo: true,
        });
        setUrlInput(dataUrl);
        if (onShowToast) onShowToast('Logo berhasil diunggah.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      alert('Silakan masukkan tautan URL gambar terlebih dahulu.');
      return;
    }
    onUpdateCompany({
      logoUrl: trimmed,
      showLogo: true,
    });
    if (onShowToast) onShowToast('URL logo berhasil diterapkan.');
  };

  const handleRemoveLogo = () => {
    onUpdateCompany({
      logoUrl: '',
    });
    setUrlInput('');
    if (onShowToast) onShowToast('Logo telah dihapus dari kop surat.');
  };

  const getShapeClasses = (shape: string) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full overflow-hidden border border-slate-300 bg-white p-0.5';
      case 'bordered':
        return 'rounded-lg border-2 border-slate-300 bg-white p-1 shadow-xs';
      case 'rounded':
        return 'rounded-xl border border-slate-200 bg-slate-50/50 p-1';
      case 'original':
      default:
        return 'rounded-none bg-transparent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Menu Edit Logo Perusahaan</h3>
              <p className="text-xs text-slate-300">
                Sesuaikan logo resmi untuk kop surat pemberitahuan PHK
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Utama */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto text-xs sm:text-sm text-slate-700">
          
          {/* Status Toggle Tampilkan Logo */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="modalShowLogoToggle"
                checked={isLogoActive}
                onChange={(e) => onUpdateCompany({ showLogo: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <div>
                <label htmlFor="modalShowLogoToggle" className="text-xs font-bold text-slate-900 cursor-pointer block">
                  Tampilkan Logo di Kop Surat
                </label>
                <p className="text-2xs text-slate-500">
                  Logo akan dicetak pada sisi kiri atas kop surat resmi A4
                </p>
              </div>
            </div>
            <span
              className={`text-2xs font-semibold px-2.5 py-1 rounded-full ${
                isLogoActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isLogoActive ? 'Aktif Ditampilkan' : 'Disembunyikan'}
            </span>
          </div>

          {/* Tab Sumber Logo: Upload / URL / Preset */}
          <div>
            <label className="block mb-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Pilih Sumber Logo
            </label>
            <div className="flex space-x-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveSourceTab('upload')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  activeSourceTab === 'upload'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Berkas</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSourceTab('url')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  activeSourceTab === 'url'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Tautan URL</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSourceTab('preset')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  activeSourceTab === 'preset'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Logo Contoh</span>
              </button>
            </div>

            {/* Panel Tab 1: Upload File */}
            {activeSourceTab === 'upload' && (
              <div className="mt-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Klik untuk memilih file atau seret & lepas gambar logo ke sini
                  </p>
                  <p className="text-2xs text-slate-500 mt-1">
                    Mendukung PNG transparan, JPG, SVG, atau WebP (Maks. 3 MB)
                  </p>
                </div>
              </div>
            )}

            {/* Panel Tab 2: Tautan URL */}
            {activeSourceTab === 'url' && (
              <div className="mt-3 space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://perusahaan.co.id/assets/logo.png"
                    className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shrink-0"
                  >
                    Terapkan URL
                  </button>
                </div>
                <p className="text-2xs text-slate-500">
                  Gunakan URL publik langsung dari hosting situs atau cloud storage Anda.
                </p>
              </div>
            )}

            {/* Panel Tab 3: Preset Contoh */}
            {activeSourceTab === 'preset' && (
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {PRESET_LOGOS.map((preset, idx) => {
                  const isSelected = effectiveCompany.logoUrl === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onUpdateCompany({
                          logoUrl: preset.url,
                          showLogo: true,
                        });
                        setUrlInput(preset.url);
                        if (onShowToast) onShowToast(`Logo preset "${preset.name}" dipilih.`);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-10 h-10 object-contain rounded-md shrink-0 border border-slate-200 bg-white"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-2xs font-bold text-slate-800 truncate">{preset.name}</p>
                        <p className="text-3xs text-slate-500">Klik terapkan</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pengaturan Ukuran & Bentuk Bingkai Logo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Ukuran Logo */}
            <div>
              <label className="block mb-2 text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>2. Ukuran Logo ({currentSize}px)</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Kecil', size: 48 },
                  { label: 'Sedang', size: 64 },
                  { label: 'Besar', size: 80 },
                  { label: 'Ekstra', size: 96 },
                ].map((item) => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => onUpdateCompany({ logoSize: item.size })}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      currentSize === item.size
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bentuk / Gaya Bingkai */}
            <div>
              <label className="block mb-2 text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>3. Gaya Bingkai</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Asli', val: 'original' },
                  { label: 'Bulat', val: 'circle' },
                  { label: 'Rounded', val: 'rounded' },
                  { label: 'Kotak', val: 'bordered' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => onUpdateCompany({ logoShape: item.val as any })}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      currentShape === item.val
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pengaturan Garis Pembatas Kop Surat */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block mb-2 text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>4. Gaya Garis Kop Surat</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Ganda Resmi', val: 'double' },
                { label: 'Garis Tunggal', val: 'single' },
                { label: 'Garis Tebal', val: 'bold' },
                { label: 'Tanpa Garis', val: 'none' },
              ].map((item) => {
                const isSelected = (company.kopBorder || 'double') === item.val;
                return (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => onUpdateCompany({ kopBorder: item.val as any })}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pratinjau Kop Surat Miniatur */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pratinjau Tampilan Kop Surat
              </label>
              {effectiveCompany.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-2xs text-rose-600 hover:text-rose-800 font-semibold flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus Logo</span>
                </button>
              )}
            </div>

            <div className="p-4 bg-white border border-slate-300 rounded-xl shadow-xs">
              <div className="pb-1">
                <div className="flex items-center justify-between">
                  {/* Sisi Kiri: Logo */}
                  {isLogoActive && (
                    <div
                      style={{
                        width: `${Math.min(currentSize, 56)}px`,
                        minWidth: `${Math.min(currentSize, 56)}px`,
                      }}
                      className="shrink-0 flex items-center justify-start"
                    >
                      <div
                        style={{
                          maxHeight: `${Math.min(currentSize, 56)}px`,
                          maxWidth: '100%',
                        }}
                        className={`flex items-center justify-center ${getShapeClasses(currentShape)}`}
                      >
                        {effectiveCompany.logoUrl ? (
                          <img
                            src={effectiveCompany.logoUrl}
                            alt="Logo Perusahaan"
                            style={{
                              maxHeight: `${Math.min(currentSize, 56)}px`,
                              maxWidth: '100%',
                            }}
                            className="object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Building className="w-6 h-6 text-slate-500" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sisi Tengah: Teks Kop (Center) */}
                  <div className="flex-1 text-center min-w-0 px-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase font-serif tracking-wider truncate">
                      {effectiveCompany.name || 'NAMA PERUSAHAAN'}
                    </h4>
                    {effectiveCompany.subName && (
                      <p className="text-3xs sm:text-2xs font-medium text-slate-700 truncate mt-0.5 font-sans">
                        {effectiveCompany.subName}
                      </p>
                    )}
                    <p className="text-3xs text-slate-600 truncate mt-0.5 font-sans">
                      {[effectiveCompany.address, effectiveCompany.city].filter(Boolean).join(', ')}
                      {effectiveCompany.postalCode ? ` ${effectiveCompany.postalCode}` : ''}
                    </p>
                    <p className="text-3xs text-slate-500 truncate font-sans">
                      Telp: {effectiveCompany.phone || '-'} | Email: {effectiveCompany.email || '-'}
                    </p>
                  </div>

                  {/* Sisi Kanan: Balancer Simetris */}
                  {isLogoActive && (
                    <div
                      style={{
                        width: `${Math.min(currentSize, 56)}px`,
                        minWidth: `${Math.min(currentSize, 56)}px`,
                      }}
                      className="shrink-0 pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Garis Pembatas Kop Sesuai Pilihan */}
                {effectiveCompany.kopBorder === 'single' ? (
                  <div className="mt-2.5 border-b-[2px] border-slate-900" />
                ) : effectiveCompany.kopBorder === 'bold' ? (
                  <div className="mt-2.5 border-b-[3px] border-slate-900" />
                ) : effectiveCompany.kopBorder === 'none' ? null : (
                  <div className="mt-2.5 space-y-[1.5px]" aria-hidden="true">
                    <div className="h-[2px] bg-slate-950 w-full"></div>
                    <div className="h-[0.75px] bg-slate-950 w-full"></div>
                  </div>
                )}
              </div>
              <p className="text-3xs text-slate-400 text-center mt-2 italic">
                *Tampilan kop dan logo di atas tersinkronisasi 1:1 ke pratinjau A4 dan ekspor Word.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-2xs text-slate-500">
            Perubahan otomatis tersimpan di peramban Anda.
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-200 flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Selesai & Terapkan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
