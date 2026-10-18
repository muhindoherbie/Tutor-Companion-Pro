import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  School,
  BookOpen,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';
import {
  useActiveClasses,
  useAllUnits,
  useAllActiveStudents,
  useAllAssessments,
} from '../services/database';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const classes = useActiveClasses();
  const units = useAllUnits();
  const students = useAllActiveStudents();
  const assessments = useAllAssessments();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredClasses = q
    ? classes.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.academicLevel?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      )
    : classes.slice(0, 3);

  const filteredUnits = q
    ? units.filter(
        (u) =>
          u.title.toLowerCase().includes(q) ||
          u.code?.toLowerCase().includes(q) ||
          u.description?.toLowerCase().includes(q)
      )
    : units.slice(0, 4);

  const filteredStudents = q
    ? students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentIdNumber?.toLowerCase().includes(q)
      )
    : students.slice(0, 3);

  const filteredAssessments = q
    ? assessments.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.assessmentType.toLowerCase().includes(q)
      )
    : assessments.slice(0, 3);

  const handleSelect = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classes, course units, students, exams..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* Quick Actions */}
          {!q && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                Quick Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelect('/curriculum')}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 text-left font-medium text-slate-800 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#00696f]" />
                  <span>Ingest Curriculum</span>
                </button>
                <button
                  onClick={() => handleSelect('/notes')}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 text-left font-medium text-slate-800 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-teal-700" />
                  <span>Lecture Notes Studio</span>
                </button>
                <button
                  onClick={() => handleSelect('/assessments')}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 text-left font-medium text-slate-800 transition-colors"
                >
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>Build Examination</span>
                </button>
                <button
                  onClick={() => handleSelect('/students')}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 text-left font-medium text-slate-800 transition-colors"
                >
                  <Users className="w-4 h-4 text-indigo-700" />
                  <span>Student Gradebook</span>
                </button>
              </div>
            </div>
          )}

          {/* Course Units */}
          {filteredUnits.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                Course Units ({filteredUnits.length})
              </div>
              <div className="space-y-1">
                {filteredUnits.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelect(`/classes/${u.classId}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 text-xs font-bold">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-xs truncate">
                          {u.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {u.code} · {u.contactHours} Contact Hours
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Classes */}
          {filteredClasses.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                Academic Classes ({filteredClasses.length})
              </div>
              <div className="space-y-1">
                {filteredClasses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(`/classes/${c.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <School className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-xs truncate">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          Year {c.yearOfStudy} · {c.academicLevel}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Students */}
          {filteredStudents.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                Students ({filteredStudents.length})
              </div>
              <div className="space-y-1">
                {filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect('/students')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-xs truncate">
                          {s.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          ID: {s.studentIdNumber} · Year {s.yearOfStudy}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assessments */}
          {filteredAssessments.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                Assessments & Exams ({filteredAssessments.length})
              </div>
              <div className="space-y-1">
                {filteredAssessments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelect('/assessments')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-xs truncate">
                          {a.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {a.assessmentType.toUpperCase()} · {a.totalMarks} Marks
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {q &&
            filteredClasses.length === 0 &&
            filteredUnits.length === 0 &&
            filteredStudents.length === 0 &&
            filteredAssessments.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p>No results found for "{query}".</p>
                <p className="text-xs mt-1">Try searching by course code, student name, or topic.</p>
              </div>
            )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with click or arrow keys</span>
          <span>Tutor Companion Quick Jump</span>
        </div>
      </div>
    </div>
  );
};
