import React, { useState, useEffect, useRef } from 'react';
import { FileEdit, Eye } from 'lucide-react';
import { CompanyProfile, LetterData, LetterStatus, LatePermitData, LatePermitStatus, DisnakerReportData, BpjsAmalgamationData, AppTab } from './types';
import { DEFAULT_COMPANY, DEFAULT_COMPANIES, LEGACY_DUMMY_COMPANIES, INITIAL_LETTER, DEFAULT_STATUTORY_CLAUSE, INITIAL_DISNAKER_LETTER } from './data/presets';
import { INITIAL_LATE_PERMITS } from './data/latePresets';
import { INITIAL_BPJS_AMALGAMATION, SAMPLE_BPJS_AMALGAMATIONS } from './data/bpjsPresets';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LetterForm } from './components/LetterForm';
import { LetterPreview } from './components/LetterPreview';
import { LetterList } from './components/LetterList';
import { LatePermitForm } from './components/LatePermitForm';
import { LatePermitPreview } from './components/LatePermitPreview';
import { LatePermitList } from './components/LatePermitList';
import { DisnakerLetterForm } from './components/DisnakerLetterForm';
import { DisnakerLetterPreview } from './components/DisnakerLetterPreview';
import { BpjsAmalgamasiForm } from './components/BpjsAmalgamasiForm';
import { BpjsAmalgamasiPreview } from './components/BpjsAmalgamasiPreview';
import { BpjsAmalgamasiList } from './components/BpjsAmalgamasiList';
import { LegalGuideModal } from './components/LegalGuideModal';
import { EditLogoModal } from './components/EditLogoModal';
import { CompanyManagerModal } from './components/CompanyManagerModal';
import { PrintModal } from './components/PrintModal';
import { downloadWordDocument, generateLetterPlainText, downloadDisnakerWordDocument, generateDisnakerPlainText, generateLetterDocumentHtml, generateDisnakerDocumentHtml } from './utils/exportDoc';
import { downloadLatePermitWordDocument, generateLatePermitPlainText, generateLatePermitDocumentHtml } from './utils/exportLateDoc';
import { downloadBpjsAmalgamationDoc, generateBpjsAmalgamationPlainText, generateBpjsAmalgamationDocumentHtml } from './utils/exportBpjsDoc';
import { addWorkingDays, todayISO, toRomanMonth } from './utils/dateUtils';

/** Buang profil contoh lama yang belum pernah diubah pengguna; profil yang sudah diedit tetap aman. */
function stripLegacyDummyCompanies(list: CompanyProfile[]): CompanyProfile[] {
  const cleaned = list.filter(
    (c) => !LEGACY_DUMMY_COMPANIES.some((d) => d.id === c.id && d.name === c.name)
  );
  return cleaned.length > 0 ? cleaned : DEFAULT_COMPANIES;
}

const STORAGE_KEY_LETTERS = 'phk_letters_history_v1';
const STORAGE_KEY_COMPANY = 'phk_company_profile_v1';
const STORAGE_KEY_COMPANIES = 'hr_companies_list_v2';
const STORAGE_KEY_ACTIVE_COMPANY_ID = 'hr_active_company_id_v2';
const STORAGE_KEY_LATE_PERMITS = 'hr_late_permits_v1';
const STORAGE_KEY_DISNAKER = 'hr_disnaker_letter_v1';
const STORAGE_KEY_BPJS_AMALGAMASI = 'hr_bpjs_amalgamasi_v1';

/**
 * Urutan nomor surat berikutnya untuk tahun berjalan: ambil angka terbesar di awal nomor
 * (mis. "042/HRD-PHK/VIII/2026") lalu tambah 1. Lebih aman daripada jumlah surat + 1
 * yang menghasilkan nomor ganda setelah ada surat yang dihapus.
 */
