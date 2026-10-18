import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { CourseUnitRow } from '../../types';
import { dbService } from '../../services/database';

interface CourseUnitFormModalProps {
  classId: string;
  existing?: CourseUnitRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (unit: CourseUnitRow) => void;
}

export const CourseUnitFormModal: React.FC<CourseUnitFormModalProps> = ({
  classId,
  existing,
  isOpen,
  onClose,
  onSaved,
}) => {
  const isEditing = Boolean(existing);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [code, setCode] = useState(existing?.code ?? '');
  const [hours, setHours] = useState(existing?.teachingHours?.toString() ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [curriculum, setCurriculum] = useState(existing?.curriculum ?? '');
  const [objectives, setObjectives] = useState(existing?.objectives ?? '');
  const [outline, setOutline] = useState(existing?.outline ?? '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Please enter a course title.');
      return;
    }

    let parsedHours: number | null = null;
    if (hours.trim()) {
      const parsed = parseInt(hours.trim(), 10);
      if (isNaN(parsed) || parsed < 0 || parsed > 1000) {
        setError('Teaching hours must be a whole number between 0 and 1000.');
        return;
      }
      parsedHours = parsed;
    }

    setSaving(true);
    setError(null);

    try {
      if (existing) {
        dbService.updateUnit(existing.id, {
          title: cleanTitle,
          code: code.trim() || undefined,
          teachingHours: parsedHours,
          description: description.trim() || undefined,
          curriculum: curriculum.trim() || undefined,
          objectives: objectives.trim() || undefined,
          outline: outline.trim() || undefined,
        });
        const updated = dbService.getCourseUnits().find((u) => u.id === existing.id);
        if (updated) onSaved?.(updated);
      } else {
        const created = dbService.createUnit({
          classId,
          title: cleanTitle,
          code: code.trim() || undefined,
          teachingHours: parsedHours,
          description: description.trim() || undefined,
          curriculum: curriculum.trim() || undefined,
          objectives: objectives.trim() || undefined,
          outline: outline.trim() || undefined,
        });
        onSaved?.(created);
      }
      onClose();
    } catch (err) {
      setSaving(false);
      setError('Could not save the course unit: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">
            {isEditing ? 'Edit course unit' : 'New course unit'}
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(85vh-8rem)] overflow-y-auto">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">
                Course title <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{title.length}/160</span>
            </div>
            <input
              type="text"
              required
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pharmacology I"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00696f] focus:border-transparent text-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Course code (optional)
              </label>
              <input
                type="text"
                maxLength={40}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. PHR 101"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00696f] focus:border-transparent text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Teaching hours (optional)
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 45"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00696f] focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description (optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of subject matter and scope..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00696f] focus:border-transparent text-sm transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Curriculum (optional)
            </label>
            <textarea
              rows={2}
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value)}
              placeholder="Which curriculum does this unit follow?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00696f] focus:border-transparent text-sm transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Learning objectives / outcomes (optional)
            </label>
            <textarea
              rows={3}
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Key skills and competencies students will acquire..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00696f] focus:border-transparent text-sm transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Course outline (optional)
            </label>
            <textarea
              rows={4}
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              placeholder="One line per outline item or weekly breakdown."
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
