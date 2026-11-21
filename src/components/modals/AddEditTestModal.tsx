import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { TestRecord, ExamType } from '../../types';
import { useApp } from '../../context/AppContext';
import { getTodayString } from '../../utils/dates';
import { Check, Plus } from 'lucide-react';

interface AddEditTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testData: Omit<TestRecord, 'id' | 'createdAt'> | TestRecord) => void;
  initialTest?: TestRecord | null;
}

function parseCommaList(raw: string): string[] {
  if (!raw.trim()) return [];
  const items: string[] = [];
  let current = '';
  let depth = 0;

  for (const ch of raw) {
    if (ch === '(') {
      depth++;
      current += ch;
    } else if (ch === ')' && depth > 0) {
      depth--;
      current += ch;
    } else if (ch === ',' && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) items.push(trimmed);
      current = '';
    } else {
      current += ch;
    }
  }

  const last = current.trim();
  if (last) items.push(last);
  return items;
}

function toggleChapterInList(currentRaw: string, chapterName: string): string {
  const existing = parseCommaList(currentRaw);
  const targetKey = chapterName.trim().toLowerCase();
  const alreadyPresent = existing.some(item => item.toLowerCase() === targetKey);
  if (alreadyPresent) {
    return existing.filter(item => item.toLowerCase() !== targetKey).join(', ');
  }
  return [...existing, chapterName.trim()].join(', ');
}

