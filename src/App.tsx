import React, { useState } from 'react';
import { Radio, Settings, X } from 'lucide-react';

export default function App() {
  const [isArmed, setIsArmed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Pronto para acionamento');
  const [showSettings, setShowSettings] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  const handleToggleArm = () => {
    if (!isArmed) {
      setIsArmed(true);
      setDoorOpen(false);
      setStatusMessage('🟢 Sistema Ativo. Aguardando...');
    } else {
      setIsArmed(false);
      setStatusMessage('Pronto para acionamento');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 selection:bg-indigo-500">
      
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* A imagem deve ser salva como /public/automocao.png */}
          <img src="/automocao.png" alt="GKD Mobility" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-200">GKD Mobility</h1>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center transition active:scale-95"
          title="Configurações e Exportação"
        >
          <Settings className="w-4 h-4 text-indigo-400" />
        </button>
      </div>

      {/* Main Content: Center Button */}
      <div className="w-full max-w-md my-auto flex flex-col items-center space-y-6">
        <div className="text-center space-y-1.5">
          <p className={`text-sm font-medium transition-all ${doorOpen ? 'text-emerald-400 font-bold' : isArmed ? 'text-emerald-300 animate-pulse' : 'text-slate-300'}`}>
            {statusMessage}
          </p>
        </div>

        <button
          onClick={handleToggleArm}
          className={`w-full h-56 rounded-3xl font-bold text-lg uppercase tracking-wider transition-all duration-300 shadow-2xl flex flex-col items-center justify-center gap-4 border ${
            doorOpen
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/40'
              : isArmed
              ? 'bg-amber-600 hover:bg-amber-500 border-amber-500 text-white shadow-amber-600/40 animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-indigo-600/40 active:scale-98'
          }`}
        >
          <Radio className={`w-12 h-12 ${isArmed ? 'animate-spin' : ''}`} />
          <span>{doorOpen ? 'LIBERADO!' : isArmed ? 'ATIVO' : 'PRONTO'}</span>
        </button>
      </div>

      <div className="w-full max-w-md text-center text-xs text-slate-600">
        GKD Mobility © 2026
      </div>
    </div>
  );
}
