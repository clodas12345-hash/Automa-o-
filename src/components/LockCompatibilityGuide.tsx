import React from 'react';
import { ShieldCheck, HelpCircle, CheckCircle, XCircle, AlertTriangle, Smartphone, KeyRound } from 'lucide-react';

export const LockCompatibilityGuide: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Guia de Compatibilidade e Cadastro na Fechadura Eletrônica</h2>
          <p className="text-sm text-slate-600">Dicas essenciais para garantir que sua fechadura inteligente reconheça o UID estático do seu app Android.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step-by-Step Registration */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono">1</span>
            Como cadastrar o UID na Fechadura
          </h3>
          <ol className="text-xs text-slate-700 space-y-2.5 pl-2">
            <li className="flex items-start gap-2">
              <span className="font-bold text-indigo-600">A.</span>
              <span>Abra o painel de administração da sua fechadura eletrônica (geralmente digitando <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono">*</code> ou acessando o menu de cadastro de cartões/tags).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-indigo-600">B.</span>
              <span>Escolha a opção <strong className="text-slate-900">Cadastrar Cartão / Tag por Teclado ou Leitor Manual</strong> (se sua fechadura permitir digitação manual de UID) OU utilize o modo de gravação por aproximação se o leitor da fechadura aceitar APDUs de HCE.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-indigo-600">C.</span>
              <span>Insira exatamente o UID hexadecimal gerado neste aplicativo (ex: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono font-bold text-indigo-600">04 A1 B2 C3</code>).</span>
            </li>
          </ol>
        </div>

        {/* Lock Compatibility Matrix */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono">2</span>
            Compatibilidade com Tipos de Fechadura
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Fechaduras com Leitor HCE / Smart Card APDU:</span>
                <p className="text-slate-600 text-[11px]">Funcionam perfeitamente com este código Kotlin HCE, respondendo ao SELECT AID e enviando o UID fixo.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Fechaduras Mifare Clássicas / UID Anti-colisão Bruto:</span>
                <p className="text-slate-600 text-[11px]">Algumas fechaduras baratas analógicas exigem a resposta de anticolação de rádio frequência de baixo nível (hardware UID). Nesses casos, o HCE padrão do Android pode não ser lido a menos que o leitor suporte emulação APDU.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div className="bg-indigo-50/60 rounded-xl p-5 border border-indigo-100 space-y-3">
        <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-600" />
          Dicas de Configuração no Aparelho Android
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-indigo-900">
          <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-xs">
            <div className="font-bold mb-1">1. NFC Padrão (HCE)</div>
            <p className="text-slate-600 text-[11px]">Vá em Configurações &gt; Conexões &gt; NFC e defina seu aplicativo como o leitor/serviço padrão para "Outros" (CATEGORY_OTHER).</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-xs">
            <div className="font-bold mb-1">2. Economia de Bateria</div>
            <p className="text-slate-600 text-[11px]">Desative a otimização de bateria para o seu app. O sistema Android pode colocar serviços HCE em segundo plano em modo profundo se estiverem otimizados.</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-xs">
            <div className="font-bold mb-1">3. Tela Ligada</div>
            <p className="text-slate-600 text-[11px]">Por padrão, a maioria dos dispositivos Android exige que a tela esteja ligada (desbloqueada ou com luz acesa) para transmitir APDUs HCE por segurança.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
