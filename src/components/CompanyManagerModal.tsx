import React, { useState, useRef } from 'react';
import {
  X,
  Building2,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Search,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Sliders,
  Maximize2,
  ArrowRight,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react';
import { CompanyProfile } from '../types';
import { DEFAULT_COMPANIES } from '../data/presets';
import { cleanAndFormatCompanyName } from '../utils/formatCompany';

interface CompanyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanyProfile[];
  activeCompanyId: string;
  onSelectCompany: (id: string) => void;
  onAddCompany: (company: CompanyProfile) => void;
  onUpdateCompany: (id: string, updated: Partial<CompanyProfile>) => void;
  onDeleteCompany: (id: string) => void;
  onDuplicateCompany: (id: string) => void;
  onShowToast: (message: string) => void;
}

const PRESET_LOGOS = [
  {
    name: 'Corporate Emblem (Perisai Biru Emas)',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Crect width='100' height='100' rx='20' fill='%231e293b'/%3E%3Cpath d='M50 20 L75 32 V52 C75 68 50 80 50 80 C50 80 25 68 25 52 V32 Z' fill='%23e2e8f0' stroke='%2338bdf8' stroke-width='3'/%3E%3Cpath d='M50 30 L65 40 V52 C65 63 50 71 50 71 C50 71 35 63 35 52 V40 Z' fill='%230284c7'/%3E%3Ccircle cx='50' cy='48' r='7' fill='%23ffffff'/%3E%3C/svg%3E",
  },
  {
    name: 'Maritim & Logistik (Ombak Biru)',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Crect width='100' height='100' rx='20' fill='%230369a1'/%3E%3Cpath d='M20 68 C35 60 45 72 60 64 C75 56 85 68 90 64 L90 76 C75 80 60 70 45 78 C30 86 20 74 10 78 Z' fill='%2338bdf8'/%3E%3Cpath d='M28 58 L50 32 L72 58 Z' fill='%23f8fafc' stroke='%23bae6fd' stroke-width='2'/%3E%3Cpath d='M50 22 V34 M38 42 H62' stroke='%23f59e0b' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E",
  },
  {
    name: 'Modern Geometris (Indigo Cube)',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Crect width='100' height='100' rx='20' fill='%234338ca'/%3E%3Cpath d='M50 22 L76 37 V67 L50 82 L24 67 V37 Z' fill='none' stroke='%23ffffff' stroke-width='4'/%3E%3Cpath d='M50 22 V52 M76 37 L50 52 M24 37 L50 52 M50 52 V82' stroke='%23c7d2fe' stroke-width='3'/%3E%3Ccircle cx='50' cy='52' r='6' fill='%23a5b4fc'/%3E%3C/svg%3E",
  },
  {
    name: 'Monogram Merah Emas (Klasik Korporasi)',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Crect width='100' height='100' rx='20' fill='%23991b1b'/%3E%3Ccircle cx='50' cy='50' r='30' stroke='%23fef08a' stroke-width='3' stroke-dasharray='4 2'/%3E%3Ctext x='50' y='58' font-family='serif' font-size='24' font-weight='bold' fill='%23ffffff' text-anchor='middle'%3EPT%3C/text%3E%3C/svg%3E",
  },
  {
    name: 'Eco Green Growth (Daun Sinergi)',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Crect width='100' height='100' rx='20' fill='%23065f46'/%3E%3Cpath d='M30 70 C30 40 50 25 70 25 C70 55 50 70 30 70 Z' fill='%2334d399'/%3E%3Cpath d='M30 70 C45 60 55 45 70 25' stroke='%23ffffff' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E",
  },
];

