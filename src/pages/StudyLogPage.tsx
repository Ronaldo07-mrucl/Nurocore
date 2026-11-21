import React, { useState } from 'react';
import { DateRangeFilter, StudySession } from '../types';
import { useApp } from '../context/AppContext';
import { StudyLogHeader } from '../components/study/StudyLogHeader';
import { StudySummaryCards } from '../components/study/StudySummaryCards';
import { StudyChartsSection } from '../components/study/StudyChartsSection';
import { SubjectLibrarySection } from '../components/study/SubjectLibrarySection';
import { RecentSessionsTable } from '../components/study/RecentSessionsTable';
import { SubjectDetailView } from '../components/study/SubjectDetailView';
import { AddEditStudySessionModal } from '../components/modals/AddEditStudySessionModal';

export const StudyLogPage: React.FC = () => {
  const { activeSubjectId, addStudySession, updateStudySession } = useApp();
  const [filter, setFilter] = useState<DateRangeFilter>('7d');
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // If a specific subject is opened, show its dedicated Chapter Tracker view
  if (activeSubjectId) {
    return <SubjectDetailView subjectId={activeSubjectId} />;
  }

  const handleOpenAddSession = () => {
    setEditingSession(null);
    setSessionModalOpen(true);
  };

  const handleEditSession = (session: StudySession) => {
    setEditingSession(session);
    setSessionModalOpen(true);
  };

  const handleSaveSession = (
    sessionData: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'> | StudySession
  ) => {
    if ('id' in sessionData) {
      updateStudySession(sessionData as StudySession);
    } else {
      addStudySession(sessionData);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* A. Page Header & Date-Range Filters */}
      <StudyLogHeader
        filter={filter}
        onFilterChange={setFilter}
        onAddSession={handleOpenAddSession}
      />

      {/* B. Summary Metric Cards */}
      <StudySummaryCards filter={filter} />

      {/* C & D. Study-Hours and Questions-Solved Trend Charts */}
      <StudyChartsSection filter={filter} onAddSession={handleOpenAddSession} />

      {/* F. Subject Library */}
      <SubjectLibrarySection />

      {/* E. Daily Logging Interface & Recent Study Sessions Table */}
      <RecentSessionsTable
        filter={filter}
        onEditSession={handleEditSession}
        onAddSession={handleOpenAddSession}
      />

      {/* Add / Edit Study Session Modal */}
      <AddEditStudySessionModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        onSave={handleSaveSession}
        initialSession={editingSession}
      />
    </div>
  );
};
