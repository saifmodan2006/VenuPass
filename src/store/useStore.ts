import { create } from 'zustand';
import {
  AdminSession,
  EventConfig,
  Participant,
  ScanDirection,
  ScanLog,
  ScanProcessResult,
} from '../types';
import { generateToken } from '../services/qrService';
import { processScanPipeline } from '../services/scanService';
import {
  loadState,
  saveState,
  resetDemoDataState,
  clearAllDataState,
} from '../services/storageService';

interface AppState {
  // State
  event: EventConfig;
  participants: Participant[];
  logs: ScanLog[];
  adminSession: AdminSession;
  selectedGate: string;
  selectedDirection: ScanDirection;
  recentSuspiciousAlert: boolean;

  // Getters / Computed
  getCurrentCrowd: () => number;
  getOccupancyPercentage: () => number;
  getCapacityStatus: () => 'NORMAL' | 'BUSY' | 'NEAR_CAPACITY' | 'CAPACITY_REACHED';
  getKpis: () => {
    totalRegistered: number;
    qrGenerated: number;
    qrNotGenerated: number;
    currentlyInside: number;
    totalExited: number;
    allowedScans: number;
    deniedScans: number;
    invalidAttempts: number;
    duplicateAttempts: number;
    occupancyPercentage: number;
  };

  // Actions
  setGate: (gate: string) => void;
  setDirection: (direction: ScanDirection) => void;
  registerParticipant: (data: {
    name: string;
    participantId: string;
    department: string;
    category: string;
    semester?: string;
    phone: string;
    email?: string;
  }) => { success: boolean; error?: string; participant?: Participant };

  generateParticipantQr: (participantId: string) => { success: boolean; qrToken?: string };
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;

  // Master Scan Pipeline
  processScan: (tokenOrInput: string, gate?: string, direction?: ScanDirection) => ScanProcessResult;

  // Event & Emergency Actions
  updateEvent: (updates: Partial<EventConfig>) => void;
  setEmergencyMode: (active: boolean) => void;

  // Auth Actions
  loginAdmin: (username: string, pass: string) => boolean;
  logoutAdmin: () => void;

  // Reset & Persistence
  resetDemoData: () => void;
  clearAllData: () => void;
  dismissSuspiciousAlert: () => void;
}

const loaded = loadState();

