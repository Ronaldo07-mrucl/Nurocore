import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TestRecord, TestError, ErrorType } from '../types';
import { formatLongDate } from '../utils/dates';
import {
  calculateTestPercentage,
  getErrorTypeBadgeStyle,
  ERROR_TYPE_LABELS,
  getTestErrorCounts,
} from '../utils/metrics';
import { AddEditTestModal } from '../components/modals/AddEditTestModal';
import { AddEditErrorModal } from '../components/modals/AddEditErrorModal';
import { ConfirmDialog } from '../components/modals/ConfirmDialog';
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  AlertTriangle,
  FileText,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Check,
  RotateCcw,
  Clock,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';

interface TestDetailPageProps {
  testId: string;
}

export const TestDetailPage: React.FC<TestDetailPageProps> = ({ testId }) => {
  const {
    tests,
    testErrors,
    subjects,
    chapters,
    updateTest,
    deleteTest,
    returnFromTestDetail,
    testOriginPage,
    addTestError,
    updateTestError,
    deleteTestError,
    toggleTestErrorResolved,
  } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [editingError, setEditingError] = useState<TestError | null>(null);
  const [errorToDelete, setErrorToDelete] = useState<string | null>(null);

  // Filters for errors in this test
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const test = tests.find(t => t.id === testId);

  // All errors for this specific test
  const errorsForThisTest = useMemo(() => {
    return testErrors.filter(e => e.testId === testId);
  }, [testErrors, testId]);

  // Filtered errors based on user search/filters
  const filteredErrors = useMemo(() => {
    return errorsForThisTest.filter(e => {
      // Status filter
      if (statusFilter === 'resolved' && !e.resolved) return false;
      if (statusFilter === 'unresolved' && e.resolved) return false;

      // Type filter
      if (typeFilter !== 'all' && e.errorType !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = e.description.toLowerCase().includes(q);
        const matchesTopic = (e.topic || '').toLowerCase().includes(q);
        const matchesChapter = (e.chapterName || '').toLowerCase().includes(q);
        const matchesQNum = (e.questionNumber || '').toLowerCase().includes(q);
        const matchesReason = (e.reason || '').toLowerCase().includes(q);
        if (!matchesDesc && !matchesTopic && !matchesChapter && !matchesQNum && !matchesReason) {
          return false;
        }
      }

      return true;
    });
  }, [errorsForThisTest, statusFilter, typeFilter, searchQuery]);

  if (!test) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-[#F3F3F7]">Test Record Not Found</h2>
        <p className="text-sm text-[#8E8EA0] mt-1 mb-6">
          The requested test report does not exist or may have been deleted.
        </p>
        <button
          onClick={returnFromTestDetail}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return</span>
        </button>
      </div>
    );
  }

  const percentage = calculateTestPercentage(test.marksObtained, test.totalMarks);
  const isMains = test.examType === 'Mains';
  const errorCounts = getTestErrorCounts(test.id, testErrors);

  const handleSaveEdit = (testData: Omit<TestRecord, 'id' | 'createdAt'> | TestRecord) => {
    updateTest(testData as TestRecord);
  };

  const handleConfirmDelete = () => {
    deleteTest(test.id);
    returnFromTestDetail();
  };

  const handleOpenAddError = () => {
    setEditingError(null);
    setErrorModalOpen(true);
  };

  const handleOpenEditError = (err: TestError) => {
    setEditingError(err);
    setErrorModalOpen(true);
  };

  const handleSaveError = (errorData: Omit<TestError, 'id' | 'createdAt' | 'updatedAt'> | TestError) => {
    if ('id' in errorData) {
      updateTestError(errorData as TestError);
    } else {
      addTestError(errorData);
    }
  };

  const backLabel = testOriginPage === 'test-error-log' ? 'Back to Test & Error Log' : 'Back to Dashboard';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[#292936]">
        <div className="flex items-center gap-3">
          <button
            onClick={returnFromTestDetail}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#14141D] border border-[#292936] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </button>
          <div className="text-xs text-[#8E8EA0] hidden sm:flex items-center gap-2">
            <span>{testOriginPage === 'test-error-log' ? 'Test & Error Log' : 'Dashboard'}</span>
            <span aria-hidden="true">/</span>
            <span>Test Reports</span>
            <span aria-hidden="true">/</span>
            <span className="text-[#F3F3F7] font-medium truncate max-w-[200px]">{test.name}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddError}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Mistake</span>
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F3F3F7] hover:bg-[#1B1B26] border border-[#292936] rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#8E8EA0]" />
            <span>Edit Test</span>
          </button>
          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-500/20 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Hero Header Card */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-sm border ${
                  isMains
                    ? 'text-[#9B7BFF] border-[#9B7BFF]/30 bg-[#9B7BFF]/10'
                    : 'text-[#43D9A3] border-[#43D9A3]/30 bg-[#43D9A3]/10'
                }`}
              >
                {test.examType} MOCK REPORT
              </span>

              {test.source && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-[#292936] bg-[#0B0B10] text-[#8E8EA0]">
                  {test.source}
                </span>
              )}

              <div className="flex items-center gap-1.5 text-xs text-[#8E8EA0]">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">{formatLongDate(test.date)}</span>
              </div>

              {test.durationMinutes && (
                <div className="flex items-center gap-1.5 text-xs text-[#8E8EA0]">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums">{test.durationMinutes} mins</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F3F3F7]">
              {test.name}
            </h1>
            <p className="text-xs text-[#8E8EA0]">
              Full examination analysis, mistake classification, and question remediation audit.
            </p>
          </div>

          {/* Large Score Metric Callout */}
          <div className="flex items-center gap-5 sm:gap-6 bg-[#0B0B10] border border-[#292936] p-4 rounded-xl shrink-0">
            <div>
              <span className="text-[10px] text-[#8E8EA0] uppercase tracking-wider block mb-1">
                Marks Scored
              </span>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl sm:text-3xl font-bold text-[#F3F3F7] tabular-nums">
                  {test.marksObtained}
                </span>
                <span className="text-xs text-[#8E8EA0]">/ {test.totalMarks}</span>
              </div>
            </div>

            <div className="h-10 w-px bg-[#292936]" />

            <div>
              <span className="text-[10px] text-[#8E8EA0] uppercase tracking-wider block mb-1">
                Accuracy
              </span>
              <span
                className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
                  isMains ? 'text-[#9B7BFF]' : 'text-[#43D9A3]'
                }`}
              >
                {percentage}%
              </span>
            </div>

            <div className="h-10 w-px bg-[#292936]" />

            <div>
              <span className="text-[10px] text-[#8E8EA0] uppercase tracking-wider block mb-1">
                Mistakes
              </span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-2xl sm:text-3xl font-bold text-amber-400 tabular-nums">
                  {errorCounts.total}
                </span>
                {errorCounts.total > 0 && (
                  <span className="text-[10px] text-[#43D9A3]">
                    ({errorCounts.resolved} fixed)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Report Overview Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Syllabus Covered */}
        <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8E8EA0] uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#9B7BFF]" />
            <span>Syllabus Covered</span>
          </div>
          <div className="p-4 bg-[#0B0B10] border border-[#292936] rounded-lg min-h-[120px]">
            <p className="text-xs text-[#F3F3F7] leading-relaxed whitespace-pre-wrap">
              {test.syllabusSummary || 'No specific syllabus modules recorded.'}
            </p>
          </div>
        </div>

        {/* Weak Chapters & Topics */}
        <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Weak Chapters & Bottlenecks</span>
          </div>
          <div className="p-4 bg-[#0B0B10] border border-[#292936] rounded-lg min-h-[120px]">
            <p className="text-xs text-[#F3F3F7] leading-relaxed whitespace-pre-wrap">
              {test.weakChapters || 'No specific chapter bottlenecks flagged for this test.'}
            </p>
          </div>
        </div>

        {/* Observations & Overall Remarks */}
        <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8E8EA0] uppercase tracking-wider">
            <FileText className="w-4 h-4 text-[#43D9A3]" />
            <span>Overall Observations & Strategy</span>
          </div>
          <div className="p-4 bg-[#0B0B10] border border-[#292936] rounded-lg min-h-[120px]">
            <p className="text-xs text-[#F3F3F7] leading-relaxed whitespace-pre-wrap">
              {test.overallRemarks || test.errorLogSummary || 'No general strategy notes logged for this session.'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION H: COMPLETE INTERACTIVE ERROR LOG FOR THIS TEST */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-4">
        {/* Error Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#292936] gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-[#F3F3F7]">
                Question Mistake Log & Root Causes
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#1B1B26] border border-[#292936] text-[#8E8EA0]">
                {errorsForThisTest.length} logged · {errorCounts.unresolved} unresolved
              </span>
            </div>
            <p className="text-xs text-[#8E8EA0] mt-0.5">
              Classify exam slips, document proper solutions, and mark when re-solved.
            </p>
          </div>

          <button
            onClick={handleOpenAddError}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Mistake Entry</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Status Buttons */}
          <div className="flex items-center gap-1 bg-[#0B0B10] p-1 rounded-lg border border-[#292936] text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#1B1B26] text-[#F3F3F7] font-medium'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              All ({errorsForThisTest.length})
            </button>
            <button
              onClick={() => setStatusFilter('unresolved')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'unresolved'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              Unresolved ({errorCounts.unresolved})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'resolved'
                  ? 'bg-[#43D9A3]/20 text-[#43D9A3] font-medium'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              Resolved ({errorCounts.resolved})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-[#0B0B10] border border-[#292936] text-[#8E8EA0] focus:text-[#F3F3F7] text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {(Object.keys(ERROR_TYPE_LABELS) as ErrorType[]).map(type => (
                <option key={type} value={type}>
                  {ERROR_TYPE_LABELS[type]}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8E8EA0] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search mistakes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#0B0B10] border border-[#292936] text-xs text-[#F3F3F7] placeholder-[#8E8EA0] pl-8 pr-3 py-1.5 rounded-lg focus:outline-hidden focus:border-[#9B7BFF] w-36 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Error Items List */}
        {filteredErrors.length === 0 ? (
          <div className="py-12 bg-[#0B0B10] border border-[#292936] rounded-xl text-center flex flex-col items-center justify-center p-6">
            <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-3">
              <CheckCircle className="w-5 h-5 text-[#43D9A3]" />
            </div>
            {errorsForThisTest.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-[#F3F3F7]">No mistakes logged for this test</p>
                <p className="text-xs text-[#8E8EA0] max-w-sm mt-1 mb-4">
                  Documenting mistakes is the fastest path to score growth. Log each missed question with root cause and corrective strategy.
                </p>
                <button
                  onClick={handleOpenAddError}
                  className="px-3.5 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
                >
                  + Log First Mistake
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#F3F3F7]">No mistakes matching filter</p>
                <p className="text-xs text-[#8E8EA0] mt-1 mb-3">
                  Try clearing the category filter or searching with different terms.
                </p>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-[#9B7BFF] hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredErrors.map(err => {
              const badge = getErrorTypeBadgeStyle(err.errorType);
              const subject = subjects.find(s => s.id === err.subjectId);
              const chapter = chapters.find(c => c.id === err.chapterId);

              return (
                <div
                  key={err.id}
                  className={`p-4 bg-[#0B0B10] border rounded-xl transition-all ${
                    err.resolved
                      ? 'border-[#292936] opacity-85'
                      : 'border-[#292936] hover:border-[#9B7BFF]/40'
                  }`}
                >
                  {/* Top Bar of Error Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#292936]">
                    <div className="flex flex-wrap items-center gap-2">
                      {err.questionNumber && (
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-sm bg-[#1B1B26] border border-[#292936] text-[#F3F3F7]">
                          {err.questionNumber}
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
                      >
                        {badge.label}
                      </span>

                      {subject && (
                        <span className="text-[11px] font-medium text-[#8E8EA0] px-2 py-0.5 rounded-sm bg-[#14141D] border border-[#292936]">
                          {subject.name}
                        </span>
                      )}

                      {(chapter || err.chapterName) && (
                        <span className="text-[11px] text-[#8E8EA0] truncate max-w-[200px]">
                          · {chapter?.name || err.chapterName}
                        </span>
                      )}

                      {err.topic && (
                        <span className="text-[11px] text-[#8E8EA0] italic truncate max-w-[180px]">
                          ({err.topic})
                        </span>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2">
                      {/* Resolved Status Toggle */}
                      <button
                        onClick={() => toggleTestErrorResolved(err.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                          err.resolved
                            ? 'bg-[#43D9A3]/15 text-[#43D9A3] border-[#43D9A3]/30 hover:bg-[#43D9A3]/25'
                            : 'bg-[#1B1B26] text-[#8E8EA0] border-[#292936] hover:text-amber-300 hover:border-amber-400/40'
                        }`}
                        title={err.resolved ? 'Mark as unresolved' : 'Mark as resolved'}
                      >
                        {err.resolved ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Resolved</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Unresolved</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEditError(err)}
                        className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] border border-transparent hover:border-[#292936] rounded-lg transition-colors cursor-pointer"
                        title="Edit mistake"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setErrorToDelete(err.id)}
                        className="p-1.5 text-[#8E8EA0] hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete mistake entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mistake Description */}
                  <div className="py-2.5">
                    <p className="text-xs text-[#F3F3F7] leading-relaxed">
                      {err.description}
                    </p>
                  </div>

                  {/* Sub-sections: Reason, Correct Approach, Corrective Action */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px]">
                    {err.reason && (
                      <div className="p-2.5 rounded-lg bg-[#14141D] border border-[#292936] space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-400 uppercase tracking-wider text-[10px]">
                          <HelpCircle className="w-3 h-3" />
                          <span>Why it happened</span>
                        </div>
                        <p className="text-[#8E8EA0] leading-snug">{err.reason}</p>
                      </div>
                    )}

                    {err.correctApproach && (
                      <div className="p-2.5 rounded-lg bg-[#14141D] border border-[#292936] space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-[#43D9A3] uppercase tracking-wider text-[10px]">
                          <Lightbulb className="w-3 h-3" />
                          <span>Correct Method</span>
                        </div>
                        <p className="text-[#8E8EA0] leading-snug">{err.correctApproach}</p>
                      </div>
                    )}

                    {err.correctiveAction && (
                      <div className="p-2.5 rounded-lg bg-[#14141D] border border-[#292936] space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-[#9B7BFF] uppercase tracking-wider text-[10px]">
                          <ShieldAlert className="w-3 h-3" />
                          <span>Prevention Protocol</span>
                        </div>
                        <p className="text-[#8E8EA0] leading-snug">{err.correctiveAction}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Test Modal */}
      <AddEditTestModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialTest={test}
      />

      {/* Add / Edit Error Modal */}
      <AddEditErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        onSave={handleSaveError}
        initialError={editingError}
        lockedTestId={test.id}
      />

      {/* Delete Test Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Test Record?"
        description={`Are you sure you want to delete "${test.name}"? This action cannot be undone and will delete all ${errorsForThisTest.length} mistake records associated with this mock.`}
        confirmLabel="Delete Test Record"
        isDestructive
      />

      {/* Delete Single Error Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(errorToDelete)}
        onClose={() => setErrorToDelete(null)}
        onConfirm={() => {
          if (errorToDelete) {
            deleteTestError(errorToDelete);
            setErrorToDelete(null);
          }
        }}
        title="Delete Mistake Log Entry?"
        description="Are you sure you want to delete this mistake record from the test error audit?"
        confirmLabel="Delete Entry"
        isDestructive
      />
    </div>
  );
};
