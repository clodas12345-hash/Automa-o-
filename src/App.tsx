/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Radio, Settings, Check, Copy, Code2, ShieldCheck, Zap, AlertCircle, X, Download } from 'lucide-react';
import JSZip from 'jszip';

export default function App() {
  const [isArmed, setIsArmed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Pronto para acionamento');
  const [showSettings, setShowSettings] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [doorOpen, setDoorOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleToggleArm = () => {
    if (!isArmed) {
      setIsArmed(true);
      setDoorOpen(false);
      setStatusMessage('🟢 Sistema Ativo. Aguardando comando...');
    } else {
      setIsArmed(false);
      setStatusMessage('Pronto para acionamento');
    }
  };

  const simulateLockRead = () => {
    if (!isArmed) return;
    setStatusMessage('⚡ Comando recebido! Autenticando...');
    setTimeout(() => {
      setDoorOpen(true);
      setIsArmed(false);
      setStatusMessage('🔓 Acesso Liberado com Sucesso!');
    }, 1000);
  };

  const files = {
    'settings.gradle.kts': `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

include(":app")`,

    'build.gradle.kts': `plugins {
    id("com.android.application") version "8.2.0" apply false
    id("org.jetbrains.kotlin.android") version "1.9.0" apply false
}`,

    'app/build.gradle.kts': `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.gkd.automacao"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.gkd.automacao"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
}`,

    '.github/workflows/android.yml': `name: Build Android APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Repository
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'

    - name: Install Gradle
      run: sudo apt-get update && sudo apt-get install -y gradle

    - name: Build APK with Gradle
      run: gradle :app:assembleDebug

    - name: Upload APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: gkd-automacao-apk
        path: app/build/outputs/apk/debug/app-debug.apk`,

    'app/src/main/java/com/gkd/automacao/MainActivity.kt': `package com.gkd.automacao

import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<Button>(R.id.btnActivateNfc).setOnClickListener {
            Toast.makeText(this, "Sistema Ativo!", Toast.LENGTH_SHORT).show()
        }
    }
}`,

    'app/src/main/java/com/gkd/automacao/MyHCEService.kt': `package com.gkd.automacao

import android.nfc.cardemulation.HostApduService
import android.os.Bundle

class MyHCEService : HostApduService() {
    companion object {
        private val UID_BYTES = byteArrayOf(0x04.toByte(), 0xA1.toByte(), 0xB2.toByte(), 0xC3.toByte())
        private val SUCCESS_SW = byteArrayOf(0x90.toByte(), 0x00.toByte())
    }

    override fun processCommandApdu(commandApdu: ByteArray, extras: Bundle?): ByteArray {
        if (commandApdu.size >= 2 && commandApdu[0] == 0xFF.toByte() && commandApdu[1] == 0xCA.toByte()) {
            val response = ByteArray(UID_BYTES.size + SUCCESS_SW.size)
            System.arraycopy(UID_BYTES, 0, response, 0, UID_BYTES.size)
            System.arraycopy(SUCCESS_SW, 0, response, UID_BYTES.size, UID_BYTES.size)
            return response
        }
        return SUCCESS_SW
    }

    override fun onDeactivated(reason: Int) {}
}`,

    'app/src/main/res/layout/activity_main.xml': `<?xml version="1.0" encoding="utf-8"?>
<Button xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/btnActivateNfc"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:backgroundTint="#0F172A"
    android:text="ACIONAR"
    android:textColor="#FFFFFF"
    android:textSize="22sp"
    android:textStyle="bold"
    android:gravity="center" />`,

    'app/src/main/res/xml/apduservice.xml': `<?xml version="1.0" encoding="utf-8"?>
<host-apdu-service xmlns:android="http://schemas.android.com/apk/res/android"
       android:description="@string/servicedesc"
       android:requireDeviceUnlock="false">
    <aid-group android:description="@string/aiddesc" android:category="other">
        <aid-filter android:name="F2222222222222"/>
    </aid-group>
</host-apdu-service>`,

    'app/src/main/res/values/strings.xml': `<resources>
    <string name="app_name">GKD Automação</string>
    <string name="servicedesc">GKD Service</string>
    <string name="aiddesc">GKD Lock AID</string>
</resources>`,

    'app/src/main/AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.NFC" />
    <uses-feature android:name="android.hardware.nfc.hce" android:required="true" />
    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:theme="@style/Theme.AppCompat.NoActionBar">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        <service android:name=".MyHCEService" android:exported="true" android:permission="android.permission.BIND_HOST_APDU_SERVICE">
            <intent-filter>
                <action android:name="android.nfc.cardemulation.action.HOST_APDU_SERVICE" />
            </intent-filter>
            <meta-data android:name="android.nfc.cardemulation.host_apdu_service" android:resource="@xml/apduservice" />
        </service>
    </application>
</manifest>`
  };

  const copyFileContent = (filename: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const downloadZip = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      for (const [path, content] of Object.entries(files)) {
        zip.file(path, content);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gkd-automacao-android.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 selection:bg-indigo-500">
      
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-200">GKD Automação</h1>
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
          <span>{doorOpen ? 'LIBERADO!' : isArmed ? 'ATIVO (AGUARDANDO...)' : 'ACIONAR'}</span>
        </button>

        {isArmed && (
          <button
            onClick={simulateLockRead}
            className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition animate-bounce"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>[Simular Acionamento]</span>
          </button>
        )}
      </div>

      {/* Settings Modal / Drawer */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Configurações & Código do APK</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1">
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-start gap-2 text-red-200 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>O ERRO ACONTECEU PORQUE FALTOU O `settings.gradle.kts` NA RAIZ!</strong>
                    <p className="mt-1 text-slate-300">O arquivo <code className="text-white font-mono">settings.gradle.kts</code> é obrigatório na raiz do repositório para o Gradle saber que existe o projeto <code className="text-white font-mono">:app</code>.</p>
                  </div>
                </div>
                <button
                  onClick={downloadZip}
                  disabled={isDownloading}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Gerando ZIP...' : 'Baixar ZIP Completo (Com o settings.gradle.kts)'}</span>
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Arquivos do Repositório:</h3>
                {Object.entries(files).map(([filename, content]) => (
                  <div key={filename} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-mono break-all ${filename === 'settings.gradle.kts' ? 'text-amber-300 font-bold' : 'text-indigo-300'}`}>{filename}</span>
                      <button
                        onClick={() => copyFileContent(filename, content)}
                        className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/30 flex items-center gap-1 shrink-0 transition"
                      >
                        {copiedFile === filename ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedFile === filename ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="w-full max-w-md text-center text-xs text-slate-600">
        GKD Automação
      </div>

    </div>
  );
}
