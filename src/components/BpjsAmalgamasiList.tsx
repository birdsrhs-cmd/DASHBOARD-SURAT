import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  FileText,
  Copy,
  Trash2,
  Printer,
  FileDown,
  Calendar,
  Building,
  User,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { BpjsAmalgamationData } from '../types';
import { formatIndonesianDate } from '../utils/dateUtils';
import { downloadBpjsAmalgamationDoc } from '../utils/exportBpjsDoc';

interface BpjsAmalgamasiListProps {
  forms: BpjsAmalgamationData[];
  activeFormId: string;
  onSelectForm: (form: BpjsAmalgamationData) => void;
  onNewForm: () => void;
  onDeleteForm: (id: string) => void;
  onDuplicateForm: (form: BpjsAmalgamationData) => void;
  onPrintForm: (form: BpjsAmalgamationData) => void;
}

export const BpjsAmalgamasiList: React.FC<BpjsAmalgamasiListProps> = ({
  forms,
  activeFormId,
  onSelectForm,
  onNewForm,
  onDeleteForm,
  onDuplicateForm,
  onPrintForm,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formToDelete, setFormToDelete] = useState<BpjsAmalgamationData | null>(null);

  const filteredForms = useMemo(() => {
    if (!searchTerm.trim()) return forms;
    const q = searchTerm.toLowerCase();
    return forms.filter(
      (f) =>
        f.employeeName.toLowerCase().includes(q) ||
        f.companyName.toLowerCase().includes(q) ||
        f.companyNpp.toLowerCase().includes(q) ||
        f.oldKpjNumber.toLowerCase().includes(q) ||
        f.newKpjNumber.toLowerCase().includes(q)
    );
  }, [forms, searchTerm]);

  const confirmDelete = () => {
    if (formToDelete) {
      onDeleteForm(formToDelete.id);
      setFormToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* List Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-3 shadow-2xs shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Arsip Formulir Amalgamasi BPJS
            </h2>
            <span className="text-3xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              {forms.length} Formulir
            </span>
          </div>
          <p className="text-2xs text-slate-500 mt-0.5">
            Riwayat dokumen penggabungan saldo JHT BPJS Ketenagakerjaan
          </p>
        </div>

        <button
          type="button"
          onClick={onNewForm}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Form Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 sm:px-6 bg-white border-b border-slate-200 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama karyawan, PT, NPP, atau nomor KPJ..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
        {filteredForms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">Tidak ada formulir ditemukan</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm ? 'Coba ubah kata kunci pencarian.' : 'Belum ada formulir amalgamasi yang tersimpan.'}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={onNewForm}
                className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
              >
                Buat Formulir Baru
              </button>
            )}
          </div>
        ) : (
          filteredForms.map((item) => {
            const isSelected = item.id === activeFormId;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Info Utama */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelectForm(item)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 hover:text-emerald-700 transition">
                      {item.employeeName || 'Nama Karyawan'}
                    </span>
                    <span className="text-3xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      NPP: {item.companyNpp || '-'}
                    </span>
                    {item.status && (
                      <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.status === 'siap_cetak' ? 'Siap Cetak' : item.status === 'diserahkan' ? 'Diserahkan' : 'Draft'}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 font-medium mt-1">
                    {item.companyName}
                  </div>

                  <div className="flex items-center space-x-4 text-2xs text-slate-500 mt-2 flex-wrap gap-y-1">
                    <div className="flex items-center space-x-1">
                      <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                      <span>KPJ Lama: {item.oldKpjNumber ? item.oldKpjNumber.split(' ')[0] : '-'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>KPJ Baru: {item.newKpjNumber ? item.newKpjNumber.split(' ')[0] : '-'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tanggal: {formatIndonesianDate(item.submissionDate || item.issueDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Button */}
                <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onPrintForm(item)}
                    title="Cetak Formulir A4"
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadBpjsAmalgamationDoc(item)}
                    title="Unduh Word (.doc)"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateForm(item)}
                    title="Duplikasi Formulir"
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormToDelete(item)}
                    title="Hapus Formulir"
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {formToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <h4 className="font-bold text-slate-900 text-sm">Hapus Formulir Amalgamasi?</h4>
            <p className="text-xs text-slate-500 mt-1">
              Formulir penggabungan saldo untuk tenaga kerja <strong>{formToDelete.employeeName}</strong> akan dihapus permanen.
            </p>
            <div className="mt-5 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setFormToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
