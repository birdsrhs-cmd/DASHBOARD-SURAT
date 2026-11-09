/**
 * Parse string tanggal "YYYY-MM-DD" sebagai tanggal LOKAL (bukan UTC).
 * new Date('2026-10-30') dianggap UTC sehingga bisa bergeser sehari di zona waktu tertentu.
 */
export function parseLocalDate(dateString?: string): Date {
  if (!dateString) return new Date(NaN);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString.trim());
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(dateString);
}

/** Format Date lokal menjadi "YYYY-MM-DD" tanpa konversi UTC. */
export function toISODateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Tanggal hari ini (zona waktu perangkat) dalam format "YYYY-MM-DD". */
export function todayISO(): string {
  return toISODateLocal(new Date());
}

export function formatIndonesianDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = parseLocalDate(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format tanggal Indonesia lengkap dengan nama hari, contoh: "Rabu, 30 September 2026"
 */
export function formatIndonesianDateWithDay(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = parseLocalDate(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Konversi angka bulan (1-12) ke angka romawi resmi tata naskah surat dinas (I - XII)
 */
export function toRomanMonth(monthNumber: number): string {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  if (monthNumber >= 1 && monthNumber <= 12) {
    return romans[monthNumber - 1];
  }
  return String(monthNumber);
}

export function formatIndonesianDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = parseLocalDate(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Menghitung tanggal target dengan menambahkan N hari kerja (Senin - Jumat, mengabaikan Sabtu-Minggu).
 * Digunakan untuk:
 * - 14 hari kerja sebelum tanggal efektif (Pasal 37 ayat 2 PP 35/2021)
 * - 5 hari kerja tanggapan pekerja (Pasal 38 ayat 1 PP 35/2021)
 */
export function addWorkingDays(startDateStr: string, workingDays: number): string {
  try {
    const date = parseLocalDate(startDateStr);
    if (isNaN(date.getTime())) return '';
    
    let added = 0;
    while (added < workingDays) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = date.getDay(); // 0 = Minggu, 6 = Sabtu
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        added++;
      }
    }
    return toISODateLocal(date);
  } catch {
    return '';
  }
}

export function getRemainingWorkingDays(deadlineDateStr: string): number {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = parseLocalDate(deadlineDateStr);
    deadline.setHours(0, 0, 0, 0);
    
    if (isNaN(deadline.getTime())) return 0;
    if (deadline < today) return -1; // Sudah lewat
    
    let current = new Date(today);
    let count = 0;
    while (current < deadline) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

export function formatCurrencyIDR(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}
