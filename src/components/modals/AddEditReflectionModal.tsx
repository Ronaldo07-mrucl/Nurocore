import React, { useState, useEffect } from 'react';
import { ReflectionEntry, Mood, EnergyLevel, ChecklistAnswer, DailyChecklist, DailyHighlights } from '../../types';
import { ModalWrapper } from './ModalWrapper';
import { getTodayString, formatShortDate } from '../../utils/dates';
import { getWordCount } from '../../utils/reflectionStats';
import {
  Smile,
  Meh,
  Frown,
  Zap,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Flame,
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  Sparkles,
  HelpCircle,
  Trash2,
} from 'lucide-react';

interface AddEditReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: ReflectionEntry | null;
  onSave: (entry: Omit<ReflectionEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (entry: ReflectionEntry) => void;
  onDelete?: (id: string) => void;
  initialDate?: string;
}

const COMMON_TAGS = [
  'DeepWork',
  'ExamStrategy',
  'Physics',
  'Chemistry',
  'Maths',
  'ErrorAnalysis',
  'Discipline',
  'Recovery',
  'Mindset',
  'Workout',
  'Breakthrough',
];

const MOODS: { id: Mood; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }[] = [
  { id: 'great', label: 'Great', icon: Sparkles, color: '#43D9A3', bg: 'bg-[#43D9A3]/10 border-[#43D9A3]/30 text-[#43D9A3]' },
  { id: 'good', label: 'Good', icon: Smile, color: '#9B7BFF', bg: 'bg-[#9B7BFF]/10 border-[#9B7BFF]/30 text-[#9B7BFF]' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: '#94A3B8', bg: 'bg-[#94A3B8]/10 border-[#94A3B8]/30 text-[#94A3B8]' },
  { id: 'difficult', label: 'Difficult', icon: AlertTriangle, color: '#FBBF24', bg: 'bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FBBF24]' },
  { id: 'low', label: 'Low', icon: Frown, color: '#F43F5E', bg: 'bg-[#F43F5E]/10 border-[#F43F5E]/30 text-[#F43F5E]' },
];

const ENERGIES: { id: EnergyLevel; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: 'very_low', label: 'Very Low', icon: BatteryLow, color: '#F43F5E' },
  { id: 'low', label: 'Low', icon: BatteryLow, color: '#FBBF24' },
  { id: 'moderate', label: 'Moderate', icon: BatteryMedium, color: '#94A3B8' },
  { id: 'high', label: 'High', icon: Battery, color: '#9B7BFF' },
  { id: 'very_high', label: 'Very High', icon: BatteryCharging, color: '#43D9A3' },
];

