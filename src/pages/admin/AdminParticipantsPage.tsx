import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  QrCode,
  ExternalLink,
  Plus,
  X,
  Download,
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Participant } from '../../types';
import QRCode from 'react-qr-code';
import { downloadQrSvgAsPng } from '../../utils/reports';

export const AdminParticipantsPage: React.FC = () => {
  const { event, participants, generateParticipantQr } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [qrFilter, setQrFilter] = useState('');

  const [selectedForQr, setSelectedForQr] = useState<Participant | null>(null);

  const departments = useMemo(() => {
    const set = new Set(participants.map((p) => p.department).filter(Boolean));
    return Array.from(set);
  }, [participants]);

  const categories = useMemo(() => {
    const set = new Set(participants.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [participants]);

  const filtered = useMemo(() => {
    return participants.filter((p) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesId = p.participantId.toLowerCase().includes(q);
        const matchesDept = p.department.toLowerCase().includes(q);
        const matchesToken = p.qrToken?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesId && !matchesDept && !matchesToken) return false;
      }
      if (deptFilter && p.department !== deptFilter) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (stateFilter && p.state !== stateFilter) return false;
      if (qrFilter && p.qrStatus !== qrFilter) return false;
      return true;
    });
  }, [participants, searchTerm, deptFilter, categoryFilter, stateFilter, qrFilter]);

  const handleReset = () => {
    setSearchTerm('');
    setDeptFilter('');
    setCategoryFilter('');
    setStateFilter('');
    setQrFilter('');
  };

  return (
    <div className="space-y-5 text-left">
      {/* Title & Add Participant */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[#161616]">
            Participant Directory
          </h1>
          <p className="text-xs text-[#6F6F6A]">
            Showing {filtered.length} of {participants.length} registered participants
          </p>
        </div>

        <Link
          to="/register"
          className="px-3.5 py-1.5 rounded-btn bg-[#E86A00] hover:bg-[#B94D00] text-[#FFFFFF] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-subtle"
        >
          <Plus className="w-3.5 h-3.5" />
          Register Participant
        </Link>
      </div>

      {/* Filter Toolbar (Section 34, 35) */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-3.5 shadow-subtle space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#6F6F6A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID (e.g. STU1001), department, or token..."
            className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] pl-8 pr-3 py-1.5 text-xs text-[#161616] placeholder-[#9E9D97] focus:outline-none focus:border-[#E86A00]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
          >
            <option value="">All States</option>
            <option value="INSIDE">Inside Venue</option>
            <option value="NOT_ENTERED">Not Entered</option>
            <option value="EXITED">Exited</option>
          </select>

          <select
            value={qrFilter}
            onChange={(e) => setQrFilter(e.target.value)}
            className="rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
          >
            <option value="">All QR States</option>
            <option value="GENERATED">Active Pass</option>
            <option value="NOT_GENERATED">Pending QR</option>
          </select>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-1 px-3 py-1 rounded-btn bg-[#F0EFEA] hover:bg-[#EAE8E1] text-[#161616] text-xs font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Compact Table (Section 33) */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F4F0] border-b border-[#DDDCD6] text-[#6F6F6A] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3.5 py-2.5">Participant</th>
                <th className="px-3.5 py-2.5">ID</th>
                <th className="px-3.5 py-2.5">Department</th>
                <th className="px-3.5 py-2.5">Category</th>
                <th className="px-3.5 py-2.5">QR Status</th>
                <th className="px-3.5 py-2.5">Current State</th>
                <th className="px-3.5 py-2.5 text-center">Entries</th>
                <th className="px-3.5 py-2.5 text-center">Exits</th>
                <th className="px-3.5 py-2.5">Registered</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDDCD6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#6F6F6A]">
                    No participants matched your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F5F4F0]/60 transition-colors">
                    <td className="px-3.5 py-2 font-semibold text-[#161616]">
                      {p.name}
                      {p.phone && (
                        <span className="block text-[10px] text-[#6F6F6A] font-normal">
                          {p.phone}
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2 font-mono font-bold text-[#E86A00]">
                      {p.participantId}
                    </td>
                    <td className="px-3.5 py-2 text-[#161616]">{p.department}</td>
                    <td className="px-3.5 py-2 text-[#6F6F6A]">{p.category}</td>
                    <td className="px-3.5 py-2">
                      <StatusBadge type="qr" value={p.qrStatus} />
                    </td>
                    <td className="px-3.5 py-2">
                      <StatusBadge type="state" value={p.state} />
                    </td>
                    <td className="px-3.5 py-2 text-center font-bold text-[#161616]">
                      {p.entryCount}
                    </td>
                    <td className="px-3.5 py-2 text-center text-[#6F6F6A]">
                      {p.exitCount}
                    </td>
                    <td className="px-3.5 py-2 text-[#6F6F6A] text-[11px]">
                      {new Date(p.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="px-3.5 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.qrStatus === 'GENERATED' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedForQr(p)}
                            className="p-1 rounded-btn hover:bg-[#F0EFEA] text-[#6F6F6A] hover:text-[#161616]"
                            title="View QR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => generateParticipantQr(p.participantId)}
                            className="px-2 py-0.5 rounded-btn bg-[#EEF4FC] text-[#2864A8] text-[10px] font-semibold"
                          >
                            Generate
                          </button>
                        )}
                        <Link
                          to={`/pass/${p.participantId}`}
                          className="p-1 rounded-btn hover:bg-[#F0EFEA] text-[#6F6F6A] hover:text-[#161616]"
                          title="Open Pass"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Modal */}
      {selectedForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="relative w-full max-w-xs rounded-dialog border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-elevated text-center">
            <button
              onClick={() => setSelectedForQr(null)}
              className="absolute top-3 right-3 text-[#6F6F6A] hover:text-[#161616] p-1 rounded-btn hover:bg-[#F0EFEA]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-base font-bold text-[#161616] mb-0.5">
              {selectedForQr.name}
            </h3>
            <p className="font-mono text-xs text-[#E86A00] font-bold mb-3">
              {selectedForQr.participantId} • {selectedForQr.department}
            </p>

            <div className="p-3 border border-[#DDDCD6] bg-[#FFFFFF] rounded-card inline-block shadow-subtle mb-3">
              <div id={`modal-qr-${selectedForQr.participantId}`}>
                <QRCode
                  value={selectedForQr.qrToken || selectedForQr.participantId}
                  size={160}
                  level="M"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadQrSvgAsPng(`modal-qr-${selectedForQr.participantId}`, selectedForQr.participantId, {
                    name: selectedForQr.name,
                    department: selectedForQr.department,
                    category: selectedForQr.category,
                    eventName: event.name,
                    venue: event.venue,
                    date: event.date,
                  })
                }
                className="px-3 py-1.5 rounded-btn bg-[#161616] text-[#FFFFFF] font-semibold text-xs flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Download PNG
              </button>
              <Link
                to={`/pass/${selectedForQr.participantId}`}
                className="px-3 py-1.5 rounded-btn bg-[#F0EFEA] text-[#161616] text-xs font-medium"
              >
                View Pass
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