export const AddEditTestModal: React.FC<AddEditTestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTest,
}) => {
  const { subjects, chapters } = useApp();

  const [name, setName] = useState('');
  const [examType, setExamType] = useState<ExamType>('Mains');
  const [date, setDate] = useState('');
  const [marksObtained, setMarksObtained] = useState<number | ''>('');
  const [totalMarks, setTotalMarks] = useState<number | ''>(300);
  const [subjectSyllabus, setSubjectSyllabus] = useState<Record<string, string>>({});
  const [legacySyllabus, setLegacySyllabus] = useState('');
  const [weakChapters, setWeakChapters] = useState('');
  const [errorLogSummary, setErrorLogSummary] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTest) {
        setName(initialTest.name);
        setExamType(initialTest.examType);
        setDate(initialTest.date);
        setMarksObtained(initialTest.marksObtained);
        setTotalMarks(initialTest.totalMarks);
        setWeakChapters(initialTest.weakChapters || '');
        setErrorLogSummary(initialTest.errorLogSummary || '');

        const nextMap: Record<string, string> = {};
        subjects.forEach(s => {
          nextMap[s.id] = initialTest.subjectSyllabus?.[s.id] || '';
        });

        let remainingLegacy = '';
        if (!initialTest.subjectSyllabus && initialTest.syllabusSummary) {
          const lines = initialTest.syllabusSummary.split('\n');
          const unmatchedLines: string[] = [];
          lines.forEach(line => {
            const colonIdx = line.indexOf(':');
            if (colonIdx > 0) {
              const prefix = line.slice(0, colonIdx).trim().toLowerCase();
              const rest = line.slice(colonIdx + 1).trim();
              const matchedSubject = subjects.find(s => s.name.trim().toLowerCase() === prefix);
              if (matchedSubject) {
                nextMap[matchedSubject.id] = rest;
                return;
              }
            }
            if (line.trim()) unmatchedLines.push(line.trim());
          });
          remainingLegacy = unmatchedLines.join(', ');
        }

        setSubjectSyllabus(nextMap);
        setLegacySyllabus(remainingLegacy);
      } else {
        setName('');
        setExamType('Mains');
        setDate(getTodayString());
        setMarksObtained('');
        setTotalMarks(300);
        const blankMap: Record<string, string> = {};
        subjects.forEach(s => {
          blankMap[s.id] = '';
        });
        setSubjectSyllabus(blankMap);
        setLegacySyllabus('');
        setWeakChapters('');
        setErrorLogSummary('');
      }
      setError(null);
    }
  }, [isOpen, initialTest, subjects]);

  const handleExamTypeChange = (type: ExamType) => {
    setExamType(type);
    if (!initialTest) {
      setTotalMarks(type === 'Mains' ? 300 : 360);
    }
  };

  const handleSubjectSyllabusChange = (subjectId: string, value: string) => {
    setSubjectSyllabus(prev => ({
      ...prev,
      [subjectId]: value,
    }));
  };

  const handleToggleLibraryChapter = (subjectId: string, chapterName: string) => {
    setSubjectSyllabus(prev => ({
      ...prev,
      [subjectId]: toggleChapterInList(prev[subjectId] || '', chapterName),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a test name.');
      return;
    }
    if (!date) {
      setError('Please select a test date.');
      return;
    }
    if (marksObtained === '' || isNaN(Number(marksObtained))) {
      setError('Please enter the marks obtained.');
      return;
    }
    if (totalMarks === '' || isNaN(Number(totalMarks))) {
      setError('Please enter the total marks.');
      return;
    }

    const marks = Number(marksObtained);
    const total = Number(totalMarks);

    if (total <= 0) {
      setError('Total marks must be greater than zero.');
      return;
    }
    if (marks < 0) {
      setError('Marks obtained cannot be negative.');
      return;
    }
    if (marks > total) {
      setError(`Marks obtained (${marks}) cannot exceed total marks (${total}).`);
      return;
    }

    const cleanSubjectSyllabus: Record<string, string> = {};
    const summaryParts: string[] = [];

    subjects.forEach(s => {
      const val = (subjectSyllabus[s.id] || '').trim();
      if (val) {
        cleanSubjectSyllabus[s.id] = val;
        summaryParts.push(`${s.name}: ${val}`);
      }
    });

    if (legacySyllabus.trim()) {
      summaryParts.push(legacySyllabus.trim());
    }

    const hasSubjectSyllabus = Object.keys(cleanSubjectSyllabus).length > 0;
    const combinedSummary = summaryParts.join('\n').trim() || undefined;

    if (initialTest) {
      onSave({
        ...initialTest,
        name: name.trim(),
        examType,
        date,
        marksObtained: marks,
        totalMarks: total,
        subjectSyllabus: hasSubjectSyllabus ? cleanSubjectSyllabus : undefined,
        syllabusSummary: combinedSummary,
        weakChapters: weakChapters.trim() || undefined,
        errorLogSummary: errorLogSummary.trim() || undefined,
      });
    } else {
      onSave({
        name: name.trim(),
        examType,
        date,
        marksObtained: marks,
        totalMarks: total,
        subjectSyllabus: hasSubjectSyllabus ? cleanSubjectSyllabus : undefined,
        syllabusSummary: combinedSummary,
        weakChapters: weakChapters.trim() || undefined,
        errorLogSummary: errorLogSummary.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialTest ? 'Edit Test Record' : 'Log New Test & Performance'}
      subtitle="Track your marks, errors, and weak chapters with precision"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
            Test Title *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. AITS Mains Simulation 04, Advanced Challenge 02"
            className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Exam Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleExamTypeChange('Mains')}
                className={`py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  examType === 'Mains'
                    ? 'border-[#9B7BFF] bg-[#9B7BFF]/15 text-[#9B7BFF]'
                    : 'border-[#292936] bg-[#0B0B10] text-[#8E8EA0] hover:text-[#F3F3F7]'
                }`}
              >
                Mains (300)
              </button>
              <button
                type="button"
                onClick={() => handleExamTypeChange('Advanced')}
                className={`py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  examType === 'Advanced'
                    ? 'border-[#43D9A3] bg-[#43D9A3]/15 text-[#43D9A3]'
                    : 'border-[#292936] bg-[#0B0B10] text-[#8E8EA0] hover:text-[#F3F3F7]'
                }`}
              >
                Advanced (360)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Test Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Marks Obtained *
            </label>
            <input
              type="number"
              min={0}
              max={Number(totalMarks) || 500}
              value={marksObtained}
              onChange={e => setMarksObtained(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 235"
              className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] font-mono tabular-nums text-base"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Total Marks *
            </label>
            <input
              type="number"
              min={1}
              value={totalMarks}
              onChange={e => setTotalMarks(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] font-mono tabular-nums text-base"
            />
          </div>
        </div>

        {/* Syllabus Covered - Per Subject Blanks + Study Log Chapter Picker */}
        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-2">
            Syllabus Covered (By Subject)
          </label>

          {subjects.length > 0 ? (
            <div className="space-y-3">
              {subjects.map(subj => {
                const subjectChapters = chapters.filter(c => c.subjectId === subj.id);
                const currentText = subjectSyllabus[subj.id] || '';
                const selectedSet = new Set(
                  parseCommaList(currentText).map(item => item.toLowerCase())
                );

                return (
                  <div
                    key={subj.id}
                    className="p-3 bg-[#0B0B10]/60 border border-[#292936] rounded-lg space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-center gap-2">
                      <span className="text-xs font-semibold text-[#F3F3F7] truncate">
                        {subj.name}
                      </span>
                      <input
                        type="text"
                        value={currentText}
                        onChange={e => handleSubjectSyllabusChange(subj.id, e.target.value)}
                        placeholder={`Type or pick ${subj.name} chapters`}
                        className="w-full px-3 py-2 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
                      />
                    </div>

                    {subjectChapters.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-0.5">
                        {subjectChapters.map(ch => {
                          const isSelected = selectedSet.has(ch.name.trim().toLowerCase());
                          return (
                            <button
                              key={ch.id}
                              type="button"
                              onClick={() => handleToggleLibraryChapter(subj.id, ch.name)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#9B7BFF]/20 border-[#9B7BFF]/50 text-[#F3F3F7] font-medium'
                                  : 'bg-[#14141D] border-[#292936] text-[#8E8EA0] hover:text-[#F3F3F7] hover:border-[#3B3B4E]'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-3 h-3 text-[#9B7BFF] shrink-0" />
                              ) : (
                                <Plus className="w-3 h-3 shrink-0" />
                              )}
                              <span>{ch.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {legacySyllabus && (
                <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-center gap-2 pt-1">
                  <span className="text-xs font-medium text-[#8E8EA0] truncate">
                    Other / General
                  </span>
                  <input
                    type="text"
                    value={legacySyllabus}
                    onChange={e => setLegacySyllabus(e.target.value)}
                    placeholder="Comma-separated chapters"
                    className="w-full px-3 py-2 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
                  />
                </div>
              )}
            </div>
          ) : (
            <input
              type="text"
              value={legacySyllabus}
              onChange={e => setLegacySyllabus(e.target.value)}
              placeholder="e.g. Kinematics, GOC, Chemical Bonding, Calculus"
              className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
            Weak Chapters & Topics Identified
          </label>
          <input
            type="text"
            value={weakChapters}
            onChange={e => setWeakChapters(e.target.value)}
            placeholder="e.g. Rotational inertia, Electrodynamics multi-correct"
            className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
            Error Log Summary & Key Takeaways
          </label>
          <textarea
            value={errorLogSummary}
            onChange={e => setErrorLogSummary(e.target.value)}
            rows={2}
            placeholder="e.g. 3 calculation slips, 2 unattempted due to time crunch in math section..."
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
            {initialTest ? 'Update Test Record' : 'Save Test Record'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
