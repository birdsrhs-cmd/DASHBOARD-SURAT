import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  Download,
  Trash2,
  Copy,
  Edit3,
  Calendar,
  Building,
  User
} from 'lucide-react';
import { LetterData, LetterStatus } from '../types';
import { addWorkingDays, formatCurrencyIDR, formatIndonesianDate, getRemainingWorkingDays } from '../utils/dateUtils';

interface LetterListProps {
  letters: LetterData[];
  onSelectLetter: (letter: LetterData) => void;
  onNewLetter: () => void;
  onDeleteLetter: (id: string) => void;
  onDuplicateLetter: (letter: LetterData) => void;
  onUpdateStatus: (id: string, status: LetterStatus) => void;
  onPrintLetter: (letter: LetterData) => void;
  onDownloadLetterDoc: (letter: LetterData) => void;
}

export const LetterList: React.FC<LetterListProps> = ({
  letters,
  onSelectLetter,
  onNewLetter,
  onDeleteLetter,
  onDuplicateLetter,
  onUpdateStatus,
  onPrintLetter,
  onDownloadLetterDoc,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Metrik ringkasan
  const totalCount = letters.length;
  const pendingCount = letters.filter((l) => l.status === 'terkirim').length;
  const approvedCount = letters.filter((l) => l.status === 'disetujui').length;
  const rejectedCount = letters.filter((l) => l.status === 'ditolak').length;
  const draftCount = letters.filter((l) => l.status === 'draft').length;

  // Filter daftar surat
  const filteredLetters = letters.filter((letter) => {
    const matchesSearch =
      letter.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.letterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.employeeDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.employeePosition.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || letter.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: LetterStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Draft
          </span>
        );
      case 'terkirim':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 mr-1 text-blue-600" />
            Menunggu Tanggapan
          </span>
        );
      case 'disetujui':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Disetujui Pekerja
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
            Menolak (Bipartit)
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Surat</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{totalCount}</div>
          <div className="text-2xs text-slate-400 mt-0.5">Tersimpan di sistem</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center space-x-1">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Menunggu Respon</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1">{pendingCount}</div>
          <div className="text-2xs text-slate-400 mt-0.5">Batas 5 hari kerja</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Disetujui</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-900 mt-1">{approvedCount}</div>
          <div className="text-2xs text-slate-400 mt-0.5">Menerima PHK</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Menolak / Bipartit</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-900 mt-1">{rejectedCount}</div>
          <div className="text-2xs text-slate-400 mt-0.5">Proses musyawarah</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Konsep (Draft)</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1">{draftCount}</div>
          <div className="text-2xs text-slate-400 mt-0.5">Belum diterbitkan</div>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama karyawan, nomor surat, divisi..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="terkirim">Menunggu Tanggapan</option>
              <option value="disetujui">Disetujui Pekerja</option>
              <option value="ditolak">Menolak (Bipartit)</option>
              <option value="draft">Draft</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewLetter}
          className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Surat Baru</span>
        </button>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredLetters.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-sm text-slate-700">Tidak ada surat yang ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Mulai dengan membuat surat pemberitahuan baru.'}
            </p>
            <button
              type="button"
              onClick={onNewLetter}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center space-x-1.5 shadow-md shadow-indigo-200"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buat Surat Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-2xs font-semibold">
                <tr>
                  <th className="p-4">Nomor & Tanggal</th>
                  <th className="p-4">Penerima (Karyawan)</th>
                  <th className="p-4">Divisi & Jabatan</th>
                  <th className="p-4">Tanggal Efektif</th>
                  <th className="p-4">Status & Tenggat</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLetters.map((letter) => {
                  const deadline = letter.receivedDate ? addWorkingDays(letter.receivedDate, 5) : '';
                  const remainingDays = deadline ? getRemainingWorkingDays(deadline) : null;

                  return (
                    <tr key={letter.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Nomor & Tanggal */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{letter.letterNumber || '(Tanpa Nomor)'}</div>
                        <div className="text-2xs text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatIndonesianDate(letter.letterDate)}</span>
                        </div>
                      </td>

                      {/* Nama Karyawan */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{letter.employeeName}</span>
                        </div>
                        {letter.employeeId && (
                          <div className="text-2xs text-slate-400 ml-5">NIK: {letter.employeeId}</div>
                        )}
                      </td>

                      {/* Jabatan & Divisi */}
                      <td className="p-4 text-slate-700">
                        <div className="font-medium text-slate-800">{letter.employeePosition}</div>
                        <div className="text-2xs text-slate-400">{letter.employeeDepartment}</div>
                      </td>

                      {/* Tanggal Efektif PHK */}
                      <td className="p-4">
                        <div className="font-medium text-slate-900">
                          {formatIndonesianDate(letter.effectiveDate)}
                        </div>
                      </td>

                      {/* Status & Deadline */}
                      <td className="p-4">
                        <div className="flex flex-col space-y-1">
                          <div>{getStatusBadge(letter.status)}</div>
                          {letter.status === 'terkirim' && deadline && (
                            <div className="text-2xs">
                              <span className="text-slate-400">Batas: {formatIndonesianDate(deadline)} </span>
                              {remainingDays !== null && (
                                <span
                                  className={`font-bold ${
                                    remainingDays < 0
                                      ? 'text-rose-600'
                                      : remainingDays <= 2
                                      ? 'text-amber-600'
                                      : 'text-emerald-600'
                                  }`}
                                >
                                  ({remainingDays < 0 ? 'Kedaluwarsa' : `sisa ${remainingDays} hari kerja`})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => onSelectLetter(letter)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                            title="Buka & Sunting Surat"
                          >
                            <Edit3 className="w-4 h-4 text-indigo-600" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDuplicateLetter(letter)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                            title="Duplikasi Surat"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onPrintLetter(letter)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                            title="Cetak Surat"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDownloadLetterDoc(letter)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-indigo-600 transition-colors"
                            title="Unduh File Word (.doc)"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteLetter(letter.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Hapus Surat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
