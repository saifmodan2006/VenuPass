export type EventType =
  | 'Festival'
  | 'Conference'
  | 'Workshop'
  | 'Sports'
  | 'Cultural'
  | 'Academic'
  | 'Career'
  | 'Hackathon'
  | 'Other';

export interface EventConfig {
  id: string;
  name: string;
  type: EventType;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  maxCapacity: number;
  gates: string[];
  registrationOpen: boolean;
  scanCooldownSeconds: number; // default 5
  emergencyMode: boolean;
  emergencyActivatedAt?: string;
}

export type ParticipantState = 'NOT_ENTERED' | 'INSIDE' | 'EXITED';
export type QrStatus = 'GENERATED' | 'NOT_GENERATED';

export interface MovementRecord {
  id: string;
  direction: 'IN' | 'OUT';
  gate: string;
  timestamp: string;
  allowed: boolean;
  reason?: string;
}

export interface Participant {
  id: string;
  participantId: string;
  name: string;
  department: string;
  category: string;
  semester?: string;
  phone: string;
  email?: string;
  registeredAt: string;
  qrToken?: string;
  qrStatus: QrStatus;
  state: ParticipantState;
  entryCount: number;
  exitCount: number;
  history: MovementRecord[];
}

export interface QrTokenPayload {
  version: number;
  tokenId: string;
  participantId: string;
  eventId: string;
  iat: number;
  exp: number;
  signature: string;
}

export type ScanResult = 'ALLOWED' | 'DENIED';
export type ScanDirection = 'IN' | 'OUT';

export type DenialReason =
  | 'QR_NOT_REGISTERED'
  | 'INVALID_QR_FORMAT'
  | 'INVALID_SIGNATURE'
  | 'QR_EXPIRED'
  | 'PARTICIPANT_NOT_FOUND'
  | 'CAPACITY_REACHED'
  | 'EMERGENCY_MODE_ACTIVE'
  | 'SCAN_COOLDOWN'
  | 'DUPLICATE_ENTRY'
  | 'PARTICIPANT_NOT_INSIDE';

export interface ScanLog {
  id: string;
  timestamp: string;
  participantId: string;
  participantName: string;
  department: string;
  qrToken: string;
  gate: string;
  direction: ScanDirection;
  result: ScanResult;
  reason?: DenialReason | string;
  suspicious: boolean;
}

export interface AdminSession {
  isAuthenticated: boolean;
  username: string;
  loginTime: string | null;
}

export interface ScanProcessResult {
  success: boolean;
  result: ScanResult;
  verdictType: 'ENTRY_APPROVED' | 'EXIT_RECORDED' | 'DUPLICATE_ENTRY' | 'ENTRY_DENIED' | 'EXIT_DENIED' | 'EMERGENCY_BLOCKED';
  title: string;
  message: string;
  reason?: DenialReason | string;
  participant?: Participant;
  log: ScanLog;
  firstEntryInfo?: {
    gate: string;
    timestamp: string;
  };
}