export const useAppStore = create<AppState>((set, get) => ({
  event: loaded.event,
  participants: loaded.participants,
  logs: loaded.logs,
  adminSession: loaded.adminSession,
  selectedGate: loaded.event.gates[0] || 'Gate 1',
  selectedDirection: 'IN',
  recentSuspiciousAlert: false,

  // Single Source of Truth
  getCurrentCrowd: () => {
    return get().participants.filter((p) => p.state === 'INSIDE').length;
  },

  getOccupancyPercentage: () => {
    const crowd = get().getCurrentCrowd();
    const cap = get().event.maxCapacity || 1;
    return Math.min(100, Math.round((crowd / cap) * 1000) / 10);
  },

  getCapacityStatus: () => {
    const pct = get().getOccupancyPercentage();
    if (pct >= 100) return 'CAPACITY_REACHED';
    if (pct >= 90) return 'NEAR_CAPACITY';
    if (pct >= 70) return 'BUSY';
    return 'NORMAL';
  },

  getKpis: () => {
    const participants = get().participants;
    const logs = get().logs;
    const currentlyInside = participants.filter((p) => p.state === 'INSIDE').length;
    const cap = get().event.maxCapacity || 1;

    return {
      totalRegistered: participants.length,
      qrGenerated: participants.filter((p) => p.qrStatus === 'GENERATED').length,
      qrNotGenerated: participants.filter((p) => p.qrStatus === 'NOT_GENERATED').length,
      currentlyInside,
      totalExited: participants.filter((p) => p.state === 'EXITED').length,
      allowedScans: logs.filter((l) => l.result === 'ALLOWED').length,
      deniedScans: logs.filter((l) => l.result === 'DENIED').length,
      invalidAttempts: logs.filter((l) => l.result === 'DENIED' && l.reason !== 'DUPLICATE_ENTRY').length,
      duplicateAttempts: logs.filter((l) => l.reason === 'DUPLICATE_ENTRY').length,
      occupancyPercentage: Math.min(100, Math.round((currentlyInside / cap) * 1000) / 10),
    };
  },

  setGate: (gate) => set({ selectedGate: gate }),
  setDirection: (direction) => set({ selectedDirection: direction }),
  dismissSuspiciousAlert: () => set({ recentSuspiciousAlert: false }),

  registerParticipant: (data) => {
    const state = get();
    if (!state.event.registrationOpen) {
      return { success: false, error: 'Registration is currently closed for this event.' };
    }

    const cleanParticipantId = data.participantId.trim().toUpperCase();
    const existing = state.participants.find(
      (p) => p.participantId.toLowerCase() === cleanParticipantId.toLowerCase()
    );
    if (existing) {
      return {
        success: false,
        error: 'DUPLICATE_PARTICIPANT_ID',
        participant: existing,
      };
    }

    const { tokenString } = generateToken(cleanParticipantId, state.event.id);

    const newParticipant: Participant = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      participantId: cleanParticipantId,
      name: data.name.trim(),
      department: data.department.trim(),
      category: data.category.trim(),
      semester: data.semester?.trim() || 'N/A',
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      registeredAt: new Date().toISOString(),
      qrToken: tokenString,
      qrStatus: 'GENERATED',
      state: 'NOT_ENTERED',
      entryCount: 0,
      exitCount: 0,
      history: [],
    };

    const updatedParticipants = [newParticipant, ...state.participants];
    set({ participants: updatedParticipants });
    saveState({
      event: state.event,
      participants: updatedParticipants,
      logs: state.logs,
      adminSession: state.adminSession,
    });

    return { success: true, participant: newParticipant };
  },

  generateParticipantQr: (participantId) => {
    const state = get();
    const participant = state.participants.find((p) => p.participantId === participantId);
    if (!participant) return { success: false };

    const { tokenString } = generateToken(participant.participantId, state.event.id);
    const updatedParticipants = state.participants.map((p) =>
      p.participantId === participantId
        ? { ...p, qrToken: tokenString, qrStatus: 'GENERATED' as const }
        : p
    );

    set({ participants: updatedParticipants });
    saveState({
      event: state.event,
      participants: updatedParticipants,
      logs: state.logs,
      adminSession: state.adminSession,
    });

    return { success: true, qrToken: tokenString };
  },

  updateParticipant: (id, updates) => {
    const state = get();
    const updated = state.participants.map((p) => (p.id === id ? { ...p, ...updates } : p));
    set({ participants: updated });
    saveState({
      event: state.event,
      participants: updated,
      logs: state.logs,
      adminSession: state.adminSession,
    });
  },

  deleteParticipant: (id) => {
    const state = get();
    const updated = state.participants.filter((p) => p.id !== id);
    set({ participants: updated });
    saveState({
      event: state.event,
      participants: updated,
      logs: state.logs,
      adminSession: state.adminSession,
    });
  },

  processScan: (inputString, gateOverride, directionOverride) => {
    const state = get();
    const gate = gateOverride || state.selectedGate;
    const direction = directionOverride || state.selectedDirection;

    const { processResult, updatedParticipants, updatedLogs, isSuspiciousCluster } =
      processScanPipeline(
        inputString,
        gate,
        direction,
        state.event,
        state.participants,
        state.logs
      );

    set({
      participants: updatedParticipants,
      logs: updatedLogs,
      recentSuspiciousAlert: isSuspiciousCluster || state.recentSuspiciousAlert,
    });

    saveState({
      event: state.event,
      participants: updatedParticipants,
      logs: updatedLogs,
      adminSession: state.adminSession,
    });

    return processResult;
  },

  updateEvent: (updates) => {
    const state = get();
    const updated = { ...state.event, ...updates };
    set({ event: updated });
    saveState({
      event: updated,
      participants: state.participants,
      logs: state.logs,
      adminSession: state.adminSession,
    });
  },

  setEmergencyMode: (active) => {
    const state = get();
    const updated: EventConfig = {
      ...state.event,
      emergencyMode: active,
      emergencyActivatedAt: active ? new Date().toISOString() : undefined,
    };
    set({ event: updated });
    saveState({
      event: updated,
      participants: state.participants,
      logs: state.logs,
      adminSession: state.adminSession,
    });
  },

  loginAdmin: (username, pass) => {
    if (username.trim() === 'admin' && pass.trim() === 'venupass2026') {
      const session: AdminSession = {
        isAuthenticated: true,
        username: 'admin',
        loginTime: new Date().toISOString(),
      };
      set({ adminSession: session });
      const state = get();
      saveState({
        event: state.event,
        participants: state.participants,
        logs: state.logs,
        adminSession: session,
      });
      return true;
    }
    return false;
  },

  logoutAdmin: () => {
    const session: AdminSession = { isAuthenticated: false, username: '', loginTime: null };
    set({ adminSession: session });
    const state = get();
    saveState({
      event: state.event,
      participants: state.participants,
      logs: state.logs,
      adminSession: session,
    });
  },

  resetDemoData: () => {
    const fresh = resetDemoDataState();
    set({
      event: fresh.event,
      participants: fresh.participants,
      logs: fresh.logs,
      selectedGate: fresh.event.gates[0] || 'Gate 1',
      selectedDirection: 'IN',
      recentSuspiciousAlert: false,
    });
  },

  clearAllData: () => {
    const state = get();
    const fresh = clearAllDataState(state.event);
    set({
      event: fresh.event,
      participants: fresh.participants,
      logs: fresh.logs,
      recentSuspiciousAlert: false,
    });
  },
}));
