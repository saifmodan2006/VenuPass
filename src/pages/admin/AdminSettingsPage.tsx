import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Trash2,
  Plus,
  X,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { EventConfig, EventType } from '../../types';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminSettingsPage: React.FC = () => {
  const { event, updateEvent, resetDemoData, clearAllData } = useAppStore();

  const [formState, setFormState] = useState<EventConfig>({ ...event });
  const [newGateName, setNewGateName] = useState('');
  const [saveMessage, setSaveMessage] = useState(false);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const eventTypes: EventType[] = [
    'Festival',
    'Conference',
    'Workshop',
    'Sports',
    'Cultural',
    'Academic',
    'Career',
    'Hackathon',
    'Other',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateEvent({
      name: formState.name.trim(),
      type: formState.type,
      description: formState.description.trim(),
      date: formState.date,
      startTime: formState.startTime,
      endTime: formState.endTime,
      venue: formState.venue.trim(),
      maxCapacity: Number(formState.maxCapacity) || 100,
      gates: formState.gates,
      scanCooldownSeconds: Number(formState.scanCooldownSeconds) || 5,
      registrationOpen: formState.registrationOpen,
    });

    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 3000);
  };

  const handleAddGate = () => {
    if (!newGateName.trim()) return;
    if (formState.gates.includes(newGateName.trim())) return;
    setFormState((prev) => ({
      ...prev,
      gates: [...prev.gates, newGateName.trim()],
    }));
    setNewGateName('');
  };

  const handleRemoveGate = (gate: string) => {
    if (formState.gates.length <= 1) return;
    setFormState((prev) => ({
      ...prev,
      gates: prev.gates.filter((g) => g !== gate),
    }));
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setConfirmResetOpen(false);
    window.location.reload();
  };

  const handleConfirmClear = () => {
    clearAllData();
    setConfirmClearOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl text-left">
      {/* Title */}
      <div>
        <h1 className="font-heading text-xl font-bold text-[#161616]">
          Event & Platform Parameters
        </h1>
        <p className="text-xs text-[#6F6F6A]">
          Configure event branding, capacity constraints, gate topology, and scan cooldown windows.
        </p>
      </div>

      {saveMessage && (
        <div className="p-3.5 rounded-card bg-[#EBF7F0] border border-[#16794C]/30 text-[#16794C] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Parameters saved successfully. All operational consoles reflect the updates.</span>
        </div>
      )}

      {/* Main Settings Form (Section 41) */}
      <form onSubmit={handleSave} className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-6 shadow-subtle space-y-5">
        <h3 className="font-heading text-xs font-bold text-[#161616] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#DDDCD6] pb-3">
          <Settings className="w-4 h-4 text-[#E86A00]" />
          Event Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
              Event Name <span className="text-[#C43D3D]">*</span>
            </label>
            <input
              type="text"
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
              Event Type
            </label>
            <select
              value={formState.type}
              onChange={(e) => setFormState({ ...formState, type: e.target.value as EventType })}
              className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
            >
              {eventTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={formState.description}
            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
            className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              value={formState.date}
              onChange={(e) => setFormState({ ...formState, date: e.target.value })}
              className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={formState.startTime}
              onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
              className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
              End Time
            </label>
            <input
              type="time"
              value={formState.endTime}
              onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
              className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
              Venue Location
            </label>
            <input
              type="text"
              value={formState.venue}
              onChange={(e) => setFormState({ ...formState, venue: e.target.value })}
              className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
              Maximum Venue Capacity (Persons)
            </label>
            <input
              type="number"
              min={1}
              value={formState.maxCapacity}
              onChange={(e) => setFormState({ ...formState, maxCapacity: Number(e.target.value) })}
              className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-[#DDDCD6]">
          <div>
            <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
              Scan Cooldown Window (Seconds)
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={formState.scanCooldownSeconds}
              onChange={(e) =>
                setFormState({ ...formState, scanCooldownSeconds: Number(e.target.value) })
              }
              className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
            />
            <span className="text-[10px] text-[#6F6F6A] mt-1 block">
              Blocks rapid accidental re-scans of the same pass.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
              Registration Portal Status
            </label>
            <div className="mt-1.5">
              <button
                type="button"
                onClick={() => setFormState({ ...formState, registrationOpen: !formState.registrationOpen })}
                className={`px-3.5 py-1.5 rounded-btn text-xs font-bold transition-all ${
                  formState.registrationOpen
                    ? 'bg-[#EBF7F0] text-[#16794C] border border-[#16794C]/30'
                    : 'bg-[#FDF0F0] text-[#C43D3D] border border-[#C43D3D]/30'
                }`}
              >
                {formState.registrationOpen ? 'REGISTRATION OPEN' : 'REGISTRATION CLOSED'}
              </button>
            </div>
          </div>
        </div>

        {/* Configured Gates */}
        <div className="pt-3 border-t border-[#DDDCD6]">
          <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-2">
            Configured Access Gates ({formState.gates.length})
          </label>

          <div className="flex flex-wrap gap-2 mb-2.5">
            {formState.gates.map((g) => (
              <div
                key={g}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-btn bg-[#F5F4F0] border border-[#DDDCD6] text-xs text-[#161616]"
              >
                <span>{g}</span>
                {formState.gates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGate(g)}
                    className="text-[#6F6F6A] hover:text-[#C43D3D]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-xs">
            <input
              type="text"
              value={newGateName}
              onChange={(e) => setNewGateName(e.target.value)}
              placeholder="e.g. West Pavilion Gate"
              className="flex-1 rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
            />
            <button
              type="button"
              onClick={handleAddGate}
              className="px-3 py-1.5 rounded-btn bg-[#F0EFEA] hover:bg-[#EAE8E1] text-[#161616] text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-[#DDDCD6] flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-btn bg-[#E86A00] hover:bg-[#B94D00] text-white font-semibold text-xs shadow-subtle flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Parameters
          </button>
        </div>
      </form>

      {/* Demo & Data Management (Section 43) */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle space-y-3">
        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#161616]">
          Data Maintenance & Test Presets
        </h3>
        <p className="text-xs text-[#6F6F6A]">
          Restore the verified 20-participant dataset or purge records for a fresh deployment test.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="px-3.5 py-2 rounded-btn bg-[#F0EFEA] hover:bg-[#EAE8E1] text-[#161616] font-semibold text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#E86A00]" />
            Reset Demo Data
          </button>

          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="px-3.5 py-2 rounded-btn bg-[#FDF0F0] hover:bg-[#FCE8E8] text-[#C43D3D] border border-[#C43D3D]/30 font-semibold text-xs flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All Data
          </button>
        </div>
      </div>

      {/* Security Transparency Note (Section 54) */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-4 text-xs text-[#6F6F6A] space-y-1.5 shadow-subtle">
        <div className="flex items-center gap-1.5 text-[#161616] font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#16794C]" />
          <span>Security Architecture & Production Deployment Disclosure</span>
        </div>
        <p className="leading-relaxed">
          The prototype demonstrates tokenized QR integrity and access-control logic. A production deployment should move authentication, authorization, participant records, QR signing, verification, and audit logs to a secure backend.
        </p>
      </div>

      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Reset Demo Dataset?"
        message="This will reseed 20 participants, active passes, multi-gate historical logs, and default event parameters."
        confirmText="Reset Demo Data"
        variant="warning"
        onConfirm={handleConfirmReset}
        onCancel={() => setConfirmResetOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Purge All Data?"
        message="This will delete all registered participants and scan records from localStorage."
        confirmText="Clear All Data"
        variant="danger"
        onConfirm={handleConfirmClear}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
