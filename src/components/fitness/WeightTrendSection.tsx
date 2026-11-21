import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { WeightEntry } from '../../types';
import {
  getTodayString,
  formatShortDate,
  formatMonthDay,
  offsetDateString,
} from '../../utils/dates';
import {
  formatWeight,
  formatWeightValue,
  filterWeightsForChart,
  getMondaySundayWeekRange,
} from '../../utils/fitness';
import { AddEditWeightModal } from '../modals/AddEditWeightModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Scale,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface WeightTrendSectionProps {
  onLogWeight: () => void;
}

type TimeFilter = '7d' | '30d' | '90d' | 'all' | 'week';

export const WeightTrendSection: React.FC<WeightTrendSectionProps> = ({ onLogWeight }) => {
  const { weightEntries, updateWeightEntry, deleteWeightEntry } = useApp();
  const todayStr = getTodayString();
  const unit = 'kg' as const;

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(() => {
    return getMondaySundayWeekRange(todayStr).start;
  });
  const [showHistory, setShowHistory] = useState(false);

  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);
  const [weightToDelete, setWeightToDelete] = useState<WeightEntry | null>(null);

  const chartData = useMemo(() => {
    const rawFiltered = filterWeightsForChart(
      weightEntries,
      timeFilter === 'week' ? 'custom_week' : timeFilter,
      todayStr,
      selectedWeekStart
    );

    return rawFiltered.map(item => ({
      date: item.date,
      formattedDate: item.formattedDate,
      weight: formatWeightValue(item.weightKg, unit),
      weightKg: item.weightKg,
      entry: item.entry,
    }));
  }, [weightEntries, timeFilter, todayStr, selectedWeekStart]);

  const rangeStats = useMemo(() => {
    if (chartData.length === 0) return null;
    const weights = chartData.map(d => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const sum = weights.reduce((acc, w) => acc + w, 0);
    const avg = Math.round((sum / weights.length) * 10) / 10;
    return { min, max, avg };
  }, [chartData]);

  const sortedHistory = useMemo(() => {
    return [...weightEntries].sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  }, [weightEntries]);

  const handlePrevWeek = () => {
    setSelectedWeekStart(prev => offsetDateString(prev, -7));
  };

  const handleNextWeek = () => {
    setSelectedWeekStart(prev => offsetDateString(prev, 7));
  };

  const handleTodayWeek = () => {
    setSelectedWeekStart(getMondaySundayWeekRange(todayStr).start);
  };

  const currentMonday = getMondaySundayWeekRange(todayStr).start;
  const isFutureWeek = selectedWeekStart >= currentMonday;

  const yDomain = useMemo(() => {
    if (!rangeStats) return [60, 80];
    const buffer = 2;
    return [
      Math.max(0, Math.floor(rangeStats.min - buffer)),
      Math.ceil(rangeStats.max + buffer),
    ];
  }, [rangeStats]);

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-4 h-full flex flex-col">
      {/* Header & Single Log Weight Action */}
      <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-[#292936] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F3F3F7]">Body Weight Trajectory</h3>
            <span className="text-[10px] font-mono text-[#8E8EA0] px-2 py-0.5 rounded-sm bg-[#0B0B10] border border-[#292936]">
              {chartData.length} logs · kg
            </span>
          </div>
          <p className="text-xs text-[#8E8EA0] mt-0.5">
            Logged weights ordered chronologically in kilograms
          </p>
        </div>

        <button
          onClick={onLogWeight}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Weight</span>
        </button>
      </div>

      {/* Time Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center bg-[#0B0B10] p-1 rounded-lg border border-[#292936] text-[11px]">
          <button
            onClick={() => setTimeFilter('7d')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              timeFilter === '7d'
                ? 'bg-[#1B1B26] text-[#F3F3F7] font-medium'
                : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeFilter('30d')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              timeFilter === '30d'
                ? 'bg-[#1B1B26] text-[#F3F3F7] font-medium'
                : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
            }`}
          >
            30D
          </button>
          <button
            onClick={() => setTimeFilter('90d')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              timeFilter === '90d'
                ? 'bg-[#1B1B26] text-[#F3F3F7] font-medium'
                : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
            }`}
          >
            90D
          </button>
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              timeFilter === 'all'
                ? 'bg-[#1B1B26] text-[#F3F3F7] font-medium'
                : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              timeFilter === 'week'
                ? 'bg-[#9B7BFF]/20 text-[#9B7BFF] font-medium'
                : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Week Navigation Controls */}
      {timeFilter === 'week' && (
        <div className="flex items-center justify-between p-2.5 bg-[#0B0B10] border border-[#292936] rounded-xl text-xs">
          <button
            onClick={handlePrevWeek}
            className="flex items-center gap-1 px-2 py-1 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#14141D] rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-2 font-mono">
            <span className="text-[#F3F3F7] font-medium">
              {formatMonthDay(selectedWeekStart)} – {formatMonthDay(offsetDateString(selectedWeekStart, 6))}
            </span>
            <button
              onClick={handleTodayWeek}
              className="px-2 py-0.5 text-[10px] uppercase font-semibold text-[#9B7BFF] bg-[#9B7BFF]/10 hover:bg-[#9B7BFF]/20 rounded border border-[#9B7BFF]/20 cursor-pointer"
            >
              Current
            </button>
          </div>

          <button
            onClick={handleNextWeek}
            disabled={isFutureWeek}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isFutureWeek
                ? 'text-[#8E8EA0]/40 cursor-not-allowed'
                : 'text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#14141D] cursor-pointer'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        {chartData.length === 0 ? (
          <div className="h-[240px] flex flex-col items-center justify-center text-center p-6 bg-[#0B0B10] border border-[#292936] rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-2.5">
              <Scale className="w-5 h-5 text-[#9B7BFF]" />
            </div>
            <p className="text-xs font-semibold text-[#F3F3F7]">No weight data for this period</p>
            <p className="text-xs text-[#8E8EA0] max-w-xs mt-1">
              Record morning weigh-ins to plot your weight trajectory over time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-full h-[240px] pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 5 }}>
                  <CartesianGrid stroke="#292936" strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="formattedDate"
                    stroke="#8E8EA0"
                    tick={{ fill: '#8E8EA0', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickLine={{ stroke: '#292936' }}
                    axisLine={{ stroke: '#292936' }}
                  />

                  <YAxis
                    domain={yDomain}
                    stroke="#9B7BFF"
                    tick={{ fill: '#9B7BFF', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickLine={{ stroke: '#292936' }}
                    axisLine={{ stroke: '#292936' }}
                    unit=" kg"
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#14141D] border border-[#292936] p-3 rounded-lg shadow-xl text-xs space-y-1.5 font-mono">
                            <div className="text-[11px] text-[#8E8EA0]">
                              {formatShortDate(data.date)}
                            </div>
                            <div className="flex items-baseline gap-1.5 pt-0.5">
                              <span className="text-[#F3F3F7] font-bold text-base">
                                {data.weight}
                              </span>
                              <span className="text-[#8E8EA0] text-xs">kg</span>
                            </div>
                            {data.entry?.notes && (
                              <div className="text-[10px] text-[#8E8EA0] italic pt-1 border-t border-[#292936]">
                                {data.entry.notes}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#9B7BFF"
                    strokeWidth={2.5}
                    dot={{ fill: '#9B7BFF', stroke: '#14141D', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#9B7BFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {rangeStats && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-[#0B0B10] border border-[#292936] rounded-xl text-center text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#8E8EA0] uppercase block">Range Low</span>
                  <span className="text-sm font-bold text-[#F3F3F7]">{rangeStats.min} kg</span>
                </div>
                <div className="border-x border-[#292936]">
                  <span className="text-[10px] text-[#8E8EA0] uppercase block">Average</span>
                  <span className="text-sm font-bold text-[#9B7BFF]">{rangeStats.avg} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8E8EA0] uppercase block">Range High</span>
                  <span className="text-sm font-bold text-[#F3F3F7]">{rangeStats.max} kg</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapsible Weight History Section */}
        <div className="pt-2 border-t border-[#292936]">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] py-1 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-[#9B7BFF]" />
              <span>Weight History ({weightEntries.length})</span>
            </div>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHistory && (
            <div className="mt-3 overflow-x-auto rounded-lg border border-[#292936] max-h-56 overflow-y-auto">
              {sortedHistory.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#8E8EA0]">
                  No weight records logged yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B0B10] text-[#8E8EA0] uppercase tracking-wider font-semibold border-b border-[#292936]">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Weight</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#292936] bg-[#14141D]">
                    {sortedHistory.map(wt => (
                      <tr key={wt.id} className="hover:bg-[#1B1B26]/50 transition-colors">
                        <td className="py-2 px-3 font-mono text-[#8E8EA0] whitespace-nowrap">
                          {formatShortDate(wt.date)}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-[#F3F3F7]">
                          {formatWeight(wt.weightKg, 'kg')}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingWeight(wt)}
                              className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] rounded transition-colors cursor-pointer"
                              title="Edit weigh-in"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setWeightToDelete(wt)}
                              className="p-1 text-[#8E8EA0] hover:text-rose-400 rounded transition-colors cursor-pointer"
                              title="Delete weigh-in"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Weight Modal */}
      <AddEditWeightModal
        isOpen={Boolean(editingWeight)}
        onClose={() => setEditingWeight(null)}
        onSave={wt => {
          updateWeightEntry(wt as WeightEntry);
          setEditingWeight(null);
        }}
        initialWeight={editingWeight}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(weightToDelete)}
        onClose={() => setWeightToDelete(null)}
        onConfirm={() => {
          if (weightToDelete) {
            deleteWeightEntry(weightToDelete.id);
            setWeightToDelete(null);
          }
        }}
        title="Delete Weight Entry?"
        description={`Are you sure you want to delete the weigh-in from ${weightToDelete ? formatShortDate(weightToDelete.date) : ''}?`}
        confirmLabel="Delete Record"
        isDestructive
      />
    </div>
  );
};
