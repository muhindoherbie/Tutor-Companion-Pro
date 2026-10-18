import React, { useState } from 'react';
import { Search, Plus, School, MoreVertical, Trash2 } from 'lucide-react';
import { useActiveClasses, dbService } from '../../services/database';
import { ClassFormModal } from './ClassFormModal';
import { ClassRow } from '../../types';

interface ClassesScreenProps {
  onSelectClass: (classId: string) => void;
}

export const ClassesScreen: React.FC<ClassesScreenProps> = ({ onSelectClass }) => {
  const classes = useActiveClasses();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassRow | null>(null);

  const cleanQuery = searchQuery.trim().toLowerCase();
  const filtered = cleanQuery
    ? classes.filter(
        (c) =>
          c.name.toLowerCase().includes(cleanQuery) ||
          (c.academicLevel && c.academicLevel.toLowerCase().includes(cleanQuery)) ||
          (c.description && c.description.toLowerCase().includes(cleanQuery))
      )
    : classes;

  const handleDelete = () => {
    if (!classToDelete) return;
    dbService.deleteClass(classToDelete.id);
    setClassToDelete(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      {/* Top Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classes"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#00696f] focus:border-transparent text-sm transition-all"
          />
        </div>

        <button
          onClick={() => setIsNewClassModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl text-sm font-medium shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New class</span>
        </button>
      </div>

      {/* Classes List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200/90 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <School className="w-6 h-6" />
          </div>
          <p className="text-slate-600 text-sm font-medium">
            {classes.length === 0
              ? 'No classes yet. Tap "New class" to create one.'
              : 'No classes match your search.'}
          </p>
          {classes.length === 0 && (
            <button
              onClick={() => setIsNewClassModalOpen(true)}
              className="mt-4 px-4 py-2 border border-[#00696f] text-[#00696f] hover:bg-[#00696f]/5 rounded-xl text-sm font-medium transition-colors"
            >
              Create first class
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectClass(c.id)}
              className="group bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-xs"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#00696f]/10 text-[#00696f] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <School className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate text-base">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    <span>{c.academicLevel || 'Diploma'}</span>
                    <span aria-hidden="true"> · </span>
                    <span>Year {c.yearOfStudy || 1}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono tabular-nums">{c.academicYear || '2025/2026'}</span>
                  </p>
                </div>
              </div>

              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpenId === c.id && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setMenuOpenId(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                      <button
                        onClick={() => {
                          setMenuOpenId(null);
                          setClassToDelete(c);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Class Modal */}
      <ClassFormModal
        isOpen={isNewClassModalOpen}
        onClose={() => setIsNewClassModalOpen(false)}
        onSaved={(created) => onSelectClass(created.id)}
      />

      {/* Delete Confirmation Modal */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Delete class?</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              &quot;{classToDelete.name}&quot; and all of its course units will be removed from your
              active workspace. You will not be able to undo this from the app in this phase.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setClassToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
