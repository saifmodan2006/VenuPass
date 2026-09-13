import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  QrCode,
  Download,
  Calendar,
  MapPin,
  Clock,
  Layers,
  ShieldCheck,
  ArrowRight,
  BadgeAlert,
} from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { Navbar } from '../components/navigation/Navbar';
import { Participant } from '../types';
import { downloadQrSvgAsPng } from '../utils/reports';
import QRCode from 'react-qr-code';

export const RegistrationPage: React.FC = () => {
  const { event, registerParticipant, getCurrentCrowd } = useAppStore();

  const [name, setName] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [department, setDepartment] = useState('Computer Engineering');
  const [category, setCategory] = useState('Student');
  const [semester, setSemester] = useState('Semester 4');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [duplicateParticipant, setDuplicateParticipant] = useState<Participant | null>(null);
  const [registeredParticipant, setRegisteredParticipant] = useState<Participant | null>(null);

  const currentCrowd = getCurrentCrowd();
  const maxCapacity = event.maxCapacity || 1;

  const departmentsList = [
    'Computer Engineering',
    'Computer Science',
    'Information Technology',
    'Electronics & Comm',
    'Mechanical Engineering',
    'Civil Engineering',
    'Data Science & AI',
    'Design & Media',
    'Biotechnology',
    'Business & Management',
    'General / Other',
  ];

  const categoriesList = ['Student', 'Delegate', 'Faculty', 'Speaker', 'VIP', 'Volunteer'];
  const semestersList = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8', 'N/A'];

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }
    if (!participantId.trim()) {
      errs.participantId = 'Participant ID is required.';
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      errs.phone = 'Phone number must be exactly 10 digits.';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateParticipant(null);

    if (!validate()) return;

    const result = registerParticipant({
      name,
      participantId,
      department,
      category,
      semester,
      phone: phone.trim().replace(/\D/g, ''),
      email: email.trim() || undefined,
    });

    if (result.success && result.participant) {
      setRegisteredParticipant(result.participant);
    } else if (result.error === 'DUPLICATE_PARTICIPANT_ID' && result.participant) {
      setDuplicateParticipant(result.participant);
    } else {
      setErrors({ form: result.error || 'Registration failed. Please try again.' });
    }
  };

  const handleResetForm = () => {
    setName('');
    setParticipantId('');
    setPhone('');
    setEmail('');
    setErrors({});
    setDuplicateParticipant(null);
    setRegisteredParticipant(null);
  };

  const handleDownloadRegisteredQr = () => {
    if (!registeredParticipant) return;
    downloadQrSvgAsPng(
      `reg-qr-${registeredParticipant.participantId}`,
      registeredParticipant.participantId,
      {
        name: registeredParticipant.name,
        department: registeredParticipant.department,
        category: registeredParticipant.category,
        eventName: event.name,
        venue: event.venue,
        date: event.date,
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#161616] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Split Layout: Event Info on Left, Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Event Context & Info (5 cols) */}
          <div className="lg:col-span-5 text-left space-y-5">
            <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-6 shadow-subtle">
              <div className="mb-4 pb-3.5 border-b border-[#DDDCD6]">
                <img
                  src="/silver_oak_logo.png"
                  alt="Silver Oak University"
                  className="h-8 object-contain"
                />
              </div>
              <span className="text-[10px] font-bold text-[#E86A00] uppercase tracking-wider block mb-1">
                {event.type}
              </span>
              <h1 className="font-heading text-2xl font-bold text-[#161616] leading-snug">
                {event.name}
              </h1>
              <p className="text-xs text-[#6F6F6A] mt-2 leading-relaxed">
                {event.description}
              </p>

              <div className="mt-5 pt-4 border-t border-[#DDDCD6] space-y-2.5 text-xs text-[#161616]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#E86A00]" />
                  <span>Date: <strong>{event.date}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6F6F6A]" />
                  <span>Schedule: <strong>{event.startTime} - {event.endTime}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#6F6F6A]" />
                  <span>Venue: <strong>{event.venue}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#6F6F6A]" />
                  <span>Configured Gates: <strong>{event.gates.length} entrance points</strong></span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#DDDCD6] flex items-center justify-between text-xs">
                <span className="text-[#6F6F6A]">Venue Capacity:</span>
                <span className="font-mono font-semibold text-[#161616]">
                  {currentCrowd} / {maxCapacity} Inside
                </span>
              </div>
            </div>

            <div className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-4 text-xs text-[#6F6F6A] shadow-subtle flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#16794C] flex-shrink-0 mt-0.5" />
              <span>
                Each participant receives an individual tokenized pass. Screenshots or forward duplicates are blocked at gate entry.
              </span>
            </div>
          </div>

          {/* Right Column: Registration / Success (7 cols) */}
          <div className="lg:col-span-7">
            {/* Registration Closed Warning */}
            {!event.registrationOpen && (
              <div className="mb-5 p-3.5 rounded-card bg-[#FDF6E9] border border-[#A96500]/30 text-xs text-[#A96500] flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Registration is currently <strong>CLOSED</strong> by event organizers.
                </span>
              </div>
            )}

            {/* Registration Success State (Section 12 - Clean State, Not Giant Modal) */}
            <AnimatePresence>
              {registeredParticipant && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-card border border-[#16794C]/30 bg-[#FFFFFF] p-6 sm:p-8 shadow-card text-left"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-btn bg-[#EBF7F0] text-[#16794C] flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-heading text-lg font-bold text-[#161616]">
                        Registration Complete
                      </h2>
                      <p className="text-xs text-[#6F6F6A]">
                        Your event pass is ready for gate check-in.
                      </p>
                    </div>
                  </div>

                  {/* Summary Card with Instant QR Pass Preview */}
                  <div className="rounded-card border border-[#DDDCD6] bg-[#F5F4F0] p-4 text-xs mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      {/* Left: Participant Details */}
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex justify-between py-1 border-b border-[#DDDCD6]">
                          <span className="text-[#6F6F6A]">Participant</span>
                          <span className="font-semibold text-[#161616]">{registeredParticipant.name}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#DDDCD6]">
                          <span className="text-[#6F6F6A]">Participant ID</span>
                          <span className="font-mono font-bold text-[#E86A00]">
                            {registeredParticipant.participantId}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#DDDCD6]">
                          <span className="text-[#6F6F6A]">Department</span>
                          <span className="text-[#161616]">{registeredParticipant.department}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#DDDCD6]">
                          <span className="text-[#6F6F6A]">Event</span>
                          <span className="text-[#161616] font-medium">{event.name}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-[#6F6F6A]">Date & Venue</span>
                          <span className="text-[#161616]">{event.date} • {event.venue}</span>
                        </div>
                      </div>

                      {/* Right: Live Visible QR Code Badge */}
                      {registeredParticipant.qrToken && (
                        <div className="p-3 bg-white rounded-card border border-[#DDDCD6] shadow-subtle flex flex-col items-center justify-center flex-shrink-0 self-center">
                          <div id={`reg-qr-${registeredParticipant.participantId}`}>
                            <QRCode
                              id={`reg-qr-svg-${registeredParticipant.participantId}`}
                              value={registeredParticipant.qrToken}
                              size={120}
                              level="M"
                            />
                          </div>
                          <span className="text-[9px] font-mono text-[#6F6F6A] mt-1 font-medium">
                            {registeredParticipant.participantId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (Section 12) */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      to={`/pass/${registeredParticipant.participantId}`}
                      className="px-4 py-2 rounded-btn bg-[#E86A00] hover:bg-[#B94D00] text-[#FFFFFF] text-xs font-semibold flex items-center gap-1.5 shadow-subtle transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      View Event Pass
                    </Link>

                    <button
                      type="button"
                      onClick={handleDownloadRegisteredQr}
                      className="px-4 py-2 rounded-btn bg-[#161616] hover:bg-[#2A2D30] text-[#FFFFFF] text-xs font-semibold flex items-center gap-1.5 shadow-subtle transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download QR
                    </button>

                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-4 py-2 rounded-btn bg-[#F0EFEA] hover:bg-[#EAE8E1] text-[#161616] text-xs font-medium transition-colors"
                    >
                      Register Another
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Duplicate Participant Warning (Section 23) */}
            <AnimatePresence>
              {duplicateParticipant && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-card border border-[#A96500]/30 bg-[#FDF6E9] p-5 text-left"
                >
                  <div className="flex items-start gap-3">
                    <BadgeAlert className="w-5 h-5 text-[#A96500] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-heading text-sm font-bold text-[#161616]">
                        Already Registered
                      </h3>
                      <p className="text-xs text-[#6F6F6A] mt-1 leading-relaxed">
                        This participant ID (<strong>{duplicateParticipant.participantId}</strong>, {duplicateParticipant.name}) is already registered for this event.
                      </p>
                      <div className="mt-3 flex items-center gap-2.5">
                        <Link
                          to={`/pass/${duplicateParticipant.participantId}`}
                          className="px-3.5 py-1.5 rounded-btn bg-[#E86A00] text-white text-xs font-semibold flex items-center gap-1"
                        >
                          View My Pass
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDuplicateParticipant(null)}
                          className="px-3 py-1.5 rounded-btn bg-[#FFFFFF] border border-[#DDDCD6] text-xs text-[#161616]"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Registration Form (Section 11) */}
            {!registeredParticipant && (
              <form
                onSubmit={handleSubmit}
                className="rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-6 sm:p-8 shadow-card text-left space-y-4"
              >
                <div className="border-b border-[#DDDCD6] pb-3 mb-4">
                  <h2 className="font-heading text-lg font-bold text-[#161616]">
                    Registration Form
                  </h2>
                  <p className="text-xs text-[#6F6F6A]">
                    Complete the fields below to issue your credential.
                  </p>
                </div>

                {errors.form && (
                  <div className="p-3 rounded-btn bg-[#FDF0F0] border border-[#C43D3D]/30 text-xs text-[#C43D3D]">
                    {errors.form}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
                    Full Name <span className="text-[#C43D3D]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Patel"
                    className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] placeholder-[#9E9D97] focus:outline-none focus:border-[#E86A00]"
                  />
                  {errors.name && <p className="mt-1 text-[11px] text-[#C43D3D]">{errors.name}</p>}
                </div>

                {/* Participant ID */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
                    Participant / Student ID <span className="text-[#C43D3D]">*</span>
                  </label>
                  <input
                    type="text"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                    placeholder="e.g. STU1024"
                    className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] placeholder-[#9E9D97] font-mono focus:outline-none focus:border-[#E86A00]"
                  />
                  {errors.participantId && (
                    <p className="mt-1 text-[11px] text-[#C43D3D]">{errors.participantId}</p>
                  )}
                </div>

                {/* Department & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
                      Department / Branch
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
                    >
                      {departmentsList.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
                    >
                      {categoriesList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Semester & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
                      Semester / Year
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] focus:outline-none focus:border-[#E86A00]"
                    >
                      {semestersList.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
                      Phone (10 Digits) <span className="text-[#C43D3D]">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] placeholder-[#9E9D97] focus:outline-none focus:border-[#E86A00]"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-[11px] text-[#C43D3D]">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="participant@example.com"
                    className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] px-3 py-2 text-xs text-[#161616] placeholder-[#9E9D97] focus:outline-none focus:border-[#E86A00]"
                  />
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-[#C43D3D]">{errors.email}</p>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={!event.registrationOpen}
                    className="w-full py-2.5 rounded-btn bg-[#E86A00] hover:bg-[#B94D00] text-[#FFFFFF] font-semibold text-xs shadow-subtle transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    Generate Digital Pass
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
