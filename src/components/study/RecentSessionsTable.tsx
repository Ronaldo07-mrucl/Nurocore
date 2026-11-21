import React, { useState, useMemo } from 'react';
import { StudySession, DateRangeFilter } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatShortDate, getTodayString } from '../../utils/dates';
import { formatDuration, filterSessionsByRange } from '../../utils/metrics';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import {
  BookOpen,
  Edit2,
  Trash2,
  Plus,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface RecentSessionsTableProps {
  filter: DateRangeFilter;
  onEditSession: (session: StudySession) => void;
  onAddSession: () => void;
}

export const RecentSessionsTable: React.FC<RecentSessionsTableProps> = ({
  filter,
  onEditSession,
  onAddSession,
}) => {
  const { studySessions, subjects, chapters, deleteStudySession } = useApp();
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const today = getTodayString();

  // Filter and sort sessions newest first
  const sessions = useMemo(() => {
    const list = filterSessionsByRange(studySessions, filter, today);
    return [...list].sort((a, b) => {
      // Primary: date desc; Secondary: createdAt desc
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  }, [studySessions, filter, today]);

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'practice':
        return { label: 'Practice', classes: 'text-[#43D9A3] border-[#43D9A3]/30 bg-[#43D9A3]/10' };
      case 'theory':
        return { label: 'Theory', classes: 'text-[#9B7BFF] border-[#9B7BFF]/30 bg-[#9B7BFF]/10' };
      case 'revision':
        return { label: 'Revision', classes: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
      case 'mock_analysis':
        return { label: 'Mock Analysis', classes: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
      default:
        return { label: type || 'General', classes: 'text-slate-300 border-slate-600 bg-slate-800' };
    }
  };

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#292936]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F3F3F7]">Recent Study Sessions</h3>
            {sessions.length > 0 && (
              <span className="text-xs font-mono text-[#8E8EA0] tabular-nums">
                ({sessions.length} {sessions.length === 1 ? 'entry' : 'entries'})
              </span>
            )}
          </div>
          <p className="text-xs text-[#8E8EA0] mt-0.5">
            Chronological audit of study blocks, question counts, and revisions
          </p>
        </div>

        <button
          onClick={onAddSession}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Session</span>
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-2.5">
            <BookOpen className="w-5 h-5 text-[#9B7BFF]" />
          </div>
          <p className="text-xs font-medium text-[#F3F3F7]">No study sessions in this period</p>
          <p className="text-xs text-[#8E8EA0] max-w-xs mt-1 mb-3">
            Click Log Session to record today's problem solving or theory practice.
          </p>
          <button
            onClick={onAddSession}
            className="px-3 py-1.5 text-xs text-[#9B7BFF] hover:text-white bg-[#9B7BFF]/15 hover:bg-[#9B7BFF] rounded-lg border border-[#9B7BFF]/30 transition-colors cursor-pointer"
          >
            + Log First Session
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#292936] text-[#8E8EA0] uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Subject & Chapter</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Questions</th>
                <th className="py-2.5 px-3">Activity</th>
                <th className="py-2.5 px-3">Notes</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292936]/60">
              {sessions.map(session => {
                const subject = subjects.find(s => s.id === session.subjectId);
                const chapter = chapters.find(c => c.id === session.chapterId);
                const subjectName = subject?.name || session.subject || 'General';
                const chapterName = chapter?.name || session.topic;
                const activityBadge = getActivityBadge(session.activityType);
                const questionsAttempted = session.questionsAttempted ?? session.questionsSolved ?? 0;

                return (
                  <tr
                    key={session.id}
                    className="hover:bg-[#1B1B26]/50 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums text-[#8E8EA0]">
                      {formatShortDate(session.date)}
                    </td>

                    {/* Subject & Chapter */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#F3F3F7]">{subjectName}</div>
                      {chapterName ? (
                        <div className="text-[11px] text-[#8E8EA0] truncate max-w-[220px]">
                          {chapterName}
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#8E8EA0] italic">General practice</div>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono font-medium text-[#F3F3F7]">
                      {formatDuration(session.durationMinutes)}
                    </td>

                    {/* Questions */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono">
                      <span className="font-semibold text-[#F3F3F7]">{questionsAttempted}</span>
                      {session.questionsCorrect !== undefined && session.questionsCorrect !== null && (
                        <span className="text-[11px] text-[#43D9A3] ml-1">
                          ({session.questionsCorrect} corr)
                        </span>
                      )}
                    </td>

                    {/* Activity Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-sm border ${activityBadge.classes}`}
                      >
                        {activityBadge.label}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-3 max-w-[200px] truncate text-[#8E8EA0]">
                      {session.notes ? (
                        <span title={session.notes} className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-[#9B7BFF] shrink-0" />
                          <span className="truncate">{session.notes}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditSession(session)}
                          className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-md transition-colors cursor-pointer"
                          title="Edit session"
                          aria-label={`Edit session for ${subjectName}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSessionToDelete(session.id)}
                          className="p-1.5 text-[#8E8EA0] hover:text-red-400 hover:bg-[#1B1B26] rounded-md transition-colors cursor-pointer"
                          title="Delete session"
                          aria-label={`Delete session for ${subjectName}`}
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

      {/* Delete Session Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        onConfirm={() => {
          if (sessionToDelete) deleteStudySession(sessionToDelete);
        }}
        title="Delete Study Session?"
        description="Are you sure you want to remove this study session? This will immediately deduct its study duration and question counts from your dashboard and charts."
        confirmLabel="Delete Session"
        isDestructive
      />
    </div>
  );
};
