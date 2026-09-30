import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Save, 
  HelpCircle, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Wifi,
  Cloud
} from 'lucide-react';
import { DeviceConfig, DeviceType, IntegrationMethod } from '../types';

interface DeviceConfigModalProps {
  device: DeviceConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: DeviceConfig) => void;
  onDelete: (deviceId: string) => void;
  onOpenAlexaGuide: () => void;
}

export const DeviceConfigModal: React.FC<DeviceConfigModalProps> = ({
  device,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onOpenAlexaGuide,
}) => {
  const [formData, setFormData] = useState<DeviceConfig>({ ...device });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              Configurar Equipamento
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Ajuste o método de comunicação e regras de segurança</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nome do Dispositivo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="Ex: Fechadura ELG, Portão Principal"
            />
          </div>

          {/* Tipo do Dispositivo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipo do Dispositivo
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as DeviceType })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="lock">Fechadura Digital</option>
              <option value="gate">Portão Eletrônico</option>
              <option value="light">Iluminação / Luz</option>
              <option value="relay">Relé Geral / Tomada</option>
              <option value="alarm">Alarme / Sirene</option>
            </select>
          </div>

          {/* Método de Integração */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span>Método de Comunicação</span>
              <button
                type="button"
                onClick={onOpenAlexaGuide}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-normal underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Como conectar Fechadura ELG pelo celular?
              </button>
            </label>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, method: 'webhook' })}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                  formData.method === 'webhook'
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  Webhook / Alexa
                </div>
                <span className="text-[11px] opacity-75">Fácil pelo celular (sem PC)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, method: 'tuya' })}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                  formData.method === 'tuya'
                    ? 'bg-orange-950/60 border-orange-500 text-orange-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Cloud className="w-3.5 h-3.5 text-orange-400" />
                  Tuya Cloud Oficial
                </div>
                <span className="text-[11px] opacity-75">Requer Tuya IoT Portal</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, method: 'local_ip' })}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                  formData.method === 'local_ip'
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Wifi className="w-3.5 h-3.5 text-purple-400" />
                  IP Local / Wi-Fi
                </div>
                <span className="text-[11px] opacity-75">ESP32, Sonoff, Shelly</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, method: 'simulation' })}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                  formData.method === 'simulation'
                    ? 'bg-slate-800 border-slate-600 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Zap className="w-3.5 h-3.5 text-slate-400" />
                  Modo Demonstração
                </div>
                <span className="text-[11px] opacity-75">Testar interface no app</span>
              </button>
            </div>
          </div>

          {/* Configurações específicas conforme o método selecionado */}
          {formData.method === 'webhook' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-indigo-300 mb-1">
                  URL do Webhook (Gatilho da Fechadura / Alexa / IFTTT)
                </label>
                <input
                  type="url"
                  value={formData.webhookUrl || ''}
                  onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                  placeholder="https://api.voicemonkey.io/trigger?token=... ou https://maker.ifttt.com/..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  💡 <strong className="text-slate-300">Como funciona:</strong> Ao tocar no botão do app, essa URL é chamada imediatamente e executa a rotina que abre sua fechadura ELG ou portão.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Método HTTP</label>
                  <select
                    value={formData.httpMethod || 'GET'}
                    onChange={(e) => setFormData({ ...formData, httpMethod: e.target.value as 'GET' | 'POST' })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                {formData.httpMethod === 'POST' && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">JSON Payload</label>
                    <input
                      type="text"
                      value={formData.httpPayload || ''}
                      onChange={(e) => setFormData({ ...formData, httpPayload: e.target.value })}
                      placeholder='{"action":"open"}'
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {formData.method === 'tuya' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <p className="text-xs text-orange-300 font-medium">
                Credenciais da Conta de Desenvolvedor Tuya IoT:
              </p>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Access ID / Client ID</label>
                <input
                  type="text"
                  value={formData.tuyaClientId || ''}
                  onChange={(e) => setFormData({ ...formData, tuyaClientId: e.target.value })}
                  placeholder="Ex: tuya_client_id_..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Access Secret</label>
                <input
                  type="password"
                  value={formData.tuyaSecret || ''}
                  onChange={(e) => setFormData({ ...formData, tuyaSecret: e.target.value })}
                  placeholder="Ex: tuya_secret_..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Device ID da Fechadura ELG</label>
                <input
                  type="text"
                  value={formData.tuyaDeviceId || ''}
                  onChange={(e) => setFormData({ ...formData, tuyaDeviceId: e.target.value })}
                  placeholder="Ex: eb12345678..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {formData.method === 'local_ip' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <label className="block text-xs font-semibold text-purple-300">
                Endereço IP Local do Módulo (ESP32 / Sonoff / Shelly)
              </label>
              <input
                type="text"
                value={formData.localIpUrl || ''}
                onChange={(e) => setFormData({ ...formData, localIpUrl: e.target.value })}
                placeholder="http://192.168.1.100/relay/open"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                O celular e o módulo de portão precisam estar na mesma rede Wi-Fi.
              </p>
            </div>
          )}

          {/* Temporizador de travamento automático */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Tempo para Fechar/Trancar
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.autoLockSeconds ?? 5}
                  onChange={(e) => setFormData({ ...formData, autoLockSeconds: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
                <span className="text-xs text-slate-400">segundos</span>
              </div>
            </div>

            {/* Proteção por PIN */}
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Proteger com PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={formData.securityPin || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  securityPin: e.target.value,
                  requireConfirmation: Boolean(e.target.value)
                })}
                placeholder="Vazio = sem PIN"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Botões de Ação do Formulário */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Deseja realmente remover o equipamento "${formData.name}"?`)) {
                  onDelete(formData.id);
                  onClose();
                }
              }}
              className="px-3.5 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 border border-rose-900/40 text-xs flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-900/40 transition active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Alterações
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
