import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TestError, ErrorType } from '../../types';
import {
  calculateErrorStats,
  getErrorTypeBadgeStyle,
  ERROR_TYPE_LABELS,
} from '../../utils/metrics';
import { formatShortDate } from '../../utils/dates';
import { AddEditErrorModal } from '../modals/AddEditErrorModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import {
  AlertTriangle,
  Search,
  Filter,
  Check,
  RotateCcw,
  Edit3,
  Trash2,
  ExternalLink,
  Plus,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  Layers,
  PieChart,
} from 'lucide-react';

interface MasterErrorVaultSectionProps {
  onAddError: () => void;
}

export const MasterErrorVaultSection: React.FC<MasterErrorVaultSectionProps> = ({ onAddError }) => {
  const {
    testErrors,
    tests,
    subjects,
    chapters,
    toggleTestErrorResolved,
    updateTestError,
    deleteTestError,
    navigateToTestDetail,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingError, setEditingError] = useState<TestError | null>(null);
  const [errorToDelete, setErrorToDelete] = useState<TestError | null>(null);

  const errorStats = useMemo(() => calculateErrorStats(testErrors), [testErrors]);

  // Filtered error records
  const filteredErrors = useMemo(() => {
    return testErrors.filter(err => {
      // Status
      if (statusFilter === 'resolved' && !err.resolved) return false;
      if (statusFilter === 'unresolved' && err.resolved) return false;

      // Subject
      if (subjectFilter !== 'all' && err.subjectId !== subjectFilter) return false;

      // Type
      if (typeFilter !== 'all' && err.errorType !== typeFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = err.description.toLowerCase().includes(q);
        const matchesTopic = (err.topic || '').toLowerCase().includes(q);
        const matchesChapter = (err.chapterName || '').toLowerCase().includes(q);
        const matchesQNum = (err.questionNumber || '').toLowerCase().includes(q);
        const matchesReason = (err.reason || '').toLowerCase().includes(q);
        const matchesApproach = (err.correctApproach || '').toLowerCase().includes(q);
        if (!matchesDesc && !matchesTopic && !matchesChapter && !matchesQNum && !matchesReason && !matchesApproach) {
          return false;
        }
      }

      return true;
    });
  }, [testErrors, statusFilter, subjectFilter, typeFilter, searchQuery]);

  const handleSaveEdit = (errorData: Omit<TestError, 'id' | 'createdAt' | 'updatedAt'> | TestError) => {
    if ('id' in errorData) {
      updateTestError(errorData as TestError);
    }
    setEditingError(null);
  };

  const handleConfirmDelete = () => {
    if (errorToDelete) {
      deleteTestError(errorToDelete.id);
      setErrorToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Taxonomy Breakdown Bar */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#292936] gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#F3F3F7]">
              Mistake Taxonomy & Root-Cause Distribution
            </h3>
            <p className="text-xs text-[#8E8EA0] mt-0.5">
              Breakdown across {testErrors.length} total recorded slips · {errorStats.unresolved} awaiting re-attempt
            </p>
          </div>

          <button
            onClick={onAddError}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Question Mistake</span>
          </button>
        </div>

        {/* Category Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {(Object.keys(ERROR_TYPE_LABELS) as ErrorType[]).map(type => {
            const count = errorStats.byType[type] || 0;
            const badge = getErrorTypeBadgeStyle(type);
            const isSelected = typeFilter === type;

            return (
              <button
                key={type}
                onClick={() => setTypeFilter(curr => (curr === type ? 'all' : type))}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `${badge.bgClass} ${badge.borderClass} ring-1 ring-[#9B7BFF]`
                    : 'bg-[#0B0B10] border-[#292936] hover:border-[#9B7BFF]/40'
                }`}
              >
                <span className="text-[10px] text-[#8E8EA0] truncate block">
                  {ERROR_TYPE_LABELS[type]}
                </span>
                <div className="flex items-baseline justify-between mt-1.5">
                  <span className={`text-base font-bold font-mono ${badge.textClass}`}>
                    {count}
                  </span>
                  {testErrors.length > 0 && (
                    <span className="text-[9px] font-mono text-[#8E8EA0]">
                      {Math.round((count / testErrors.length) * 100)}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Subject Error Concentrations */}
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#8E8EA0]">
          <span className="font-semibold text-[#F3F3F7]">Subject Concentrations:</span>
          {subjects.map(s => {
            const count = errorStats.bySubject[s.id] || 0;
            return (
              <div key={s.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#9B7BFF]" />
                <span>{s.name}:</span>
                <span className="font-mono font-bold text-[#F3F3F7]">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Search, Filter, and Master List */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#292936]">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#0B0B10] p-1 rounded-lg border border-[#292936] text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#1B1B26] text-[#F3F3F7] font-medium'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              All Errors ({testErrors.length})
            </button>
            <button
              onClick={() => setStatusFilter('unresolved')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'unresolved'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              Open / Unresolved ({errorStats.unresolved})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'resolved'
                  ? 'bg-[#43D9A3]/20 text-[#43D9A3] font-medium'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              Resolved ({errorStats.resolved})
            </button>
          </div>

          {/* Filters & Search Input */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Filter */}
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="bg-[#0B0B10] border border-[#292936] text-xs text-[#8E8EA0] focus:text-[#F3F3F7] rounded-lg px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Error Type Filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-[#0B0B10] border border-[#292936] text-xs text-[#8E8EA0] focus:text-[#F3F3F7] rounded-lg px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Mistake Types</option>
              {(Object.keys(ERROR_TYPE_LABELS) as ErrorType[]).map(type => (
                <option key={type} value={type}>
                  {ERROR_TYPE_LABELS[type]}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8E8EA0] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search descriptions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#0B0B10] border border-[#292936] text-xs text-[#F3F3F7] placeholder-[#8E8EA0] pl-8 pr-3 py-1.5 rounded-lg focus:outline-hidden focus:border-[#9B7BFF] w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Master List of Mistakes */}
        {filteredErrors.length === 0 ? (
          <div className="py-12 bg-[#0B0B10] border border-[#292936] rounded-xl text-center flex flex-col items-center justify-center p-6">
            <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            {testErrors.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-[#F3F3F7]">Error vault is empty</p>
                <p className="text-xs text-[#8E8EA0] max-w-sm mt-1 mb-4">
                  Log questions missed in mock examinations to build your personalized retry backlog and fix systematic gaps.
                </p>
                <button
                  onClick={onAddError}
                  className="px-3.5 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
                >
                  + Record First Mistake
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#F3F3F7]">No errors match current filters</p>
                <p className="text-xs text-[#8E8EA0] mt-1 mb-3">
                  Try adjusting the mistake category or clearing search terms.
                </p>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSubjectFilter('all');
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
          <div className="space-y-3.5">
            {filteredErrors.map(err => {
              const badge = getErrorTypeBadgeStyle(err.errorType);
              const test = tests.find(t => t.id === err.testId);
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
                  {/* Card Header: Test name, Question #, Error category badge, Subject/Chapter, Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#292936]">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Jump to Test Report Button */}
                      {test && (
                        <button
                          onClick={() => navigateToTestDetail(test.id, 'test-error-log')}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9B7BFF] hover:underline cursor-pointer"
                          title="View complete test report"
                        >
                          <span>{test.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

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

                    {/* Status & Controls */}
                    <div className="flex items-center gap-2">
                      {/* Resolved Status Toggle */}
                      <button
                        onClick={() => toggleTestErrorResolved(err.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                          err.resolved
                            ? 'bg-[#43D9A3]/15 text-[#43D9A3] border-[#43D9A3]/30 hover:bg-[#43D9A3]/25'
                            : 'bg-[#1B1B26] text-[#8E8EA0] border-[#292936] hover:text-amber-300 hover:border-amber-400/40'
                        }`}
                        title={err.resolved ? 'Mark as open' : 'Mark as resolved'}
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
                        onClick={() => setEditingError(err)}
                        className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-lg transition-colors cursor-pointer"
                        title="Edit mistake entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setErrorToDelete(err)}
                        className="p-1.5 text-[#8E8EA0] hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete mistake entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="py-2.5">
                    <p className="text-xs text-[#F3F3F7] leading-relaxed">
                      {err.description}
                    </p>
                  </div>

                  {/* Sub-cards */}
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

      {/* Edit Error Modal */}
      <AddEditErrorModal
        isOpen={Boolean(editingError)}
        onClose={() => setEditingError(null)}
        onSave={handleSaveEdit}
        initialError={editingError}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(errorToDelete)}
        onClose={() => setErrorToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Error Log Entry?"
        description="Are you sure you want to delete this mistake record from the master error vault?"
        confirmLabel="Delete Mistake"
        isDestructive
      />
    </div>
  );
};
