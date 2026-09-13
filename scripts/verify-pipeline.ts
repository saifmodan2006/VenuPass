import { generateToken, verifyToken, generateTamperedToken, generateExpiredToken } from '../src/services/qrService';
import { processScanPipeline } from '../src/services/scanService';
import { createInitialDemoData } from '../src/utils/demoData';
import { EventConfig, Participant, ScanLog } from '../src/types';

console.log('========================================================');
console.log('VENUPASS PIPELINE INTEGRITY & EDGE CASE VERIFICATION');
console.log('========================================================\n');

let failedTests = 0;
function assert(desc: string, condition: boolean, extra?: any) {
  if (condition) {
    console.log(`[PASS] ${desc}`);
  } else {
    console.error(`[FAIL] ${desc}`, extra ?? '');
    failedTests++;
  }
}

// 1. Setup base demo state
const demo = createInitialDemoData();
const config: EventConfig = { ...demo.event, maxCapacity: 50, scanCooldownSeconds: 0, emergencyMode: false };
let participants: Participant[] = [...demo.participants];
let logs: ScanLog[] = [...demo.logs];

// 2. QR Generation & Verification
const { tokenString, payload } = generateToken('STU9999', config.id);
assert('Generated token payload valid', payload.participantId === 'STU9999');
assert('Generated token string contains signature', tokenString.includes('SIG_'));

const validVerification = verifyToken(tokenString, config.id);
assert('Valid token verification succeeds', validVerification.valid === true);

// 3. Tampered Token
const tamperedToken = generateTamperedToken('STU9999', config.id);
const tamperedVerification = verifyToken(tamperedToken, config.id);
assert('Tampered token fails signature verification', tamperedVerification.valid === false && tamperedVerification.reason === 'INVALID_SIGNATURE');

// 4. Expired Token
const expiredToken = generateExpiredToken('STU9999', config.id);
const expiredVerification = verifyToken(expiredToken, config.id);
assert('Expired token fails expiry verification', expiredVerification.valid === false && expiredVerification.reason === 'QR_EXPIRED');

// Create test participant in NOT_ENTERED state
const testParticipant: Participant = {
  id: 'p-test-01',
  participantId: 'STU9999',
  name: 'Aarav Mehta',
  department: 'Computer Science',
  category: 'Student',
  semester: 'Sem 6',
  phone: '9876543210',
  email: 'aarav@example.com',
  registeredAt: new Date().toISOString(),
  qrToken: tokenString,
  qrStatus: 'GENERATED',
  state: 'NOT_ENTERED',
  entryCount: 0,
  exitCount: 0,
  history: []
};
participants.push(testParticipant);

// 5. Test Normal Entry
const entryRes = processScanPipeline(
  tokenString,
  'Gate 1 (Main Entrance)',
  'IN',
  config,
  participants,
  logs
);
assert('First entry approved', entryRes.processResult.success === true && entryRes.processResult.result === 'ALLOWED');
participants = entryRes.updatedParticipants;
logs = entryRes.updatedLogs;
const pAfterEntry = participants.find(p => p.participantId === 'STU9999');
assert('Participant state transitioned to INSIDE', pAfterEntry?.state === 'INSIDE');
assert('Entry count incremented to 1', pAfterEntry?.entryCount === 1);

// 6. Test Duplicate Entry (Already Inside)
const dupRes = processScanPipeline(
  tokenString,
  'Gate 1 (Main Entrance)',
  'IN',
  config,
  participants,
  logs
);
assert('Duplicate entry blocked', dupRes.processResult.success === false && dupRes.processResult.reason === 'DUPLICATE_ENTRY');

// 7. Test Valid Exit
const exitRes = processScanPipeline(
  tokenString,
  'Gate 2 (North Hall)',
  'OUT',
  config,
  participants,
  logs
);
assert('Exit approved for attendee currently INSIDE', exitRes.processResult.success === true && exitRes.processResult.result === 'ALLOWED');
participants = exitRes.updatedParticipants;
logs = exitRes.updatedLogs;
const pAfterExit = participants.find(p => p.participantId === 'STU9999');
assert('Participant state transitioned to EXITED', pAfterExit?.state === 'EXITED');
assert('Exit count incremented to 1', pAfterExit?.exitCount === 1);

