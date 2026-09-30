import React from 'react';
import { X, Smartphone, Globe, CheckCircle2, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

interface AlexaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlexaGuideModal: React.FC<AlexaGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Controlar Fechadura ELG pelo Celular
              </h2>
              <p className="text-xs text-cyan-400">Método 100% pelo Celular (Sem Computador)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="bg-cyan-950/40 border border-cyan-800/40 rounded-xl p-3.5 text-cyan-200">
            Como o portal de desenvolvedor da Tuya costuma dar erro de carregamento no celular, este é o método mais rápido e confiável para você usar <strong>apenas o app GKD</strong> para abrir sua fechadura ELG.
          </div>

          {/* Passo 1 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
              Conecte a fechadura na Alexa
            </div>
            <p className="text-slate-400 pl-8">
              No app da Alexa no seu celular, vá em <strong>Mais &gt; Skills e Jogos</strong>, busque por <strong>"Smart Life"</strong> (ou "ELG Connect") e ative. Sua fechadura ELG aparecerá automaticamente na lista de dispositivos da Alexa.
            </p>
          </div>

          {/* Passo 2 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
              Crie o link de acionamento (Webhook)
            </div>
            <p className="text-slate-400 pl-8">
              No navegador do celular, acesse o serviço gratuito <span className="text-indigo-400 font-mono font-bold">voicemonkey.io</span> (ou Make / IFTTT) e entre com sua conta Amazon. Ele gera um link direto para disparar comandos na Alexa.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</span>
              Cole o link no app GKD
            </div>
            <p className="text-slate-400 pl-8">
              Na fechadura aqui no app GKD, clique no ícone de <strong>Engrenagem (Configurar)</strong>, selecione <strong>Webhook / Alexa</strong> e cole o link.
            </p>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>
              <strong>Pronto!</strong> Ao tocar no botão do app GKD, o sinal é enviado na mesma hora e a porta destranca. Você só precisará usar este app!
            </span>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            Entendido, fechar guia
          </button>
        </div>

      </div>
    </div>
  );
};
