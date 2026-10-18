import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { ClassRow } from '../../types';
import { dbService, DuplicateNameError } from '../../services/database';

interface ClassFormModalProps {
  existing?: ClassRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (cls: ClassRow) => void;
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  existing,
  isOpen,
  onClose,
  onSaved,
}) => {
  const isEditing = Boolean(existing);
  const [name, setName] = useState(existing?.name ?? '');
  const [level, setLevel] = useState(existing?.academicLevel ?? '');
  const [yearOfStudy, setYearOfStudy] = useState(existing?.yearOfStudy ?? 1);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter a class name.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (existing) {
        dbService.updateClass(existing.id, {
          name: cleanName,
          academicLevel: level.trim() || undefined,
          yearOfStudy: Number(yearOfStudy),
          description: description.trim() || undefined,
        });
        onSaved?.(dbService.getClassById(existing.id)!);
      } else {
        const created = dbService.createClass({
          name: cleanName,
          academicLevel: level.trim() || undefined,
          yearOfStudy: Number(yearOfStudy),
          description: description.trim() || undefined,
        });
        onSaved?.(created);
      }
      onClose();
    } catch (err) {
      setSaving(false);
      if (err instanceof DuplicateNameError) {
        setError(err.message);
      } else {
        setError('Could not save the class: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">
            {isEditing ? 'Edit class' : 'New class'}
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">
                Class name <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{name.length}/120</span>
            </div>
            <input
              type="text"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Diploma Year 1 — Pharmacy"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00696f] focus:border-transparent text-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Academic level
                </label>
              </div>
              <input
                type="text"
                maxLength={80}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="e.g. Diploma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00696f] focus:border-transparent text-sm transition-all"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Year of Study
                </label>
              </div>
              <input
                type="number"
                min={1}
                max={6}
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00696f] focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description (optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of cohort, objectives, or schedule..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00696f] focus:border-transparent text-sm transition-all resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-[#00696f] hover:bg-[#005358] rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