export const AddEditReflectionModal: React.FC<AddEditReflectionModalProps> = ({
  isOpen,
  onClose,
  entryToEdit,
  onSave,
  onUpdate,
  onDelete,
  initialDate,
}) => {
  const [date, setDate] = useState<string>(initialDate || getTodayString());
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const [energy, setEnergy] = useState<EnergyLevel | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');

  // Structured highlights
  const [mainWin, setMainWin] = useState<string>('');
  const [biggestChallenge, setBiggestChallenge] = useState<string>('');
  const [lessonLearned, setLessonLearned] = useState<string>('');
  const [priorityTomorrow, setPriorityTomorrow] = useState<string>('');

  // Structured checklist
  const [checklist, setChecklist] = useState<DailyChecklist>({
    reviewedLearning: undefined,
    taskProgress: undefined,
    physicalWellbeing: undefined,
    reflectedOnMistake: undefined,
    identifiedNextStep: undefined,
  });

  const [activeTab, setActiveTab] = useState<'journal' | 'highlights' | 'checklist'>('journal');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (entryToEdit) {
      setDate(entryToEdit.date);
      setTitle(entryToEdit.title);
      setContent(entryToEdit.content);
      setMood(entryToEdit.mood);
      setEnergy(entryToEdit.energy);
      setTags(entryToEdit.tags || []);
      setMainWin(entryToEdit.highlights?.mainWin || '');
      setBiggestChallenge(entryToEdit.highlights?.biggestChallenge || '');
      setLessonLearned(entryToEdit.highlights?.lessonLearned || '');
      setPriorityTomorrow(entryToEdit.highlights?.priorityTomorrow || '');
      setChecklist(entryToEdit.checklist || {});
    } else {
      setDate(initialDate || getTodayString());
      setTitle('');
      setContent('');
      setMood(undefined);
      setEnergy(undefined);
      setTags([]);
      setMainWin('');
      setBiggestChallenge('');
      setLessonLearned('');
      setPriorityTomorrow('');
      setChecklist({
        reviewedLearning: undefined,
        taskProgress: undefined,
        physicalWellbeing: undefined,
        reflectedOnMistake: undefined,
        identifiedNextStep: undefined,
      });
    }
    setActiveTab('journal');
    setErrorMsg('');
  }, [entryToEdit, initialDate, isOpen]);

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleChecklistChange = (key: keyof DailyChecklist, value: ChecklistAnswer) => {
    setChecklist(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a title or summary for this reflection.');
      setActiveTab('journal');
      return;
    }
    if (!content.trim() && !mainWin.trim()) {
      setErrorMsg('Please write your reflection thoughts or log at least one daily win.');
      setActiveTab('journal');
      return;
    }

    const highlights: DailyHighlights = {
      ...(mainWin.trim() ? { mainWin: mainWin.trim() } : {}),
      ...(biggestChallenge.trim() ? { biggestChallenge: biggestChallenge.trim() } : {}),
      ...(lessonLearned.trim() ? { lessonLearned: lessonLearned.trim() } : {}),
      ...(priorityTomorrow.trim() ? { priorityTomorrow: priorityTomorrow.trim() } : {}),
    };

    const hasHighlights = Object.keys(highlights).length > 0;
    const hasChecklist = Object.values(checklist).some(v => v !== undefined);

    if (entryToEdit && onUpdate) {
      onUpdate({
        ...entryToEdit,
        date,
        title: title.trim(),
        content: content.trim(),
        mood,
        energy,
        tags,
        highlights: hasHighlights ? highlights : undefined,
        checklist: hasChecklist ? checklist : undefined,
      });
    } else {
      onSave({
        date,
        title: title.trim(),
        content: content.trim(),
        mood,
        energy,
        tags,
        highlights: hasHighlights ? highlights : undefined,
        checklist: hasChecklist ? checklist : undefined,
      });
    }

    onClose();
  };

  const wordCount = getWordCount(content);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={entryToEdit ? 'Edit Reflection Entry' : 'New Reflection Entry'}
      subtitle={entryToEdit ? `Updating reflection for ${formatShortDate(entryToEdit.date)}` : `Capture daily learnings, mindset, and calibration`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-[#292936] bg-[#121219] gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('journal')}
            className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'journal'
                ? 'border-[#9B7BFF] text-[#F3F3F7]'
                : 'border-transparent text-[#8E8EA0] hover:text-[#C5C5D2]'
            }`}
          >
            Journal & Thoughts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('highlights')}
            className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'highlights'
                ? 'border-[#9B7BFF] text-[#F3F3F7]'
                : 'border-transparent text-[#8E8EA0] hover:text-[#C5C5D2]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9B7BFF]" />
            Daily Highlights
            {(mainWin || biggestChallenge || lessonLearned || priorityTomorrow) && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#43D9A3]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'border-[#9B7BFF] text-[#F3F3F7]'
                : 'border-transparent text-[#8E8EA0] hover:text-[#C5C5D2]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#43D9A3]" />
            Execution Checklist
            {Object.values(checklist).some(Boolean) && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#43D9A3]" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
          {errorMsg && (
            <div className="p-3 bg-[#F43F5E]/10 border border-[#F43F5E]/30 rounded-lg text-xs text-[#F43F5E] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'journal' && (
            <>
              {/* Date & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="w-full bg-[#181824] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
                    Entry Title / Focus Theme *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High-Momentum Study Flow & Mechanics Precision"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="w-full bg-[#181824] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#9B7BFF]"
                  />
                </div>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
                  How was your overall state today?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {MOODS.map(m => {
                    const Icon = m.icon;
                    const isSelected = mood === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMood(isSelected ? undefined : m.id)}
                        className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-lg border text-xs font-medium transition-all ${
                          isSelected
                            ? m.bg
                            : 'bg-[#181824] border-[#292936] text-[#8E8EA0] hover:border-[#3E3E52] hover:text-[#C5C5D2]'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Energy Level Selector */}
              <div>
                <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
                  Energy Level
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ENERGIES.map(e => {
                    const Icon = e.icon;
                    const isSelected = energy === e.id;
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setEnergy(isSelected ? undefined : e.id)}
                        className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-lg border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#9B7BFF]/15 border-[#9B7BFF] text-[#9B7BFF]'
                            : 'bg-[#181824] border-[#292936] text-[#8E8EA0] hover:border-[#3E3E52] hover:text-[#C5C5D2]'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-0.5" />
                        <span className="text-[11px] truncate w-full text-center">{e.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Journal Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-[#8E8EA0] uppercase tracking-wider">
                    Reflection Notes & Observations
                  </label>
                  <span className="text-[11px] text-[#8E8EA0]">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </span>
                </div>
                <textarea
                  rows={6}
                  placeholder="Reflect on today's sessions, challenges faced, decision making, concentration levels, and insights..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-[#181824] border border-[#292936] rounded-lg p-3 text-sm text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#9B7BFF] resize-y leading-relaxed font-sans"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
                  Tags & Categories
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8EA0]" />
                    <input
                      type="text"
                      placeholder="Add tag (e.g. DeepWork, Mechanics, ExamStrategy)"
                      value={newTagInput}
                      onChange={e => setNewTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(newTagInput);
                        }
                      }}
                      className="w-full bg-[#181824] border border-[#292936] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#9B7BFF]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTag(newTagInput)}
                    className="px-3 py-1.5 bg-[#292936] hover:bg-[#3E3E52] text-[#F3F3F7] rounded-lg text-xs font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map(t => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#9B7BFF]/15 text-[#9B7BFF] border border-[#9B7BFF]/30"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-white transition-colors ml-0.5 text-xs leading-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-[#8E8EA0] mr-1 self-center">Suggestions:</span>
                  {COMMON_TAGS.filter(t => !tags.includes(t)).slice(0, 6).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAddTag(t)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#181824] border border-[#292936] text-[#8E8EA0] hover:text-[#F3F3F7] hover:border-[#3E3E52] transition-colors"
                    >
                      +{t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'highlights' && (
            <div className="space-y-4">
              <p className="text-xs text-[#8E8EA0] leading-relaxed">
                Structured prompts to anchor your day: celebrate wins, diagnose friction points, capture key lessons, and prepare tomorrow's primary attack vector.
              </p>

              {/* Main Win */}
              <div className="p-3.5 bg-[#181824] border border-[#292936] rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#43D9A3]">
                  <Sparkles className="w-4 h-4" />
                  <span>Main Win Today</span>
                </div>
                <input
                  type="text"
                  placeholder="What was your proudest breakthrough or accomplishment today?"
                  value={mainWin}
                  onChange={e => setMainWin(e.target.value)}
                  className="w-full bg-[#14141D] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#43D9A3]"
                />
              </div>

              {/* Biggest Challenge */}
              <div className="p-3.5 bg-[#181824] border border-[#292936] rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#FBBF24]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Biggest Friction or Obstacle</span>
                </div>
                <input
                  type="text"
                  placeholder="Where did you encounter resistance, distraction, or unexpected fatigue?"
                  value={biggestChallenge}
                  onChange={e => setBiggestChallenge(e.target.value)}
                  className="w-full bg-[#14141D] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#FBBF24]"
                />
              </div>

              {/* Lesson Learned */}
              <div className="p-3.5 bg-[#181824] border border-[#292936] rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#9B7BFF]">
                  <Lightbulb className="w-4 h-4" />
                  <span>Key Insight / Lesson Learned</span>
                </div>
                <input
                  type="text"
                  placeholder="What principle or tactical rule will you apply moving forward?"
                  value={lessonLearned}
                  onChange={e => setLessonLearned(e.target.value)}
                  className="w-full bg-[#14141D] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#9B7BFF]"
                />
              </div>

              {/* Priority Tomorrow */}
              <div className="p-3.5 bg-[#181824] border border-[#292936] rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#38BDF8]">
                  <ArrowRight className="w-4 h-4" />
                  <span>Top Priority for Tomorrow</span>
                </div>
                <input
                  type="text"
                  placeholder="The single non-negotiable objective for tomorrow's first deep block"
                  value={priorityTomorrow}
                  onChange={e => setPriorityTomorrow(e.target.value)}
                  className="w-full bg-[#14141D] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#38BDF8]"
                />
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-3.5">
              <p className="text-xs text-[#8E8EA0] leading-relaxed">
                Daily calibration audit. Assess your execution with honest binary or partial clarity.
              </p>

              {[
                {
                  key: 'reviewedLearning' as keyof DailyChecklist,
                  label: 'Reviewed today\'s concepts & corrected misconceptions',
                  sub: 'Ensured active recall and clarified confusing steps before ending the day',
                },
                {
                  key: 'taskProgress' as keyof DailyChecklist,
                  label: 'Executed the prioritized plan and daily tasks',
                  sub: 'Stayed faithful to the scheduled schedule without avoidance or drift',
                },
                {
                  key: 'physicalWellbeing' as keyof DailyChecklist,
                  label: 'Prioritized physical health, recovery, and nutrition',
                  sub: 'Hydration, movement/workout, clean meals, and honoring sleep boundaries',
                },
                {
                  key: 'reflectedOnMistake' as keyof DailyChecklist,
                  label: 'Logged and inspected mistakes without emotional defensiveness',
                  sub: 'Treated errors as objective diagnostic clues rather than personal inadequacy',
                },
                {
                  key: 'identifiedNextStep' as keyof DailyChecklist,
                  label: 'Set clear starting point for tomorrow morning',
                  sub: 'Eliminated morning friction by knowing exactly what book/problem to open',
                },
              ].map(item => {
                const currentVal = checklist[item.key];
                return (
                  <div
                    key={item.key}
                    className="p-3.5 bg-[#181824] border border-[#292936] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-medium text-[#F3F3F7]">{item.label}</div>
                      <div className="text-[11px] text-[#8E8EA0]">{item.sub}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {(
                        [
                          { id: 'yes', label: 'Yes', activeCls: 'bg-[#43D9A3]/20 border-[#43D9A3] text-[#43D9A3]' },
                          { id: 'partly', label: 'Partly', activeCls: 'bg-[#FBBF24]/20 border-[#FBBF24] text-[#FBBF24]' },
                          { id: 'not_yet', label: 'No', activeCls: 'bg-[#F43F5E]/20 border-[#F43F5E] text-[#F43F5E]' },
                          { id: 'skipped', label: 'N/A', activeCls: 'bg-[#94A3B8]/20 border-[#94A3B8] text-[#94A3B8]' },
                        ] as const
                      ).map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleChecklistChange(item.key, opt.id)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                            currentVal === opt.id
                              ? opt.activeCls
                              : 'bg-[#14141D] border-[#292936] text-[#8E8EA0] hover:text-[#C5C5D2]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#292936] bg-[#121219]">
          <div>
            {entryToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(entryToEdit.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-[#9B7BFF] hover:bg-[#8A67FF] text-white rounded-lg shadow-sm shadow-[#9B7BFF]/30 transition-colors"
            >
              {entryToEdit ? 'Save Changes' : 'Save Reflection'}
            </button>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};
