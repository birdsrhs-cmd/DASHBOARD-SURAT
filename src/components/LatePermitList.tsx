import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Trash2,
  Eye,
  Filter,
  Users,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { LatePermitData, CompanyProfile } from '../types';
import { formatIndonesianDate } from '../utils/dateUtils';
import { downloadLatePermitWordDocument } from '../utils/exportLateDoc';

interface LatePermitListProps {
  permits: LatePermitData[];
  company: CompanyProfile;
  onSelectPermit: (permit: LatePermitData) => void;
  onCreateNew: () => void;
  onDeletePermit: (id: string) => void;
}

export const LatePermitList: React.FC<LatePermitListProps> = ({
  permits,
  company,
  onSelectPermit,
  onCreateNew,
  onDeletePermit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Extract unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    permits.forEach((p) => {
      if (p.employeeDepartment) set.add(p.employeeDepartment);
    });
    return Array.from(set);
  }, [permits]);

  // Filtered list
  const filteredPermits = useMemo(() => {
    return permits.filter((p) => {
      const matchesSearch =
        p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.reasonDescription.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = deptFilter === 'all' || p.employeeDepartment === deptFilter;

      return matchesSearch && matchesDept;
    });
  }, [permits, searchQuery, deptFilter]);

  // Summary Metrics (without status & duration)
  const currentMonthCount = useMemo(() => {
    const currentYearMonth = new Date().toISOString().slice(0, 7);
    return permits.filter((p) => p.incidentDate?.startsWith(currentYearMonth)).length;
  }, [permits]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'No Formulir',
      'Tanggal Kejadian',
      'Nama Karyawan',
      'NIK',
      'Departemen',
      'Jabatan',
      'Jam Masuk',
      'Jam Tiba',
      'Ke- (Bulan Ini)',
      'Kategori Alasan',
    ];

    const rows = filteredPermits.map((p) => [
      `"${p.permitNumber}"`,
      `"${p.incidentDate}"`,
      `"${p.employeeName}"`,
      `"${p.employeeId}"`,
      `"${p.employeeDepartment}"`,
      `"${p.employeePosition}"`,
      `"${p.standardTime}"`,
      `"${p.actualArrivalTime}"`,
      p.tardinessCountThisMonth,
      `"${p.reasonCategory}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Data_Izin_Terlambat_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Rekapitulasi Data Izin Terlambat</span>
            <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {permits.length} Dokumen
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring disiplin kehadiran, kompensasi jam kerja, dan toleransi keterlambatan karyawan
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5"
            title="Ekspor rekap ke format CSV (Excel)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Formulir Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs text-slate-500 font-semibold uppercase tracking-wider block">
            Total Pengajuan
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{permits.length}</span>
            <span className="text-2xs text-slate-500 font-medium">formulir izin</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs text-slate-500 font-semibold uppercase tracking-wider block">
            Pengajuan Bulan Ini
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-indigo-600">{currentMonthCount}</span>
            <span className="text-2xs text-slate-500 font-medium">kejadian</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs text-slate-500 font-semibold uppercase tracking-wider block">
            Departemen Terdata
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-700">{departments.length}</span>
            <span className="text-2xs text-slate-500 font-medium">divisi</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama karyawan, NIK, no formulir..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Filter Departemen */}
        <div className="flex items-center space-x-2">
          {departments.length > 0 && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Departemen</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tabel Data Rekap Terlambat */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredPermits.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Tidak ada data formulir keterlambatan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || deptFilter !== 'all'
                ? 'Tidak ditemukan data yang sesuai dengan kata kunci atau filter yang dipilih.'
                : 'Mulai buat formulir izin keterlambatan pertama untuk mendokumentasikan kedisiplinan kerja.'}
            </p>
            <button
              type="button"
              onClick={onCreateNew}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Formulir Baru</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-3xs">
                  <th className="py-3 px-4">No. Formulir</th>
                  <th className="py-3 px-4">Karyawan & NIK</th>
                  <th className="py-3 px-4">Departemen</th>
                  <th className="py-3 px-4">Tanggal & Jam</th>
                  <th className="py-3 px-4">Alasan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPermits.map((permit) => (
                  <tr
                    key={permit.id}
                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                    onClick={() => onSelectPermit(permit)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-950">
                      {permit.permitNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{permit.employeeName}</div>
                      <div className="text-3xs text-slate-500">{permit.employeeId}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {permit.employeeDepartment || '-'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {formatIndonesianDate(permit.incidentDate)}
                      </div>
                      <div className="text-3xs text-slate-500 font-mono">
                        {permit.standardTime} ➔ <span className="text-rose-600 font-bold">{permit.actualArrivalTime}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-[220px]">
                      <span className="text-slate-800 line-clamp-1 capitalize font-medium">
                        {permit.reasonCategory}
                      </span>
                      <span className="text-3xs text-slate-500 line-clamp-1">
                        {permit.reasonDescription}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectPermit(permit)}
                        title="Buka / Edit Formulir"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadLatePermitWordDocument(permit, company)}
                        title="Unduh Dokumen Word (.doc)"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Download className="w-4 h-4 text-indigo-600" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeletePermit(permit.id)}
                        title="Hapus Formulir"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
