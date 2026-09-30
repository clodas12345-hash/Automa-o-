import React from 'react';
import { X, History, Trash2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
  onClearLogs: () => void;
}

export const ActivityLogsModal: React.FC<ActivityLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">Histórico de Acionamentos</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {logs.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              Nenhum acionamento registrado ainda.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-start justify-between gap-2"
              >
                <div>
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    {log.status === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : log.status === 'error' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span>{log.deviceName}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{log.message || log.action}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))
          )}
        </div>

        {logs.length > 0 && (
          <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={onClearLogs}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar histórico
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
