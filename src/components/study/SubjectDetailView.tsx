import React, { useState, useMemo } from 'react';
import { Chapter, ChapterMastery } from '../../types';
import { useApp } from '../../context/AppContext';
import { getSubjectChapterStats } from '../../utils/metrics';
import { AddEditChapterModal } from '../modals/AddEditChapterModal';
import { ChapterNotesModal } from '../modals/ChapterNotesModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import {
  ArrowLeft,
  Search,
  Plus,
  AlertTriangle,
  FileText,
  Edit2,
  Trash2,
  BookOpen,
} from 'lucide-react';

interface SubjectDetailViewProps {
  subjectId: string;
}

type ChapterFilterTab = 'all' | 'weak' | 'nil_mastery';

export const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({ subjectId }) => {
  const {
    subjects,
    chapters,
    returnToStudyLog,
    addChapter,
    updateChapter,
    deleteChapter,
    updateChapterMastery,
    incrementChapterRevision,
    decrementChapterRevision,
    toggleChapterWeak,
    updateChapterNotes,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ChapterFilterTab>('all');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [notesModalChapter, setNotesModalChapter] = useState<Chapter | null>(null);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [imgError, setImgError] = useState(false);

  const subject = subjects.find(s => s.id === subjectId);

  React.useEffect(() => {
    setImgError(false);
  }, [subject?.imageUrl]);

  // Subject statistics
  const stats = useMemo(() => {
    return getSubjectChapterStats(chapters, subjectId);
  }, [chapters, subjectId]);

  // Subject's chapters
  const subjectChapters = useMemo(() => {
    return chapters.filter(c => c.subjectId === subjectId);
  }, [chapters, subjectId]);

  // Filtered & searched chapters
  const displayedChapters = useMemo(() => {
    return subjectChapters.filter(ch => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = ch.name.toLowerCase().includes(query);
        const matchesNotes = ch.notes.toLowerCase().includes(query);
        if (!matchesName && !matchesNotes) return false;
      }

      // Tab filter
      if (activeTab === 'weak') return ch.isWeak;
      if (activeTab === 'nil_mastery') return ch.mastery === 'nil';

      return true;
    });
  }, [subjectChapters, searchQuery, activeTab]);

  if (!subject) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-[#F3F3F7]">Subject Not Found</h2>
        <p className="text-sm text-[#8E8EA0] mt-1 mb-6">
          The requested subject does not exist or may have been deleted.
        </p>
        <button
          onClick={returnToStudyLog}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Study Log</span>
        </button>
      </div>
    );
  }

  const handleOpenAddChapter = () => {
    setEditingChapter(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditChapter = (ch: Chapter) => {
    setEditingChapter(ch);
    setIsAddEditModalOpen(true);
  };

  const handleSaveChapter = (chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'> | Chapter) => {
    if ('id' in chapterData) {
      updateChapter(chapterData as Chapter);
    } else {
      addChapter(chapterData);
    }
  };

  const masteryConfig: Record<ChapterMastery, { label: string; textClass: string; bgClass: string }> = {
    nil: { label: 'Nil (0%)', textClass: 'text-slate-400', bgClass: 'bg-[#1B1B26] border-[#292936]' },
    mains: { label: 'Mains (33%)', textClass: 'text-[#9B7BFF]', bgClass: 'bg-[#9B7BFF]/10 border-[#9B7BFF]/30' },
    advanced: { label: 'Advanced (67%)', textClass: 'text-[#43D9A3]', bgClass: 'bg-[#43D9A3]/10 border-[#43D9A3]/30' },
    extreme: { label: 'Extreme (100%)', textClass: 'text-amber-300 font-bold', bgClass: 'bg-amber-400/10 border-amber-400/30' },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Return */}
      <div className="flex items-center justify-between pb-3 border-b border-[#292936]">
        <div className="flex items-center gap-3">
          <button
            onClick={returnToStudyLog}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#14141D] border border-[#292936] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Study Log</span>
          </button>
          <div className="text-xs text-[#8E8EA0] hidden sm:flex items-center gap-2">
            <span>Study Log</span>
            <span aria-hidden="true">/</span>
            <span>Subject Library</span>
            <span aria-hidden="true">/</span>
            <span className="text-[#F3F3F7] font-semibold">{subject.name}</span>
          </div>
        </div>

        <button
          onClick={handleOpenAddChapter}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Chapter</span>
        </button>
      </div>

      {/* Subject Header Banner */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row">
          {/* Cover Image */}
          <div className="relative w-full md:w-64 h-36 md:h-auto bg-[#1B1B26] shrink-0 border-b md:border-b-0 md:border-r border-[#292936]">
            {subject.imageUrl && !imgError ? (
              <img
                src={subject.imageUrl}
                alt={subject.name}
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1E1635] via-[#14141D] to-[#0d221c] flex items-center justify-center p-6">
                <BookOpen className="w-10 h-10 text-[#9B7BFF]/60" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#14141D] via-transparent to-transparent opacity-80" />
          </div>

          {/* Details & Mastery Stat */}
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F3F3F7]">
                {subject.name}
              </h1>
            </div>

            {/* Overall Mastery Progress Row */}
            <div className="pt-4 mt-4 border-t border-[#292936] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#8E8EA0]">Syllabus Mastery Index</span>
                  <span className="font-mono tabular-nums font-semibold text-[#9B7BFF]">
                    {stats.masteryProgress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#0B0B10] rounded-full overflow-hidden border border-[#292936]">
                  <div
                    className="h-full bg-gradient-to-r from-[#9B7BFF] to-[#43D9A3] rounded-full transition-all duration-300"
                    style={{ width: `${stats.masteryProgress}%` }}
                  />
                </div>
              </div>

              {/* Stat counts */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#8E8EA0] block text-[10px] uppercase">Chapters</span>
                  <span className="text-base font-bold text-[#F3F3F7]">{stats.total}</span>
                </div>
                <div className="h-6 w-px bg-[#292936]" />
                <div>
                  <span className="text-amber-400 block text-[10px] uppercase">Weak</span>
                  <span className="text-base font-bold text-amber-400">{stats.weak}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Quick Filter Tabs */}
        <div className="flex items-center bg-[#14141D] border border-[#292936] p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#9B7BFF] text-white shadow-xs font-semibold'
                : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
            }`}
          >
            All Chapters ({subjectChapters.length})
          </button>
          <button
            onClick={() => setActiveTab('weak')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'weak'
                ? 'bg-amber-500 text-black shadow-xs font-semibold'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            Weak Chapters ({stats.weak})
          </button>
          <button
            onClick={() => setActiveTab('nil_mastery')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'nil_mastery'
                ? 'bg-slate-700 text-white shadow-xs font-semibold'
                : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
            }`}
          >
            Nil Mastery
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[#8E8EA0] absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search chapters or notes..."
            className="w-full pl-9 pr-3.5 py-2 bg-[#14141D] border border-[#292936] rounded-xl text-xs text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
          />
        </div>
      </div>

      {/* Chapters Table */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl overflow-hidden">
        {displayedChapters.length === 0 ? (
          <div className="py-14 text-center flex flex-col items-center justify-center p-6">
            <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-2.5">
              <BookOpen className="w-5 h-5 text-[#9B7BFF]" />
            </div>
            <h3 className="text-sm font-semibold text-[#F3F3F7]">No chapters found</h3>
            <p className="text-xs text-[#8E8EA0] max-w-xs mt-1 mb-4">
              {searchQuery || activeTab !== 'all'
                ? 'No chapters match your search or filter criteria.'
                : 'Add chapters to break down your syllabus and track revision cycles.'}
            </p>
            {activeTab === 'all' && !searchQuery ? (
              <button
                onClick={handleOpenAddChapter}
                className="px-3 py-1.5 text-xs text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
              >
                + Add First Chapter
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                className="px-3 py-1.5 text-xs text-[#9B7BFF] hover:bg-[#1B1B26] border border-[#292936] rounded-lg transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#292936] bg-[#121219] text-[#8E8EA0] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-3.5 w-12 text-center">#</th>
                  <th className="py-3 px-4">Chapter Name</th>
                  <th className="py-3 px-3.5">Mastery State</th>
                  <th className="py-3 px-3.5 text-center">Revisions</th>
                  <th className="py-3 px-3.5 text-center">Weak</th>
                  <th className="py-3 px-3.5 text-center">Notes</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292936]/60">
                {displayedChapters.map((chapter, index) => {
                  const serialNumber = index + 1;
                  const currentMastery = masteryConfig[chapter.mastery] || masteryConfig.nil;

                  return (
                    <tr
                      key={chapter.id}
                      className="hover:bg-[#1B1B26]/40 transition-colors group"
                    >
                      {/* 1. Derived Serial Number */}
                      <td className="py-3 px-3.5 text-center font-mono text-[#8E8EA0]">
                        {serialNumber}
                      </td>

                      {/* 2. Chapter Name */}
                      <td className="py-3 px-4 font-medium text-[#F3F3F7]">
                        <span>{chapter.name}</span>
                      </td>

                      {/* 3. Mastery State Dropdown / Selector */}
                      <td className="py-3 px-3.5">
                        <select
                          value={chapter.mastery}
                          onChange={e => updateChapterMastery(chapter.id, e.target.value as ChapterMastery)}
                          className={`text-xs font-mono font-medium py-1 px-2.5 rounded-lg border focus:outline-hidden transition-colors cursor-pointer ${currentMastery.bgClass} ${currentMastery.textClass}`}
                          title={`Current mastery: ${currentMastery.label}. Click to change.`}
                        >
                          <option value="nil">Nil (0%)</option>
                          <option value="mains">Mains (33%)</option>
                          <option value="advanced">Advanced (67%)</option>
                          <option value="extreme">Extreme Mastery (100%)</option>
                        </select>
                      </td>

                      {/* 4. Revision Count Controls */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-[#0B0B10] border border-[#292936] rounded-lg p-0.5 font-mono">
                          <button
                            onClick={() => decrementChapterRevision(chapter.id)}
                            disabled={chapter.revisionCount <= 0}
                            className="w-5 h-5 flex items-center justify-center text-[#8E8EA0] hover:text-[#F3F3F7] disabled:opacity-30 disabled:pointer-events-none rounded transition-colors cursor-pointer"
                            aria-label={`Decrease revision count for ${chapter.name}`}
                            title="Decrease revisions"
                          >
                            -
                          </button>
                          <span className="w-6 text-center tabular-nums font-semibold text-[#F3F3F7]">
                            {chapter.revisionCount}
                          </span>
                          <button
                            onClick={() => incrementChapterRevision(chapter.id)}
                            className="w-5 h-5 flex items-center justify-center text-[#8E8EA0] hover:text-[#9B7BFF] rounded transition-colors cursor-pointer"
                            aria-label={`Increase revision count for ${chapter.name}`}
                            title="Increase revisions"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* 5. Weak Flag Icon Only (Grey = normal, Coloured = weak) */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          onClick={() => toggleChapterWeak(chapter.id)}
                          className={`inline-flex items-center justify-center p-1.5 rounded-md border transition-colors cursor-pointer ${
                            chapter.isWeak
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                              : 'bg-[#0B0B10] border-[#292936] text-[#8E8EA0] hover:text-[#F3F3F7]'
                          }`}
                          title={chapter.isWeak ? 'Weak chapter (click to mark normal)' : 'Normal (click to mark as weak chapter)'}
                          aria-label={chapter.isWeak ? `Clear weak flag for ${chapter.name}` : `Mark ${chapter.name} as weak`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* 6. Notes Icon Only */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          onClick={() => setNotesModalChapter(chapter)}
                          className={`inline-flex items-center justify-center p-1.5 rounded-md border transition-colors cursor-pointer ${
                            chapter.notes
                              ? 'bg-[#9B7BFF]/15 border-[#9B7BFF]/40 text-[#9B7BFF]'
                              : 'bg-[#0B0B10] border-[#292936] text-[#8E8EA0] hover:text-[#F3F3F7]'
                          }`}
                          title={chapter.notes ? 'View/edit chapter notes' : 'Add notes'}
                          aria-label={chapter.notes ? `View notes for ${chapter.name}` : `Add notes for ${chapter.name}`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* 7. Edit & Delete Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditChapter(chapter)}
                            className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-md transition-colors cursor-pointer"
                            title="Edit chapter"
                            aria-label={`Edit ${chapter.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setChapterToDelete(chapter)}
                            className="p-1.5 text-[#8E8EA0] hover:text-red-400 hover:bg-[#1B1B26] rounded-md transition-colors cursor-pointer"
                            title="Delete chapter"
                            aria-label={`Delete ${chapter.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Chapter Modal */}
      <AddEditChapterModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveChapter}
        subjectId={subjectId}
        initialChapter={editingChapter}
      />

      {/* Chapter Notes Modal */}
      <ChapterNotesModal
        isOpen={Boolean(notesModalChapter)}
        onClose={() => setNotesModalChapter(null)}
        chapter={notesModalChapter}
        onSaveNotes={(chapterId, notes) => {
          updateChapterNotes(chapterId, notes);
          if (notesModalChapter?.id === chapterId) {
            setNotesModalChapter(prev => prev ? { ...prev, notes } : null);
          }
        }}
      />

      {/* Delete Chapter Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(chapterToDelete)}
        onClose={() => setChapterToDelete(null)}
        onConfirm={() => {
          if (chapterToDelete) deleteChapter(chapterToDelete.id);
        }}
        title={`Delete "${chapterToDelete?.name}"?`}
        description="This will remove the chapter, its notes, and revision flags. Any historical study sessions that referenced this chapter will remain safe with their study hours and question logs intact."
        confirmLabel="Delete Chapter"
        isDestructive
      />
    </div>
  );
};
