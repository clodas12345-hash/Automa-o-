import React from 'react';
import { Smartphone, Lock, ShieldCheck, Cpu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Android HCE Smart Lock Generator</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">Kotlin</span>
            </div>
            <p className="text-sm text-slate-400">Servidor Host Card Emulation para Abertura de Fechadura Eletrônica por NFC</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>ISO/IEC 7816-4</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>UID Estático (4 ou 7 bytes)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Android HCE</span>
          </div>
        </div>
      </div>
    </header>
  );
};
