import React from 'react';
import { FileText, PlusCircle, ListOrdered, BookOpen, Printer, Download, Copy, Check } from 'lucide-react';

interface NavbarProps {
  currentTab: 'editor' | 'list';
  setCurrentTab: (tab: 'editor' | 'list') => void;
  onNewLetter: () => void;
  onPrint: () => void;
  onDownloadDoc: () => void;
  onCopyText: () => void;
  onOpenLegalGuide: () => void;
  copied: boolean;
  totalLettersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onNewLetter,
  onPrint,
  onDownloadDoc,
  onCopyText,
  onOpenLegalGuide,
  copied,
  totalLettersCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Judul */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-800 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Dashboard Surat PHK
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-900 border border-red-200">
                  PP 35/2021
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Format Resmi Surat Pemberitahuan Pemutusan Hubungan Kerja (Pasal 37 & 38)
              </p>
            </div>
          </div>

          {/* Navigasi Utama */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="nav-tab-editor"
              type="button"
              onClick={() => setCurrentTab('editor')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentTab === 'editor'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Form & Pratinjau</span>
            </button>

            <button
              id="nav-tab-list"
              type="button"
              onClick={() => setCurrentTab('list')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentTab === 'list'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Daftar Surat</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-slate-200 text-slate-800 font-semibold">
                {totalLettersCount}
              </span>
            </button>

            <button
              id="nav-btn-legal-guide"
              type="button"
              onClick={onOpenLegalGuide}
              className="px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:text-red-900 hover:bg-red-50 transition-colors flex items-center space-x-1"
              title="Panduan Hukum PP No. 35 Tahun 2021"
            >
              <BookOpen className="w-4 h-4 text-red-700" />
              <span className="hidden md:inline">Panduan Regulasi</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              id="nav-btn-new"
              type="button"
              onClick={onNewLetter}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors flex items-center space-x-1"
              title="Buat Draft Surat Baru"
            >
              <PlusCircle className="w-4 h-4 text-slate-700" />
              <span className="hidden lg:inline">Buat Baru</span>
            </button>

            <button
              id="nav-btn-copy"
              type="button"
              onClick={onCopyText}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-1"
              title="Salin Teks Surat ke Clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700 font-medium">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Salin Teks</span>
                </>
              )}
            </button>

            <button
              id="nav-btn-download-word"
              type="button"
              onClick={onDownloadDoc}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors flex items-center space-x-1"
              title="Unduh Format Word (.doc)"
            >
              <Download className="w-4 h-4 text-blue-700" />
              <span className="hidden sm:inline">Word (.doc)</span>
            </button>

            <button
              id="nav-btn-print"
              type="button"
              onClick={onPrint}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-red-800 hover:bg-red-900 text-white transition-colors flex items-center space-x-1.5 shadow-xs"
              title="Cetak langsung atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
