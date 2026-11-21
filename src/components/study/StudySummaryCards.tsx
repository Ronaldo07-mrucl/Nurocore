import React from 'react';
import { DateRangeFilter } from '../../types';
import { useApp } from '../../context/AppContext';
import { getTodayString } from '../../utils/dates';
import {
  filterSessionsByRange,
  filterSessionsByPrecedingRange,
  formatDuration,
} from '../../utils/metrics';
import { Clock, CheckCircle2, BookOpen, Layers } from 'lucide-react';

interface StudySummaryCardsProps {
  filter: DateRangeFilter;
}

export const StudySummaryCards: React.FC<StudySummaryCardsProps> = ({ filter }) => {
  const { studySessions, subjects } = useApp();
  const today = getTodayString();

  // Current filtered sessions
  const currentSessions = filterSessionsByRange(studySessions, filter, today);
  const precedingSessions = filterSessionsByPrecedingRange(studySessions, filter, today);

  // 1. Total Study Hours & Minutes
  const totalMinutes = currentSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const prevMinutes = precedingSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const prevHours = Math.round((prevMinutes / 60) * 10) / 10;
  const hoursDiff = Math.round((totalHours - prevHours) * 10) / 10;

  // 2. Questions Solved
  const totalQuestions = currentSessions.reduce((sum, s) => {
    return sum + (s.questionsAttempted ?? s.questionsSolved ?? 0);
  }, 0);

  const prevQuestions = precedingSessions.reduce((sum, s) => {
    return sum + (s.questionsAttempted ?? s.questionsSolved ?? 0);
  }, 0);
  const questionsDiff = totalQuestions - prevQuestions;

  // 3. Study Sessions Count
  const sessionCount = currentSessions.length;
  const prevSessionCount = precedingSessions.length;
  const sessionsDiff = sessionCount - prevSessionCount;

  // 4. Active Subjects
  const activeSubjectsCount = subjects.length;

  const hasPrecedingData = precedingSessions.length > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Study Hours */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between hover:border-[#3B3B4E] transition-all">
        <div className="flex items-center justify-between text-[#8E8EA0] mb-3">
          <span className="text-xs font-medium uppercase tracking-wider">Total Study Hours</span>
          <div className="w-8 h-8 rounded-lg bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-[#F3F3F7]">
              {totalHours}
            </span>
            <span className="text-xs text-[#8E8EA0] font-medium">hours</span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-[#8E8EA0]">
            {filter === 'all' ? (
              <span>All recorded time · {formatDuration(totalMinutes)}</span>
            ) : hasPrecedingData ? (
              <span className={hoursDiff >= 0 ? 'text-[#43D9A3]' : 'text-amber-400'}>
                {hoursDiff >= 0 ? `+${hoursDiff}h` : `${hoursDiff}h`} vs preceding period
              </span>
            ) : (
              <span>Previous period: No data</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Questions Solved */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between hover:border-[#3B3B4E] transition-all">
        <div className="flex items-center justify-between text-[#8E8EA0] mb-3">
          <span className="text-xs font-medium uppercase tracking-wider">Questions Solved</span>
          <div className="w-8 h-8 rounded-lg bg-[#43D9A3]/10 text-[#43D9A3] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-[#F3F3F7]">
              {totalQuestions}
            </span>
            <span className="text-xs text-[#8E8EA0] font-medium">problems</span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-[#8E8EA0]">
            {filter === 'all' ? (
              <span>Cumulative questions logged</span>
            ) : hasPrecedingData ? (
              <span className={questionsDiff >= 0 ? 'text-[#43D9A3]' : 'text-amber-400'}>
                {questionsDiff >= 0 ? `+${questionsDiff}` : `${questionsDiff}`} vs preceding period
              </span>
            ) : (
              <span>Previous period: No data</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Study Sessions */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between hover:border-[#3B3B4E] transition-all">
        <div className="flex items-center justify-between text-[#8E8EA0] mb-3">
          <span className="text-xs font-medium uppercase tracking-wider">Study Sessions</span>
          <div className="w-8 h-8 rounded-lg bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-[#F3F3F7]">
              {sessionCount}
            </span>
            <span className="text-xs text-[#8E8EA0] font-medium">
              {sessionCount === 1 ? 'block' : 'blocks'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-[#8E8EA0]">
            {filter === 'all' ? (
              <span>All logged sessions</span>
            ) : hasPrecedingData ? (
              <span className={sessionsDiff >= 0 ? 'text-[#43D9A3]' : 'text-amber-400'}>
                {sessionsDiff >= 0 ? `+${sessionsDiff}` : `${sessionsDiff}`} vs preceding period
              </span>
            ) : (
              <span>Previous period: No data</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Active Subjects */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between hover:border-[#3B3B4E] transition-all">
        <div className="flex items-center justify-between text-[#8E8EA0] mb-3">
          <span className="text-xs font-medium uppercase tracking-wider">Active Subjects</span>
          <div className="w-8 h-8 rounded-lg bg-[#43D9A3]/10 text-[#43D9A3] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-[#F3F3F7]">
              {activeSubjectsCount}
            </span>
            <span className="text-xs text-[#8E8EA0] font-medium">domains</span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-[#8E8EA0]">
            <span>In active subject library</span>
          </div>
        </div>
      </div>
    </div>
  );
};
