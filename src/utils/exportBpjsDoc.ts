import { BpjsAmalgamationData } from '../types';
import { formatIndonesianDate } from './dateUtils';
import { safeDownloadTextFile } from './fileDownloader';
import { escapeDeep } from './htmlEscape';

export function generateBpjsAmalgamationPlainText(data: BpjsAmalgamationData): string {
  const issueDateFormatted = formatIndonesianDate(data.issueDate);
  const birthDateFormatted = formatIndonesianDate(data.birthDate);
  const subDateFormatted = formatIndonesianDate(data.submissionDate);

  const historiesText = data.workHistories && data.workHistories.length > 0
    ? data.workHistories.map((h, i) => `   ${i + 1}. ${h}`).join('\n')
    : '   1. -';

  return `
================================================================================
                    BPJS KETENAGAKERJAAN
               FORMULIR PERMINTAAN PENGGABUNGAN SALDO
================================================================================
No Dokumen : ${data.documentNumber || 'FM/KC/01/02/005'}
No. Revisi : ${data.revisionNumber || '1'}
Halaman    : 1 dari 1
Tanggal Dikeluarkan : ${issueDateFormatted}

1. Nama Perusahaan                         : ${data.companyName || '-'}
2. N.P.P                                   : ${data.companyNpp || '-'}
3. Data Tenaga Kerja                       :
   3.1. Nama Tenaga Kerja                  : ${data.employeeName || '-'}
   3.2 Tempat Tanggal Lahir                : ${data.birthPlace || '-'}, ${birthDateFormatted}
   3.3. No Kartu Peserta lama (fotokopi)   : ${data.oldKpjNumber || '-'}
   3.4. No Kartu Peserta baru (asli terlampir) : ${data.newKpjNumber || '-'}
4. Riwayat Pekerjaan (Referensi kerja terlampir):
${historiesText}

--------------------------------------------------------------------------------
Diserahkan oleh :                          Diterima oleh :
(Nama dan Perusahaan)                      (Nama Customer Service)


${data.submitterName || '................................'}               ${data.csName || '................................'}
Karyawan / atasan                          Pihak Jamsostek
Tanggal : ${subDateFormatted}                   Tanggal : ${data.receiptDate ? formatIndonesianDate(data.receiptDate) : '................................'}
================================================================================
  `.trim();
}

