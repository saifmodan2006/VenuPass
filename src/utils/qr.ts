import { DenialReason, QrTokenPayload } from '../types';

const CLIENT_SALT = 'VENUPASS_CLIENT_SIGNATURE_KEY_V1';

/**
 * Generates a deterministic client-side integrity signature.
 * NOTE: This is a demo-grade client-side integrity mechanism for the hackathon prototype.
 * In production, secret signing must reside in a secure backend server.
 */
export function computeTokenSignature(payload: Omit<QrTokenPayload, 'signature'>): string {
  const raw = `${payload.version}:${payload.tokenId}:${payload.participantId}:${payload.eventId}:${payload.iat}:${payload.exp}:${CLIENT_SALT}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // Secondary pass for collision resistance
  let hash2 = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash2 = ((hash2 << 5) + hash2) + raw.charCodeAt(i);
    hash2 |= 0;
  }
  return `VP_SIG_${Math.abs(hash).toString(16)}_${Math.abs(hash2).toString(16)}`;
}

/**
 * Creates a structured QR token string for a participant.
 */
export function generateQrToken(
  participantId: string,
  eventId: string,
  validitySeconds: number = 7 * 24 * 3600
): { tokenString: string; payload: QrTokenPayload } {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + validitySeconds;
  const tokenId = `VP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const partialPayload: Omit<QrTokenPayload, 'signature'> = {
    version: 1,
    tokenId,
    participantId,
    eventId,
    iat,
    exp,
  };

  const signature = computeTokenSignature(partialPayload);
  const payload: QrTokenPayload = {
    ...partialPayload,
    signature,
  };

  const tokenString = JSON.stringify(payload);
  return { tokenString, payload };
}

/**
 * Creates an expired token for testing (TEST 9)
 */
export function generateExpiredToken(participantId: string, eventId: string): string {
  const iat = Math.floor(Date.now() / 1000) - 86400 * 2; // 2 days ago
  const exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
  const tokenId = `VP-EXP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const partial: Omit<QrTokenPayload, 'signature'> = {
    version: 1,
    tokenId,
    participantId,
    eventId,
    iat,
    exp,
  };

  const signature = computeTokenSignature(partial);
  return JSON.stringify({ ...partial, signature });
}

/**
 * Creates a tampered token with invalid signature for testing (TEST 8)
 */
export function generateTamperedToken(participantId: string, eventId: string): string {
  const { payload } = generateQrToken(participantId, eventId);
  // Modify participantId or signature to simulate tampering
  return JSON.stringify({
    ...payload,
    participantId: `${participantId}_TAMPERED`,
    signature: 'VP_SIG_INVALID_HASH_FAKED',
  });
}

/**
 * Parses and verifies a QR token against structure, expiration, eventId, and signature.
 */
export function verifyQrToken(
  rawToken: string,
  expectedEventId: string
): {
  valid: boolean;
  reason?: DenialReason;
  payload?: QrTokenPayload;
} {
  let parsed: any;
  try {
    parsed = JSON.parse(rawToken.trim());
  } catch {
    return { valid: false, reason: 'INVALID_QR_FORMAT' };
  }

  // Validate structural shape
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof parsed.version !== 'number' ||
    typeof parsed.tokenId !== 'string' ||
    typeof parsed.participantId !== 'string' ||
    typeof parsed.eventId !== 'string' ||
    typeof parsed.iat !== 'number' ||
    typeof parsed.exp !== 'number' ||
    typeof parsed.signature !== 'string'
  ) {
    return { valid: false, reason: 'INVALID_QR_FORMAT' };
  }

  const payload = parsed as QrTokenPayload;

  // Check event match
  if (payload.eventId !== expectedEventId) {
    return { valid: false, reason: 'QR_NOT_REGISTERED', payload };
  }

  // Check signature / integrity
  const expectedSig = computeTokenSignature({
    version: payload.version,
    tokenId: payload.tokenId,
    participantId: payload.participantId,
    eventId: payload.eventId,
    iat: payload.iat,
    exp: payload.exp,
  });

  if (payload.signature !== expectedSig) {
    return { valid: false, reason: 'INVALID_SIGNATURE', payload };
  }

  // Check expiration
  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp < nowSec) {
    return { valid: false, reason: 'QR_EXPIRED', payload };
  }

  return { valid: true, payload };
}
