import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ReflectionEntry, WeeklyReview, Mood } from '../types';
import { getTodayString, formatLongDate, formatShortDate } from '../utils/dates';
import { calculateReflectionStreak, getTagFrequencies } from '../utils/reflectionStats';
import { DailyReflectionBanner } from '../components/reflection/DailyReflectionBanner';
import { ReflectionCard } from '../components/reflection/ReflectionCard';
import { WeeklyReviewCard } from '../components/reflection/WeeklyReviewCard';
import { ReflectionStats } from '../components/reflection/ReflectionStats';
import { AddEditReflectionModal } from '../components/modals/AddEditReflectionModal';
import { AddEditWeeklyReviewModal } from '../components/modals/AddEditWeeklyReviewModal';
import { ReflectionDetailModal } from '../components/modals/ReflectionDetailModal';
import { ConfirmDialog } from '../components/modals/ConfirmDialog';
import {
  Brain,
  Plus,
  Search,
  Filter,
  Calendar,
  Sparkles,
  BookOpen,
  CalendarRange,
  BarChart2,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  ArrowUpDown,
  Tag,
  CheckCircle2,
} from 'lucide-react';

type ReflectionTab = 'entries' | 'weekly' | 'stats';

export const ReflectionPage: React.FC = () => {
  const {
    reflectionEntries,
    weeklyReviews,
    addReflectionEntry,
    updateReflectionEntry,
    deleteReflectionEntry,
    addWeeklyReview,
    updateWeeklyReview,
    deleteWeeklyReview,
    studySessions,
    tasks,
    workouts,
    habits,
    habitCompletions,
  } = useApp();

  const todayStr = getTodayString();

  // Active view tab
  const [activeTab, setActiveTab] = useState<ReflectionTab>('entries');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<ReflectionEntry | null>(null);

  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<WeeklyReview | null>(null);

  const [detailEntry, setDetailEntry] = useState<ReflectionEntry | null>(null);

  // Deletion state
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  // Streak & Summary calculation
  const streakInfo = useMemo(() => {
    return calculateReflectionStreak(reflectionEntries, todayStr);
  }, [reflectionEntries, todayStr]);

  // Today's reflection entry (if exists)
  const todayEntry = useMemo(() => {
    return reflectionEntries.find(e => e.date === todayStr);
  }, [reflectionEntries, todayStr]);

  // Today's System Metrics for context banner
  const todayStudyHours = useMemo(() => {
    const todaySessions = studySessions.filter(s => s.date === todayStr);
    const totalMins = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    return totalMins / 60;
  }, [studySessions, todayStr]);

  const todayTasksCompleted = useMemo(() => {
    const todayTasks = tasks.filter(t => t.dueDate === todayStr);
    const completed = todayTasks.filter(t => t.completed).length;
    return { completed, total: todayTasks.length };
  }, [tasks, todayStr]);

  const todayHabitsCompleted = useMemo(() => {
    const activeHabits = habits.filter(h => h.isActive);
    const completedCount = habitCompletions.filter(
      c => c.date === todayStr && c.completed
    ).length;
    return { completed: completedCount, total: activeHabits.length };
  }, [habits, habitCompletions, todayStr]);

  const todayWorkoutLogged = useMemo(() => {
    return workouts.some(w => w.date === todayStr);
  }, [workouts, todayStr]);

  // Filtered reflection entries
  const filteredEntries = useMemo(() => {
    let result = [...reflectionEntries];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(e => {
        const titleMatch = e.title.toLowerCase().includes(q);
        const contentMatch = e.content.toLowerCase().includes(q);
        const tagMatch = e.tags?.some(t => t.toLowerCase().includes(q));
        const winMatch = e.highlights?.mainWin?.toLowerCase().includes(q);
        const challengeMatch = e.highlights?.biggestChallenge?.toLowerCase().includes(q);
        const lessonMatch = e.highlights?.lessonLearned?.toLowerCase().includes(q);
        const priorityMatch = e.highlights?.priorityTomorrow?.toLowerCase().includes(q);
        return Boolean(
          titleMatch || contentMatch || tagMatch || winMatch || challengeMatch || lessonMatch || priorityMatch
        );
      });
    }

    // Mood filter
    if (selectedMood !== 'all') {
      result = result.filter(e => e.mood === selectedMood);
    }

    // Tag filter
    if (selectedTag) {
      result = result.filter(e => e.tags?.includes(selectedTag));
    }

    // Sort order
    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
      }
      return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
    });

    return result;
  }, [reflectionEntries, searchQuery, selectedMood, selectedTag, sortOrder]);

  // Sorted weekly reviews
  const sortedWeeklyReviews = useMemo(() => {
    return [...weeklyReviews].sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));
  }, [weeklyReviews]);

  // Handlers for entries
  const handleOpenNewEntry = (date?: string) => {
    setEntryToEdit(null);
    setIsEntryModalOpen(true);
  };

  const handleEditEntry = (entry: ReflectionEntry) => {
    setEntryToEdit(entry);
    setIsEntryModalOpen(true);
  };

  const handleConfirmDeleteEntry = () => {
    if (deleteEntryId) {
      deleteReflectionEntry(deleteEntryId);
      if (detailEntry?.id === deleteEntryId) {
        setDetailEntry(null);
      }
      setDeleteEntryId(null);
    }
  };

  // Handlers for weekly reviews
  const handleOpenNewWeeklyReview = () => {
    setReviewToEdit(null);
    setIsWeeklyModalOpen(true);
  };

  const handleEditWeeklyReview = (review: WeeklyReview) => {
    setReviewToEdit(review);
    setIsWeeklyModalOpen(true);
  };

  const handleConfirmDeleteWeeklyReview = () => {
    if (deleteReviewId) {
      deleteWeeklyReview(deleteReviewId);
      setDeleteReviewId(null);
    }
  };

  return (
    <div className="flex-1 min-w-0 max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#9B7BFF]/10 text-[#9B7BFF] border border-[#9B7BFF]/20">
              <Brain className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F3F7]">
              Reflection
            </h1>
          </div>
          <p className="text-xs font-bold text-[#F3F3F7] mt-1 font-mono">
            {formatLongDate(todayStr)}
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-3 shrink-0">

          {activeTab === 'weekly' ? (
            <button
              type="button"
              onClick={handleOpenNewWeeklyReview}
              className="px-4 py-2 text-xs font-semibold bg-[#9B7BFF] hover:bg-[#8A67FF] text-white rounded-lg shadow-sm shadow-[#9B7BFF]/30 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Weekly Review</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenNewEntry(todayStr)}
              className="px-4 py-2 text-xs font-semibold bg-[#9B7BFF] hover:bg-[#8A67FF] text-white rounded-lg shadow-sm shadow-[#9B7BFF]/30 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Daily Reflection Summary Banner */}
      <DailyReflectionBanner
        streakInfo={streakInfo}
        todayEntry={todayEntry}
        onNewTodayEntry={() => handleOpenNewEntry(todayStr)}
        onViewEntry={setDetailEntry}
        todayStudyHours={todayStudyHours}
        todayTasksCompleted={todayTasksCompleted}
        todayHabitsCompleted={todayHabitsCompleted}
        todayWorkoutLogged={todayWorkoutLogged}
      />

      {/* Section View Tabs */}
      <div className="flex items-center justify-between border-b border-[#292936] pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('entries')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'entries'
                ? 'bg-[#181824] text-[#F3F3F7] border border-[#292936]'
                : 'text-[#8E8EA0] hover:text-[#C5C5D2]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#9B7BFF]" />
            <span>Daily Journal</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#292936] text-[#8E8EA0]">
              {reflectionEntries.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('weekly')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'weekly'
                ? 'bg-[#181824] text-[#F3F3F7] border border-[#292936]'
                : 'text-[#8E8EA0] hover:text-[#C5C5D2]'
            }`}
          >
            <CalendarRange className="w-4 h-4 text-[#43D9A3]" />
            <span>Weekly Reviews</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#292936] text-[#8E8EA0]">
              {weeklyReviews.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'bg-[#181824] text-[#F3F3F7] border border-[#292936]'
                : 'text-[#8E8EA0] hover:text-[#C5C5D2]'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-[#38BDF8]" />
            <span>Calibration & Trends</span>
          </button>
        </div>

        {/* Quick count display */}
        {activeTab === 'entries' && (
          <span className="text-xs text-[#8E8EA0] hidden sm:inline-block">
            Showing {filteredEntries.length} of {reflectionEntries.length} entries
          </span>
        )}
      </div>

      {/* Tab 1: Daily Journal Entries */}
      {activeTab === 'entries' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="p-3 bg-[#14141D] border border-[#292936] rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8EA0]" />
              <input
                type="text"
                placeholder="Search reflections by topic, lesson, win, or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#181824] border border-[#292936] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#9B7BFF]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8EA0] hover:text-[#F3F3F7] text-xs"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Filter controls row */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Mood Filter */}
              <select
                value={selectedMood}
                onChange={e => setSelectedMood(e.target.value as Mood | 'all')}
                className="bg-[#181824] border border-[#292936] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF]"
              >
                <option value="all">All Moods</option>
                <option value="great">Great State</option>
                <option value="good">Good State</option>
                <option value="neutral">Neutral State</option>
                <option value="difficult">Difficult State</option>
                <option value="low">Low State</option>
              </select>

              {/* Tag filter chip indicator */}
              {selectedTag && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#9B7BFF]/15 text-[#9B7BFF] border border-[#9B7BFF]/30">
                  <span>#{selectedTag}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTag(undefined)}
                    className="hover:text-white ml-0.5"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* Sort Order */}
              <button
                type="button"
                onClick={() => setSortOrder(prev => (prev === 'newest' ? 'oldest' : 'newest'))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#181824] border border-[#292936] hover:border-[#3E3E52] text-[#F3F3F7] rounded-lg text-xs font-medium transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#8E8EA0]" />
                <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
              </button>
            </div>
          </div>

          {/* Entries Grid */}
          {filteredEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntries.map(entry => (
                <ReflectionCard
                  key={entry.id}
                  entry={entry}
                  onView={setDetailEntry}
                  onEdit={handleEditEntry}
                  onDelete={id => setDeleteEntryId(id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 bg-[#14141D] border border-[#292936] rounded-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center mx-auto border border-[#9B7BFF]/20">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#F3F3F7]">
                {searchQuery || selectedMood !== 'all' || selectedTag
                  ? 'No matching reflections found'
                  : 'No reflection entries yet'}
              </h3>
              <p className="text-xs text-[#8E8EA0] max-w-sm mx-auto leading-relaxed">
                {searchQuery || selectedMood !== 'all' || selectedTag
                  ? 'Try clearing your search query or relaxing filter criteria to inspect past journal logs.'
                  : 'Journaling cements daily knowledge, clarifies cognitive bottlenecks, and anchors sustained performance.'}
              </p>
              <div className="pt-2">
                {searchQuery || selectedMood !== 'all' || selectedTag ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMood('all');
                      setSelectedTag(undefined);
                    }}
                    className="px-4 py-2 text-xs font-medium text-[#9B7BFF] hover:underline"
                  >
                    Reset all filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenNewEntry(todayStr)}
                    className="px-4 py-2 text-xs font-semibold bg-[#9B7BFF] hover:bg-[#8A67FF] text-white rounded-lg shadow-sm shadow-[#9B7BFF]/30 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Reflection</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Weekly Reviews */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#8E8EA0] leading-relaxed">
              Step back once a week to analyze execution patterns, protect recovery, and calibrate upcoming sprint priorities.
            </p>
            <button
              type="button"
              onClick={handleOpenNewWeeklyReview}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#9B7BFF] hover:bg-[#8A67FF] text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Weekly Review</span>
            </button>
          </div>

          {sortedWeeklyReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedWeeklyReviews.map(review => (
                <WeeklyReviewCard
                  key={review.id}
                  review={review}
                  onEdit={handleEditWeeklyReview}
                  onDelete={id => setDeleteReviewId(id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 bg-[#14141D] border border-[#292936] rounded-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#43D9A3]/10 text-[#43D9A3] flex items-center justify-center mx-auto border border-[#43D9A3]/20">
                <CalendarRange className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#F3F3F7]">
                No weekly reviews logged yet
              </h3>
              <p className="text-xs text-[#8E8EA0] max-w-sm mx-auto leading-relaxed">
                Conduct weekly sprint retrospectives to analyze aggregate progress and fine-tune next week's attack strategy.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenNewWeeklyReview}
                  className="px-4 py-2 text-xs font-semibold bg-[#9B7BFF] hover:bg-[#8A67FF] text-white rounded-lg shadow-sm shadow-[#9B7BFF]/30 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Weekly Review</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Calibration & Trends */}
      {activeTab === 'stats' && (
        <ReflectionStats
          entries={reflectionEntries}
          streakInfo={streakInfo}
          selectedTag={selectedTag}
          onSelectTag={tag => {
            setSelectedTag(tag);
            if (tag) {
              setActiveTab('entries');
            }
          }}
        />
      )}

      {/* Modals */}
      {/* 1. Add / Edit Reflection Modal */}
      <AddEditReflectionModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        entryToEdit={entryToEdit}
        onSave={addReflectionEntry}
        onUpdate={updateReflectionEntry}
        onDelete={id => setDeleteEntryId(id)}
      />

      {/* 2. Add / Edit Weekly Review Modal */}
      <AddEditWeeklyReviewModal
        isOpen={isWeeklyModalOpen}
        onClose={() => setIsWeeklyModalOpen(false)}
        reviewToEdit={reviewToEdit}
        onSave={addWeeklyReview}
        onUpdate={updateWeeklyReview}
        onDelete={id => setDeleteReviewId(id)}
      />

      {/* 3. Detail View Modal */}
      <ReflectionDetailModal
        isOpen={Boolean(detailEntry)}
        onClose={() => setDetailEntry(null)}
        entry={detailEntry}
        onEdit={entry => {
          handleEditEntry(entry);
        }}
        onDelete={id => {
          setDeleteEntryId(id);
        }}
      />

      {/* 4. Delete Entry Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteEntryId)}
        onClose={() => setDeleteEntryId(null)}
        onConfirm={handleConfirmDeleteEntry}
        title="Delete Reflection Entry"
        description="Are you sure you want to permanently delete this reflection entry? This action cannot be undone."
        confirmLabel="Delete Entry"
        isDestructive={true}
      />

      {/* 5. Delete Weekly Review Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteReviewId)}
        onClose={() => setDeleteReviewId(null)}
        onConfirm={handleConfirmDeleteWeeklyReview}
        title="Delete Weekly Review"
        description="Are you sure you want to permanently delete this weekly review retrospective? This action cannot be undone."
        confirmLabel="Delete Review"
        isDestructive={true}
      />
    </div>
  );
};