export const CompanyManagerModal: React.FC<CompanyManagerModalProps> = ({
  isOpen,
  onClose,
  companies,
  activeCompanyId,
  onSelectCompany,
  onAddCompany,
  onUpdateCompany,
  onDeleteCompany,
  onDuplicateCompany,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCompany, setEditingCompany] = useState<CompanyProfile | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<CompanyProfile | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeLogoTab, setActiveLogoTab] = useState<'upload' | 'url' | 'preset'>('preset');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.subName && c.subName.toLowerCase().includes(q)) ||
      (c.businessField && c.businessField.toLowerCase().includes(q))
    );
  });

  const activeCompany = companies.find((c) => c.id === activeCompanyId) || companies[0];

  const handleStartCreate = () => {
    const newId = `pt-${Date.now()}`;
    setEditingCompany({
      id: newId,
      name: 'PT NAMA PERUSAHAAN BARU',
      subName: 'Human Resources & General Affairs Department',
      address: 'Jl. Jenderal Sudirman No. 100',
      city: 'Jakarta Pusat',
      postalCode: '10220',
      phone: '(021) 500-1234',
      email: 'hrd@perusahaan.co.id',
      website: 'www.perusahaan.co.id',
      showLogo: true,
      logoSize: 64,
      logoShape: 'rounded',
      kopBorder: 'double',
      kopAlignment: 'center',
      businessField: 'Perdagangan & Jasa',
      logoUrl: PRESET_LOGOS[0].url,
    });
    setIsCreatingNew(true);
    setUrlInput(PRESET_LOGOS[0].url);
  };

  const handleStartEdit = (company: CompanyProfile) => {
    setEditingCompany({ ...company });
    setIsCreatingNew(false);
    setUrlInput(company.logoUrl || '');
  };

  const handleCancelForm = () => {
    setEditingCompany(null);
    setIsCreatingNew(false);
  };

  const handleSaveForm = () => {
    if (!editingCompany) return;

    if (!editingCompany.name.trim()) {
      alert('Nama PT / Perusahaan tidak boleh kosong.');
      return;
    }

    const formattedName = cleanAndFormatCompanyName(editingCompany.name);
    const finalizedCompany: CompanyProfile = {
      ...editingCompany,
      name: formattedName,
    };

    if (isCreatingNew) {
      onAddCompany(finalizedCompany);
      onSelectCompany(finalizedCompany.id);
      onShowToast(`PT baru "${finalizedCompany.name}" berhasil ditambahkan & dijadikan PT aktif.`);
    } else {
      onUpdateCompany(finalizedCompany.id, finalizedCompany);
      onShowToast(`Data profil "${finalizedCompany.name}" berhasil diperbarui.`);
    }

    setEditingCompany(null);
    setIsCreatingNew(false);
  };

  // Upload logo via local file
  const handleFileUpload = (file: File) => {
    if (!file || !editingCompany) return;
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file maksimal 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setEditingCompany({
          ...editingCompany,
          logoUrl: dataUrl,
          showLogo: true,
        });
        setUrlInput(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const getShapeClasses = (shape?: string) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full overflow-hidden border border-slate-300 bg-white p-0.5';
      case 'bordered':
        return 'rounded-lg border-2 border-slate-300 bg-white p-1 shadow-xs';
      case 'rounded':
        return 'rounded-xl border border-slate-200 bg-slate-50 p-1';
      case 'original':
      default:
        return 'rounded-none bg-transparent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">Menu Pengaturan Entitas PT</h3>
                <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {companies.length} PT Terdaftar
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pilih atau kelola profil perusahaan untuk kop surat resmi A4, PHK, dan izin keterlambatan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup Menu PT"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafc]">
          {editingCompany ? (
            /* VIEW FORM EDIT / TAMBAH PT */
            <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isCreatingNew ? 'Tambah Profil PT Baru' : `Edit Profil: ${editingCompany.name}`}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
              </div>

              {/* Grid Input Data Pokok PT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                    Nama Badan Usaha / PT <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingCompany.name}
                    onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                    placeholder="Contoh: PT NAMA PERUSAHAAN"
                    className="w-full text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-3xs text-slate-400 mt-1">
                    Gunakan format baku perseroan, misalnya: "PT NAMA PERUSAHAAN" atau "PT CIPTA KARYA, Tbk."
                  </p>
                </div>

                <div>
                  <label className="block mb-1 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                    Sub-Judul / Divisi Kop Surat
                  </label>
                  <input
                    type="text"
                    value={editingCompany.subName || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, subName: e.target.value })}
                    placeholder="Human Resources & General Affairs"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                    Bidang Usaha / Industri
                  </label>
                  <input
                    type="text"
                    value={editingCompany.businessField || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, businessField: e.target.value })}
                    placeholder="Contoh: Logistik, Manufaktur, IT SaaS"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-1 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                    Alamat Lengkap Kantor
                  </label>
                  <input
                    type="text"
                    value={editingCompany.address}
                    onChange={(e) => setEditingCompany({ ...editingCompany, address: e.target.value })}
                    placeholder="Gedung / Jalan / Nomor / Kawasan Industri"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                    Kota Kedudukan
                  </label>
                  <input
                    type="text"
                    value={editingCompany.city}
                    onChange={(e) => setEditingCompany({ ...editingCompany, city: e.target.value })}
                    placeholder="Jakarta Selatan, Surabaya, Bandung, dll."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    value={editingCompany.postalCode || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, postalCode: e.target.value })}
                    placeholder="12190"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                    Telepon Kantor
                  </label>
                  <input
                    type="text"
                    value={editingCompany.phone}
                    onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                    placeholder="(021) 5299-8800"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Resmi HR / Perusahaan
                  </label>
                  <input
                    type="email"
                    value={editingCompany.email}
                    onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
                    placeholder="hrd@perusahaan.co.id"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                    Website Resmi
                  </label>
                  <input
                    type="text"
                    value={editingCompany.website || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, website: e.target.value })}
                    placeholder="www.perusahaan.co.id"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Logo & Penampilan Kop */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Logo & Desain Kop Surat</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCompany.showLogo !== false}
                      onChange={(e) => setEditingCompany({ ...editingCompany, showLogo: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Tampilkan Logo di Kop</span>
                  </label>
                </div>

                {/* Sumber Logo: Preset / Unggah / URL */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex space-x-1 p-1 bg-slate-200/80 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveLogoTab('preset')}
                      className={`flex-1 py-1.5 rounded-md transition-all ${
                        activeLogoTab === 'preset' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Pilihan Logo Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLogoTab('upload')}
                      className={`flex-1 py-1.5 rounded-md transition-all ${
                        activeLogoTab === 'upload' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Unggah File Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLogoTab('url')}
                      className={`flex-1 py-1.5 rounded-md transition-all ${
                        activeLogoTab === 'url' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Tautan URL
                    </button>
                  </div>

                  {activeLogoTab === 'preset' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_LOGOS.map((preset, idx) => {
                        const isSelected = editingCompany.logoUrl === preset.url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditingCompany({ ...editingCompany, logoUrl: preset.url, showLogo: true })}
                            className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-8 h-8 object-contain rounded shrink-0 bg-white border border-slate-200"
                            />
                            <span className="text-3xs font-semibold text-slate-800 line-clamp-2 leading-tight">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {activeLogoTab === 'upload' && (
                    <div>
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
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white rounded-xl p-4 text-center cursor-pointer transition-all"
                      >
                        <Upload className="w-6 h-6 mx-auto text-indigo-600 mb-1" />
                        <p className="text-xs font-bold text-slate-800">Klik untuk memilih file logo</p>
                        <p className="text-3xs text-slate-500">Mendukung PNG transparan, JPG, SVG (Maks. 3 MB)</p>
                      </div>
                    </div>
                  )}

                  {activeLogoTab === 'url' && (
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://perusahaan.co.id/logo.png"
                        className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (urlInput.trim()) {
                            setEditingCompany({ ...editingCompany, logoUrl: urlInput.trim(), showLogo: true });
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold shrink-0"
                      >
                        Terapkan
                      </button>
                    </div>
                  )}

                  {/* Pengaturan Gaya Kop */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200">
                    <div>
                      <span className="block mb-1 text-3xs font-bold text-slate-600 uppercase">Bentuk Logo</span>
                      <select
                        value={editingCompany.logoShape || 'rounded'}
                        onChange={(e) => setEditingCompany({ ...editingCompany, logoShape: e.target.value as any })}
                        className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="original">Asli (Tanpa Bingkai)</option>
                        <option value="rounded">Sudut Melengkung</option>
                        <option value="circle">Bulat Penuh</option>
                        <option value="bordered">Kotak Berbingkai</option>
                      </select>
                    </div>

                    <div>
                      <span className="block mb-1 text-3xs font-bold text-slate-600 uppercase">Ukuran Logo</span>
                      <select
                        value={editingCompany.logoSize || 64}
                        onChange={(e) => setEditingCompany({ ...editingCompany, logoSize: Number(e.target.value) })}
                        className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value={48}>Kecil (48px)</option>
                        <option value={64}>Standar (64px)</option>
                        <option value={80}>Besar (80px)</option>
                        <option value={96}>Ekstra (96px)</option>
                      </select>
                    </div>

                    <div>
                      <span className="block mb-1 text-3xs font-bold text-slate-600 uppercase">Garis Pembatas</span>
                      <select
                        value={editingCompany.kopBorder || 'double'}
                        onChange={(e) => setEditingCompany({ ...editingCompany, kopBorder: e.target.value as any })}
                        className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="double">Ganda Resmi (Resmi)</option>
                        <option value="single">Garis Tunggal</option>
                        <option value="bold">Garis Tebal</option>
                        <option value="none">Tanpa Garis</option>
                      </select>
                    </div>

                    <div>
                      <span className="block mb-1 text-3xs font-bold text-slate-600 uppercase">Perataan Kop</span>
                      <select
                        value={editingCompany.kopAlignment || 'center'}
                        onChange={(e) => setEditingCompany({ ...editingCompany, kopAlignment: e.target.value as any })}
                        className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="center">Tengah (Simetris)</option>
                        <option value="left">Rata Kiri</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pratinjau Miniatur Kop PT */}
              <div className="p-4 bg-white border border-slate-300 rounded-xl shadow-2xs">
                <span className="block mb-2 text-3xs font-bold text-slate-500 uppercase tracking-wider">
                  Pratinjau Kop Surat "{editingCompany.name}"
                </span>
                <div className="flex items-center justify-between pb-1">
                  {/* Sisi Kiri: Logo */}
                  {editingCompany.showLogo !== false && editingCompany.logoUrl && (
                    <div className="shrink-0 w-12 flex items-center justify-start">
                      <div className={`flex items-center justify-center ${getShapeClasses(editingCompany.logoShape)}`}>
                        <img
                          src={editingCompany.logoUrl}
                          alt="Logo"
                          style={{ maxHeight: `${Math.min(editingCompany.logoSize || 64, 48)}px` }}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Sisi Tengah: Identitas PT */}
                  <div className={`flex-1 min-w-0 px-2 ${editingCompany.kopAlignment === 'left' ? 'text-left' : 'text-center'}`}>
                    <h5 className="text-xs font-bold text-slate-900 uppercase font-serif tracking-wider truncate">
                      {editingCompany.name || 'PT NAMA PERUSAHAAN'}
                    </h5>
                    {editingCompany.subName && (
                      <p className="text-3xs text-slate-700 font-medium truncate mt-0.5">{editingCompany.subName}</p>
                    )}
                    <p className="text-3xs text-slate-600 truncate mt-0.5">
                      {[editingCompany.address, editingCompany.city].filter(Boolean).join(', ')}
                      {editingCompany.postalCode ? ` ${editingCompany.postalCode}` : ''}
                    </p>
                    <p className="text-3xs text-slate-500 truncate">
                      Telp: {editingCompany.phone || '-'} | Email: {editingCompany.email || '-'}
                    </p>
                  </div>

                  {/* Sisi Kanan: Penyeimbang Simetris */}
                  {editingCompany.showLogo !== false && editingCompany.logoUrl && editingCompany.kopAlignment !== 'left' && (
                    <div className="shrink-0 w-12 pointer-events-none" aria-hidden="true" />
                  )}
                </div>

                {editingCompany.kopBorder === 'single' ? (
                  <div className="mt-2 border-b-[2px] border-slate-900" />
                ) : editingCompany.kopBorder === 'bold' ? (
                  <div className="mt-2 border-b-[3px] border-slate-900" />
                ) : editingCompany.kopBorder === 'none' ? null : (
                  <div className="mt-2 space-y-[1px]">
                    <div className="h-[2px] bg-slate-900 w-full" />
                    <div className="h-[0.5px] bg-slate-900 w-full" />
                  </div>
                )}
              </div>

              {/* Action Buttons Form */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div>
                  {!isCreatingNew && companies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setCompanyToDelete(editingCompany)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center space-x-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus PT Ini</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveForm}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 flex items-center space-x-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isCreatingNew ? 'Simpan & Aktifkan PT' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW DAFTAR SEMUA PT */
            <div className="space-y-4">
              {/* Top Controls: Search & Tombol Tambah */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama PT, kota, atau industri..."
                    className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleStartCreate}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center space-x-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah PT Baru</span>
                  </button>
                </div>
              </div>

              {/* PT Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCompanies.map((comp) => {
                  const isActive = comp.id === activeCompanyId;

                  return (
                    <div
                      key={comp.id}
                      className={`relative bg-white rounded-2xl border transition-all p-4 flex flex-col justify-between shadow-2xs ${
                        isActive
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/10'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Top Meta Bar */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {/* Logo */}
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                              {comp.logoUrl ? (
                                <img src={comp.logoUrl} alt={comp.name} className="max-h-full max-w-full object-contain" />
                              ) : (
                                <Building2 className="w-5 h-5 text-slate-500" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate tracking-tight">
                                {comp.name}
                              </h4>
                              {comp.businessField && (
                                <span className="inline-block text-3xs font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 truncate">
                                  {comp.businessField}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          {isActive ? (
                            <span className="shrink-0 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-3xs font-bold bg-indigo-600 text-white shadow-xs">
                              <Check className="w-3 h-3" />
                              <span>PT Aktif</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectCompany(comp.id);
                                onShowToast(`Kop surat aktif beralih ke "${comp.name}".`);
                              }}
                              className="shrink-0 text-3xs font-bold px-2.5 py-1 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                            >
                              Gunakan PT Ini
                            </button>
                          )}
                        </div>

                        {/* Detail Info */}
                        <div className="space-y-1 text-2xs text-slate-600 mt-2 pt-2 border-t border-slate-100">
                          {comp.subName && (
                            <p className="text-slate-700 font-medium truncate flex items-center space-x-1.5">
                              <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{comp.subName}</span>
                            </p>
                          )}
                          <p className="truncate flex items-center space-x-1.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{[comp.address, comp.city].filter(Boolean).join(', ')}</span>
                          </p>
                          <div className="flex items-center space-x-3 text-3xs text-slate-500">
                            <span className="truncate flex items-center space-x-1">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              <span>{comp.phone || '-'}</span>
                            </span>
                            <span className="truncate flex items-center space-x-1">
                              <Mail className="w-2.5 h-2.5 text-slate-400" />
                              <span>{comp.email || '-'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar Bottom */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                        <div className="text-3xs text-slate-400 font-mono">
                          Kop: {comp.kopBorder || 'Ganda'} • {comp.kopAlignment === 'left' ? 'Kiri' : 'Tengah'}
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => onDuplicateCompany(comp.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Duplikasi Profil PT Ini"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(comp)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                            title="Edit Data PT Ini"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {companies.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setCompanyToDelete(comp)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Profil PT Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredCompanies.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
                  <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Tidak ada PT yang sesuai pencarian</p>
                  <p className="text-3xs text-slate-400 mt-0.5">Coba kata kunci lain atau tambahkan PT baru</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dialog Konfirmasi Hapus Perusahaan (Bebas dari kendala iframe browser) */}
        {companyToDelete && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center space-x-3 mb-4 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">Hapus Profil Perusahaan?</h4>
                  <p className="text-2xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900">{companyToDelete.name}</div>
                {companyToDelete.subName && <div className="text-slate-500 text-3xs">{companyToDelete.subName}</div>}
                <div className="text-slate-500 text-3xs">{[companyToDelete.address, companyToDelete.city].filter(Boolean).join(', ')}</div>
              </div>

              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Apakah Anda yakin ingin menghapus profil PT ini dari daftar sistem? Jika profil ini sedang aktif, sistem akan otomatis beralih ke profil PT lain.
              </p>

              <div className="flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setCompanyToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const idToDelete = companyToDelete.id;
                    onDeleteCompany(idToDelete);
                    if (editingCompany?.id === idToDelete) {
                      setEditingCompany(null);
                    }
                    setCompanyToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 transition-all flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Profil</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Modal */}
        <div className="px-5 sm:px-6 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2 text-2xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              PT Aktif: <strong className="text-slate-800 font-bold">{activeCompany.name}</strong> ({activeCompany.city})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs flex items-center space-x-1.5"
            >
              <span>Tutup & Lanjutkan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
