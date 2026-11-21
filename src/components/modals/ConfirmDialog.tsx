import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  isDestructive = false,
}) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-[#9B7BFF]/10 text-[#9B7BFF] border border-[#9B7BFF]/20'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm text-[#8E8EA0] leading-relaxed pt-1">{description}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292936]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] bg-transparent hover:bg-[#1B1B26] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 focus:ring-2 focus:ring-red-500/40'
                : 'bg-[#9B7BFF] hover:bg-[#8864f7] focus:ring-2 focus:ring-[#9B7BFF]/40'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
