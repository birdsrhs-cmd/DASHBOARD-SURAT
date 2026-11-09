import React from 'react';
import { X, BookOpen, AlertCircle, CheckCircle, Scale, Clock, FileText } from 'lucide-react';

interface LegalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalGuideModal: React.FC<LegalGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">Panduan Yuridis PP No. 35 Tahun 2021</h3>
              <p className="text-xs text-slate-300">
                Tata Cara & Prosedur Pemberitahuan Pemutusan Hubungan Kerja (Pasal 37 jo. Pasal 38)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Panduan */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          {/* Card Ringkasan Ketentuan Wajib */}
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-4">
            <h4 className="font-bold text-red-950 flex items-center space-x-2 text-sm mb-2">
              <AlertCircle className="w-4 h-4 text-red-800" />
              <span>Ketentuan Pokok Pemberitahuan PHK</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-red-900 list-disc list-inside">
              <li>
                <strong>Surat Resmi Wajib:</strong> Pengusaha wajib memberitahukan maksud dan alasan PHK kepada Pekerja melalui surat pemberitahuan resmi.
              </li>
              <li>
                <strong>Tenggat 14 Hari Kerja:</strong> Surat pemberitahuan disampaikan paling lama <strong>14 (empat belas) hari kerja</strong> sebelum PHK efektif berlaku (atau 7 hari kerja bila dalam masa percobaan).
              </li>
              <li>
                <strong>Kompensasi Hak Pekerja:</strong> Surat memuat alasan PHK serta rincian hak kompensasi (Pesangon, Penghargaan Masa Kerja, dan Penggantian Hak).
              </li>
              <li>
                <strong>Tanggapan Tertulis Pekerja:</strong> Pekerja wajib memberikan tanggapan tertulis paling lambat <strong>5 hari kerja</strong> sejak diterimanya surat pemberitahuan.
              </li>
            </ul>
          </div>

          {/* Timeline Prosedur PHK */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>Alur Prosedur Berdasarkan Regulasi</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center mb-2">
                  1
                </div>
                <div className="font-bold text-slate-900 text-xs mb-1">Penyerahan Surat</div>
                <p className="text-2xs text-slate-600">
                  HRD menyerahkan surat pemberitahuan secara patut kepada pekerja beserta tanda terima. Minimal 14 hari kerja sebelum tanggal efektif PHK.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center mb-2">
                  2
                </div>
                <div className="font-bold text-slate-900 text-xs mb-1">Masa Tanggapan</div>
                <p className="text-2xs text-slate-600">
                  Pekerja menanggapi dalam kurun 5 hari kerja:
                  <br />- <strong>Menyetujui:</strong> Lapor ke Disnaker.
                  <br />- <strong>Menolak:</strong> Masuk perundingan bipartit.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-2">
                  3
                </div>
                <div className="font-bold text-slate-900 text-xs mb-1">Penyelesaian Hak</div>
                <p className="text-2xs text-slate-600">
                  Perusahaan membayarkan seluruh hak kompensasi pekerja (UP, UPMK, UPH) dan menyelesaikan administrasi surat pengalaman kerja (paklaring).
                </p>
              </div>
            </div>
          </div>

          {/* Rincian Pasal 37 & Pasal 38 */}
          <div className="space-y-3 pt-2">
            <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
              <div className="font-bold text-slate-900 mb-1 text-xs sm:text-sm">
                Bunyi Pasal 37 PP No. 35 Tahun 2021:
              </div>
              <p className="text-2xs sm:text-xs text-slate-600 italic">
                "(1) Pemberitahuan Pemutusan Hubungan Kerja dibuat dalam bentuk surat pemberitahuan dan disampaikan secara sah dan patut oleh Pengusaha kepada Pekerja/Buruh dan/atau Serikat Pekerja/Serikat Buruh paling lama 14 (empat belas) hari kerja sebelum Pemutusan Hubungan Kerja. (2) Dalam hal Pemutusan Hubungan Kerja dilakukan dalam masa percobaan kerja, surat pemberitahuan disampaikan paling lama 7 (tujuh) hari kerja sebelum Pemutusan Hubungan Kerja."
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
              <div className="font-bold text-slate-900 mb-1 text-xs sm:text-sm">
                Bunyi Pasal 38 PP No. 35 Tahun 2021:
              </div>
              <p className="text-2xs sm:text-xs text-slate-600 italic">
                "(1) Pekerja/Buruh yang telah menerima surat pemberitahuan Pemutusan Hubungan Kerja dan tidak menolak Pemutusan Hubungan Kerja, Pengusaha harus melaporkan Pemutusan Hubungan Kerja kepada Kementerian/instansi ketenagakerjaan. (2) Dalam hal Pekerja/Buruh menolak Pemutusan Hubungan Kerja, Pekerja/Buruh harus membuat surat penolakan disertai alasan paling lambat sejak diterimanya surat pemberitahuan."
              </p>
            </div>
          </div>

          {/* Komponen Hak Kompensasi */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-2">
              Formula Kompensasi Hak Pekerja (Pasal 40 PP 35/2021):
            </h4>
            <div className="space-y-1.5 text-2xs sm:text-xs text-slate-700">
              <p>
                <strong>1. Uang Pesangon (UP):</strong> 1 bulan upah untuk masa kerja &lt; 1 tahun, naik 1 bulan upah per tahun hingga maksimal 9 bulan upah (masa kerja 8 tahun atau lebih).
              </p>
              <p>
                <strong>2. Uang Penghargaan Masa Kerja (UPMK):</strong> Diberikan bagi masa kerja ≥ 3 tahun (mulai dari 2 bulan upah hingga maksimal 10 bulan upah untuk ≥ 24 tahun).
              </p>
              <p>
                <strong>3. Uang Penggantian Hak (UPH):</strong> Meliputi cuti tahunan yang belum gugur dan belum diambil, ongkos kepulangan pekerja & keluarga ke tempat asal, dan hak lain sesuai PK/PP/PKB.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-200"
          >
            Mengerti & Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
