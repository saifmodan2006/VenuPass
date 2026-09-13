import {
  DenialReason,
  EventConfig,
  MovementRecord,
  Participant,
  ScanDirection,
  ScanLog,
  ScanProcessResult,
} from '../types';
import { verifyToken } from './qrService';

export function checkCapacity(currentCrowd: number, maxCapacity: number): boolean {
  return currentCrowd < maxCapacity;
}

export function checkCooldown(
  participantId: string,
  rawToken: string,
  logs: ScanLog[],
  cooldownSeconds: number
): boolean {
  if (cooldownSeconds <= 0) return true;
  const nowMs = Date.now();
  const cutoff = new Date(nowMs - cooldownSeconds * 1000).toISOString();
  const recentScan = logs.find(
    (l) =>
      (l.participantId.toLowerCase() === participantId.toLowerCase() || l.qrToken === rawToken) &&
      l.timestamp >= cutoff
  );
  return !recentScan;
}

export function processScanPipeline(
  inputString: string,
  gate: string,
  direction: ScanDirection,
  event: EventConfig,
  participants: Participant[],
  logs: ScanLog[]
): {
  processResult: ScanProcessResult;
  updatedParticipants: Participant[];
  updatedLogs: ScanLog[];
  isSuspiciousCluster: boolean;
} {
  const trimmed = inputString.trim();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  // Helper for denial response
  const makeDenied = (
    reason: DenialReason,
    title: string,
    message: string,
    targetParticipant?: Participant,
    firstEntryInfo?: { gate: string; timestamp: string }
  ) => {
    const sixtySecAgo = new Date(nowMs - 60000).toISOString();
    const recentDenied = logs.filter((l) => l.result === 'DENIED' && l.timestamp >= sixtySecAgo);
    const isSuspiciousCluster = recentDenied.length >= 2;

    const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const log: ScanLog = {
      id: logId,
      timestamp: nowIso,
      participantId: targetParticipant ? targetParticipant.participantId : (trimmed.startsWith('{') ? 'MALFORMED' : trimmed),
      participantName: targetParticipant ? targetParticipant.name : 'Unknown / Unverified',
      department: targetParticipant ? targetParticipant.department : 'N/A',
      qrToken: trimmed,
      gate,
      direction,
      result: 'DENIED',
      reason,
      suspicious: isSuspiciousCluster,
    };

    let newLogs = [log, ...logs];
    if (isSuspiciousCluster) {
      newLogs = newLogs.map((l) =>
        l.result === 'DENIED' && l.timestamp >= sixtySecAgo ? { ...l, suspicious: true } : l
      );
    }

    let newParticipants = participants;
    if (targetParticipant) {
      const mvt: MovementRecord = {
        id: `MVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        direction,
        gate,
        timestamp: nowIso,
        allowed: false,
        reason,
      };
      newParticipants = participants.map((p) =>
        p.id === targetParticipant.id ? { ...p, history: [mvt, ...p.history] } : p
      );
    }

    const processResult: ScanProcessResult = {
      success: false,
      result: 'DENIED',
      verdictType: direction === 'IN' ? 'ENTRY_DENIED' : 'EXIT_DENIED',
      title,
      message,
      reason,
      participant: targetParticipant,
      log,
      firstEntryInfo,
    };

    return {
      processResult,
      updatedParticipants: newParticipants,
      updatedLogs: newLogs,
      isSuspiciousCluster,
    };
  };

  // STEP 1: Decode & Resolve Input
  let rawToken = trimmed;
  let matchedParticipant: Participant | undefined = undefined;

  if (!trimmed.startsWith('{')) {
    const match = participants.find(
      (p) => p.participantId.toLowerCase() === trimmed.toLowerCase()
    );
    if (match) {
      matchedParticipant = match;
      if (match.qrStatus !== 'GENERATED' || !match.qrToken) {
        return makeDenied(
          'QR_NOT_REGISTERED',
          'Pass Not Activated',
          `Pass has not been activated or generated for participant ${match.participantId}.`,
          match
        );
      }
      rawToken = match.qrToken;
    } else {
      return makeDenied(
        'QR_NOT_REGISTERED',
        'Pass Not Found',
        `Unknown participant ID: "${trimmed}". No registration record exists for this event.`
      );
    }
  }

  // STEP 2: Verify Token integrity, format, expiry
  const verification = verifyToken(rawToken, event.id);
  if (!verification.valid) {
    const reason = verification.reason || 'INVALID_QR_FORMAT';
    if (reason === 'INVALID_SIGNATURE') {
      return makeDenied(
        'INVALID_SIGNATURE',
        'Tampered QR Code',
        'Digital signature verification failed. Token integrity compromise detected.'
      );
    }
    if (reason === 'QR_EXPIRED') {
      return makeDenied(
        'QR_EXPIRED',
        'QR Pass Expired',
        'This digital pass validity window has expired.'
      );
    }
    if (reason === 'QR_NOT_REGISTERED') {
      return makeDenied(
        'QR_NOT_REGISTERED',
        'Event Mismatch',
        'This QR token was issued for a different event.'
      );
    }
    return makeDenied(
      'INVALID_QR_FORMAT',
      'Invalid QR Format',
      'Unrecognized QR payload format.'
    );
  }

  const payload = verification.payload!;
  if (!matchedParticipant) {
    matchedParticipant = participants.find(
      (p) => p.participantId.toLowerCase() === payload.participantId.toLowerCase()
    );
  }

  if (!matchedParticipant) {
    return makeDenied(
      'PARTICIPANT_NOT_FOUND',
      'Participant Not Found',
      `No participant found with ID ${payload.participantId}.`
    );
  }

  // STEP 3: Emergency Check
  if (event.emergencyMode) {
    return makeDenied(
      'EMERGENCY_MODE_ACTIVE',
      'Emergency Mode Active',
      'Gate operations are frozen due to an active Emergency Headcount. All scans are temporarily locked.',
      matchedParticipant
    );
  }

  // STEP 4: Cooldown Check
  const cooldownSeconds = event.scanCooldownSeconds ?? 5;
  if (cooldownSeconds > 0) {
    const cooldownPass = checkCooldown(
      matchedParticipant.participantId,
      rawToken,
      logs,
      cooldownSeconds
    );
    if (!cooldownPass) {
      return makeDenied(
        'SCAN_COOLDOWN',
        'Scan Cooldown Active',
        `Please wait ${cooldownSeconds} seconds between scan attempts for the same pass.`,
        matchedParticipant
      );
    }
  }

  // STEP 5: IN vs OUT Logic
  if (direction === 'IN') {
    if (matchedParticipant.state === 'INSIDE') {
      const lastIn = matchedParticipant.history.find((h) => h.direction === 'IN' && h.allowed);
      const firstEntryInfo = lastIn
        ? { gate: lastIn.gate, timestamp: lastIn.timestamp }
        : { gate, timestamp: 'Previously today' };

      return makeDenied(
        'DUPLICATE_ENTRY',
        'Already Inside',
        `Participant ${matchedParticipant.name} is already inside the venue. Duplicate entry denied.`,
        matchedParticipant,
        firstEntryInfo
      );
    }

    const currentCrowd = participants.filter((p) => p.state === 'INSIDE').length;
    if (!checkCapacity(currentCrowd, event.maxCapacity)) {
      return makeDenied(
        'CAPACITY_REACHED',
        'Capacity Reached',
        `Venue capacity limit (${event.maxCapacity}) has been reached. New entries are blocked.`,
        matchedParticipant
      );
    }

    // ENTRY ALLOWED
    const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const log: ScanLog = {
      id: logId,
      timestamp: nowIso,
      participantId: matchedParticipant.participantId,
      participantName: matchedParticipant.name,
      department: matchedParticipant.department,
      qrToken: rawToken,
      gate,
      direction: 'IN',
      result: 'ALLOWED',
      suspicious: false,
    };

    const mvt: MovementRecord = {
      id: `MVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      direction: 'IN',
      gate,
      timestamp: nowIso,
      allowed: true,
    };

    const updatedParticipant: Participant = {
      ...matchedParticipant,
      state: 'INSIDE',
      entryCount: matchedParticipant.entryCount + 1,
      history: [mvt, ...matchedParticipant.history],
    };

    const newParticipants = participants.map((p) =>
      p.id === updatedParticipant.id ? updatedParticipant : p
    );
    const newLogs = [log, ...logs];

    return {
      processResult: {
        success: true,
        result: 'ALLOWED',
        verdictType: 'ENTRY_APPROVED',
        title: 'Entry Approved',
        message: `Access granted for ${matchedParticipant.name} at ${gate}.`,
        participant: updatedParticipant,
        log,
      },
      updatedParticipants: newParticipants,
      updatedLogs: newLogs,
      isSuspiciousCluster: false,
    };
  }

  if (direction === 'OUT') {
    if (matchedParticipant.state !== 'INSIDE') {
      return makeDenied(
        'PARTICIPANT_NOT_INSIDE',
        'Exit Denied',
        `Participant ${matchedParticipant.name} is not registered as currently inside the venue.`,
        matchedParticipant
      );
    }

    // EXIT ALLOWED
    const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const log: ScanLog = {
      id: logId,
      timestamp: nowIso,
      participantId: matchedParticipant.participantId,
      participantName: matchedParticipant.name,
      department: matchedParticipant.department,
      qrToken: rawToken,
      gate,
      direction: 'OUT',
      result: 'ALLOWED',
      suspicious: false,
    };

    const mvt: MovementRecord = {
      id: `MVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      direction: 'OUT',
      gate,
      timestamp: nowIso,
      allowed: true,
    };

    const updatedParticipant: Participant = {
      ...matchedParticipant,
      state: 'EXITED',
      exitCount: matchedParticipant.exitCount + 1,
      history: [mvt, ...matchedParticipant.history],
    };

    const newParticipants = participants.map((p) =>
      p.id === updatedParticipant.id ? updatedParticipant : p
    );
    const newLogs = [log, ...logs];

    return {
      processResult: {
        success: true,
        result: 'ALLOWED',
        verdictType: 'EXIT_RECORDED',
        title: 'Exit Recorded',
        message: `Exit logged for ${matchedParticipant.name} at ${gate}.`,
        participant: updatedParticipant,
        log,
      },
      updatedParticipants: newParticipants,
      updatedLogs: newLogs,
      isSuspiciousCluster: false,
    };
  }

  return makeDenied('INVALID_QR_FORMAT', 'Unknown Operation', 'Invalid scan command.');
}