function nextSequence(numbers: Array<string | undefined>, year: number): number {
  let max = 0;
  for (const n of numbers) {
    if (!n) continue;
    const m = /^(\d+)\//.exec(n.trim());
    if (m && n.includes(String(year))) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('editor');
  const [viewMode, setViewMode] = useState<'split' | 'form' | 'preview'>('split');
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [isLegalGuideOpen, setIsLegalGuideOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Load Saved Companies List or initialize from DEFAULT_COMPANIES / legacy storage
  const [companies, setCompanies] = useState<CompanyProfile[]>(() => {
    try {
      const savedList = localStorage.getItem(STORAGE_KEY_COMPANIES);
      if (savedList) {
        const parsed: CompanyProfile[] = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return stripLegacyDummyCompanies(parsed);
        }
      }

      // Backwards compatibility with old single company storage
      const oldSaved = localStorage.getItem(STORAGE_KEY_COMPANY);
      if (oldSaved) {
        const parsedOld: CompanyProfile = JSON.parse(oldSaved);
        const migrated: CompanyProfile = {
          ...DEFAULT_COMPANY,
          ...parsedOld,
          id: parsedOld.id || DEFAULT_COMPANY.id,
        };
        return stripLegacyDummyCompanies([migrated]);
      }

      return DEFAULT_COMPANIES;
    } catch {
      return DEFAULT_COMPANIES;
    }
  });

  // Active Company ID
  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_COMPANY_ID);
      if (savedId && companies.some((c) => c.id === savedId)) {
        return savedId;
      }
    } catch {}
    return companies[0]?.id || DEFAULT_COMPANY.id;
  });

  // Active Company Profile derived
  const company = companies.find((c) => c.id === activeCompanyId) || companies[0] || DEFAULT_COMPANY;

  // Load Saved Letters or Initial Sample
  const [letters, setLetters] = useState<LetterData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LETTERS);
      return saved ? JSON.parse(saved) : [INITIAL_LETTER];
    } catch {
      return [INITIAL_LETTER];
    }
  });

  // Current Active Letter
  const [activeLetter, setActiveLetter] = useState<LetterData>(() => {
    return letters[0] || INITIAL_LETTER;
  });

  // Load Saved Late Permits or Initial Sample
  const [latePermits, setLatePermits] = useState<LatePermitData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LATE_PERMITS);
      return saved ? JSON.parse(saved) : INITIAL_LATE_PERMITS;
    } catch {
      return INITIAL_LATE_PERMITS;
    }
  });

  // Current Active Late Permit
  const [activeLatePermit, setActiveLatePermit] = useState<LatePermitData>(() => {
    return latePermits[0] || INITIAL_LATE_PERMITS[0];
  });

  // Disnaker Report State
  const [disnakerReport, setDisnakerReport] = useState<DisnakerReportData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISNAKER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_DISNAKER_LETTER;
  });

  // Load Saved BPJS Amalgamations or Initial Sample
  const [bpjsForms, setBpjsForms] = useState<BpjsAmalgamationData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BPJS_AMALGAMASI);
      return saved ? JSON.parse(saved) : SAMPLE_BPJS_AMALGAMATIONS;
    } catch {
      return SAMPLE_BPJS_AMALGAMATIONS;
    }
  });

  // Current Active BPJS Amalgamation Form
  const [activeBpjsForm, setActiveBpjsForm] = useState<BpjsAmalgamationData>(() => {
    return bpjsForms[0] || INITIAL_BPJS_AMALGAMATION;
  });

  // Persist BPJS Forms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BPJS_AMALGAMASI, JSON.stringify(bpjsForms));
    } catch (err) {
      console.error('Failed to save BPJS forms to localStorage', err);
    }
  }, [bpjsForms]);

  // Persist Letters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LETTERS, JSON.stringify(letters));
    } catch (err) {
      console.error('Failed to save letters to localStorage', err);
    }
  }, [letters]);

  // Persist Late Permits to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LATE_PERMITS, JSON.stringify(latePermits));
    } catch (err) {
      console.error('Failed to save late permits to localStorage', err);
    }
  }, [latePermits]);

  // Persist Companies to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
      localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(company));
    } catch (err) {
      console.error('Failed to save companies to localStorage', err);
    }
  }, [companies, company]);

  // Persist Active Company ID
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_COMPANY_ID, activeCompanyId);
    } catch (err) {
      console.error('Failed to save activeCompanyId to localStorage', err);
    }
  }, [activeCompanyId]);

  // Persist Disnaker Report to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DISNAKER, JSON.stringify(disnakerReport));
    } catch (err) {
      console.error('Failed to save disnaker report to localStorage', err);
    }
  }, [disnakerReport]);

  // Show temporary toast notification
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const showToast = (message: string) => {
    setNotification(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Switch Active Company
  const handleSelectCompany = (id: string) => {
    const target = companies.find((c) => c.id === id);
    if (target) {
      setActiveCompanyId(id);
      showToast(`Kop surat dialihkan ke ${target.name}`);
    }
  };

  // Add New Company
  const handleAddCompany = (newComp: CompanyProfile) => {
    setCompanies((prev) => [...prev, newComp]);
    setActiveCompanyId(newComp.id);
  };

  // Update company profile (supports both active company update and specific id update)
  const handleUpdateCompany = (arg1: string | Partial<CompanyProfile>, arg2?: Partial<CompanyProfile>) => {
    if (typeof arg1 === 'string') {
      const targetId = arg1;
      const updated = arg2 || {};
      setCompanies((prev) =>
        prev.map((c) => (c.id === targetId ? { ...c, ...updated } : c))
      );
    } else {
      const updated = arg1;
      setCompanies((prev) =>
        prev.map((c) => (c.id === activeCompanyId ? { ...c, ...updated } : c))
      );
    }
  };

  // Delete Company
  const handleDeleteCompany = (id: string) => {
    if (companies.length <= 1) {
      showToast('Minimal harus ada 1 profil perusahaan / PT tersimpan.');
      return;
    }
    const toDelete = companies.find((c) => c.id === id);
    
    const nextCompanies = companies.filter((c) => c.id !== id);
    setCompanies(nextCompanies);
    
    if (activeCompanyId === id) {
      setActiveCompanyId(nextCompanies[0]?.id || DEFAULT_COMPANY.id);
    }
    
    if (toDelete) {
      showToast(`Profil "${toDelete.name}" telah dihapus.`);
    }
  };

  // Duplicate Company
  const handleDuplicateCompany = (id: string) => {
    const source = companies.find((c) => c.id === id);
    if (!source) return;
    const duplicate: CompanyProfile = {
      ...source,
      id: `pt-${Date.now()}`,
      name: `${source.name} (Cabang/Unit)`,
    };
    setCompanies((prev) => [...prev, duplicate]);
    setActiveCompanyId(duplicate.id);
    showToast(`Berhasil menduplikasi "${source.name}".`);
  };

  // Handler: Update current active letter
  const handleUpdateLetter = (updated: Partial<LetterData>) => {
    const next: LetterData = {
      ...activeLetter,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    setActiveLetter(next);
    // Sinkronkan juga ke daftar surat
    setLetters((list) => list.map((item) => (item.id === next.id ? next : item)));
  };

  // Handler: Buat surat baru
  const handleNewLetter = () => {
    const today = todayISO();
    const defaultEffective = addWorkingDays(today, 14);
    const nowDate = new Date();
    const formattedCount = String(nextSequence(letters.map((l) => l.letterNumber), nowDate.getFullYear())).padStart(3, '0');

    const newDoc: LetterData = {
      id: `phk-${Date.now()}`,
      letterNumber: `${formattedCount}/HRD-PHK/${toRomanMonth(nowDate.getMonth() + 1)}/${nowDate.getFullYear()}`,
      attachments: '-',
      subject: 'Pemberitahuan Pemutusan Hubungan Kerja',
      city: company.city || 'Jakarta',
      letterDate: today,
      recipientName: '',
      recipientAddress: 'Tempat',
      signatoryName: activeLetter.signatoryName || 'Dra. Hendrawati Kusuma, M.M.',
      signatoryPosition: activeLetter.signatoryPosition || 'HR & General Affairs Manager',
      signatoryCompany: company.name,
      employeeName: '',
      employeeId: '',
      employeePosition: '',
      employeeDepartment: '',
      pkwttInfo: '',
      reasonPresetId: 'efisiensi-mencegah-rugi',
      reasonText:
        'Memperhatikan kondisi perekonomian dan dinamika bisnis industri saat ini yang berdampak langsung terhadap kinerja operasional perusahaan, manajemen telah melakukan kajian strategis secara komprehensif. Demi menjaga kelangsungan usaha (business continuity) dan mencegah terjadinya kerugian yang lebih besar di masa mendatang, Perusahaan terpaksa mengambil kebijakan langkah efisiensi organisasi dan rasionalisasi tenaga kerja.',
      effectiveDate: defaultEffective,
      statutoryClause: DEFAULT_STATUTORY_CLAUSE,
      includeCarbonCopy: true,
      carbonCopyTitle: 'Tembusan Yth:',
      carbonCopy: ['Direksi Perusahaan', 'Finance & Payroll', 'Arsip HRD'],
      includeReceiptForm: true,
      includeStampPlaceholder: true,
      compensation: {
        includeCompensation: false,
        baseSalary: 0,
        yearsOfService: 1,
        monthsOfService: 0,
        severancePay: 0,
        serviceRewardPay: 0,
        rightsCompensationPay: 0,
        notes: '',
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLetters((prev) => [newDoc, ...prev]);
    setActiveLetter(newDoc);
    setCurrentTab('editor');
    showToast('Surat baru berhasil dibuat.');
  };

  // Handler: Simpan ke riwayat
  const handleSaveToHistory = () => {
    if (currentTab === 'bpjs-amalgamasi' || currentTab === 'bpjs-list') {
      handleSaveBpjsForm();
      return;
    }
    if (currentTab === 'late-permit' || currentTab === 'late-list') {
      handleSaveLatePermit();
      return;
    }
    if (currentTab === 'disnaker') {
      showToast('Laporan Disnaker telah otomatis tersimpan.');
      return;
    }
    setLetters((prev) => {
      const exists = prev.some((l) => l.id === activeLetter.id);
      if (exists) {
        return prev.map((l) => (l.id === activeLetter.id ? activeLetter : l));
      } else {
        return [activeLetter, ...prev];
      }
    });
    showToast('Surat berhasil disimpan ke arsip dashboard.');
  };

  // Handler: Pilih surat dari list
  const handleSelectLetter = (letter: LetterData) => {
    setActiveLetter(letter);
    setCurrentTab('editor');
  };

  // Handler: Duplikasi surat
  const handleDuplicateLetter = (letter: LetterData) => {
    const duplicated: LetterData = {
      ...letter,
      id: `phk-${Date.now()}`,
      letterNumber: `${letter.letterNumber || '000'}-SALINAN`,
      employeeName: `${letter.employeeName} (Salinan)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLetters((prev) => [duplicated, ...prev]);
    setActiveLetter(duplicated);
    setCurrentTab('editor');
    showToast('Surat berhasil diduplikasi sebagai draft baru.');
  };

  // Handler: Hapus surat
  const handleDeleteLetter = (id: string) => {
    if (letters.length <= 1) {
      showToast('Minimal harus ada satu surat di sistem.');
      return;
    }
    const updated = letters.filter((l) => l.id !== id);
    setLetters(updated);
    if (activeLetter.id === id) {
      setActiveLetter(updated[0]);
    }
    showToast('Surat berhasil dihapus dari arsip.');
  };

  // Handler: Update status surat
  const handleUpdateStatus = (id: string, status: LetterStatus) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l))
    );
    if (activeLetter.id === id) {
      setActiveLetter((prev) => ({ ...prev, status }));
    }
    showToast(`Status surat diperbarui menjadi "${status}".`);
  };

  // --- HANDLERS IZIN TERLAMBAT ---
  const handleUpdateLatePermit = (updated: Partial<LatePermitData>) => {
    const next: LatePermitData = {
      ...activeLatePermit,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    setActiveLatePermit(next);
    setLatePermits((list) => list.map((item) => (item.id === next.id ? next : item)));
  };

  const handleNewLatePermit = () => {
    const today = todayISO();
    const formattedCount = String(nextSequence(latePermits.map((p) => p.permitNumber), new Date().getFullYear())).padStart(3, '0');
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const year = new Date().getFullYear();

    const newPermit: LatePermitData = {
      id: `late-${Date.now()}`,
      permitNumber: `${formattedCount}/HRD-IZIN/${month}/${year}`,
      submissionDate: today,
      employeeName: '',
      employeeId: '',
      employeePosition: '',
      employeeDepartment: '',
      supervisorName: 'Bambang Sudarsono, S.T.',
      supervisorPosition: 'Supervisor Operasional',
      incidentDate: today,
      shiftSchedule: '08:00 - 17:00 (Normal)',
      standardTime: '08:00',
      actualArrivalTime: '08:30',
      lateDurationMinutes: 30,
      tardinessCountThisMonth: 1,
      reasonCategory: 'macet',
      reasonDescription: 'Terjadi kemacetan lalu lintas yang luar biasa padat di rute perjalanan menuju kantor.',
      hasAttachment: false,
      attachmentNote: '',
      compensationMethod: 'ganti_hari_ini',
      compensationDetails: 'Akan mengganti waktu kerja selama 30 menit setelah jam pulang kerja (pukul 17:00 - 17:30 WIB).',
      status: 'menunggu',
      supervisorApprovalDate: '',
      supervisorNotes: '',
      hrApprovalDate: '',
      hrNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLatePermits((prev) => [newPermit, ...prev]);
    setActiveLatePermit(newPermit);
    setCurrentTab('late-permit');
    showToast('Formulir izin terlambat baru berhasil dibuat.');
  };

  const handleSaveLatePermit = () => {
    setLatePermits((prev) => {
      const exists = prev.some((p) => p.id === activeLatePermit.id);
      if (exists) {
        return prev.map((p) => (p.id === activeLatePermit.id ? activeLatePermit : p));
      } else {
        return [activeLatePermit, ...prev];
      }
    });
    showToast('Data izin terlambat berhasil disimpan.');
  };

  const handleSelectLatePermit = (permit: LatePermitData) => {
    setActiveLatePermit(permit);
    setCurrentTab('late-permit');
  };

  const handleDeleteLatePermit = (id: string) => {
    if (latePermits.length <= 1) {
      showToast('Minimal harus ada satu data formulir izin di sistem.');
      return;
    }
    const updated = latePermits.filter((p) => p.id !== id);
    setLatePermits(updated);
    if (activeLatePermit.id === id) {
      setActiveLatePermit(updated[0]);
    }
    showToast('Data izin berhasil dihapus.');
  };

  const handleDuplicateLatePermit = (permit: LatePermitData) => {
    const duplicated: LatePermitData = {
      ...permit,
      id: `late-${Date.now()}`,
      permitNumber: `${permit.permitNumber || '000'}-SALINAN`,
      employeeName: `${permit.employeeName} (Salinan)`,
      status: 'menunggu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLatePermits((prev) => [duplicated, ...prev]);
    setActiveLatePermit(duplicated);
    setCurrentTab('late-permit');
    showToast('Formulir izin berhasil diduplikasi.');
  };

  const handleUpdateLatePermitStatus = (id: string, status: LatePermitStatus) => {
    setLatePermits((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p))
    );
    if (activeLatePermit.id === id) {
      setActiveLatePermit((prev) => ({ ...prev, status }));
    }
    showToast(`Status izin diperbarui menjadi "${status}".`);
  };

  // BPJS Amalgamasi Handlers
  const handleUpdateBpjsForm = (updated: BpjsAmalgamationData) => {
    setActiveBpjsForm(updated);
    setBpjsForms((prev) =>
      prev.map((f) => (f.id === updated.id ? updated : f))
    );
  };

  const handleSaveBpjsForm = () => {
    setBpjsForms((prev) => {
      const exists = prev.some((f) => f.id === activeBpjsForm.id);
      if (exists) {
        return prev.map((f) => (f.id === activeBpjsForm.id ? activeBpjsForm : f));
      } else {
        return [activeBpjsForm, ...prev];
      }
    });
    showToast('Formulir Amalgamasi BPJS berhasil disimpan ke arsip.');
  };

  const handleNewBpjsForm = () => {
    const newForm: BpjsAmalgamationData = {
      ...INITIAL_BPJS_AMALGAMATION,
      id: `bpjs-amal-${Date.now()}`,
      companyName: company.name,
      submitterCompany: company.name,
      employeeName: '',
      birthPlace: '',
      birthDate: '1995-01-01',
      oldKpjNumber: '',
      newKpjNumber: '',
      workHistories: [
        'PT PERUSAHAAN SEBELUMNYA (Masa Kerja: .... s/d ....) - KPJ: ....',
        `${company.name || 'PERUSAHAAN SAAT INI'} (Perusahaan Aktif Saat Ini)`,
      ],
      submissionDate: todayISO(),
      issueDate: todayISO(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBpjsForms((prev) => [newForm, ...prev]);
    setActiveBpjsForm(newForm);
    setCurrentTab('bpjs-amalgamasi');
    setMobileTab('form');
    showToast('Formulir Amalgamasi BPJS baru dibuat.');
  };

  const handleSelectBpjsForm = (form: BpjsAmalgamationData) => {
    setActiveBpjsForm(form);
    setCurrentTab('bpjs-amalgamasi');
  };

  const handleDeleteBpjsForm = (id: string) => {
    if (bpjsForms.length <= 1) {
      showToast('Minimal harus ada satu data formulir di sistem.');
      return;
    }
    const updated = bpjsForms.filter((f) => f.id !== id);
    setBpjsForms(updated);
    if (activeBpjsForm.id === id) {
      setActiveBpjsForm(updated[0]);
    }
    showToast('Formulir Amalgamasi berhasil dihapus.');
  };

  const handleDuplicateBpjsForm = (form: BpjsAmalgamationData) => {
    const duplicated: BpjsAmalgamationData = {
      ...form,
      id: `bpjs-amal-${Date.now()}`,
      employeeName: `${form.employeeName} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBpjsForms((prev) => [duplicated, ...prev]);
    setActiveBpjsForm(duplicated);
    setCurrentTab('bpjs-amalgamasi');
    showToast('Formulir Amalgamasi berhasil diduplikasi.');
  };

  // Disnaker Handlers
  const handleUpdateDisnaker = (updated: Partial<DisnakerReportData>) => {
    setDisnakerReport((prev) => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleImportLetterToDisnaker = () => {
    setDisnakerReport((prev) => ({
      ...prev,
      employeeName: activeLetter.employeeName,
      employeeId: activeLetter.employeeId || prev.employeeId,
      employeePosition: `${activeLetter.employeePosition}${activeLetter.employeeDepartment ? ' / ' + activeLetter.employeeDepartment : ''}`,
      effectiveDate: activeLetter.effectiveDate,
      phkReason: activeLetter.reasonText ? activeLetter.reasonText.slice(0, 160) : prev.phkReason,
      city: company.city || activeLetter.city || prev.city,
      signatoryName: activeLetter.signatoryName || prev.signatoryName,
      signatoryPosition: activeLetter.signatoryPosition || prev.signatoryPosition,
    }));
    showToast('Data pekerja dari Surat PHK berhasil disinkronkan ke Laporan Disnaker.');
  };

  const handleResetDisnaker = () => {
    setDisnakerReport({
      ...INITIAL_DISNAKER_LETTER,
      id: `disnaker-${Date.now()}`,
      city: company.city || INITIAL_DISNAKER_LETTER.city,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    showToast('Formulir Laporan Disnaker direset ke format baku.');
  };

  // Target dokumen untuk dialog cetak & ekspor PDF
  const getPrintTargetInfo = () => {
    if (currentTab === 'bpjs-amalgamasi' || currentTab === 'bpjs-list') {
      const cleanEmpName = (activeBpjsForm.employeeName || 'Karyawan').replace(/[^a-zA-Z0-9]/g, '_');
      return {
        type: 'bpjs-amalgamasi' as const,
        title: `Formulir Amalgamasi BPJS - ${activeBpjsForm.employeeName || 'Karyawan'}`,
        elementId: 'printable-bpjs-amalgamasi',
        filename: `Form-Amalgamasi-BPJS-${cleanEmpName}`,
      };
    } else if (currentTab === 'disnaker') {
      const cleanEmpName = (disnakerReport.employeeName || 'Karyawan').replace(/[^a-zA-Z0-9]/g, '_');
      return {
        type: 'disnaker' as const,
        title: `Laporan PHK Disnaker - ${disnakerReport.employeeName || 'Karyawan'}`,
        elementId: 'disnaker-print-area',
        filename: `Laporan-PHK-Disnaker-${cleanEmpName}`,
      };
    } else if (currentTab === 'late-permit' || currentTab === 'late-list') {
      const cleanEmpName = (activeLatePermit.employeeName || 'Karyawan').replace(/[^a-zA-Z0-9]/g, '_');
      return {
        type: 'late-permit' as const,
        title: `Formulir Izin Terlambat - ${activeLatePermit.employeeName || 'Karyawan'}`,
        elementId: 'late-permit-print-area',
        filename: `Formulir-Izin-Terlambat-${cleanEmpName}`,
      };
    } else {
      const cleanEmpName = (activeLetter.employeeName || 'Karyawan').replace(/[^a-zA-Z0-9]/g, '_');
      return {
        type: 'phk' as const,
        title: `Surat Pemberitahuan PHK - ${activeLetter.employeeName || 'Karyawan'}`,
        elementId: 'printable-letter',
        filename: `Surat-PHK-${cleanEmpName}`,
      };
    }
  };

  // Handler: Cetak / Simpan PDF
  const handlePrint = () => {
    if (mobileTab === 'form') {
      setMobileTab('preview');
    }
    setIsPrintModalOpen(true);
  };

  // Handler: Unduh Dokumen Word (.doc)
  const handleDownloadDoc = () => {
    if (currentTab === 'bpjs-amalgamasi' || currentTab === 'bpjs-list') {
      downloadBpjsAmalgamationDoc(activeBpjsForm);
      showToast('Formulir Amalgamasi BPJS (.doc) berhasil diunduh.');
    } else if (currentTab === 'disnaker') {
      downloadDisnakerWordDocument(disnakerReport, company);
      showToast('Surat Laporan Disnaker (.doc) berhasil diunduh.');
    } else if (currentTab === 'late-permit' || currentTab === 'late-list') {
      downloadLatePermitWordDocument(activeLatePermit, company);
      showToast('Formulir Izin Terlambat (.doc) berhasil diunduh.');
    } else {
      downloadWordDocument(activeLetter, company);
      showToast('Dokumen Surat PHK Word (.doc) berhasil diunduh.');
    }
  };

  // Handler: Salin Teks
  const handleCopyText = async () => {
    try {
      if (currentTab === 'bpjs-amalgamasi' || currentTab === 'bpjs-list') {
        const text = generateBpjsAmalgamationPlainText(activeBpjsForm);
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast('Teks formulir amalgamasi berhasil disalin.');
      } else if (currentTab === 'disnaker') {
        const text = generateDisnakerPlainText(disnakerReport, company);
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast('Teks Laporan Disnaker berhasil disalin ke clipboard.');
      } else if (currentTab === 'late-permit' || currentTab === 'late-list') {
        const text = generateLatePermitPlainText(activeLatePermit, company);
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast('Teks formulir izin berhasil disalin.');
      } else {
        const text = generateLetterPlainText(activeLetter, company);
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast('Teks surat berhasil disalin ke clipboard.');
      }
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Gagal menyalin teks.');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar Navigasi Kiri */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onNewLetter={handleNewLetter}
        onNewLatePermit={handleNewLatePermit}
        onNewBpjsForm={handleNewBpjsForm}
        onOpenLegalGuide={() => setIsLegalGuideOpen(true)}
        onOpenLogoModal={() => setIsLogoModalOpen(true)}
        onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
        activeCompany={company}
        totalCompaniesCount={companies.length}
        totalLettersCount={letters.length}
        totalLatePermitsCount={latePermits.length}
        totalBpjsCount={bpjsForms.length}
        activeLetter={activeLetter}
        activeLatePermit={activeLatePermit}
        activeBpjsForm={activeBpjsForm}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Header Atas */}
        <Header
          currentTab={currentTab}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onPrint={handlePrint}
          onDownloadDoc={handleDownloadDoc}
          onCopyText={handleCopyText}
          onSaveToHistory={handleSaveToHistory}
          copied={copied}
          onToggleMobileMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          companies={companies}
          activeCompany={company}
          onSelectCompany={handleSelectCompany}
          onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
        />

        {/* Notifikasi Toast */}
        {notification && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs sm:text-sm font-medium transition-all no-print flex items-center space-x-2 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{notification}</span>
          </div>
        )}

        <main className={`flex-1 ${currentTab === 'editor' || currentTab === 'disnaker' || currentTab === 'late-permit' ? 'min-h-0 overflow-hidden p-2.5 sm:p-4 lg:p-5 flex flex-col' : 'overflow-y-auto p-4 sm:p-6'}`}>
          {/* TAB 1: EDITOR SURAT PHK */}
          {currentTab === 'editor' && (
            <div className="flex-1 min-h-0 flex flex-col w-full h-full overflow-hidden">
              {/* Mobile View Toggle Bar (Layar < lg) */}
              <div className="lg:hidden flex items-center justify-center mb-2 shrink-0 no-print">
                <div className="inline-flex p-1 bg-slate-200/90 rounded-xl text-xs font-semibold w-full max-w-xs shadow-2xs border border-slate-300/60">
                  <button
                    type="button"
                    onClick={() => setMobileTab('form')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      mobileTab === 'form'
                        ? 'bg-white text-indigo-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Formulir Data</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      mobileTab === 'preview'
                        ? 'bg-white text-indigo-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratinjau A4</span>
                  </button>
                </div>
              </div>

              {/* Mode Berdampingan (Split) */}
              {viewMode === 'split' && (
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 h-full">
                  {/* Sisi Kiri: Form Isian Surat */}
                  <div className={`lg:col-span-5 h-full min-h-0 overflow-hidden no-print ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                    <LetterForm
                      letter={activeLetter}
                      company={company}
                      onUpdateLetter={handleUpdateLetter}
                      onUpdateCompany={handleUpdateCompany}
                      onSaveToHistory={handleSaveToHistory}
                      onOpenLogoModal={() => setIsLogoModalOpen(true)}
                      companies={companies}
                      onSelectCompany={handleSelectCompany}
                      onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
                    />
                  </div>

                  {/* Sisi Kanan: Pratinjau Dokumen Format A4 */}
                  <div className={`lg:col-span-7 h-full min-h-0 overflow-hidden print-preview-container ${mobileTab === 'form' ? 'hidden lg:block' : 'block'}`}>
                    <LetterPreview
                      letter={activeLetter}
                      company={company}
                      onPrint={handlePrint}
                      onDownloadDoc={handleDownloadDoc}
                      onCopyText={handleCopyText}
                      copied={copied}
                      onOpenLogoModal={() => setIsLogoModalOpen(true)}
                    />
                  </div>
                </div>
              )}

              {/* Mode Fokus Formulir Saja */}
              {viewMode === 'form' && (
                <div className="flex-1 min-h-0 max-w-4xl w-full mx-auto h-full overflow-hidden no-print">
                  <LetterForm
                    letter={activeLetter}
                    company={company}
                    onUpdateLetter={handleUpdateLetter}
                    onUpdateCompany={handleUpdateCompany}
                    onSaveToHistory={handleSaveToHistory}
                    onOpenLogoModal={() => setIsLogoModalOpen(true)}
                    companies={companies}
                    onSelectCompany={handleSelectCompany}
                    onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
                  />
                </div>
              )}

              {/* Mode Fokus Pratinjau A4 Saja */}
              {viewMode === 'preview' && (
                <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto h-full overflow-hidden">
                  <LetterPreview
                    letter={activeLetter}
                    company={company}
                    onPrint={handlePrint}
                    onDownloadDoc={handleDownloadDoc}
                    onCopyText={handleCopyText}
                    copied={copied}
                    onOpenLogoModal={() => setIsLogoModalOpen(true)}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 1.5: LAPORAN PHK DISNAKER (SUKU DINAS TENAGA KERJA) */}
          {currentTab === 'disnaker' && (
            <div className="flex-1 min-h-0 flex flex-col w-full h-full overflow-hidden">
              {/* Mobile View Toggle Bar (Layar < lg) */}
              <div className="lg:hidden flex items-center justify-center mb-2 shrink-0 no-print">
                <div className="inline-flex p-1 bg-slate-200/90 rounded-xl text-xs font-semibold w-full max-w-xs shadow-2xs border border-slate-300/60">
                  <button
                    type="button"
                    onClick={() => setMobileTab('form')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      mobileTab === 'form'
                        ? 'bg-white text-emerald-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Formulir Laporan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      mobileTab === 'preview'
                        ? 'bg-white text-emerald-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratinjau Surat A4</span>
                  </button>
                </div>
              </div>

              {/* Mode Berdampingan (Split) */}
              {viewMode === 'split' && (
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 h-full">
                  {/* Sisi Kiri: Form Isian Disnaker */}
                  <div className={`lg:col-span-5 h-full min-h-0 overflow-hidden no-print ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                    <DisnakerLetterForm
                      report={disnakerReport}
                      company={company}
                      activeCompany={company}
                      companies={companies}
                      onSelectCompany={handleSelectCompany}
                      onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
                      activeLetter={activeLetter}
                      onChange={handleUpdateDisnaker}
                      onUpdateReport={handleUpdateDisnaker}
                      onImportFromLetter={handleImportLetterToDisnaker}
                      onResetReport={handleResetDisnaker}
                      onOpenLogoModal={() => setIsLogoModalOpen(true)}
                    />
                  </div>

                  {/* Sisi Kanan: Pratinjau Surat Disnaker A4 */}
                  <div className={`lg:col-span-7 h-full min-h-0 overflow-hidden print-preview-container ${mobileTab === 'form' ? 'hidden lg:block' : 'block'}`}>
                    <DisnakerLetterPreview
                      report={disnakerReport}
                      company={company}
                      onPrint={handlePrint}
                      onDownloadDoc={handleDownloadDoc}
                      onCopyText={handleCopyText}
                      copied={copied}
                      onOpenLogoModal={() => setIsLogoModalOpen(true)}
                    />
                  </div>
                </div>
              )}

              {/* Mode Fokus Formulir Saja */}
              {viewMode === 'form' && (
                <div className="flex-1 min-h-0 max-w-4xl w-full mx-auto h-full overflow-hidden no-print">
                  <DisnakerLetterForm
                    report={disnakerReport}
                    company={company}
                    activeCompany={company}
                    companies={companies}
                    onSelectCompany={handleSelectCompany}
                    onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
                    activeLetter={activeLetter}
                    onChange={handleUpdateDisnaker}
                    onUpdateReport={handleUpdateDisnaker}
                    onImportFromLetter={handleImportLetterToDisnaker}
                    onResetReport={handleResetDisnaker}
                    onOpenLogoModal={() => setIsLogoModalOpen(true)}
                  />
                </div>
              )}

              {/* Mode Fokus Pratinjau A4 Saja */}
              {viewMode === 'preview' && (
                <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto h-full overflow-hidden">
                  <DisnakerLetterPreview
                    report={disnakerReport}
                    company={company}
                    onPrint={handlePrint}
                    onDownloadDoc={handleDownloadDoc}
                    onCopyText={handleCopyText}
                    copied={copied}
                    onOpenLogoModal={() => setIsLogoModalOpen(true)}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ARSIP SURAT PHK */}
          {currentTab === 'list' && (
            <LetterList
              letters={letters}
              onSelectLetter={handleSelectLetter}
              onNewLetter={handleNewLetter}
              onDeleteLetter={handleDeleteLetter}
              onDuplicateLetter={handleDuplicateLetter}
              onUpdateStatus={handleUpdateStatus}
              onPrintLetter={(letter) => {
                setActiveLetter(letter);
                setCurrentTab('editor');
                setMobileTab('preview');
                setIsPrintModalOpen(true);
              }}
              onDownloadLetterDoc={(letter) => {
                downloadWordDocument(letter, company);
              }}
            />
          )}

          {/* TAB 3: FORMULIR IZIN KETERLAMBATAN */}
          {currentTab === 'late-permit' && (
            <div className="flex-1 min-h-0 flex flex-col w-full h-full overflow-hidden">
              {/* Mobile View Toggle Bar (Layar < lg) */}
              <div className="lg:hidden flex items-center justify-center mb-2 shrink-0 no-print">
                <div className="inline-flex p-1 bg-slate-200/90 rounded-xl text-xs font-semibold w-full max-w-xs shadow-2xs border border-slate-300/60">
                  <button
                    type="button"
                    onClick={() => setMobileTab('form')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      mobileTab === 'form'
                        ? 'bg-white text-indigo-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Formulir Data</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      mobileTab === 'preview'
                        ? 'bg-white text-indigo-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratinjau A4</span>
                  </button>
                </div>
              </div>

              {/* Mode Berdampingan (Split) */}
              {viewMode === 'split' && (
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 h-full">
                  <div className={`lg:col-span-5 h-full min-h-0 overflow-hidden no-print ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                    <LatePermitForm
                      permit={activeLatePermit}
                      company={company}
                      onUpdatePermit={handleUpdateLatePermit}
                      onSaveToHistory={handleSaveLatePermit}
                      onOpenLogoModal={() => setIsLogoModalOpen(true)}
                      onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
                    />
                  </div>
                  <div className={`lg:col-span-7 h-full min-h-0 overflow-hidden print-preview-container ${mobileTab === 'form' ? 'hidden lg:block' : 'block'}`}>
                    <LatePermitPreview
                      permit={activeLatePermit}
                      company={company}
                      onPrint={handlePrint}
                      onDownloadDoc={handleDownloadDoc}
                      onCopyText={handleCopyText}
                      copied={copied}
                      onOpenLogoModal={() => setIsLogoModalOpen(true)}
                    />
                  </div>
                </div>
              )}

              {/* Mode Fokus Formulir Saja */}
              {viewMode === 'form' && (
                <div className="flex-1 min-h-0 max-w-4xl w-full mx-auto h-full overflow-hidden no-print">
                  <LatePermitForm
                    permit={activeLatePermit}
                    company={company}
                    onUpdatePermit={handleUpdateLatePermit}
                    onSaveToHistory={handleSaveLatePermit}
                    onOpenLogoModal={() => setIsLogoModalOpen(true)}
                    onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
                  />
                </div>
              )}

              {/* Mode Fokus Pratinjau A4 Saja */}
              {viewMode === 'preview' && (
                <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto h-full overflow-hidden">
                  <LatePermitPreview
                    permit={activeLatePermit}
                    company={company}
                    onPrint={handlePrint}
                    onDownloadDoc={handleDownloadDoc}
                    onCopyText={handleCopyText}
                    copied={copied}
                    onOpenLogoModal={() => setIsLogoModalOpen(true)}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REKAP DATA KETERLAMBATAN */}
          {currentTab === 'late-list' && (
            <LatePermitList
              permits={latePermits}
              onSelectPermit={handleSelectLatePermit}
              onNewPermit={handleNewLatePermit}
              onDeletePermit={handleDeleteLatePermit}
              onDuplicatePermit={handleDuplicateLatePermit}
              onUpdateStatus={handleUpdateLatePermitStatus}
              onPrintPermit={(permit) => {
                setActiveLatePermit(permit);
                setCurrentTab('late-permit');
                setMobileTab('preview');
                setIsPrintModalOpen(true);
              }}
              onDownloadPermitDoc={(permit) => {
                downloadLatePermitWordDocument(permit, company);
              }}
            />
          )}

          {/* TAB 5: FORMULIR AMALGAMASI BPJS KETENAGAKERJAAN */}
          {currentTab === 'bpjs-amalgamasi' && (
            <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
              {/* Mobile View Toggle */}
              <div className="lg:hidden p-2.5 bg-slate-100/90 border-b border-slate-200 shrink-0 no-print">
                <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setMobileTab('form')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      mobileTab === 'form'
                        ? 'bg-white text-emerald-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Formulir Data</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      mobileTab === 'preview'
                        ? 'bg-white text-emerald-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratinjau Dokumen</span>
                  </button>
                </div>
              </div>

              {/* Mode Berdampingan (Split) */}
              {viewMode === 'split' && (
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 h-full">
                  <div className={`lg:col-span-5 h-full min-h-0 overflow-hidden no-print ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                    <BpjsAmalgamasiForm
                      data={activeBpjsForm}
                      onChange={handleUpdateBpjsForm}
                      activeCompany={company}
                      onSave={handleSaveBpjsForm}
                    />
                  </div>
                  <div className={`lg:col-span-7 h-full min-h-0 overflow-hidden print-preview-container ${mobileTab === 'form' ? 'hidden lg:block' : 'block'}`}>
                    <BpjsAmalgamasiPreview
                      data={activeBpjsForm}
                      onPrint={handlePrint}
                      onCopyText={handleCopyText}
                      copied={copied}
                    />
                  </div>
                </div>
              )}

              {/* Mode Fokus Formulir Saja */}
              {viewMode === 'form' && (
                <div className="flex-1 min-h-0 max-w-4xl w-full mx-auto h-full overflow-hidden no-print">
                  <BpjsAmalgamasiForm
                    data={activeBpjsForm}
                    onChange={handleUpdateBpjsForm}
                    activeCompany={company}
                    onSave={handleSaveBpjsForm}
                  />
                </div>
              )}

              {/* Mode Fokus Pratinjau Dokumen Saja */}
              {viewMode === 'preview' && (
                <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto h-full overflow-hidden">
                  <BpjsAmalgamasiPreview
                    data={activeBpjsForm}
                    onPrint={handlePrint}
                    onCopyText={handleCopyText}
                    copied={copied}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ARSIP FORMULIR AMALGAMASI BPJS */}
          {currentTab === 'bpjs-list' && (
            <BpjsAmalgamasiList
              forms={bpjsForms}
              activeFormId={activeBpjsForm.id}
              onSelectForm={handleSelectBpjsForm}
              onNewForm={handleNewBpjsForm}
              onDeleteForm={handleDeleteBpjsForm}
              onDuplicateForm={handleDuplicateBpjsForm}
              onPrintForm={(form) => {
                setActiveBpjsForm(form);
                setCurrentTab('bpjs-amalgamasi');
                setMobileTab('preview');
                setIsPrintModalOpen(true);
              }}
            />
          )}
        </main>
      </div>

      {/* Modal Panduan Yuridis PP 35/2021 */}
      <LegalGuideModal
        isOpen={isLegalGuideOpen}
        onClose={() => setIsLegalGuideOpen(false)}
      />

      {/* Modal Menu Edit Logo Perusahaan */}
      <EditLogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        company={company}
        onUpdateCompany={handleUpdateCompany}
        onShowToast={showToast}
      />

      {/* Modal Menu Kelola Beberapa PT (Multi-PT) */}
      <CompanyManagerModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        companies={companies}
        activeCompanyId={company.id}
        onSelectCompany={handleSelectCompany}
        onAddCompany={handleAddCompany}
        onUpdateCompany={(id, updated) => handleUpdateCompany(id, updated)}
        onDeleteCompany={handleDeleteCompany}
        onDuplicateCompany={handleDuplicateCompany}
        onShowToast={showToast}
      />

      {/* Modal Dialog Cetak & Unduh PDF Terpadu */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        documentType={getPrintTargetInfo().type}
        documentTitle={getPrintTargetInfo().title}
        targetElementId={getPrintTargetInfo().elementId}
        defaultFilename={getPrintTargetInfo().filename}
        onDownloadDoc={handleDownloadDoc}
        getPrintableHtml={() => {
          const info = getPrintTargetInfo();
          if (info.type === 'bpjs-amalgamasi') {
            return generateBpjsAmalgamationDocumentHtml(activeBpjsForm);
          } else if (info.type === 'disnaker') {
            return generateDisnakerDocumentHtml(disnakerReport, company);
          } else if (info.type === 'late-permit') {
            return generateLatePermitDocumentHtml(activeLatePermit, company);
          } else {
            return generateLetterDocumentHtml(activeLetter, company);
          }
        }}
        onShowToast={showToast}
      />

    </div>
  );
}
