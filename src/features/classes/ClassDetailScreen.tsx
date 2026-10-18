import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  X,
  BookOpen,
  Users,
  Award,
} from 'lucide-react';
import {
  useClassById,
  useUnitsForClass,
  useTopicsForUnit,
  dbService,
} from '../../services/database';
import { ClassFormModal } from './ClassFormModal';
import { CourseUnitFormModal } from './CourseUnitFormModal';
import { CourseUnitRow } from '../../types';

interface ClassDetailScreenProps {
  classId: string;
  onNavigateBack: () => void;
  onNavigateToNotes?: (unitId: string) => void;
  onNavigateToAssessments?: (unitId: string) => void;
  onNavigateToStudents?: (classId: string) => void;
}

export const ClassDetailScreen: React.FC<ClassDetailScreenProps> = ({
  classId,
  onNavigateBack,
  onNavigateToNotes,
  onNavigateToAssessments,
  onNavigateToStudents,
}) => {
  const cls = useClassById(classId);
  const units = useUnitsForClass(classId);

  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<CourseUnitRow | null>(null);

  const [deleteConfirmClass, setDeleteConfirmClass] = useState(false);
  const [deleteConfirmUnit, setDeleteConfirmUnit] = useState<CourseUnitRow | null>(null);

  // New topic modal state
  const [addTopicUnitId, setAddTopicUnitId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');

  if (!cls || cls.deletedAt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <h3 className="text-xl font-semibold text-slate-800">This class no longer exists.</h3>
        <p className="text-slate-500 text-sm mt-2">
          It may have been deleted or removed from this workspace.
        </p>
        <button
          onClick={onNavigateBack}
          className="mt-4 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors"
        >
          Back to classes
        </button>
      </div>
    );
  }

  const handleDeleteClass = () => {
    dbService.deleteClass(cls.id);
    setDeleteConfirmClass(false);
    onNavigateBack();
  };

  const handleDeleteUnit = () => {
    if (!deleteConfirmUnit) return;
    dbService.deleteUnit(deleteConfirmUnit.id);
    setDeleteConfirmUnit(null);
  };

  const handleAddTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTopicUnitId || !newTopicName.trim()) return;
    dbService.createTopic({
      courseUnitId: addTopicUnitId,
      name: newTopicName.trim(),
    });
    setNewTopicName('');
    setAddTopicUnitId(null);
  };

  const formattedDate = new Date(cls.updatedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top back button navigation */}
      <div>
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to classes</span>
        </button>
      </div>

      {/* Class Overview Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {cls.name}
            </h1>
            {cls.academicLevel && (
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#d2ecee] text-[#004d52]">
                {cls.academicLevel}
              </span>
            )}
            {cls.description && (
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line pt-1">
                {cls.description}
              </p>
            )}
            <p className="text-xs text-slate-400 pt-1">Updated {formattedDate}</p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-start flex-wrap">
            {onNavigateToStudents && (
              <button
                onClick={() => onNavigateToStudents(cls.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#00696f] bg-[#00696f]/10 hover:bg-[#00696f]/20 rounded-xl transition-colors"
                title="Open Gradebook for this class"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Class Gradebook</span>
              </button>
            )}
            <button
              onClick={() => setIsEditClassOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Edit class"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteConfirmClass(true)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
              title="Delete class"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Course Units Section Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Course units</h2>
          <p className="text-xs text-slate-500">
            {units.length} {units.length === 1 ? 'unit' : 'units'} in this class
          </p>
        </div>
        <button
          onClick={() => setIsAddUnitOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl text-sm font-medium shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add course unit</span>
        </button>
      </div>

      {/* Units List */}
      {units.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/90 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800">No course units yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
            Add a course unit to start building its curriculum, outline, topics, and teaching materials.
          </p>
          <button
            onClick={() => setIsAddUnitOpen(true)}
            className="mt-4 px-4 py-2 border border-[#00696f] text-[#00696f] hover:bg-[#00696f]/5 rounded-xl text-sm font-medium transition-colors"
          >
            Create first course unit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {units.map((unit) => (
            <UnitAccordionTile
              key={unit.id}
              unit={unit}
              onEdit={() => setEditingUnit(unit)}
              onDelete={() => setDeleteConfirmUnit(unit)}
              onOpenNotes={() => onNavigateToNotes?.(unit.id)}
              onOpenAssessments={() => onNavigateToAssessments?.(unit.id)}
              onAddTopic={() => {
                setAddTopicUnitId(unit.id);
                setNewTopicName('');
              }}
            />
          ))}
        </div>
      )}

      {/* Class Form Modal */}
      <ClassFormModal
        existing={cls}
        isOpen={isEditClassOpen}
        onClose={() => setIsEditClassOpen(false)}
      />

      {/* Add Course Unit Modal */}
      <CourseUnitFormModal
        classId={classId}
        isOpen={isAddUnitOpen}
        onClose={() => setIsAddUnitOpen(false)}
      />

      {/* Edit Course Unit Modal */}
      <CourseUnitFormModal
        classId={classId}
        existing={editingUnit}
        isOpen={Boolean(editingUnit)}
        onClose={() => setEditingUnit(null)}
      />

      {/* Delete Class Confirmation Dialog */}
      {deleteConfirmClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Delete class?</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              &quot;{cls.name}&quot; and all of its course units will be removed from your active
              workspace. You will not be able to undo this from the app in this phase.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmClass(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClass}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Unit Confirmation Dialog */}
      {deleteConfirmUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Delete course unit?</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              &quot;{deleteConfirmUnit.title}&quot; and its topics will be removed from your active
              workspace. You will not be able to undo this from the app in this phase.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmUnit(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUnit}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Topic Prompt Modal */}
      {addTopicUnitId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add topic</h3>
            <form onSubmit={handleAddTopicSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Topic name
                </label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  autoFocus
                  placeholder="e.g. Introduction to Pharmacology"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00696f] focus:border-transparent text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddTopicUnitId(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-[#00696f] hover:bg-[#005358] rounded-xl shadow-xs transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface UnitAccordionTileProps {
  unit: CourseUnitRow;
  onEdit: () => void;
  onDelete: () => void;
  onAddTopic: () => void;
  onOpenNotes?: () => void;
  onOpenAssessments?: () => void;
}

const UnitAccordionTile: React.FC<UnitAccordionTileProps> = ({
  unit,
  onEdit,
  onDelete,
  onAddTopic,
  onOpenNotes,
  onOpenAssessments,
}) => {
  const [expanded, setExpanded] = useState(true);
  const topics = useTopicsForUnit(unit.id);

  const hasDetails = Boolean(
    unit.description || unit.curriculum || unit.objectives || unit.outline
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
      {/* Header bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
            {unit.title}
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {[
              unit.code,
              unit.teachingHours ? `${unit.teachingHours} teaching hours` : null,
            ]
              .filter(Boolean)
              .join(' · ') || 'No code or hours specified'}
          </p>
        </div>
        <div className="text-slate-400 p-1">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
          {unit.description && (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Description
              </span>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {unit.description}
              </p>
            </div>
          )}

          {unit.curriculum && (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Curriculum
              </span>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {unit.curriculum}
              </p>
            </div>
          )}

          {unit.objectives && (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Learning objectives
              </span>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {unit.objectives}
              </p>
            </div>
          )}

          {unit.outline && (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Course outline
              </span>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-xs">
                {unit.outline}
              </p>
            </div>
          )}

          {!hasDetails && (
            <p className="text-xs text-slate-500 italic">
              No curriculum details recorded for this unit yet. Use &quot;Edit&quot; to add its outline,
              objectives and curriculum.
            </p>
          )}

          {/* Topics sub-section */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Topics
            </span>
            {topics.length === 0 ? (
              <p className="text-xs text-slate-400 py-1">No topics yet.</p>
            ) : (
              <div className="space-y-1.5 mb-2">
                {topics.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-1.5 px-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl text-sm text-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dbService.deleteTopic(t.id);
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-md opacity-70 group-hover:opacity-100 transition-all"
                      title="Remove topic"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={onAddTopic}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00696f] hover:text-[#005358] py-1 mt-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add topic</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-wrap">
            <div className="flex items-center gap-2">
              {onOpenNotes && (
                <button
                  onClick={onOpenNotes}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#00696f] bg-[#00696f]/10 hover:bg-[#00696f]/20 rounded-lg transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lecture Notes Studio</span>
                </button>
              )}
              {onOpenAssessments && (
                <button
                  onClick={onOpenAssessments}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Build Exam & Scheme</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
