import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  DoorOpen, 
  Lightbulb, 
  Power, 
  ShieldAlert, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { DeviceConfig } from '../types';
import { triggerDevice } from '../utils/deviceManager';

interface DeviceCardProps {
  device: DeviceConfig;
  onEdit: (device: DeviceConfig) => void;
  onUpdateDevice: (updated: DeviceConfig) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onEdit,
  onUpdateDevice,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Auto-lock countdown effect
  useEffect(() => {
    let interval: any;
    if (countdown !== null && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      // Reset device status
      onUpdateDevice({
        ...device,
        status: device.type === 'lock' ? 'locked' : device.type === 'gate' ? 'closed' : 'off',
      });
    }
    return () => clearInterval(interval);
  }, [countdown, device, onUpdateDevice]);

  const handleAction = async () => {
    if (isProcessing) return;

    // Check PIN requirement if configured
    if (device.requireConfirmation && device.securityPin) {
      const entered = window.prompt(`Confirmação de Segurança: Digite o PIN para acionar ${device.name}:`);
      if (entered !== device.securityPin) {
        setFeedback({ type: 'error', msg: 'PIN incorreto!' });
        setTimeout(() => setFeedback(null), 3000);
        return;
      }
    }

    setIsProcessing(true);
    setFeedback(null);

    const isCurrentlyActive = device.status === 'unlocked' || device.status === 'open' || device.status === 'on';
    const nextStatus = isCurrentlyActive
      ? device.type === 'lock' ? 'locked' : device.type === 'gate' ? 'closed' : 'off'
      : device.type === 'lock' ? 'unlocked' : device.type === 'gate' ? 'open' : 'on';

    const result = await triggerDevice(device, isCurrentlyActive ? 'lock' : 'unlock');

    setIsProcessing(false);

    if (result.success) {
      setFeedback({ type: 'success', msg: result.message });
      onUpdateDevice({
        ...device,
        status: nextStatus,
        lastTriggered: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      });

      // Start auto-lock timer if configured
      if (!isCurrentlyActive && device.autoLockSeconds && device.autoLockSeconds > 0) {
        setCountdown(device.autoLockSeconds);
      }
    } else {
      setFeedback({ type: 'error', msg: result.message });
    }

    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const getDeviceIcon = () => {
    switch (device.type) {
      case 'lock':
        return device.status === 'unlocked' ? (
          <Unlock className="w-8 h-8 text-emerald-400" />
        ) : (
          <Lock className="w-8 h-8 text-indigo-400" />
        );
      case 'gate':
        return <DoorOpen className="w-8 h-8 text-amber-400" />;
      case 'light':
        return <Lightbulb className={`w-8 h-8 ${device.status === 'on' ? 'text-yellow-400' : 'text-slate-400'}`} />;
      case 'alarm':
        return <ShieldAlert className="w-8 h-8 text-rose-400" />;
      default:
        return <Power className="w-8 h-8 text-indigo-400" />;
    }
  };

  const isUnlocked = device.status === 'unlocked' || device.status === 'open' || device.status === 'on';

  const getStatusBadge = () => {
    if (countdown !== null) {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
          <Clock className="w-3 h-3" />
          Aberto ({countdown}s)
        </span>
      );
    }
    if (isUnlocked) {
      return (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          ● {device.type === 'lock' ? 'Destrancado' : device.type === 'gate' ? 'Aberto' : 'Ligado'}
        </span>
      );
    }
    return (
      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
        ● {device.type === 'lock' ? 'Trancado' : device.type === 'gate' ? 'Fechado' : 'Desligado'}
      </span>
    );
  };

  const getMethodBadge = () => {
    switch (device.method) {
      case 'webhook':
        return <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">Webhook / Alexa</span>;
      case 'tuya':
        return <span className="text-[10px] text-orange-400 bg-orange-950/60 border border-orange-800/40 px-2 py-0.5 rounded">Tuya Cloud</span>;
      case 'local_ip':
        return <span className="text-[10px] text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded">IP Local</span>;
      default:
        return <span className="text-[10px] text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded">Modo Teste</span>;
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl transition-all hover:border-slate-700 backdrop-blur-sm">
      {/* Header do Card */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
            isUnlocked 
              ? 'bg-emerald-950/40 border-emerald-500/40 shadow-lg shadow-emerald-950/50' 
              : 'bg-slate-800/80 border-slate-700/70'
          }`}>
            {getDeviceIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-100">{device.name}</h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge()}
              {getMethodBadge()}
            </div>
          </div>
        </div>

        <button
          onClick={() => onEdit(device)}
          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition"
          title="Configurar Equipamento"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Botão de Acionamento Principal */}
      <button
        onClick={handleAction}
        disabled={isProcessing}
        className={`w-full py-4 rounded-xl font-bold tracking-wider text-sm uppercase flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg active:scale-[0.98] ${
          isProcessing
            ? 'bg-slate-800 text-slate-400 cursor-wait'
            : isUnlocked
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 border border-emerald-500/50'
            : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-900/40 border border-indigo-500/40'
        }`}
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            <span>Enviando Comando...</span>
          </>
        ) : isUnlocked ? (
          <>
            <Unlock className="w-4 h-4" />
            <span>{device.type === 'lock' ? 'Trancar Porta' : device.type === 'gate' ? 'Fechar Portão' : 'Desligar'}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>{device.type === 'lock' ? 'Destrancar Porta' : device.type === 'gate' ? 'Abrir Portão' : 'Acionar'}</span>
          </>
        )}
      </button>

      {/* Feedback contextual */}
      {feedback && (
        <div className={`mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50' 
            : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {device.lastTriggered && !feedback && (
        <div className="mt-2 text-[11px] text-slate-500 text-right">
          Último acionamento: {device.lastTriggered}
        </div>
      )}
    </div>
  );
};