// 8. Test Invalid Exit (when already EXITED)
const invalidExitRes = processScanPipeline(
  tokenString,
  'Gate 2 (North Hall)',
  'OUT',
  config,
  participants,
  logs
);
assert('Exit denied when not inside', invalidExitRes.processResult.success === false && invalidExitRes.processResult.reason === 'PARTICIPANT_NOT_INSIDE');

// 9. Test Re-entry (from EXITED back to INSIDE)
const reEntryRes = processScanPipeline(
  tokenString,
  'Gate 1 (Main Entrance)',
  'IN',
  config,
  participants,
  logs
);
assert('Re-entry approved', reEntryRes.processResult.success === true && reEntryRes.processResult.result === 'ALLOWED');
participants = reEntryRes.updatedParticipants;
logs = reEntryRes.updatedLogs;
const pAfterReEntry = participants.find(p => p.participantId === 'STU9999');
assert('Participant state transitioned back to INSIDE', pAfterReEntry?.state === 'INSIDE');
assert('Entry count incremented to 2', pAfterReEntry?.entryCount === 2);

// 10. Test Emergency Mode Freeze
const emergencyRes = processScanPipeline(
  tokenString,
  'Gate 1 (Main Entrance)',
  'IN',
  { ...config, emergencyMode: true },
  participants,
  logs
);
assert('Scan blocked under Emergency Mode', emergencyRes.processResult.success === false && emergencyRes.processResult.reason === 'EMERGENCY_MODE_ACTIVE');

// 11. Test Capacity Reached Check
// Count how many are currently INSIDE
const currentlyInside = participants.filter(p => p.state === 'INSIDE').length;
const cappedConfig = { ...config, maxCapacity: currentlyInside, scanCooldownSeconds: 0 };
const stranger = generateToken('STU8888', config.id);
const strangerParticipant: Participant = {
  id: 'p-stranger',
  participantId: 'STU8888',
  name: 'New Attendee',
  department: 'Design',
  category: 'Delegate',
  phone: '9999999999',
  registeredAt: new Date().toISOString(),
  qrToken: stranger.tokenString,
  qrStatus: 'GENERATED',
  state: 'NOT_ENTERED',
  entryCount: 0,
  exitCount: 0,
  history: []
};
participants.push(strangerParticipant);

const capacityRes = processScanPipeline(
  stranger.tokenString,
  'Gate 1 (Main Entrance)',
  'IN',
  cappedConfig,
  participants,
  logs
);
assert('Scan blocked when venue capacity is reached', capacityRes.processResult.success === false && capacityRes.processResult.reason === 'CAPACITY_REACHED');

// 12. Test Unknown QR
const unknownRes = processScanPipeline(
  'TOTALLY_UNKNOWN_TOKEN_OR_MANUAL_ID',
  'Gate 1 (Main Entrance)',
  'IN',
  config,
  participants,
  logs
);
assert('Unknown QR rejected with QR_NOT_REGISTERED', unknownRes.processResult.success === false && unknownRes.processResult.reason === 'QR_NOT_REGISTERED');

// 13. Test Cooldown
const cooldownConfig = { ...config, scanCooldownSeconds: 60 };
const cooldownRes = processScanPipeline(
  tokenString,
  'Gate 1 (Main Entrance)',
  'IN',
  cooldownConfig,
  participants,
  logs
);
assert('Rapid scan rejected with SCAN_COOLDOWN', cooldownRes.processResult.success === false && cooldownRes.processResult.reason === 'SCAN_COOLDOWN');

console.log(`\n========================================================`);
if (failedTests === 0) {
  console.log('SUCCESS: ALL 13 PIPELINE TESTS PASSED WITH 100% PRECISION!');
} else {
  console.error(`FAILED TESTS: ${failedTests}`);
  process.exit(1);
}
console.log('========================================================');
