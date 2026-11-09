import { BpjsAmalgamationData } from '../types';

export const INITIAL_BPJS_AMALGAMATION: BpjsAmalgamationData = {
  id: 'bpjs-amal-001',
  documentNumber: 'FM/KC/01/02/005',
  revisionNumber: '1',
  issueDate: '2026-09-23',

  // 1. Nama Perusahaan
  companyName: '',

  // 2. N.P.P (Nomor Pendaftaran Perusahaan)
  companyNpp: 'JA09283741',

  // 3. Data Tenaga Kerja
  employeeName: 'BAMBANG HERMAWAN, S.T.',
  birthPlace: 'Jakarta',
  birthDate: '1989-08-17',
  oldKpjNumber: '14018294719 (PT Sumber Makmur Sejahtera)',
  newKpjNumber: '22091823019',

  // 4. Riwayat Pekerjaan (Referensi kerja terlampir)
  workHistories: [
    'PT SUMBER MAKMUR SEJAHTERA (Masa Kerja: 2017 s/d 2021) - Parklaring No. 042/SMS-HRD/XII/2021',
    'PT CITRA KREASI NUSANTARA (Masa Kerja: 2022 s/d 2024) - Parklaring No. 119/CKN-PERS/I/2024',
    '(Masa Kerja: 2024 s/d Sekarang) - Perusahaan Aktif Saat Ini',
  ],

  // Kolom Penyerahan (Kiri)
  submissionDate: '2026-09-23',
  submitterName: 'BAMBANG HERMAWAN, S.T.',
  submitterRole: 'karyawan',
  submitterCompany: '',

  // Kolom Penerima (Kanan)
  csName: '',
  branchOffice: 'Kantor Cabang Jakarta Sudirman',
  receiptDate: '',

  // Checklist Kelengkapan Dokumen Amalgamasi BPJS Ketenagakerjaan
  attachmentsChecklist: {
    formAmalgamasi: true,
    oldKpjCopy: true,
    newKpjOriginal: true,
    workReferenceLetters: true,
    ktpCopy: true,
    kkCopy: true,
    bankBookCopy: false,
  },

  status: 'siap_cetak',
  notes: 'Penggabungan saldo JHT dari dua kepesertaan kartu lama ke kartu peserta baru.',
  createdAt: '2026-09-23T08:00:00.000Z',
  updatedAt: '2026-09-23T08:00:00.000Z',
};

export const SAMPLE_BPJS_AMALGAMATIONS: BpjsAmalgamationData[] = [
  INITIAL_BPJS_AMALGAMATION,
  {
    id: 'bpjs-amal-002',
    documentNumber: 'FM/KC/01/02/005',
    revisionNumber: '1',
    issueDate: '2026-09-18',
    companyName: '',
    companyNpp: 'SU88291043',
    employeeName: 'DEWI ANGGRAENI, S.Kom.',
    birthPlace: 'Surabaya',
    birthDate: '1993-11-24',
    oldKpjNumber: '17029384012 (PT Samudera Logistik Prima)',
    newKpjNumber: '25019283741',
    workHistories: [
      'PT SAMUDERA LOGISTIK PRIMA (2018 - 2023) - KPJ: 17029384012',
      '(2024 - Sekarang) - Perusahaan Aktif Saat Ini',
    ],
    submissionDate: '2026-09-18',
    submitterName: 'DEWI ANGGRAENI, S.Kom.',
    submitterRole: 'karyawan',
    submitterCompany: '',
    csName: 'Rina Sugiarto (CSO)',
    branchOffice: 'Kantor Cabang Surabaya Tanjung Perak',
    receiptDate: '2026-09-19',
    attachmentsChecklist: {
      formAmalgamasi: true,
      oldKpjCopy: true,
      newKpjOriginal: true,
      workReferenceLetters: true,
      ktpCopy: true,
      kkCopy: true,
      bankBookCopy: true,
    },
    status: 'diserahkan',
    notes: 'Klaim penggabungan saldo telah diverifikasi oleh CSO BPJS Ketenagakerjaan cabang Surabaya Tanjung Perak.',
    createdAt: '2026-09-18T10:30:00.000Z',
    updatedAt: '2026-09-19T14:15:00.000Z',
  },
];

export const BPJS_REQUIREMENTS_INFO = [
  {
    title: 'Formulir Permintaan Penggabungan Saldo Asli',
    desc: 'Formulir resmi bertanda tangan pekerja atau pihak HRD/atasan perusahaan.',
    required: true,
  },
  {
    title: 'Kartu Peserta BPJS Ketenagakerjaan (KPJ) Baru Asli',
    desc: 'Kartu fisik asli atau kartu digital resmi dari aplikasi JMO / SIAPkerja yang aktif saat ini.',
    required: true,
  },
  {
    title: 'Fotokopi Kartu Peserta BPJS Ketenagakerjaan (KPJ) Lama',
    desc: 'Fotokopi kartu kepesertaan dari perusahaan sebelumnya yang saldonya ingin digabungkan.',
    required: true,
  },
  {
    title: 'Surat Keterangan Berhenti Bekerja / Parklaring Asli',
    desc: 'Surat referensi kerja / pengalaman kerja dari perusahaan sebelumnya.',
    required: true,
  },
  {
    title: 'Fotokopi KTP Elektronik & Kartu Keluarga (KK)',
    desc: 'Identitas diri pemohon yang masih berlaku untuk verifikasi data NIK.',
    required: true,
  },
  {
    title: 'Surat Pengantar dari HRD Perusahaan (Opsional)',
    desc: 'Disarankan jika proses pengajuan dilakukan secara kolektif atau difasilitasi oleh tim HRD.',
    required: false,
  },
];
