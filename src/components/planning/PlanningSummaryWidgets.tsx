import React from 'react';
import { useApp } from '../../context/AppContext';
import { Target, CheckCircle2, AlertTriangle, Flag, ArrowUpRight } from 'lucide-react';
import { formatMonthYear } from '../../utils/dates';

interface PlanningSummaryWidgetsProps {
  selectedMonth: string;
  weekDates: string[];
}

export const PlanningSummaryWidgets: React.FC<PlanningSummaryWidgetsProps> = ({
  selectedMonth,
  weekDates,
}) => {
  const { monthlyOutcomes, tasks, goals } = useApp();

  // 1. Monthly Outcomes for selected month
  const outcomesForMonth = monthlyOutcomes.filter(o => o.month === selectedMonth);
  const totalOutcomes = outcomesForMonth.length;
  const completedOutcomes = outcomesForMonth.filter(o => o.completed).length;
  const outcomesPercentage = totalOutcomes > 0 ? Math.round((completedOutcomes / totalOutcomes) * 100) : 0;

  // 2. Weekly Tasks for selected week
  const weekSet = new Set(weekDates);
  const tasksForWeek = tasks.filter(t => weekSet.has(t.dueDate));
  const totalWeekTasks = tasksForWeek.length;
  const completedWeekTasks = tasksForWeek.filter(t => t.completed).length;
  const weekTasksPercentage = totalWeekTasks > 0 ? Math.round((completedWeekTasks / totalWeekTasks) * 100) : 0;

  // 3. High-Priority Tasks remaining this week
  const highPriorityPending = tasksForWeek.filter(t => t.priority === 'high' && !t.completed).length;
  const highPriorityTotal = tasksForWeek.filter(t => t.priority === 'high').length;

  // 4. Long-Term Goals Average Progress
  const totalGoals = goals.length;
  const avgGoalProgress = totalGoals > 0
    ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / totalGoals)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Monthly Outcomes */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-[#3E3E52] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#8E8EA0] uppercase tracking-wider">
            Monthly Outcomes
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#F3F3F7]">
              {totalOutcomes > 0 ? `${completedOutcomes}/${totalOutcomes}` : '0'}
            </span>
            <span className="text-xs text-[#8E8EA0]">
              {totalOutcomes > 0 ? `${outcomesPercentage}% done` : 'No outcomes'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#1B1B26] rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#9B7BFF] to-[#825ff5] h-full rounded-full transition-all duration-300"
              style={{ width: `${outcomesPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-[#8E8EA0] mt-1.5 truncate">
            {formatMonthYear(selectedMonth)} focus
          </p>
        </div>
      </div>

      {/* 2. Weekly Tasks Execution */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-[#3E3E52] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#8E8EA0] uppercase tracking-wider">
            Weekly Execution
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#43D9A3]/10 text-[#43D9A3] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#F3F3F7]">
              {totalWeekTasks > 0 ? `${completedWeekTasks}/${totalWeekTasks}` : '0'}
            </span>
            <span className="text-xs text-[#8E8EA0]">
              {totalWeekTasks > 0 ? `${weekTasksPercentage}% done` : 'No tasks scheduled'}
            </span>
          </div>
          <div className="w-full bg-[#1B1B26] rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-[#43D9A3] h-full rounded-full transition-all duration-300"
              style={{ width: `${weekTasksPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-[#8E8EA0] mt-1.5">
            {totalWeekTasks - completedWeekTasks} remaining this week
          </p>
        </div>
      </div>

      {/* 3. High-Priority Focus */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-[#3E3E52] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#8E8EA0] uppercase tracking-wider">
            High Priority
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#F3F3F7]">
              {highPriorityPending}
            </span>
            <span className="text-xs text-[#8E8EA0]">
              {highPriorityTotal > 0 ? `of ${highPriorityTotal} total urgent` : 'items pending'}
            </span>
          </div>
          <div className="w-full bg-[#1B1B26] rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-rose-400 h-full rounded-full transition-all duration-300"
              style={{
                width: highPriorityTotal > 0
                  ? `${Math.round(((highPriorityTotal - highPriorityPending) / highPriorityTotal) * 100)}%`
                  : '0%'
              }}
            />
          </div>
          <p className="text-[11px] text-[#8E8EA0] mt-1.5">
            {highPriorityPending === 0 ? 'All urgent tasks cleared' : 'Requires immediate attention'}
          </p>
        </div>
      </div>

      {/* 4. Long-Term Identity & Goals */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-[#3E3E52] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#8E8EA0] uppercase tracking-wider">
            Identity Goals
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Flag className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#F3F3F7]">
              {avgGoalProgress}%
            </span>
            <span className="text-xs text-[#8E8EA0]">
              avg progress ({totalGoals} {totalGoals === 1 ? 'goal' : 'goals'})
            </span>
          </div>
          <div className="w-full bg-[#1B1B26] rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${avgGoalProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-[#8E8EA0] mt-1.5">
            Long-term identity benchmarks
          </p>
        </div>
      </div>
    </div>
  );
};
