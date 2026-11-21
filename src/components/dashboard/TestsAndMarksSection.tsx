import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TestRecord } from '../../types';
import { formatShortDate, formatMonthDay } from '../../utils/dates';
import { calculateTestPercentage } from '../../utils/metrics';
import { AddEditTestModal } from '../modals/AddEditTestModal';
import { TestSummaryModal } from '../modals/TestSummaryModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Plus, Award, ChevronRight, TrendingUp } from 'lucide-react';

export const TestsAndMarksSection: React.FC = () => {
  const { tests, addTest, updateTest, deleteTest, navigateToTestDetail, examSettings } = useApp();

  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestRecord | null>(null);
  const [summaryModalTest, setSummaryModalTest] = useState<TestRecord | null>(null);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);

  // Sort tests by date, newest first for recent tests tile list
  const recentTests = useMemo(() => {
    return [...tests].sort((a, b) => b.date.localeCompare(a.date));
  }, [tests]);

  // Chronologically sorted data for Recharts marks trend
  const chartData = useMemo(() => {
    const sorted = [...tests].sort((a, b) => a.date.localeCompare(b.date));

    return sorted.map(t => {
      return {
        id: t.id,
        rawDate: t.date,
        formattedDate: formatMonthDay(t.date),
        name: t.name,
        examType: t.examType,
        mainsMarks: t.examType === 'Mains' ? t.marksObtained : null,
        advancedMarks: t.examType === 'Advanced' ? t.marksObtained : null,
        totalMarks: t.totalMarks,
        marksObtained: t.marksObtained,
        percentage: calculateTestPercentage(t.marksObtained, t.totalMarks),
      };
    });
  }, [tests]);

  const handleOpenAddTest = () => {
    setEditingTest(null);
    setAddEditModalOpen(true);
  };

  const handleOpenEditTest = (test: TestRecord) => {
    setEditingTest(test);
    setAddEditModalOpen(true);
  };

  const handleSaveTest = (testData: Omit<TestRecord, 'id' | 'createdAt'> | TestRecord) => {
    if ('id' in testData) {
      updateTest(testData as TestRecord);
      if (summaryModalTest?.id === testData.id) {
        setSummaryModalTest(testData as TestRecord);
      }
    } else {
      addTest(testData);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT CARD — Recent Tests */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#292936]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#F3F3F7]">Recent Tests</h3>
                {tests.length > 0 && (
                  <span className="text-xs font-mono text-[#8E8EA0] tabular-nums">
                    ({tests.length} logged)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8E8EA0] mt-0.5">Click any test tile to view breakdown</p>
            </div>

            <button
              onClick={handleOpenAddTest}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Test</span>
            </button>
          </div>

          {/* Test Tiles */}
          {recentTests.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-2.5">
                <Award className="w-5 h-5 text-[#9B7BFF]" />
              </div>
              <p className="text-xs font-medium text-[#F3F3F7]">No test records yet</p>
              <p className="text-xs text-[#8E8EA0] max-w-xs mt-1">
                Log your first Mains or Advanced mock test to track accuracy, weak chapters, and trends.
              </p>
              <button
                onClick={handleOpenAddTest}
                className="mt-3.5 px-3 py-1.5 text-xs text-[#9B7BFF] hover:text-white bg-[#9B7BFF]/15 hover:bg-[#9B7BFF] rounded-lg border border-[#9B7BFF]/30 transition-colors cursor-pointer"
              >
                + Log First Test
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {recentTests.map(test => {
                const percentage = calculateTestPercentage(test.marksObtained, test.totalMarks);
                const isMains = test.examType === 'Mains';

                return (
                  <div
                    key={test.id}
                    onClick={() => setSummaryModalTest(test)}
                    className="p-3 bg-[#0B0B10] border border-[#292936] hover:border-[#9B7BFF]/50 rounded-lg transition-all cursor-pointer flex items-center justify-between group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') setSummaryModalTest(test);
                    }}
                  >
                    <div className="min-w-0 flex-1 pr-3">
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
                        <h4 className="text-xs font-medium text-[#F3F3F7] group-hover:text-[#9B7BFF] transition-colors truncate">
                          {test.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8E8EA0]">
                        <span className="font-mono tabular-nums">{formatShortDate(test.date)}</span>
                        {test.syllabusSummary && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-[200px]">{test.syllabusSummary}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="flex items-baseline gap-1 justify-end font-mono tabular-nums">
                          <span className="text-sm font-bold text-[#F3F3F7]">
                            {test.marksObtained}
                          </span>
                          <span className="text-[11px] text-[#8E8EA0]">/{test.totalMarks}</span>
                        </div>
                        <span
                          className={`text-[11px] font-mono font-semibold block ${
                            isMains ? 'text-[#9B7BFF]' : 'text-[#43D9A3]'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-[#8E8EA0] group-hover:text-[#F3F3F7] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT CARD — Marks Trend Chart */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#292936]">
            <div>
              <h3 className="text-sm font-semibold text-[#F3F3F7]">Marks Trend</h3>
              <p className="text-xs text-[#8E8EA0] mt-0.5">
                Mains (/300) vs Advanced (/360) test trajectory
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9B7BFF]" />
                <span className="text-[#8E8EA0]">Mains</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#43D9A3]" />
                <span className="text-[#8E8EA0]">Advanced</span>
              </div>
            </div>
          </div>

          {/* Chart Display */}
          {chartData.length === 0 ? (
            <div className="h-[280px] flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-2.5">
                <TrendingUp className="w-5 h-5 text-[#9B7BFF]" />
              </div>
              <p className="text-xs font-medium text-[#F3F3F7]">No test trends to plot</p>
              <p className="text-xs text-[#8E8EA0] max-w-xs mt-1">
                Enter your test marks on the left to visualize your performance curve over time.
              </p>
            </div>
          ) : (
            <div className="w-full h-[280px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="#292936" strokeDasharray="3 3" vertical={false} />
                  
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#8E8EA0"
                    tick={{ fill: '#8E8EA0', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    tickLine={{ stroke: '#292936' }}
                    axisLine={{ stroke: '#292936' }}
                  />

                  {/* Left Axis: Mains (0 - 300) */}
                  <YAxis
                    yAxisId="mains"
                    orientation="left"
                    domain={[0, 300]}
                    stroke="#9B7BFF"
                    tick={{ fill: '#9B7BFF', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickLine={{ stroke: '#292936' }}
                    axisLine={{ stroke: '#292936' }}
                    ticks={[0, 75, 150, 225, 300]}
                  />

                  {/* Right Axis: Advanced (0 - 360) */}
                  <YAxis
                    yAxisId="advanced"
                    orientation="right"
                    domain={[0, 360]}
                    stroke="#43D9A3"
                    tick={{ fill: '#43D9A3', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickLine={{ stroke: '#292936' }}
                    axisLine={{ stroke: '#292936' }}
                    ticks={[0, 90, 180, 270, 360]}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#14141D] border border-[#292936] p-3 rounded-lg shadow-xl text-xs space-y-1.5 font-mono">
                            <div className="font-semibold text-[#F3F3F7]">{data.name}</div>
                            <div className="text-[11px] text-[#8E8EA0]">
                              {formatShortDate(data.rawDate)} · {data.examType}
                            </div>
                            <div className="flex items-baseline gap-2 pt-1">
                              <span className="text-[#F3F3F7] font-bold text-sm">
                                {data.marksObtained} / {data.totalMarks}
                              </span>
                              <span
                                className={`font-semibold ${
                                  data.examType === 'Mains' ? 'text-[#9B7BFF]' : 'text-[#43D9A3]'
                                }`}
                              >
                                ({data.percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Optional Target Reference Lines */}
                  {examSettings.mainsTargetScore && (
                    <ReferenceLine
                      yAxisId="mains"
                      y={examSettings.mainsTargetScore}
                      stroke="#9B7BFF"
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                    />
                  )}

                  {examSettings.advancedTargetScore && (
                    <ReferenceLine
                      yAxisId="advanced"
                      y={examSettings.advancedTargetScore}
                      stroke="#43D9A3"
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                    />
                  )}

                  <Line
                    yAxisId="mains"
                    type="monotone"
                    dataKey="mainsMarks"
                    name="Mains (/300)"
                    stroke="#9B7BFF"
                    strokeWidth={2.5}
                    dot={{ fill: '#9B7BFF', stroke: '#14141D', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#9B7BFF' }}
                    connectNulls
                  />

                  <Line
                    yAxisId="advanced"
                    type="monotone"
                    dataKey="advancedMarks"
                    name="Advanced (/360)"
                    stroke="#43D9A3"
                    strokeWidth={2.5}
                    dot={{ fill: '#43D9A3', stroke: '#14141D', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#43D9A3' }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Test Modal */}
      <AddEditTestModal
        isOpen={addEditModalOpen}
        onClose={() => setAddEditModalOpen(false)}
        onSave={handleSaveTest}
        initialTest={editingTest}
      />

      {/* Test Summary Modal (opened on clicking a test tile) */}
      <TestSummaryModal
        isOpen={Boolean(summaryModalTest)}
        onClose={() => setSummaryModalTest(null)}
        test={summaryModalTest}
        onEdit={test => handleOpenEditTest(test)}
        onDelete={id => setTestToDelete(id)}
        onOpenReport={testId => {
          navigateToTestDetail(testId, 'dashboard');
        }}
      />

      {/* Delete Test Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(testToDelete)}
        onClose={() => setTestToDelete(null)}
        onConfirm={() => {
          if (testToDelete) deleteTest(testToDelete);
        }}
        title="Delete Test Record?"
        description="Are you sure you want to delete this test entry? All associated marks, syllabus notes, and error logs will be permanently removed."
        confirmLabel="Delete Test Record"
        isDestructive
      />
    </div>
  );
};
