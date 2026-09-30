import { DeviceConfig, ActivityLog } from '../types';

const STORAGE_KEY = 'gkd_devices_config_v1';
const LOGS_KEY = 'gkd_activity_logs_v1';

export const DEFAULT_DEVICES: DeviceConfig[] = [
  {
    id: 'elg-lock-1',
    name: 'Fechadura ELG SHFD701',
    type: 'lock',
    method: 'tuya',
    tuyaClientId: 'x9a3j37a75mue8vgfew5',
    tuyaSecret: '7de32ae5608146759c4fd57f09eed534',
    tuyaDeviceId: 'ebaf6f98071b7daa62ahka',
    tuyaRegion: 'us',
    autoLockSeconds: 5,
    requireConfirmation: false,
    status: 'locked',
    lastTriggered: undefined,
  },
  {
    id: 'gate-1',
    name: 'Portão Principal GKD',
    type: 'gate',
    method: 'simulation',
    autoLockSeconds: 8,
    requireConfirmation: true,
    status: 'closed',
    lastTriggered: undefined,
  },
  {
    id: 'light-1',
    name: 'Iluminação Externa',
    type: 'light',
    method: 'simulation',
    status: 'off',
    lastTriggered: undefined,
  }
];

export function loadDevices(): DeviceConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DeviceConfig[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Guarantee user's Tuya credentials and deviceId are populated on ELG lock
        return parsed.map((d) => {
          if (d.id === 'elg-lock-1' || d.name.toLowerCase().includes('elg')) {
            return {
              ...d,
              method: 'tuya',
              tuyaClientId: d.tuyaClientId || 'x9a3j37a75mue8vgfew5',
              tuyaSecret: d.tuyaSecret || '7de32ae5608146759c4fd57f09eed534',
              tuyaDeviceId: d.tuyaDeviceId || 'ebaf6f98071b7daa62ahka',
            };
          }
          return d;
        });
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar dispositivos do localStorage', err);
  }
  return DEFAULT_DEVICES;
}

export function saveDevices(devices: DeviceConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  } catch (err) {
    console.error('Erro ao salvar dispositivos no localStorage', err);
  }
}

export function loadLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
  try {
    const logs = loadLogs();
    const newLog: ActivityLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    const updated = [newLog, ...logs].slice(0, 50); // Keep last 50
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export async function triggerDevice(
  device: DeviceConfig,
  customAction?: 'unlock' | 'lock' | 'toggle'
): Promise<{ success: boolean; message: string }> {
  // Tactile feedback on mobile
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([40, 60, 80]);
    } catch {
      // ignore
    }
  }

  // 1. Webhook / URL direta (Gatilho Alexa, Make, IFTTT, etc.)
  if (device.method === 'webhook' && device.webhookUrl) {
    try {
      const method = device.httpMethod || 'GET';
      const options: RequestInit = {
        method,
        mode: 'no-cors', // Permitir disparo para endpoints que não tem CORS liberado
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST' && device.httpPayload) {
        options.body = device.httpPayload;
      }

      await fetch(device.webhookUrl, options);
      addLog({
        deviceId: device.id,
        deviceName: device.name,
        action: customAction || 'Acionamento Webhook',
        status: 'success',
        message: 'Comando enviado com sucesso para a URL configurada!',
      });
      return { success: true, message: 'Comando enviado com sucesso!' };
    } catch (error: any) {
      addLog({
        deviceId: device.id,
        deviceName: device.name,
        action: customAction || 'Acionamento Webhook',
        status: 'error',
        message: error?.message || 'Falha ao conectar na URL',
      });
      return { success: false, message: `Erro ao disparar: ${error?.message || 'Erro de rede'}` };
    }
  }

  // 2. IP Local (ESP32, Tasmota, Shelly)
  if (device.method === 'local_ip' && device.localIpUrl) {
    try {
      await fetch(device.localIpUrl, { mode: 'no-cors' });
      addLog({
        deviceId: device.id,
        deviceName: device.name,
        action: 'Acionamento IP Local',
        status: 'success',
        message: `Comando enviado para ${device.localIpUrl}`,
      });
      return { success: true, message: 'Comando local enviado com sucesso!' };
    } catch (err: any) {
      addLog({
        deviceId: device.id,
        deviceName: device.name,
        action: 'Acionamento IP Local',
        status: 'error',
        message: err?.message || 'Erro de rede local',
      });
      return { success: false, message: 'Erro ao conectar no IP local' };
    }
  }

  // 3. Tuya Cloud
  if (device.method === 'tuya') {
    const deviceId = device.tuyaDeviceId || 'elg-lock';
    try {
      const response = await fetch('/api/tuya/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: deviceId,
          clientId: device.tuyaClientId || 'x9a3j37a75mue8vgfew5',
          secret: device.tuyaSecret || '7de32ae5608146759c4fd57f09eed534',
          command: customAction || 'unlock',
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        addLog({
          deviceId: device.id,
          deviceName: device.name,
          action: 'Destrancamento Tuya Cloud',
          status: 'success',
          message: 'Comando enviado com sucesso para a fechadura!',
        });
        return { success: true, message: 'Fechadura destrancada com sucesso!' };
      } else {
        addLog({
          deviceId: device.id,
          deviceName: device.name,
          action: 'Disparo Tuya Cloud',
          status: 'error',
          message: resData.error || resData.msg || 'Erro na resposta da Tuya',
        });
        return { success: false, message: resData.error || resData.msg || 'Erro na nuvem Tuya' };
      }
    } catch (err: any) {
      addLog({
        deviceId: device.id,
        deviceName: device.name,
        action: 'Disparo Tuya Cloud',
        status: 'error',
        message: err?.message || 'Erro de comunicação com o servidor',
      });
      return { success: false, message: 'Erro ao comunicar com o servidor' };
    }
  }

  // 4. Modo Simulação / Teste
  addLog({
    deviceId: device.id,
    deviceName: device.name,
    action: customAction || 'Teste de Acionamento',
    status: 'simulated',
    message: 'Acionamento de teste realizado no aplicativo.',
  });
  return { success: true, message: 'Acionado em modo teste com sucesso!' };
}
