import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  X, 
  Plus, 
  History, 
  HelpCircle, 
  ShieldCheck, 
  Smartphone, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { DeviceConfig, ActivityLog } from './types';
import { 
  loadDevices, 
  saveDevices, 
  loadLogs, 
  DEFAULT_DEVICES 
} from './utils/deviceManager';
import { DeviceCard } from './components/DeviceCard';
import { DeviceConfigModal } from './components/DeviceConfigModal';
import { AddDeviceModal } from './components/AddDeviceModal';
import { AlexaGuideModal } from './components/AlexaGuideModal';
import { ActivityLogsModal } from './components/ActivityLogsModal';

export default function App() {
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [editingDevice, setEditingDevice] = useState<DeviceConfig | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlexaGuide, setShowAlexaGuide] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoDetail, setShowLogoDetail] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'lock' | 'gate' | 'other'>('all');

  // Load saved devices on startup
  useEffect(() => {
    const loaded = loadDevices();
    setDevices(loaded);
    setLogs(loadLogs());
  }, []);

  const handleUpdateDevice = (updated: DeviceConfig) => {
    const next = devices.map((d) => (d.id === updated.id ? updated : d));
    setDevices(next);
    saveDevices(next);
    setLogs(loadLogs());
  };

  const handleAddDevice = (newDevice: DeviceConfig) => {
    const next = [...devices, newDevice];
    setDevices(next);
    saveDevices(next);
    setLogs(loadLogs());
  };

  const handleDeleteDevice = (deviceId: string) => {
    const next = devices.filter((d) => d.id !== deviceId);
    setDevices(next);
    saveDevices(next);
    setLogs(loadLogs());
  };

  const handleClearLogs = () => {
    localStorage.removeItem('gkd_activity_logs_v1');
    setLogs([]);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar os equipamentos padrão da GKD?')) {
      setDevices(DEFAULT_DEVICES);
      saveDevices(DEFAULT_DEVICES);
      setShowSettingsModal(false);
    }
  };

  const filteredDevices = devices.filter((d) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'lock') return d.type === 'lock';
    if (selectedFilter === 'gate') return d.type === 'gate';
    return d.type !== 'lock' && d.type !== 'gate';
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 selection:bg-indigo-500 font-sans pb-10">
      
      {/* Top Navigation Bar */}
      <header className="w-full max-w-md flex items-center justify-between pt-2 pb-4 border-b border-slate-900 sticky top-0 bg-slate-950/95 backdrop-blur-md z-30">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setShowLogoDetail(true)}
        >
          <img 
            src="/automocao.png" 
            alt="GKD Mobility" 
            className="w-10 h-10 object-contain rounded-xl border border-slate-800 p-1 group-hover:border-indigo-500 transition" 
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-slate-200">GKD Mobility</h1>
              <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800 px-1.5 py-0.2 rounded font-mono">HUB</span>
            </div>
            <p className="text-[11px] text-slate-400">Controle Central de Equipamentos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Histórico */}
          <button
            onClick={() => {
              setLogs(loadLogs());
              setShowLogsModal(true);
            }}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center transition active:scale-95"
            title="Histórico de Acionamentos"
          >
            <History className="w-4 h-4 text-slate-300" />
          </button>

          {/* Adicionar Equipamento */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition active:scale-95 shadow-md shadow-indigo-900/40"
            title="Adicionar Equipamento"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Configurações Globais */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center transition active:scale-95"
            title="Configurações Gerais"
          >
            <Settings className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md my-4 flex-1 flex flex-col space-y-4">
        
        {/* Banner de Dica para Fechadura ELG pelo Celular */}
        <div 
          onClick={() => setShowAlexaGuide(true)}
          className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-cyan-950/50 border border-indigo-900/50 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-500/60 transition shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                Fechadura ELG pelo Celular
                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1 rounded">Sem PC</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Toque para ver o guia de como acionar sua ELG direto pelo app.
              </p>
            </div>
          </div>
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
        </div>

        {/* Filtros de Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Todos ({devices.length})
          </button>
          <button
            onClick={() => setSelectedFilter('lock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedFilter === 'lock'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Fechaduras
          </button>
          <button
            onClick={() => setSelectedFilter('gate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedFilter === 'gate'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Portões
          </button>
          <button
            onClick={() => setSelectedFilter('other')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedFilter === 'other'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Outros
          </button>
        </div>

        {/* Lista de Equipamentos */}
        <div className="space-y-3.5">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onEdit={(d) => setEditingDevice(d)}
              onUpdateDevice={handleUpdateDevice}
            />
          ))}

          {filteredDevices.length === 0 && (
            <div className="text-center py-8 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-6">
              <p className="text-xs text-slate-400 mb-3">Nenhum equipamento nesta categoria.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
              >
                + Adicionar Equipamento
              </button>
            </div>
          )}

          {/* Botão de Adicionar ao final da lista */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-3.5 rounded-2xl border border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/30 hover:bg-slate-900/60 text-slate-400 hover:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Adicionar Novo Equipamento
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center text-[11px] text-slate-600 pt-3">
        GKD Mobility Hub • Automação Unificada © 2026
      </footer>

      {/* Modais do Sistema */}

      {/* Modal Sobre a GKD */}
      {showLogoDetail && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <button 
            onClick={() => setShowLogoDetail(false)} 
            className="absolute top-6 right-6 text-slate-400 hover:text-white"
          >
            <X className="w-7 h-7" />
          </button>
          <img 
            src="/automocao.png" 
            alt="GKD Mobility" 
            className="w-24 h-24 object-contain mb-5"
          />
          <h2 className="text-xl font-bold text-indigo-400 mb-2">GKD Mobility Hub</h2>
          <p className="text-xs text-slate-300 max-w-xs leading-relaxed mb-6">
            Central de automação para controle de fechaduras inteligentes, portões e dispositivos sem depender de múltiplos aplicativos.
          </p>
          <button
            onClick={() => setShowLogoDetail(false)}
            className="px-6 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Modal de Configuração do Dispositivo Individual */}
      {editingDevice && (
        <DeviceConfigModal
          device={editingDevice}
          isOpen={Boolean(editingDevice)}
          onClose={() => setEditingDevice(null)}
          onSave={handleUpdateDevice}
          onDelete={handleDeleteDevice}
          onOpenAlexaGuide={() => {
            setEditingDevice(null);
            setShowAlexaGuide(true);
          }}
        />
      )}

      {/* Modal Adicionar Novo Dispositivo */}
      <AddDeviceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddDevice}
      />

      {/* Modal Guia Alexa / Celular */}
      <AlexaGuideModal
        isOpen={showAlexaGuide}
        onClose={() => setShowAlexaGuide(false)}
      />

      {/* Modal Histórico de Atividades */}
      <ActivityLogsModal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        logs={logs}
        onClearLogs={handleClearLogs}
      />

      {/* Modal Configurações Gerais */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Configurações Gerais</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-slate-400">
                Seus equipamentos e configurações ficam salvos na memória do aplicativo no seu celular.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={handleResetDefaults}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restaurar Equipamentos Padrão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
