import React, { useState } from 'react';
import {
  School,
  BookOpen,
  Users,
  Award,
  Sparkles,
  Plus,
  HardDrive,
  Download,
  Upload,
  Bot,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import {
  useActiveClasses,
  useAllUnits,
  useAllActiveStudents,
  useAllAssessments,
  dbService,
} from '../../services/database';
import { ClassFormModal } from '../classes/ClassFormModal';

interface DashboardScreenProps {
  onNavigateToClasses: () => void;
  onSelectClass: (classId: string) => void;
  onNavigateToCurriculum: () => void;
  onNavigateToNotes: () => void;
  onNavigateToAssessments: () => void;
  onNavigateToStudents: () => void;
  onNavigateToDeepSolve: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToClasses,
  onSelectClass,
  onNavigateToCurriculum,
  onNavigateToNotes,
  onNavigateToAssessments,
  onNavigateToStudents,
  onNavigateToDeepSolve,
}) => {
  const classes = useActiveClasses();
  const units = useAllUnits();
  const students = useAllActiveStudents();
  const assessments = useAllAssessments();

  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  const handleExportWorkspace = () => {
    const json = dbService.exportFullWorkspace();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tutor_Companion_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 3000);
  };

  const handleImportWorkspace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = dbService.importFullWorkspace(content);
      if (success) {
        alert('Workspace successfully imported and updated!');
      } else {
        alert('Could not parse the backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
      {/* Modern Executive Editorial Hero */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-medium text-teal-300">
            <span>Academic Operating Suite</span>
            <span aria-hidden="true">·</span>
            <span>Diploma & Degree Programs</span>
            <span aria-hidden="true">·</span>
            <span>Offline-First</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white" style={{ textWrap: 'balance' }}>
            Curriculum Ingestion, Lecture Studio & Examination Hub
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Ingest official teacher syllabi, automatically map hourly contact outlines, generate multi-format
            lecture notes with PPTX, Word, and PDF exports, and manage student gradebooks with zero capacity limits.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5 items-center">
            <button
              onClick={onNavigateToCurriculum}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>Import & Analyze Syllabus</span>
            </button>

            <button
              onClick={onNavigateToNotes}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
            >
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span>Lecture Notes</span>
            </button>

            <button
              onClick={onNavigateToDeepSolve}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Deep Solve AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row with Tabular Figures */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div
            onClick={onNavigateToClasses}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:border-[#00696f] hover:shadow-xs cursor-pointer transition-all flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 group-hover:bg-[#00696f]/10 group-hover:text-[#00696f] transition-colors">
              <School className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                {classes.length}
              </p>
              <p className="text-xs text-slate-500 font-medium">Active Classes</p>
            </div>
          </div>

          <div
            onClick={onNavigateToNotes}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:border-[#00696f] hover:shadow-xs cursor-pointer transition-all flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:bg-teal-100 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                {units.length}
              </p>
              <p className="text-xs text-slate-500 font-medium">Course Units</p>
            </div>
          </div>

          <div
            onClick={onNavigateToStudents}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:border-[#00696f] hover:shadow-xs cursor-pointer transition-all flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                {students.length}
              </p>
              <p className="text-xs text-slate-500 font-medium">Enrolled Students</p>
            </div>
          </div>

          <div
            onClick={onNavigateToAssessments}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:border-[#00696f] hover:shadow-xs cursor-pointer transition-all flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                {assessments.length}
              </p>
              <p className="text-xs text-slate-500 font-medium">Exams & Banks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Launchpad */}
      <section>
        <h2 className="text-base font-bold text-slate-800 mb-3">Teaching Launchpad</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={onNavigateToCurriculum}
            className="text-left p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#00696f] shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#00696f]/10 text-[#00696f] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Curriculum Ingestion</h4>
            <p className="text-xs text-slate-500 mt-1">
              Analyze official syllabus guides & provision classes automatically.
            </p>
          </button>

          <button
            onClick={onNavigateToNotes}
            className="text-left p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#00696f] shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Lecture Notes Studio</h4>
            <p className="text-xs text-slate-500 mt-1">
              Generate hourly notes and export to PowerPoint, Word & PDF.
            </p>
          </button>

          <button
            onClick={onNavigateToAssessments}
            className="text-left p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#00696f] shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Exams & Marking Schemes</h4>
            <p className="text-xs text-slate-500 mt-1">
              Generate MCQs, short answers, and rubrics with topic filters.
            </p>
          </button>

          <button
            onClick={onNavigateToDeepSolve}
            className="text-left p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#00696f] shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Deep Solve Multimodal</h4>
            <p className="text-xs text-slate-500 mt-1">
              Solve problems from typed text, photos, and voice recordings.
            </p>
          </button>
        </div>
      </section>

      {/* Classes & Backup Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Classes Column */}
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Academic Classes</h2>
            <button
              onClick={() => setIsNewClassModalOpen(true)}
              className="text-xs font-semibold text-[#00696f] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Class</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {classes.slice(0, 5).map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectClass(c.id)}
                className="group bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#00696f]/10 text-[#00696f] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <School className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {c.academicLevel || 'Diploma'} · Year {c.yearOfStudy || 1} · {c.academicYear || '2025/2026'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </section>

        {/* Workspace Cloud & Offline Sync Column */}
        <section className="space-y-4">
          {/* Release Hub Quick Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                GitHub Release & Packages
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-teal-300 px-2 py-0.5 rounded border border-slate-700">
                v1.0.0
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Windows .EXE & Android .APK</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Automated GitHub release workflow, standalone installer and APK packaging.
              </p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-release-modal'))}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <span>Open Release & Build Hub</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Local Data Storage</h4>
                <p className="text-xs text-slate-500">
                  Unlimited classes, course units, notes, and students stored offline.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={handleExportWorkspace}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                {backupSuccess ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
                <span>{backupSuccess ? 'Backup File Downloaded!' : 'Export Workspace Backup (JSON)'}</span>
              </button>

              <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Restore Workspace Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportWorkspace}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </section>
      </div>

      {/* New Class Modal */}
      <ClassFormModal
        isOpen={isNewClassModalOpen}
        onClose={() => setIsNewClassModalOpen(false)}
        onSaved={(created) => onSelectClass(created.id)}
      />
    </div>
  );
};
