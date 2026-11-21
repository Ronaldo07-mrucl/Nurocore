import React, { useState, useEffect, useMemo } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useApp } from '../../context/AppContext';
import { TestError, ErrorType, Subject, TestRecord } from '../../types';
import { ERROR_TYPE_LABELS, getErrorTypeBadgeStyle } from '../../utils/metrics';

interface AddEditErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (errorData: Omit<TestError, 'id' | 'createdAt' | 'updatedAt'> | TestError) => void;
  initialError?: TestError | null;
  lockedTestId?: string;
}

const SYLLABUS_OPTION_PREFIX = 'syllabus:';

/**
 * Splits a comma/semicolon/newline-separated chapter string into clean chapter names,
 * preserving commas inside parentheses like "Mechanics 1 (Kinematics, NLM)".
 */
function splitChapterList(raw?: string): string[] {
  if (!raw || !raw.trim()) return [];

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
    } else if ((ch === ',' || ch === ';' || ch === '\n') && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) items.push(trimmed);
      current = '';
    } else {
      current += ch;
    }
  }

  const last = current.trim();
  if (last) items.push(last);

  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Resolves the test's uploaded chapter names for the currently selected subject.
 * - Uses structured `test.subjectSyllabus[subjectId]` if present.
 * - Also supports `SubjectName: ch1, ch2` formatted lines inside `test.syllabusSummary`.
 * - Falls back to unstructured `test.syllabusSummary` when no subject-specific map exists.
 */
function getTestChaptersForSubject(
  test: TestRecord | undefined,
  subjectId: string,
  subjects: Subject[],
  libraryChapters: { id: string; subjectId: string; name: string }[]
): { name: string; subjectLabel?: string }[] {
  if (!test) return [];

  // 1. Structured subjectSyllabus stored on the test entry
  if (test.subjectSyllabus && Object.keys(test.subjectSyllabus).length > 0) {
    if (subjectId) {
      return splitChapterList(test.subjectSyllabus[subjectId]).map(name => ({ name }));
    }
    // No subject chosen: show all uploaded syllabus chapters across subjects
    const all: { name: string; subjectLabel?: string }[] = [];
    subjects.forEach(s => {
      splitChapterList(test.subjectSyllabus?.[s.id]).forEach(name => {
        all.push({ name, subjectLabel: s.name });
      });
    });
    return all;
  }

  if (!test.syllabusSummary?.trim()) return [];

  // 2. Check if syllabusSummary uses "SubjectName: ch1, ch2" lines
  const lines = test.syllabusSummary.split('\n').map(l => l.trim()).filter(Boolean);
  const parsedBySubject: Record<string, string[]> = {};
  const unstructuredParts: string[] = [];

  lines.forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const prefix = line.slice(0, colonIdx).trim().toLowerCase();
      const rest = line.slice(colonIdx + 1).trim();
      const matchedSubject = subjects.find(s => s.name.trim().toLowerCase() === prefix);
      if (matchedSubject) {
        parsedBySubject[matchedSubject.id] = [
          ...(parsedBySubject[matchedSubject.id] || []),
          ...splitChapterList(rest),
        ];
        return;
      }
    }
    unstructuredParts.push(line);
  });

  if (Object.keys(parsedBySubject).length > 0) {
    if (subjectId) {
      return (parsedBySubject[subjectId] || []).map(name => ({ name }));
    }
    const all: { name: string; subjectLabel?: string }[] = [];
    subjects.forEach(s => {
      (parsedBySubject[s.id] || []).forEach(name => {
        all.push({ name, subjectLabel: s.name });
      });
    });
    return all;
  }

  // 3. Legacy unstructured syllabusSummary: shortlist against library chapter subjects where known
  const rawNames = splitChapterList(unstructuredParts.join(', '));
  if (!subjectId) {
    return rawNames.map(name => ({ name }));
  }

  return rawNames
    .filter(name => {
      const libMatch = libraryChapters.find(
        c => c.name.trim().toLowerCase() === name.toLowerCase()
      );
      return !libMatch || libMatch.subjectId === subjectId;
    })
    .map(name => ({ name }));
}

