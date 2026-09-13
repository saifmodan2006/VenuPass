import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-dialog border border-[#DDDCD6] bg-[#FFFFFF] p-6 shadow-elevated">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[#6F6F6A] hover:text-[#161616] p-1 rounded-btn hover:bg-[#F0EFEA] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-3">
          <div
            className={`p-2.5 rounded-btn flex-shrink-0 ${
              variant === 'danger'
                ? 'bg-[#FDF0F0] text-[#C43D3D] border border-[#C43D3D]/20'
                : 'bg-[#FDF6E9] text-[#A96500] border border-[#A96500]/20'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-[#161616]">{title}</h3>
            <p className="text-xs text-[#6F6F6A] mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-[#DDDCD6]">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-[#161616] bg-[#F0EFEA] hover:bg-[#EAE8E1] rounded-btn transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-btn text-white shadow-subtle transition-all ${
              variant === 'danger'
                ? 'bg-[#C43D3D] hover:bg-[#A93333]'
                : 'bg-[#E86A00] hover:bg-[#B94D00]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
