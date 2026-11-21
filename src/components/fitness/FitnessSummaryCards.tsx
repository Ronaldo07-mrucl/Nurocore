import React from 'react';
import { useApp } from '../../context/AppContext';
import { getTodayString, formatShortDate } from '../../utils/dates';
import {
  calculateWorkoutsThisWeek,
  getLatestWeight,
  calculateNetWeightChange,
  formatWeight,
  formatWeightValue,
} from '../../utils/fitness';
import { Dumbbell, Calendar, Scale, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const FitnessSummaryCards: React.FC = () => {
  const { workouts, weightEntries, fitnessSettings } = useApp();
  const todayStr = getTodayString();

  const totalWorkouts = workouts.length;
  const workoutsThisWeek = calculateWorkoutsThisWeek(workouts, todayStr);
  const latestWeight = getLatestWeight(weightEntries);
  const netWeightChange = calculateNetWeightChange(weightEntries);

  const unit = fitnessSettings.displayWeightUnit;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Workouts */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#8E8EA0]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Total Workouts
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#43D9A3]/10 border border-[#43D9A3]/20 flex items-center justify-center text-[#43D9A3]">
            <Dumbbell className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#F3F3F7] tabular-nums">
              {totalWorkouts}
            </span>
            <span className="text-xs text-[#8E8EA0]">
              {totalWorkouts === 1 ? 'session' : 'sessions'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#292936]/60 flex items-center justify-between text-[11px] text-[#8E8EA0]">
          <span>Logged in vault</span>
          <span className="font-mono text-[#43D9A3]">ALL TIME</span>
        </div>
      </div>

      {/* 2. Workouts This Week */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#8E8EA0]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            This Week (Mon–Sun)
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#43D9A3]/10 border border-[#43D9A3]/20 flex items-center justify-center text-[#43D9A3]">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#F3F3F7] tabular-nums">
              {workoutsThisWeek}
            </span>
            <span className="text-xs text-[#8E8EA0]">
              {workoutsThisWeek === 1 ? 'session' : 'sessions'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#292936]/60 flex items-center justify-between text-[11px] text-[#8E8EA0]">
          <span>Weekly target:</span>
          <span className="font-mono font-medium text-[#F3F3F7]">
            {workoutsThisWeek >= 4 ? '4+ achieved' : `${workoutsThisWeek}/4 sessions`}
          </span>
        </div>
      </div>

      {/* 3. Latest Logged Weight */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#8E8EA0]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Latest Weight
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#9B7BFF]/10 border border-[#9B7BFF]/20 flex items-center justify-center text-[#9B7BFF]">
            <Scale className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          {latestWeight ? (
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-bold text-[#F3F3F7] tabular-nums">
                {formatWeightValue(latestWeight.weightKg, unit)}
              </span>
              <span className="text-xs text-[#8E8EA0]">{unit}</span>
            </div>
          ) : (
            <span className="text-xs text-[#8E8EA0] block py-1.5">No entries yet</span>
          )}
        </div>

        <div className="pt-2 border-t border-[#292936]/60 flex items-center justify-between text-[11px] text-[#8E8EA0]">
          <span>Measured on:</span>
          <span className="font-mono text-[#F3F3F7]">
            {latestWeight ? formatShortDate(latestWeight.date) : '—'}
          </span>
        </div>
      </div>

      {/* 4. Net Weight Change */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#8E8EA0]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Net Weight Change
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0]">
            {netWeightChange?.isIncrease ? (
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
            ) : netWeightChange?.isDecrease ? (
              <ArrowDownRight className="w-4 h-4 text-cyan-400" />
            ) : (
              <Minus className="w-4 h-4 text-[#8E8EA0]" />
            )}
          </div>
        </div>

        <div className="my-2">
          {netWeightChange ? (
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-bold text-[#F3F3F7] tabular-nums">
                {netWeightChange.diffKg > 0 ? '+' : ''}
                {formatWeightValue(netWeightChange.diffKg, unit)}
              </span>
              <span className="text-xs text-[#8E8EA0]">{unit}</span>
            </div>
          ) : (
            <span className="text-xs text-[#8E8EA0] block py-1.5">
              {weightEntries.length === 1 ? 'Need 2+ weigh-ins' : 'No records logged'}
            </span>
          )}
        </div>

        <div className="pt-2 border-t border-[#292936]/60 flex items-center justify-between text-[11px] text-[#8E8EA0]">
          <span>Trajectory:</span>
          <span className="font-mono text-[11px]">
            {netWeightChange?.isIncrease
              ? 'Weight increase'
              : netWeightChange?.isDecrease
              ? 'Weight decrease'
              : netWeightChange?.isNeutral
              ? 'Stable / no change'
              : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};
