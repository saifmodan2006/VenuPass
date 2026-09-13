import { DenialReason, QrTokenPayload } from '../types';

const CLIENT_SALT = 'VENUPASS_EDITORIAL_INTEGRITY_KEY_2026';

/**
 * Computes deterministic client-side token integrity signature.
 * Prototype disclosure: This is demo-grade client-side tokenization.
 * A production deployment must sign tokens with asymmetric keys (e.g. Ed25519) on a secure backend.
 */
export function computeTokenSignature(payload: Omit<QrTokenPayload, 'signature'>): string {
  const raw = `${payload.version}|${payload.tokenId}|${payload.participantId}|${payload.eventId}|${payload.iat}|${payload.exp}|${CLIENT_SALT}`;
  let hash1 = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash1 ^= raw.charCodeAt(i);
    hash1 = Math.imul(hash1, 16777619);
  }
  let hash2 = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash2 = ((hash2 << 5) + hash2) + raw.charCodeAt(i);
    hash2 |= 0;
  }
  return `SIG_${Math.abs(hash1).toString(16)}_${Math.abs(hash2).toString(16)}`;
}

export function generateToken(
  participantId: string,
  eventId: string,
  validitySeconds: number = 7 * 24 * 3600
): { tokenString: string; payload: QrTokenPayload } {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + validitySeconds;
  const tokenId = `VP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const partial: Omit<QrTokenPayload, 'signature'> = {
    version: 1,
    tokenId,
    participantId: participantId.trim().toUpperCase(),
    eventId,
    iat,
    exp,
  };

  const signature = computeTokenSignature(partial);
  const payload: QrTokenPayload = { ...partial, signature };
  const tokenString = JSON.stringify(payload);
  return { tokenString, payload };
}

export function verifyToken(
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

  if (payload.eventId !== expectedEventId) {
    return { valid: false, reason: 'QR_NOT_REGISTERED', payload };
  }

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

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp < nowSec) {
    return { valid: false, reason: 'QR_EXPIRED', payload };
  }

  return { valid: true, payload };
}

export function createQRCodeValue(tokenString: string): string {
  return tokenString;
}

export function generateTamperedToken(participantId: string, eventId: string): string {
  const { payload } = generateToken(participantId, eventId);
  return JSON.stringify({
    ...payload,
    participantId: `${participantId}_ALTERED`,
    signature: 'SIG_FORGED_VALUE_0000',
  });
}

export function generateExpiredToken(participantId: string, eventId: string): string {
  const iat = Math.floor(Date.now() / 1000) - 86400 * 3;
  const exp = Math.floor(Date.now() / 1000) - 3600;
  const partial: Omit<QrTokenPayload, 'signature'> = {
    version: 1,
    tokenId: `VP-EXP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    participantId: participantId.trim().toUpperCase(),
    eventId,
    iat,
    exp,
  };
  const signature = computeTokenSignature(partial);
  return JSON.stringify({ ...partial, signature });
}
