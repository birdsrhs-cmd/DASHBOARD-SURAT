import React from 'react';
import { QrCode, ShieldCheck } from 'lucide-react';

interface MeteraiBoxProps {
  type?: 'tempel' | 'emeterai';
  compact?: boolean;
  className?: string;
}

export const MeteraiBox: React.FC<MeteraiBoxProps> = ({
  type = 'tempel',
  compact = false,
  className = '',
}) => {
  if (type === 'emeterai') {
    return (
      <div
        className={`relative select-none border border-emerald-600/70 bg-emerald-50/50 rounded p-1.5 text-center text-slate-800 shadow-2xs font-sans ${
          compact ? 'w-24 h-16 text-3xs' : 'w-28 sm:w-32 h-20 text-2xs'
        } ${className}`}
        title="Format e-Meterai Resmi Peruri (Rp 10.000)"
      >
        <div className="flex items-center justify-between border-b border-emerald-300 pb-0.5 mb-1">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            <span className="font-bold text-emerald-900 text-3xs tracking-tighter uppercase">e-METERAI</span>
          </div>
          <span className="font-extrabold text-emerald-800 text-3xs">10000</span>
        </div>

        <div className="flex items-center justify-center space-x-1.5 my-0.5">
          <div className="w-8 h-8 bg-white border border-emerald-400 rounded flex items-center justify-center p-0.5 shrink-0">
            <QrCode className="w-6 h-6 text-slate-900" />
          </div>
          <div className="text-left text-3xs leading-tight text-slate-600 overflow-hidden">
            <p className="font-mono text-[8px] text-slate-700 truncate">SN: 8A4C2-2026</p>
            <p className="text-[7.5px] text-emerald-800 font-semibold">PERURI DIGITAL</p>
          </div>
        </div>

        <div className="text-[7px] text-slate-500 font-medium tracking-tight mt-0.5 truncate">
          Ttd berdampingan (tidak menimpa)
        </div>
      </div>
    );
  }

  // Format Standar: Meterai Tempel Fisik Rp 10.000 (UU No. 10 Tahun 2020)
  return (
    <div
      className={`relative select-none border-2 border-dashed border-rose-400/80 bg-rose-50/40 rounded-sm p-1.5 text-center font-sans text-slate-800 shadow-2xs transition-all ${
        compact ? 'w-28 h-18 text-3xs' : 'w-32 sm:w-36 h-22 text-2xs'
      } ${className}`}
      title="Format Meterai Tempel 10.000 Sesuai UU No. 10 Tahun 2020 tentang Bea Meterai"
    >
      {/* Corner indicators */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-rose-600"></div>
      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-rose-600"></div>
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-rose-600"></div>
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-rose-600"></div>

      {/* Header Bea Meterai RI */}
      <div className="text-[8px] font-black tracking-widest text-rose-800 uppercase flex items-center justify-center space-x-1">
        <span>✦</span>
        <span>METERAI TEMPEL</span>
        <span>✦</span>
      </div>

      <div className="text-[7px] text-slate-500 tracking-wider uppercase font-semibold">
        REPUBLIK INDONESIA
      </div>

      {/* Nominal */}
      <div className="my-0.5 py-0.5 px-1.5 bg-white/90 border border-rose-300 rounded inline-block shadow-2xs">
        <span className="font-extrabold text-rose-900 text-[11px] sm:text-xs tracking-tight">10.000</span>
        <span className="text-[7.5px] font-bold text-rose-700 block uppercase leading-none">
          SEPULUH RIBU RUPIAH
        </span>
      </div>

      {/* Tanggal & Petunjuk Tanda Tangan */}
      <div className="text-[7px] text-slate-500 font-medium leading-tight">
        Tgl: ..... / ..... / 20.....
      </div>
      <div className="text-[6.5px] text-slate-600 italic leading-none font-sans mt-0.5">
        (Tanda tangan mengenai meterai)
      </div>
    </div>
  );
};
