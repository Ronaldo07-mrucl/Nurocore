import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  RotateCcw,
  Search,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { formatShortDate } from '../../utils/dates';

export const CompletedTasksArchive: React.FC = () => {
  const { tasks, toggleTaskComplete } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const completedTasks = tasks.filter(t => t.completed);

  const filtered = completedTasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl overflow-hidden transition-all shadow-sm">
      {/* Header bar that toggles visibility */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1B1B26]/50 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#43D9A3]/10 text-[#43D9A3] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-[#F3F3F7]">
              Completed Tasks Log
            </span>
            <span className="text-xs text-[#8E8EA0] ml-2 font-mono">
              ({completedTasks.length} total completed)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8E8EA0]">
          <span>{isOpen ? 'Hide Archive' : 'Show Archive'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-4 pt-0 border-t border-[#292936] space-y-3">
          {/* Search filter if there are several tasks */}
          {completedTasks.length > 3 && (
            <div className="relative pt-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-5 text-[#8E8EA0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search completed tasks or category..."
                className="w-full bg-[#1B1B26] border border-[#292936] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F3F3F7] placeholder-[#8E8EA0] focus:outline-none focus:border-[#9B7BFF] transition-colors"
              />
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="text-xs text-[#8E8EA0] py-4 text-center">
              {completedTasks.length === 0
                ? 'No tasks completed yet. Check off items in your weekly scheduler!'
                : 'No completed tasks match your search query.'}
            </p>
          ) : (
            <div className="divide-y divide-[#292936] max-h-64 overflow-y-auto">
              {filtered.map(task => (
                <div
                  key={task.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CheckCircle2 className="w-4 h-4 text-[#43D9A3] shrink-0" />
                    <span className="text-[#8E8EA0] line-through truncate font-medium">
                      {task.title}
                    </span>
                    {task.category && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1B1B26] text-[#8E8EA0] border border-[#292936] shrink-0">
                        {task.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-[#8E8EA0] font-mono">
                      {formatShortDate(task.dueDate)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(task.id)}
                      className="px-2 py-1 text-[11px] font-medium text-[#8E8EA0] hover:text-[#9B7BFF] hover:bg-[#1B1B26] rounded transition-colors flex items-center gap-1"
                      title="Reopen task (move back to active)"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reopen</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
