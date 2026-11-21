import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Chapter, ChapterMastery } from '../../types';

interface AddEditChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'> | Chapter) => void;
  subjectId: string;
  initialChapter?: Chapter | null;
}

export const AddEditChapterModal: React.FC<AddEditChapterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjectId,
  initialChapter,
}) => {
  const [name, setName] = useState('');
  const [mastery, setMastery] = useState<ChapterMastery>('nil');
  const [revisionCount, setRevisionCount] = useState<number>(0);
  const [isWeak, setIsWeak] = useState(false);
  const [needsInstantRevision, setNeedsInstantRevision] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialChapter) {
        setName(initialChapter.name);
        setMastery(initialChapter.mastery);
        setRevisionCount(initialChapter.revisionCount || 0);
        setIsWeak(initialChapter.isWeak || false);
        setNeedsInstantRevision(initialChapter.needsInstantRevision || false);
        setNotes(initialChapter.notes || '');
      } else {
        setName('');
        setMastery('nil');
        setRevisionCount(0);
        setIsWeak(false);
        setNeedsInstantRevision(false);
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, initialChapter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please provide a chapter name.');
      return;
    }

    if (initialChapter) {
      onSave({
        ...initialChapter,
        name: cleanName,
        mastery,
        revisionCount: Math.max(0, revisionCount),
        isWeak,
        needsInstantRevision,
        notes: notes.trim(),
      });
    } else {
      onSave({
        subjectId,
        name: cleanName,
        mastery,
        revisionCount: Math.max(0, revisionCount),
        isWeak,
        needsInstantRevision,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialChapter ? 'Edit Chapter' : 'Add Chapter'}
      subtitle="Track curriculum breakdown, mastery milestones, and revision flags"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
            Chapter / Topic Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Rotational Dynamics, Thermodynamics, Matrices"
            className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Initial Mastery Level
            </label>
            <select
              value={mastery}
              onChange={e => setMastery(e.target.value as ChapterMastery)}
              className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            >
              <option value="nil">Nil (Not Started / 0%)</option>
              <option value="mains">Mains Standard (33%)</option>
              <option value="advanced">Advanced Standard (67%)</option>
              <option value="extreme">Extreme Mastery (100%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Revision Count
            </label>
            <input
              type="number"
              min="0"
              value={revisionCount}
              onChange={e => setRevisionCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] font-mono tabular-nums"
            />
          </div>
        </div>

        {/* Weak Flag */}
        <div className="p-3 bg-[#0B0B10] border border-[#292936] rounded-lg">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isWeak}
              onChange={e => setIsWeak(e.target.checked)}
              className="w-4 h-4 rounded border-[#292936] text-[#9B7BFF] focus:ring-0 accent-[#9B7BFF] bg-[#14141D]"
            />
            <span className="text-xs font-medium text-[#F3F3F7]">
              Flag as Weak Chapter (Frequent mistakes / low test accuracy)
            </span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
            Initial Notes & Key Formulas (Optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Key problem pain points, edge-case concepts, high-yield formula reminders..."
            className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292936]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] bg-transparent hover:bg-[#1B1B26] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors focus:ring-2 focus:ring-[#9B7BFF]/40 cursor-pointer"
          >
            {initialChapter ? 'Save Changes' : 'Add Chapter'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
