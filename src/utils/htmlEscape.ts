/**
 * Escape karakter khusus HTML agar data isian pengguna tidak merusak layout
 * dokumen cetak/Word dan tidak bisa menyisipkan markup atau skrip.
 */
export function escapeHtml(value: string): string {
  // Memakai entitas NUMERIK (bukan &amp; dsb.) karena template memanggil .toUpperCase()
  // pada sebagian isian; &amp; akan menjadi &AMP; dan rusak di Word, sedangkan &#38; aman.
  return value
    .replace(/&/g, '&#38;')
    .replace(/</g, '&#60;')
    .replace(/>/g, '&#62;')
    .replace(/"/g, '&#34;')
    .replace(/'/g, '&#39;');
}

/**
 * Salin objek/array secara rekursif dengan semua nilai string di-escape.
 * Angka, boolean, null, dan undefined dibiarkan apa adanya.
 */
export function escapeDeep<T>(input: T): T {
  if (typeof input === 'string') return escapeHtml(input) as unknown as T;
  if (Array.isArray(input)) return input.map((item) => escapeDeep(item)) as unknown as T;
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
      out[key] = escapeDeep(val);
    }
    return out as T;
  }
  return input;
}
