import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DateRange,
  calculateFitnessMetrics,
} from '../../utils/analytics';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import {
  Dumbbell,
  Scale,
  Ruler,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
} from 'lucide-react';
import { formatMonthDay, formatShortDate } from '../../utils/dates';

interface FitnessAnalyticsSectionProps {
  currentRange: DateRange;
}

type MeasurementTab = 'waist' | 'chest' | 'hips' | 'arm' | 'thigh';

export const FitnessAnalyticsSection: React.FC<FitnessAnalyticsSectionProps> = ({
  currentRange,
}) => {
  const { workouts, weightEntries, bodyMeasurements, fitnessSettings, setActivePage } = useApp();

  const [activeMeasurement, setActiveMeasurement] = useState<MeasurementTab>('waist');

  const unitWeight = fitnessSettings.displayWeightUnit;
  const unitLength = fitnessSettings.displayLengthUnit;

  const fitnessMetrics = useMemo(() => {
    return calculateFitnessMetrics(
      workouts,
      weightEntries,
      bodyMeasurements,
      fitnessSettings,
      currentRange.startDate,
      currentRange.endDate
    );
  }, [workouts, weightEntries, bodyMeasurements, fitnessSettings, currentRange.startDate, currentRange.endDate]);

  // Workout series by date
  const workoutDailyCounts = useMemo(() => {
    const map: Record<string, number> = {};
    workouts
      .filter(w => w.date >= currentRange.startDate && w.date <= currentRange.endDate)
      .forEach(w => {
        map[w.date] = (map[w.date] || 0) + 1;
      });

    return Object.keys(map)
      .sort()
      .map(d => ({
        date: d,
        formattedDate: formatMonthDay(d),
        count: map[d],
      }));
  }, [workouts, currentRange.startDate, currentRange.endDate]);

  const hasData =
    fitnessMetrics.totalWorkouts > 0 ||
    fitnessMetrics.weightTrendSeries.length > 0 ||
    fitnessMetrics.measurementTrendSeries.length > 0;

  return (
    <section className="bg-[#14141D] border border-[#292936] rounded-xl p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292936]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F3F3F7]">
              Fitness & Body Metrics Analytics
            </h2>
            <p className="text-xs text-[#8E8EA0]">
              Weight trends, workout consistency, and physical measurements
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActivePage('fitness')}
          className="px-3 py-1 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors self-start sm:self-auto"
        >
          View Fitness Module →
        </button>
      </div>

      {!hasData ? (
        <div className="py-12 px-4 text-center border border-dashed border-[#292936] rounded-xl bg-[#0B0B10]/20">
          <Dumbbell className="w-10 h-10 text-[#8E8EA0] mx-auto mb-2 opacity-40" />
          <h3 className="text-sm font-semibold text-[#F3F3F7]">No fitness data recorded in this period</h3>
          <p className="text-xs text-[#8E8EA0] max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            Record workout sessions, log morning weights, and track circumferences in the Fitness module.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('fitness')}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg hover:opacity-90 transition-all"
          >
            Go to Fitness Module
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Workouts Logged */}
            <div className="p-3.5 bg-[#1B1B26] border border-[#292936] rounded-xl">
              <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider block">
                Total Workouts
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-[#F3F3F7]">
                  {fitnessMetrics.totalWorkouts}
                </span>
                <span className="text-xs text-[#8E8EA0]">sessions</span>
              </div>
              <p className="text-[11px] text-[#8E8EA0] mt-1.5 truncate">
                {fitnessMetrics.workoutsByType.length > 0
                  ? `Top: ${fitnessMetrics.workoutsByType[0].type} (${fitnessMetrics.workoutsByType[0].count})`
                  : 'No workouts'}
              </p>
            </div>

            {/* Latest Weight */}
            <div className="p-3.5 bg-[#1B1B26] border border-[#292936] rounded-xl">
              <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider block">
                Latest Logged Weight
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-[#F3F3F7]">
                  {fitnessMetrics.latestWeightKg !== null
                    ? (unitWeight === 'lb'
                        ? Math.round(fitnessMetrics.latestWeightKg * 2.20462 * 10) / 10
                        : fitnessMetrics.latestWeightKg)
                    : 'N/A'}
                </span>
                <span className="text-xs text-[#8E8EA0]">{unitWeight}</span>
              </div>
              <p className="text-[11px] text-[#8E8EA0] mt-1.5">
                {fitnessMetrics.weightTrendSeries.length} weigh-ins in period
              </p>
            </div>

            {/* Net Weight Change */}
            <div className="p-3.5 bg-[#1B1B26] border border-[#292936] rounded-xl">
              <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider block">
                Net Weight Change
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                {fitnessMetrics.netWeightChangeKg !== null ? (
                  <>
                    <span className="text-2xl font-bold text-[#F3F3F7]">
                      {fitnessMetrics.netWeightChangeKg > 0 ? '+' : ''}
                      {unitWeight === 'lb'
                        ? Math.round(fitnessMetrics.netWeightChangeKg * 2.20462 * 10) / 10
                        : fitnessMetrics.netWeightChangeKg}
                    </span>
                    <span className="text-xs text-[#8E8EA0]">{unitWeight}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-[#8E8EA0]">N/A</span>
                )}
              </div>
              <p className="text-[11px] text-[#8E8EA0] mt-1.5">
                {fitnessMetrics.netWeightChangeKg !== null
                  ? fitnessMetrics.netWeightChangeKg > 0
                    ? 'Net increase over range'
                    : fitnessMetrics.netWeightChangeKg < 0
                    ? 'Net decrease over range'
                    : 'Zero net change'
                  : 'Requires 2+ entries'}
              </p>
            </div>
          </div>

          {/* Chart 1: Body Weight Trend */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-rose-400" />
                  Body-Weight Trend ({unitWeight.toUpperCase()})
                </h3>
                <span className="text-[11px] text-[#8E8EA0]">
                  Actual weighed dates with no synthetic interpolation
                </span>
              </div>
            </div>

            {fitnessMetrics.weightTrendSeries.length === 0 ? (
              <div className="h-48 flex items-center justify-center border border-dashed border-[#292936] rounded-xl text-xs text-[#8E8EA0]">
                No weight records logged for this period.
              </div>
            ) : (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={fitnessMetrics.weightTrendSeries}
                    margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#292936" vertical={false} />
                    <XAxis
                      dataKey="formattedDate"
                      stroke="#8E8EA0"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#8E8EA0"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={val => `${val}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#14141D] border border-[#292936] p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                              <p className="font-semibold text-[#F3F3F7]">{data.date}</p>
                              <p className="text-rose-400 font-bold">
                                {data.weightDisplay} {unitWeight}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weightDisplay"
                      stroke="#FB7185"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#FB7185' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 2 & 3: Workouts by Date & Body Measurements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4 border-t border-[#292936]">
            {/* Chart 2: Workout Frequency */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7] flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-rose-400" />
                Workouts Completed Timeline
              </h3>
              {workoutDailyCounts.length === 0 ? (
                <div className="h-44 flex items-center justify-center border border-dashed border-[#292936] rounded-xl text-xs text-[#8E8EA0]">
                  No workouts recorded in this period.
                </div>
              ) : (
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={workoutDailyCounts}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#292936" vertical={false} />
                      <XAxis dataKey="formattedDate" stroke="#8E8EA0" fontSize={10} tickLine={false} />
                      <YAxis stroke="#8E8EA0" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#14141D] border border-[#292936] p-2 rounded text-xs">
                                <p className="font-semibold text-[#F3F3F7]">{data.date}</p>
                                <p className="text-rose-400">{data.count} workout session(s)</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="count" fill="#FB7185" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 3: Body Measurements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                  Circumference Measurements ({unitLength})
                </h3>
                {/* Measurement Switcher */}
                <div className="flex items-center bg-[#0B0B10] border border-[#292936] rounded-lg p-0.5 text-[10px]">
                  {(['waist', 'chest', 'hips', 'arm', 'thigh'] as MeasurementTab[]).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveMeasurement(tab)}
                      className={`px-2 py-0.5 rounded capitalize transition-colors ${
                        activeMeasurement === tab
                          ? 'bg-[#1B1B26] text-[#F3F3F7] font-semibold'
                          : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {fitnessMetrics.measurementTrendSeries.length === 0 ? (
                <div className="h-44 flex items-center justify-center border border-dashed border-[#292936] rounded-xl text-xs text-[#8E8EA0]">
                  No measurement entries recorded in this period.
                </div>
              ) : (
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={fitnessMetrics.measurementTrendSeries}
                      margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#292936" vertical={false} />
                      <XAxis dataKey="formattedDate" stroke="#8E8EA0" fontSize={10} tickLine={false} />
                      <YAxis stroke="#8E8EA0" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const val = data[activeMeasurement];
                            return (
                              <div className="bg-[#14141D] border border-[#292936] p-2 rounded text-xs capitalize">
                                <p className="font-semibold text-[#F3F3F7]">{data.date}</p>
                                <p className="text-cyan-400">
                                  {activeMeasurement}: {val !== undefined ? `${val} ${unitLength}` : 'Not logged'}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={activeMeasurement}
                        stroke="#38BDF8"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#38BDF8' }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
