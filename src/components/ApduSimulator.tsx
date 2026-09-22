import React, { useState } from 'react';
import { HceConfig, ApduLogEntry } from '../types';
import { Terminal, Send, RotateCcw, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface ApduSimulatorProps {
  config: HceConfig;
}

export const ApduSimulator: React.FC<ApduSimulatorProps> = ({ config }) => {
  const [selectedCommandType, setSelectedCommandType] = useState<'select' | 'get_uid' | 'custom'>('get_uid');
  const [customApdu, setCustomApdu] = useState('FF CA 00 00 00');
  const [logs, setLogs] = useState<ApduLogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      commandName: 'INICIALIZAÇÃO',
      apduHex: '-',
      description: 'Simulador HCE pronto. Envie comandos APDU para testar a resposta do MyHCEService.'
    }
  ]);

  const handleRunCommand = () => {
    let cmdHex = '';
    let cmdName = '';
    let desc = '';

    if (selectedCommandType === 'select') {
      const cleanAid = config.aid.replace(/\s+/g, '');
      const aidBytes = cleanAid.match(/.{1,2}/g)?.join(' ') || '';
      const lenHex = (cleanAid.length / 2).toString(16).padStart(2, '0').toUpperCase();
      cmdHex = `00 A4 04 00 ${lenHex} ${aidBytes}`;
      cmdName = 'SELECT AID';
      desc = `Selecionando aplicação HCE com AID: ${config.aid}`;
    } else if (selectedCommandType === 'get_uid') {
      cmdHex = 'FF CA 00 00 00';
      cmdName = 'GET UID (Mifare/Leitor)';
      desc = 'Comando padrão de leitores para solicitar o UID estático do cartão.';
    } else {
      cmdHex = customApdu.toUpperCase();
      cmdName = 'COMANDO CUSTOMIZADO';
      desc = 'Enviando APDU personalizado para o serviço HCE.';
    }

    // Process response according to MyHCEService logic
    const cleanUid = config.uidHex.replace(/[^0-9A-Fa-f]/g, ' ').trim();
    const successSw = '90 00';
    let responseHex = `${cleanUid} ${successSw}`;

    if (selectedCommandType === 'select') {
      responseHex = `${cleanUid} ${successSw}`;
    } else if (selectedCommandType === 'get_uid') {
      responseHex = `${cleanUid} ${successSw}`;
    }

    const rxEntry: ApduLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'rx',
      commandName: `[RX -> HCE] ${cmdName}`,
      apduHex: cmdHex,
      description: desc
    };

    const txEntry: ApduLogEntry = {
      id: (Date.now() + 1).toString(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'tx',
      commandName: `[TX <- MyHCEService] RESPOSTA APDU`,
      apduHex: responseHex,
      description: `UID retornado: [${cleanUid}] + SW_SUCCESS (90 00)`
    };

    setLogs(prev => [rxEntry, txEntry, ...prev.slice(0, 15)]);
  };

  const handleClearLogs = () => {
    setLogs([
      {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        commandName: 'LOGS LIMPOS',
        apduHex: '-',
        description: 'Histórico de comunicação APDU reiniciado.'
      }
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
      <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Simulador de Leitor & APDU Debugger</h2>
            <p className="text-sm text-slate-400">Teste em tempo real como sua fechadura interage com o UID estático do seu HCE.</p>
          </div>
        </div>
        <button
          onClick={handleClearLogs}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Limpar Logs
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Command Builder Controls */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Enviar Comando APDU</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-slate-600 font-medium">Tipo de Comando do Leitor</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedCommandType('get_uid')}
                className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                  selectedCommandType === 'get_uid'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-semibold">GET UID (FF CA 00 00 00)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Solicitação padrão de leitores RFID</div>
                </div>
                <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedCommandType('select')}
                className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                  selectedCommandType === 'select'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-semibold">SELECT AID (00 A4 04 00 ...)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Inicia sessão com o AID configurado</div>
                </div>
                <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedCommandType('custom')}
                className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                  selectedCommandType === 'custom'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-semibold">Comando Personalizado</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Inserir APDU em formato Hex</div>
                </div>
                <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
              </button>
            </div>
          </div>

          {selectedCommandType === 'custom' && (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 font-medium">APDU Hex</label>
              <input
                type="text"
                value={customApdu}
                onChange={(e) => setCustomApdu(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
                placeholder="Ex: FF CA 00 00 00"
              />
            </div>
          )}

          <button
            onClick={handleRunCommand}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
          >
            <Send className="w-4 h-4" />
            Transmitir APDU para HCE
          </button>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              UID Ativo Simulado:
            </div>
            <code className="text-indigo-600 font-mono font-bold block bg-white px-2 py-1 rounded border border-slate-200">
              {config.uidHex} ({config.uidLength} Bytes)
            </code>
          </div>
        </div>

        {/* Terminal Logs Display */}
        <div className="lg:col-span-2 flex flex-col">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Logs de Transmissão APDU (ISO 7816-4)</h3>
          <div className="flex-1 bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 min-h-[300px] max-h-[350px] overflow-y-auto space-y-3 border border-slate-800 shadow-inner">
            {logs.map((log) => (
              <div key={log.id} className="border-b border-slate-900 pb-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className={`font-bold ${
                    log.type === 'rx' ? 'text-amber-400' : log.type === 'tx' ? 'text-emerald-400' : 'text-cyan-400'
                  }`}>
                    {log.commandName}
                  </span>
                  <span>{log.timestamp}</span>
                </div>
                {log.apduHex !== '-' && (
                  <div className="bg-slate-900 px-2.5 py-1.5 rounded text-indigo-300 font-mono tracking-wide text-[11px] mb-1">
                    {log.apduHex}
                  </div>
                )}
                <div className="text-slate-400 text-[11px]">{log.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
