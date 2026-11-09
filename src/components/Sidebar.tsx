import React from 'react';
import {
  FileText,
  Building2,
  Scale,
  PlusCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  ClockAlert,
  ClipboardList,
  ShieldCheck,
  CreditCard,
  Layers
} from 'lucide-react';
import { LetterData, LatePermitData, CompanyProfile, BpjsAmalgamationData, AppTab } from '../types';

interface SidebarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  onNewLetter: () => void;
  onNewLatePermit?: () => void;
  onNewBpjsForm?: () => void;
  onOpenLegalGuide: () => void;
  onOpenLogoModal?: () => void;
  onOpenCompanyModal?: () => void;
  activeCompany?: CompanyProfile;
  totalCompaniesCount?: number;
  totalLettersCount: number;
  totalLatePermitsCount?: number;
  totalBpjsCount?: number;
  activeLetter: LetterData;
  activeLatePermit?: LatePermitData;
  activeBpjsForm?: BpjsAmalgamationData;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onNewLetter,
  onNewLatePermit,
  onNewBpjsForm,
  onOpenLegalGuide,
  onOpenLogoModal,
  onOpenCompanyModal,
  activeCompany,
  totalCompaniesCount,
  totalLettersCount,
  totalLatePermitsCount = 0,
  totalBpjsCount = 0,
  activeLetter,
  activeLatePermit,
  activeBpjsForm,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const getStatusBadge = () => {
    switch (activeLetter.status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium bg-slate-700 text-slate-300">
            Draft
          </span>
        );
      case 'terkirim':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium bg-blue-900/60 text-blue-300 border border-blue-700">
            Terkirim
          </span>
        );
      case 'disetujui':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700">
            Disetujui
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium bg-rose-900/60 text-rose-300 border border-rose-700">
            Bipartit
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium bg-purple-900/60 text-purple-300 border border-purple-700">
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay Backdrop Mobile */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden no-print"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-slate-900 flex flex-col border-r border-slate-800 shadow-xl transition-all duration-200 ease-in-out shrink-0 no-print ${
          isMobileOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full md:translate-x-0 ' + (isCollapsed ? 'md:w-16' : 'md:w-60 lg:w-64')
        }`}
      >
        {/* Logo & Brand Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/80 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-white font-bold tracking-tight text-sm truncate">HR DOCUMENT</span>
                <span className="text-3xs text-slate-400 font-medium truncate">PP No. 35 Tahun 2021</span>
              </div>
            )}
          </div>

          {/* Toggle Tombol Minimize Desktop */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
                isCollapsed ? 'hidden' : 'block'
              }`}
              title="Perkecil Panel Navigasi"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          {/* Close button mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tombol Re-open jika collapsed pada desktop */}
        {isCollapsed && onToggleCollapse && (
          <div className="hidden md:flex justify-center pt-3 pb-1 border-b border-slate-800/60">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Perluas Panel Navigasi"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigasi Utama */}
        <nav className="flex-1 px-2.5 sm:px-3 space-y-3 mt-3 overflow-y-auto">
          {/* Section: Dokumen PHK */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-3xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Dokumen PHK (PP 35)
              </p>
            )}
            {/* Tab: Form Editor PHK */}
            <button
              id="sidebar-nav-editor"
              type="button"
              onClick={() => {
                setCurrentTab('editor');
                if (onCloseMobile) onCloseMobile();
              }}
              title="Editor Surat PHK"
              className={`w-full flex items-center rounded-xl text-sm font-medium transition-all ${
                isCollapsed ? 'justify-center p-2.5' : 'space-x-3 p-2.5'
              } ${
                currentTab === 'editor'
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="text-left flex-1 truncate text-xs">Surat PHK Pekerja</span>}
            </button>

            {/* Tab: Laporan PHK Disnaker */}
            <button
              id="sidebar-nav-disnaker"
              type="button"
              onClick={() => {
                setCurrentTab('disnaker');
                if (onCloseMobile) onCloseMobile();
              }}
              title="Laporan PHK Disnaker (Suku Dinas / JKP)"
              className={`w-full flex items-center rounded-xl text-sm font-medium transition-all ${
                isCollapsed ? 'justify-center p-2.5' : 'space-x-3 p-2.5'
              } ${
                currentTab === 'disnaker'
                  ? 'text-white bg-emerald-600 shadow-md shadow-emerald-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isCollapsed && (
                <div className="text-left flex-1 truncate flex items-center justify-between">
                  <span className="text-xs">Laporan Disnaker</span>
                  <span className="text-3xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    JKP
                  </span>
                </div>
              )}
            </button>

            {/* Action: Buat Baru PHK */}
            <button
              id="sidebar-btn-new-letter"
              type="button"
              onClick={() => {
                onNewLetter();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Buat Surat Baru"
              className={`w-full flex items-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors text-xs font-medium ${
                isCollapsed ? 'justify-center p-2.5' : 'space-x-3 p-2.5'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isCollapsed && <span className="text-left flex-1 truncate">Buat Surat Baru</span>}
            </button>

            {/* Tab: Arsip Surat PHK */}
            <button
              id="sidebar-nav-list"
              type="button"
              onClick={() => {
                setCurrentTab('list');
                if (onCloseMobile) onCloseMobile();
              }}
              title={`Arsip Surat (${totalLettersCount})`}
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all ${
                isCollapsed ? 'justify-center p-2.5' : 'space-x-3 p-2.5'
              } ${
                currentTab === 'list'
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="text-left flex-1 truncate">Arsip Dokumen</span>
                  <span className="px-1.5 py-0.2 rounded text-3xs bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    {totalLettersCount}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Section: Izin Keterlambatan */}
          <div className="space-y-1 pt-2 border-t border-slate-800/70">
            {!isCollapsed && (
              <p className="px-3 text-3xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Kedisiplinan & Absensi
              </p>
            )}
            {/* Tab: Formulir Izin Terlambat */}
            <button
              id="sidebar-nav-late-permit"
              type="button"
              onClick={() => {
                setCurrentTab('late-permit');
                if (onCloseMobile) onCloseMobile();
              }}
              title="Formulir Izin Terlambat"
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all ${
                isCollapsed ? 'justify-center p-2.5' : 'space-x-3 p-2.5'
              } ${
                currentTab === 'late-permit'
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <ClockAlert className="w-4 h-4 text-amber-400 shrink-0" />
              {!isCollapsed && <span className="text-left flex-1 truncate">Formulir Izin Terlambat</span>}
            </button>

            {/* Tab: Rekap Data Terlambat */}
            <button
              id="sidebar-nav-late-list"
              type="button"
              onClick={() => {
                setCurrentTab('late-list');
                if (onCloseMobile) onCloseMobile();
              }}
              title={`Rekap Data Terlambat (${totalLatePermitsCount})`}
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all ${
                isCollapsed ? 'justify-center p-2.5' : 'space-x-3 p-2.5'
              } ${
                currentTab === 'late-list'
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-emerald-400 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="text-left flex-1 truncate">Rekap Terlambat</span>
                  <span className="px-1.5 py-0.2 rounded text-3xs bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    {totalLatePermitsCount}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Section: BPJS Ketenagakerjaan (Amalgamasi) */}
          <div className="space-y-1 pt-2 border-t border-slate-800/70">
            {!isCollapsed && (
              <p className="px-3 text-3xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                BPJS Ketenagakerjaan
              </p>
            )}
            {/* Tab: Form Amalgamasi */}
            <button
              id="sidebar-nav-bpjs-amalgamasi"
              type="button"
              onClick={() => {
                setCurrentTab('bpjs-amalgamasi');
                if (onCloseMobile) onCloseMobile();
              }}
              title="Formulir Amalgamasi Saldo JHT BPJS"
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all ${
                isCollapsed ? 'justify-center p-2.5' : 'space-x-3 p-2.5'
              } ${
                currentTab === 'bpjs-amalgamasi'
                  ? 'text-white bg-emerald-600 shadow-md shadow-emerald-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
              {!isCollapsed && (
                <div className="text-left flex-1 truncate flex items-center justify-between">
                  <span className="text-xs">Form Amalgamasi</span>
                  <span className="text-3xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    JHT
                  </span>
                </div>
              )}
            </button>

            {/* Tab: Arsip Form BPJS */}
            <button
              id="sidebar-nav-bpjs-list"
              type="button"
              onClick={() => {
                setCurrentTab('bpjs-list');
                if (onCloseMobile) onCloseMobile();
              }}
              title={`Arsip Formulir Amalgamasi (${totalBpjsCount})`}
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all ${
                isCollapsed ? 'justify-center p-2.5' : 'space-x-3 p-2.5'
              } ${
                currentTab === 'bpjs-list'
                  ? 'text-white bg-emerald-600 shadow-md shadow-emerald-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-400 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="text-left flex-1 truncate">Arsip Form BPJS</span>
                  <span className="px-1.5 py-0.2 rounded text-3xs bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    {totalBpjsCount}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Section: Pengaturan & Panduan */}
          <div className="space-y-1 pt-2 border-t border-slate-800/70">
            {!isCollapsed && (
              <p className="px-3 text-3xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Entitas & Pengaturan
              </p>
            )}

            {/* Action: Menu Profil PT / Multi-PT */}
            {onOpenCompanyModal && (
              <button
                type="button"
                onClick={() => {
                  onOpenCompanyModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Kelola Daftar & Profil PT (Multi-PT)"
                className={`w-full flex items-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-xs font-semibold ${
                  isCollapsed ? 'justify-center p-2.5' : 'space-x-3 p-2.5'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="text-left flex-1 truncate">Menu Profil PT</span>
                    {totalCompaniesCount !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full text-3xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                        {totalCompaniesCount} PT
                      </span>
                    )}
                  </>
                )}
              </button>
            )}

            {/* Action: Logo & Kop Surat Modal Shortcut */}
            {onOpenLogoModal && (
              <button
                type="button"
                onClick={() => {
                  onOpenLogoModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Pengaturan Logo & Kop Surat"
                className={`w-full flex items-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors text-xs font-medium ${
                  isCollapsed ? 'justify-center p-2.5' : 'space-x-3 p-2.5'
                }`}
              >
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                {!isCollapsed && <span className="text-left flex-1 truncate">Logo & Format Kop</span>}
              </button>
            )}

            {/* Action: Panduan Hukum */}
            <button
              id="sidebar-btn-legal-guide"
              type="button"
              onClick={() => {
                onOpenLegalGuide();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Panduan Hukum PP 35/2021"
              className={`w-full flex items-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors text-xs font-medium ${
                isCollapsed ? 'justify-center p-2.5' : 'space-x-3 p-2.5'
              }`}
            >
              <Scale className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isCollapsed && <span className="text-left flex-1 truncate">Panduan PP 35/2021</span>}
            </button>
          </div>
        </nav>

        {/* Widget Informasi Dokumen Aktif */}
        {!isCollapsed ? (
          <div className="p-3.5 border-t border-slate-800 space-y-2">
            {/* Banner PT Aktif */}
            {activeCompany && onOpenCompanyModal && (
              <button
                type="button"
                onClick={() => {
                  onOpenCompanyModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors group"
                title="Klik untuk ganti atau kelola entitas PT"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-3xs text-emerald-400 uppercase tracking-wider font-bold">
                    PT Kop Aktif
                  </span>
                  <span className="text-3xs text-slate-400 group-hover:text-white transition-colors">
                    Ubah ↗
                  </span>
                </div>
                <div className="text-xs text-white font-bold truncate">
                  {activeCompany.name}
                </div>
                <div className="text-3xs text-slate-400 truncate mt-0.5">
                  {activeCompany.city || 'Kop Resmi'} • {activeCompany.kopBorder || 'Ganda'}
                </div>
              </button>
            )}

            {currentTab === 'late-permit' || currentTab === 'late-list' ? (
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 shadow-inner">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-3xs text-amber-400 uppercase tracking-wider font-bold">
                    Izin Terlambat
                  </span>
                  <span className="text-3xs px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 capitalize">
                    {activeLatePermit?.status || 'Diajukan'}
                  </span>
                </div>
                <div className="text-xs text-white font-medium truncate">
                  {activeLatePermit?.permitNumber || 'Nomor Belum Diisi'}
                </div>
                <div className="text-2xs text-slate-400 truncate mt-0.5">
                  {activeLatePermit?.employeeName || 'Karyawan'} ({activeLatePermit?.lateMinutes || 0} mnt)
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 shadow-inner">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-3xs text-slate-400 uppercase tracking-wider font-bold">
                    Surat Aktif
                  </span>
                  {getStatusBadge()}
                </div>
                <div className="text-xs text-white font-medium truncate" title={activeLetter.letterNumber}>
                  {activeLetter.letterNumber || 'Nomor Belum Diisi'}
                </div>
                <div className="text-2xs text-slate-400 truncate mt-0.5">
                  {activeLetter.employeeName ? activeLetter.employeeName : 'Nama Belum Diisi'}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 border-t border-slate-800 flex justify-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500/80" title="Dokumen Aktif" />
          </div>
        )}
      </aside>
    </>
  );
};
