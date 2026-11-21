import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Chapter } from '../../types';

interface ChapterNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
  onSaveNotes: (chapterId: string, notes: string) => void;
}

export const ChapterNotesModal: React.FC<ChapterNotesModalProps> = ({
  isOpen,
  onClose,
  chapter,
  onSaveNotes,
}) => {
  const [notes, setNotes] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && chapter) {
      setNotes(chapter.notes || '');
      setHasUnsavedChanges(false);
      setShowDiscardConfirm(false);
    }
  }, [isOpen, chapter]);

  if (!chapter) return null;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setHasUnsavedChanges(e.target.value !== (chapter.notes || ''));
  };

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    onSaveNotes(chapter.id, notes.trim());
    setHasUnsavedChanges(false);
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleCloseAttempt}
      title={`Notes: ${chapter.name}`}
      subtitle="Formula summaries, mistake traps, and conceptual takeaways"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {showDiscardConfirm ? (
          <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-3">
            <p className="text-xs text-amber-200">
              You have unsaved changes in your notes. Discarding will lose the new text you entered.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-3 py-1.5 text-xs text-[#F3F3F7] hover:bg-[#1B1B26] border border-[#292936] rounded-lg transition-colors cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  setHasUnsavedChanges(false);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs text-red-300 bg-red-950/60 border border-red-500/40 hover:bg-red-900/60 rounded-lg transition-colors cursor-pointer"
              >
                Discard Changes
              </button>
            </div>
          </div>
        ) : null}

        <div>
          <textarea
            value={notes}
            onChange={handleChange}
            rows={10}
            placeholder="Type formulas, notes, or specific mistakes to remember for this chapter..."
            className="w-full px-4 py-3 bg-[#0B0B10] border border-[#292936] rounded-xl text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors resize-y leading-relaxed font-mono"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#292936]">
          <span className="text-[11px] text-[#8E8EA0]">
            {hasUnsavedChanges ? 'Unsaved edits present' : 'All notes saved'}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCloseAttempt}
              className="px-4 py-2 text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] bg-transparent hover:bg-[#1B1B26] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors focus:ring-2 focus:ring-[#9B7BFF]/40 cursor-pointer"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
