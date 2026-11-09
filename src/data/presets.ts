import { CompanyProfile, LetterData, ReasonPreset, DisnakerReportData } from '../types';

export const DEFAULT_COMPANY: CompanyProfile = {
  id: 'pt-utama',
  name: '',
  subName: '',
  address: '',
  city: '',
  postalCode: '',
  phone: '',
  email: '',
  website: '',
  showLogo: false,
  logoSize: 64,
  logoShape: 'original',
  kopBorder: 'double',
  kopAlignment: 'center',
  businessField: '',
};

export const DEFAULT_COMPANIES: CompanyProfile[] = [DEFAULT_COMPANY];

/**
 * Profil perusahaan contoh versi lama. Dipakai hanya untuk membersihkan salinan yang
 * masih tersimpan di localStorage dan belum diubah pengguna (id DAN nama masih sama).
 */
export const LEGACY_DUMMY_COMPANIES: Array<{ id: string; name: string }> = [
  { id: 'pt-nusa-jaya', name: 'PT NUSA JAYA ABADI' },
  { id: 'pt-bahari-logistik', name: 'PT BAHARI LOGISTIK NUSANTARA' },
  { id: 'pt-sinar-karya', name: 'PT SINAR KARYA TEKNOLOGI' },
  { id: 'pt-mega-graha', name: 'PT MEGA GRAHA PERSADA' },
];

export const REASON_PRESETS: ReasonPreset[] = [
  {
    id: 'efisiensi-mencegah-rugi',
    title: 'Efisiensi untuk Mencegah Kerugian',
    category: 'Restrukturisasi / Efisiensi',
    legalBasis: 'Pasal 43 ayat (2) PP No. 35 Tahun 2021',
    defaultText:
      'Memperhatikan kondisi perekonomian dan dinamika bisnis industri saat ini yang berdampak langsung terhadap kinerja operasional perusahaan, manajemen telah melakukan kajian strategis secara komprehensif. Demi menjaga kelangsungan usaha (business continuity) dan mencegah terjadinya kerugian yang lebih besar di masa mendatang, Perusahaan terpaksa mengambil kebijakan langkah efisiensi organisasi dan rasionalisasi tenaga kerja.',
  },
  {
    id: 'efisiensi-kerugian',
    title: 'Efisiensi Akibat Kerugian Operasional',
    category: 'Restrukturisasi / Efisiensi',
    legalBasis: 'Pasal 43 ayat (1) PP No. 35 Tahun 2021',
    defaultText:
      'Berdasarkan hasil laporan keuangan audit internal dan eksternal Perusahaan yang menunjukkan terjadinya kerugian secara terus-menerus selama periode berjalan, serta setelah mengupayakan berbagai langkah penghematan beban operasional, Perusahaan harus melakukan restrukturisasi organisasi dan pengurangan tenaga kerja pada unit kerja terkait.',
  },
  {
    id: 'pelanggaran-sp3',
    title: 'Pelanggaran Ketentuan PK / PP / PKB (SP-3)',
    category: 'Disiplin Kerja',
    legalBasis: 'Pasal 52 ayat (1) PP No. 35 Tahun 2021',
    defaultText:
      'Saudara/Saudari telah melakukan tindakan pelanggaran terhadap ketentuan disiplin kerja sebagaimana tercantum dalam Perjanjian Kerja dan Peraturan Perusahaan. Perusahaan sebelumnya telah memberikan pembinaan dan surat peringatan secara bertahap, yaitu Surat Peringatan Pertama (SP I), Surat Peringatan Kedua (SP II), serta Surat Peringatan Ketiga (SP III) terakhir tertanggal [Tanggal SP III], namun sampai dengan batas waktu evaluasi belum menunjukkan perbaikan kinerja dan kepatuhan yang dipersyaratkan.',
  },
  {
    id: 'penggabungan-peleburan',
    title: 'Penggabungan / Peleburan / Restrukturisasi Korporasi',
    category: 'Korporasi',
    legalBasis: 'Pasal 41 & 42 PP No. 35 Tahun 2021',
    defaultText:
      'Sehubungan dengan telah disepakatinya aksi korporasi berupa penggabungan/restrukturisasi lini bisnis Perusahaan yang mengakibatkan adanya perampingan struktur organisasi dan duplikasi fungsi jabatan pada unit kerja/divisi Saudara/Saudari, Perusahaan memutuskan untuk tidak melanjutkan hubungan kerja dengan posisi tersebut.',
  },
  {
    id: 'usia-pensiun',
    title: 'Pekerja Mencapai Batas Usia Pensiun',
    category: 'Pensiun',
    legalBasis: 'Pasal 56 PP No. 35 Tahun 2021',
    defaultText:
      'Berdasarkan data kepegawaian dan ketentuan batas usia pensiun normal yang berlaku di Perusahaan (55/58 tahun), Saudara/Saudari telah mencapai usia pensiun terhitung sejak [Tanggal Pensiun]. Perusahaan mengucapkan terima kasih yang sebesar-besarnya atas segala dedikasi dan kontribusi Saudara/Saudari selama masa bakti di Perusahaan.',
  },
  {
    id: 'kustom',
    title: 'Alasan Kustom / Lainnya',
    category: 'Lainnya',
    legalBasis: 'PP No. 35 Tahun 2021',
    defaultText:
      'Perusahaan perlu melakukan penyesuaian hubungan kerja sehubungan dengan dinamika kebutuhan operasional dan arah kebijakan strategis Perusahaan terkini.',
  },
];

