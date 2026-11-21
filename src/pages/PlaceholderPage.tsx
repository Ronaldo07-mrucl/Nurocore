import React from 'react';
import { NavigationDestination } from '../types';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  ClipboardCheck,
  Dumbbell,
  CheckSquare,
  Calendar,
  BarChart3,
  Brain,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface PlaceholderConfig {
  title: string;
  subtitle: string;
  phase: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

const PLACEHOLDER_DETAILS: Partial<Record<NavigationDestination, PlaceholderConfig>> = {
  'test-error-log': {
    title: 'Test & Error Log',
    subtitle: 'Comprehensive exam registry, question mistake taxonomy, and syllabus mastery',
    phase: 'Phase 3',
    icon: ClipboardCheck,
    features: [
      'Structured error categorization (calculation slip, concept gap, time crunch)',
      'Chapter-by-chapter weak area heatmap and retry queue',
      'Full test history archive and comparative percentiles',
    ],
  },
  'fitness': {
    title: 'Fitness Tracker',
    subtitle: 'Workout log, bodyweight trend tracking, and physical recovery',
    phase: 'Phase 4',
    icon: Dumbbell,
    features: [
      'Daily resistance training routine & push/pull/legs split tracking',
      'Weight progress charts and body measurement records',
      'Energy level & recovery correlation with study performance',
    ],
  },
  'habit-tracking': {
    title: 'Habit Tracking',
    subtitle: 'Daily routine adherence, streak maintenance, and non-negotiables',
    phase: 'Phase 5',
    icon: CheckSquare,
    features: [
      'Custom habit schedules and "Must Do" flags',
      'Active streak counts and consistency percentages',
      'Weekly habit grid view and monthly heatmap visualization',
    ],
  },
  'planning': {
    title: 'Planning System',
    subtitle: 'Weekly planner, monthly mission objectives, and milestone roadmaps',
    phase: 'Phase 6',
    icon: Calendar,
    features: [
      'Monthly mission cards with measurable key results',
      'Day-by-day weekly study schedule and task locking',
      'Long-term exam milestone roadmaps',
    ],
  },
  'analytics': {
    title: 'Analytics & Insights',
    subtitle: 'Correlated study metrics, questions velocity, and habit consistency curves',
    phase: 'Phase 7',
    icon: BarChart3,
    features: [
      'Study hours vs marks correlation scatter',
      'Weekly question velocity trends across subjects',
      'Mastery percentage calculations by academic syllabus',
    ],
  },
  'reflection': {
    title: 'Self-Reflection',
    subtitle: 'Daily shutdown ritual, mindset audit, and weekly retrospective review',
    phase: 'Phase 8',
    icon: Brain,
    features: [
      'Evening shutdown checklist and wins of the day',
      'Friction points log and mental clarity score',
      'Weekly qualitative review and strategic adjustments',
    ],
  },
};

interface PlaceholderPageProps {
  page: NavigationDestination;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ page }) => {
  const { setActivePage } = useApp();
  const config = PLACEHOLDER_DETAILS[page] || {
    title: page,
    subtitle: 'Module in development',
    phase: 'Upcoming Phase',
    icon: Sparkles,
    features: ['Extended features in subsequent build phases'],
  };

  const Icon = config.icon;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => setActivePage('dashboard')}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#14141D] border border-[#292936] rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Main card */}
      <div className="bg-[#14141D] border border-[#292936] rounded-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#9B7BFF] mx-auto shadow-inner">
          <Icon className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <span className="text-[11px] font-mono font-semibold tracking-wider text-[#9B7BFF] uppercase bg-[#9B7BFF]/10 px-3 py-1 rounded-full border border-[#9B7BFF]/20">
            {config.phase} Milestone
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F3F3F7] tracking-tight pt-2">
            {config.title}
          </h1>
          <p className="text-sm text-[#8E8EA0] leading-relaxed">
            {config.subtitle}
          </p>
        </div>

        {/* Planned Features Preview */}
        <div className="max-w-md mx-auto bg-[#0B0B10] border border-[#292936] rounded-xl p-5 text-left space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8E8EA0] block">
            Coming in a later phase
          </span>
          <ul className="space-y-2 text-xs text-[#F3F3F7]">
            {config.features.map((feat, index) => (
              <li key={index} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B7BFF] shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <button
            onClick={() => setActivePage('dashboard')}
            className="px-5 py-2.5 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-xl transition-colors shadow-md shadow-[#9B7BFF]/20 cursor-pointer"
          >
            Explore Dashboard in Phase 1
          </button>
        </div>
      </div>
    </div>
  );
};
