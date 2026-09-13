import React from 'react';
import { ParticipantState, QrStatus, ScanResult } from '../../types';

interface StatusBadgeProps {
  type: 'state' | 'qr' | 'result' | 'suspicious' | 'capacity';
  value: ParticipantState | QrStatus | ScanResult | boolean | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] font-medium' : 'px-2.5 py-1 text-xs font-semibold';

  if (type === 'state') {
    switch (value) {
      case 'INSIDE':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#EBF7F0] text-[#16794C] border border-[#16794C]/25 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16794C]" />
            INSIDE
          </span>
        );
      case 'EXITED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#F0EFEA] text-[#6F6F6A] border border-[#DDDCD6] ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#9E9D97]" />
            EXITED
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FDF6E9] text-[#A96500] border border-[#A96500]/25 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#A96500]" />
            NOT ENTERED
          </span>
        );
    }
  }

  if (type === 'qr') {
    return value === 'GENERATED' ? (
      <span className={`inline-flex items-center rounded-full bg-[#EEF4FC] text-[#2864A8] border border-[#2864A8]/20 ${sizeClasses}`}>
        Active Pass
      </span>
    ) : (
      <span className={`inline-flex items-center rounded-full bg-[#F0EFEA] text-[#6F6F6A] border border-[#DDDCD6] ${sizeClasses}`}>
        No QR
      </span>
    );
  }

  if (type === 'result') {
    return value === 'ALLOWED' ? (
      <span className={`inline-flex items-center gap-1 rounded-full bg-[#EBF7F0] text-[#16794C] border border-[#16794C]/20 ${sizeClasses}`}>
        ✓ Allowed
      </span>
    ) : (
      <span className={`inline-flex items-center gap-1 rounded-full bg-[#FDF0F0] text-[#C43D3D] border border-[#C43D3D]/25 ${sizeClasses}`}>
        ✕ Denied
      </span>
    );
  }

  if (type === 'suspicious') {
    return value ? (
      <span className={`inline-flex items-center gap-1 rounded-full bg-[#FDF0F0] text-[#C43D3D] border border-[#C43D3D] font-bold ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#C43D3D]" />
        SUSPICIOUS
      </span>
    ) : (
      <span className="text-[#9E9D97] text-[11px]">Normal</span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-[#F0EFEA] text-[#161616] border border-[#DDDCD6] ${sizeClasses}`}>
      {String(value)}
    </span>
  );
};
