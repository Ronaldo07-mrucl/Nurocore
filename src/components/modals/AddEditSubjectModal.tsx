import React, { useState, useEffect, useRef } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Subject } from '../../types';
import { useApp } from '../../context/AppContext';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface AddEditSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'> | Subject) => void;
  initialSubject?: Subject | null;
}

/**
 * Reads and resizes an uploaded image file to a lightweight Data URL
 * so it stores cleanly in localStorage without exceeding storage quotas.
 */
function processImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (PNG, JPG, WebP, GIF).'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Image file must be smaller than 10 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read the selected image file.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode the selected image.'));
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let { width, height } = img;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const AddEditSubjectModal: React.FC<AddEditSubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
}) => {
  const { subjects } = useApp();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialSubject) {
        setName(initialSubject.name);
        const existingImg = initialSubject.imageUrl || '';
        setImageUrl(existingImg);
        setUploadedFileName(existingImg ? 'Current thumbnail' : null);
      } else {
        setName('');
        setImageUrl('');
        setUploadedFileName(null);
      }
      setIsDragging(false);
      setIsProcessingImage(false);
      setError(null);
    }
  }, [isOpen, initialSubject]);

  const handleFileSelection = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setIsProcessingImage(true);
    try {
      const dataUrl = await processImageFileToDataUrl(file);
      setImageUrl(dataUrl);
      setUploadedFileName(file.name);
    } catch (err: any) {
      setError(err?.message || 'Unable to process image file.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelection(file);
  };

  const handleClearImage = () => {
    setImageUrl('');
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please provide a subject name.');
      return;
    }

    // Check for duplicate names (excluding current subject if editing)
    const duplicate = subjects.some(
      s => s.name.toLowerCase() === cleanName.toLowerCase() && s.id !== initialSubject?.id
    );
    if (duplicate) {
      setError(`A subject named "${cleanName}" already exists.`);
      return;
    }

    if (initialSubject) {
      onSave({
        ...initialSubject,
        name: cleanName,
        imageUrl: imageUrl.trim() || undefined,
      });
    } else {
      onSave({
        name: cleanName,
        imageUrl: imageUrl.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialSubject ? 'Edit Subject' : 'Add Subject to Library'}
      subtitle="Organize your curriculum and track domain mastery"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
            Subject Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Physics, Organic Chemistry, Calculus"
            className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            autoFocus
          />
        </div>

        {/* Upload Thumbnail Image */}
        <div className="space-y-2.5">
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider">
            Thumbnail Image (Optional)
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={e => handleFileSelection(e.target.files?.[0])}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`w-full px-4 py-4 rounded-lg border border-dashed transition-colors cursor-pointer flex items-center justify-center gap-3 text-center ${
              isDragging
                ? 'border-[#9B7BFF] bg-[#9B7BFF]/10'
                : 'border-[#292936] bg-[#0B0B10] hover:border-[#9B7BFF]/50 hover:bg-[#14141D]'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#9B7BFF] shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-[#F3F3F7]">
                {isProcessingImage
                  ? 'Optimizing image...'
                  : uploadedFileName
                    ? `Selected: ${uploadedFileName}`
                    : 'Click to upload an image or drag & drop'}
              </p>
              <p className="text-[11px] text-[#8E8EA0]">
                PNG, JPG, WebP, or GIF · Stored locally in your vault
              </p>
            </div>
          </div>

          {imageUrl && (
            <div className="relative h-24 w-full rounded-lg overflow-hidden border border-[#292936] bg-[#0B0B10]">
              <img
                src={imageUrl}
                alt="Subject thumbnail preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B10]/70 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5 text-[11px] text-[#F3F3F7]">
                <ImageIcon className="w-3 h-3 text-[#9B7BFF]" />
                <span>{uploadedFileName || 'Thumbnail preview'}</span>
              </div>
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-2 right-2 p-1 rounded-md bg-[#0B0B10]/85 border border-[#292936] text-[#8E8EA0] hover:text-red-400 transition-colors cursor-pointer"
                title="Remove thumbnail image"
                aria-label="Remove thumbnail image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292936]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] bg-transparent hover:bg-[#1B1B26] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessingImage}
            className="px-4 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] disabled:opacity-50 rounded-lg transition-colors focus:ring-2 focus:ring-[#9B7BFF]/40 cursor-pointer"
          >
            {initialSubject ? 'Save Changes' : 'Create Subject'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
