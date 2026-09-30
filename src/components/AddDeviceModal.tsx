import React, { useState } from 'react';
import { X, Plus, Shield, DoorOpen, Lightbulb, Power, Globe } from 'lucide-react';
import { DeviceConfig, DeviceType, IntegrationMethod } from '../types';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newDevice: DeviceConfig) => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<DeviceType>('lock');
  const [method, setMethod] = useState<IntegrationMethod>('webhook');
  const [webhookUrl, setWebhookUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newDev: DeviceConfig = {
      id: 'dev-' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      type,
      method,
      webhookUrl: method === 'webhook' ? webhookUrl : undefined,
      autoLockSeconds: type === 'lock' ? 5 : type === 'gate' ? 8 : undefined,
      status: type === 'lock' ? 'locked' : type === 'gate' ? 'closed' : 'off',
    };

    onAdd(newDev);
    setName('');
    setWebhookUrl('');
    onClose();
  };

  const deviceTypes = [
    { id: 'lock', label: 'Fechadura Digital', icon: Shield },
    { id: 'gate', label: 'Portão Eletrônico', icon: DoorOpen },
    { id: 'light', label: 'Iluminação', icon: Lightbulb },
    { id: 'relay', label: 'Relé / Tomada', icon: Power },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Adicionar Novo Equipamento
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nome do Equipamento
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Portão Social, Luz Jardim, Fechadura Quarto"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Tipo do Dispositivo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {deviceTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as DeviceType)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Método de Acionamento
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as IntegrationMethod)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
            >
              <option value="webhook">Webhook / Link de Acionamento (Alexa, Make, IFTTT)</option>
              <option value="tuya">Tuya Cloud (Chaves de API)</option>
              <option value="local_ip">IP Local Wi-Fi (ESP32 / Sonoff / Shelly)</option>
              <option value="simulation">Modo Demonstração / Teste</option>
            </select>
          </div>

          {method === 'webhook' && (
            <div>
              <label className="block text-xs font-semibold text-indigo-300 mb-1">
                URL do Webhook (opcional agora, pode configurar depois)
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:bg-slate-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/40"
            >
              Cadastrar Equipamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
