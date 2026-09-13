import { EventConfig, Participant, ScanLog } from '../types';

export function getCurrentCrowd(participants: Participant[]): number {
  return participants.filter((p) => p.state === 'INSIDE').length;
}

export function getOccupancy(currentCrowd: number, maxCapacity: number): number {
  const cap = maxCapacity || 1;
  return Math.min(100, Math.round((currentCrowd / cap) * 1000) / 10);
}

export function getDepartmentStats(participants: Participant[]) {
  const map: { [dept: string]: { registered: number; inside: number; exited: number } } = {};
  participants.forEach((p) => {
    const d = p.department || 'General';
    if (!map[d]) map[d] = { registered: 0, inside: 0, exited: 0 };
    map[d].registered += 1;
    if (p.state === 'INSIDE') map[d].inside += 1;
    if (p.state === 'EXITED') map[d].exited += 1;
  });
  return Object.entries(map).map(([department, data]) => ({
    department,
    registered: data.registered,
    inside: data.inside,
    exited: data.exited,
  }));
}

export function getGateStats(logs: ScanLog[], gates: string[]) {
  const map: { [gate: string]: { allowed: number; denied: number } } = {};
  gates.forEach((g) => {
    map[g] = { allowed: 0, denied: 0 };
  });
  logs.forEach((l) => {
    if (!map[l.gate]) map[l.gate] = { allowed: 0, denied: 0 };
    if (l.result === 'ALLOWED') map[l.gate].allowed += 1;
    else map[l.gate].denied += 1;
  });
  return Object.entries(map).map(([gate, stat]) => ({
    gate: gate.replace(/\s*\(.*?\)\s*/g, ''),
    allowed: stat.allowed,
    denied: stat.denied,
    total: stat.allowed + stat.denied,
  }));
}

export function getCrowdTrend(logs: ScanLog[]) {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const buckets: { [key: string]: { crowd: number; inCount: number; outCount: number } } = {};
  let rolling = 0;

  sorted.forEach((l) => {
    const d = new Date(l.timestamp);
    const key = `${d.getHours().toString().padStart(2, '0')}:${(Math.floor(d.getMinutes() / 15) * 15).toString().padStart(2, '0')}`;
    if (!buckets[key]) buckets[key] = { crowd: 0, inCount: 0, outCount: 0 };
    if (l.result === 'ALLOWED') {
      if (l.direction === 'IN') {
        rolling += 1;
        buckets[key].inCount += 1;
      } else if (l.direction === 'OUT') {
        rolling = Math.max(0, rolling - 1);
        buckets[key].outCount += 1;
      }
    }
    buckets[key].crowd = rolling;
  });

  return Object.entries(buckets).map(([timeLabel, val]) => ({
    timeLabel,
    crowd: val.crowd,
    inCount: val.inCount,
    outCount: val.outCount,
  }));
}

export function getScanStats(logs: ScanLog[]) {
  const allowed = logs.filter((l) => l.result === 'ALLOWED').length;
  const duplicate = logs.filter((l) => l.reason === 'DUPLICATE_ENTRY').length;
  const invalid = logs.filter((l) => l.result === 'DENIED' && l.reason !== 'DUPLICATE_ENTRY').length;
  return [
    { name: 'Allowed Scans', value: allowed, color: '#16794C' },
    { name: 'Duplicate Attempts', value: duplicate, color: '#A96500' },
    { name: 'Denied / Invalid', value: invalid, color: '#C43D3D' },
  ];
}
