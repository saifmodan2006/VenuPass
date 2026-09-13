import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  QrCode,
  FileText,
  BarChart3,
  Download,
  AlertOctagon,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  MapPin,
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    event,
    adminSession,
    logoutAdmin,
    getCurrentCrowd,
    recentSuspiciousAlert,
    dismissSuspiciousAlert,
  } = useAppStore();

  if (!adminSession.isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const currentCrowd = getCurrentCrowd();
  const maxCapacity = event.maxCapacity || 1;
  const occupancyPct = Math.min(100, Math.round((currentCrowd / maxCapacity) * 100));

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Gate Operations', path: '/gate', icon: <QrCode className="w-4 h-4 text-[#E86A00]" /> },
    { label: 'Participants', path: '/admin/participants', icon: <Users className="w-4 h-4" /> },
    { label: 'Scan Logs', path: '/admin/logs', icon: <FileText className="w-4 h-4" /> },
    { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Reports', path: '/admin/reports', icon: <Download className="w-4 h-4" /> },
    {
      label: 'Emergency',
      path: '/admin/emergency',
      icon: <AlertOctagon className="w-4 h-4 text-[#C43D3D]" />,
      badge: event.emergencyMode ? 'FROZEN' : undefined,
    },
    { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#161616] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between border-b border-[#DDDCD6] bg-[#FFFFFF] px-4 py-3 sticky top-0 z-40">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-btn bg-[#161616] flex items-center justify-center text-white text-[11px] font-bold">
            VP
          </div>
          <span className="font-heading font-bold text-sm text-[#161616]">VenuPass Console</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-btn bg-[#F0EFEA] border border-[#DDDCD6] text-[#161616]"
          aria-label="Toggle admin sidebar"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Operations Sidebar (Section 16) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-60 bg-[#FFFFFF] border-r border-[#DDDCD6] flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand & Event Context */}
          <div className="p-4 border-b border-[#DDDCD6]">
            <div className="mb-3 pb-2.5 border-b border-[#DDDCD6]/80">
              <img
                src="/silver_oak_logo.png"
                alt="Silver Oak University"
                className="h-6 object-contain"
              />
            </div>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-btn bg-[#161616] flex items-center justify-center text-white">
                <QrCode className="w-4 h-4 text-[#E86A00]" />
              </div>
              <div>
                <span className="font-heading font-bold text-sm tracking-tight text-[#161616]">
                  VENUPASS
                </span>
                <span className="text-[10px] text-[#6F6F6A] block -mt-0.5 uppercase tracking-wider font-semibold">
                  Control Room
                </span>
              </div>
            </Link>

            {/* Event pill */}
            <div className="mt-3 p-2.5 rounded-card bg-[#F5F4F0] border border-[#DDDCD6] text-left">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-bold text-[#E86A00] uppercase">
                  {event.type}
                </span>
                <span className="text-[10px] font-mono text-[#6F6F6A]">
                  {event.gates.length} gates
                </span>
              </div>
              <p className="text-xs font-semibold text-[#161616] truncate">{event.name}</p>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-[#6F6F6A]">
                <MapPin className="w-3 h-3 text-[#9E9D97]" />
                <span className="truncate">{event.venue}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-0.5">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-btn text-xs transition-all ${
                    active
                      ? 'bg-[#FFF4EB] text-[#E86A00] font-semibold'
                      : 'text-[#6F6F6A] hover:text-[#161616] hover:bg-[#F5F4F0]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FDF0F0] text-[#C43D3D] border border-[#C43D3D]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status & Admin Session Profile */}
        <div className="p-3.5 border-t border-[#DDDCD6] bg-[#F5F4F0]">
          <div className="flex items-center justify-between mb-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16794C]" />
              <span className="text-[#6F6F6A] text-[11px]">Occupancy:</span>
              <strong className="font-mono text-xs text-[#161616]">
                {currentCrowd}/{maxCapacity}
              </strong>
            </div>
            <span className="text-[11px] font-mono text-[#A96500] font-semibold">
              {occupancyPct}%
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#DDDCD6]">
            <div className="text-left">
              <span className="text-[11px] font-semibold text-[#161616] block leading-tight">
                Operator
              </span>
              <span className="text-[10px] text-[#6F6F6A] font-mono">admin@venupass</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-btn hover:bg-[#EAE8E1] text-[#6F6F6A] hover:text-[#C43D3D] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Security / Suspicious warning bar */}
        {recentSuspiciousAlert && (
          <div className="bg-[#FDF0F0] border-b border-[#C43D3D]/30 px-4 py-2.5 flex items-center justify-between text-xs text-[#C43D3D]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C43D3D] flex-shrink-0" />
              <span>
                <strong>OPERATIONAL NOTICE:</strong> 3 or more denied scans occurred within 60 seconds. Suspicious rapid attempts logged.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/admin/logs" className="underline font-semibold hover:text-[#A93333]">
                Inspect Logs
              </Link>
              <button
                onClick={dismissSuspiciousAlert}
                className="px-2 py-0.5 rounded-btn bg-[#FFFFFF] border border-[#C43D3D]/30 text-[#C43D3D] text-[10px] font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
