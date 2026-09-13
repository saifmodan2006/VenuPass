import React, { useState } from 'react';
import {
  AlertOctagon,
  Users,
  CheckCircle2,
  Download,
  Phone,
  Search,
  CheckSquare,
  Square,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { exportEmergencyHeadcountCSV } from '../../services/reportService';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminEmergencyPage: React.FC = () => {
  const { event, participants, setEmergencyMode } = useAppStore();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'ACTIVATE' | 'DEACTIVATE'>('ACTIVATE');
  const [searchTerm, setSearchTerm] = useState('');
  const [accountedMap, setAccountedMap] = useState<{ [id: string]: boolean }>({});

  const insideParticipants = participants.filter((p) => p.state === 'INSIDE');

  // Department breakdown
  const deptMap: { [dept: string]: number } = {};
  insideParticipants.forEach((p) => {
    deptMap[p.department] = (deptMap[p.department] || 0) + 1;
  });

  const filteredInside = insideParticipants.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.participantId.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q)
    );
  });

  const handleToggleAccounted = (pId: string) => {
    setAccountedMap((prev) => ({
      ...prev,
      [pId]: !prev[pId],
    }));
  };

  const accountedCount = insideParticipants.filter((p) => accountedMap[p.participantId]).length;

  const handleConfirmAction = () => {
    if (pendingAction === 'ACTIVATE') {
      setEmergencyMode(true);
    } else {
      setEmergencyMode(false);
    }
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Institutional Safety Header */}
      <div className="flex items-center justify-between border-b border-[#DDDCD6] pb-3">
        <div className="flex items-center gap-3">
          <img src="/silver_oak_logo.png" alt="Silver Oak University" className="h-8 object-contain" />
          <div className="h-5 w-px bg-[#DDDCD6] hidden sm:block" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6F6F6A] hidden sm:inline">
            Campus Safety & Emergency Operations Division
          </span>
        </div>
      </div>

      {/* Header & Status Banner (Section 40) */}
      <div
        className={`rounded-card border p-5 shadow-subtle ${
          event.emergencyMode
            ? 'border-[#C43D3D] bg-[#FDF0F0]'
            : 'border-[#DDDCD6] bg-[#FFFFFF]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-btn flex-shrink-0 ${
                event.emergencyMode
                  ? 'bg-[#C43D3D] text-[#FFFFFF]'
                  : 'bg-[#F0EFEA] text-[#6F6F6A]'
              }`}
            >
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    event.emergencyMode
                      ? 'bg-[#C43D3D] text-white'
                      : 'bg-[#F0EFEA] text-[#6F6F6A]'
                  }`}
                >
                  {event.emergencyMode ? 'EMERGENCY MODE ACTIVE' : 'STANDBY MODE'}
                </span>
                {event.emergencyActivatedAt && event.emergencyMode && (
                  <span className="text-xs text-[#C43D3D] font-mono font-semibold">
                    Locked at {new Date(event.emergencyActivatedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <h1 className="font-heading text-xl font-bold text-[#161616]">
                Emergency Headcount & Gate Freeze
              </h1>
              <p className="text-xs text-[#6F6F6A] mt-1 max-w-xl leading-relaxed">
                {event.emergencyMode
                  ? 'All gate scanners are locked. State modifications are prevented. Proceed with verified physical headcount and roll-call checklist.'
                  : 'Instantly locks all gate scanning points to perform a verified physical safety headcount.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {event.emergencyMode ? (
              <button
                type="button"
                onClick={() => {
                  setPendingAction('DEACTIVATE');
                  setConfirmOpen(true);
                }}
                className="px-4 py-2 rounded-btn bg-[#161616] hover:bg-[#2A2D30] text-white font-bold text-xs shadow-subtle transition-colors"
              >
                Exit Emergency Mode
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPendingAction('ACTIVATE');
                  setConfirmOpen(true);
                }}
                className="px-4 py-2 rounded-btn bg-[#C43D3D] hover:bg-[#A93333] text-white font-bold text-xs shadow-subtle transition-all flex items-center gap-1.5"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                Activate Emergency Headcount
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verified Inside Headcount (Section 40) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle">
          <span className="text-[10px] font-bold text-[#C43D3D] uppercase tracking-wider block mb-1">
            VERIFIED INSIDE VENUE
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-5xl font-bold text-[#161616]">
              {insideParticipants.length}
            </span>
            <span className="text-xs text-[#6F6F6A]">attendees accounted</span>
          </div>
          <span className="text-[11px] text-[#6F6F6A] block mt-2">
            Derived directly from participant state (state === INSIDE)
          </span>
        </div>

        <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle">
          <span className="text-[10px] font-bold text-[#16794C] uppercase tracking-wider block mb-1">
            ACCOUNTED ON ROLL-CALL
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-5xl font-bold text-[#16794C]">
              {accountedCount}
            </span>
            <span className="text-xs text-[#6F6F6A]">/ {insideParticipants.length}</span>
          </div>
          <span className="text-[11px] text-[#6F6F6A] block mt-2">
            Physically verified by safety personnel
          </span>
        </div>

        <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#2864A8] uppercase tracking-wider block mb-1">
              EMERGENCY MANIFEST
            </span>
            <p className="text-xs text-[#6F6F6A] leading-relaxed">
              Export verified list of attendees currently inside with emergency phone numbers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportEmergencyHeadcountCSV(insideParticipants)}
            className="mt-3 w-full py-2 rounded-btn bg-[#F0EFEA] hover:bg-[#EAE8E1] text-[#161616] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#16794C]" />
            Download Emergency Manifest CSV
          </button>
        </div>
      </div>

      {/* Department Breakdown (Section 40) */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle">
        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#161616] mb-3 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#E86A00]" />
          Department Breakdown (Verified Inside)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {Object.entries(deptMap).map(([dept, count]) => (
            <div
              key={dept}
              className="p-3 rounded-btn bg-[#F5F4F0] border border-[#DDDCD6] flex items-center justify-between"
            >
              <span className="text-xs text-[#161616] truncate mr-2 font-medium">{dept}</span>
              <span className="font-mono text-sm font-bold text-[#161616] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#DDDCD6]">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Roll-Call Manifest Table */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] overflow-hidden shadow-subtle">
        <div className="p-3.5 border-b border-[#DDDCD6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F5F4F0]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16794C]" />
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#161616]">
              Roll-Call Checklist ({filteredInside.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#6F6F6A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search inside attendees..."
              className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] pl-8 pr-3 py-1 text-xs text-[#161616] placeholder-[#9E9D97] focus:outline-none focus:border-[#E86A00]"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFFFF] text-[#6F6F6A] sticky top-0 uppercase tracking-wider text-[10px] border-b border-[#DDDCD6]">
              <tr>
                <th className="px-3 py-2 w-10 text-center">Status</th>
                <th className="px-3 py-2">Participant Name</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Emergency Phone</th>
                <th className="px-3 py-2">Last Gate Entry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDDCD6]">
              {filteredInside.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#6F6F6A]">
                    No attendees currently inside matching search query.
                  </td>
                </tr>
              ) : (
                filteredInside.map((p) => {
                  const isAccounted = !!accountedMap[p.participantId];
                  const lastIn = p.history.find((h) => h.direction === 'IN' && h.allowed);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleToggleAccounted(p.participantId)}
                      className={`cursor-pointer transition-colors ${
                        isAccounted ? 'bg-[#EBF7F0]/40' : 'hover:bg-[#F5F4F0]/60'
                      }`}
                    >
                      <td className="px-3 py-2 text-center">
                        {isAccounted ? (
                          <CheckSquare className="w-4 h-4 text-[#16794C] inline" />
                        ) : (
                          <Square className="w-4 h-4 text-[#9E9D97] inline" />
                        )}
                      </td>
                      <td className="px-3 py-2 font-semibold text-[#161616]">
                        {p.name}
                        {isAccounted && (
                          <span className="ml-2 text-[10px] font-bold text-[#16794C]">
                            (VERIFIED)
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-[#E86A00]">
                        {p.participantId}
                      </td>
                      <td className="px-3 py-2 text-[#161616]">{p.department}</td>
                      <td className="px-3 py-2 font-mono text-[#6F6F6A] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#9E9D97]" />
                        {p.phone}
                      </td>
                      <td className="px-3 py-2 text-[#6F6F6A] text-[11px]">
                        {lastIn ? `${lastIn.gate} (${new Date(lastIn.timestamp).toLocaleTimeString()})` : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title={pendingAction === 'ACTIVATE' ? 'Activate Emergency Mode?' : 'Deactivate Emergency Mode?'}
        message={
          pendingAction === 'ACTIVATE'
            ? 'This will immediately FREEZE all gate scanners and access points across the venue. Scans will be rejected until emergency mode is ended.'
            : 'This will restore regular gate access operations and allow entry and exit scans to resume.'
        }
        confirmText={pendingAction === 'ACTIVATE' ? 'Activate Emergency' : 'Exit Emergency'}
        variant={pendingAction === 'ACTIVATE' ? 'danger' : 'primary'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};