export const AddEditErrorModal: React.FC<AddEditErrorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialError,
  lockedTestId,
}) => {
  const { tests, subjects, chapters } = useApp();

  const [testId, setTestId] = useState('');
  const [questionNumber, setQuestionNumber] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [selectedChapterValue, setSelectedChapterValue] = useState('');
  const [topic, setTopic] = useState('');
  const [errorType, setErrorType] = useState<ErrorType>('conceptual');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [correctApproach, setCorrectApproach] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [resolved, setResolved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const activeTestId = lockedTestId || testId;
  const activeTest = useMemo(
    () => tests.find(t => t.id === activeTestId),
    [tests, activeTestId]
  );

  // Chapters shortlisted from the active test entry according to the selected subject
  const testSyllabusChapters = useMemo(() => {
    const rawItems = getTestChaptersForSubject(activeTest, subjectId, subjects, chapters);
    return rawItems.map(({ name, subjectLabel }) => {
      const matchingLibraryChapter =
        chapters.find(
          c =>
            c.name.trim().toLowerCase() === name.toLowerCase() &&
            (!subjectId || c.subjectId === subjectId)
        ) || chapters.find(c => c.name.trim().toLowerCase() === name.toLowerCase());

      return {
        name,
        displayLabel: subjectLabel ? `${subjectLabel} · ${name}` : name,
        value: matchingLibraryChapter
          ? matchingLibraryChapter.id
          : `${SYLLABUS_OPTION_PREFIX}${name}`,
        libraryChapter: matchingLibraryChapter,
      };
    });
  }, [activeTest, subjectId, subjects, chapters]);

  // Remaining subject library chapters shortlisted by the selected subject
  const availableLibraryChapters = useMemo(() => {
    const syllabusIds = new Set(
      testSyllabusChapters.map(item => item.libraryChapter?.id).filter(Boolean)
    );
    const syllabusNames = new Set(
      testSyllabusChapters.map(item => item.name.toLowerCase())
    );
    return chapters.filter(
      c =>
        (!subjectId || c.subjectId === subjectId) &&
        !syllabusIds.has(c.id) &&
        !syllabusNames.has(c.name.trim().toLowerCase())
    );
  }, [chapters, subjectId, testSyllabusChapters]);

  useEffect(() => {
    if (isOpen) {
      if (initialError) {
        setTestId(initialError.testId);
        setQuestionNumber(initialError.questionNumber || '');
        setSubjectId(initialError.subjectId || '');
        if (initialError.chapterId) {
          setSelectedChapterValue(initialError.chapterId);
        } else if (initialError.chapterName) {
          setSelectedChapterValue(`${SYLLABUS_OPTION_PREFIX}${initialError.chapterName}`);
        } else {
          setSelectedChapterValue('');
        }
        setTopic(initialError.topic || '');
        setErrorType(initialError.errorType);
        setDescription(initialError.description);
        setReason(initialError.reason || '');
        setCorrectApproach(initialError.correctApproach || '');
        setCorrectiveAction(initialError.correctiveAction || '');
        setResolved(Boolean(initialError.resolved));
      } else {
        setTestId(lockedTestId || (tests.length > 0 ? tests[0].id : ''));
        setQuestionNumber('');
        setSubjectId(subjects.length > 0 ? subjects[0].id : '');
        setSelectedChapterValue('');
        setTopic('');
        setErrorType('conceptual');
        setDescription('');
        setReason('');
        setCorrectApproach('');
        setCorrectiveAction('');
        setResolved(false);
      }
      setFormError(null);
    }
  }, [isOpen, initialError, lockedTestId, tests, subjects]);

  // When subject changes, shortlist chapters for that subject and clear selection if it doesn't belong
  const handleSubjectChange = (newSubjectId: string) => {
    setSubjectId(newSubjectId);
    if (!selectedChapterValue) return;

    const nextTestChapters = getTestChaptersForSubject(activeTest, newSubjectId, subjects, chapters);
    if (selectedChapterValue.startsWith(SYLLABUS_OPTION_PREFIX)) {
      const selectedName = selectedChapterValue.slice(SYLLABUS_OPTION_PREFIX.length).toLowerCase();
      const stillValid = nextTestChapters.some(item => item.name.toLowerCase() === selectedName);
      if (!stillValid) {
        setSelectedChapterValue('');
      }
    } else {
      const existsInSubject = chapters.some(
        c => c.id === selectedChapterValue && (!newSubjectId || c.subjectId === newSubjectId)
      );
      if (!existsInSubject) {
        setSelectedChapterValue('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetTestId = lockedTestId || testId;
    if (!targetTestId) {
      setFormError('Please select or specify a test record.');
      return;
    }

    if (!description.trim()) {
      setFormError('Please describe the error or mistake.');
      return;
    }

    let resolvedChapterId: string | undefined = undefined;
    let resolvedChapterName: string | undefined = undefined;

    if (selectedChapterValue.startsWith(SYLLABUS_OPTION_PREFIX)) {
      resolvedChapterName = selectedChapterValue.slice(SYLLABUS_OPTION_PREFIX.length).trim() || undefined;
    } else if (selectedChapterValue) {
      resolvedChapterId = selectedChapterValue;
      const libChap = chapters.find(c => c.id === selectedChapterValue);
      resolvedChapterName = libChap?.name;
    }

    if (initialError) {
      onSave({
        ...initialError,
        testId: targetTestId,
        questionNumber: questionNumber.trim() || undefined,
        subjectId: subjectId || undefined,
        chapterId: resolvedChapterId,
        chapterName: resolvedChapterName,
        topic: topic.trim() || undefined,
        errorType,
        description: description.trim(),
        reason: reason.trim() || undefined,
        correctApproach: correctApproach.trim() || undefined,
        correctiveAction: correctiveAction.trim() || undefined,
        resolved,
      });
    } else {
      onSave({
        testId: targetTestId,
        questionNumber: questionNumber.trim() || undefined,
        subjectId: subjectId || undefined,
        chapterId: resolvedChapterId,
        chapterName: resolvedChapterName,
        topic: topic.trim() || undefined,
        errorType,
        description: description.trim(),
        reason: reason.trim() || undefined,
        correctApproach: correctApproach.trim() || undefined,
        correctiveAction: correctiveAction.trim() || undefined,
        resolved,
      });
    }

    onClose();
  };

  const badgeStyle = getErrorTypeBadgeStyle(errorType);
  const selectedSubjectName = subjects.find(s => s.id === subjectId)?.name;

  // Check if editing an error whose chapter isn't in the current shortlist
  const isSelectedInOptions =
    !selectedChapterValue ||
    testSyllabusChapters.some(item => item.value === selectedChapterValue) ||
    availableLibraryChapters.some(c => c.id === selectedChapterValue);

  const orphanChapterLabel = !isSelectedInOptions
    ? selectedChapterValue.startsWith(SYLLABUS_OPTION_PREFIX)
      ? selectedChapterValue.slice(SYLLABUS_OPTION_PREFIX.length)
      : chapters.find(c => c.id === selectedChapterValue)?.name || ''
    : '';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialError ? 'Edit Mistake Entry' : 'Log Exam Mistake / Error'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {formError && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
            {formError}
          </div>
        )}

        {/* Test Selector (only if not locked) */}
        {!lockedTestId && (
          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Associated Mock Test *
            </label>
            <select
              value={testId}
              onChange={e => {
                setTestId(e.target.value);
                if (selectedChapterValue.startsWith(SYLLABUS_OPTION_PREFIX)) {
                  setSelectedChapterValue('');
                }
              }}
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden"
              required
            >
              {tests.length === 0 ? (
                <option value="">No tests available — create a test first</option>
              ) : (
                tests.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.examType} · {t.date})
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {/* Row 1: Question # & Error Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Question # / Section
            </label>
            <input
              type="text"
              value={questionNumber}
              onChange={e => setQuestionNumber(e.target.value)}
              placeholder="e.g. Q14, Paper 1 Sec B"
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold">
                Error Classification *
              </label>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-sm border ${badgeStyle.bgClass} ${badgeStyle.textClass} ${badgeStyle.borderClass}`}
              >
                {badgeStyle.label}
              </span>
            </div>
            <select
              value={errorType}
              onChange={e => setErrorType(e.target.value as ErrorType)}
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden"
              required
            >
              {(Object.keys(ERROR_TYPE_LABELS) as ErrorType[]).map(type => (
                <option key={type} value={type}>
                  {ERROR_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Subject, Chapter & Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={e => handleSubjectChange(e.target.value)}
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden"
            >
              <option value="">(Select Subject)</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Chapter
            </label>
            <select
              value={selectedChapterValue}
              onChange={e => setSelectedChapterValue(e.target.value)}
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden truncate"
            >
              <option value="">(Select Chapter)</option>
              {!isSelectedInOptions && orphanChapterLabel && (
                <option value={selectedChapterValue}>{orphanChapterLabel}</option>
              )}
              {testSyllabusChapters.length > 0 && (
                <optgroup
                  label={
                    selectedSubjectName
                      ? `${selectedSubjectName} · Test Syllabus`
                      : activeTest
                        ? `Test Syllabus (${activeTest.name})`
                        : 'Test Syllabus'
                  }
                >
                  {testSyllabusChapters.map(item => (
                    <option key={item.value} value={item.value}>
                      {item.displayLabel}
                    </option>
                  ))}
                </optgroup>
              )}
              {availableLibraryChapters.length > 0 && (
                <optgroup label={selectedSubjectName ? `${selectedSubjectName} · Library` : 'Subject Library'}>
                  {availableLibraryChapters.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Topic / Concept
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. IAOR / Rolling friction"
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
            Mistake Description *
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What exactly went wrong? (e.g. Selected option B thinking reaction was SN1; failed to account for neighbouring group participation)"
            className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden resize-none"
            required
          />
        </div>

        {/* Row 3: Root Cause & Correct Approach */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Root Cause / Why it occurred
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Hurried through the mechanism without drawing stereochemical projection."
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Correct Method / Key Insight
            </label>
            <textarea
              rows={2}
              value={correctApproach}
              onChange={e => setCorrectApproach(e.target.value)}
              placeholder="e.g. Identify lone pair on beta-sulfur first; internal attack gives cyclic episulfonium ion."
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden resize-none"
            />
          </div>
        </div>

        {/* Corrective Action */}
        <div>
          <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
            Corrective Action Protocol / Rule to Enforce
          </label>
          <input
            type="text"
            value={correctiveAction}
            onChange={e => setCorrectiveAction(e.target.value)}
            placeholder="e.g. Always check for adjacent heteroatoms with lone pairs before declaring simple carbocation pathway"
            className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden"
          />
        </div>

        {/* Resolved Checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={resolved}
              onChange={e => setResolved(e.target.checked)}
              className="w-4 h-4 rounded-sm bg-[#0B0B10] border-[#292936] text-[#43D9A3] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#43D9A3]"
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[#F3F3F7]">
                Mark as Re-tested & Resolved
              </span>
              <span className="text-[11px] text-[#8E8EA0]">
                Indicates you have redone the question correctly and internalized the lesson.
              </span>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#292936]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
          >
            {initialError ? 'Save Changes' : 'Record Mistake'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
