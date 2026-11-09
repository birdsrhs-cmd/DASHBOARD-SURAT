import { CompanyProfile, LatePermitData } from '../types';
import { formatIndonesianDate } from './dateUtils';
import { safeDownloadTextFile } from './fileDownloader';
import { escapeDeep } from './htmlEscape';

export function generateLatePermitPlainText(permit: LatePermitData, company: CompanyProfile): string {
  const dateFormatted = formatIndonesianDate(permit.submissionDate);
  const incidentFormatted = formatIndonesianDate(permit.incidentDate);

  return `
FORMULIR IZIN KETERLAMBATAN MASUK KERJA
NOMOR: ${permit.permitNumber || '-'}

${company.name.toUpperCase()}
${company.address}, ${company.city} ${company.postalCode || ''}
Telepon: ${company.phone} | Email: ${company.email}
--------------------------------------------------------------------------------

DATA KARYAWAN:
1. Nama Karyawan        : ${permit.employeeName || '-'}
2. NIK / No. Karyawan   : ${permit.employeeId || '-'}
3. Jabatan              : ${permit.employeePosition || '-'}
4. Divisi / Departemen  : ${permit.employeeDepartment || '-'}
5. Atasan Langsung      : ${permit.supervisorName || '-'} (${permit.supervisorPosition || '-'})

RINCIAN KETERLAMBATAN:
- Hari / Tanggal        : ${incidentFormatted}
- Jam Masuk Standar     : ${permit.standardTime} WIB (Jadwal: ${permit.shiftSchedule})
- Jam Tiba Aktual       : ${permit.actualArrivalTime} WIB
- Keterlambatan Ke-     : ${permit.tardinessCountThisMonth} (pada bulan berjalan)

ALASAN KETERLAMBATAN:
Kategori: ${permit.reasonCategory.toUpperCase()}
Uraian:
${permit.reasonDescription}
Bukti Terlampir: ${permit.hasAttachment ? `Ya (${permit.attachmentNote || 'Terlampir'})` : 'Tidak Ada'}

CATATAN PERSETUJUAN:
Catatan Atasan: ${permit.supervisorNotes || '-'}
Catatan HRD: ${permit.hrNotes || '-'}

TANDA TANGAN:
Pemohon (Karyawan)       : ${permit.employeeName || '....................'}
Atasan Langsung          : ${permit.supervisorName || '....................'}
HRD / Personalia         : ........................................

Tanggal Pengajuan: ${dateFormatted}
  `.trim();
}

