import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AnalyticsRangePreset,
  DateRange,
  getAnalyticsDateRange,
} from '../utils/analytics';
import { getTodayString, offsetDateString } from '../utils/dates';
import { AnalyticsHeader } from '../components/analytics/AnalyticsHeader';
import { AnalyticsExecutiveCards } from '../components/analytics/AnalyticsExecutiveCards';
import { StudyAnalyticsSection } from '../components/analytics/StudyAnalyticsSection';
import { TestAnalyticsSection } from '../components/analytics/TestAnalyticsSection';
import { FitnessAnalyticsSection } from '../components/analytics/FitnessAnalyticsSection';
import { HabitAnalyticsSection } from '../components/analytics/HabitAnalyticsSection';
import { ProductivityAnalyticsSection } from '../components/analytics/ProductivityAnalyticsSection';
import { MonthlyOverviewSection } from '../components/analytics/MonthlyOverviewSection';
import {
  BarChart3,
  BookOpen,
  Award,
  Dumbbell,
  CheckSquare,
  Calendar,
  Layers,
} from 'lucide-react';

type SectionAnchor =
  | 'executive'
  | 'study'
  | 'tests'
  | 'fitness'
  | 'habits'
  | 'productivity'
  | 'monthly';

export const AnalyticsPage: React.FC = () => {
  const todayStr = getTodayString();

  const [preset, setPreset] = useState<AnalyticsRangePreset>('last-30d');
  const [customStart, setCustomStart] = useState<string>(() => offsetDateString(todayStr, -29));
  const [customEnd, setCustomEnd] = useState<string>(todayStr);

  const currentRange: DateRange = getAnalyticsDateRange(
    preset,
    customStart,
    customEnd,
    todayStr
  );

  const handleSelectPreset = (newPreset: AnalyticsRangePreset) => {
    setPreset(newPreset);
  };

  const handleSetCustomRange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    setPreset('custom');
  };

  const handleShiftRange = (shifted: { startDate: string; endDate: string }) => {
    setCustomStart(shifted.startDate);
    setCustomEnd(shifted.endDate);
    setPreset('custom');
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-16">
      {/* 1. Header with Global Range Filter */}
      <AnalyticsHeader
        currentRange={currentRange}
        onSelectPreset={handleSelectPreset}
        onSetCustomRange={handleSetCustomRange}
        onShiftRange={handleShiftRange}
      />

      {/* 2. Executive Summary Cards with Prior Period Comparisons */}
      <div id="section-executive">
        <AnalyticsExecutiveCards currentRange={currentRange} />
      </div>

      {/* 3. Study Performance Analytics */}
      <div id="section-study">
        <StudyAnalyticsSection currentRange={currentRange} />
      </div>

      {/* 4. Test & Exam Performance Analytics */}
      <div id="section-tests">
        <TestAnalyticsSection currentRange={currentRange} />
      </div>

      {/* 5. Fitness & Body Metrics Analytics */}
      <div id="section-fitness">
        <FitnessAnalyticsSection currentRange={currentRange} />
      </div>

      {/* 6. Habit & Discipline Analytics */}
      <div id="section-habits">
        <HabitAnalyticsSection currentRange={currentRange} />
      </div>

      {/* 7. Planning & Task Productivity Analytics */}
      <div id="section-productivity">
        <ProductivityAnalyticsSection currentRange={currentRange} />
      </div>

      {/* 8. Multi-Month Macro Overview Table */}
      <div id="section-monthly">
        <MonthlyOverviewSection />
      </div>
    </div>
  );
};
