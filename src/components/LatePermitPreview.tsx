import React from 'react';
import { CompanyProfile, LatePermitData } from '../types';
import { DEFAULT_COMPANY } from '../data/presets';
import { formatIndonesianDate } from '../utils/dateUtils';
import { LATE_REASON_OPTIONS } from '../data/latePresets';

interface LatePermitPreviewProps {
  permit: LatePermitData;
  company?: CompanyProfile;
}

export const LatePermitPreview: React.FC<LatePermitPreviewProps> = ({ permit, company: propCompany }) => {
  const company = propCompany || DEFAULT_COMPANY;
  const isLeftAlign = company.kopAlignment === 'left';
  const reasonObj = LATE_REASON_OPTIONS.find((r) => r.id === permit.reasonCategory);

  return (
    <div className="w-full flex flex-col items-center justify-start">
      {/* Lembar A4 Cetak */}
      <div
        id="late-permit-print-area"
        className="w-full max-w-[210mm] min-h-[297mm] bg-white border border-slate-300/80 shadow-lg rounded-sm p-8 sm:p-12 text-slate-900 font-serif leading-normal flex flex-col justify-between"
        style={{ boxSizing: 'border-box' }}
      >
        <div>
          {/* KOP SURAT RESMI */}
          <div
            className={`pb-4 mb-4 ${
              company.kopBorder === 'none'
                ? ''
                : company.kopBorder === 'single'
                ? 'border-b border-slate-950'
                : company.kopBorder === 'bold'
                ? 'border-b-2 sm:border-b-[2.5px] border-slate-950'
                : 'border-b-4 border-double border-slate-950'
            }`}
          >
            {isLeftAlign ? (
              /* Layout Rata Kiri */
              <div className="flex items-center space-x-4">
                {company.showLogo !== false && company.logoUrl && (
                  <div className="shrink-0">
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="object-contain"
                      style={{
                        width: `${company.logoSize || 64}px`,
                        height: `${company.logoSize || 64}px`,
                        borderRadius:
                          company.logoShape === 'circle'
                            ? '9999px'
                            : company.logoShape === 'rounded'
                            ? '8px'
                            : '0px',
                      }}
                    />
                  </div>
                )}
                <div className="text-left flex-1 min-w-0">
                  <h1 className="text-base sm:text-xl font-bold uppercase tracking-wide text-slate-950 font-serif">
                    {company.name}
                  </h1>
                  {company.subName && (
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 font-sans tracking-tight mt-0.5">
                      {company.subName}
                    </p>
                  )}
                  <p className="text-2xs sm:text-xs text-slate-700 font-sans mt-1 leading-snug">
                    {[company.address, company.city].filter(Boolean).join(', ')}
                    {company.postalCode ? ` ${company.postalCode}` : ''}
                  </p>
                  <p className="text-2xs sm:text-xs text-slate-700 font-sans leading-snug">
                    <span>Telepon: {company.phone}</span>
                    <span className="mx-2">•</span>
                    <span>Email: {company.email}</span>
                    {company.website && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Website: {company.website}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              /* Layout Simetris Tengah (Baku) */
              <div className="flex items-center justify-between">
                {/* Kolom Kiri: Logo */}
                <div
                  style={{
                    width: company.showLogo !== false && company.logoUrl ? `${Math.max((company.logoSize || 64) + 16, 80)}px` : '0px',
                    minWidth: company.showLogo !== false && company.logoUrl ? `${Math.max((company.logoSize || 64) + 16, 80)}px` : '0px',
                  }}
                  className="shrink-0 flex items-center justify-start"
                >
                  {company.showLogo !== false && company.logoUrl && (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="object-contain"
                      style={{
                        width: `${company.logoSize || 64}px`,
                        height: `${company.logoSize || 64}px`,
                        borderRadius:
                          company.logoShape === 'circle'
                            ? '9999px'
                            : company.logoShape === 'rounded'
                            ? '8px'
                            : '0px',
                      }}
                    />
                  )}
                </div>

                {/* Kolom Tengah: Teks Identitas PT (100% Simetris di Tengah Lembar) */}
                <div className="text-center flex-1 min-w-0 px-2">
                  <h1 className="text-base sm:text-xl font-bold uppercase tracking-wide text-slate-950 font-serif">
                    {company.name}
                  </h1>
                  {company.subName && (
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 font-sans tracking-tight mt-0.5">
                      {company.subName}
                    </p>
                  )}
                  <p className="text-2xs sm:text-xs text-slate-700 font-sans mt-1 leading-snug">
                    {[company.address, company.city].filter(Boolean).join(', ')}
                    {company.postalCode ? ` ${company.postalCode}` : ''}
                  </p>
                  <p className="text-2xs sm:text-xs text-slate-700 font-sans leading-snug">
                    <span>Telepon: {company.phone}</span>
                    <span className="mx-2">•</span>
                    <span>Email: {company.email}</span>
                    {company.website && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Website: {company.website}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Kolom Kanan: Balancer Spacer */}
                <div
                  style={{
                    width: company.showLogo !== false && company.logoUrl ? `${Math.max((company.logoSize || 64) + 16, 80)}px` : '0px',
                    minWidth: company.showLogo !== false && company.logoUrl ? `${Math.max((company.logoSize || 64) + 16, 80)}px` : '0px',
                  }}
                  className="shrink-0 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>

          {/* JUDUL DOKUMEN & NOMOR */}
          <div className="text-center my-4">
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-950 underline decoration-2 underline-offset-4">
              FORMULIR IZIN KETERLAMBATAN MASUK KERJA
            </h2>
            <p className="text-xs sm:text-sm font-sans font-medium text-slate-700 mt-1.5">
              Nomor: <span className="font-bold text-slate-950">{permit.permitNumber || '018/HRD-IZIN/09/2026'}</span>
            </p>
          </div>

          {/* BAGIAN I: DATA KARYAWAN */}
          <div className="mb-4">
            <div className="bg-slate-100/90 border-l-3 border-indigo-600 px-2.5 py-1 text-2xs sm:text-xs font-bold text-slate-900 font-sans uppercase tracking-wider mb-2">
              I. IDENTITAS KARYAWAN PEMOHON
            </div>
            <table className="w-full text-xs sm:text-sm border-collapse">
              <tbody>
                <tr>
                  <td className="w-44 py-1 text-slate-700 font-sans">Nama Lengkap Karyawan</td>
                  <td className="w-4 py-1 text-center">:</td>
                  <td className="py-1 font-bold text-slate-950 font-serif">{permit.employeeName || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-700 font-sans">Nomor Induk Karyawan (NIK)</td>
                  <td className="py-1 text-center">:</td>
                  <td className="py-1 font-sans font-medium">{permit.employeeId || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-700 font-sans">Jabatan / Posisi</td>
                  <td className="py-1 text-center">:</td>
                  <td className="py-1 font-sans">{permit.employeePosition || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-700 font-sans">Divisi / Departemen</td>
                  <td className="py-1 text-center">:</td>
                  <td className="py-1 font-sans">{permit.employeeDepartment || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-700 font-sans">Atasan Langsung</td>
                  <td className="py-1 text-center">:</td>
                  <td className="py-1 font-sans">
                    {permit.supervisorName || '-'}
                    {permit.supervisorPosition ? ` (${permit.supervisorPosition})` : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* BAGIAN II: RINCIAN WAKTU KETERLAMBATAN */}
          <div className="mb-4">
            <div className="bg-slate-100/90 border-l-3 border-amber-600 px-2.5 py-1 text-2xs sm:text-xs font-bold text-slate-900 font-sans uppercase tracking-wider mb-2">
              II. RINCIAN WAKTU KETERLAMBATAN
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm font-sans">
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50/50">
                <span className="text-2xs text-slate-500 uppercase block font-semibold">Hari & Tanggal</span>
                <span className="font-bold text-slate-900">{formatIndonesianDate(permit.incidentDate)}</span>
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50/50">
                <span className="text-2xs text-slate-500 uppercase block font-semibold">Jadwal Shift / Kerja</span>
                <span className="font-medium text-slate-900">{permit.shiftSchedule || '08:00 - 17:00'}</span>
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50/50">
                <span className="text-2xs text-slate-500 uppercase block font-semibold">Jam Masuk Seharusnya</span>
                <span className="font-mono font-bold text-slate-900">{permit.standardTime} WIB</span>
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50/50">
                <span className="text-2xs text-slate-500 uppercase block font-semibold">Jam Kedatangan Aktual</span>
                <span className="font-mono font-bold text-rose-700">{permit.actualArrivalTime} WIB</span>
              </div>
            </div>
          </div>

          {/* BAGIAN III: ALASAN KETERLAMBATAN */}
          <div className="mb-5">
            <div className="bg-slate-100/90 border-l-3 border-rose-600 px-2.5 py-1 text-2xs sm:text-xs font-bold text-slate-900 font-sans uppercase tracking-wider mb-2">
              III. ALASAN KETERLAMBATAN & BUKTI PENDUKUNG
            </div>
            <div className="text-xs sm:text-sm font-sans space-y-2">
              <div className="flex items-start space-x-2">
                <span className="w-36 shrink-0 text-slate-600 font-medium">Kategori Alasan:</span>
                <span className="font-bold text-slate-900">{reasonObj?.label || permit.reasonCategory}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-36 shrink-0 text-slate-600 font-medium">Penjelasan Rinci:</span>
                <p className="text-slate-900 text-justify leading-relaxed flex-1 font-serif">
                  {permit.reasonDescription || 'Tidak ada penjelasan rinci.'}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-2xs">
                <span className="w-36 text-slate-600 font-medium font-sans">Bukti Terlampir:</span>
                <span className="font-bold text-slate-800 font-sans">
                  {permit.hasAttachment ? `✓ Ada (${permit.attachmentNote || 'Foto/Dokumen terlampir'})` : '✕ Tidak Ada Lampiran'}
                </span>
              </div>
            </div>
          </div>

          {/* CATATAN RESMI */}
          <p className="text-[10px] text-slate-500 italic font-sans mb-6">
            *Formulir ini diajukan sebagai bentuk kepatuhan terhadap Peraturan Perusahaan / Perjanjian Kerja Bersama (PKB) mengenai disiplin kerja dan tata tertib kehadiran kerja.
          </p>

          {/* TANDA TANGAN TRIPARTIT */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-sans mt-4">
            {/* 1. Karyawan */}
            <div className="flex flex-col justify-between h-36">
              <div>
                <p className="text-2xs text-slate-500 uppercase tracking-wider">Pemohon,</p>
                <p className="font-bold text-slate-900 mt-0.5">Karyawan Yang Bersangkutan</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-950 font-serif">
                  {permit.employeeName || '( ................................... )'}
                </p>
                <p className="text-3xs text-slate-500 mt-0.5">Tgl: {formatIndonesianDate(permit.submissionDate)}</p>
              </div>
            </div>

            {/* 2. Atasan Langsung */}
            <div className="flex flex-col justify-between h-36 border-x border-slate-100 px-2">
              <div>
                <p className="text-2xs text-slate-500 uppercase tracking-wider">Mengetahui & Menyetujui,</p>
                <p className="font-bold text-slate-900 mt-0.5">Atasan Langsung</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-950 font-serif">
                  {permit.supervisorName || '( ................................... )'}
                </p>
                <p className="text-3xs text-slate-500 mt-0.5">
                  Tgl: {permit.supervisorApprovalDate ? formatIndonesianDate(permit.supervisorApprovalDate) : '..... / ..... / 20.....'}
                </p>
              </div>
            </div>

            {/* 3. HRD */}
            <div className="flex flex-col justify-between h-36">
              <div>
                <p className="text-2xs text-slate-500 uppercase tracking-wider">Diverifikasi & Dicatat,</p>
                <p className="font-bold text-slate-900 mt-0.5">HR & General Affairs</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-950 font-serif">
                  ( ................................... )
                </p>
                <p className="text-3xs text-slate-500 mt-0.5">
                  Tgl: {permit.hrApprovalDate ? formatIndonesianDate(permit.hrApprovalDate) : '..... / ..... / 20.....'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER LEMBAR CETAK */}
        <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-3xs text-slate-400 font-sans">
          <span>Formulir Izin Kehadiran Resmi Perusahaan • Dokumen Kepegawaian</span>
          <span>Dicetak melalui Sistem Personalia Resmi</span>
        </div>
      </div>
    </div>
  );
};
