import { CompanyProfile, LetterData, DisnakerReportData } from '../types';
import { formatCurrencyIDR, formatIndonesianDate, formatIndonesianDateWithDay } from './dateUtils';
import { safeDownloadTextFile } from './fileDownloader';
import { escapeDeep } from './htmlEscape';

export function generateLetterPlainText(letter: LetterData, company: CompanyProfile): string {
  const dateFormatted = formatIndonesianDate(letter.letterDate);
  const effectiveDateFormatted = formatIndonesianDate(letter.effectiveDate);

  let text = '';
  text += `${company.name.toUpperCase()}\n`;
  const compAddressLine = [company.address, company.city].filter(Boolean).join(', ') + (company.postalCode ? ` ${company.postalCode}` : '');
  if (compAddressLine) {
    text += `${compAddressLine}\n`;
  }
  text += `Telp: ${company.phone} | Email: ${company.email}\n`;
  text += `======================================================================\n\n`;

  text += `SURAT PEMBERITAHUAN PEMUTUSAN HUBUNGAN KERJA\n`;
  text += `Nomor     : ${letter.letterNumber || '-'}\n`;
  text += `Lampiran  : ${letter.attachments || '-'}\n`;
  text += `Perihal   : ${letter.subject || 'Pemberitahuan Pemutusan Hubungan Kerja'}\n\n`;

  text += `Kepada Yth.\n`;
  text += `Sdr/Sdri  : ${letter.recipientName || letter.employeeName}\n`;
  text += `di ${letter.recipientAddress || 'Tempat'}\n\n`;

  text += `Dengan hormat,\n`;
  text += `Yang bertanda tangan di bawah ini:\n`;
  text += `Nama      : ${letter.signatoryName || '-'}\n`;
  text += `Jabatan   : ${letter.signatoryPosition || '-'}\n`;
  text += `Bertindak untuk dan atas nama ${letter.signatoryCompany || company.name}\n\n`;

  text += `Dengan ini memberitahukan kepada Saudara/Saudari:\n`;
  text += `Nama              : ${letter.employeeName || '-'}\n`;
  if (letter.employeeId) {
    text += `NIK               : ${letter.employeeId}\n`;
  }
  text += `Jabatan           : ${letter.employeePosition || '-'}\n`;
  text += `Unit Kerja/Divisi : ${letter.employeeDepartment || '-'}\n`;
  text += `PKWTT             : ${letter.pkwttInfo || '-'}\n\n`;

  text += `Bahwa:\n`;
  text += `${letter.reasonText || '-'}\n\n`;
  if (letter.effectiveDate) {
    text += `Berdasarkan pertimbangan tersebut, Pemutusan Hubungan Kerja (PHK) terhadap Saudara/Saudari dinyatakan efektif berlaku terhitung sejak tanggal ${effectiveDateFormatted}.\n\n`;
  }

  text += `${letter.statutoryClause}\n\n`;
  text += `Atas perhatian Saudara/Saudari, diucapkan terima kasih.\n\n`;

  text += `${letter.city || company.city}, ${dateFormatted}\n`;
  text += `${company.name}\n\n\n\n`;
  text += `( ${letter.signatoryName || '........................................'} )\n`;
  text += `${letter.signatoryPosition || 'HRD / Manajemen'}\n\n`;

  const showCC =
    letter.includeCarbonCopy !== false &&
    letter.carbonCopy &&
    letter.carbonCopy.filter((c) => c.trim()).length > 0;

  if (showCC && letter.carbonCopy) {
    text += `${letter.carbonCopyTitle || 'Tembusan Yth:'}\n`;
    letter.carbonCopy
      .filter((c) => c.trim())
      .forEach((cc, idx) => {
        text += `${idx + 1}. ${cc}\n`;
      });
    text += `\n`;
  }

  if (letter.compensation.includeCompensation) {
    text += `\n======================================================================\n`;
    text += `LAMPIRAN: RINCIAN KOMPENSASI HAK PEMUTUSAN HUBUNGAN KERJA\n`;
    text += `Nama Karyawan    : ${letter.employeeName}\n`;
    text += `Masa Kerja       : ${letter.compensation.yearsOfService} Tahun ${letter.compensation.monthsOfService} Bulan\n`;
    text += `Upah Pokok/Bulan : ${formatCurrencyIDR(letter.compensation.baseSalary)}\n\n`;
    text += `1. Uang Pesangon (UP)                : ${formatCurrencyIDR(letter.compensation.severancePay)}\n`;
    text += `2. Uang Penghargaan Masa Kerja (UPMK): ${formatCurrencyIDR(letter.compensation.serviceRewardPay)}\n`;
    text += `3. Uang Penggantian Hak (UPH)        : ${formatCurrencyIDR(letter.compensation.rightsCompensationPay)}\n`;
    const total =
      (letter.compensation.severancePay || 0) +
      (letter.compensation.serviceRewardPay || 0) +
      (letter.compensation.rightsCompensationPay || 0) +
      (letter.compensation.otherAllowances || 0);
    text += `----------------------------------------------------------------------\n`;
    text += `TOTAL HAK KOMPENSASI ESTIMASI        : ${formatCurrencyIDR(total)}\n`;
  }

  if (letter.includeReceiptForm) {
    text += `\n======================================================================\n`;
    text += `LEMBAR TANDA TERIMA & TANGGAPAN PEKERJA (PP NO. 35 TAHUN 2021 PASAL 38)\n`;
    text += `Saya yang bertanda tangan di bawah ini:\n`;
    text += `Nama     : ${letter.employeeName}\n`;
    text += `Jabatan  : ${letter.employeePosition}\n`;
    text += `Menyatakan telah menerima Surat Pemberitahuan PHK Nomor ${letter.letterNumber || '-'} pada:\n`;
    text += `Hari/Tanggal Diterima : ................................................\n`;
    text += `Pilihan Tanggapan:\n`;
    text += `[  ] MENERIMA Pemutusan Hubungan Kerja sesuai surat pemberitahuan.\n`;
    text += `[  ] MENOLAK Pemutusan Hubungan Kerja dengan alasan terlampir.\n\n`;
    text += `Tanda Tangan Pekerja:\n\n\n`;
    text += `( ${letter.employeeName} )\n`;
  }

  return text;
}

