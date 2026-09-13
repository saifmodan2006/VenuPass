import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  ArrowDownRight,
  ArrowUpLeft,
  XCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  Layers,
  Sparkles,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { generateAutomaticInsights } from '../../utils/analytics';

export const AdminDashboardPage: React.FC = () => {
  const { event, participants, logs, getKpis, getCurrentCrowd, getOccupancyPercentage, getCapacityStatus } = useAppStore();

  const kpis = getKpis();
  const currentCrowd = getCurrentCrowd();
  const occupancyPct = getOccupancyPercentage();
  const capacityStatus = getCapacityStatus();

  const recentLogs = logs.slice(0, 10);
  const insights = generateAutomaticInsights(participants, logs, event);

  // Calculate 15-min and hourly activity metrics
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const recent15MinIn = logs.filter((l) => l.result === 'ALLOWED' && l.direction === 'IN' && l.timestamp >= fifteenMinAgo).length;
  const recent15MinOut = logs.filter((l) => l.result === 'ALLOWED' && l.direction === 'OUT' && l.timestamp >= fifteenMinAgo).length;
  const netChange15 = recent15MinIn - recent15MinOut;

  return (
    <div className="space-y-6 text-left">
      {/* Event Header Strip (Section 17) */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF4EB] text-[#E86A00] border border-[#E86A00]/20 uppercase">
              {event.type}
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF7F0] text-[#16794C] border border-[#16794C]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16794C]" />
              LIVE OPERATIONS
            </span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#161616]">
            {event.name}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6F6F6A]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#E86A00]" />
              {event.date} • {event.startTime} - {event.endTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#6F6F6A]" />
              {event.venue}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#6F6F6A]" />
              {event.gates.length} Configured Gates
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/gate"
            className="px-4 py-2 rounded-btn bg-[#E86A00] hover:bg-[#B94D00] text-[#FFFFFF] font-semibold text-xs shadow-subtle transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            Open Gate Scanner
          </Link>
          <Link
            to="/register"
            className="px-3.5 py-2 rounded-btn bg-[#F0EFEA] hover:bg-[#EAE8E1] text-[#161616] font-medium text-xs transition-colors"
          >
            + Register Pass
          </Link>
        </div>
      </div>

      {/* Capacity Alert Banners */}
      {capacityStatus === 'CAPACITY_REACHED' && (
        <div className="p-3.5 rounded-card bg-[#FDF0F0] border border-[#C43D3D] text-[#C43D3D] text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>CAPACITY REACHED (100%):</strong> Venue maximum limit of {event.maxCapacity} attendees has been reached. New entries are blocked at all gates.
          </span>
        </div>
      )}
      {capacityStatus === 'NEAR_CAPACITY' && (
        <div className="p-3.5 rounded-card bg-[#FDF6E9] border border-[#A96500] text-[#A96500] text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>VENUE APPROACHING CAPACITY ({occupancyPct}%):</strong> {currentCrowd} of {event.maxCapacity} attendees inside.
          </span>
        </div>
      )}

      {/* Dominant Current Crowd Focus (Section 18) + Live Activity Rail (Section 20) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dominant Current Crowd (7 cols) */}
        <div className="lg:col-span-7 rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#DDDCD6] pb-3 mb-6">
              <span className="text-xs font-bold text-[#E86A00] uppercase tracking-wider">
                Current Crowd (Derived Source of Truth)
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#16794C] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#16794C] status-dot-pulse" />
                Live Attendance Sync
              </div>
            </div>

            <div className="my-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6F6A] block mb-1">
                Verified Attendees Inside Venue
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-6xl sm:text-7xl font-bold tracking-tight text-[#161616]">
                  {currentCrowd}
                </span>
                <span className="text-lg text-[#6F6F6A]">/ {event.maxCapacity} capacity</span>
                <span className="text-2xl font-mono font-bold text-[#E86A00]">
                  {occupancyPct}%
                </span>
              </div>

              {/* Occupancy bar */}
              <div className="w-full bg-[#F0EFEA] h-2.5 rounded-full mt-4 overflow-hidden border border-[#DDDCD6]">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    capacityStatus === 'CAPACITY_REACHED'
                      ? 'bg-[#C43D3D]'
                      : capacityStatus === 'NEAR_CAPACITY'
                      ? 'bg-[#A96500]'
                      : 'bg-[#16794C]'
                  }`}
                  style={{ width: `${Math.min(100, occupancyPct)}%` }}
                />
              </div>
            </div>

            {/* Velocity & Status Strip (Section 18) */}
            <div className="mt-8 pt-4 border-t border-[#DDDCD6] grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-[#6F6F6A] block">15-Min Entry Flow</span>
                <strong className="font-mono text-sm text-[#161616]">+{recent15MinIn} entries</strong>
              </div>
              <div>
                <span className="text-[11px] text-[#6F6F6A] block">15-Min Exit Flow</span>
                <strong className="font-mono text-sm text-[#161616]">-{recent15MinOut} exits</strong>
              </div>
              <div>
                <span className="text-[11px] text-[#6F6F6A] block">Net Change (15m)</span>
                <strong className={`font-mono text-sm ${netChange15 >= 0 ? 'text-[#16794C]' : 'text-[#6F6F6A]'}`}>
                  {netChange15 >= 0 ? `+${netChange15}` : netChange15}
                </strong>
              </div>
            </div>
          </div>

          {/* Automatic Insights preview */}
          <div className="mt-6 pt-4 border-t border-[#DDDCD6]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#E86A00]" />
              <span className="font-heading text-xs font-bold text-[#161616] uppercase tracking-wider">
                Operational Insights
              </span>
            </div>
            <div className="space-y-1.5">
              {insights.slice(0, 3).map((insight, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-btn bg-[#F5F4F0] text-xs text-[#161616] flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E86A00] mt-1.5 flex-shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Activity Rail (Section 20 - 5 cols) */}
        <div className="lg:col-span-5 rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#DDDCD6] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#16794C]" />
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#161616]">
                  Live Activity Rail
                </h3>
              </div>
              <Link to="/admin/logs" className="text-xs text-[#E86A00] font-semibold hover:underline">
                View All &rarr;
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <p className="text-xs text-[#6F6F6A] py-6 text-center">No scan movements recorded yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2 rounded-btn bg-[#F5F4F0] border border-[#DDDCD6] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-btn ${
                          log.result === 'ALLOWED'
                            ? log.direction === 'IN'
                              ? 'bg-[#EBF7F0] text-[#16794C]'
                              : 'bg-[#EEF4FC] text-[#2864A8]'
                            : 'bg-[#FDF0F0] text-[#C43D3D]'
                        }`}
                      >
                        {log.result === 'ALLOWED' ? (
                          log.direction === 'IN' ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : (
                            <ArrowUpLeft className="w-3 h-3" />
                          )
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#161616] truncate max-w-[130px]">
                            {log.participantName}
                          </span>
                          <span className="font-mono text-[10px] text-[#6F6F6A]">
                            ({log.participantId})
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6F6F6A] block">
                          {log.gate}
                          {log.reason && (
                            <span className="text-[#C43D3D] ml-1 font-medium">({log.reason})</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <StatusBadge type="result" value={log.result} />
                      <span className="text-[10px] text-[#6F6F6A] block font-mono mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal KPI Strip (Section 19 - Compact Horizontal Metrics) */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-4 shadow-subtle">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-left divide-y sm:divide-y-0 sm:divide-x divide-[#DDDCD6]">
          <div className="pt-2 sm:pt-0 sm:px-3">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] block">Registered</span>
            <span className="font-heading text-lg font-bold text-[#161616]">{kpis.totalRegistered}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:px-3">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] block">Active Passes</span>
            <span className="font-heading text-lg font-bold text-[#2864A8]">{kpis.qrGenerated}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:px-3">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] block">Pending QR</span>
            <span className="font-heading text-lg font-bold text-[#A96500]">{kpis.qrNotGenerated}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:px-3">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] block">Inside Venue</span>
            <span className="font-heading text-lg font-bold text-[#16794C]">{kpis.currentlyInside}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:px-3">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] block">Exited</span>
            <span className="font-heading text-lg font-bold text-[#6F6F6A]">{kpis.totalExited}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:px-3">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] block">Allowed Scans</span>
            <span className="font-heading text-lg font-bold text-[#16794C]">{kpis.allowedScans}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:px-3">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] block">Denied Scans</span>
            <span className="font-heading text-lg font-bold text-[#C43D3D]">{kpis.deniedScans}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:px-3">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] block">Duplicates</span>
            <span className="font-heading text-lg font-bold text-[#A96500]">{kpis.duplicateAttempts}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
