import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BodyMeasurementEntry } from '../../types';
import { formatShortDate } from '../../utils/dates';
import { formatLength } from '../../utils/fitness';
import { AddEditMeasurementModal } from '../modals/AddEditMeasurementModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import { Ruler, Plus, Edit3, Trash2 } from 'lucide-react';

interface BodyMeasurementsSectionProps {
  onLogMeasurements: () => void;
}

export const BodyMeasurementsSection: React.FC<BodyMeasurementsSectionProps> = ({
  onLogMeasurements,
}) => {
  const { bodyMeasurements, updateBodyMeasurement, deleteBodyMeasurement } = useApp();
  const unit = 'in' as const;

  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurementEntry | null>(null);
  const [measurementToDelete, setMeasurementToDelete] = useState<BodyMeasurementEntry | null>(null);

  // Sorted newest first
  const sortedMeasurements = useMemo(() => {
    return [...bodyMeasurements].sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  }, [bodyMeasurements]);

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-[#292936] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F3F3F7]">Body Circumference Tracking</h3>
            <span className="text-[10px] font-mono text-[#8E8EA0] px-2 py-0.5 rounded-sm bg-[#0B0B10] border border-[#292936] tabular-nums">
              {bodyMeasurements.length} logs · in
            </span>
          </div>
          <p className="text-xs text-[#8E8EA0] mt-0.5">
            Waist, chest, hips, arm, and thigh measurements in inches
          </p>
        </div>

        <button
          onClick={onLogMeasurements}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Circumferences</span>
        </button>
      </div>

      {/* Table / Empty State */}
      <div className="flex-1 flex flex-col justify-between">
        {sortedMeasurements.length === 0 ? (
          <div className="h-full min-h-[240px] bg-[#0B0B10] border border-[#292936] rounded-xl text-center flex flex-col items-center justify-center p-6">
            <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-2.5">
              <Ruler className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-xs font-semibold text-[#F3F3F7]">No body circumference records logged</p>
            <p className="text-xs text-[#8E8EA0] max-w-sm mt-1">
              Track key body measurements in inches every 2–4 weeks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#292936]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0B10] text-[#8E8EA0] uppercase tracking-wider font-semibold border-b border-[#292936]">
                <tr>
                  <th className="py-2.5 px-2.5">Date</th>
                  <th className="py-2.5 px-2">Waist</th>
                  <th className="py-2.5 px-2">Chest</th>
                  <th className="py-2.5 px-2">Hips</th>
                  <th className="py-2.5 px-2">Arm</th>
                  <th className="py-2.5 px-2">Thigh</th>
                  <th className="py-2.5 px-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292936] bg-[#14141D]">
                {sortedMeasurements.map(m => (
                  <tr key={m.id} className="hover:bg-[#1B1B26]/50 transition-colors" title={m.notes || undefined}>
                    <td className="py-2.5 px-2.5 font-mono text-[#8E8EA0] whitespace-nowrap">
                      {formatShortDate(m.date)}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-medium text-[#F3F3F7] whitespace-nowrap">
                      {m.waistCm ? formatLength(m.waistCm, unit) : '—'}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-medium text-[#F3F3F7] whitespace-nowrap">
                      {m.chestCm ? formatLength(m.chestCm, unit) : '—'}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-medium text-[#F3F3F7] whitespace-nowrap">
                      {m.hipsCm ? formatLength(m.hipsCm, unit) : '—'}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-medium text-[#F3F3F7] whitespace-nowrap">
                      {m.armCm ? formatLength(m.armCm, unit) : '—'}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-medium text-[#F3F3F7] whitespace-nowrap">
                      {m.thighCm ? formatLength(m.thighCm, unit) : '—'}
                    </td>
                    <td className="py-2.5 px-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingMeasurement(m)}
                          className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] rounded transition-colors cursor-pointer"
                          title="Edit entry"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setMeasurementToDelete(m)}
                          className="p-1 text-[#8E8EA0] hover:text-rose-400 rounded transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Measurement Modal */}
      <AddEditMeasurementModal
        isOpen={Boolean(editingMeasurement)}
        onClose={() => setEditingMeasurement(null)}
        onSave={m => {
          updateBodyMeasurement(m as BodyMeasurementEntry);
          setEditingMeasurement(null);
        }}
        initialMeasurement={editingMeasurement}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(measurementToDelete)}
        onClose={() => setMeasurementToDelete(null)}
        onConfirm={() => {
          if (measurementToDelete) {
            deleteBodyMeasurement(measurementToDelete.id);
            setMeasurementToDelete(null);
          }
        }}
        title="Delete Measurement Record?"
        description={`Are you sure you want to delete the circumference measurements from ${measurementToDelete ? formatShortDate(measurementToDelete.date) : ''}?`}
        confirmLabel="Delete Record"
        isDestructive
      />
    </div>
  );
};
