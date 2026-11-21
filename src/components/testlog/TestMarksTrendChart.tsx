import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatShortDate, formatMonthDay } from '../../utils/dates';
import { calculateTestPercentage } from '../../utils/metrics';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Plus } from 'lucide-react';

interface TestMarksTrendChartProps {
  onAddTest: () => void;
}

export const TestMarksTrendChart: React.FC<TestMarksTrendChartProps> = ({ onAddTest }) => {
  const { tests, examSettings, navigateToTestDetail } = useApp();
  const [chartTypeFilter, setChartTypeFilter] = useState<'all' | 'Mains' | 'Advanced'>('all');

  // Chronologically sorted data for Recharts marks trend
  const chartData = useMemo(() => {
    let list = [...tests];
    if (chartTypeFilter !== 'all') {
      list = list.filter(t => t.examType === chartTypeFilter);
    }

    const sorted = list.sort((a, b) => a.date.localeCompare(b.date));

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
  }, [tests, chartTypeFilter]);

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#292936] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F3F3F7]">Performance & Marks Trajectory</h3>
            <span className="text-[10px] font-mono text-[#8E8EA0] px-2 py-0.5 rounded-sm bg-[#0B0B10] border border-[#292936]">
              {chartData.length} data points
            </span>
          </div>
          <p className="text-xs text-[#8E8EA0] mt-0.5">
            Mains (/300) and Advanced (/360) trajectory against target reference marks
          </p>
        </div>

        {/* Filter Controls & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Exam Type Toggle */}
          <div className="flex items-center gap-1 bg-[#0B0B10] p-1 rounded-lg border border-[#292936] text-xs">
            <button
              onClick={() => setChartTypeFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                chartTypeFilter === 'all'
                  ? 'bg-[#1B1B26] text-[#F3F3F7] font-medium'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              Combined
            </button>
            <button
              onClick={() => setChartTypeFilter('Mains')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                chartTypeFilter === 'Mains'
                  ? 'bg-[#9B7BFF]/20 text-[#9B7BFF] font-medium'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              Mains
            </button>
            <button
              onClick={() => setChartTypeFilter('Advanced')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                chartTypeFilter === 'Advanced'
                  ? 'bg-[#43D9A3]/20 text-[#43D9A3] font-medium'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              Advanced
            </button>
          </div>

          {/* Series Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono">
            {(chartTypeFilter === 'all' || chartTypeFilter === 'Mains') && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9B7BFF]" />
                <span className="text-[#8E8EA0]">Mains (/300)</span>
              </div>
            )}
            {(chartTypeFilter === 'all' || chartTypeFilter === 'Advanced') && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#43D9A3]" />
                <span className="text-[#8E8EA0]">Advanced (/360)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      {chartData.length === 0 ? (
        <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-[#0B0B10] border border-[#292936] rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-2.5">
            <TrendingUp className="w-5 h-5 text-[#9B7BFF]" />
          </div>
          <p className="text-xs font-semibold text-[#F3F3F7]">No test marks to plot</p>
          <p className="text-xs text-[#8E8EA0] max-w-xs mt-1 mb-3">
            Add mock test records to visualize accuracy trends, score spikes, and consistency curves.
          </p>
          <button
            onClick={onAddTest}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#9B7BFF] hover:text-white bg-[#9B7BFF]/15 hover:bg-[#9B7BFF] rounded-lg border border-[#9B7BFF]/30 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Mock Test</span>
          </button>
        </div>
      ) : (
        <div className="w-full h-[300px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
              <CartesianGrid stroke="#292936" strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="formattedDate"
                stroke="#8E8EA0"
                tick={{ fill: '#8E8EA0', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={{ stroke: '#292936' }}
                axisLine={{ stroke: '#292936' }}
              />

              {/* Mains Axis */}
              {(chartTypeFilter === 'all' || chartTypeFilter === 'Mains') && (
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
              )}

              {/* Advanced Axis */}
              {(chartTypeFilter === 'all' || chartTypeFilter === 'Advanced') && (
                <YAxis
                  yAxisId="advanced"
                  orientation={chartTypeFilter === 'Advanced' ? 'left' : 'right'}
                  domain={[0, 360]}
                  stroke="#43D9A3"
                  tick={{ fill: '#43D9A3', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickLine={{ stroke: '#292936' }}
                  axisLine={{ stroke: '#292936' }}
                  ticks={[0, 90, 180, 270, 360]}
                />
              )}

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
                        <div className="flex items-baseline gap-2 pt-1 border-t border-[#292936]">
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
                        <div className="text-[10px] text-[#8E8EA0] italic pt-0.5">
                          Click row in list below for full mistake report
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Target Score Reference Lines */}
              {examSettings.mainsTargetScore && (chartTypeFilter === 'all' || chartTypeFilter === 'Mains') && (
                <ReferenceLine
                  yAxisId="mains"
                  y={examSettings.mainsTargetScore}
                  stroke="#9B7BFF"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: `Mains Target (${examSettings.mainsTargetScore})`,
                    fill: '#9B7BFF',
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono',
                    position: 'insideTopLeft',
                  }}
                />
              )}

              {examSettings.advancedTargetScore && (chartTypeFilter === 'all' || chartTypeFilter === 'Advanced') && (
                <ReferenceLine
                  yAxisId="advanced"
                  y={examSettings.advancedTargetScore}
                  stroke="#43D9A3"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: `Adv Target (${examSettings.advancedTargetScore})`,
                    fill: '#43D9A3',
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono',
                    position: 'insideTopRight',
                  }}
                />
              )}

              {(chartTypeFilter === 'all' || chartTypeFilter === 'Mains') && (
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
              )}

              {(chartTypeFilter === 'all' || chartTypeFilter === 'Advanced') && (
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
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
