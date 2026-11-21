import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Habit, HabitScheduleType } from '../../types';
import { getTodayString } from '../../utils/dates';
import {
  BookOpen,
  Target,
  Sparkles,
  Brain,
  Droplets,
  Dumbbell,
  CheckSquare,
  Zap,
  Clock,
  Shield,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface AddEditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'> | Habit) => void;
  initialHabit?: Habit | null;
}

const AVAILABLE_ICONS = [
  { name: 'CheckSquare', icon: CheckSquare, label: 'Check' },
  { name: 'BookOpen', icon: BookOpen, label: 'Study' },
  { name: 'Target', icon: Target, label: 'Focus' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'Fitness' },
  { name: 'Brain', icon: Brain, label: 'Mind' },
  { name: 'Droplets', icon: Droplets, label: 'Health' },
  { name: 'Sparkles', icon: Sparkles, label: 'Discipline' },
  { name: 'Zap', icon: Zap, label: 'Energy' },
  { name: 'Clock', icon: Clock, label: 'Time' },
  { name: 'Shield', icon: Shield, label: 'Protection' },
];

const AVAILABLE_COLORS = [
  { hex: '#9B7BFF', label: 'Purple' },
  { hex: '#43D9A3', label: 'Green' },
  { hex: '#06B6D4', label: 'Cyan' },
  { hex: '#F59E0B', label: 'Amber' },
  { hex: '#F43F5E', label: 'Rose' },
  { hex: '#8E8EA0', label: 'Muted' },
];

const DAYS_OF_WEEK = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

