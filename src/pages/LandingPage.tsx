import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  QrCode,
  ShieldCheck,
  Users,
  Layers,
  BarChart3,
  AlertOctagon,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { Navbar } from '../components/navigation/Navbar';
import { PassCard } from '../components/pass/PassCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { event, getCurrentCrowd, participants } = useAppStore();
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');

  const currentCrowd = getCurrentCrowd();
  const maxCapacity = event.maxCapacity || 1;
  const occupancyPct = Math.min(100, Math.round((currentCrowd / maxCapacity) * 100));

  // Demonstration participant for hero ticket visual
  const sampleParticipant = participants[0] || {
    id: 'sample',
    participantId: 'STU1001',
    name: 'Aarav Sharma',
    department: 'Computer Science',
    category: 'Student',
    semester: 'Sem 6',
    phone: '9876543210',
    registeredAt: new Date().toISOString(),
    qrToken: JSON.stringify({
      version: 1,
      tokenId: 'VP-DEMO',
      participantId: 'STU1001',
      eventId: event.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
      signature: 'SIG_VALID',
    }),
    qrStatus: 'GENERATED' as const,
    state: 'INSIDE' as const,
    entryCount: 1,
    exitCount: 0,
    history: [],
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = lookupId.trim().toUpperCase();
    if (!clean) return;
    const found = participants.find((p) => p.participantId.toUpperCase() === clean);
    if (found) {
      setLookupError('');
      navigate(`/pass/${found.participantId}`);
    } else {
      setLookupError(`No pass registered with ID "${clean}". Please register below.`);
    }
  };

  const problems = [
    {
      title: 'Slow Manual Queues',
      desc: 'Paper lists and manual check-ins cause gate bottleneck delays during peak arrival rushes.',
    },
    {
      title: 'Counterfeits & Screenshot Passes',
      desc: 'Unstructured static QR codes and forwarded screenshots lead to unverified admissions.',
    },
    {
      title: 'Inaccurate Crowd Headcounts',
      desc: 'Manual clickers fail to sync across multiple gates, risking dangerous venue overcapacity.',
    },
    {
      title: 'Emergency Accounting Gaps',
      desc: 'In an evacuation, event security cannot immediately verify who remains inside the venue.',
    },
  ];

  const features = [
    {
      icon: <QrCode className="w-5 h-5 text-[#E86A00]" />,
      title: 'Structured QR Tokens',
      desc: 'Cryptographic payload structure checking event ID, validity timestamps, and signature integrity.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#16794C]" />,
      title: 'Zero Duplicate Entry',
      desc: 'Gate scanner verifies current participant state. An attendee already inside cannot re-enter.',
    },
    {
      icon: <Users className="w-5 h-5 text-[#A96500]" />,
      title: 'Derived Live Crowd',
      desc: 'Real-time headcount computed directly from active INSIDE states, never unverified manual counters.',
    },
    {
      icon: <Layers className="w-5 h-5 text-[#2864A8]" />,
      title: 'Multi-Gate Sync',
      desc: 'Coordinated entry and exit logging across all configured venue perimeters simultaneously.',
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-[#E86A00]" />,
      title: 'Operational Analytics',
      desc: 'Timeline occupancy curves, gate throughput, department attendance, and instant CSV exports.',
    },
    {
      icon: <AlertOctagon className="w-5 h-5 text-[#C43D3D]" />,
      title: 'Emergency Headcount',
      desc: 'One-click gate freeze with verified attendance lists, department breakdowns, and roll-call checklists.',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'Event Configuration', desc: 'Organizer sets venue capacity, dates, gate topology, and scan rules.' },
    { step: '02', title: 'Participant Registration', desc: 'Attendees register online; duplicate IDs and contact checks are enforced.' },
    { step: '03', title: 'Tokenized QR Pass', desc: 'Secure digital pass generated with quiet zones, expiry timestamps, and download option.' },
    { step: '04', title: 'Gate Verification', desc: 'High-speed camera or manual scanning evaluates cooldown, capacity, and state.' },
    { step: '05', title: 'Live Headcount', desc: 'Participant state transitions to INSIDE or EXITED, updating audit logs in real time.' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#161616] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#DDDCD6] editorial-grid">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Typography & CTAs (7 cols) */}
          <div className="lg:col-span-7 text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#DDDCD6] text-xs text-[#6F6F6A] mb-5 shadow-subtle"
            >
              <img src="/silver_oak_logo.png" alt="Silver Oak University" className="h-5 object-contain" />
              <span className="text-[#DDDCD6]">•</span>
              <span className="font-semibold text-[#E86A00]">{event.type}</span>
              <span className="text-[#DDDCD6]">•</span>
              <span className="truncate max-w-[200px] text-[#161616] font-medium">{event.name}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#161616] leading-[1.08] mb-5"
            >
              ONE QR.<br />
              ONE PASS.<br />
              <span className="text-[#E86A00]">SMARTER ACCESS.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-base sm:text-lg text-[#6F6F6A] max-w-xl mb-8 leading-relaxed font-normal"
            >
              Smart QR registration, secure venue access, real-time crowd monitoring and event analytics.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              <Link
                to="/register"
                className="px-6 py-3 rounded-btn bg-[#E86A00] hover:bg-[#B94D00] text-[#FFFFFF] font-semibold text-xs shadow-subtle transition-all flex items-center gap-2"
              >
                Register for Event
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/gate"
                className="px-5 py-3 rounded-btn bg-[#161616] hover:bg-[#2A2D30] text-[#FFFFFF] font-semibold text-xs transition-all flex items-center gap-2"
              >
                <QrCode className="w-3.5 h-3.5 text-[#E86A00]" />
                Gate Scanner
              </Link>

              <Link
                to="/admin/login"
                className="px-5 py-3 rounded-btn bg-[#FFFFFF] hover:bg-[#F0EFEA] border border-[#DDDCD6] text-[#161616] font-medium text-xs transition-all"
              >
                Organizer Login
              </Link>
            </motion.div>

            {/* Instant Pass Lookup */}
            <form onSubmit={handleLookup} className="max-w-md">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="Already registered? Enter ID (e.g. STU1001)"
                  className="w-full rounded-btn border border-[#DDDCD6] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#161616] placeholder-[#9E9D97] focus:outline-none focus:border-[#E86A00] pr-24 shadow-subtle"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-3 py-1.5 rounded-btn bg-[#F0EFEA] hover:bg-[#EAE8E1] text-[#161616] text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Search className="w-3 h-3 text-[#6F6F6A]" />
                  Find Pass
                </button>
              </div>
              {lookupError && <p className="mt-1.5 text-xs text-[#C43D3D]">{lookupError}</p>}
            </form>
          </div>

          {/* Right Column: Hero Visual Digital Pass (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-xs">
              <PassCard participant={sampleParticipant} event={event} showHistory={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Live Crowd & Operational Snapshot Strip */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#FFFFFF] border-b border-[#DDDCD6]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="border-r border-[#DDDCD6] pr-4">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] tracking-wider block mb-1">
              Current Headcount
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-[#161616]">
                {currentCrowd}
              </span>
              <span className="text-xs text-[#6F6F6A]">/ {maxCapacity}</span>
            </div>
            <span className="text-[11px] text-[#16794C] font-semibold mt-0.5 block">
              {occupancyPct}% Occupancy Rate
            </span>
          </div>

          <div className="border-r border-[#DDDCD6] pr-4">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] tracking-wider block mb-1">
              Active Access Gates
            </span>
            <span className="font-heading text-3xl font-bold text-[#161616]">
              {event.gates.length}
            </span>
            <span className="text-[11px] text-[#6F6F6A] mt-0.5 block">
              North, Main, South & VIP
            </span>
          </div>

          <div className="border-r border-[#DDDCD6] pr-4">
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] tracking-wider block mb-1">
              Total Passes Registered
            </span>
            <span className="font-heading text-3xl font-bold text-[#161616]">
              {participants.length}
            </span>
            <span className="text-[11px] text-[#6F6F6A] mt-0.5 block">
              Verified Attendees
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6F6F6A] tracking-wider block mb-1">
              Gate Gatekeeping Status
            </span>
            <span className={`font-heading text-lg font-bold block ${event.emergencyMode ? 'text-[#C43D3D]' : 'text-[#16794C]'}`}>
              {event.emergencyMode ? 'FROZEN (EMERGENCY)' : 'NORMAL MONITORING'}
            </span>
            <span className="text-[11px] text-[#6F6F6A] mt-0.5 block">
              5s Scan Cooldown Active
            </span>
          </div>
        </div>
      </section>

      {/* Problem Section (Section 9) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#DDDCD6]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12 text-left">
            <span className="text-xs font-bold text-[#E86A00] uppercase tracking-wider block mb-1.5">
              The Operational Problem
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#161616]">
              Why Traditional Event Access Breaks Down at Scale
            </h2>
            <p className="text-xs text-[#6F6F6A] mt-2 leading-relaxed">
              Large institutional and academic events experience severe admission friction, security breaches, and untracked crowd movement when relying on manual systems.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {problems.map((p, idx) => (
              <div
                key={idx}
                className="p-5 rounded-card border border-[#DDDCD6] bg-[#FFFFFF] shadow-subtle text-left"
              >
                <span className="font-mono text-xs font-bold text-[#E86A00] block mb-2">
                  0{idx + 1}
                </span>
                <h3 className="font-heading text-sm font-bold text-[#161616] mb-1.5">{p.title}</h3>
                <p className="text-xs text-[#6F6F6A] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Workflow (Section 9, 10) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FFFFFF] border-b border-[#DDDCD6]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12 text-left">
            <span className="text-xs font-bold text-[#E86A00] uppercase tracking-wider block mb-1.5">
              Architected Flow
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#161616]">
              Complete End-to-End Operational Pipeline
            </h2>
            <p className="text-xs text-[#6F6F6A] mt-2 leading-relaxed">
              Every step is integrated into a unified state machine with immediate local persistence and audit logging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-left">
            {workflowSteps.map((s) => (
              <div key={s.step} className="p-4 rounded-card border border-[#DDDCD6] bg-[#F5F4F0]">
                <span className="font-mono text-xs font-bold text-[#161616] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#DDDCD6] inline-block mb-3">
                  {s.step}
                </span>
                <h4 className="font-heading text-xs font-bold text-[#161616] mb-1">{s.title}</h4>
                <p className="text-[11px] text-[#6F6F6A] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid (Section 9) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#DDDCD6]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12 text-left">
            <span className="text-xs font-bold text-[#E86A00] uppercase tracking-wider block mb-1.5">
              Engineered Capabilities
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#161616]">
              Built for Controlled Venue Access & Real-Time Security
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-5 rounded-card border border-[#DDDCD6] bg-[#FFFFFF] shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-btn bg-[#F5F4F0] border border-[#DDDCD6] flex items-center justify-center mb-3">
                    {f.icon}
                  </div>
                  <h3 className="font-heading text-sm font-bold text-[#161616] mb-1.5">{f.title}</h3>
                  <p className="text-xs text-[#6F6F6A] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Verification Note (Section 9, 54) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FFFFFF] border-b border-[#DDDCD6]">
        <div className="max-w-4xl mx-auto rounded-card border border-[#DDDCD6] bg-[#F5F4F0] p-6 text-left">
          <div className="flex items-center gap-2 mb-2 text-[#161616]">
            <ShieldCheck className="w-4 h-4 text-[#16794C]" />
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
              Prototype Integrity Architecture
            </h4>
          </div>
          <p className="text-xs text-[#6F6F6A] leading-relaxed">
            VenuPass demonstrates structured client tokenization, dual-pass hashing, and atomic gate transitions on the frontend. In an enterprise production deployment, QR signatures, participant records, and gate validation move to an asymmetric Ed25519 backend with Redis distributed locks.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 bg-[#F5F4F0] text-center text-xs text-[#6F6F6A]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-[#161616]">VENUPASS</span>
            <span>— Universal Event Access Operations</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/register" className="hover:text-[#161616]">Registration</Link>
            <Link to="/gate" className="hover:text-[#161616]">Gate Scanner</Link>
            <Link to="/admin/login" className="hover:text-[#161616]">Control Room</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