export function generateLetterDocumentHtml(rawLetter: LetterData, rawCompany: CompanyProfile): string {
  // Escape semua isian pengguna sebelum disisipkan ke template HTML
  const letter = escapeDeep(rawLetter);
  const company = escapeDeep(rawCompany);
  const dateFormatted = formatIndonesianDate(letter.letterDate);
  const effectiveDateFormatted = formatIndonesianDate(letter.effectiveDate);
  const totalComp =
    (letter.compensation.severancePay || 0) +
    (letter.compensation.serviceRewardPay || 0) +
    (letter.compensation.rightsCompensationPay || 0) +
    (letter.compensation.otherAllowances || 0);

  const showCC =
    letter.includeCarbonCopy !== false &&
    letter.carbonCopy &&
    letter.carbonCopy.filter((c) => c.trim()).length > 0;

  const borderBottomStyle =
    company.kopBorder === 'none'
      ? 'none'
      : company.kopBorder === 'single'
      ? '1px solid #000'
      : company.kopBorder === 'bold'
      ? '2.5px solid #000'
      : '3px double #000';
  const isLeftAlign = company.kopAlignment === 'left';

  const stampWordHtml = letter.includeStampPlaceholder
    ? letter.stampType === 'emeterai'
      ? `<div class="stamp-box-emeterai">
          <div style="font-size:7pt; font-weight:bold; color:#065f46;">e-METERAI 10000</div>
          <div style="font-size:6pt; color:#047857;">[ QR CODE RESMI ]</div>
          <div style="font-size:6.5pt; font-family:monospace; color:#334155;">SN: 8A4C2-2026</div>
          <div style="font-size:6pt; color:#64748b; font-style:italic;">(Ttd bersebelahan)</div>
        </div>`
      : `<div class="stamp-box">
          <div class="stamp-header">&#10022; METERAI TEMPEL &#10022;</div>
          <div style="font-size: 6pt; color: #64748b; text-transform: uppercase;">REPUBLIK INDONESIA</div>
          <div class="stamp-nominal">10.000</div>
          <div style="font-size: 6.5pt; font-weight: bold; color: #9f1239;">SEPULUH RIBU RUPIAH</div>
          <div class="stamp-note">Tgl: ..... / ..... / 20.....<br/>(Ttd mengenai meterai)</div>
        </div>`
    : '<br/><br/><br/><br/>';

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${letter.subject} - ${letter.employeeName}</title>
  <!--[if gte mso 9]>
  <xml>
  <w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 21cm 29.7cm;
      margin: 2.5cm 2.5cm 2.5cm 2.5cm;
      mso-page-orientation: portrait;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #111;
      margin: 0;
      padding: 0;
    }
    .header-table {
      width: 100%;
      border-bottom: 3px double #000;
      padding-bottom: 8px;
      margin-bottom: 16px;
      text-align: center;
    }
    .comp-name {
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 1px;
      margin: 0;
    }
    .comp-sub {
      font-size: 10pt;
      font-weight: bold;
      margin: 2px 0;
    }
    .comp-contact {
      font-size: 9pt;
      margin: 2px 0;
    }
    .title-doc {
      font-size: 12pt;
      font-weight: bold;
      text-align: center;
      text-decoration: underline;
      margin-top: 14px;
      margin-bottom: 2px;
    }
    .doc-number {
      font-size: 10.5pt;
      text-align: center;
      margin-bottom: 20px;
    }
    .meta-table, .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .meta-table td, .data-table td {
      padding: 2.5px 0;
      vertical-align: top;
      font-size: 11pt;
    }
    .col-label {
      width: 180px;
    }
    .col-colon {
      width: 20px;
      text-align: center;
    }
    p {
      text-align: justify;
      text-justify: inter-word;
      margin: 8px 0;
      line-height: 1.45;
    }
    .signature-table {
      width: 100%;
      margin-top: 30px;
      border-collapse: collapse;
    }
    .signature-table td {
      vertical-align: top;
      font-size: 11pt;
    }
    .stamp-box {
      border: 1.5px dashed #dc2626;
      background-color: #fff1f2;
      width: 120px;
      padding: 6px 4px;
      margin: 8px auto;
      text-align: center;
      font-size: 8pt;
      color: #881337;
      font-family: Arial, sans-serif;
      line-height: 1.2;
    }
    .stamp-header {
      font-size: 7pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #9f1239;
    }
    .stamp-nominal {
      font-size: 10pt;
      font-weight: bold;
      margin: 2px 0;
      color: #881337;
    }
    .stamp-note {
      font-size: 6pt;
      color: #475569;
      font-style: italic;
      margin-top: 2px;
    }
    .stamp-box-emeterai {
      border: 1.5px solid #059669;
      background-color: #ecfdf5;
      width: 120px;
      padding: 6px 4px;
      margin: 8px auto;
      text-align: center;
      font-size: 7.5pt;
      color: #065f46;
      font-family: Arial, sans-serif;
      line-height: 1.2;
    }
    .page-break {
      page-break-before: always;
    }
    .table-bordered {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .table-bordered th, .table-bordered td {
      border: 1px solid #333;
      padding: 6px 10px;
      font-size: 10pt;
    }
    .table-bordered th {
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>

  <!-- KOP SURAT -->
  <table class="header-table" style="border-bottom: ${borderBottomStyle};">
    <tr>
      ${company.showLogo !== false && company.logoUrl ? `
      <td style="width: 80px; vertical-align: middle; text-align: left; padding-right: 12px;">
        <img src="${company.logoUrl}" width="${company.logoSize || 64}" style="max-height: 70px; max-width: 120px; object-fit: contain;" alt="Logo" />
      </td>
      ` : ''}
      <td style="text-align: ${isLeftAlign ? 'left' : 'center'}; vertical-align: middle;">
        <div class="comp-name">${company.name.toUpperCase()}</div>
        ${company.subName ? `<div class="comp-sub">${company.subName}</div>` : ''}
        <div class="comp-contact">${[company.address, company.city].filter(Boolean).join(', ')}${company.postalCode ? ` ${company.postalCode}` : ''}</div>
        <div class="comp-contact">Telp: ${company.phone} | Email: ${company.email} ${company.website ? `| Web: ${company.website}` : ''}</div>
      </td>
      ${!isLeftAlign && company.showLogo !== false && company.logoUrl ? `
      <td style="width: 80px; vertical-align: middle; padding-left: 12px;"></td>
      ` : ''}
    </tr>
  </table>

  <!-- JUDUL SURAT -->
  <div class="title-doc">SURAT PEMBERITAHUAN PEMUTUSAN HUBUNGAN KERJA</div>
  <div class="doc-number">Nomor: ${letter.letterNumber || '-'}</div>

  <!-- META SURAT -->
  <table class="meta-table">
    <tr>
      <td style="width: 100px;">Lampiran</td>
      <td class="col-colon">:</td>
      <td>${letter.attachments || '-'}</td>
    </tr>
    <tr>
      <td>Perihal</td>
      <td class="col-colon">:</td>
      <td><strong>${letter.subject || 'Pemberitahuan Pemutusan Hubungan Kerja'}</strong></td>
    </tr>
  </table>

  <p style="margin-top: 14px; margin-bottom: 12px;">
    Kepada Yth.<br/>
    <strong>Sdr/Sdri ${letter.recipientName || letter.employeeName}</strong><br/>
    di ${letter.recipientAddress || 'Tempat'}
  </p>

  <p>Dengan hormat,</p>
  <p>Yang bertanda tangan di bawah ini:</p>

  <!-- DATA PIHAK PERTAMA -->
  <table class="data-table">
    <tr>
      <td class="col-label">Nama</td>
      <td class="col-colon">:</td>
      <td><strong>${letter.signatoryName || '-'}</strong></td>
    </tr>
    <tr>
      <td class="col-label">Jabatan</td>
      <td class="col-colon">:</td>
      <td>${letter.signatoryPosition || '-'}</td>
    </tr>
    <tr>
      <td class="col-label">Bertindak untuk dan atas nama</td>
      <td class="col-colon">:</td>
      <td><strong>${(letter.signatoryCompany || company.name).toUpperCase()}</strong></td>
    </tr>
  </table>

  <p>Dengan ini memberitahukan kepada Saudara/Saudari:</p>

  <!-- DATA PIHAK KEDUA -->
  <table class="data-table">
    <tr>
      <td class="col-label">Nama</td>
      <td class="col-colon">:</td>
      <td><strong>${letter.employeeName || '-'}</strong></td>
    </tr>
    ${letter.employeeId ? `
    <tr>
      <td class="col-label">Nomor Induk Karyawan (NIK)</td>
      <td class="col-colon">:</td>
      <td>${letter.employeeId}</td>
    </tr>` : ''}
    <tr>
      <td class="col-label">Jabatan</td>
      <td class="col-colon">:</td>
      <td>${letter.employeePosition || '-'}</td>
    </tr>
    <tr>
      <td class="col-label">Unit Kerja / Divisi</td>
      <td class="col-colon">:</td>
      <td>${letter.employeeDepartment || '-'}</td>
    </tr>
    <tr>
      <td class="col-label">PKWTT</td>
      <td class="col-colon">:</td>
      <td>${letter.pkwttInfo || '-'}</td>
    </tr>
  </table>

  <p><strong>Bahwa :</strong></p>
  <p>${letter.reasonText || '-'}</p>

  ${letter.effectiveDate ? `
  <p>Sehubungan dengan pertimbangan di atas, Pemutusan Hubungan Kerja (PHK) terhadap Saudara/Saudari dinyatakan efektif berlaku terhitung sejak tanggal <strong>${effectiveDateFormatted}</strong>.</p>
  ` : ''}

  <p>${letter.statutoryClause}</p>

  <p>Atas perhatian dan kerja sama Saudara/Saudari selama bekerja di Perusahaan, kami mengucapkan terima kasih.</p>

  <!-- PENUTUP & TANDA TANGAN -->
  <table class="signature-table">
    <tr>
      <td style="width: 50%;"></td>
      <td style="width: 50%; text-align: center;">
        ${letter.city || company.city}, ${dateFormatted}<br/>
        <strong>${(letter.signatoryCompany || company.name).toUpperCase()}</strong>
        ${stampWordHtml}
        <br/>
        <span style="text-decoration: underline; font-weight: bold;">${letter.signatoryName || '( ........................................ )'}</span><br/>
        <span>${letter.signatoryPosition || 'HR & General Affairs'}</span>
      </td>
    </tr>
  </table>

  ${showCC && letter.carbonCopy ? `
  <div style="margin-top: 25px; font-size: 9.5pt;">
    <strong>${letter.carbonCopyTitle || 'Tembusan Yth:'}</strong><br/>
    ${letter.carbonCopy.filter(c => c.trim()).map((cc, i) => `${i + 1}. ${cc}<br/>`).join('')}
  </div>
  ` : ''}

  <!-- LAMPIRAN KOMPENSASI JIKA DIAKTIFKAN -->
  ${letter.compensation.includeCompensation ? `
  <div class="page-break"></div>
  <table class="header-table">
    <tr>
      <td>
        <div class="comp-name">${company.name.toUpperCase()}</div>
        <div class="comp-sub">LAMPIRAN SURAT NO: ${letter.letterNumber || '-'}</div>
      </td>
    </tr>
  </table>

  <div class="title-doc" style="margin-bottom: 15px;">RINCIAN ESTIMASI HAK KOMPENSASI PEMUTUSAN HUBUNGAN KERJA</div>

  <table class="data-table" style="margin-bottom: 15px;">
    <tr>
      <td class="col-label">Nama Pekerja</td>
      <td class="col-colon">:</td>
      <td><strong>${letter.employeeName}</strong></td>
    </tr>
    <tr>
      <td class="col-label">Jabatan / Divisi</td>
      <td class="col-colon">:</td>
      <td>${letter.employeePosition} / ${letter.employeeDepartment}</td>
    </tr>
    <tr>
      <td class="col-label">Masa Kerja</td>
      <td class="col-colon">:</td>
      <td>${letter.compensation.yearsOfService} Tahun ${letter.compensation.monthsOfService} Bulan</td>
    </tr>
    <tr>
      <td class="col-label">Upah Dasar Terakhir</td>
      <td class="col-colon">:</td>
      <td><strong>${formatCurrencyIDR(letter.compensation.baseSalary)}</strong></td>
    </tr>
  </table>

  <table class="table-bordered">
    <thead>
      <tr>
        <th style="width: 40px; text-align: center;">No.</th>
        <th>Komponen Hak Sesuai PP No. 35 Tahun 2021</th>
        <th style="width: 170px; text-align: right;">Jumlah (Rupiah)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td>Uang Pesangon (UP)</td>
        <td style="text-align: right;">${formatCurrencyIDR(letter.compensation.severancePay)}</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td>Uang Penghargaan Masa Kerja (UPMK)</td>
        <td style="text-align: right;">${formatCurrencyIDR(letter.compensation.serviceRewardPay)}</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td>Uang Penggantian Hak (UPH) - Cuti Tahunan & Lainnya</td>
        <td style="text-align: right;">${formatCurrencyIDR(letter.compensation.rightsCompensationPay)}</td>
      </tr>
      ${letter.compensation.otherAllowances ? `
      <tr>
        <td style="text-align: center;">4</td>
        <td>Kompensasi / Tunjangan Tambahan Lainnya</td>
        <td style="text-align: right;">${formatCurrencyIDR(letter.compensation.otherAllowances)}</td>
      </tr>` : ''}
      <tr style="font-weight: bold; background-color: #f9f9f9;">
        <td colspan="2" style="text-align: right; padding-right: 15px;">TOTAL ESTIMASI HAK KOMPENSASI:</td>
        <td style="text-align: right;">${formatCurrencyIDR(totalComp)}</td>
      </tr>
    </tbody>
  </table>

  ${letter.compensation.notes ? `
  <p style="font-size: 9pt; color: #444; margin-top: 10px;"><em>Catatan: ${letter.compensation.notes}</em></p>
  ` : ''}

  <table class="signature-table" style="margin-top: 30px;">
    <tr>
      <td style="width: 50%; text-align: center;">
        Disiapkan oleh,<br/><strong>Human Capital Department</strong><br/><br/><br/><br/>
        <u>( ${letter.signatoryName} )</u>
      </td>
      <td style="width: 50%; text-align: center;">
        Diterima & Diperiksa oleh,<br/><strong>Pekerja Bersangkutan</strong><br/><br/><br/><br/>
        <u>( ${letter.employeeName} )</u>
      </td>
    </tr>
  </table>
  ` : ''}

  <!-- LEMBAR TANDA TERIMA / TANGGAPAN -->
  ${letter.includeReceiptForm ? `
  <div class="page-break"></div>
  <table class="header-table">
    <tr>
      <td>
        <div class="comp-name">${company.name.toUpperCase()}</div>
        <div class="comp-sub">LEMBAR TANDA TERIMA & TANGGAPAN PEKERJA</div>
      </td>
    </tr>
  </table>

  <div class="title-doc" style="margin-bottom: 6px;">LEMBAR TANDA TERIMA & PERNYATAAN TANGGAPAN</div>
  <div class="doc-number">Berdasarkan Pasal 38 PP No. 35 Tahun 2021</div>

  <p>Saya yang bertanda tangan di bawah ini:</p>
  <table class="data-table">
    <tr>
      <td class="col-label">Nama Pekerja</td>
      <td class="col-colon">:</td>
      <td><strong>${letter.employeeName}</strong></td>
    </tr>
    <tr>
      <td class="col-label">Jabatan</td>
      <td class="col-colon">:</td>
      <td>${letter.employeePosition}</td>
    </tr>
    <tr>
      <td class="col-label">Unit Kerja/Divisi</td>
      <td class="col-colon">:</td>
      <td>${letter.employeeDepartment}</td>
    </tr>
  </table>

  <p>Dengan ini menyatakan telah menerima Surat Pemberitahuan Pemutusan Hubungan Kerja (PHK) Nomor: <strong>${letter.letterNumber || '-'}</strong> dari Manajemen <strong>${company.name.toUpperCase()}</strong> pada:</p>

  <table class="data-table" style="margin-left: 20px;">
    <tr>
      <td style="width: 140px;">Hari / Tanggal</td>
      <td class="col-colon">:</td>
      <td>...........................................................................................</td>
    </tr>
    <tr>
      <td>Waktu / Jam</td>
      <td class="col-colon">:</td>
      <td>...........................................................................................</td>
    </tr>
  </table>

  <p style="margin-top: 15px;"><strong>PERNYATAAN TANGGAPAN PEKERJA (Pilih salah satu):</strong></p>
  <table style="width: 100%; border: 1px solid #999; padding: 10px; margin-bottom: 15px;">
    <tr>
      <td style="vertical-align: top; width: 30px; font-size: 14pt;">[ &nbsp; ]</td>
      <td>
        <strong>MENYETUJUI / MENERIMA</strong><br/>
        Saya MENERIMA dan MENYETUJUI Pemutusan Hubungan Kerja ini serta rincian hak kompensasi yang diberikan sesuai dengan ketentuan perundang-undangan yang berlaku.
      </td>
    </tr>
    <tr><td colspan="2" style="height: 10px;"></td></tr>
    <tr>
      <td style="vertical-align: top; width: 30px; font-size: 14pt;">[ &nbsp; ]</td>
      <td>
        <strong>MENOLAK</strong><br/>
        Saya MENOLAK Pemutusan Hubungan Kerja ini dan akan menyampaikan alasan penolakan secara tertulis paling lambat 5 (lima) hari kerja sejak diterimanya surat pemberitahuan ini untuk diselesaikan melalui mekanisme perundingan bipartit.<br/>
        Alasan singkat penolakan:<br/>
        ...................................................................................................................................................................<br/>
        ...................................................................................................................................................................
      </td>
    </tr>
  </table>

  <table class="signature-table" style="margin-top: 25px;">
    <tr>
      <td style="width: 50%; text-align: center;">
        Yang Menyerahkan Surat,<br/>
        <strong>HRD / Manajemen ${company.name.toUpperCase()}</strong><br/><br/><br/><br/>
        <u>( .................................................. )</u><br/>
        Tgl: ...........................................
      </td>
      <td style="width: 50%; text-align: center;">
        Yang Menerima & Menyatakan,<br/>
        <strong>Pekerja Bersangkutan</strong><br/>
        ${letter.includeEmployeeStampPlaceholder ? stampWordHtml : '<br/><br/><br/><br/>'}
        <u>( ${letter.employeeName} )</u><br/>
        Tgl: ...........................................
      </td>
    </tr>
  </table>
  ` : ''}

</body>
</html>
`;

  return htmlContent;
}

export function downloadWordDocument(letter: LetterData, company: CompanyProfile): void {
  const htmlContent = generateLetterDocumentHtml(letter, company);
  const safeName = (letter.employeeName || 'Karyawan').replace(/[^a-zA-Z0-9_-]+/g, '_');
  const safeNumber = letter.letterNumber ? letter.letterNumber.replace(/[^a-zA-Z0-9_-]+/g, '-') : 'Draft';
  const fileName = `Surat_PHK_${safeName}_${safeNumber}.doc`;
  safeDownloadTextFile(htmlContent, fileName, 'application/msword;charset=utf-8');
}

/**
 * Generate teks polos Surat Laporan PHK ke Disnaker (Suku Dinas Tenaga Kerja)
 */
export function generateDisnakerPlainText(report: DisnakerReportData, company: CompanyProfile): string {
  const dateFormatted = formatIndonesianDate(report.letterDate);
  const effectiveDateWithDay = formatIndonesianDateWithDay(report.effectiveDate);

  let text = '';
  text += `${company.name.toUpperCase()}\n`;
  const compAddressLine = [company.address, company.city].filter(Boolean).join(', ') + (company.postalCode ? ` ${company.postalCode}` : '');
  if (compAddressLine) {
    text += `${compAddressLine}\n`;
  }
  text += `Telp: ${company.phone} | Email: ${company.email}\n`;
  text += `======================================================================\n\n`;

  text += `Nomor     : ${report.letterNumber || '-'}\n`;
  text += `Lampiran  : ${report.attachments || '1 (satu) Berkas'}\n`;
  text += `Perihal   : ${report.subject || 'Laporan Pemutusan Hubungan Kerja (PHK)'}\n\n`;

  text += `Kepada Yth.\n`;
  text += `${report.targetOffice || 'Kepala Suku Dinas Tenaga Kerja, Transmigrasi, dan Energi'}\n`;
  if (report.targetCity) {
    text += `${report.targetCity}\n`;
  }
  text += `di Tempat\n\n`;

  text += `Dengan hormat,\n`;
  text += `Sehubungan dengan adanya Pemutusan Hubungan Kerja (PHK) terhadap karyawan di perusahaan kami, maka bersama surat ini kami bermaksud melaporkan pelaksanaan PHK tersebut sesuai dengan ketentuan perundang-undangan yang berlaku.\n\n`;

  text += `Adapun identitas pekerja yang mengalami Pemutusan Hubungan Kerja adalah sebagai berikut:\n`;
  text += `Nama Pekerja        : ${report.employeeName || '-'}\n`;
  text += `NIK / NIP           : ${report.employeeId || '-'}\n`;
  text += `Jabatan / Bagian    : ${report.employeePosition || '-'}\n`;
  text += `Tanggal Efektif PHK : ${effectiveDateWithDay}\n`;
  text += `Alasan PHK          : ${report.phkReason || '-'}\n\n`;

  text += `Sebagai bahan pertimbangan dan kelengkapan administrasi (termasuk keperluan program Jaminan Kehilangan Pekerjaan / JKP), bersama surat ini kami lampirkan:\n`;
  if (report.attachmentItems && report.attachmentItems.length > 0) {
    report.attachmentItems.forEach((item, index) => {
      text += `${index + 1}. ${item}\n`;
    });
  } else {
    text += `1. Salinan Surat Pemberitahuan PHK kepada Pekerja.\n`;
    text += `2. Bukti kesepakatan / Perjanjian Bersama (PB) / Tanggapan pekerja.\n`;
    text += `3. Data pendukung lainnya.\n`;
  }
  text += `\n`;

  text += `Demikian laporan ini kami sampaikan agar tercatat dan menjadi periksa adanya. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.\n\n`;

  text += `${report.city || company.city}, ${dateFormatted}\n`;
  text += `Hormat kami,\n`;
  text += `${company.name}\n\n\n\n\n`;
  text += `( ${report.signatoryName || '........................................'} )\n`;
  text += `${report.signatoryPosition || 'Pimpinan / HRD Manager'}\n`;

  return text;
}

/**
 * Menghasilkan HTML dokumen resmi untuk Surat Laporan PHK ke Disnaker
 */
export function generateDisnakerDocumentHtml(rawReport: DisnakerReportData, rawCompany: CompanyProfile): string {
  // Escape semua isian pengguna sebelum disisipkan ke template HTML
  const report = escapeDeep(rawReport);
  const company = escapeDeep(rawCompany);
  const dateFormatted = formatIndonesianDate(report.letterDate);
  const effectiveDateWithDay = formatIndonesianDateWithDay(report.effectiveDate);

  let borderStyle = 'border-bottom: 3px double #000;';
  if (company.kopBorder === 'bold') {
    borderStyle = 'border-bottom: 3px solid #000;';
  } else if (company.kopBorder === 'single') {
    borderStyle = 'border-bottom: 1px solid #000;';
  } else if (company.kopBorder === 'none') {
    borderStyle = '';
  }

  const isLeftAlign = company.kopAlignment === 'left';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Surat Laporan PHK ke Disnaker - ${report.employeeName}</title>
  <style>
    @page {
      size: 215mm 330mm;
      margin: 2.5cm 2.5cm 2.5cm 2.5cm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.45;
      color: #000;
      margin: 0;
      padding: 0;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      ${borderStyle}
      padding-bottom: 12px;
      margin-bottom: 22px;
    }
    .company-title {
      font-size: 15pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .company-sub {
      font-size: 10pt;
      color: #333;
      margin: 2px 0 0 0;
    }
    .company-contact {
      font-size: 9pt;
      color: #444;
      margin: 3px 0 0 0;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      font-size: 11.5pt;
    }
    .meta-table td {
      vertical-align: top;
      padding: 2px 0;
    }
    .content-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 11.5pt;
    }
    .content-table td {
      vertical-align: top;
      padding: 3px 0;
    }
    .signature-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
    }
  </style>
</head>
<body>

  <!-- KOP SURAT PERUSAHAAN -->
  <table class="header-table">
    <tr>
      ${company.showLogo !== false && company.logoUrl ? `
      <td style="width: 80px; vertical-align: middle; text-align: left; padding-right: 12px;">
        <img src="${company.logoUrl}" width="${company.logoSize || 64}" style="max-height: 70px; max-width: 120px; object-fit: contain;" alt="Logo" />
      </td>
      ` : ''}
      <td style="text-align: ${isLeftAlign ? 'left' : 'center'}; vertical-align: middle;">
        <div class="company-title">${company.name}</div>
        ${company.subName ? `<div class="company-sub">${company.subName}</div>` : ''}
        <div class="company-contact">
          ${[company.address, company.city].filter(Boolean).join(', ')} ${company.postalCode || ''}<br/>
          Telp: ${company.phone} | Email: ${company.email}
          ${company.website ? ` | Web: ${company.website}` : ''}
        </div>
      </td>
      ${!isLeftAlign && company.showLogo !== false && company.logoUrl ? `
      <td style="width: 80px; vertical-align: middle; padding-left: 12px;"></td>
      ` : ''}
    </tr>
  </table>

  <!-- NOMOR & PERIHAL SURAT -->
  <table class="meta-table">
    <tr>
      <td style="width: 100px;">Nomor</td>
      <td style="width: 15px;">:</td>
      <td><strong>${report.letterNumber || '-'}</strong></td>
    </tr>
    <tr>
      <td>Lampiran</td>
      <td>:</td>
      <td>${report.attachments || '1 (satu) Berkas'}</td>
    </tr>
    <tr>
      <td>Perihal</td>
      <td>:</td>
      <td><strong>${report.subject || 'Laporan Pemutusan Hubungan Kerja (PHK)'}</strong></td>
    </tr>
  </table>

  <!-- TUJUAN SURAT -->
  <div style="margin-bottom: 16px; font-size: 11.5pt;">
    Kepada Yth.<br/>
    <strong>${report.targetOffice || 'Kepala Suku Dinas Tenaga Kerja, Transmigrasi, dan Energi'}</strong><br/>
    ${report.targetCity ? `${report.targetCity}<br/>` : ''}
    di Tempat
  </div>

  <!-- ISI SURAT -->
  <div style="margin-bottom: 12px; font-size: 11.5pt;">
    Dengan hormat,
  </div>

  <p style="text-align: justify; text-indent: 35px; margin: 0 0 14px 0; font-size: 11.5pt; line-height: 1.5;">
    Sehubungan dengan adanya Pemutusan Hubungan Kerja (PHK) terhadap karyawan di perusahaan kami, maka bersama surat ini kami bermaksud melaporkan pelaksanaan PHK tersebut sesuai dengan ketentuan perundang-undangan yang berlaku.
  </p>

  <div style="margin-bottom: 6px; font-size: 11.5pt;">
    Adapun identitas pekerja yang mengalami Pemutusan Hubungan Kerja adalah sebagai berikut:
  </div>

  <table class="content-table" style="margin-left: 20px; width: 95%;">
    <tr>
      <td style="width: 190px;">Nama Pekerja</td>
      <td style="width: 15px;">:</td>
      <td><strong>${report.employeeName || '-'}</strong></td>
    </tr>
    <tr>
      <td>NIK / NIP</td>
      <td>:</td>
      <td>${report.employeeId || '-'}</td>
    </tr>
    <tr>
      <td>Jabatan / Bagian</td>
      <td>:</td>
      <td>${report.employeePosition || '-'}</td>
    </tr>
    <tr>
      <td>Tanggal Efektif PHK</td>
      <td>:</td>
      <td><strong>${effectiveDateWithDay}</strong></td>
    </tr>
    <tr>
      <td>Alasan PHK</td>
      <td>:</td>
      <td>${report.phkReason || '-'}</td>
    </tr>
  </table>

  <p style="margin: 14px 0 6px 0; font-size: 11.5pt;">
    Sebagai bahan pertimbangan dan kelengkapan administrasi (termasuk keperluan program Jaminan Kehilangan Pekerjaan / JKP), bersama surat ini kami lampirkan:
  </p>

  <ol style="margin: 4px 0 16px 22px; padding-left: 10px; font-size: 11.5pt; line-height: 1.5;">
    ${(report.attachmentItems || []).map((item) => `<li>${item}</li>`).join('')}
  </ol>

  <p style="text-align: justify; text-indent: 35px; margin: 0 0 20px 0; font-size: 11.5pt; line-height: 1.5;">
    Demikian laporan ini kami sampaikan agar tercatat dan menjadi periksa adanya. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.
  </p>

  <!-- TANDA TANGAN -->
  <table class="signature-table">
    <tr>
      <td style="width: 50%;"></td>
      <td style="width: 50%; text-align: left; font-size: 11.5pt;">
        ${report.city || company.city}, ${dateFormatted}<br/>
        Hormat kami,<br/>
        <strong>${company.name}</strong><br/><br/><br/><br/><br/><br/>
        <u><strong>${report.signatoryName || '........................................'}</strong></u><br/>
        ${report.signatoryPosition || 'Pimpinan / HRD Manager'}
      </td>
    </tr>
  </table>

</body>
</html>
`;

  return htmlContent;
}

export function downloadDisnakerWordDocument(report: DisnakerReportData, company: CompanyProfile): void {
  const htmlContent = generateDisnakerDocumentHtml(report, company);
  const safeName = (report.employeeName || 'Karyawan').replace(/[^a-zA-Z0-9_-]+/g, '_');
  const safeNumber = report.letterNumber ? report.letterNumber.replace(/[^a-zA-Z0-9_-]+/g, '-') : 'Draft';
  const fileName = `Laporan_PHK_Disnaker_${safeName}_${safeNumber}.doc`;
  safeDownloadTextFile(htmlContent, fileName, 'application/msword;charset=utf-8');
}


