import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { StudySession, StudyActivityType } from '../../types';
import { useApp } from '../../context/AppContext';
import { getTodayString } from '../../utils/dates';
import { toTotalMinutes } from '../../utils/metrics';

interface AddEditStudySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'> | StudySession) => void;
  initialSession?: StudySession | null;
}

export const AddEditStudySessionModal: React.FC<AddEditStudySessionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSession,
}) => {
  const { subjects, chapters } = useApp();

  const [date, setDate] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [hours, setHours] = useState<number | ''>('');
  const [minutes, setMinutes] = useState<number | ''>('');
  const [questionsAttempted, setQuestionsAttempted] = useState<number | ''>('');
  const [questionsCorrect, setQuestionsCorrect] = useState<number | ''>('');
  const [activityType, setActivityType] = useState<StudyActivityType | ''>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialSession) {
        setDate(initialSession.date);
        setSubjectId(initialSession.subjectId || '');
        setChapterId(initialSession.chapterId || '');
        const totalMins = initialSession.durationMinutes || 0;
        setHours(Math.floor(totalMins / 60));
        setMinutes(totalMins % 60);
        setQuestionsAttempted(initialSession.questionsAttempted ?? initialSession.questionsSolved ?? '');
        setQuestionsCorrect(initialSession.questionsCorrect !== undefined ? initialSession.questionsCorrect : '');
        setActivityType((initialSession.activityType as StudyActivityType) || 'practice');
        setNotes(initialSession.notes || '');
      } else {
        setDate(getTodayString());
        setSubjectId('');
        setChapterId('');
        setHours('');
        setMinutes('');
        setQuestionsAttempted('');
        setQuestionsCorrect('');
        setActivityType('');
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, initialSession]);

  // Filter chapters based on selected subject
  const availableChapters = chapters.filter(c => c.subjectId === subjectId);

  // If subject changes and current chapter is not in that subject, reset chapterId
  const handleSubjectChange = (newSubjectId: string) => {
    setSubjectId(newSubjectId);
    const validInNew = chapters.some(c => c.subjectId === newSubjectId && c.id === chapterId);
    if (!validInNew) {
      setChapterId('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Please select a date.');
      return;
    }
    if (!activityType) {
      setError('Please select an activity type.');
      return;
    }
    if (!subjectId) {
      setError('Please select a subject from your library.');
      return;
    }

    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    const totalMins = toTotalMinutes(h, m);

    if (totalMins <= 0) {
      setError('Study duration must be greater than zero minutes.');
      return;
    }

    const attempted = questionsAttempted === '' ? 0 : Number(questionsAttempted);
    if (attempted < 0 || !Number.isInteger(attempted)) {
      setError('Questions attempted must be a non-negative whole number.');
      return;
    }

    let correct: number | undefined = undefined;
    if (questionsCorrect !== '' && questionsCorrect !== null) {
      correct = Number(questionsCorrect);
      if (correct < 0 || !Number.isInteger(correct)) {
        setError('Questions correct must be a non-negative whole number.');
        return;
      }
      if (correct > attempted) {
        setError(`Questions correct (${correct}) cannot exceed questions attempted (${attempted}).`);
        return;
      }
    }

    const selectedSubject = subjects.find(s => s.id === subjectId);
    const selectedChapter = chapters.find(c => c.id === chapterId);

    const sessionPayload = {
      date,
      subjectId,
      chapterId: chapterId || undefined,
      durationMinutes: totalMins,
      questionsAttempted: attempted,
      questionsCorrect: correct,
      activityType: activityType as StudyActivityType,
      notes: notes.trim() || undefined,
      // Legacy compat:
      subject: selectedSubject?.name,
      topic: selectedChapter?.name,
    };

    if (initialSession) {
      onSave({
        ...initialSession,
        ...sessionPayload,
      });
    } else {
      onSave(sessionPayload);
    }

    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialSession ? 'Edit Study Session' : 'Log Study Session'}
      subtitle="Record dedicated study hours, problem volume, and revision focus"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Date & Activity Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Session Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Activity Type *
            </label>
            <select
              value={activityType}
              onChange={e => setActivityType(e.target.value as StudyActivityType | '')}
              className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            >
              <option value="">Select activity type...</option>
              <option value="practice">Practice / Problem Solving</option>
              <option value="theory">Theory & Conceptual Notes</option>
              <option value="revision">Active Recall / Revision</option>
              <option value="mock_analysis">Mock Analysis & Error Log</option>
            </select>
          </div>
        </div>

        {/* Subject & Chapter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Subject *
            </label>
            <select
              value={subjectId}
              onChange={e => handleSubjectChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            >
              <option value="">{subjects.length === 0 ? 'No subjects found' : 'Select subject...'}</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Chapter (Optional)
            </label>
            <select
              value={chapterId}
              onChange={e => setChapterId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            >
              <option value="">General / Unassigned</option>
              {availableChapters.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.isWeak ? '(!)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration: Hours & Minutes */}
        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
            Duration *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="number"
                min="0"
                max="24"
                value={hours}
                onChange={e => setHours(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] font-mono tabular-nums pr-12"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-[#8E8EA0] pointer-events-none">
                hours
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={e => setMinutes(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] font-mono tabular-nums pr-12"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-[#8E8EA0] pointer-events-none">
                mins
              </span>
            </div>
          </div>
        </div>

        {/* Questions Attempted & Questions Correct */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Questions Attempted
            </label>
            <input
              type="number"
              min="0"
              value={questionsAttempted}
              onChange={e => setQuestionsAttempted(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
              placeholder="0"
              className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] font-mono tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Correct (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={questionsCorrect}
              onChange={e => setQuestionsCorrect(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
              placeholder="e.g. 22"
              className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] font-mono tabular-nums"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
            Session Notes / Reference (Optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Key problem set, textbook reference, or takeaways..."
            className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors resize-none"
          />
        </div>

        {/* Buttons */}
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
            {initialSession ? 'Update Session' : 'Save Session'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
