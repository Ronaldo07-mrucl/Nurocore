import React, { useState } from 'react';
import { ReflectionEntry } from '../../types';
import { ModalWrapper } from './ModalWrapper';
import { formatShortDate } from '../../utils/dates';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface JournalConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: ReflectionEntry[];
  dateRangeLabel: string;
  onConfirm: (approvedEntryIds: string[], rememberChoice: boolean) => void;
  onExcludeAll: () => void;
}

export const JournalConsentModal: React.FC<JournalConsentModalProps> = ({
  isOpen,
  onClose,
  entries,
  dateRangeLabel,
  onConfirm,
  onExcludeAll,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(entries.map(e => e.id));
  const [previewEntryId, setPreviewEntryId] = useState<string | null>(null);
  const [rememberChoice, setRememberChoice] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(entries.map(e => e.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Private Journal Sharing Permission"
      subtitle={`Review before transmitting reflections for ${dateRangeLabel}`}
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col flex-1 overflow-hidden space-y-4 p-6">
        {/* Notice Card */}
        <div className="p-3.5 bg-[#9B7BFF]/10 border border-[#9B7BFF]/30 rounded-xl flex items-start gap-3 text-xs text-[#C5C5D2] leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-[#9B7BFF] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-[#F3F3F7] block">
              Explicit Privacy Protection
            </span>
            <p>
              Your personal diary reflections may contain sensitive thoughts and emotional notes.
              By default, NEUROCORE excludes your journal from external AI requests. If you proceed,
              only the specific entries selected below will be included in the context payload.
            </p>
          </div>
        </div>

        {/* Entries Selection Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8E8EA0]">
            <span className="font-medium uppercase tracking-wider">
              {entries.length} {entries.length === 1 ? 'Reflection Entry' : 'Reflection Entries'} in Period
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[#9B7BFF] hover:underline"
              >
                Select all
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-[#8E8EA0] hover:text-[#F3F3F7]"
              >
                Deselect all
              </button>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {entries.length > 0 ? (
              entries.map(entry => {
                const isChecked = selectedIds.includes(entry.id);
                const isPreview = previewEntryId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isChecked
                        ? 'bg-[#181824] border-[#9B7BFF]/40'
                        : 'bg-[#14141D] border-[#292936] opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(entry.id)}
                          className="mt-0.5 rounded border-[#292936] text-[#9B7BFF] focus:ring-0 bg-[#0B0B10]"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#F3F3F7]">
                              {formatShortDate(entry.date)}
                            </span>
                            {entry.mood && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#292936] text-[#8E8EA0]">
                                {entry.mood}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#C5C5D2] block line-clamp-1">
                            {entry.title}
                          </span>
                        </div>
                      </label>

                      <button
                        type="button"
                        onClick={() => setPreviewEntryId(isPreview ? null : entry.id)}
                        className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] rounded transition-colors shrink-0"
                        title={isPreview ? 'Hide preview' : 'Preview entry text'}
                      >
                        {isPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {isPreview && (
                      <div className="mt-2.5 pt-2.5 border-t border-[#292936] text-xs text-[#8E8EA0] leading-relaxed bg-[#101017] p-2.5 rounded">
                        <p className="line-clamp-4 whitespace-pre-wrap">{entry.content}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[#8E8EA0] bg-[#14141D] rounded-lg border border-[#292936]">
                No reflection entries were recorded during this reporting window.
              </div>
            )}
          </div>
        </div>

        {/* Remember choice checkbox */}
        <label className="flex items-center gap-2 text-xs text-[#8E8EA0] cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={rememberChoice}
            onChange={e => setRememberChoice(e.target.checked)}
            className="rounded border-[#292936] text-[#9B7BFF] focus:ring-0 bg-[#0B0B10]"
          />
          <span>Remember my journal consent preference (can be revoked in AI Settings anytime)</span>
        </label>

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#292936]">
          <button
            type="button"
            onClick={() => {
              onExcludeAll();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-[#C5C5D2] hover:text-white bg-[#181824] hover:bg-[#20202F] border border-[#292936] rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-[#43D9A3]" />
            <span>Exclude Journal Entries</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(selectedIds, rememberChoice);
                onClose();
              }}
              disabled={selectedIds.length === 0}
              className="px-4 py-2 text-xs font-semibold bg-[#9B7BFF] hover:bg-[#8A67FF] disabled:opacity-50 text-white rounded-lg shadow-sm shadow-[#9B7BFF]/30 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Share {selectedIds.length} {selectedIds.length === 1 ? 'Entry' : 'Entries'} & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
