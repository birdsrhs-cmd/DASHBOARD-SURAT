export type LetterStatus = 'draft' | 'terkirim' | 'disetujui' | 'ditolak' | 'selesai';

export interface CompanyProfile {
  id: string;
  name: string;
  subName?: string;
  address: string;
  city: string;
  postalCode?: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  showLogo?: boolean;
  logoSize?: number;
  logoShape?: 'original' | 'rounded' | 'circle' | 'bordered';
  kopBorder?: 'double' | 'single' | 'bold' | 'none';
  kopAlignment?: 'center' | 'left';
  businessField?: string;
}

export interface CompensationDetails {
  includeCompensation: boolean;
  baseSalary: number;
  yearsOfService: number;
  monthsOfService: number;
  severancePay: number; // Uang Pesangon (UP)
  serviceRewardPay: number; // Uang Penghargaan Masa Kerja (UPMK)
  rightsCompensationPay: number; // Uang Penggantian Hak (UPH)
  otherAllowances?: number;
  notes?: string;
}

export interface LetterData {
  id: string;
  letterNumber: string;
  attachments: string;
  subject: string;
  city: string;
  letterDate: string; // YYYY-MM-DD
  
  // Penerima Surat (Sdr/Sdri)
  recipientName: string;
  recipientAddress: string;
  
  // Pihak Pertama (Penandatangan)
  signatoryName: string;
  signatoryPosition: string;
  signatoryCompany: string;
  
  // Pihak Kedua (Karyawan)
  employeeName: string;
  employeeId?: string;
  employeePosition: string;
  employeeDepartment: string;
  pkwttInfo: string; // Misal: No. 112/HRD-PKWTT/2022 tertanggal 10 Februari 2022
  
  // Alasan ("Bahwa :")
  reasonPresetId?: string;
  reasonText: string;
  effectiveDate: string; // Tanggal Efektif PHK
  
  // Ketentuan Regulasi (PP 35/2021)
  statutoryClause: string;
  
  // Tembusan
  includeCarbonCopy?: boolean; // Tampilkan Tembusan Yth: (Opsional)
  carbonCopyTitle?: string; // Judul Tembusan, misal: "Tembusan Yth:" atau "Tembusan:"
  carbonCopy?: string[];
  
  // Fitur Tambahan Cetak
  includeReceiptForm: boolean; // Lembar tanda terima & tanggapan pekerja (Pasal 38)
  includeStampPlaceholder: boolean; // Kotak meterai 10.000
  stampType?: 'tempel' | 'emeterai'; // Jenis: Meterai Tempel Fisik 10.000 vs e-Meterai Digital
  stampPosition?: 'left' | 'center'; // Posisi penempatan meterai terhadap tanda tangan
  includeEmployeeStampPlaceholder?: boolean; // Meterai pada lembar tanggapan pekerja
  compensation: CompensationDetails;

