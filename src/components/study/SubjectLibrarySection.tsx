import React, { useState, useEffect } from 'react';
import { Chapter, Subject } from '../../types';
import { useApp } from '../../context/AppContext';
import { AddEditSubjectModal } from '../modals/AddEditSubjectModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import {
  Layers,
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
} from 'lucide-react';

export const SubjectLibrarySection: React.FC = () => {
  const { subjects, chapters, addSubject, updateSubject, deleteSubject, navigateToSubject } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setModalOpen(true);
  };

  const handleSave = (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'> | Subject) => {
    if ('id' in subjectData) {
      updateSubject(subjectData as Subject);
    } else {
      addSubject(subjectData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#F3F3F7]">Subject Library</h2>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Subject</span>
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-[#14141D] border border-dashed border-[#292936] rounded-xl p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-3">
            <Layers className="w-6 h-6 text-[#9B7BFF]" />
          </div>
          <h3 className="text-sm font-semibold text-[#F3F3F7]">No subjects in library</h3>
          <p className="text-xs text-[#8E8EA0] max-w-sm mt-1 mb-4">
            Create academic domains such as Physics, Organic Chemistry, or Advanced Mathematics to track chapters and mastery.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
          >
            + Create First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => {
            const weakChapters = chapters.filter(c => c.subjectId === subject.id && c.isWeak);

            return (
              <SubjectCard
                key={subject.id}
                subject={subject}
                weakChapters={weakChapters}
                onOpen={() => navigateToSubject(subject.id)}
                onEdit={() => handleOpenEdit(subject)}
                onDelete={() => setSubjectToDelete(subject)}
              />
            );
          })}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      <AddEditSubjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialSubject={editingSubject}
      />

      {/* Delete Subject Safeguard Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(subjectToDelete)}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={() => {
          if (subjectToDelete) deleteSubject(subjectToDelete.id);
        }}
        title={`Delete "${subjectToDelete?.name}"?`}
        description={`This will remove the subject and its chapter catalog from your active library. All past study sessions recorded under this subject will be preserved in your historical logs and charts.`}
        confirmLabel="Confirm Delete"
        isDestructive
      />
    </div>
  );
};

interface SubjectCardProps {
  subject: Subject;
  weakChapters: Chapter[];
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  weakChapters,
  onOpen,
  onEdit,
  onDelete,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [subject.imageUrl]);

  return (
    <div className="bg-[#14141D] border border-[#292936] hover:border-[#3B3B4E] rounded-xl overflow-hidden flex flex-col group transition-all">
      {/* Thumbnail & Heading */}
      <div
        onClick={onOpen}
        className="relative h-32 w-full bg-[#1B1B26] overflow-hidden border-b border-[#292936] cursor-pointer"
      >
        {subject.imageUrl && !imgError ? (
          <img
            src={subject.imageUrl}
            alt={subject.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1b152d] via-[#14141D] to-[#0d221c] flex items-center justify-center p-4">
            <Layers className="w-8 h-8 text-[#9B7BFF]/50" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#14141D] via-[#14141D]/40 to-transparent" />

        {/* Quick Actions */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <button
            onClick={e => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 bg-[#0B0B10]/80 backdrop-blur-xs text-[#8E8EA0] hover:text-[#F3F3F7] rounded-md border border-[#292936] transition-colors cursor-pointer"
            title="Edit subject"
            aria-label={`Edit ${subject.name}`}
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 bg-[#0B0B10]/80 backdrop-blur-xs text-[#8E8EA0] hover:text-red-400 rounded-md border border-[#292936] transition-colors cursor-pointer"
            title="Delete subject"
            aria-label={`Delete ${subject.name}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        <div className="absolute bottom-2.5 left-3.5 right-3.5">
          <h3 className="text-base font-bold text-[#F3F3F7] tracking-tight">{subject.name}</h3>
        </div>
      </div>

      {/* Weak Chapter Names */}
      <div
        onClick={onOpen}
        className="p-4 flex-1 cursor-pointer"
      >
        {weakChapters.length > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Weak Chapters</span>
            </div>
            <ul className="space-y-1">
              {weakChapters.map(ch => (
                <li key={ch.id} className="text-xs text-[#F3F3F7] flex items-center gap-2 truncate">
                  <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                  <span className="truncate">{ch.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-[#8E8EA0]">No weak chapters</p>
        )}
      </div>
    </div>
  );
};
