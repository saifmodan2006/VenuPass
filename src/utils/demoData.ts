import { EventConfig, Participant, ScanLog } from '../types';
import { generateQrToken } from './qr';

export const INITIAL_EVENT_CONFIG: EventConfig = {
  id: 'EVENT-VP-2026-01',
  name: 'National Tech & Innovation Summit 2026',
  type: 'Hackathon',
  description: 'Annual inter-institutional technology, design & robotics convention with over 20+ participating universities.',
  date: '2026-09-12',
  startTime: '09:00',
  endTime: '21:00',
  venue: 'Innovation Dome & Convention Arena',
  maxCapacity: 150,
  gates: ['Gate 1 (Main Entrance)', 'Gate 2 (North Hall)', 'Gate 3 (South Pavilion)', 'VIP Gate'],
  registrationOpen: true,
  scanCooldownSeconds: 5,
  emergencyMode: false,
};

export function createInitialDemoData(): {
  event: EventConfig;
  participants: Participant[];
  logs: ScanLog[];
} {
  const event = { ...INITIAL_EVENT_CONFIG };

  const rawParticipants = [
    { id: 'p-1', participantId: 'STU1001', name: 'Aarav Sharma', department: 'Computer Science', category: 'Student', semester: 'Sem 6', phone: '9876543210', email: 'aarav@univ.edu' },
    { id: 'p-2', participantId: 'STU1002', name: 'Diya Sen', department: 'Information Technology', category: 'Student', semester: 'Sem 4', phone: '9823456781', email: 'diya@univ.edu' },
    { id: 'p-3', participantId: 'STU1003', name: 'Rohan Mehta', department: 'Data Science', category: 'Student', semester: 'Sem 6', phone: '9834567892', email: 'rohan@univ.edu' },
    { id: 'p-4', participantId: 'STU1004', name: 'Ananya Verma', department: 'Electronics & Comm', category: 'Student', semester: 'Sem 8', phone: '9845678903', email: 'ananya@univ.edu' },
    { id: 'p-5', participantId: 'STU1005', name: 'Kavya Nair', department: 'Design & Media', category: 'Delegate', semester: 'N/A', phone: '9856789014', email: 'kavya@designhub.io' },
    { id: 'p-6', participantId: 'STU1006', name: 'Vikram Joshi', department: 'Mechanical Eng', category: 'Student', semester: 'Sem 4', phone: '9867890125', email: 'vikram@univ.edu' },
    { id: 'p-7', participantId: 'STU1007', name: 'Sneha Rao', department: 'Civil Eng', category: 'Student', semester: 'Sem 6', phone: '9878901236', email: 'sneha@univ.edu' },
    { id: 'p-8', participantId: 'STU1008', name: 'Aditya Kulkarni', department: 'Computer Science', category: 'Student', semester: 'Sem 8', phone: '9889012347', email: 'aditya@univ.edu' },
    { id: 'p-9', participantId: 'STU1009', name: 'Pooja Iyer', department: 'Information Technology', category: 'Faculty', semester: 'N/A', phone: '9890123458', email: 'pooja.prof@univ.edu' },
    { id: 'p-10', participantId: 'STU1010', name: 'Arjun Das', department: 'Data Science', category: 'Speaker', semester: 'N/A', phone: '9801234569', email: 'arjun@techai.org' },
    { id: 'p-11', participantId: 'STU1011', name: 'Meera Chawla', department: 'Biotechnology', category: 'Delegate', semester: 'Sem 6', phone: '9811223344', email: 'meera@bio.ac.in' },
    { id: 'p-12', participantId: 'STU1012', name: 'Karan Singhania', department: 'Computer Science', category: 'Student', semester: 'Sem 2', phone: '9822334455', email: 'karan@univ.edu' },
    { id: 'p-13', participantId: 'STU1013', name: 'Tanvi Saxena', department: 'Electronics & Comm', category: 'Student', semester: 'Sem 4', phone: '9833445566', email: 'tanvi@univ.edu' },
    { id: 'p-14', participantId: 'STU1014', name: 'Nikhil Bansal', department: 'Mechanical Eng', category: 'Student', semester: 'Sem 6', phone: '9844556677', email: 'nikhil@univ.edu' },
    { id: 'p-15', participantId: 'STU1015', name: 'Isha Deshmukh', department: 'Design & Media', category: 'Student', semester: 'Sem 2', phone: '9855667788', email: 'isha@univ.edu' },
    // 5 participants without QR generated yet (QR Status: NOT_GENERATED)
    { id: 'p-16', participantId: 'STU1016', name: 'Siddharth Roy', department: 'Computer Science', category: 'Student', semester: 'Sem 4', phone: '9866778899', email: 'siddharth@univ.edu' },
    { id: 'p-17', participantId: 'STU1017', name: 'Priyanka Kapoor', department: 'Information Technology', category: 'Student', semester: 'Sem 6', phone: '9877889900', email: 'priyanka@univ.edu' },
    { id: 'p-18', participantId: 'STU1018', name: 'Gaurav Gill', department: 'Civil Eng', category: 'Student', semester: 'Sem 8', phone: '9888990011', email: 'gaurav@univ.edu' },
    { id: 'p-19', participantId: 'STU1019', name: 'Ritika Basu', department: 'Biotechnology', category: 'Delegate', semester: 'N/A', phone: '9899001122', email: 'ritika@biolab.org' },
    { id: 'p-20', participantId: 'STU1020', name: 'Manish Tiwari', department: 'Data Science', category: 'Student', semester: 'Sem 2', phone: '9800112233', email: 'manish@univ.edu' },
  ];

  const participants: Participant[] = [];
  const logs: ScanLog[] = [];

  const now = Date.now();
  const minutesAgo = (mins: number) => new Date(now - mins * 60 * 1000).toISOString();

  // Create 15 with QR generated, 5 without
  rawParticipants.forEach((raw, index) => {
    const hasQr = index < 15;
    let qrToken: string | undefined = undefined;

    if (hasQr) {
      const { tokenString } = generateQrToken(raw.participantId, event.id);
      qrToken = tokenString;
    }

    // Default state: NOT_ENTERED
    const participant: Participant = {
      ...raw,
      registeredAt: minutesAgo(180 + index * 4),
      qrToken,
      qrStatus: hasQr ? 'GENERATED' : 'NOT_GENERATED',
      state: 'NOT_ENTERED',
      entryCount: 0,
      exitCount: 0,
      history: [],
    };

    participants.push(participant);
  });

  // Helper to record a scan into both global logs and participant history
  const addScanRecord = (
    pId: string,
    timeIso: string,
    gate: string,
    direction: 'IN' | 'OUT',
    result: 'ALLOWED' | 'DENIED',
    reason?: string,
    suspicious = false
  ) => {
    const participant = participants.find((p) => p.participantId === pId);
    const pName = participant?.name || 'Unknown Participant';
    const pDept = participant?.department || 'N/A';
    const pToken = participant?.qrToken || `RAW_INVALID_${pId}`;

    const logId = `LOG-${logs.length + 1001}`;
    const log: ScanLog = {
      id: logId,
      timestamp: timeIso,
      participantId: pId,
      participantName: pName,
      department: pDept,
      qrToken: pToken,
      gate,
      direction,
      result,
      reason,
      suspicious,
    };
    logs.push(log);

    if (participant) {
      participant.history.push({
        id: `MVT-${participant.history.length + 1}`,
        direction,
        gate,
        timestamp: timeIso,
        allowed: result === 'ALLOWED',
        reason,
      });

      if (result === 'ALLOWED') {
        if (direction === 'IN') {
          participant.state = 'INSIDE';
          participant.entryCount += 1;
        } else if (direction === 'OUT') {
          participant.state = 'EXITED';
          participant.exitCount += 1;
        }
      }
    }
  };

  // Seed realistic historical operations
  // 1. Aarav (STU1001) - Entered Gate 1 90 mins ago -> INSIDE
  addScanRecord('STU1001', minutesAgo(90), 'Gate 1 (Main Entrance)', 'IN', 'ALLOWED');

  // 2. Diya (STU1002) - Entered Gate 2 85 mins ago -> INSIDE
  addScanRecord('STU1002', minutesAgo(85), 'Gate 2 (North Hall)', 'IN', 'ALLOWED');

  // 3. Rohan (STU1003) - Entered Gate 1 80 mins ago, Exited Gate 3 40 mins ago -> EXITED
  addScanRecord('STU1003', minutesAgo(80), 'Gate 1 (Main Entrance)', 'IN', 'ALLOWED');
  addScanRecord('STU1003', minutesAgo(40), 'Gate 3 (South Pavilion)', 'OUT', 'ALLOWED');

  // 4. Ananya (STU1004) - Entered Gate 2 75 mins ago, tried duplicate entry 70 mins ago, still INSIDE
  addScanRecord('STU1004', minutesAgo(75), 'Gate 2 (North Hall)', 'IN', 'ALLOWED');
  addScanRecord('STU1004', minutesAgo(70), 'Gate 2 (North Hall)', 'IN', 'DENIED', 'DUPLICATE_ENTRY');

  // 5. Kavya (STU1005) - VIP Gate entry 65 mins ago -> INSIDE
  addScanRecord('STU1005', minutesAgo(65), 'VIP Gate', 'IN', 'ALLOWED');

  // 6. Vikram (STU1006) - Entered 60 mins ago, exited 25 mins ago, re-entered 10 mins ago -> INSIDE (Re-entry test case demonstration)
  addScanRecord('STU1006', minutesAgo(60), 'Gate 1 (Main Entrance)', 'IN', 'ALLOWED');
  addScanRecord('STU1006', minutesAgo(25), 'Gate 1 (Main Entrance)', 'OUT', 'ALLOWED');
  addScanRecord('STU1006', minutesAgo(10), 'Gate 2 (North Hall)', 'IN', 'ALLOWED');

  // 7. Sneha (STU1007) - Entered 55 mins ago -> INSIDE
  addScanRecord('STU1007', minutesAgo(55), 'Gate 3 (South Pavilion)', 'IN', 'ALLOWED');

  // 8. Aditya (STU1008) - Entered 50 mins ago, Exited 20 mins ago -> EXITED
  addScanRecord('STU1008', minutesAgo(50), 'Gate 1 (Main Entrance)', 'IN', 'ALLOWED');
  addScanRecord('STU1008', minutesAgo(20), 'Gate 1 (Main Entrance)', 'OUT', 'ALLOWED');

  // 9. Pooja (STU1009) - VIP Gate entry 45 mins ago -> INSIDE
  addScanRecord('STU1009', minutesAgo(45), 'VIP Gate', 'IN', 'ALLOWED');

  // 10. Arjun (STU1010) - VIP Gate entry 35 mins ago -> INSIDE
  addScanRecord('STU1010', minutesAgo(35), 'VIP Gate', 'IN', 'ALLOWED');

  // 11. Meera (STU1011) - Entered 30 mins ago, Exited 5 mins ago -> EXITED
  addScanRecord('STU1011', minutesAgo(30), 'Gate 2 (North Hall)', 'IN', 'ALLOWED');
  addScanRecord('STU1011', minutesAgo(5), 'Gate 3 (South Pavilion)', 'OUT', 'ALLOWED');

  // 12. Karan (STU1012) - Entered 15 mins ago -> INSIDE
  addScanRecord('STU1012', minutesAgo(15), 'Gate 1 (Main Entrance)', 'IN', 'ALLOWED');

  // 13. Invalid scan attempt - non-registered participant
  addScanRecord('UNKNOWN_QR_99', minutesAgo(12), 'Gate 1 (Main Entrance)', 'IN', 'DENIED', 'QR_NOT_REGISTERED');

  // 14. Invalid exit attempt - Tanvi (STU1013) has not entered, but scanned OUT
  addScanRecord('STU1013', minutesAgo(8), 'Gate 3 (South Pavilion)', 'OUT', 'DENIED', 'PARTICIPANT_NOT_INSIDE');

  // 15. Invalid QR format attempt
  addScanRecord('MALFORMED_TOKEN_XYZ', minutesAgo(3), 'Gate 2 (North Hall)', 'IN', 'DENIED', 'INVALID_QR_FORMAT');

  // Sort logs by timestamp descending (newest first)
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { event, participants, logs };
}