  // Metadata Dashboard
  status: LetterStatus;
  receivedDate?: string; // Tanggal diterima pekerja untuk hitung deadline 5 hari kerja
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisnakerReportData {
  id: string;
  letterNumber: string; // misal: 001/HRD-DISNAKER/IX/2026
  attachments: string; // 1 (satu) Berkas
  subject: string; // Laporan Pemutusan Hubungan Kerja (PHK)
  targetOffice: string; // Kepala Suku Dinas Tenaga Kerja, Transmigrasi, dan Energi
  targetCity: string; // Kota Administrasi Jakarta Selatan / Sesuai Domisili
  
  // Identitas Pekerja
  employeeName: string;
  employeeId: string; // NIK / NIP
  employeePosition: string; // Jabatan / Bagian
  effectiveDate: string; // YYYY-MM-DD
  phkReason: string; // Alasan PHK
  
  // Kelengkapan Berkas / Lampiran
  attachmentItems: string[];
  
  // Penutup & Tanggal
  city: string;
  letterDate: string; // YYYY-MM-DD
  signatoryName: string;
  signatoryPosition: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ReasonPreset {
  id: string;
  title: string;
  category: string;
  legalBasis: string;
  defaultText: string;
}

export type LatePermitStatus = 'menunggu' | 'disetujui' | 'disetujui_kompensasi' | 'disetujui_potong' | 'ditolak';

export type LateReasonCategory = 
  | 'macet'
  | 'kendaraan'
  | 'keluarga'
  | 'medis'
  | 'cuaca'
  | 'dinas'
  | 'lainnya';

export interface LatePermitData {
  id: string;
  permitNumber: string; // Nomor Formulir, misal: 021/HRD-IZIN/09/2026
  submissionDate: string; // Tanggal formulir dibuat (YYYY-MM-DD)
  
  // Data Pegawai
  employeeName: string;
  employeeId: string; // NIK
  employeePosition: string;
  employeeDepartment: string;
  supervisorName: string;
  supervisorPosition: string;
  
  // Waktu Keterlambatan
  incidentDate: string; // Tanggal Terlambat
  shiftSchedule: string; // Jadwal Shift, misal: "08:00 - 17:00 (Normal)"
  standardTime: string; // Jam Masuk Seharusnya, misal: "08:00"
  actualArrivalTime: string; // Jam Tiba Kantor, misal: "08:45"
  lateDurationMinutes: number; // Durasi terlambat (menit)
  tardinessCountThisMonth: number; // Keterlambatan ke-n bulan ini
  
  // Alasan & Bukti
  reasonCategory: LateReasonCategory;
  reasonDescription: string;
  hasAttachment: boolean; // Ada lampiran foto/keterangan bukti
  attachmentNote?: string;
  
  // Usulan Kompensasi Waktu
  compensationMethod: 'ganti_hari_ini' | 'ganti_hari_lain' | 'potong_toleransi' | 'potong_tunjangan' | 'dispensasi_khusus';
  compensationDetails?: string; // Jam penggantian, misal: "Pulang jam 17:45 WIB"
  
  // Persetujuan & Tindak Lanjut
  status: LatePermitStatus;
  supervisorApprovalDate?: string;
  supervisorNotes?: string;
  hrApprovalDate?: string;
  hrNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type BpjsAmalgamationStatus = 'draft' | 'siap_cetak' | 'diserahkan' | 'selesai';

export interface BpjsAmalgamationData {
  id: string;
  documentNumber: string; // misal: "FM/KC/01/02/005"
  revisionNumber: string; // misal: "1"
  issueDate: string; // Tanggal dikeluarkan formulir (YYYY-MM-DD)
  
  // 1. Nama Perusahaan
  companyName: string;
  
  // 2. N.P.P (Nomor Pendaftaran Perusahaan)
  companyNpp: string;
  
  // 3. Data Tenaga Kerja
  employeeName: string; // 3.1. Nama Tenaga Kerja
  birthPlace: string; // 3.2 Tempat Lahir
  birthDate: string; // 3.2 Tanggal Lahir (YYYY-MM-DD)
  oldKpjNumber: string; // 3.3. No Kartu Peserta lama (fotokopi)
  newKpjNumber: string; // 3.4. No Kartu Peserta baru (asli terlampir)
  
  // 4. Riwayat Pekerjaan (Referensi kerja terlampir)
  workHistories: string[]; // List riwayat perusahaan sebelumnya (1, 2, 3...)
  
  // Kolom Penyerahan (Kiri)
  submissionDate: string; // Tanggal penyerahan (YYYY-MM-DD)
  submitterName: string; // Nama Karyawan / Atasan / HR
  submitterRole: 'karyawan' | 'atasan' | 'hrd'; // Karyawan / atasan
  submitterCompany: string; // Nama Perusahaan penyerah
  
  // Kolom Penerima (Kanan)
  csName?: string; // Nama Customer Service BPJS Ketenagakerjaan
  branchOffice?: string; // Kantor Cabang BPJS Ketenagakerjaan
  receiptDate?: string; // Tanggal Diterima CS
  
  // Checklist Dokumen Lampiran Tambahan
  attachmentsChecklist?: {
    formAmalgamasi: boolean; // Formulir Asli
    oldKpjCopy: boolean; // Fotokopi Kartu Peserta Lama
    newKpjOriginal: boolean; // Kartu Peserta Baru Asli
    workReferenceLetters: boolean; // Surat Pengalaman Kerja (Parklaring) Asli
    ktpCopy: boolean; // Fotokopi KTP
    kkCopy: boolean; // Fotokopi Kartu Keluarga
    bankBookCopy: boolean; // Fotokopi Buku Tabungan (jika ada)
  };
  
  status: BpjsAmalgamationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppTab = 'editor' | 'disnaker' | 'list' | 'late-permit' | 'late-list' | 'bpjs-amalgamasi' | 'bpjs-list';
