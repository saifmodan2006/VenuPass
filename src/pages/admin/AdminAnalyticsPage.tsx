import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Layers,
  PieChart as PieIcon,
  Sparkles,
  Activity,
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import {
  getCrowdTrend,
  getGateStats,
  getDepartmentStats,
  getScanStats,
} from '../../services/analyticsService';
import { computeCrowdPrediction } from '../../utils/analytics';

export const AdminAnalyticsPage: React.FC = () => {
  const { participants, logs, event, getCurrentCrowd } = useAppStore();

  const currentCrowd = getCurrentCrowd();
  const crowdTrend = getCrowdTrend(logs);
  const gateStats = getGateStats(logs, event.gates);
  const deptStats = getDepartmentStats(participants);
  const resultStats = getScanStats(logs);
  const prediction = computeCrowdPrediction(currentCrowd, event.maxCapacity, logs);

  const cleanTooltipStyle = {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDCD6',
    borderRadius: '8px',
    color: '#161616',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[#161616]">
            Operational Event Analytics
          </h1>
          <p className="text-xs text-[#6F6F6A]">
            Real-time throughput metrics and crowd distributions derived directly from gate operations.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#DDDCD6] text-xs text-[#161616]">
          <Activity className="w-3.5 h-3.5 text-[#16794C]" />
          <span>Real-Time Audit Synchronized</span>
        </div>
      </div>

      {/* Trend-Based Crowd Forecast Strip (Section 38, 64) */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E86A00]" />
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#161616]">
              Trend-Based Crowd Forecast
            </h3>
          </div>
          <span className="text-[11px] text-[#6F6F6A] italic">
            Estimated from current attendance trend
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-btn bg-[#F5F4F0] border border-[#DDDCD6]">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] block mb-0.5">Current Crowd</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-bold text-[#161616]">{currentCrowd}</span>
              <span className="text-xs text-[#6F6F6A]">attendees inside</span>
            </div>
          </div>

          <div className="p-3.5 rounded-btn bg-[#FFF4EB] border border-[#E86A00]/30">
            <span className="text-[10px] uppercase font-bold text-[#E86A00] block mb-0.5">Projected Peak</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-bold text-[#E86A00]">{prediction.estimatedPeak}</span>
              <span className="text-xs text-[#6F6F6A]">/ {event.maxCapacity} cap</span>
            </div>
          </div>

          <div className="p-3.5 rounded-btn bg-[#F5F4F0] border border-[#DDDCD6]">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] block mb-0.5">Estimated Peak Window</span>
            <span className="font-heading text-2xl font-bold text-[#161616]">
              {prediction.estimatedPeakTime}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Line / Area Chart: Crowd Over Time (Section 37, 38) */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#E86A00]" />
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#161616]">
              Net Crowd Headcount Over Time
            </h3>
          </div>
          <span className="text-[11px] text-[#6F6F6A]">15-Minute Cumulative Bins</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={crowdTrend}>
              <CartesianGrid strokeDasharray="2 2" stroke="#DDDCD6" />
              <XAxis dataKey="timeLabel" stroke="#6F6F6A" fontSize={11} tickLine={false} />
              <YAxis stroke="#6F6F6A" fontSize={11} allowDecimals={false} tickLine={false} />
              <Tooltip contentStyle={cleanTooltipStyle} />
              <Area
                type="monotone"
                dataKey="crowd"
                name="Inside Crowd"
                stroke="#E86A00"
                strokeWidth={2}
                fill="#FFF4EB"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Gate Traffic & Outcome Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Gate Traffic (7 cols) */}
        <div className="lg:col-span-7 rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#161616]" />
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#161616]">
                Gate Throughput & Traffic Distribution
              </h3>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gateStats}>
                <CartesianGrid strokeDasharray="2 2" stroke="#DDDCD6" />
                <XAxis dataKey="gate" stroke="#6F6F6A" fontSize={11} tickLine={false} />
                <YAxis stroke="#6F6F6A" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip contentStyle={cleanTooltipStyle} />
                <Legend />
                <Bar dataKey="allowed" name="Allowed Scans" fill="#16794C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="denied" name="Denied Scans" fill="#C43D3D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scan Result Distribution (5 cols) */}
        <div className="lg:col-span-5 rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#A96500]" />
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#161616]">
                Scan Outcome Distribution
              </h3>
            </div>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resultStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {resultStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={cleanTooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2.5 border-t border-[#DDDCD6] text-center text-xs text-[#6F6F6A]">
            Total Movements Processed: <strong className="text-[#161616]">{logs.length}</strong>
          </div>
        </div>
      </div>

      {/* Department Attendance */}
      <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#2864A8]" />
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#161616]">
              Department Participation: Registered vs Currently Inside
            </h3>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptStats}>
              <CartesianGrid strokeDasharray="2 2" stroke="#DDDCD6" />
              <XAxis dataKey="department" stroke="#6F6F6A" fontSize={11} tickLine={false} />
              <YAxis stroke="#6F6F6A" fontSize={11} allowDecimals={false} tickLine={false} />
              <Tooltip contentStyle={cleanTooltipStyle} />
              <Legend />
              <Bar dataKey="registered" name="Total Registered" fill="#DDDCD6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inside" name="Currently Inside" fill="#16794C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
