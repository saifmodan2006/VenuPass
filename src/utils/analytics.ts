import { EventConfig, Participant, ScanLog } from '../types';

export interface TimePointCrowd {
  timeLabel: string;
  crowd: number;
  inCount: number;
  outCount: number;
}

export interface GateTrafficStat {
  gate: string;
  allowed: number;
  denied: number;
  total: number;
}

export interface DeptAttendanceStat {
  department: string;
  registered: number;
  inside: number;
  exited: number;
}

export interface ResultDistribution {
  name: string;
  value: number;
  color: string;
}

export function computeCrowdOverTime(logs: ScanLog[]): TimePointCrowd[] {
  if (!logs.length) return [];

  // Sort logs chronologically
  const chronological = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const buckets: { [timeKey: string]: { inCount: number; outCount: number; crowd: number } } = {};
  let rollingCrowd = 0;

  chronological.forEach((log) => {
    const d = new Date(log.timestamp);
    const hours = d.getHours().toString().padStart(2, '0');
    // 15-minute or hourly buckets
    const minutes = (Math.floor(d.getMinutes() / 15) * 15).toString().padStart(2, '0');
    const key = `${hours}:${minutes}`;

    if (!buckets[key]) {
      buckets[key] = { inCount: 0, outCount: 0, crowd: 0 };
    }

    if (log.result === 'ALLOWED') {
      if (log.direction === 'IN') {
        rollingCrowd += 1;
        buckets[key].inCount += 1;
      } else if (log.direction === 'OUT') {
        rollingCrowd = Math.max(0, rollingCrowd - 1);
        buckets[key].outCount += 1;
      }
    }
    buckets[key].crowd = rollingCrowd;
  });

  return Object.entries(buckets).map(([timeLabel, data]) => ({
    timeLabel,
    crowd: data.crowd,
    inCount: data.inCount,
    outCount: data.outCount,
  }));
}

export function computeGateTraffic(logs: ScanLog[], configuredGates: string[]): GateTrafficStat[] {
  const map: { [gate: string]: { allowed: number; denied: number } } = {};

  configuredGates.forEach((g) => {
    map[g] = { allowed: 0, denied: 0 };
  });

  logs.forEach((log) => {
    if (!map[log.gate]) {
      map[log.gate] = { allowed: 0, denied: 0 };
    }
    if (log.result === 'ALLOWED') {
      map[log.gate].allowed += 1;
    } else {
      map[log.gate].denied += 1;
    }
  });

  return Object.entries(map).map(([gate, stats]) => ({
    gate: gate.replace(/\s*\(.*?\)\s*/g, ''), // clean short name for charts
    allowed: stats.allowed,
    denied: stats.denied,
    total: stats.allowed + stats.denied,
  }));
}

export function computeDepartmentAttendance(participants: Participant[]): DeptAttendanceStat[] {
  const map: { [dept: string]: { registered: number; inside: number; exited: number } } = {};

  participants.forEach((p) => {
    const dept = p.department || 'General';
    if (!map[dept]) {
      map[dept] = { registered: 0, inside: 0, exited: 0 };
    }
    map[dept].registered += 1;
    if (p.state === 'INSIDE') map[dept].inside += 1;
    if (p.state === 'EXITED') map[dept].exited += 1;
  });

  return Object.entries(map).map(([department, data]) => ({
    department,
    registered: data.registered,
    inside: data.inside,
    exited: data.exited,
  }));
}

export function computeScanResultDistribution(logs: ScanLog[]): ResultDistribution[] {
  const allowed = logs.filter((l) => l.result === 'ALLOWED').length;
  const duplicate = logs.filter((l) => l.reason === 'DUPLICATE_ENTRY').length;
  const invalid = logs.filter((l) => l.result === 'DENIED' && l.reason !== 'DUPLICATE_ENTRY').length;

  return [
    { name: 'Allowed Scans', value: allowed, color: '#22C55E' },
    { name: 'Duplicate Attempts', value: duplicate, color: '#F59E0B' },
    { name: 'Denied / Invalid', value: invalid, color: '#EF4444' },
  ];
}

