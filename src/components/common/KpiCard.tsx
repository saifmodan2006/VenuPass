import React from 'react';

interface KpiCardProps {
  label: string;
  value: number | string;
  subValue?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subValue,
  icon,
  highlight = false,
}) => {
  return (
    <div
      className={`rounded-card border bg-[#FFFFFF] p-4 transition-all ${
        highlight
          ? 'border-[#E86A00] ring-1 ring-[#E86A00]/20 bg-[#FFFDFB]'
          : 'border-[#DDDCD6] shadow-subtle'
      }`}
    >
      <div className="flex items-center justify-between text-[#6F6F6A]">
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </span>
        {icon && <div className="text-[#6F6F6A]">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#161616]">
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-normal text-[#6F6F6A]">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};
