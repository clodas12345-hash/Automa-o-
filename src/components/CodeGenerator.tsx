import React, { useState } from 'react';
import { HceConfig } from '../types';
import { Copy, Check, FileCode, Sliders, Terminal, RefreshCw, AlertCircle } from 'lucide-react';

interface CodeGeneratorProps {
  config: HceConfig;
  onChange: (newConfig: HceConfig) => void;
}

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({ config, onChange }) => {
  const [activeTab, setActiveTab] = useState<'service' | 'xml' | 'manifest' | 'activity'>('service');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Helper to generate random UID
  const generateRandomUid = (length: 4 | 7) => {
    const bytes = Array.from({ length }, () => Math.floor(Math.random() * 256));
    return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
  };

  const handleLengthChange = (length: 4 | 7) => {
    const newUid = generateRandomUid(length);
    onChange({
      ...config,
      uidLength: length,
      uidHex: newUid
    });
  };

  const handleRegenerate = () => {
    onChange({
      ...config,
      uidHex: generateRandomUid(config.uidLength)
    });
  };

  // Convert UID hex string to ByteArray initialization in Kotlin e.g. "04 A1 B2 C3" -> "byteArrayOf(0x04.toByte(), 0xA1.toByte(), 0xB2.toByte(), 0xC3.toByte())"
  const getUidByteArrayKotlin = () => {
    const cleanBytes = config.uidHex.replace(/[^0-9A-Fa-f]/g, ' ').trim().split(/\s+/).filter(Boolean);
    if (cleanBytes.length === 0) return 'byteArrayOf()';
    return `byteArrayOf(${cleanBytes.map(b => `0x${b.toUpperCase()}.toByte()`).join(', ')})`;
  };

  // Code snippets generation
  const serviceCode = `package com.example.smartlockhce

import android.content.Intent
import android.nfc.cardemulation.HostApduService
import android.os.Bundle
import android.util.Log
import java.util.Arrays

class MyHCEService : HostApduService() {

    companion object {
        private const val TAG = "MyHCEService"
        
        // UID físico simulado (${config.uidLength} bytes)
        // Cadastre este UID na sua fechadura eletrônica: ${config.uidHex}
        private val CARD_UID = ${getUidByteArrayKotlin()}
        
        // Comando APDU ISO padrão para leitura de UID (GET DATA / LOAD UID / READ BINARY)
        // Alguns leitores usam FF CA 00 00 00
        private val APDU_SELECT_AID = byteArrayOf(
            0x00.toByte(), 0xA4.toByte(), 0x04.toByte(), 0x00.toByte(),
            0x07.toByte(), // Tamanho do AID (ex: 7 bytes)
            0xF2.toByte(), 0x22.toByte(), 0x22.toByte(), 0x22.toByte(), 0x22.toByte(), 0x22.toByte(), 0x22.toByte()
        )
        
        private val APDU_GET_UID = byteArrayOf(0xFF.toByte(), 0xCA.toByte(), 0x00.toByte(), 0x00.toByte(), 0x00.toByte())
        
        // Status words
        private val SW_SUCCESS = byteArrayOf(0x90.toByte(), 0x00.toByte())
        private val SW_UNKNOWN = byteArrayOf(0x6A.toByte(), 0x82.toByte())
    }

    override fun processCommandApdu(commandApdu: ByteArray, extras: Bundle?): ByteArray {
        Log.d(TAG, "APDU Recebido: \${toHex(commandApdu)}")

        // 1. Verifica se é o comando SELECT AID configurado no apduservice.xml
        if (commandApdu.size >= 6 && commandApdu[0] == 0x00.toByte() && commandApdu[1] == 0xA4.toByte()) {
            Log.d(TAG, "AID Selecionado com sucesso. Retornando SW_SUCCESS (9000)")
            // Retorna dados iniciais ou apenas 90 00 indicando applet selecionado
            return concat(CARD_UID, SW_SUCCESS)
        }

        // 2. Verifica comando personalizado GET UID (FF CA 00 00 00)
        if (Arrays.equals(commandApdu, APDU_GET_UID)) {
            Log.d(TAG, "Leitor solicitou UID. Retornando UID estático: \${toHex(CARD_UID)}")
            return concat(CARD_UID, SW_SUCCESS)
        }

        // 3. Fallback genérico para leitores que enviam comandos customizados
        // Retorna o UID fixo + SW_SUCCESS para garantir que a fechadura abra
        if (commandApdu.size > 2) {
            Log.d(TAG, "Comando customizado detectado. Respondendo com UID + 9000")
            return concat(CARD_UID, SW_SUCCESS)
        }

        Log.w(TAG, "Comando APDU desconhecido")
        return SW_UNKNOWN
    }

    override fun onDeactivated(reason: Int) {
        val reasonStr = if (reason == DEACTIVATION_LINK_LOSS) "Perda de Campo (Link Loss)" else "Desativado por outro leitor"
        Log.d(TAG, "HCE Desativado: \$reasonStr")
    }

    private fun toHex(bytes: ByteArray): String {
        return bytes.joinToString(" ") { String.format("%02X", it) }
    }

    private fun concat(a: ByteArray, b: ByteArray): ByteArray {
        val result = ByteArray(a.size + b.size)
        System.arraycopy(a, 0, result, 0, a.size)
        System.arraycopy(b, 0, result, a.size, b.size)
        return result
    }
}
`;

  const xmlConfigCode = `<?xml version="1.0" encoding="utf-8"?>
<host-apdu-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/hce_service_description"
    android:requireDeviceUnlock="false">
    
    <!-- AID (Application ID) que o leitor NFC da fechadura deve procurar -->
    <!-- Mude para corresponder ao AID programado no leitor/firmware -->
    <aid-group android:category="other" android:description="@string/aid_description">
        <aid-filter android:name="${config.aid}" />
    </aid-group>

</host-apdu-service>
`;

  const manifestCode = `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.smartlockhce">

    <!-- Permissões necessárias para NFC e HCE -->
    <uses-permission android:name="android.permission.NFC" />
    
    <!-- Requer hardware NFC com suporte a HCE -->
    <uses-feature android:name="android.hardware.nfc" android:required="true" />
    <uses-feature android:name="android.hardware.nfc.hce" android:required="true" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SmartLockHCE">

        <!-- Atividade Principal para ativar o serviço e exibir status -->
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Declaração do HostApduService (MyHCEService) -->
        <service
            android:name=".MyHCEService"
            android:exported="true"
            android:permission="android.permission.BIND_NFC_SERVICE">
            
            <intent-filter>
                <action android:name="android.nfc.cardemulation.action.HOST_APDU_SERVICE" />
            </intent-filter>

            <meta-data
                android:name="android.nfc.cardemulation.host_apdu_service"
                android:resource="@xml/apduservice" />
        </service>

    </application>
</manifest>
`;

  const activityCode = `package com.example.smartlockhce

import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<Button>(R.id.btnActivateNfc).setOnClickListener {
            Toast.makeText(this, "NFC Ativo", Toast.LENGTH_SHORT).show()
        }
    }
}
`;

  const layoutXmlCode = `<?xml version="1.0" encoding="utf-8"?>
<Button xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/btnActivateNfc"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:backgroundTint="#0F172A"
    android:text="ATIVAR CHAVE NFC"
    android:textColor="#FFFFFF"
    android:textSize="24sp"
    android:textStyle="bold" />
`;

  const copyToClipboard = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const getCodeForTab = () => {
    switch (activeTab) {
      case 'service': return serviceCode;
      case 'xml': return xmlConfigCode;
      case 'manifest': return manifestCode;
      case 'activity': return activityCode;
      case 'layout': return layoutXmlCode;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Configuration Controls Bar */}
      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              Parâmetros de Configuração HCE & UID
            </h2>
            <p className="text-sm text-slate-600">
              Personalize o UID fixo que será simulado pelo seu app Android e cadastrado na sua fechadura.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              className="px-3 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 shadow-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Gerar Novo UID
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* UID Length Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Tamanho do UID</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLengthChange(4)}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                  config.uidLength === 4
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                4 Bytes (Single UID)
              </button>
              <button
                type="button"
                onClick={() => handleLengthChange(7)}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                  config.uidLength === 7
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                7 Bytes (Double UID)
              </button>
            </div>
          </div>

          {/* UID Hex Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">UID Hexadecimal</label>
            <input
              type="text"
              value={config.uidHex}
              onChange={(e) => onChange({ ...config, uidHex: e.target.value.toUpperCase() })}
              placeholder="Ex: 04 A1 B2 C3"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500">Cadastre exatamente este UID na sua fechadura.</p>
          </div>

          {/* AID Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">AID (Application ID)</label>
            <input
              type="text"
              value={config.aid}
              onChange={(e) => onChange({ ...config, aid: e.target.value.toUpperCase() })}
              placeholder="Ex: F2222222222222"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500">Identificador do aplicativo HCE (5 a 16 bytes hex).</p>
          </div>
        </div>

        {/* Warning Note about Android HCE UID */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Aviso Importante sobre HCE no Android:</span> O sistema operacional Android gera UIDs dinâmicos ou aleatórios na camada de RF durante a anticolisão padrão de cartões físicos (ISO 14443-3). No entanto, fechaduras inteligentes modernas que leem o <span className="font-semibold">UID via APDU SELECT ou comandos customizados (como <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">FF CA 00 00 00</code>)</span> obtêm exatamente o UID estático retornado pelo seu <code className="font-mono">MyHCEService.kt</code>! Certifique-se de que sua fechadura aceita APDUs HCE.
          </div>
        </div>
      </div>

      {/* Code Viewer Header & Tabs */}
      <div className="border-b border-slate-200 bg-slate-900 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('service')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'service'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            MyHCEService.kt
          </button>
          <button
            onClick={() => setActiveTab('xml')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'xml'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            apduservice.xml
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'manifest'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            AndroidManifest.xml
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'activity'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            MainActivity.kt
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'layout'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            activity_main.xml
          </button>
        </div>

        <button
          onClick={() => copyToClipboard(getCodeForTab(), activeTab)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition shrink-0"
        >
          {copiedTab === activeTab ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Código</span>
            </>
          )}
        </button>
      </div>

      {/* Code Display Area */}
      <div className="relative bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto p-6 max-h-[500px] leading-relaxed">
        <div className="absolute top-3 right-4 text-[10px] text-slate-500 uppercase tracking-widest font-sans">
          Kotlin / XML
        </div>
        <pre className="whitespace-pre">{getCodeForTab()}</pre>
      </div>
    </div>
  );
};