/**
 * Trend-based crowd estimation (Bonus Section 64)
 */
export function computeCrowdPrediction(
  currentCrowd: number,
  maxCapacity: number,
  logs: ScanLog[]
): {
  currentCrowd: number;
  estimatedPeak: number;
  estimatedPeakTime: string;
  burnRateHourly: number;
} {
  const now = Date.now();
  const oneHourAgo = now - 3600 * 1000;
  const recentAllowedIn = logs.filter(
    (l) => l.result === 'ALLOWED' && l.direction === 'IN' && new Date(l.timestamp).getTime() >= oneHourAgo
  ).length;
  const recentAllowedOut = logs.filter(
    (l) => l.result === 'ALLOWED' && l.direction === 'OUT' && new Date(l.timestamp).getTime() >= oneHourAgo
  ).length;

  const netHourlyRate = recentAllowedIn - recentAllowedOut;
  // Project peak within reasonable bounds
  const projectedExtra = Math.max(10, netHourlyRate > 0 ? netHourlyRate * 1.5 : 15);
  const estimatedPeak = Math.min(maxCapacity, Math.round(currentCrowd + projectedExtra));

  // Projected peak time ~2 hours from now
  const peakDate = new Date(now + 2 * 3600 * 1000);
  const peakHour = peakDate.getHours();
  const ampm = peakHour >= 12 ? 'PM' : 'AM';
  const displayHour = peakHour % 12 || 12;
  const estimatedPeakTime = `${displayHour}:30 ${ampm}`;

  return {
    currentCrowd,
    estimatedPeak,
    estimatedPeakTime,
    burnRateHourly: netHourlyRate,
  };
}

/**
 * Deterministic automatic insights derived directly from actual state (Bonus Section 65)
 */
export function generateAutomaticInsights(
  participants: Participant[],
  logs: ScanLog[],
  event: EventConfig
): string[] {
  const insights: string[] = [];
  const currentCrowd = participants.filter((p) => p.state === 'INSIDE').length;
  const occupancyPct = Math.round((currentCrowd / (event.maxCapacity || 1)) * 100);

  // 1. Capacity insight
  if (occupancyPct >= 100) {
    insights.push(`Venue has reached 100% capacity (${currentCrowd}/${event.maxCapacity}). Automatic entry lock is active.`);
  } else if (occupancyPct >= 90) {
    insights.push(`Venue is nearing capacity at ${occupancyPct}% occupancy (${currentCrowd}/${event.maxCapacity} attendees).`);
  } else {
    insights.push(`Current venue occupancy is at ${occupancyPct}% (${currentCrowd}/${event.maxCapacity} participants inside).`);
  }

  // 2. Department attendance
  const deptStats = computeDepartmentAttendance(participants);
  if (deptStats.length) {
    const topDept = [...deptStats].sort((a, b) => b.inside - a.inside)[0];
    if (topDept && topDept.inside > 0) {
      insights.push(`Highest active attendance is from ${topDept.department} with ${topDept.inside} participants currently inside.`);
    }
  }

  // 3. Gate traffic
  const gateStats = computeGateTraffic(logs, event.gates);
  if (gateStats.length) {
    const busiestGate = [...gateStats].sort((a, b) => b.total - a.total)[0];
    if (busiestGate && busiestGate.total > 0) {
      const pct = Math.round((busiestGate.total / (logs.length || 1)) * 100);
      insights.push(`${busiestGate.gate} has processed the highest traffic (${busiestGate.total} scans, ${pct}% of total movements).`);
    }
  }

  // 4. Security & scan health
  const deniedCount = logs.filter((l) => l.result === 'DENIED').length;
  if (deniedCount > 0) {
    const deniedPct = Math.round((deniedCount / (logs.length || 1)) * 100);
    insights.push(`${deniedCount} scans (${deniedPct}%) were denied due to duplicates, expiration, or unauthorized credentials.`);
  }

  const suspiciousCount = logs.filter((l) => l.suspicious).length;
  if (suspiciousCount > 0) {
    insights.push(`Alert: ${suspiciousCount} scan attempts were flagged as suspicious rapid denial clusters.`);
  }

  return insights;
}
