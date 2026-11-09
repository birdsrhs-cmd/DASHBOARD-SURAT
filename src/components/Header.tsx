import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Copy,
  Check,
  Download,
  Printer,
  Save,
  Columns2,
  FileEdit,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  ChevronDown,
  Plus,
  Sliders
} from 'lucide-react';
import { CompanyProfile, AppTab } from '../types';

interface HeaderProps {
  currentTab: AppTab;
  viewMode?: 'split' | 'form' | 'preview';
  onChangeViewMode?: (mode: 'split' | 'form' | 'preview') => void;
  onPrint: () => void;
  onDownloadDoc: () => void;
  onCopyText: () => void;
  onSaveToHistory: () => void;
  copied: boolean;
  onToggleMobileMenu: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  companies?: CompanyProfile[];
  activeCompany?: CompanyProfile;
  onSelectCompany?: (id: string) => void;
  onOpenCompanyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  viewMode = 'split',
  onChangeViewMode,
  onPrint,
  onDownloadDoc,
  onCopyText,
  onSaveToHistory,
  copied,
  onToggleMobileMenu,
  isSidebarCollapsed = false,
  onToggleSidebar,
  companies = [],
  activeCompany,
  onSelectCompany,
  onOpenCompanyModal,
}) => {
  const [isPtDropdownOpen, setIsPtDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPtDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between shadow-2xs shrink-0 no-print z-30">
      {/* Title, Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
          title="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title={isSidebarCollapsed ? 'Tampilkan Sidebar Lengkap' : 'Sembunyikan Sidebar untuk Ruang Lebih Luas'}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-indigo-600" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}

        <div className="flex flex-col">
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>
              {currentTab === 'editor' && 'Editor Surat PHK'}
              {currentTab === 'disnaker' && 'Laporan PHK Disnaker'}
              {currentTab === 'list' && 'Arsip Dokumen PHK'}
              {currentTab === 'late-permit' && 'Formulir Izin Terlambat'}
              {currentTab === 'late-list' && 'Rekap Data Keterlambatan'}
              {currentTab === 'bpjs-amalgamasi' && 'Formulir Amalgamasi BPJS'}
              {currentTab === 'bpjs-list' && 'Arsip Formulir BPJS'}
            </span>
            <span className="hidden sm:inline text-3xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              {currentTab === 'disnaker'
                ? 'Disnaker & JKP'
                : currentTab === 'late-permit' || currentTab === 'late-list'
                ? 'Absensi & Disiplin'
                : currentTab === 'bpjs-amalgamasi' || currentTab === 'bpjs-list'
                ? 'BPJS Ketenagakerjaan'
                : 'PP No. 35/2021'}
            </span>
          </h1>
          <p className="text-2xs text-slate-400 hidden sm:block font-medium">
            {currentTab === 'disnaker'
              ? 'Surat Resmi Pelaporan PHK ke Suku Dinas Tenaga Kerja (Klaim JKP)'
              : currentTab === 'late-permit' || currentTab === 'late-list'
              ? 'Formulir Izin Datang Terlambat, Dispensasi & Penggantian Jam Kerja'
              : currentTab === 'bpjs-amalgamasi' || currentTab === 'bpjs-list'
              ? 'Formulir FM/KC/01/02/005 Permintaan Penggabungan Saldo JHT'
              : 'Tata Naskah Ketenagakerjaan & Kalkulator Kompensasi Resmi'}
          </p>
        </div>
      </div>

      {/* Menu Switcher PT (Multi-PT Quick Dropdown) */}
      {activeCompany && (
        <div className="relative hidden sm:block" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsPtDropdownOpen(!isPtDropdownOpen)}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-all hover:border-slate-300"
            title="Ganti PT Aktif atau Kelola Profil PT"
          >
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              {activeCompany.logoUrl ? (
                <img src={activeCompany.logoUrl} alt="" className="w-4 h-4 object-contain rounded" />
              ) : (
                <Building2 className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="text-left max-w-[140px] md:max-w-[200px] truncate">
              <span className="block truncate text-2xs font-bold text-slate-900 leading-tight">
                {activeCompany.name}
              </span>
              <span className="block text-3xs text-slate-500 truncate leading-none">
                {activeCompany.city || 'Kop Surat Aktif'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isPtDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 pb-2 pt-1 border-b border-slate-100 flex items-center justify-between">
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
                  Pilih Profil PT ({companies.length})
                </span>
                {onOpenCompanyModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPtDropdownOpen(false);
                      onOpenCompanyModal();
                    }}
                    className="text-3xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Kelola Semua PT
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto py-1 space-y-0.5 px-1.5">
                {companies.map((c) => {
                  const isCur = c.id === activeCompany.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        if (onSelectCompany) onSelectCompany(c.id);
                        setIsPtDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isCur
                          ? 'bg-indigo-50 text-indigo-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                          {c.logoUrl ? (
                            <img src={c.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="truncate text-xs font-bold leading-tight">{c.name}</p>
                          <p className="text-3xs text-slate-400 truncate">{c.city}</p>
                        </div>
                      </div>
                      {isCur && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {onOpenCompanyModal && (
                <div className="pt-2 px-2 border-t border-slate-100 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPtDropdownOpen(false);
                      onOpenCompanyModal();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Menu / Tambah PT Baru</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode Tampilan Switcher (Tersedia mulai layar md / tablet) */}
      {(currentTab === 'editor' || currentTab === 'disnaker' || currentTab === 'late-permit' || currentTab === 'bpjs-amalgamasi') && onChangeViewMode && (
        <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => onChangeViewMode('split')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
              viewMode === 'split'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
            title="Tampilan Berdampingan (Formulir & Pratinjau Dokumen)"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Berdampingan</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('form')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
              viewMode === 'form'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
            title="Fokus Formulir Pengisian Lengkap"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Formulir</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('preview')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
              viewMode === 'preview'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
            title="Fokus Pratinjau Dokumen Cetak A4"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau A4</span>
          </button>
        </div>
      )}

      {/* Action Buttons Toolbar */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Salin Teks */}
        <button
          id="header-btn-copy"
          type="button"
          onClick={onCopyText}
          className="px-2.5 sm:px-3 py-1.5 text-slate-600 text-xs sm:text-sm font-medium hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center space-x-1.5 border border-slate-200/80"
          title="Salin Teks Lengkap Surat"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-semibold hidden sm:inline">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Salin</span>
            </>
          )}
        </button>

        {/* Unduh File Word (.doc) */}
        <button
          id="header-btn-download"
          type="button"
          onClick={onDownloadDoc}
          className="px-2.5 sm:px-3 py-1.5 text-slate-700 text-xs sm:text-sm font-medium hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center space-x-1.5 border border-slate-200/80"
          title="Unduh Surat dalam Format Microsoft Word (.doc)"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">Word</span>
        </button>

        {/* Simpan ke Arsip */}
        <button
          id="header-btn-save"
          type="button"
          onClick={onSaveToHistory}
          className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center space-x-1.5 border border-slate-200"
          title="Simpan Dokumen Ini ke Arsip Dashboard"
        >
          <Save className="w-4 h-4 text-slate-700" />
          <span className="hidden sm:inline">Simpan</span>
        </button>

        {/* Tombol Cetak / Simpan PDF Utama */}
        <button
          id="header-btn-print"
          type="button"
          onClick={onPrint}
          className="px-3.5 sm:px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          title="Cetak Fisik atau Simpan sebagai PDF A4"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak/PDF</span>
        </button>
      </div>
    </header>
  );
};