export function generateBpjsAmalgamationDocumentHtml(rawData: BpjsAmalgamationData): string {
  // Escape semua isian pengguna sebelum disisipkan ke template HTML
  const data = escapeDeep(rawData);
  const issueDateFormatted = formatIndonesianDate(data.issueDate);
  const birthDateFormatted = data.birthDate ? formatIndonesianDate(data.birthDate) : '-';
  const subDateFormatted = formatIndonesianDate(data.submissionDate);
  const receiptDateFormatted = data.receiptDate ? formatIndonesianDate(data.receiptDate) : '';

  const workHistoriesRows = data.workHistories && data.workHistories.length > 0
    ? data.workHistories.map((item, idx) => `
      <div style="padding: 4px 0; border-bottom: ${idx < data.workHistories.length - 1 ? '1px solid #000' : 'none'}; font-size: 10pt;">
        <strong>${idx + 1}.</strong> ${item}
      </div>
    `).join('')
    : '<div style="padding: 4px 0; font-size: 10pt;">1. -</div>';

  return `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Formulir Permintaan Penggabungan Saldo - ${data.employeeName || 'BPJS Ketenagakerjaan'}</title>
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
      margin: 1.5cm 1.5cm 1.5cm 1.5cm;
      mso-header-margin: 28.3pt;
      mso-footer-margin: 28.3pt;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      line-height: 1.3;
      color: #000000;
      background: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .bpjs-header-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5pt solid #000000;
      margin-bottom: 0;
      table-layout: fixed;
    }
    .bpjs-header-table td {
      border: 1pt solid #000000;
      padding: 4px 8px;
      vertical-align: middle;
    }
    .header-logo-cell {
      width: 33%;
      text-align: center;
      vertical-align: middle;
      padding: 6px;
    }
    .header-form-cell {
      width: 33%;
      text-align: center;
      padding: 0;
    }
    .header-title-cell {
      width: 34%;
      background-color: #d1d5db !important;
      text-align: center;
      font-weight: bold;
      font-size: 11pt;
      padding: 10px 6px;
      line-height: 1.25;
      letter-spacing: 0.5px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .doc-num-subtable {
      width: 100%;
      border-collapse: collapse;
      border: none;
    }
    .doc-num-subtable td {
      border: none;
      border-top: 1pt solid #000000;
      padding: 2px 6px;
      text-align: left;
      font-size: 8.5pt;
    }
    .meta-row td {
      font-size: 8.5pt;
      padding: 3px 6px;
    }
    .bpjs-data-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5pt solid #000000;
      border-top: none;
      margin-top: 0;
      margin-bottom: 0;
      table-layout: fixed;
    }
    .bpjs-data-table td {
      border: 1pt solid #000000;
      padding: 5px 8px;
      vertical-align: middle;
    }
    .col-no {
      width: 5%;
      text-align: center;
      font-weight: bold;
      vertical-align: middle;
      padding: 5px 2px;
    }
    .col-label {
      width: 37%;
      vertical-align: middle;
      padding: 5px 8px;
      font-size: 10pt;
    }
    .col-val {
      width: 58%;
      vertical-align: middle;
      padding: 5px 8px;
      font-size: 10pt;
    }
    .sub-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
      margin: 0;
      table-layout: fixed;
    }
    .sub-table td {
      border: none;
      border-top: 1pt solid #000000;
      padding: 5px 8px;
      vertical-align: middle;
    }
    .sub-table tr:first-child td {
      border-top: none;
    }
    .sub-col-label {
      width: 39%;
      font-size: 10pt;
    }
    .sub-col-val {
      width: 61%;
      font-size: 10pt;
    }
    .signature-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5pt solid #000000;
      margin-top: 24px;
      table-layout: fixed;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .signature-table td {
      border: 1pt solid #000000;
      padding: 10px 14px;
      width: 50%;
      vertical-align: top;
      font-size: 9.5pt;
    }
    .sig-name {
      font-weight: bold;
      text-decoration: underline;
    }
  </style>
</head>
<body>

  <!-- 1. KOP HEADER FORMULIR -->
  <table class="bpjs-header-table">
    <tr>
      <!-- LOGO BPJS KETENAGAKERJAAN -->
      <td class="header-logo-cell">
        <div style="display: flex; align-items: center; justify-content: center; text-align: left;">
          <table style="border: none; border-collapse: collapse; margin: 0 auto;">
            <tr>
              <td style="border: none; padding: 0 6px 0 0; vertical-align: middle;">
                <svg width="42" height="38" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Green Leaf Motif -->
                  <path d="M12 50 C12 25, 38 12, 65 15 C55 35, 40 55, 12 50 Z" fill="#22c55e" />
                  <path d="M35 55 C35 35, 55 24, 78 28 C70 45, 55 62, 35 55 Z" fill="#16a34a" />
                  <!-- Blue Waves -->
                  <path d="M15 62 C35 55, 60 58, 88 42 C78 65, 50 78, 15 62 Z" fill="#0284c7" />
                  <path d="M25 72 C42 66, 68 68, 92 56 C80 80, 52 88, 25 72 Z" fill="#0369a1" />
                </svg>
              </td>
              <td style="border: none; padding: 0; vertical-align: middle; text-align: left;">
                <div style="font-family: Arial, sans-serif; font-weight: 900; font-size: 15pt; color: #0284c7; line-height: 0.95; letter-spacing: -0.5px;">
                  BPJS
                </div>
                <div style="font-family: Arial, sans-serif; font-weight: bold; font-size: 8pt; color: #15803d; line-height: 1.1; margin-top: 1px;">
                  Ketenagakerjaan
                </div>
              </td>
            </tr>
          </table>
        </div>
      </td>

      <!-- NOMOR DOKUMEN & REVISI -->
      <td class="header-form-cell">
        <div style="font-size: 11pt; font-weight: bold; padding: 5px 4px; letter-spacing: 0.5px;">
          FORMULIR
        </div>
        <table class="doc-num-subtable">
          <tr>
            <td>No Dokumen : ${data.documentNumber || 'FM/KC/01/02/005'}</td>
          </tr>
          <tr>
            <td>No. Revisi &nbsp;&nbsp;: ${data.revisionNumber || '1'}</td>
          </tr>
        </table>
      </td>

      <!-- JUDUL FORMULIR -->
      <td class="header-title-cell">
        PERMINTAAN PENGGABUNGAN<br>SALDO
      </td>
    </tr>

    <!-- META HALAMAN & TANGGAL KELUAR -->
    <tr class="meta-row">
      <td style="border-top: 1pt solid #000; font-weight: 500;">Halaman 1 dari 1</td>
      <td colspan="2" style="border-top: 1pt solid #000; font-weight: 500;">Tanggal dikeluarkan: ${issueDateFormatted}</td>
    </tr>
  </table>

  <!-- 2. TABEL DATA TENAGA KERJA & PERUSAHAAN -->
  <table class="bpjs-data-table">
    <colgroup>
      <col style="width: 5%;">
      <col style="width: 37%;">
      <col style="width: 58%;">
    </colgroup>

    <!-- BARIS 1 DATA: NAMA PERUSAHAAN -->
    <tr>
      <td class="col-no">1</td>
      <td class="col-label">Nama Perusahaan</td>
      <td class="col-val">: <strong>${data.companyName || '-'}</strong></td>
    </tr>

    <!-- BARIS 2 DATA: N.P.P -->
    <tr>
      <td class="col-no">2</td>
      <td class="col-label">N.P.P</td>
      <td class="col-val">: ${data.companyNpp || '-'}</td>
    </tr>

    <!-- BARIS 3 DATA: DATA TENAGA KERJA -->
    <tr>
      <td class="col-no" style="vertical-align: top; padding-top: 8px;">3</td>
      <td colspan="2" style="padding: 0;">
        <table class="sub-table">
          <colgroup>
            <col style="width: 39%;">
            <col style="width: 61%;">
          </colgroup>
          <tr>
            <td class="sub-col-label" style="font-weight: normal;">Data Tenaga Kerja</td>
            <td class="sub-col-val">:</td>
          </tr>
          <tr>
            <td class="sub-col-label" style="padding-left: 14px;">3.1. Nama Tenaga Kerja</td>
            <td class="sub-col-val">: <strong>${data.employeeName || '-'}</strong></td>
          </tr>
          <tr>
            <td class="sub-col-label" style="padding-left: 14px;">3.2 Tempat Tanggal Lahir</td>
            <td class="sub-col-val">: ${data.birthPlace ? `${data.birthPlace}, ` : ''}${birthDateFormatted}</td>
          </tr>
          <tr>
            <td class="sub-col-label" style="padding-left: 14px;">3.3. No Kartu Peserta lama (fotokopi)</td>
            <td class="sub-col-val" style="font-family: monospace; font-size: 9.5pt;">: ${data.oldKpjNumber || '-'}</td>
          </tr>
          <tr>
            <td class="sub-col-label" style="padding-left: 14px;">3.4. No Kartu Peserta baru (asli terlampir)</td>
            <td class="sub-col-val" style="font-family: monospace; font-size: 9.5pt; font-weight: bold;">: ${data.newKpjNumber || '-'}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BARIS 4 DATA: RIWAYAT PEKERJAAN -->
    <tr>
      <td class="col-no" style="vertical-align: top; padding-top: 8px;">4</td>
      <td class="col-label" style="vertical-align: top; padding-top: 8px;">
        Riwayat Pekerjaan<br>
        <span style="font-size: 8.5pt; font-style: italic; color: #444;">(Referensi kerja terlampir)</span>
      </td>
      <td class="col-val" style="padding: 0 8px; vertical-align: top;">
        ${workHistoriesRows}
      </td>
    </tr>
  </table>

  <!-- 3. KOLOM PENGESAHAN / TANDA TANGAN (2 KOLOM) -->
  <table class="signature-table">
    <tr>
      <!-- PIHAK PENYERAH -->
      <td style="text-align: center;">
        <div style="font-size: 9pt; font-weight: bold; margin-bottom: 2px;">Diserahkan oleh :</div>
        <div style="font-size: 8.5pt; color: #444; margin-bottom: 36px;">(Nama dan Perusahaan)</div>
        
        <div class="sig-name">${data.submitterName || '...................................................'}</div>
        <div style="font-size: 8.5pt; margin-top: 2px; color: #333;">
          ${data.submitterRole === 'karyawan' ? 'Karyawan' : data.submitterRole === 'atasan' ? 'Atasan Langsung' : 'HRD Perusahaan'} / atasan
        </div>
        <div style="font-size: 8.5pt; margin-top: 10px; text-align: left; border-top: 1px dashed #999; padding-top: 4px;">
          Tanggal : ${subDateFormatted}
        </div>
      </td>

      <!-- PIHAK PENERIMA (BPJS KETENAGAKERJAAN / JAMSOSTEK) -->
      <td style="text-align: center;">
        <div style="font-size: 9pt; font-weight: bold; margin-bottom: 2px;">Diterima oleh :</div>
        <div style="font-size: 8.5pt; color: #444; margin-bottom: 36px;">( Nama Customer Service)</div>
        
        <div class="sig-name">${data.csName || '...................................................'}</div>
        <div style="font-size: 8.5pt; margin-top: 2px; color: #333;">Pihak Jamsostek</div>
        <div style="font-size: 8.5pt; margin-top: 10px; text-align: left; border-top: 1px dashed #999; padding-top: 4px;">
          Tanggal : ${receiptDateFormatted || '...................................................'}
        </div>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

export function downloadBpjsAmalgamationDoc(data: BpjsAmalgamationData): void {
  const htmlContent = generateBpjsAmalgamationDocumentHtml(data);
  const cleanName = (data.employeeName || 'Karyawan').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Form_Amalgamasi_BPJS_${cleanName}.doc`;
  safeDownloadTextFile(htmlContent, filename, 'application/msword;charset=utf-8');
}
