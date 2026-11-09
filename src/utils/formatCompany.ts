/**
 * Standarisasi Penulisan Nama Badan Usaha Ketenagakerjaan (PUEBI / EYD Edisi V)
 * Sesuai pedoman baku Bahasa Indonesia & Administrasi Hukum Umum (AHU) Kemenkumham:
 * - Singkatan bentuk badan usaha (PT, CV, FA, UD) ditulis dengan huruf kapital TANPA tanda titik.
 * - Nama perseroan ditulis dengan huruf kapital rapi.
 * - Bentuk terbuka ditulis dengan akhiran ", Tbk."
 */

export function cleanAndFormatCompanyName(input: string): string {
  if (!input || !input.trim()) return '';

  let str = input.trim().replace(/\s+/g, ' ');

  // Periksa akhiran Tbk
  const hasTbk = /[,.\s]+tbk\.?$/i.test(str);
  if (hasTbk) {
    str = str.replace(/[,.\s]+tbk\.?$/i, '').trim();
  }

  // Normalisasi singkatan awal (PT., Pt., pt., p.t.)
  if (/^(pt\.?|p\.t\.?)\s+/i.test(str)) {
    str = str.replace(/^(pt\.?|p\.t\.?)\s+/i, 'PT ');
  } else if (/^(cv\.?|c\.v\.?)\s+/i.test(str)) {
    str = str.replace(/^(cv\.?|c\.v\.?)\s+/i, 'CV ');
  } else if (/^(ud\.?|u\.d\.?)\s+/i.test(str)) {
    str = str.replace(/^(ud\.?|u\.d\.?)\s+/i, 'UD ');
  } else if (/^(fa\.?|firma)\s+/i.test(str)) {
    str = str.replace(/^(fa\.?|firma)\s+/i, 'FIRMA ');
  } else if (!/^(PT|CV|UD|FIRMA|PERUM|YAYASAN|KOPERASI)\s+/i.test(str)) {
    // Jika belum ada awalan badan usaha dan tampak seperti nama PT, tambahkan PT jika diminta atau biarkan
  }

  // Standarisasi kapital
  str = str.toUpperCase();

  if (hasTbk) {
    str = `${str}, Tbk.`;
  }

  return str;
}

export function toTitleCaseCompanyName(input: string): string {
  if (!input || !input.trim()) return '';

  let str = input.trim().replace(/\s+/g, ' ');
  const hasTbk = /[,.\s]+tbk\.?$/i.test(str);
  if (hasTbk) {
    str = str.replace(/[,.\s]+tbk\.?$/i, '').trim();
  }

  let prefix = '';
  if (/^(pt\.?|p\.t\.?)\s+/i.test(str)) {
    prefix = 'PT ';
    str = str.replace(/^(pt\.?|p\.t\.?)\s+/i, '');
  } else if (/^(cv\.?)\s+/i.test(str)) {
    prefix = 'CV ';
    str = str.replace(/^(cv\.?)\s+/i, '');
  }

  const words = str
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  let result = `${prefix}${words}`;
  if (hasTbk) {
    result += ', Tbk.';
  }
  return result;
}
