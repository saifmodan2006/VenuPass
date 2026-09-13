import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  Download,
  ShieldAlert,
  ArrowDownRight,
  ArrowUpLeft,
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { exportScanLogsReport } from '../../utils/reports';

export const AdminScanLogsPage: React.FC = () => {
  const { logs, event } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [gateFilter, setGateFilter] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = log.participantName.toLowerCase().includes(q);
        const matchesId = log.participantId.toLowerCase().includes(q);
        const matchesDept = log.department.toLowerCase().includes(q);
        const matchesReason = log.reason?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesId && !matchesDept && !matchesReason) return false;
      }
      if (gateFilter && log.gate !== gateFilter) return false;
      if (directionFilter && log.direction !== directionFilter) return false;
      if (resultFilter && log.result !== resultFilter) return false;
      if (suspiciousOnly && !log.suspicious) return false;
      return true;
    });
  }, [logs, searchTerm, gateFilter, directionFilter, resultFilter, suspiciousOnly]);

  const handleReset = () => {
    setSearchTerm('');
    setGateFilter('');
    setDirectionFilter('');
    setResultFilter('');
    setSuspiciousOnly(false);
  };

  return (
    <div className="space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[#161616]">
            Gate Access Logs
          </h1>
          <p className="text-xs text-[#6F6F6A]">
            Showing {filtered.length} of {logs.length} scan movement audit records
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportScanLogsReport(filtered)}
          className="px-3.5 py-1.5 rounded-btn bg-[#F0EFEA] hover:bg-[#EAE8E1] text-[#161616] font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#16794C]" />
          Export Scan Logs CSV
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-3.5 shadow-subtle space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#6F6F6A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by participant name, ID, department, or denial reason..."
            className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] pl-8 pr-3 py-1.5 text-xs text-[#161616] placeholder-[#9E9D97] focus:outline-none focus:border-[#E86A00]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <select
            value={gateFilter}
            onChange={(e) => setGateFilter(e.target.value)}
            className="rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
          >
            <option value="">All Gates</option>
            {event.gates.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
          >
            <option value="">All Directions</option>
            <option value="IN">IN (Entry)</option>
            <option value="OUT">OUT (Exit)</option>
          </select>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
          >
            <option value="">All Results</option>
            <option value="ALLOWED">Allowed Only</option>
            <option value="DENIED">Denied Only</option>
          </select>

          <button
            type="button"
            onClick={() => setSuspiciousOnly(!suspiciousOnly)}
            className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-btn text-xs font-semibold border transition-all ${
              suspiciousOnly
                ? 'bg-[#FDF0F0] text-[#C43D3D] border-[#C43D3D]'
                : 'bg-[#FFFFFF] text-[#6F6F6A] border-[#DDDCD6] hover:bg-[#F5F4F0]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {suspiciousOnly ? 'Flagged Only' : 'Filter Suspicious'}
          </button>

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

      {/* Logs Table (Section 36) */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F4F0] border-b border-[#DDDCD6] text-[#6F6F6A] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3.5 py-2.5">Time</th>
                <th className="px-3.5 py-2.5">Participant</th>
                <th className="px-3.5 py-2.5">ID</th>
                <th className="px-3.5 py-2.5">Department</th>
                <th className="px-3.5 py-2.5">Gate</th>
                <th className="px-3.5 py-2.5 text-center">Direction</th>
                <th className="px-3.5 py-2.5">Result</th>
                <th className="px-3.5 py-2.5">Reason / Details</th>
                <th className="px-3.5 py-2.5 text-center">Security</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDDCD6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#6F6F6A]">
                    No scan logs matched your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr
                    key={l.id}
                    className={`hover:bg-[#F5F4F0]/60 transition-colors ${
                      l.suspicious ? 'bg-[#FDF0F0]/40' : ''
                    }`}
                  >
                    <td className="px-3.5 py-2 font-mono text-[11px] text-[#6F6F6A] whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-3.5 py-2 font-semibold text-[#161616]">
                      {l.participantName}
                    </td>
                    <td className="px-3.5 py-2 font-mono font-bold text-[#E86A00]">
                      {l.participantId}
                    </td>
                    <td className="px-3.5 py-2 text-[#161616]">{l.department}</td>
                    <td className="px-3.5 py-2 text-[#161616]">{l.gate}</td>
                    <td className="px-3.5 py-2 text-center">
                      {l.direction === 'IN' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16794C]">
                          <ArrowDownRight className="w-3 h-3" /> IN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2864A8]">
                          <ArrowUpLeft className="w-3 h-3" /> OUT
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2">
                      <StatusBadge type="result" value={l.result} />
                    </td>
                    <td className="px-3.5 py-2">
                      {l.reason ? (
                        <span
                          className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-btn ${
                            l.reason === 'DUPLICATE_ENTRY'
                              ? 'bg-[#FDF6E9] text-[#A96500] border border-[#A96500]/30'
                              : 'bg-[#FDF0F0] text-[#C43D3D] border border-[#C43D3D]/30'
                          }`}
                        >
                          {l.reason}
                        </span>
                      ) : (
                        <span className="text-[#6F6F6A] text-[11px]">Normal Entry</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2 text-center">
                      <StatusBadge type="suspicious" value={l.suspicious} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
