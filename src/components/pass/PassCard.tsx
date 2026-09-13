import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { Download, Calendar, MapPin, ShieldCheck, Clock, ArrowDownRight, ArrowUpLeft } from 'lucide-react';
import { EventConfig, Participant } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { downloadQrSvgAsPng } from '../../utils/reports';

interface PassCardProps {
  participant: Participant;
  event: EventConfig;
  showHistory?: boolean;
}

export const PassCard: React.FC<PassCardProps> = ({ participant, event, showHistory = true }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -3; // max ±3 deg
    const rotY = ((x - centerX) / centerX) * 5;  // max ±5 deg
    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const handleDownloadQr = () => {
    downloadQrSvgAsPng(`qr-${participant.participantId}`, participant.participantId, {
      name: participant.name,
      department: participant.department,
      category: participant.category,
      eventName: event.name,
      venue: event.venue,
      date: event.date,
    });
  };

  let expiryFormatted = 'Event Conclusion';
  if (participant.qrToken) {
    try {
      const parsed = JSON.parse(participant.qrToken);
      if (parsed.exp) {
        expiryFormatted = new Date(parsed.exp * 1000).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* 3D Ticket Pass */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: rotate.x,
          rotateY: rotate.y,
          transformPerspective: 1000,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full rounded-pass border border-[#DDDCD6] bg-[#FFFFFF] p-6 shadow-card overflow-hidden select-none"
      >
        {/* Subtle reflection overlay */}
        <div className="absolute inset-0 pointer-events-none pass-reflection opacity-50" />

        {/* Top Header: University Brand & Status */}
        <div className="relative z-10 flex items-center justify-between border-b border-[#DDDCD6] pb-3 mb-3.5">
          <div className="flex items-center gap-2">
            <img src="/silver_oak_logo.png" alt="Silver Oak University" className="h-6 object-contain" />
          </div>
          <StatusBadge type="state" value={participant.state} />
        </div>

        {/* Event Information */}
        <div className="relative z-10 mb-4 text-left">
          <span className="text-[10px] font-bold text-[#E86A00] uppercase tracking-wider block mb-1">
            {event.type}
          </span>
          <h2 className="font-heading text-lg font-bold text-[#161616] leading-tight">
            {event.name}
          </h2>
          <div className="mt-2 space-y-1 text-xs text-[#6F6F6A]">
            <p className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#E86A00]" />
              {event.date} • {event.startTime} - {event.endTime}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#6F6F6A]" />
              {event.venue}
            </p>
          </div>
        </div>

        {/* Ticket Perforation Notches */}
        <div className="relative my-4 -mx-6 flex items-center">
          <div className="w-3.5 h-5 bg-[#F5F4F0] rounded-r-full border-r border-y border-[#DDDCD6]" />
          <div className="flex-1 border-b border-dashed border-[#DDDCD6]" />
          <div className="w-3.5 h-5 bg-[#F5F4F0] rounded-l-full border-l border-y border-[#DDDCD6]" />
        </div>

        {/* QR Block with Dedicated Quiet Zone */}
        <div className="relative z-10 flex flex-col items-center justify-center py-2">
          <div className="p-3.5 rounded-card border border-[#DDDCD6] bg-[#FFFFFF] shadow-subtle">
            {participant.qrToken ? (
              <div id={`qr-${participant.participantId}`}>
                <QRCode
                  id={`qr-svg-${participant.participantId}`}
                  value={participant.qrToken}
                  size={175}
                  level="M"
                />
              </div>
            ) : (
              <div className="w-[175px] h-[175px] flex items-center justify-center bg-[#F0EFEA] text-[#6F6F6A] text-xs">
                QR Not Generated
              </div>
            )}
          </div>
          <span className="mt-2.5 font-mono text-xs font-bold text-[#161616]">
            {participant.participantId}
          </span>
          <span className="text-[10px] text-[#6F6F6A] flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> Valid until: {expiryFormatted}
          </span>
        </div>

        {/* Participant Details */}
        <div className="relative z-10 mt-4 pt-3.5 border-t border-[#DDDCD6] grid grid-cols-2 gap-3 text-left">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6F6F6A] block">
              Participant
            </span>
            <span className="font-semibold text-xs text-[#161616] truncate block">
              {participant.name}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6F6F6A] block">
              Department
            </span>
            <span className="text-xs text-[#161616] truncate block">
              {participant.department}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6F6F6A] block">
              Category
            </span>
            <span className="text-xs text-[#161616]">
              {participant.category} {participant.semester ? `(${participant.semester})` : ''}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6F6F6A] block">
              Movements
            </span>
            <span className="text-xs font-mono text-[#161616]">
              IN: {participant.entryCount} / OUT: {participant.exitCount}
            </span>
          </div>
        </div>

        {/* Bottom Integrity Seal */}
        <div className="relative z-10 mt-4 pt-2.5 border-t border-[#DDDCD6] flex items-center justify-between text-[10px] text-[#6F6F6A]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#16794C]" />
            Tokenized Integrity Verified
          </span>
          <span className="font-mono text-[#9E9D97]">VP-V1</span>
        </div>
      </motion.div>

      {/* Action Button */}
      <div className="mt-3.5 w-full">
        <button
          type="button"
          onClick={handleDownloadQr}
          className="w-full py-2.5 rounded-btn bg-[#161616] hover:bg-[#2A2D30] text-[#FFFFFF] font-semibold text-xs shadow-subtle transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          Download Pass PNG
        </button>
      </div>

      {/* Movement History */}
      {showHistory && (
        <div className="w-full mt-5 rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-4 text-left shadow-subtle">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#DDDCD6]">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#161616] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#E86A00]" />
              Movement History
            </h4>
            <span className="text-[10px] font-mono text-[#6F6F6A]">
              {participant.history.length} records
            </span>
          </div>

          {participant.history.length === 0 ? (
            <p className="text-xs text-[#6F6F6A] py-2 text-center">
              No gate movements recorded yet for this pass.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {participant.history.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-2 rounded-btn bg-[#F5F4F0] border border-[#DDDCD6] text-xs"
                >
                  <div className="flex items-center gap-2">
                    {record.direction === 'IN' ? (
                      <span className="p-1 rounded bg-[#EBF7F0] text-[#16794C]">
                        <ArrowDownRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-[#EEF4FC] text-[#2864A8]">
                        <ArrowUpLeft className="w-3 h-3" />
                      </span>
                    )}
                    <div>
                      <span className="font-medium text-[#161616]">
                        {record.direction === 'IN' ? 'Entry' : 'Exit'} at {record.gate}
                      </span>
                      <span className="block text-[10px] text-[#6F6F6A]">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold ${record.allowed ? 'text-[#16794C]' : 'text-[#C43D3D]'}`}>
                    {record.allowed ? 'Approved' : 'Denied'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
