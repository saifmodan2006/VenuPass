import { AdminSession, EventConfig, Participant, ScanLog } from '../types';
import { createInitialDemoData } from '../utils/demoData';

export const STORAGE_KEY = 'venupass:v1';

export interface PersistedData {
  event: EventConfig;
  participants: Participant[];
  logs: ScanLog[];
  adminSession: AdminSession;
}

export function loadState(): PersistedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.event && Array.isArray(parsed.participants) && Array.isArray(parsed.logs)) {
        return {
          event: parsed.event,
          participants: parsed.participants,
          logs: parsed.logs,
          adminSession: parsed.adminSession || { isAuthenticated: false, username: '', loginTime: null },
        };
      }
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
  }

  const initial = createInitialDemoData();
  const session: AdminSession = { isAuthenticated: false, username: '', loginTime: null };
  const fallbackState: PersistedData = {
    event: initial.event,
    participants: initial.participants,
    logs: initial.logs,
    adminSession: session,
  };

  saveState(fallbackState);
  return fallbackState;
}

export function saveState(data: PersistedData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function resetDemoDataState(): PersistedData {
  const initial = createInitialDemoData();
  const fresh: PersistedData = {
    event: initial.event,
    participants: initial.participants,
    logs: initial.logs,
    adminSession: { isAuthenticated: false, username: '', loginTime: null },
  };
  saveState(fresh);
  return fresh;
}

export function clearAllDataState(currentEvent: EventConfig): PersistedData {
  const fresh: PersistedData = {
    event: {
      ...currentEvent,
      emergencyMode: false,
      emergencyActivatedAt: undefined,
    },
    participants: [],
    logs: [],
    adminSession: { isAuthenticated: false, username: '', loginTime: null },
  };
  saveState(fresh);
  return fresh;
}
