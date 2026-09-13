import React, { useState } from 'react';
import {
  Download,
  Printer,
  Users,
  Layers,
  Activity,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import {
  exportAttendanceCSV,
  exportScanCSV,
  exportEmergencyHeadcountCSV,
  downloadCsvFile,
} from '../../services/reportService';
import { getDepartmentStats, getGateStats } from '../../services/analyticsService';

export const AdminReportsPage: React.FC = () => {
  const { participants, logs, event } = useAppStore();
  const [previewTab, setPreviewTab] = useState<'attendance' | 'scans' | 'departments'>('attendance');

  const deptStats = getDepartmentStats(participants);
  const gateStats = getGateStats(logs, event.gates);

  const handlePrint = () => {
    window.print();
  };

  const handleExportDepartmentCsv = () => {
    const headers = ['Department', 'Registered', 'Currently Inside', 'Exited'];
    const rows = deptStats.map((d) => [d.department, d.registered, d.inside, d.exited]);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCsvFile(`VenuPass-Department-Report-${dateStr}.csv`, headers, rows);
  };

  const handleExportGateCsv = () => {
    const headers = ['Gate', 'Allowed Scans', 'Denied Scans', 'Total Scans'];
    const rows = gateStats.map((g) => [g.gate, g.allowed, g.denied, g.total]);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCsvFile(`VenuPass-GateTraffic-Report-${dateStr}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDDCD6] pb-4">
        <div className="flex items-center gap-4">
          <img
            src="/silver_oak_logo.png"
            alt="Silver Oak University"
            className="h-10 object-contain hidden sm:block pr-4 border-r border-[#DDDCD6]"
          />
          <div>
            <h1 className="font-heading text-xl font-bold text-[#161616]">
              Audit Reports & Data Export
            </h1>
            <p className="text-xs text-[#6F6F6A]">
              Official Silver Oak University verified event reports from current live state.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-3.5 py-1.5 rounded-btn bg-[#F0EFEA] hover:bg-[#EAE8E1] text-[#161616] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-[#6F6F6A]" />
          Print Report
        </button>
      </div>

      {/* Report Cards Grid (Section 39) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Attendance Report Card */}
        <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-btn bg-[#EBF7F0] text-[#16794C] flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-sm font-bold text-[#161616] mb-1">
              Attendance Roster
            </h3>
            <p className="text-xs text-[#6F6F6A] mb-4 leading-relaxed">
              Complete manifest of registered participants, active state (INSIDE / EXITED), and total entry and exit counts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportAttendanceCSV(participants)}
            className="w-full py-2 rounded-btn bg-[#161616] hover:bg-[#2A2D30] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#16794C]" />
            Download Attendance CSV
          </button>
        </div>

        {/* Scan Logs Report Card */}
        <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-btn bg-[#FFF4EB] text-[#E86A00] flex items-center justify-center mb-3">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-sm font-bold text-[#161616] mb-1">
              Gate Scan Movement Logs
            </h3>
            <p className="text-xs text-[#6F6F6A] mb-4 leading-relaxed">
              Chronological log of every scan attempt with gate location, direction, allowed/denied verdict, and rejection reasons.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportScanCSV(logs)}
            className="w-full py-2 rounded-btn bg-[#E86A00] hover:bg-[#B94D00] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download Scan Logs CSV
          </button>
        </div>

        {/* Department Summary Card */}
        <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-btn bg-[#EEF4FC] text-[#2864A8] flex items-center justify-center mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-sm font-bold text-[#161616] mb-1">
              Department Participation Summary
            </h3>
            <p className="text-xs text-[#6F6F6A] mb-4 leading-relaxed">
              Aggregated attendance figures by department or branch for post-event institutional reporting.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportDepartmentCsv}
            className="w-full py-2 rounded-btn bg-[#F0EFEA] hover:bg-[#EAE8E1] text-[#161616] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download Department CSV
          </button>
        </div>
      </div>

      {/* Interactive Report Data Preview */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle">
        <div className="flex items-center justify-between border-b border-[#DDDCD6] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewTab('attendance')}
              className={`px-3 py-1 rounded-btn text-xs font-semibold transition-colors ${
                previewTab === 'attendance'
                  ? 'bg-[#161616] text-white'
                  : 'text-[#6F6F6A] hover:text-[#161616]'
              }`}
            >
              Attendance Roster ({participants.length})
            </button>
            <button
              onClick={() => setPreviewTab('scans')}
              className={`px-3 py-1 rounded-btn text-xs font-semibold transition-colors ${
                previewTab === 'scans'
                  ? 'bg-[#161616] text-white'
                  : 'text-[#6F6F6A] hover:text-[#161616]'
              }`}
            >
              Scan Logs ({logs.length})
            </button>
            <button
              onClick={() => setPreviewTab('departments')}
              className={`px-3 py-1 rounded-btn text-xs font-semibold transition-colors ${
                previewTab === 'departments'
                  ? 'bg-[#161616] text-white'
                  : 'text-[#6F6F6A] hover:text-[#161616]'
              }`}
            >
              Departments ({deptStats.length})
            </button>
          </div>

          <span className="text-[11px] text-[#6F6F6A] font-mono">
            {event.name}
          </span>
        </div>

        {previewTab === 'attendance' && (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F4F0] sticky top-0 text-[#6F6F6A]">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">State</th>
                  <th className="px-3 py-2">Entries</th>
                  <th className="px-3 py-2">Exits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDDCD6]">
                {participants.slice(0, 15).map((p) => (
                  <tr key={p.id} className="hover:bg-[#F5F4F0]/60">
                    <td className="px-3 py-2 font-mono font-bold text-[#E86A00]">{p.participantId}</td>
                    <td className="px-3 py-2 font-medium text-[#161616]">{p.name}</td>
                    <td className="px-3 py-2 text-[#6F6F6A]">{p.department}</td>
                    <td className="px-3 py-2 font-semibold text-[#161616]">{p.state}</td>
                    <td className="px-3 py-2 font-mono">{p.entryCount}</td>
                    <td className="px-3 py-2 font-mono text-[#6F6F6A]">{p.exitCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {previewTab === 'scans' && (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F4F0] sticky top-0 text-[#6F6F6A]">
                <tr>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Participant</th>
                  <th className="px-3 py-2">Gate</th>
                  <th className="px-3 py-2">Dir</th>
                  <th className="px-3 py-2">Result</th>
                  <th className="px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDDCD6]">
                {logs.slice(0, 15).map((l) => (
                  <tr key={l.id} className="hover:bg-[#F5F4F0]/60">
                    <td className="px-3 py-2 text-[#6F6F6A] font-mono text-[11px]">
                      {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-3 py-2 font-mono font-bold text-[#E86A00]">{l.participantId}</td>
                    <td className="px-3 py-2 text-[#161616]">{l.participantName}</td>
                    <td className="px-3 py-2 text-[#6F6F6A]">{l.gate}</td>
                    <td className="px-3 py-2 font-bold">{l.direction}</td>
                    <td className="px-3 py-2 font-semibold">
                      <span className={l.result === 'ALLOWED' ? 'text-[#16794C]' : 'text-[#C43D3D]'}>
                        {l.result}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[#6F6F6A]">{l.reason || 'Normal'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {previewTab === 'departments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F4F0] text-[#6F6F6A]">
                <tr>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Total Registered</th>
                  <th className="px-3 py-2">Currently Inside</th>
                  <th className="px-3 py-2">Exited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDDCD6]">
                {deptStats.map((d) => (
                  <tr key={d.department} className="hover:bg-[#F5F4F0]/60">
                    <td className="px-3 py-2 font-semibold text-[#161616]">{d.department}</td>
                    <td className="px-3 py-2">{d.registered}</td>
                    <td className="px-3 py-2 font-bold text-[#16794C]">{d.inside}</td>
                    <td className="px-3 py-2 text-[#6F6F6A]">{d.exited}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
