import React from 'react';
import { TopExamBanner } from './TopExamBanner';
import { RightNavRail } from './RightNavRail';
import { useApp } from '../../context/AppContext';
import { DashboardPage } from '../../pages/DashboardPage';
import { StudyLogPage } from '../../pages/StudyLogPage';
import { TestDetailPage } from '../../pages/TestDetailPage';
import { TestErrorLogPage } from '../../pages/TestErrorLogPage';
import { FitnessPage } from '../../pages/FitnessPage';
import { HabitTrackingPage } from '../../pages/HabitTrackingPage';
import { PlanningPage } from '../../pages/PlanningPage';
import { AnalyticsPage } from '../../pages/AnalyticsPage';
import { ReflectionPage } from '../../pages/ReflectionPage';
import { PlaceholderPage } from '../../pages/PlaceholderPage';

export const Shell: React.FC = () => {
  const { activePage, activeTestDetailId } = useApp();

  const renderContent = () => {
    // If viewing a full test detail report
    if (activeTestDetailId) {
      return <TestDetailPage testId={activeTestDetailId} />;
    }

    // Main navigation routes
    if (activePage === 'dashboard') {
      return <DashboardPage />;
    }

    if (activePage === 'study-log') {
      return <StudyLogPage />;
    }

    if (activePage === 'test-error-log') {
      return <TestErrorLogPage />;
    }

    if (activePage === 'fitness') {
      return <FitnessPage />;
    }

    if (activePage === 'habit-tracking') {
      return <HabitTrackingPage />;
    }

    if (activePage === 'planning') {
      return <PlanningPage />;
    }

    if (activePage === 'analytics') {
      return <AnalyticsPage />;
    }

    if (activePage === 'reflection') {
      return <ReflectionPage />;
    }

    // Placeholder pages for other destinations
    return <PlaceholderPage page={activePage} />;
  };

  return (
    <div className="min-h-screen bg-[#0B0B10] text-[#F3F3F7] flex flex-row justify-between selection:bg-[#9B7BFF]/30 selection:text-[#F3F3F7]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Persistent Exam Deadline Indicator at Top */}
        <TopExamBanner />

        {/* Main Scrollable Viewport */}
        <main className="flex-1 p-4 md:p-8 pb-12 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Right Navigation Rail with embedded Study Target Widget */}
      <RightNavRail />
    </div>
  );
};