export function generateLatePermitDocumentHtml(rawPermit: LatePermitData, rawCompany: CompanyProfile): string {
  // Escape semua isian pengguna sebelum disisipkan ke template HTML
  const permit = escapeDeep(rawPermit);
  const company = escapeDeep(rawCompany);
  const dateFormatted = formatIndonesianDate(permit.submissionDate);
  const incidentFormatted = formatIndonesianDate(permit.incidentDate);

  const borderBottomStyle =
    company.kopBorder === 'none'
      ? 'none'
      : company.kopBorder === 'single'
      ? '1px solid #000'
      : company.kopBorder === 'bold'
      ? '2.5px solid #000'
      : '3px double #000';
  const isLeftAlign = company.kopAlignment === 'left';

  const reasonLabels: Record<string, string> = {
    macet: 'Kemacetan Lalu Lintas Tidak Biasa / Insiden Jalan',
    kendaraan: 'Kendaraan Mogok / Masalah Transportasi',
    keluarga: 'Urusan Darurat Keluarga Mendesak',
    medis: 'Keperluan Medis / Berobat Pagi',
    cuaca: 'Kondisi Cuaca Ekstrem / Banjir',
    dinas: 'Tugas Dinas Luar Sebelum ke Kantor',
    lainnya: 'Alasan Khusus Lainnya',
  };

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Formulir Izin Keterlambatan - ${permit.employeeName || 'Karyawan'}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: A4 portrait;
      margin: 2.0cm 2.0cm 2.0cm 2.0cm;
      mso-header-margin: 35.4pt;
      mso-footer-margin: 35.4pt;
      mso-paper-source: 0;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.35;
      color: #000;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      padding-bottom: 8px;
    }
    .comp-name {
      font-size: 15pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin: 0;
      color: #000;
      text-transform: uppercase;
    }
    .comp-sub {
      font-size: 9.5pt;
      font-weight: bold;
      margin: 2px 0;
      color: #333;
    }
    .comp-contact {
      font-size: 8.5pt;
      color: #444;
      line-height: 1.3;
      margin-top: 2px;
    }
    .title-block {
      text-align: center;
      margin: 14px 0 16px 0;
    }
    .doc-title {
      font-size: 12.5pt;
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-number {
      font-size: 10pt;
      margin-top: 3px;
    }
    .section-header {
      font-size: 10.5pt;
      font-weight: bold;
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 4px 8px;
      margin-top: 12px;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    .form-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    .form-table td {
      padding: 3px 6px;
      vertical-align: top;
      font-size: 10.5pt;
    }
    .col-label {
      width: 200px;
      color: #222;
    }
    .col-colon {
      width: 15px;
      text-align: center;
    }
    .col-val {
      font-weight: 500;
    }
    .signature-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 28px;
      text-align: center;
    }
    .signature-table td {
      width: 33.3%;
      vertical-align: top;
      font-size: 10pt;
      padding: 4px;
    }
    .sig-name {
      font-weight: bold;
      text-decoration: underline;
      margin-top: 50px;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border: 1px solid #000;
      font-weight: bold;
      font-size: 9pt;
    }
  </style>
</head>
<body>

  <!-- KOP SURAT -->
  <table class="header-table" style="border-bottom: ${borderBottomStyle};">
    <tr>
      ${company.showLogo !== false && company.logoUrl ? `
      <td style="width: 75px; vertical-align: middle; text-align: left; padding-right: 12px;">
        <img src="${company.logoUrl}" width="${company.logoSize || 64}" height="${company.logoSize || 64}" style="display: block;" />
      </td>
      ` : ''}
      <td style="text-align: ${isLeftAlign ? 'left' : 'center'}; vertical-align: middle;">
        <div class="comp-name">${company.name.toUpperCase()}</div>
        ${company.subName ? `<div class="comp-sub">${company.subName}</div>` : ''}
        <div class="comp-contact">${[company.address, company.city].filter(Boolean).join(', ')}${company.postalCode ? ` ${company.postalCode}` : ''}</div>
        <div class="comp-contact">Telp: ${company.phone} | Email: ${company.email}${company.website ? ` | Web: ${company.website}` : ''}</div>
      </td>
      ${!isLeftAlign && company.showLogo !== false && company.logoUrl ? `
      <td style="width: 75px; vertical-align: middle; padding-left: 12px;"></td>
      ` : ''}
    </tr>
  </table>

  <!-- JUDUL DOKUMEN -->
  <div class="title-block">
    <div class="doc-title">FORMULIR IZIN KETERLAMBATAN MASUK KERJA</div>
    <div class="doc-number">Nomor: <strong>${permit.permitNumber || '-'}</strong></div>
  </div>

  <!-- BAGIAN I: DATA KARYAWAN -->
  <div class="section-header">I. IDENTITAS KARYAWAN</div>
  <table class="form-table">
    <tr>
      <td class="col-label">Nama Karyawan</td>
      <td class="col-colon">:</td>
      <td class="col-val"><strong>${permit.employeeName || '-'}</strong></td>
    </tr>
    <tr>
      <td class="col-label">Nomor Induk Karyawan (NIK)</td>
      <td class="col-colon">:</td>
      <td class="col-val">${permit.employeeId || '-'}</td>
    </tr>
    <tr>
      <td class="col-label">Jabatan / Posisi</td>
      <td class="col-colon">:</td>
      <td class="col-val">${permit.employeePosition || '-'}</td>
    </tr>
    <tr>
      <td class="col-label">Divisi / Departemen</td>
      <td class="col-colon">:</td>
      <td class="col-val">${permit.employeeDepartment || '-'}</td>
    </tr>
    <tr>
      <td class="col-label">Atasan Langsung</td>
      <td class="col-colon">:</td>
      <td class="col-val">${permit.supervisorName || '-'} (${permit.supervisorPosition || '-'})</td>
    </tr>
  </table>

  <!-- BAGIAN II: RINCIAN KETERLAMBATAN -->
  <div class="section-header">II. RINCIAN WAKTU KETERLAMBATAN</div>
  <table class="form-table">
    <tr>
      <td class="col-label">Hari / Tanggal Terlambat</td>
      <td class="col-colon">:</td>
      <td class="col-val">${incidentFormatted}</td>
    </tr>
    <tr>
      <td class="col-label">Jadwal Jam Kerja / Shift</td>
      <td class="col-colon">:</td>
      <td class="col-val">${permit.shiftSchedule || '08:00 - 17:00 (Normal)'}</td>
    </tr>
    <tr>
      <td class="col-label">Jam Masuk Seharusnya</td>
      <td class="col-colon">:</td>
      <td class="col-val"><strong>${permit.standardTime} WIB</strong></td>
    </tr>
    <tr>
      <td class="col-label">Jam Kedatangan Aktual</td>
      <td class="col-colon">:</td>
      <td class="col-val"><strong>${permit.actualArrivalTime} WIB</strong></td>
    </tr>
    <tr>
      <td class="col-label">Keterlambatan Ke-</td>
      <td class="col-colon">:</td>
      <td class="col-val">Keterlambatan ke-<strong>${permit.tardinessCountThisMonth}</strong> dalam bulan berjalan</td>
    </tr>
  </table>

  <!-- BAGIAN III: ALASAN KETERLAMBATAN -->
  <div class="section-header">III. ALASAN KETERLAMBATAN & BUKTI PENDUKUNG</div>
  <table class="form-table">
    <tr>
      <td class="col-label">Kategori Alasan</td>
      <td class="col-colon">:</td>
      <td class="col-val"><strong>${reasonLabels[permit.reasonCategory] || permit.reasonCategory}</strong></td>
    </tr>
    <tr>
      <td class="col-label">Uraian / Penjelasan Rinci</td>
      <td class="col-colon">:</td>
      <td class="col-val" style="text-align: justify;">${permit.reasonDescription || '-'}</td>
    </tr>
    <tr>
      <td class="col-label">Bukti Lampiran Pendukung</td>
      <td class="col-colon">:</td>
      <td class="col-val">${permit.hasAttachment ? `Ada — ${permit.attachmentNote || 'Foto/Dokumen terlampir'}` : 'Tidak Ada'}</td>
    </tr>
  </table>

  <div style="font-size: 8.5pt; color: #555; margin-top: 14px; font-style: italic;">
    *Catatan: Formulir ini wajib diserahkan kepada Departemen HRD selambat-lambatnya 1x24 jam setelah kedatangan untuk keperluan rekonsiliasi absensi dan payroll.
  </div>

  <!-- TANDA TANGAN TRIPARTIT -->
  <table class="signature-table">
    <tr>
      <td>
        Diajukan oleh,<br/>
        <strong>Karyawan Pemohon</strong>
        <div class="sig-name">
          ( ${permit.employeeName || '...........................................'} )
        </div>
        <div>Tgl: ${dateFormatted}</div>
      </td>
      <td>
        Mengetahui & Menyetujui,<br/>
        <strong>Atasan Langsung</strong>
        <div class="sig-name">
          ( ${permit.supervisorName || '...........................................'} )
        </div>
        <div>Tgl: ${permit.supervisorApprovalDate ? formatIndonesianDate(permit.supervisorApprovalDate) : '..... / ..... / 20.....'}</div>
      </td>
      <td>
        Diverifikasi & Dicatat,<br/>
        <strong>HRD / Personalia</strong>
        <div class="sig-name">
          ( ........................................... )
        </div>
        <div>Tgl: ${permit.hrApprovalDate ? formatIndonesianDate(permit.hrApprovalDate) : '..... / ..... / 20.....'}</div>
      </td>
    </tr>
  </table>

</body>
</html>
  `;

  return htmlContent;
}

export function downloadLatePermitWordDocument(permit: LatePermitData, company: CompanyProfile): void {
  const htmlContent = generateLatePermitDocumentHtml(permit, company);
  const safeName = (permit.employeeName || 'Karyawan').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Formulir_Izin_Terlambat_${safeName}_${permit.incidentDate}.doc`;
  safeDownloadTextFile(htmlContent, fileName, 'application/msword;charset=utf-8');
}
