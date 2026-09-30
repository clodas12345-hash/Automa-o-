export type DeviceType = 'lock' | 'gate' | 'light' | 'relay' | 'alarm';

export type IntegrationMethod = 'webhook' | 'tuya' | 'local_ip' | 'simulation';

export interface DeviceConfig {
  id: string;
  name: string;
  type: DeviceType;
  icon?: string;
  method: IntegrationMethod;
  
  // Webhook / HTTP URL config
  webhookUrl?: string;
  httpMethod?: 'GET' | 'POST';
  httpPayload?: string;
  
  // Tuya Cloud config
  tuyaClientId?: string;
  tuyaSecret?: string;
  tuyaDeviceId?: string;
  tuyaRegion?: 'us' | 'eu' | 'cn' | 'in';
  
  // Local IP config
  localIpUrl?: string;

  // Settings
  autoLockSeconds?: number; // e.g. 5 seconds for lock
  requireConfirmation?: boolean;
  securityPin?: string;
  
  // State
  status: 'locked' | 'unlocked' | 'open' | 'closed' | 'on' | 'off' | 'busy' | 'error';
  lastTriggered?: string;
}

export interface ActivityLog {
  id: string;
  deviceId: string;
  deviceName: string;
  action: string;
  timestamp: string;
  status: 'success' | 'error' | 'simulated';
  message?: string;
}
