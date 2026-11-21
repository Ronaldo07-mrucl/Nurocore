import React, { useMemo } from 'react';
import { DateRangeFilter } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  getTodayString,
  getDateRangeStartDate,
  generateDateSeries,
  formatShortDate,
} from '../../utils/dates';
import {
  filterSessionsByRange,
  aggregateDailyStudyHours,
  aggregateDailyQuestions,
  formatDuration,
} from '../../utils/metrics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Clock, CheckCircle2, Plus } from 'lucide-react';

interface StudyChartsSectionProps {
  filter: DateRangeFilter;
  onAddSession: () => void;
}

export const StudyChartsSection: React.FC<StudyChartsSectionProps> = ({
  filter,
  onAddSession,
}) => {
  const { studySessions } = useApp();
  const today = getTodayString();

  // Determine date bounds
  const { dateList, filteredSessions } = useMemo(() => {
    const sessions = filterSessionsByRange(studySessions, filter, today);

    let start = getDateRangeStartDate(filter, today);

    // If 'all', find earliest session date or fallback to 7 days ago
    if (!start) {
      if (sessions.length > 0) {
        const sortedDates = [...sessions].map(s => s.date).sort();
        start = sortedDates[0];
      } else {
        start = today;
      }
    }

    const list = generateDateSeries(start, today);
    return { dateList: list, filteredSessions: sessions };
  }, [studySessions, filter, today]);

  // Daily study hours data
  const hoursData = useMemo(() => {
    return aggregateDailyStudyHours(filteredSessions, dateList);
  }, [filteredSessions, dateList]);

  // Daily questions data
  const questionsData = useMemo(() => {
    return aggregateDailyQuestions(filteredSessions, dateList);
  }, [filteredSessions, dateList]);

  const hasAnyStudy = filteredSessions.some(s => s.durationMinutes > 0);
  const hasAnyQuestions = filteredSessions.some(
    s => (s.questionsAttempted ?? s.questionsSolved ?? 0) > 0
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Study Hours Trend Chart */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#292936]">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#9B7BFF]" />
                <h3 className="text-sm font-semibold text-[#F3F3F7]">Study Hours Trend</h3>
              </div>
              <p className="text-xs text-[#8E8EA0] mt-0.5">
                Daily aggregated study block duration
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#9B7BFF]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9B7BFF]" />
              <span>Hours / Day</span>
            </div>
          </div>

          {!hasAnyStudy ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-2.5">
                <Clock className="w-5 h-5 text-[#9B7BFF]" />
              </div>
              <p className="text-xs font-medium text-[#F3F3F7]">No study logged in this period</p>
              <p className="text-xs text-[#8E8EA0] max-w-xs mt-1 mb-3">
                Log your study sessions to visualize your daily focus volume.
              </p>
              <button
                onClick={onAddSession}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#9B7BFF] hover:text-white bg-[#9B7BFF]/15 hover:bg-[#9B7BFF] rounded-lg border border-[#9B7BFF]/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Study Session</span>
              </button>
            </div>
          ) : (
            <div className="w-full h-[260px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studyHoursGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9B7BFF" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#9B7BFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#292936" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#8E8EA0"
                    tick={{ fill: '#8E8EA0', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickLine={{ stroke: '#292936' }}
                    axisLine={{ stroke: '#292936' }}
                    interval={dateList.length > 30 ? Math.floor(dateList.length / 8) : 0}
                  />
                  <YAxis
                    stroke="#8E8EA0"
                    tick={{ fill: '#8E8EA0', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickLine={{ stroke: '#292936' }}
                    axisLine={{ stroke: '#292936' }}
                    domain={[0, 'auto']}
                    allowDecimals={true}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#14141D] border border-[#292936] p-3 rounded-lg shadow-xl text-xs space-y-1 font-mono">
                            <div className="text-[11px] text-[#8E8EA0]">
                              {formatShortDate(data.date)}
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-[#9B7BFF] font-bold text-base">
                                {data.hours} hours
                              </span>
                              <span className="text-[#8E8EA0] text-[11px]">
                                ({formatDuration(data.minutes)})
                              </span>
                            </div>
                            <div className="text-[11px] text-[#8E8EA0]">
                              {data.sessionCount} {data.sessionCount === 1 ? 'session' : 'sessions'} logged
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#9B7BFF"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#studyHoursGradient)"
                    dot={{ fill: '#9B7BFF', stroke: '#14141D', strokeWidth: 1.5, r: 3 }}
                    activeDot={{ r: 5, fill: '#9B7BFF' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 2. Questions-Solved Trend Chart */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#292936]">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#43D9A3]" />
                <h3 className="text-sm font-semibold text-[#F3F3F7]">Questions Solved Trend</h3>
              </div>
              <p className="text-xs text-[#8E8EA0] mt-0.5">
                Problem volume attempted & correct answers
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#43D9A3]" />
                <span className="text-[#8E8EA0]">Attempted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9B7BFF]" />
                <span className="text-[#8E8EA0]">Correct</span>
              </div>
            </div>
          </div>

          {!hasAnyQuestions ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#43D9A3]" />
              </div>
              <p className="text-xs font-medium text-[#F3F3F7]">No questions logged in this period</p>
              <p className="text-xs text-[#8E8EA0] max-w-xs mt-1 mb-3">
                Log question numbers in your sessions to track daily practice volume.
              </p>
              <button
                onClick={onAddSession}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#43D9A3] hover:text-white bg-[#43D9A3]/15 hover:bg-[#43D9A3] rounded-lg border border-[#43D9A3]/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Study Session</span>
              </button>
            </div>
          ) : (
            <div className="w-full h-[260px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={questionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#292936" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#8E8EA0"
                    tick={{ fill: '#8E8EA0', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickLine={{ stroke: '#292936' }}
                    axisLine={{ stroke: '#292936' }}
                    interval={dateList.length > 30 ? Math.floor(dateList.length / 8) : 0}
                  />
                  <YAxis
                    stroke="#8E8EA0"
                    tick={{ fill: '#8E8EA0', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickLine={{ stroke: '#292936' }}
                    axisLine={{ stroke: '#292936' }}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#14141D] border border-[#292936] p-3 rounded-lg shadow-xl text-xs space-y-1 font-mono">
                            <div className="text-[11px] text-[#8E8EA0]">
                              {formatShortDate(data.date)}
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-[#43D9A3] font-bold text-sm">
                                {data.attempted} Attempted
                              </span>
                              {data.correct > 0 && (
                                <span className="text-[#9B7BFF]">
                                  · {data.correct} Correct ({Math.round((data.correct / data.attempted) * 100)}%)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="attempted"
                    name="Attempted"
                    fill="#43D9A3"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                  <Bar
                    dataKey="correct"
                    name="Correct"
                    fill="#9B7BFF"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
