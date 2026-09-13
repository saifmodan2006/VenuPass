import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QrCode, Shield, Users, Menu, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/useStore';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { event, getCurrentCrowd, adminSession } = useAppStore();

  const currentCrowd = getCurrentCrowd();
  const maxCapacity = event.maxCapacity || 1;
  const occupancyPct = Math.min(100, Math.round((currentCrowd / maxCapacity) * 100));

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* High-Contrast Emergency Banner */}
      {event.emergencyMode && (
        <div className="bg-[#C43D3D] text-[#FFFFFF] px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 z-50 shadow-subtle">
          <AlertTriangle className="w-4 h-4" />
          <span>EMERGENCY HEADCOUNT ACTIVE • GATE ENTRY AND EXIT ARE CURRENTLY FROZEN</span>
          <Link
            to="/admin/emergency"
            className="ml-2 underline text-white hover:text-[#FDF0F0] text-[11px] normal-case"
          >
            Open Emergency Console &rarr;
          </Link>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-[#DDDCD6] bg-[#FFFFFF]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          {/* Brand Mark with Silver Oak University Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/silver_oak_logo.png"
              alt="Silver Oak University"
              className="h-8 sm:h-9 object-contain"
            />
            <div className="h-6 w-px bg-[#DDDCD6] hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-btn bg-[#161616] flex items-center justify-center text-white">
                <QrCode className="w-4 h-4 text-[#E86A00]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-heading font-bold text-base tracking-tight text-[#161616]">
                    VENUPASS
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold bg-[#F0EFEA] text-[#6F6F6A] border border-[#DDDCD6]">
                    PROTOTYPE
                  </span>
                </div>
                <span className="text-[10px] text-[#6F6F6A] truncate max-w-[170px] block mt-0.5">
                  {event.name}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-btn text-xs font-medium transition-colors ${
                isActive('/')
                  ? 'text-[#161616] bg-[#F0EFEA]'
                  : 'text-[#6F6F6A] hover:text-[#161616] hover:bg-[#F5F4F0]'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/register"
              className={`px-3 py-1.5 rounded-btn text-xs font-medium transition-colors ${
                isActive('/register')
                  ? 'text-[#161616] bg-[#F0EFEA]'
                  : 'text-[#6F6F6A] hover:text-[#161616] hover:bg-[#F5F4F0]'
              }`}
            >
              Registration
            </Link>
            <Link
              to="/gate"
              className={`px-3 py-1.5 rounded-btn text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/gate')
                  ? 'text-[#E86A00] bg-[#FFF4EB] font-semibold'
                  : 'text-[#161616] hover:text-[#E86A00] hover:bg-[#F5F4F0]'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-[#E86A00]" />
              Gate Scanner
            </Link>
            {adminSession.isAuthenticated ? (
              <Link
                to="/admin/dashboard"
                className="px-3 py-1.5 rounded-btn text-xs font-semibold text-[#16794C] bg-[#EBF7F0] hover:bg-[#DDF2E6] transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Console
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="px-3 py-1.5 rounded-btn text-xs font-medium text-[#6F6F6A] hover:text-[#161616] hover:bg-[#F5F4F0] transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#9E9D97]" />
                Organizer
              </Link>
            )}
          </nav>

          {/* Right Live Headcount & Register CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0EFEA] border border-[#DDDCD6] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#16794C] status-dot-pulse" />
              <span className="text-[#6F6F6A] text-[11px]">Inside:</span>
              <strong className="font-mono font-bold text-[#161616]">
                {currentCrowd} / {maxCapacity}
              </strong>
              <span className="font-mono text-[10px] text-[#A96500] font-semibold">
                ({occupancyPct}%)
              </span>
            </div>

            <Link
              to="/register"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-btn bg-[#E86A00] hover:bg-[#B94D00] text-[#FFFFFF] text-xs font-semibold shadow-subtle transition-all"
            >
              Get Pass
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded-btn border border-[#DDDCD6] bg-[#F5F4F0] text-[#161616]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#DDDCD6] bg-[#FFFFFF] px-4 py-3 space-y-2">
            <div className="p-2.5 rounded-btn bg-[#F0EFEA] text-xs flex items-center justify-between mb-2">
              <span className="text-[#6F6F6A]">Inside Venue:</span>
              <span className="font-mono font-bold text-[#161616]">
                {currentCrowd} / {maxCapacity} ({occupancyPct}%)
              </span>
            </div>
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-xs font-medium text-[#161616] hover:bg-[#F5F4F0] rounded-btn"
            >
              Overview
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-xs font-medium text-[#161616] hover:bg-[#F5F4F0] rounded-btn"
            >
              Register for Event
            </Link>
            <Link
              to="/gate"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-[#E86A00] bg-[#FFF4EB] rounded-btn"
            >
              Gate Scanner
            </Link>
            {adminSession.isAuthenticated ? (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-xs font-semibold text-[#16794C] bg-[#EBF7F0] rounded-btn"
              >
                Admin Console
              </Link>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-xs font-medium text-[#6F6F6A] hover:bg-[#F5F4F0] rounded-btn"
              >
                Organizer Login
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
};
