import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TestRecord, ExamType } from '../../types';
import { formatShortDate } from '../../utils/dates';
import { calculateTestPercentage, getTestErrorCounts } from '../../utils/metrics';
import { AddEditTestModal } from '../modals/AddEditTestModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Award,
  ChevronRight,
  Edit3,
  Trash2,
  Plus,
  LayoutGrid,
  List,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';

interface TestListSectionProps {
  onAddTest: () => void;
}

type SortField = 'date_desc' | 'date_asc' | 'marks_desc' | 'marks_asc' | 'pct_desc';

export const TestListSection: React.FC<TestListSectionProps> = ({ onAddTest }) => {
  const { tests, testErrors, updateTest, deleteTest, navigateToTestDetail } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState<'all' | ExamType>('all');
  const [sortField, setSortField] = useState<SortField>('date_desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [editingTest, setEditingTest] = useState<TestRecord | null>(null);
  const [testToDelete, setTestToDelete] = useState<TestRecord | null>(null);

  // Filter and sort tests
  const filteredAndSortedTests = useMemo(() => {
    let result = [...tests];

    // Filter by type
    if (examTypeFilter !== 'all') {
      result = result.filter(t => t.examType === examTypeFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => {
        return (
          t.name.toLowerCase().includes(q) ||
          (t.source && t.source.toLowerCase().includes(q)) ||
          (t.syllabusSummary && t.syllabusSummary.toLowerCase().includes(q)) ||
          (t.weakChapters && t.weakChapters.toLowerCase().includes(q))
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortField) {
        case 'date_desc':
          return b.date.localeCompare(a.date);
        case 'date_asc':
          return a.date.localeCompare(b.date);
        case 'marks_desc':
          return b.marksObtained - a.marksObtained;
        case 'marks_asc':
          return a.marksObtained - b.marksObtained;
        case 'pct_desc': {
          const pctA = calculateTestPercentage(a.marksObtained, a.totalMarks);
          const pctB = calculateTestPercentage(b.marksObtained, b.totalMarks);
          return pctB - pctA;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [tests, examTypeFilter, searchQuery, sortField]);

  const handleSaveEdit = (testData: Omit<TestRecord, 'id' | 'createdAt'> | TestRecord) => {
    updateTest(testData as TestRecord);
    setEditingTest(null);
  };

  const handleConfirmDelete = () => {
    if (testToDelete) {
      deleteTest(testToDelete.id);
      setTestToDelete(null);
    }
  };

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-4">
      {/* Section Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#292936]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F3F3F7]">All Examination Records</h3>
            <span className="text-xs font-mono text-[#8E8EA0] tabular-nums">
              ({filteredAndSortedTests.length} of {tests.length})
            </span>
          </div>
          <p className="text-xs text-[#8E8EA0] mt-0.5">
            Detailed breakdown, question error categorization, and score metrics
          </p>
        </div>

        {/* Filter / Sort / View Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8E8EA0] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tests or syllabus..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#0B0B10] border border-[#292936] text-xs text-[#F3F3F7] placeholder-[#8E8EA0] pl-8 pr-3 py-1.5 rounded-lg focus:outline-hidden focus:border-[#9B7BFF] w-48 sm:w-56"
            />
          </div>

          {/* Exam Type Filter */}
          <select
            value={examTypeFilter}
            onChange={e => setExamTypeFilter(e.target.value as 'all' | ExamType)}
            className="bg-[#0B0B10] border border-[#292936] text-xs text-[#8E8EA0] focus:text-[#F3F3F7] rounded-lg px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="Mains">Mains Only</option>
            <option value="Advanced">Advanced Only</option>
          </select>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-[#0B0B10] border border-[#292936] rounded-lg px-2 py-1 text-xs text-[#8E8EA0]">
            <ArrowUpDown className="w-3 h-3" />
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as SortField)}
              className="bg-transparent text-xs text-[#F3F3F7] focus:outline-hidden cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="pct_desc">Highest Accuracy</option>
              <option value="marks_desc">Highest Marks</option>
              <option value="marks_asc">Lowest Marks</option>
            </select>
          </div>

          {/* Card / Table Switcher */}
          <div className="flex items-center bg-[#0B0B10] border border-[#292936] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#1B1B26] text-[#F3F3F7]'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#1B1B26] text-[#F3F3F7]'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
              title="Dense Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Card Grid or Table */}
      {filteredAndSortedTests.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center p-6 bg-[#0B0B10] border border-[#292936] rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-3">
            <Award className="w-5 h-5 text-[#9B7BFF]" />
          </div>
          {tests.length === 0 ? (
            <>
              <p className="text-sm font-semibold text-[#F3F3F7]">No test records logged</p>
              <p className="text-xs text-[#8E8EA0] max-w-sm mt-1 mb-4">
                Track full mock examinations, evaluate time distribution, and uncover weak chapters.
              </p>
              <button
                onClick={onAddTest}
                className="px-3.5 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
              >
                + Log First Test
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#F3F3F7]">No tests match your filter</p>
              <p className="text-xs text-[#8E8EA0] mt-1 mb-3">
                Try clearing search terms or changing exam type filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setExamTypeFilter('all');
                  setSortField('date_desc');
                }}
                className="text-xs text-[#9B7BFF] hover:underline cursor-pointer"
              >
                Reset search & filters
              </button>
            </>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedTests.map(test => {
            const percentage = calculateTestPercentage(test.marksObtained, test.totalMarks);
            const isMains = test.examType === 'Mains';
            const errorCounts = getTestErrorCounts(test.id, testErrors);

            return (
              <div
                key={test.id}
                className="bg-[#0B0B10] border border-[#292936] hover:border-[#9B7BFF]/40 rounded-xl p-4 flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Top Bar: Exam type, Date, Actions */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#292936]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm border ${
                          isMains
                            ? 'text-[#9B7BFF] border-[#9B7BFF]/30 bg-[#9B7BFF]/10'
                            : 'text-[#43D9A3] border-[#43D9A3]/30 bg-[#43D9A3]/10'
                        }`}
                      >
                        {test.examType}
                      </span>
                      {test.source && (
                        <span className="text-[10px] font-mono text-[#8E8EA0] truncate max-w-[110px]">
                          {test.source}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#8E8EA0]">
                      <Calendar className="w-3 h-3" />
                      <span className="font-mono text-[11px] tabular-nums">
                        {formatShortDate(test.date)}
                      </span>
                    </div>
                  </div>

                  {/* Test Title */}
                  <h4
                    onClick={() => navigateToTestDetail(test.id, 'test-error-log')}
                    className="text-sm font-semibold text-[#F3F3F7] group-hover:text-[#9B7BFF] transition-colors truncate cursor-pointer"
                    title={test.name}
                  >
                    {test.name}
                  </h4>

                  {/* Marks & Accuracy Callout */}
                  <div className="my-3 flex items-baseline justify-between font-mono">
                    <div>
                      <span className="text-xl font-bold text-[#F3F3F7] tabular-nums">
                        {test.marksObtained}
                      </span>
                      <span className="text-xs text-[#8E8EA0]"> / {test.totalMarks}</span>
                    </div>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isMains ? 'text-[#9B7BFF]' : 'text-[#43D9A3]'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="w-full bg-[#1B1B26] h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMains ? 'bg-[#9B7BFF]' : 'bg-[#43D9A3]'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>

                  {/* Syllabus / Weak Chapter summary snippet */}
                  {test.syllabusSummary ? (
                    <p className="text-[11px] text-[#8E8EA0] line-clamp-2 leading-snug mb-2">
                      <span className="text-[#F3F3F7] font-medium">Syllabus:</span>{' '}
                      {test.syllabusSummary}
                    </p>
                  ) : null}

                  {/* Mistake Count Pill */}
                  <div className="flex items-center justify-between text-[11px] py-1">
                    <div className="flex items-center gap-1.5 text-[#8E8EA0]">
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      <span>Mistakes:</span>
                    </div>
                    <span className="font-mono text-xs">
                      {errorCounts.total === 0 ? (
                        <span className="text-[#8E8EA0]">0 logged</span>
                      ) : (
                        <span className={errorCounts.unresolved > 0 ? 'text-amber-400' : 'text-[#43D9A3]'}>
                          {errorCounts.total} ({errorCounts.resolved} fixed)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 mt-2 border-t border-[#292936] flex items-center justify-between">
                  <button
                    onClick={() => navigateToTestDetail(test.id, 'test-error-log')}
                    className="inline-flex items-center gap-1 text-xs text-[#9B7BFF] hover:text-white font-medium transition-colors cursor-pointer"
                  >
                    <span>View Full Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTest(test)}
                      className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-lg transition-colors cursor-pointer"
                      title="Edit Test Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTestToDelete(test)}
                      className="p-1.5 text-[#8E8EA0] hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                      title="Delete Test Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DENSE TABLE VIEW */
        <div className="overflow-x-auto rounded-lg border border-[#292936]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0B10] text-[#8E8EA0] uppercase tracking-wider font-semibold border-b border-[#292936]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Mock Test Name</th>
                <th className="py-2.5 px-3">Marks Scored</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Errors</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292936] bg-[#14141D]">
              {filteredAndSortedTests.map(test => {
                const percentage = calculateTestPercentage(test.marksObtained, test.totalMarks);
                const isMains = test.examType === 'Mains';
                const errorCounts = getTestErrorCounts(test.id, testErrors);

                return (
                  <tr
                    key={test.id}
                    className="hover:bg-[#1B1B26]/50 transition-colors group"
                  >
                    <td className="py-2.5 px-3 font-mono text-[#8E8EA0] whitespace-nowrap">
                      {formatShortDate(test.date)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm border ${
                          isMains
                            ? 'text-[#9B7BFF] border-[#9B7BFF]/30 bg-[#9B7BFF]/10'
                            : 'text-[#43D9A3] border-[#43D9A3]/30 bg-[#43D9A3]/10'
                        }`}
                      >
                        {test.examType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#F3F3F7]">
                      <button
                        onClick={() => navigateToTestDetail(test.id, 'test-error-log')}
                        className="text-left hover:text-[#9B7BFF] transition-colors truncate max-w-xs cursor-pointer block font-semibold"
                      >
                        {test.name}
                      </button>
                      {test.source && (
                        <span className="text-[10px] text-[#8E8EA0] font-mono">
                          {test.source}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className="font-bold text-[#F3F3F7]">{test.marksObtained}</span>
                      <span className="text-[#8E8EA0]">/{test.totalMarks}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span className={isMains ? 'text-[#9B7BFF]' : 'text-[#43D9A3]'}>
                        {percentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {errorCounts.total === 0 ? (
                        <span className="text-[#8E8EA0]">0</span>
                      ) : (
                        <span className={errorCounts.unresolved > 0 ? 'text-amber-400 font-semibold' : 'text-[#43D9A3]'}>
                          {errorCounts.total} ({errorCounts.resolved}✓)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigateToTestDetail(test.id, 'test-error-log')}
                          className="px-2 py-1 text-xs text-[#9B7BFF] hover:bg-[#9B7BFF]/15 rounded-md transition-colors cursor-pointer"
                        >
                          Report
                        </button>
                        <button
                          onClick={() => setEditingTest(test)}
                          className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] rounded-md transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTestToDelete(test)}
                          className="p-1 text-[#8E8EA0] hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Test Modal */}
      <AddEditTestModal
        isOpen={Boolean(editingTest)}
        onClose={() => setEditingTest(null)}
        onSave={handleSaveEdit}
        initialTest={editingTest}
      />

      {/* Delete Test Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(testToDelete)}
        onClose={() => setTestToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Test Record?"
        description={`Are you sure you want to delete "${testToDelete?.name}"? All associated scores and mistake audit records will be removed.`}
        confirmLabel="Delete Test Record"
        isDestructive
      />
    </div>
  );
};