export const AddEditHabitModal: React.FC<AddEditHabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'study' | 'fitness' | 'mindset' | 'discipline' | 'health'>('discipline');
  const [icon, setIcon] = useState('CheckSquare');
  const [color, setColor] = useState('#9B7BFF');
  const [isNonNegotiable, setIsNonNegotiable] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [scheduleType, setScheduleType] = useState<HabitScheduleType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialHabit) {
        setName(initialHabit.name || initialHabit.title || '');
        setDescription(initialHabit.description || '');
        setCategory(
          (initialHabit.category as any) || 'discipline'
        );
        setIcon(initialHabit.icon || 'CheckSquare');
        setColor(initialHabit.color || '#9B7BFF');
        setIsNonNegotiable(initialHabit.isNonNegotiable ?? (initialHabit.isMustDo || false));
        setIsActive(initialHabit.isActive !== undefined ? initialHabit.isActive : true);

        if (initialHabit.schedule) {
          setScheduleType(initialHabit.schedule.type);
          setSelectedDays(initialHabit.schedule.daysOfWeek || [1, 2, 3, 4, 5, 6, 0]);
        } else if (initialHabit.scheduledDays) {
          setScheduleType(initialHabit.scheduledDays.length === 7 ? 'daily' : 'custom_days');
          setSelectedDays(initialHabit.scheduledDays);
        } else {
          setScheduleType('daily');
          setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
        }

        setStartDate(initialHabit.startDate || getTodayString());
        setEndDate(initialHabit.endDate || '');
      } else {
        setName('');
        setDescription('');
        setCategory('discipline');
        setIcon('CheckSquare');
        setColor('#9B7BFF');
        setIsNonNegotiable(false);
        setIsActive(true);
        setScheduleType('daily');
        setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
        setStartDate(getTodayString());
        setEndDate('');
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialHabit]);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) {
        setError('At least one day must be selected for the habit schedule.');
        return;
      }
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
    setError(null);
  };

  const handleScheduleTypeChange = (type: HabitScheduleType) => {
    setScheduleType(type);
    if (type === 'daily') {
      setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
    } else if (type === 'weekdays') {
      setSelectedDays([1, 2, 3, 4, 5]);
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      setError('Habit name is required.');
      return;
    }

    if (!startDate) {
      setError('Start date is required.');
      return;
    }

    if (endDate && endDate < startDate) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    let finalDays = selectedDays;
    if (scheduleType === 'daily') {
      finalDays = [1, 2, 3, 4, 5, 6, 0];
    } else if (scheduleType === 'weekdays') {
      finalDays = [1, 2, 3, 4, 5];
    } else if (finalDays.length === 0) {
      setError('Please select at least one day for custom schedule.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      title: name.trim(),
      description: description.trim(),
      category,
      icon,
      color,
      isActive,
      isNonNegotiable,
      isMustDo: isNonNegotiable,
      schedule: {
        type: scheduleType,
        daysOfWeek: finalDays,
      },
      scheduledDays: finalDays,
      startDate,
      endDate: endDate || undefined,
    };

    if (initialHabit) {
      onSave({
        ...initialHabit,
        ...payload,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onSave(payload);
    }

    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialHabit ? 'Edit Habit' : 'Create New Habit'}
      subtitle="Define daily routines, execution frequency, and non-negotiable standards"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-[#F3F3F7] mb-1">
            Habit Name <span className="text-[#9B7BFF]">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Deep Morning Study Block (2.5h)"
            className="w-full bg-[#0B0B10] border border-[#292936] rounded-lg px-3 py-2 text-xs text-[#F3F3F7] placeholder-[#8E8EA0]/50 focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] mb-1">
            Description or Standard (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Why this habit matters, rules of execution, or minimum threshold..."
            className="w-full bg-[#0B0B10] border border-[#292936] rounded-lg px-3 py-2 text-xs text-[#F3F3F7] placeholder-[#8E8EA0]/50 focus:outline-hidden focus:border-[#9B7BFF] transition-colors resize-none"
          />
        </div>

        {/* Category & Accent Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full bg-[#0B0B10] border border-[#292936] rounded-lg px-3 py-2 text-xs text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors cursor-pointer"
            >
              <option value="study">Study & Academics</option>
              <option value="discipline">Discipline & Focus</option>
              <option value="fitness">Fitness & Physical</option>
              <option value="mindset">Mindset & Reflection</option>
              <option value="health">Health & Recovery</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] mb-1">
              Accent Color
            </label>
            <div className="flex items-center gap-2 pt-1">
              {AVAILABLE_COLORS.map(c => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  title={c.label}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    color === c.hex ? 'ring-2 ring-offset-2 ring-offset-[#14141D] scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: c.hex,
                    // ringColor styling
                    boxShadow: color === c.hex ? `0 0 0 2px ${c.hex}` : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] mb-1.5">
            Visual Identifier Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ICONS.map(item => {
              const IconComp = item.icon;
              const isSelected = icon === item.name;
              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setIcon(item.name)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#9B7BFF]/20 border-[#9B7BFF] text-[#F3F3F7]'
                      : 'bg-[#0B0B10] border-[#292936] text-[#8E8EA0] hover:text-[#F3F3F7] hover:border-[#3B3B4E]'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" style={{ color: isSelected ? color : undefined }} />
                  <span className="text-[11px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule Frequency */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-medium text-[#F3F3F7]">
            Schedule Frequency
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleScheduleTypeChange('daily')}
              className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-center ${
                scheduleType === 'daily'
                  ? 'bg-[#9B7BFF]/15 border-[#9B7BFF] text-[#9B7BFF]'
                  : 'bg-[#0B0B10] border-[#292936] text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              Every Day
            </button>
            <button
              type="button"
              onClick={() => handleScheduleTypeChange('weekdays')}
              className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-center ${
                scheduleType === 'weekdays'
                  ? 'bg-[#9B7BFF]/15 border-[#9B7BFF] text-[#9B7BFF]'
                  : 'bg-[#0B0B10] border-[#292936] text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              Weekdays (Mon–Fri)
            </button>
            <button
              type="button"
              onClick={() => handleScheduleTypeChange('custom_days')}
              className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-center ${
                scheduleType === 'custom_days'
                  ? 'bg-[#9B7BFF]/15 border-[#9B7BFF] text-[#9B7BFF]'
                  : 'bg-[#0B0B10] border-[#292936] text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              Custom Days
            </button>
          </div>

          {/* Custom Day Checkboxes */}
          {scheduleType === 'custom_days' && (
            <div className="p-3 bg-[#0B0B10] border border-[#292936] rounded-lg mt-2">
              <span className="text-[11px] text-[#8E8EA0] block mb-2 font-mono">
                Select days of the week when this habit is due:
              </span>
              <div className="flex items-center justify-between gap-1">
                {DAYS_OF_WEEK.map(d => {
                  const isChecked = selectedDays.includes(d.day);
                  return (
                    <button
                      type="button"
                      key={d.day}
                      onClick={() => toggleDay(d.day)}
                      className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md border transition-all cursor-pointer text-center ${
                        isChecked
                          ? 'bg-[#9B7BFF] border-[#9B7BFF] text-white font-semibold'
                          : 'bg-[#14141D] border-[#292936] text-[#8E8EA0] hover:text-[#F3F3F7]'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] mb-1">
              Start Date <span className="text-[#9B7BFF]">*</span>
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-[#0B0B10] border border-[#292936] rounded-lg px-3 py-2 text-xs text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] mb-1">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-[#0B0B10] border border-[#292936] rounded-lg px-3 py-2 text-xs text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            />
          </div>
        </div>

        {/* Toggles: Non-Negotiable & Active Status */}
        <div className="pt-2 space-y-2 border-t border-[#292936]">
          {/* Non-Negotiable Toggle */}
          <label className="flex items-start gap-3 p-3 bg-[#0B0B10] border border-[#292936] rounded-lg cursor-pointer hover:border-[#3B3B4E] transition-colors">
            <input
              type="checkbox"
              checked={isNonNegotiable}
              onChange={e => setIsNonNegotiable(e.target.checked)}
              className="mt-0.5 rounded-sm border-[#292936] text-[#9B7BFF] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <div>
              <div className="text-xs font-medium text-[#F3F3F7] flex items-center gap-1.5">
                <span>Mark as Non-Negotiable</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded-sm border border-amber-400/20">
                  CORE
                </span>
              </div>
              <p className="text-[11px] text-[#8E8EA0] mt-0.5">
                Elevates to the top Non-Negotiables section for immediate daily accountability.
              </p>
            </div>
          </label>

          {/* Active Status (if editing) */}
          {initialHabit && (
            <label className="flex items-start gap-3 p-3 bg-[#0B0B10] border border-[#292936] rounded-lg cursor-pointer hover:border-[#3B3B4E] transition-colors">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="mt-0.5 rounded-sm border-[#292936] text-[#43D9A3] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <div>
                <div className="text-xs font-medium text-[#F3F3F7]">
                  Habit is Active
                </div>
                <p className="text-[11px] text-[#8E8EA0] mt-0.5">
                  When paused, historical records are preserved and future dates will not count as missed occurrences.
                </p>
              </div>
            </label>
          )}
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#292936]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] bg-[#0B0B10] hover:bg-[#1B1B26] border border-[#292936] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : initialHabit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
