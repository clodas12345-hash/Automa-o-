export type UidLength = 4 | 7;

export interface HceConfig {
  uidLength: UidLength;
  uidHex: string;
  aid: string;
  serviceDescription: string;
  includeNdef: boolean;
  ndefText: string;
  customApduUidCommand: string; // e.g. "FF CA 00 00 00"
}

export interface ApduLogEntry {
  id: string;
  timestamp: string;
  type: 'rx' | 'tx' | 'info' | 'error';
  commandName: string;
  apduHex: string;
  description: string;
}