export const DEFAULT_STATUTORY_CLAUSE =
  'Sehubungan dengan hal tersebut di atas dan sesuai ketentuan sebagaimana diatur dalam Pasal 37 jo. Pasal 38 Peraturan Pemerintah Nomor 35 Tahun 2021 tentang Perjanjian Kerja Waktu Tertentu, Alih Daya, Waktu Kerja dan Waktu Istirahat, dan Pemutusan Hubungan Kerja, maka diminta kepada Saudara/Saudari agar memberikan tanggapan tertulis kepada kami paling lambat 5 hari kerja sejak diterimanya surat pemberitahuan ini.';

export const INITIAL_LETTER: LetterData = {
  id: 'phk-sample-001',
  letterNumber: '088/HRD-PHK/IX/2026',
  attachments: '1 (Satu) Berkas Rincian Hak Kompensasi',
  subject: 'Pemberitahuan Pemutusan Hubungan Kerja',
  city: 'Jakarta',
  letterDate: '2026-09-02',
  
  recipientName: 'Bambang Sudarsono, S.T.',
  recipientAddress: 'Tempat / Di Ruang Kerja',
  
  signatoryName: 'Dra. Hendrawati Kusuma, M.M.',
  signatoryPosition: 'Head of Human Capital & General Affairs',
  signatoryCompany: '',
  
  employeeName: 'Bambang Sudarsono, S.T.',
  employeeId: 'EMP-2019-084',
  employeePosition: 'Senior Operations Supervisor',
  employeeDepartment: 'Operasional & Logistik',
  pkwttInfo: 'Perjanjian Kerja No. 045/PKWTT/HRD/2019 tertanggal 15 Juli 2019',
  
  reasonPresetId: 'efisiensi-mencegah-rugi',
  reasonText:
    'Memperhatikan kondisi perekonomian dan dinamika bisnis industri saat ini yang berdampak langsung terhadap kinerja operasional perusahaan, manajemen telah melakukan kajian strategis secara komprehensif. Demi menjaga kelangsungan usaha (business continuity) dan mencegah terjadinya kerugian yang lebih besar di masa mendatang, Perusahaan terpaksa mengambil kebijakan langkah efisiensi organisasi dan rasionalisasi tenaga kerja pada Divisi Operasional & Logistik.',
  effectiveDate: '2026-09-22',
  
  statutoryClause: DEFAULT_STATUTORY_CLAUSE,
  
  includeCarbonCopy: true,
  carbonCopyTitle: 'Tembusan Yth:',
  carbonCopy: ['Direktur Operasional', 'Finance & Payroll Department', 'Arsip HRD'],
  
  includeReceiptForm: true,
  includeStampPlaceholder: true,
  
  compensation: {
    includeCompensation: true,
    baseSalary: 12500000,
    yearsOfService: 7,
    monthsOfService: 2,
    severancePay: 100000000, // 8 x upah (sesuai masa kerja 7 tahun)
    serviceRewardPay: 37500000, // 3 x upah (6-9 tahun)
    rightsCompensationPay: 6250000, // Sisa cuti tahunan
    otherAllowances: 0,
    notes: 'Perhitungan kompensasi hak pemutusan hubungan kerja diatur berdasarkan ketentuan Pasal 43 ayat (2) jo. Pasal 40 PP No. 35 Tahun 2021.',
  },
  
  status: 'terkirim',
  receivedDate: '2026-09-03',
  notes: 'Surat telah diserahkan langsung oleh HRD pada tanggal 3 September 2026. Menunggu tanggapan tertulis maksimal tanggal 10 September 2026.',
  createdAt: '2026-09-02T08:30:00Z',
  updatedAt: '2026-09-02T09:15:00Z',
};

export const DISNAKER_ATTACHMENTS_DEFAULT = [
  'Salinan Surat Pemberitahuan PHK kepada Pekerja.',
  'Bukti kesepakatan / Perjanjian Bersama (PB) / Tanggapan pekerja.',
  'Data pendukung lainnya.',
];

export const INITIAL_DISNAKER_LETTER: DisnakerReportData = {
  id: 'disnaker-sample-1',
  letterNumber: '001/HRD/IX/2026',
  attachments: '1 (satu) Berkas',
  subject: 'Laporan Pemutusan Hubungan Kerja (PHK)',
  targetOffice: 'Kepala Suku Dinas Tenaga Kerja, Transmigrasi, dan Energi',
  targetCity: 'Kota Administrasi Jakarta Selatan',
  employeeName: 'Budi Santoso, S.Kom.',
  employeeId: 'EMP-2019-084',
  employeePosition: 'Senior Operations Supervisor / Operasional & Logistik',
  effectiveDate: '2026-09-22',
  phkReason: 'Efisiensi perusahaan (Pencegahan Kerugian Berkelanjutan)',
  attachmentItems: [
    'Salinan Surat Pemberitahuan PHK kepada Pekerja.',
    'Bukti kesepakatan / Perjanjian Bersama (PB) / Tanggapan pekerja.',
    'Data pendukung lainnya.',
  ],
  city: 'Jakarta Selatan',
  letterDate: '2026-09-14',
  signatoryName: 'Hendra Gunawan, S.H., M.H.',
  signatoryPosition: 'Human Resources & General Affairs Manager',
  createdAt: '2026-09-14T08:00:00Z',
  updatedAt: '2026-09-14T08:00:00Z',
};

