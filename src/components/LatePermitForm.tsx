import React from 'react';
import {
  Clock,
  User,
  AlertTriangle,
  Calendar,
  Sparkles,
  Paperclip,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { LatePermitData, LateReasonCategory, CompanyProfile } from '../types';
import { LATE_REASON_OPTIONS } from '../data/latePresets';

interface LatePermitFormProps {
  permit: LatePermitData;
  company: CompanyProfile;
  onUpdatePermit: (updated: Partial<LatePermitData>) => void;
  onSave: () => void;
  onOpenCompanyModal?: () => void;
}

export const LatePermitForm: React.FC<LatePermitFormProps> = ({
  permit,
  company,
  onUpdatePermit,
  onSave,
  onOpenCompanyModal,
}) => {
  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Formulir */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Formulir Izin Keterlambatan Kerja
            </h2>
          </div>
          <p className="text-2xs sm:text-xs text-slate-500 mt-0.5">
            Pengajuan dispensasi keterlambatan masuk kantor & persetujuan atasan langsung
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-3xs font-semibold truncate max-w-[150px]">
              {company.name}
            </span>
          </div>
          {onOpenCompanyModal && (
            <button
              type="button"
              onClick={onOpenCompanyModal}
              className="text-3xs font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 border border-indigo-200 transition-colors"
              title="Ganti atau Kelola PT"
            >
              Ganti PT
            </button>
          )}
        </div>
      </div>

      {/* Form Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

        {/* 1. NOMOR DOKUMEN & TANGGAL PENGAJUAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-100">
          <div>
            <label className="block mb-1 text-2xs font-bold text-slate-500 uppercase tracking-wider">
              Nomor Formulir Izin
            </label>
            <input
              type="text"
              value={permit.permitNumber}
              onChange={(e) => onUpdatePermit({ permitNumber: e.target.value })}
              placeholder="018/HRD-IZIN/09/2026"
              className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block mb-1 text-2xs font-bold text-slate-500 uppercase tracking-wider">
              Tanggal Pengajuan
            </label>
            <input
              type="date"
              value={permit.submissionDate}
              onChange={(e) => onUpdatePermit({ submissionDate: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 2. DATA IDENTITAS KARYAWAN */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
            <User className="w-4 h-4 text-indigo-600" />
            <span>I. DATA KARYAWAN PEMOHON</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/70">
            <div>
              <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase">
                Nama Lengkap Karyawan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={permit.employeeName}
                onChange={(e) => onUpdatePermit({ employeeName: e.target.value })}
                placeholder="Budi Santoso, S.Kom."
                className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase">
                Nomor Induk Karyawan (NIK)
              </label>
              <input
                type="text"
                value={permit.employeeId}
                onChange={(e) => onUpdatePermit({ employeeId: e.target.value })}
                placeholder="NIK-20220412"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase">
                Jabatan / Posisi
              </label>
              <input
                type="text"
                value={permit.employeePosition}
                onChange={(e) => onUpdatePermit({ employeePosition: e.target.value })}
                placeholder="Senior Software Engineer"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase">
                Divisi / Departemen
              </label>
              <input
                type="text"
                value={permit.employeeDepartment}
                onChange={(e) => onUpdatePermit({ employeeDepartment: e.target.value })}
                placeholder="Information Technology"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase">
                Nama Atasan Langsung
              </label>
              <input
                type="text"
                value={permit.supervisorName}
                onChange={(e) => onUpdatePermit({ supervisorName: e.target.value })}
                placeholder="Ir. Ahmad Zaelani, M.T."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase">
                Jabatan Atasan Langsung
              </label>
              <input
                type="text"
                value={permit.supervisorPosition}
                onChange={(e) => onUpdatePermit({ supervisorPosition: e.target.value })}
                placeholder="Engineering Manager"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 3. RINCIAN WAKTU KETERLAMBATAN */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>II. RINCIAN WAKTU KETERLAMBATAN</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-amber-50/30 p-3.5 rounded-xl border border-amber-200/60">
            <div>
              <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase">
                Hari / Tanggal Kejadian
              </label>
              <input
                type="date"
                value={permit.incidentDate}
                onChange={(e) => onUpdatePermit({ incidentDate: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase">
                Jadwal Shift Kerja
              </label>
              <input
                type="text"
                value={permit.shiftSchedule}
                onChange={(e) => onUpdatePermit({ shiftSchedule: e.target.value })}
                placeholder="08:00 - 17:00 (Normal)"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase">
                Keterlambatan Ke- (Bulan Ini)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={permit.tardinessCountThisMonth || 1}
                  onChange={(e) => onUpdatePermit({ tardinessCountThisMonth: Number(e.target.value) })}
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <span className="absolute right-3 top-2 text-2xs text-slate-500">kali</span>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase">
                Jam Masuk Seharusnya
              </label>
              <input
                type="time"
                value={permit.standardTime}
                onChange={(e) => {
                  onUpdatePermit({ standardTime: e.target.value });
                }}
                className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase">
                Jam Kedatangan Aktual
              </label>
              <input
                type="time"
                value={permit.actualArrivalTime}
                onChange={(e) => {
                  onUpdatePermit({ actualArrivalTime: e.target.value });
                }}
                className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 4. ALASAN KETERLAMBATAN */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>III. ALASAN KETERLAMBATAN & BUKTI PENDUKUNG</span>
            </div>
          </div>

          {/* Tombol Preset Alasan Cepat */}
          <div className="space-y-1.5">
            <span className="text-3xs font-semibold text-slate-500 uppercase tracking-wider">
              Pilih Alasan Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {LATE_REASON_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onUpdatePermit({
                      reasonCategory: opt.id,
                      reasonDescription: opt.defaultExplanation,
                    })
                  }
                  className={`text-2xs px-2.5 py-1.5 rounded-lg border transition-all text-left ${
                    permit.reasonCategory === opt.id
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-2xs font-semibold text-slate-600 uppercase">
              Uraian / Penjelasan Rinci Keterlambatan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={permit.reasonDescription}
              onChange={(e) => onUpdatePermit({ reasonDescription: e.target.value })}
              placeholder="Jelaskan secara kronologis kendala yang dialami di perjalanan..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Bukti Terlampir Checkbox */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasAttachmentCheckbox"
                checked={permit.hasAttachment}
                onChange={(e) => onUpdatePermit({ hasAttachment: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="hasAttachmentCheckbox" className="text-xs font-semibold text-slate-800 cursor-pointer flex items-center space-x-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                <span>Menyertakan Bukti / Foto Lampiran Pendukung</span>
              </label>
            </div>

            {permit.hasAttachment && (
              <input
                type="text"
                value={permit.attachmentNote || ''}
                onChange={(e) => onUpdatePermit({ attachmentNote: e.target.value })}
                placeholder="Contoh: Foto kemacetan Maps / Struk bengkel"
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 w-full sm:w-64 focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
