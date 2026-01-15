'use client';
import { AlertTriangle, Flame } from 'lucide-react';

export default function ProtocolDisplay() {
  return (
    <div className="mt-6 bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 flex items-start gap-4">
      <div className="bg-amber-500/10 p-2 rounded-lg mt-0.5 flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
      </div>
      <div>
        <h3 className="text-amber-500 font-bold text-xs tracking-widest mb-2">
          EXECUTION PROTOCOL: ORDERFLOW CONFIRMATION
        </h3>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Seviye testi sırasında kör emir atma.{' '}
          <span className="text-neutral-200 font-medium">CVD Uyumsuzluklarını</span> ve{' '}
          <span className="text-neutral-200 font-medium">Open Interest (OI)</span> değişimini kontrol et.
        </p>
        <div className="mt-2 pt-2 border-t border-amber-500/10 flex items-center gap-2 text-[10px] text-amber-500/80">
          <Flame size={12} />
          <span>CONFLUENCE işaretli seviyeler çakışma bölgesidir. Yüksek volatilite bekle.</span>
        </div>
      </div>
    </div>
  );
}
