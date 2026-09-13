import { Participant, ScanLog } from '../types';

export function downloadCsvFile(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
  const escapeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAttendanceCSV(participants: Participant[]) {
  const headers = [
    'Participant ID',
    'Name',
    'Department',
    'Category',
    'Semester',
    'Phone',
    'Email',
    'QR Status',
    'Current State',
    'Entry Count',
    'Exit Count',
    'Registered At',
  ];
  const rows = participants.map((p) => [
    p.participantId,
    p.name,
    p.department,
    p.category,
    p.semester || 'N/A',
    p.phone,
    p.email || '',
    p.qrStatus,
    p.state,
    p.entryCount,
    p.exitCount,
    new Date(p.registeredAt).toLocaleString(),
  ]);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsvFile(`VenuPass-Attendance-Report-${dateStr}.csv`, headers, rows);
}

export function exportScanCSV(logs: ScanLog[]) {
  const headers = [
    'Log ID',
    'Timestamp',
    'Participant ID',
    'Name',
    'Department',
    'Gate',
    'Direction',
    'Result',
    'Reason',
    'Suspicious Flag',
  ];
  const rows = logs.map((l) => [
    l.id,
    new Date(l.timestamp).toLocaleString(),
    l.participantId,
    l.participantName,
    l.department,
    l.gate,
    l.direction,
    l.result,
    l.reason || 'N/A',
    l.suspicious ? 'YES' : 'NO',
  ]);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsvFile(`VenuPass-ScanLogs-Report-${dateStr}.csv`, headers, rows);
}

export function exportEmergencyHeadcountCSV(insideParticipants: Participant[]) {
  const headers = [
    'Participant ID',
    'Name',
    'Department',
    'Category',
    'Semester',
    'Phone',
    'Status Inside',
    'Last Gate Entry',
  ];
  const rows = insideParticipants.map((p) => {
    const lastIn = p.history.find((h) => h.direction === 'IN' && h.allowed);
    return [
      p.participantId,
      p.name,
      p.department,
      p.category,
      p.semester || 'N/A',
      p.phone,
      'VERIFIED INSIDE',
      lastIn ? `${lastIn.gate} (${new Date(lastIn.timestamp).toLocaleTimeString()})` : 'N/A',
    ];
  });
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  downloadCsvFile(`VenuPass-Emergency-Headcount-${dateStr}.csv`, headers, rows);
}
